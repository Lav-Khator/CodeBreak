const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

// ── Language config ──────────────────────────────────────────────────────────
const LANG = {
  cpp: {
    image: 'gcc:13',
    codeFile: 'solution.cpp',
    compile: 'timeout 15 g++ -O2 -o /tmp/sol /code/solution.cpp 2>/code/_cerr.txt || { echo "__COMPILE_ERROR__"; cat /code/_cerr.txt; exit 1; }',
    run: 'timeout 5 /tmp/sol',
  },
  python: {
    image: 'python:3.11-slim',
    codeFile: 'solution.py',
    compile: '',   // interpreted
    run: 'timeout 5 python3 /code/solution.py',
  },
  java: {
    image: 'eclipse-temurin:21-jdk-alpine',
    codeFile: 'Solution.java',
    compile: 'timeout 15 javac /code/Solution.java -d /tmp 2>/code/_cerr.txt || { echo "__COMPILE_ERROR__"; cat /code/_cerr.txt; exit 1; }',
    run: 'timeout 5 java -cp /tmp Solution',
  },
  javascript: {
    image: 'node:20-slim',
    codeFile: 'solution.js',
    compile: '',
    run: 'timeout 5 node /code/solution.js',
  },
};

const DOCKER_TIMEOUT_MS = 60000; // 60s total for all test cases in one container

// ── Build a shell script that runs ALL test cases in one container ───────────
function buildRunScript(lang, numCases) {
  const L = LANG[lang];
  const lines = [
    '#!/bin/sh',
    'ulimit -f 10240', // Limit file writes to 10MB to prevent disk exhaustion
    ''
  ];

  // Compile step (once)
  if (L.compile) {
    lines.push(L.compile);
    lines.push('');
  }

  // Run each test case, redirecting stdout, stderr, and exit codes to separate files
  for (let i = 0; i < numCases; i++) {
    lines.push(`${L.run} < /code/_input_${i}.txt > /code/_output_${i}.txt 2> /code/_stderr_${i}.txt`);
    lines.push(`echo $? > /code/_exit_${i}.txt`);
  }

  return lines.join('\n') + '\n';
}

// ── Normalize output for comparison ──────────────────────────────────────────
function normalize(s) {
  return (s || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trimEnd())
    .join('\n')
    .trim();
}

// ── Main executor ─────────────────────────────────────────────────────────────
async function executeCode({ language, code, testCases }) {
  const L = LANG[language];
  if (!L) throw new Error(`Unsupported language: ${language}`);

  // ── Setup temp dir ─────────────────────────────────────────────────────────
  const runId   = uuidv4();
  const codeDir = path.join(os.tmpdir(), `judge_${runId}`);
  fs.mkdirSync(codeDir, { recursive: true });

  try {
    // Write code file
    fs.writeFileSync(path.join(codeDir, L.codeFile), code);

    // Write each test case input as a separate file
    testCases.forEach((tc, i) => {
      const inp = (tc.input || '').replace(/\r\n/g, '\n');
      fs.writeFileSync(path.join(codeDir, `_input_${i}.txt`), inp + '\n');
    });

    // Write the run script (Unix line endings)
    const script = buildRunScript(language, testCases.length);
    fs.writeFileSync(path.join(codeDir, 'run.sh'), script.replace(/\r\n/g, '\n'));

    // ── Run one Docker container for all test cases ──────────────────────────
    const volume = codeDir.replace(/\\/g, '/');
    const dockerArgs = [
      'run', '--rm',
      '--memory=256m',
      '--memory-swap=256m',
      '--pids-limit=64',
      '--cap-drop=ALL',
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=64m',
      '--cpus=1',
      '--network=none',
      '-v', `${volume}:/code`,
      L.image,
      'sh', '/code/run.sh',
    ];

    const rawOutput = await new Promise((resolve, reject) => {
      execFile('docker', dockerArgs, { timeout: DOCKER_TIMEOUT_MS, maxBuffer: 5 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error && error.killed) {
            return reject(new Error('Docker execution timed out'));
          }
          // We handle per-case errors via output parsing; non-zero exit is OK here
          resolve({ stdout: stdout || '', stderr: stderr || '', exitCode: error ? (error.code ?? 1) : 0 });
        }
      );
    });

    // ── Parse output ──────────────────────────────────────────────────────────
    const fullOutput = rawOutput.stdout;

    // Check for compile error (appears before any CASE_SEP)
    if (fullOutput.includes('__COMPILE_ERROR__')) {
      const errText = fullOutput.split('__COMPILE_ERROR__')[1]?.trim() || rawOutput.stderr;
      return {
        verdict: 'Compile Error',
        passedTests: 0,
        totalTests: testCases.length,
        runtime: 0,
        errorOutput: errText.slice(0, 500),
      };
    }

    const results = {
      verdict: 'Accepted',
      passedTests: 0,
      totalTests: testCases.length,
      runtime: 0,   // Docker gives no per-case timing; use wall clock later
      errorOutput: '',
    };

    for (let i = 0; i < testCases.length; i++) {
      const exitFile = path.join(codeDir, `_exit_${i}.txt`);
      const outFile = path.join(codeDir, `_output_${i}.txt`);
      const errFile = path.join(codeDir, `_stderr_${i}.txt`);

      // If the exit file doesn't exist, it means the container exited or crashed early before running this case
      if (!fs.existsSync(exitFile)) {
        results.verdict = 'Runtime Error';
        results.errorOutput = `Test ${i + 1}: Execution did not run (container may have exited)`;
        return results;
      }

      const exitCode = parseInt(fs.readFileSync(exitFile, 'utf8').trim(), 10);
      const rawOut = fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8').trimEnd() : '';
      const rawErr = fs.existsSync(errFile) ? fs.readFileSync(errFile, 'utf8').trim() : '';

      if (exitCode === 124) {
        // timeout(1) exit code for TLE
        results.verdict    = 'Time Limit Exceeded';
        results.errorOutput = `Test ${i + 1}: Exceeded 5 seconds`;
        return results;
      }

      if (exitCode !== 0) {
        results.verdict    = 'Runtime Error';
        results.errorOutput = `Test ${i + 1}: ${rawOut.slice(0, 300) || rawErr.slice(0, 300) || rawOutput.stderr.slice(0, 300) || 'Unknown error'}`;
        return results;
      }

      const got      = normalize(rawOut);
      const expected = normalize(testCases[i].expectedOutput);

      if (got !== expected) {
        results.verdict    = 'Wrong Answer';
        results.errorOutput =
          `Test ${i + 1}:\nExpected: ${expected.slice(0, 200)}\nGot:      ${got.slice(0, 200)}`;
        return results;
      }

      results.passedTests++;
    }

    return results;

  } finally {
    try { fs.rmSync(codeDir, { recursive: true, force: true }); } catch {}
  }
}

module.exports = { executeCode };

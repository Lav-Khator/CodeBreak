require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');

// ── Competitive programming style: user reads from stdin, writes to stdout ──
// Input format is described in each problem's description.

const problems = [
  {
    title: 'Two Sum',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers and a target, print the **0-based indices** of the two numbers that add up to the target. Print them space-separated on one line.

**Input format:**
- Line 1: \`n target\` — size of array and the target value
- Line 2: \`n\` space-separated integers

**Output format:**
- Print two space-separated indices \`i j\` where \`i < j\`

**Example:**
\`\`\`
Input:
4 9
2 7 11 15

Output:
0 1
\`\`\``,
    examples: [
      { input: '4 9\n2 7 11 15', output: '0 1', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: '3 6\n3 2 4',     output: '1 2', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
      { input: '2 6\n3 3',       output: '0 1', explanation: 'nums[0] + nums[1] = 3 + 3 = 6' },
    ],
    constraints: [
      '2 <= n <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Exactly one valid answer exists.',
    ],
    testCases: [
      { input: '4 9\n2 7 11 15', expectedOutput: '0 1', isHidden: false },
      { input: '3 6\n3 2 4',     expectedOutput: '1 2', isHidden: true  },
      { input: '2 6\n3 3',       expectedOutput: '0 1', isHidden: true  },
      { input: '5 13\n1 5 3 8 2', expectedOutput: '1 3', isHidden: true },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    // Your solution here
    
    return 0;
}`,
      python: `import sys
input = sys.stdin.readline

def main():
    n, target = map(int, input().split())
    nums = list(map(int, input().split()))
    
    # Your solution here

main()`,
      java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        StringTokenizer st = new StringTokenizer(br.readLine());
        int n = Integer.parseInt(st.nextToken());
        int target = Integer.parseInt(st.nextToken());
        int[] nums = new int[n];
        st = new StringTokenizer(br.readLine());
        for (int i = 0; i < n; i++) nums[i] = Integer.parseInt(st.nextToken());
        
        // Your solution here
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const [n, target] = lines[0].split(' ').map(Number);
const nums = lines[1].split(' ').map(Number);

// Your solution here
`,
    },
    totalSubmissions: 8412,
    acceptedSubmissions: 5102,
    isProblemOfDay: true,
    problemOfDayDate: new Date(),
    isApproved: true,
  },

  {
    title: 'Longest Palindromic Substring',
    type: 'coding',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    description: `Given a string, print the **longest palindromic substring**. If there are multiple of the same maximum length, print the first one (leftmost).

**Input format:**
- A single string \`s\`

**Output format:**
- The longest palindromic substring

**Example:**
\`\`\`
Input:
babad

Output:
bab
\`\`\``,
    examples: [
      { input: 'babad', output: 'bab', explanation: '"aba" is also valid but "bab" appears first.' },
      { input: 'cbbd',  output: 'bb',  explanation: '' },
      { input: 'a',     output: 'a',   explanation: '' },
    ],
    constraints: ['1 <= s.length <= 1000', 's consists of only digits and English letters.'],
    testCases: [
      { input: 'babad',  expectedOutput: 'bab', isHidden: false },
      { input: 'cbbd',   expectedOutput: 'bb',  isHidden: true  },
      { input: 'racecar',expectedOutput: 'racecar', isHidden: true },
      { input: 'a',      expectedOutput: 'a',   isHidden: true  },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s;
    cin >> s;
    
    // Your solution here
    
    return 0;
}`,
      python: `s = input().strip()

# Your solution here
`,
      java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        // Your solution here
    }
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Your solution here
`,
    },
    totalSubmissions: 6210,
    acceptedSubmissions: 2480,
    isApproved: true,
  },

  {
    title: 'Maximum Subarray',
    type: 'coding',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    description: `Find the contiguous subarray with the largest sum and print its sum.

**Input format:**
- Line 1: \`n\` — size of array
- Line 2: \`n\` space-separated integers

**Output format:**
- A single integer — the maximum subarray sum

**Example:**
\`\`\`
Input:
9
-2 1 -3 4 -1 2 1 -5 4

Output:
6
\`\`\``,
    examples: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6',  explanation: '[4, -1, 2, 1] has the largest sum = 6' },
      { input: '1\n1',                       output: '1',  explanation: '' },
      { input: '5\n5 4 -1 7 8',              output: '23', explanation: '' },
    ],
    constraints: ['1 <= n <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    testCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6',  isHidden: false },
      { input: '5\n5 4 -1 7 8',             expectedOutput: '23', isHidden: true  },
      { input: '1\n-1',                      expectedOutput: '-1', isHidden: true  },
      { input: '4\n-2 -1 -3 -4',            expectedOutput: '-1', isHidden: true  },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    // Your solution here (Kadane's algorithm)
    
    return 0;
}`,
      python: `n = int(input())
nums = list(map(int, input().split()))

# Your solution here
`,
      java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        // Your solution here
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const nums = lines[1].split(' ').map(Number);

// Your solution here
`,
    },
    totalSubmissions: 7200,
    acceptedSubmissions: 4100,
    isApproved: true,
  },

  {
    title: 'Valid Parentheses',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    description: `Given a string containing only \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, \`]\`, print \`true\` if the input string is valid, \`false\` otherwise.

A string is valid if every open bracket is closed by the same type of bracket in the correct order.

**Input format:** A single string \`s\`

**Output format:** \`true\` or \`false\`

**Example:**
\`\`\`
Input:
()[]{}

Output:
true
\`\`\``,
    examples: [
      { input: '()',     output: 'true',  explanation: '' },
      { input: '()[]{} ', output: 'true',  explanation: '' },
      { input: '(]',     output: 'false', explanation: '' },
    ],
    constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'."],
    testCases: [
      { input: '()',      expectedOutput: 'true',  isHidden: false },
      { input: '()[]{}', expectedOutput: 'true',  isHidden: true  },
      { input: '(]',     expectedOutput: 'false', isHidden: true  },
      { input: '([)]',   expectedOutput: 'false', isHidden: true  },
      { input: '{[]}',   expectedOutput: 'true',  isHidden: true  },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    string s;
    cin >> s;
    
    // Your solution here
    
    return 0;
}`,
      python: `s = input().strip()

# Your solution here
`,
      java: `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String s = br.readLine().trim();
        
        // Your solution here
    }
}`,
      javascript: `const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

// Your solution here
`,
    },
    totalSubmissions: 9100,
    acceptedSubmissions: 5950,
    isApproved: true,
  },

  {
    title: 'Climbing Stairs',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming'],
    description: `You are climbing a staircase that takes \`n\` steps. Each time you can climb 1 or 2 steps. Print the number of distinct ways to reach the top.

**Input format:** A single integer \`n\`

**Output format:** A single integer

**Example:**
\`\`\`
Input:
3

Output:
3
\`\`\``,
    examples: [
      { input: '2', output: '2', explanation: '1+1, 2' },
      { input: '3', output: '3', explanation: '1+1+1, 1+2, 2+1' },
    ],
    constraints: ['1 <= n <= 45'],
    testCases: [
      { input: '2',  expectedOutput: '2',  isHidden: false },
      { input: '3',  expectedOutput: '3',  isHidden: true  },
      { input: '10', expectedOutput: '89', isHidden: true  },
      { input: '1',  expectedOutput: '1',  isHidden: true  },
      { input: '45', expectedOutput: '1836311903', isHidden: true },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    
    // Your solution here
    
    return 0;
}`,
      python: `n = int(input())

# Your solution here
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        
        // Your solution here
    }
}`,
      javascript: `const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());

// Your solution here
`,
    },
    totalSubmissions: 10200,
    acceptedSubmissions: 7800,
    isApproved: true,
  },

  {
    title: 'Reverse a Linked List',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Linked List'],
    description: `Given \`n\` integers representing a singly linked list, reverse it and print the values space-separated.

**Input format:**
- Line 1: \`n\`
- Line 2: \`n\` space-separated integers

**Output format:** Space-separated integers (reversed list)

**Example:**
\`\`\`
Input:
5
1 2 3 4 5

Output:
5 4 3 2 1
\`\`\``,
    examples: [
      { input: '5\n1 2 3 4 5', output: '5 4 3 2 1', explanation: '' },
      { input: '2\n1 2',       output: '2 1',         explanation: '' },
      { input: '1\n1',         output: '1',            explanation: '' },
    ],
    constraints: ['0 <= n <= 5000', '−5000 <= val <= 5000'],
    testCases: [
      { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1', isHidden: false },
      { input: '2\n1 2',       expectedOutput: '2 1',        isHidden: true  },
      { input: '1\n1',         expectedOutput: '1',          isHidden: true  },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (int i = 0; i < n; i++) cin >> v[i];
    
    // Your solution here
    
    return 0;
}`,
      python: `n = int(input())
vals = list(map(int, input().split()))

# Your solution here
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] v = new int[n];
        for (int i = 0; i < n; i++) v[i] = sc.nextInt();
        
        // Your solution here
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const vals = lines[1].split(' ').map(Number);

// Your solution here
`,
    },
    totalSubmissions: 5500,
    acceptedSubmissions: 4200,
    isApproved: true,
  },

  {
    title: 'Binary Search',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    description: `Given a sorted array of distinct integers and a target, print the index of the target. If not found, print \`-1\`.

**Input format:**
- Line 1: \`n target\`
- Line 2: \`n\` sorted integers

**Output format:** Index (0-based) or \`-1\`

**Example:**
\`\`\`
Input:
6 9
-1 0 3 5 9 12

Output:
4
\`\`\``,
    examples: [
      { input: '6 9\n-1 0 3 5 9 12', output: '4',  explanation: '9 is at index 4' },
      { input: '6 2\n-1 0 3 5 9 12', output: '-1', explanation: '2 is not in the array' },
    ],
    constraints: ['1 <= n <= 10^4', '-10^4 <= nums[i], target <= 10^4', 'All values in nums are unique and sorted.'],
    testCases: [
      { input: '6 9\n-1 0 3 5 9 12',  expectedOutput: '4',  isHidden: false },
      { input: '6 2\n-1 0 3 5 9 12',  expectedOutput: '-1', isHidden: true  },
      { input: '1 0\n0',              expectedOutput: '0',  isHidden: true  },
      { input: '3 100\n1 50 99',      expectedOutput: '-1', isHidden: true  },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n, target;
    cin >> n >> target;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    
    // Your solution here
    
    return 0;
}`,
      python: `n, target = map(int, input().split())
nums = list(map(int, input().split()))

# Your solution here
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt(), target = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
        
        // Your solution here
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const [n, target] = lines[0].split(' ').map(Number);
const nums = lines[1].split(' ').map(Number);

// Your solution here
`,
    },
    totalSubmissions: 4300,
    acceptedSubmissions: 3100,
    isApproved: true,
  },

  {
    title: 'Merge Intervals',
    type: 'coding',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    description: `Given \`n\` intervals, merge all overlapping intervals and print them sorted.

**Input format:**
- Line 1: \`n\`
- Next \`n\` lines: \`start end\` for each interval

**Output format:** Each merged interval on its own line as \`start end\`

**Example:**
\`\`\`
Input:
4
1 3
2 6
8 10
15 18

Output:
1 6
8 10
15 18
\`\`\``,
    examples: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', output: '1 6\n8 10\n15 18', explanation: 'Intervals [1,3] and [2,6] overlap → [1,6]' },
      { input: '2\n1 4\n4 5',              output: '1 5',                explanation: 'Touching intervals are merged.' },
    ],
    constraints: ['1 <= n <= 10^4', '0 <= start <= end <= 10^4'],
    testCases: [
      { input: '4\n1 3\n2 6\n8 10\n15 18', expectedOutput: '1 6\n8 10\n15 18', isHidden: false },
      { input: '2\n1 4\n4 5',              expectedOutput: '1 5',               isHidden: true  },
      { input: '1\n1 1',                   expectedOutput: '1 1',               isHidden: true  },
    ],
    starterCode: {
      cpp: `#include <bits/stdc++.h>
using namespace std;
int main() {
    int n;
    cin >> n;
    vector<pair<int,int>> intervals(n);
    for (int i = 0; i < n; i++) cin >> intervals[i].first >> intervals[i].second;
    
    // Your solution here
    
    return 0;
}`,
      python: `n = int(input())
intervals = [list(map(int, input().split())) for _ in range(n)]

# Your solution here
`,
      java: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) { intervals[i][0] = sc.nextInt(); intervals[i][1] = sc.nextInt(); }
        
        // Your solution here
    }
}`,
      javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const n = parseInt(lines[0]);
const intervals = lines.slice(1).map(l => l.split(' ').map(Number));

// Your solution here
`,
    },
    totalSubmissions: 3100,
    acceptedSubmissions: 1800,
    isApproved: true,
  },
];

// ── Contests ────────────────────────────────────────────────────────────────
const now = new Date();
const contests = [
  {
    title: 'Weekly Contest 404',
    description: 'Standard weekly contest with 4 problems ranging from Easy to Hard. Rated for all participants.',
    startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    endTime:   new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Weekly'],
  },
  {
    title: 'Biweekly Contest 200',
    description: 'Biweekly rated contest. Problems cover Dynamic Programming, Graph Theory, and Data Structures.',
    startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    endTime:   new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Biweekly'],
  },
  {
    title: 'Monthly Grand Prix — June',
    description: 'The prestigious monthly grand prix. Top performers get special badges and rating bonuses.',
    startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    endTime:   new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Grand Prix', 'Special'],
  },
  {
    title: 'Break the Code Championship',
    description: 'Find inputs that crash buggy programs! Test your adversarial thinking.',
    startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    endTime:   new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isApproved: true,
    tags: ['Break the Code', 'Special'],
  },
  {
    title: 'Spring Coding Blitz',
    description: 'A past rated contest — editorials now available!',
    startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    endTime:   new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Past'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    try { await mongoose.connection.db.collection('problems').drop(); } catch {}
    try { await mongoose.connection.db.collection('contests').drop(); } catch {}
    console.log('🗑️  Cleared existing data');

    const createdProblems = [];
    for (const p of problems) {
      const doc = new Problem(p);
      await doc.save();
      createdProblems.push(doc);
    }
    console.log(`✅ Seeded ${createdProblems.length} problems (stdin/stdout style)`);

    contests[0].problems = createdProblems.slice(0, 4).map(p => p._id);
    contests[1].problems = createdProblems.slice(2, 6).map(p => p._id);
    contests[2].problems = createdProblems.slice(0, 8).map(p => p._id);

    const createdContests = await Contest.insertMany(contests);
    console.log(`✅ Seeded ${createdContests.length} contests`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();

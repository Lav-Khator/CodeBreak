require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');
const Contest = require('../models/Contest');

const problems = [
  {
    title: 'Two Sum',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers** such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: '' },
      { input: 'nums = [3,3], target = 6', output: '[0,1]', explanation: '' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: true },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
      python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        `,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`,
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
    description: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.

A string is **palindromic** if it reads the same forward and backward.`,
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' },
      { input: 's = "cbbd"', output: '"bb"', explanation: '' },
    ],
    constraints: ['1 <= s.length <= 1000', 's consist of only digits and English letters.'],
    testCases: [
      { input: 'babad', expectedOutput: 'bab', isHidden: false },
      { input: 'cbbd', expectedOutput: 'bb', isHidden: true },
      { input: 'racecar', expectedOutput: 'racecar', isHidden: true },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    string longestPalindrome(string s) {\n        \n    }\n};`,
      python: `class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        `,
      java: `class Solution {\n    public String longestPalindrome(String s) {\n        \n    }\n}`,
      javascript: `/**\n * @param {string} s\n * @return {string}\n */\nvar longestPalindrome = function(s) {\n    \n};`,
    },
    totalSubmissions: 6210,
    acceptedSubmissions: 2480,
    isApproved: true,
  },
  {
    title: 'Merge K Sorted Lists',
    type: 'coding',
    difficulty: 'Hard',
    tags: ['Linked List', 'Heap', 'Divide and Conquer'],
    description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.

*Merge all the linked-lists into one sorted linked-list and return it.*`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]', explanation: 'The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6' },
    ],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= lists[i].length <= 500', '-10^4 <= lists[i][j] <= 10^4'],
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expectedOutput: '[1,1,2,3,4,4,5,6]', isHidden: false },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        \n    }\n};`,
      python: `class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        `,
      java: `class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        \n    }\n}`,
      javascript: `var mergeKLists = function(lists) {\n    \n};`,
    },
    totalSubmissions: 3890,
    acceptedSubmissions: 1120,
    isApproved: true,
  },
  {
    title: 'Valid Parentheses',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['String', 'Stack'],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is **valid**.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true', explanation: '' },
      { input: 's = "()[]{}"', output: 'true', explanation: '' },
      { input: 's = "(]"', output: 'false', explanation: '' },
    ],
    constraints: ['1 <= s.length <= 10^4', "s consists of parentheses only '()[]{}'."],
    testCases: [
      { input: '()', expectedOutput: 'true', isHidden: false },
      { input: '()[{}]', expectedOutput: 'true', isHidden: true },
      { input: '(]', expectedOutput: 'false', isHidden: true },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        `,
      java: `class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}`,
      javascript: `var isValid = function(s) {\n    \n};`,
    },
    totalSubmissions: 9100,
    acceptedSubmissions: 5950,
    isApproved: true,
  },
  {
    title: 'Binary Tree Level Order Traversal',
    type: 'coding',
    difficulty: 'Medium',
    tags: ['Tree', 'BFS', 'Binary Tree'],
    description: `Given the \`root\` of a binary tree, return *the level order traversal of its nodes' values* (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: '' },
      { input: 'root = [1]', output: '[[1]]', explanation: '' },
      { input: 'root = []', output: '[]', explanation: '' },
    ],
    constraints: ['The number of nodes in the tree is in the range [0, 2000].', '-1000 <= Node.val <= 1000'],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]', isHidden: false },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        \n    }\n};`,
      python: `class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        `,
      java: `class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        \n    }\n}`,
      javascript: `var levelOrder = function(root) {\n    \n};`,
    },
    totalSubmissions: 5500,
    acceptedSubmissions: 3300,
    isApproved: true,
  },
  {
    title: 'Maximum Subarray',
    type: 'coding',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming', 'Divide and Conquer'],
    description: `Given an integer array \`nums\`, find the **subarray** with the largest sum, and return *its sum*.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1', explanation: '' },
      { input: 'nums = [5,4,-1,7,8]', output: '23', explanation: '' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
      { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: true },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};`,
      python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}`,
      javascript: `var maxSubArray = function(nums) {\n    \n};`,
    },
    totalSubmissions: 7200,
    acceptedSubmissions: 4100,
    isApproved: true,
  },
  {
    title: 'Climbing Stairs',
    type: 'coding',
    difficulty: 'Easy',
    tags: ['Math', 'Dynamic Programming', 'Memoization'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: 'There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps' },
      { input: 'n = 3', output: '3', explanation: 'There are three ways.\n1. 1 + 1 + 1\n2. 1 + 2\n3. 2 + 1' },
    ],
    constraints: ['1 <= n <= 45'],
    testCases: [
      { input: '2', expectedOutput: '2', isHidden: false },
      { input: '3', expectedOutput: '3', isHidden: true },
      { input: '10', expectedOutput: '89', isHidden: true },
    ],
    starterCode: {
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};`,
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        `,
      java: `class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}`,
      javascript: `var climbStairs = function(n) {\n    \n};`,
    },
    totalSubmissions: 10200,
    acceptedSubmissions: 7800,
    isApproved: true,
  },
  {
    title: 'LRU Cache',
    type: 'coding',
    difficulty: 'Hard',
    tags: ['Hash Table', 'Linked List', 'Design'],
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with **positive** size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the key exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in **O(1)** average time complexity.`,
    examples: [
      { input: '["LRUCache","put","put","get","put","get","put","get","get","get"]\n[[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]', output: '[null,null,null,1,null,-1,null,-1,3,4]', explanation: '' },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10^4', '0 <= value <= 10^5', 'At most 2 * 10^5 calls will be made to get and put.'],
    testCases: [
      { input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4', expectedOutput: '1\n-1\n-1\n3\n4', isHidden: false },
    ],
    starterCode: {
      cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        \n    }\n    \n    int get(int key) {\n        \n    }\n    \n    void put(int key, int value) {\n        \n    }\n};`,
      python: `class LRUCache:\n    def __init__(self, capacity: int):\n        \n    def get(self, key: int) -> int:\n        \n    def put(self, key: int, value: int) -> None:\n        `,
      java: `class LRUCache {\n    public LRUCache(int capacity) {\n        \n    }\n    \n    public int get(int key) {\n        \n    }\n    \n    public void put(int key, int value) {\n        \n    }\n}`,
      javascript: `const LRUCache = function(capacity) {\n    \n};\nLRUCache.prototype.get = function(key) {\n    \n};\nLRUCache.prototype.put = function(key, value) {\n    \n};`,
    },
    totalSubmissions: 2100,
    acceptedSubmissions: 780,
    isApproved: true,
  },
];

const now = new Date();
const contests = [
  {
    title: 'Weekly Contest 404',
    description: 'Standard weekly contest with 4 problems ranging from Easy to Hard. Rated for all participants.',
    startTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Weekly'],
  },
  {
    title: 'Biweekly Contest 200',
    description: 'Biweekly rated contest. Problems cover Dynamic Programming, Graph Theory, and Data Structures.',
    startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Biweekly'],
  },
  {
    title: 'Monthly Grand Prix — June',
    description: 'The prestigious monthly grand prix. Top performers get special badges and rating bonuses.',
    startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Grand Prix', 'Special'],
  },
  {
    title: 'Break the Code Championship',
    description: 'Find inputs that crash buggy programs! Test your adversarial thinking.',
    startTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    isApproved: true,
    tags: ['Break the Code', 'Special'],
  },
  {
    title: 'Spring Coding Blitz',
    description: 'A past rated contest — editorials now available!',
    startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
    isApproved: true,
    tags: ['Rated', 'Past'],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop collections to clear any stale indexes
    try { await mongoose.connection.db.collection('problems').drop(); } catch {}
    try { await mongoose.connection.db.collection('contests').drop(); } catch {}
    console.log('🗑️  Cleared existing problems and contests');

    // Use save() per doc so the pre-save slug hook fires
    const createdProblems = [];
    for (const p of problems) {
      const doc = new Problem(p);
      await doc.save();
      createdProblems.push(doc);
    }
    console.log(`✅ Seeded ${createdProblems.length} problems`);

    // Assign some problems to contests
    contests[0].problems = createdProblems.slice(0, 4).map((p) => p._id);
    contests[1].problems = createdProblems.slice(2, 6).map((p) => p._id);
    contests[2].problems = createdProblems.slice(0, 8).map((p) => p._id);

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

#!/usr/bin/env node

/**
 * Quick Start Guide for AI evaluations
 * 
 * This script demonstrates how to use the evaluation system
 */

const path = require('path');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   MeMoney AI Financial Tools - Evaluation System               ║
╚════════════════════════════════════════════════════════════════╝

📚 QUICK START GUIDE

1️⃣  SET UP YOUR ENVIRONMENT

   Create a .env file in the project root:
   
   OPENAI_API_KEY=sk_your_api_key_here
   OPENAI_MODEL=gpt-4o-mini

2️⃣  INSTALL DEPENDENCIES

   npm install

3️⃣  RUN THE EVALUATION

   npm run eval:transactions

4️⃣  CHECK THE RESULTS

   Results are saved in:
   - src/services/ai/eval/results.json    (detailed results)
   - src/services/ai/eval/summary.json    (summary stats)

═══════════════════════════════════════════════════════════════

📋 TEST CATEGORIES

🟢 GOLDEN (5 tests)
   ✓ "Show me spending for last 30 days"
   ✓ "How much did I spend today?"
   ✓ "What are my biggest spending categories?"
   ✓ "Analyze Jan 15-31 transactions"
   ✓ "Find where I'm wasting money"

🟡 SECONDARY (3 tests)
   ✓ "Give me complete overview of spending"
   ✓ "What are my recurring expenses?"
   ✓ "Compare January vs February"

🔴 NEGATIVE (4 tests)
   ✓ "What's the weather?"
   ✓ "How do I cook ugali?"
   ✓ "What's the capital of Kenya?"
   
═══════════════════════════════════════════════════════════════

🎯 EVALUATION FLOW

  User Prompt
       ↓
  OpenAI API (with tool definitions)
       ↓
  Agent selects tools
       ↓
  Evaluator scores result
       ↓
  Summary & Report

═══════════════════════════════════════════════════════════════

📊 SCORING EXPLAINED

  GOLDEN Tests:
    - Must select ALL expected tools (binary: 0 or 1)
    - Example: "spending for 30 days" → must use calculateTransactionsByLastDays
    
  SECONDARY Tests:
    - Flexible selection, scored on precision/recall (F1 score: 0-1)
    - Example: "complete overview" → could use multiple tools
    
  NEGATIVE Tests:
    - Must avoid ALL forbidden tools (binary: 0 or 1)
    - Example: "weather" → must NOT use any transaction tools

═══════════════════════════════════════════════════════════════

📁 PROJECT STRUCTURE

src/services/ai/eval/
├── types.ts              # Type definitions
├── evaluators.ts         # Scoring functions
├── executors.ts          # Test execution
├── utils.ts              # Utilities
├── index.ts              # Main runner
├── README.md             # Full documentation
├── data/
│   └── transaction-tools.json  # Test cases
├── results.json          # Generated
└── summary.json          # Generated

═══════════════════════════════════════════════════════════════

🔧 AVAILABLE TOOLS (That the agent can select)

 1. calculateTransactionsByDate
    → Analyze spending for a specific day
    
 2. calculateTransactionsByDateRange
    → Analyze spending between two dates
    
 3. calculateTransactionsByLastDays
    → Analyze spending for last N days
    
 4. getSpendingByType
    → Break down spending by category
    
 5. detectSpendingLeaks
    → Find wasted money (fees, patterns)

═══════════════════════════════════════════════════════════════

💡 TIPS

• Add custom test cases to data/transaction-tools.json
• Check results.json for detailed debugging
• Track summary.json over time to monitor performance
• Adjust agent prompts if certain tests fail
• Add more scenarios to increase coverage

═══════════════════════════════════════════════════════════════

📖 DOCUMENTATION

Full docs: src/services/ai/eval/README.md

Questions? Check the README for:
- Detailed scoring logic
- How to add test cases
- Debugging failed tests
- Future enhancements

═══════════════════════════════════════════════════════════════
`);

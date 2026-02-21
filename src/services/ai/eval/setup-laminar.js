#!/usr/bin/env node

/**
 * Setup Laminar for AI Evaluations
 * 
 * This script helps you set up Laminar integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║   Setting Up Laminar for MeMoney AI Evaluations               ║
╚════════════════════════════════════════════════════════════════╝

This script will help you:
1. Install Laminar SDK
2. Configure environment
3. Verify setup
4. Run first evaluation

═══════════════════════════════════════════════════════════════

📋 REQUIREMENTS

✓ Node.js 18+
✓ npm or yarn
✓ Laminar account (free tier OK): https://laminar.ai
✓ OpenAI API key

═══════════════════════════════════════════════════════════════

🚀 QUICK START

Step 1: Install Dependencies
  npm install @lmnr-ai/lmnr
  npm install --save-dev tsx

Step 2: Create .env file
  OPENAI_API_KEY=sk_your_key_here
  OPENAI_MODEL=gpt-4o-mini
  LMNR_API_KEY=your_laminar_key_here

Step 3: Run Evaluation
  npm run eval:transactions:laminar

Step 4: Check Dashboard
  https://dashboard.laminar.ai

═══════════════════════════════════════════════════════════════

📊 TWO WAYS TO RUN EVALUATIONS

1️⃣  LOCAL (no Laminar needed)
    npm run eval:transactions
    
    Output:
    • results.json (detailed)
    • summary.json (summary)
    
    Best for: Quick local testing

2️⃣  WITH LAMINAR (recommended)
    npm run eval:transactions:laminar
    
    Output:
    • Laminar dashboard
    • Historical tracking
    • Performance trends
    
    Best for: Production, teams, alerts

═══════════════════════════════════════════════════════════════

🔑 GET YOUR LAMINAR API KEY

1. Go to https://laminar.ai
2. Sign up (free tier available)
3. Create a new project
4. Copy your Project API Key
5. Add to .env:
   LMNR_API_KEY=your_key_here

═══════════════════════════════════════════════════════════════

📁 FILES CREATED/UPDATED

New Files:
  ✓ transaction-tools.eval.ts    (Laminar evaluation runner)
  ✓ LAMINAR_SETUP.md             (This setup guide)

Updated Files:
  ✓ package.json                 (new eval:laminar script)

═══════════════════════════════════════════════════════════════

📊 WHAT GETS TRACKED IN LAMINAR

For each test case:
  • Prompt analyzed
  • Tools selected by agent
  • Expected tools
  • Scores (golden/secondary/negative)
  • Pass/fail status
  • Execution time

Metrics Aggregated:
  • toolsSelected% (golden accuracy)
  • toolsAvoided% (negative accuracy)  
  • selectionScore (F1 average)
  • Success rate
  • Trends over time

═══════════════════════════════════════════════════════════════

🎯 TYPICAL WORKFLOW

Day 1: Initial Setup
  1. npm install @lmnr-ai/lmnr
  2. Create .env with API keys
  3. npm run eval:transactions:laminar
  4. View results in Laminar dashboard

Week 1: Monitor Performance  
  1. Run evals daily: npm run eval:transactions:laminar
  2. Track trends in dashboard
  3. See which tests pass/fail
  4. Improve agent prompts

Month 1: Set Up Alerts
  1. Configure alerts in Laminar
  2. Get notified of regressions
  3. Version your test datasets
  4. Compare runs over time

═══════════════════════════════════════════════════════════════

🔧 TROUBLESHOOTING

❓ "Module not found: @lmnr-ai/lmnr"
   ✓ npm install @lmnr-ai/lmnr

❓ "LMNR_API_KEY not found"
   ✓ Create .env file with your key

❓ "Failed to connect to Laminar"
   ✓ Check API key is correct
   ✓ Check network connection
   ✓ Verify Laminar service is up

❓ "What if I don't have Laminar?"
   ✓ Use npm run eval:transactions (local only)
   ✓ Sign up for free at laminar.ai

═══════════════════════════════════════════════════════════════

📚 USEFUL COMMANDS

# Local evaluation (no Laminar)
npm run eval:transactions

# Laminar evaluation (with dashboard)
npm run eval:transactions:laminar

# Check environment setup
echo $OPENAI_API_KEY
echo $LMNR_API_KEY

═══════════════════════════════════════════════════════════════

📖 DOCUMENTATION

• Laminar Setup: ./LAMINAR_SETUP.md
• Eval Framework: ./README.md
• Type Definitions: ./types.ts
• Evaluators: ./evaluators.ts
• Executors: ./executors.ts

═══════════════════════════════════════════════════════════════

✅ NEXT STEPS

1. Install SDK:
   npm install @lmnr-ai/lmnr

2. Add to .env:
   LMNR_API_KEY=your_key_here
   OPENAI_API_KEY=sk_xxx
   OPENAI_MODEL=gpt-4o-mini

3. Run evaluation:
   npm run eval:transactions:laminar

4. View dashboard:
   https://dashboard.laminar.ai

═══════════════════════════════════════════════════════════════

Questions? Check LAMINAR_SETUP.md for detailed guide!

`);

# Laminar Integration Setup Guide

This guide walks you through setting up **Laminar** for observability and tracing of your AI evaluation system.

## Overview

Laminar provides:
- 📊 **Dashboard** - Visualize evaluation runs
- 📈 **Tracing** - See exact tool selections and decisions
- 📉 **Metrics** - Track performance over time
- 🔔 **Alerts** - Notify you of regressions
- 📦 **Dataset Management** - Version your test cases

## Prerequisites

1. **Laminar Account** - Sign up at [laminar.ai](https://laminar.ai)
2. **Project Created** - Create a new project in Laminar
3. **API Key** - Copy your project API key

## Step 1: Install Laminar SDK

```bash
npm install @lmnr-ai/lmnr
npm install --save-dev tsx
```

## Step 2: Set Environment Variables

Create or update your `.env` file:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk_your_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Laminar Configuration
LMNR_API_KEY=your_laminar_api_key_here
```

## Step 3: Run Evaluation with Laminar

### Option 1: Using the Laminar Evaluator (Recommended)

Runs evaluation with full tracing and uploads to Laminar dashboard:

```bash
npm run eval:transactions:laminar
```

This command:
- Executes all test cases
- Sends traces to Laminar in real-time
- Aggregates scores
- Displays results in dashboard

### Option 2: Using Local Evaluator

Runs evaluation locally with JSON output (no Laminar):

```bash
npm run eval:transactions
```

This generates:
- `results.json` - Detailed test results
- `summary.json` - Summary statistics

## How It Works

### Flow Diagram

```
Test Case
    ↓
singleTurnWithMocks(data)
    ↓
OpenAI API Call (returns tool selections)
    ↓
Evaluator Functions
  ├─ toolsSelected (binary)
  ├─ toolsAvoided (binary)
  ├─ toolSelectionScore (F1 score)
  ├─ selectedAnyTool (binary)
  └─ toolCount (count)
    ↓
Laminar API (if using Laminar)
    ↓
Dashboard / Results
```

### What Gets Traced

Each test case sends to Laminar:

```json
{
  "test_case": "Show me spending for last 30 days",
  "category": "golden",
  "selected_tools": ["calculateTransactionsByLastDays"],
  "expected_tools": ["calculateTransactionsByLastDays"],
  "scores": {
    "toolsSelected": 1,
    "toolsAvoided": 1,
    "selectedAny": 1,
    "toolCount": 1
  },
  "passed": true
}
```

## Laminar Dashboard Features

### 1. Evaluation Runs
View all past evaluation runs grouped by date

### 2. Metrics Display
See scores for each evaluator:
- `toolsSelected` - % of tests selecting correct tools
- `toolsAvoided` - % of tests avoiding forbidden tools
- `selectionScore` - Average F1 score
- `selectedAny` - % of tests selecting at least one tool
- `toolCount` - Average tools selected per test

### 3. Detailed Results
Click into each run to see:
- Individual test results
- Tool selections vs expected
- Score breakdown
- Execution time

### 4. Trends Over Time
Track performance across runs:
- Success rate improvements
- Tool selection accuracy
- Category-specific trends

### 5. Dataset Management
Manage test case versions:
- Upload new test data
- Track which dataset version was used
- Compare results across versions

## Example Workflow

### First Evaluation Run

```bash
# Set up environment
export LMNR_API_KEY=your_key
export OPENAI_API_KEY=sk_xxx
export OPENAI_MODEL=gpt-4o-mini

# Run evaluation
npm run eval:transactions:laminar

# Output:
# ✅ Evaluation complete! Check your Laminar dashboard for results.

# Visit: https://dashboard.laminar.ai/project/your-project-id
```

### Track Performance Over Time

Laminar automatically tracks:
1. **Test Execution** - When each test ran
2. **Tool Selections** - What the agent chose
3. **Scores** - How well it performed
4. **Trends** - Is performance improving?

### Set Up Alerts

In Laminar dashboard:
1. Go to Alerts
2. Create alert: "toolsSelected < 0.9"
3. Get notified if performance drops

## File Structure

```
src/services/ai/eval/
├── transaction-tools.eval.ts    ← Laminar evaluation file (NEW)
├── index.ts                      ← Local evaluation file
├── executors.ts                  ← Runs the tests
├── evaluators.ts                 ← Scores the results
├── types.ts                      ← Type definitions
├── utils.ts                      ← Utilities
├── data/
│   └── transaction-tools.json   ← Test cases
└── README.md
```

## Comparison: Laminar vs Local

| Feature | Laminar | Local |
|---------|---------|-------|
| Dashboard | ✓ | ✗ |
| Tracing | ✓ | ✗ |
| Historical Tracking | ✓ | ✗ |
| Alerts | ✓ | ✗ |
| Offline Support | ✗ | ✓ |
| Cost | Paid (free tier) | Free |
| Speed | Slower (API calls) | Faster |

## Troubleshooting

### "LMNR_API_KEY not found"
```bash
# Make sure .env file has:
LMNR_API_KEY=your_actual_key
```

### "Failed to connect to Laminar"
```bash
# Check:
1. API key is correct
2. Network connection is working
3. Laminar service is up
```

### "No results showing up"
```bash
# Try:
1. Run local eval first: npm run eval:transactions
2. Check results.json to debug
3. Run Laminar eval with verbose logging
```

## Advanced: Custom Evaluators

Add your own evaluators in `transaction-tools.eval.ts`:

```typescript
// Add to evaluators object
evaluators: {
  // Existing evaluators...
  toolsSelected, toolsAvoided, selectionScore,
  
  // Your custom evaluator
  myCustomScore: (output, target) => {
    // Custom scoring logic
    return somScore;
  }
}
```

## CI/CD Integration

Run evaluations in your pipeline:

```bash
# GitHub Actions example
- name: Run AI Evaluations
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    LMNR_API_KEY: ${{ secrets.LMNR_API_KEY }}
  run: npm run eval:transactions:laminar
```

## Next Steps

1. ✅ Install Laminar SDK
2. ✅ Set up API keys
3. ✅ Run first evaluation: `npm run eval:transactions:laminar`
4. ✅ View results in Laminar dashboard
5. ✅ Set up alerts for regressions
6. ✅ Track performance over time

## Documentation

- [Laminar Docs](https://docs.laminar.ai)
- [LMNR SDK Docs](https://docs.laminar.ai/sdk)
- [Evaluation Guide](./README.md)

## Questions?

Check:
- `.env` file for correct API keys
- Network connection to Laminar
- Browser console for errors
- Laminar dashboard status

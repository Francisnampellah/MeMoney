# AI Financial Tools Evaluation System

This evaluation framework tests whether the AI agent correctly selects financial analysis tools based on user prompts.

## Overview

The system uses three categories to organize test cases:

### **Golden** 🟢
- Must select **exactly** the expected tools
- No ambiguity - the tool choice is clear
- Binary scoring: 1 (pass) or 0 (fail)

### **Secondary** 🟡
- Likely selects certain tools, but there's flexibility
- Multiple valid tool combinations possible
- Scored on precision/recall (F1 score: 0-1)

### **Negative** 🔴
- Must **NOT** select forbidden tools
- Tests that the agent doesn't over-reach
- Binary: 1 if all forbidden tools avoided, 0 if any are used

## Evaluators (Scorers)

The system includes several scoring functions:

| Evaluator | Type | Use Case |
|-----------|------|----------|
| `toolsSelected` | Binary | Check if all expected tools were selected (Golden) |
| `toolsAvoided` | Binary | Verify forbidden tools weren't used (Negative) |
| `toolSelectionScore` | F1 Score | Precision/recall balance for flexible selection (Secondary) |
| `toolOrderCorrect` | Continuous | Check if tools were called in expected sequences (Multi-turn) |
| `selectedAnyTool` | Binary | Check if at least one tool was selected |
| `toolCountSelected` | Count | Track how many tools were selected |

## Project Structure

```
src/services/ai/eval/
├── types.ts              # Type definitions
├── evaluators.ts         # Scoring functions
├── executors.ts          # Test execution logic
├── utils.ts              # Utility functions
├── index.ts              # Main evaluation runner
├── data/
│   └── transaction-tools.json  # Test dataset
├── results.json          # Detailed results (generated)
└── summary.json          # Summary stats (generated)
```

## Running the Evaluation

### Prerequisites

1. Set environment variables:
```bash
# In .env or export these
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4o-mini
```

2. Ensure all dependencies are installed:
```bash
npm install
```

### Run the Evaluation

```bash
npm run eval:transactions
```

Or directly with ts-node:
```bash
npx ts-node src/services/ai/eval/index.ts
```

## Test Dataset Format

The test dataset (`transaction-tools.json`) contains test cases with:

```json
[
  {
    "data": {
      "prompt": "User's request here",
      "tools": ["available", "tools", "list"],
      "transactions": []  // Optional: sample data
    },
    "target": {
      "expectedTools": ["tool1", "tool2"],  // For golden/secondary
      "forbiddenTools": ["tool3"],          // For negative
      "category": "golden|secondary|negative",
      "description": "What this test checks"
    }
  }
]
```

## Test Cases

### Golden Cases (Must select exact tools)

- "Show me my total spending for the last 30 days" → `calculateTransactionsByLastDays`
- "How much did I spend today?" → `calculateTransactionsByDate`
- "What are my biggest spending categories?" → `getSpendingByType`
- "Analyze Jan 15-31" → `calculateTransactionsByDateRange`
- "Find where I'm wasting money" → `detectSpendingLeaks`

### Secondary Cases (Flexible, scored on F1)

- "Give me a complete overview of my spending" → Multiple tools likely
- "What are my recurring expenses?" → Likely `detectSpendingLeaks`
- "Compare January vs February" → Multiple date ranges

### Negative Cases (Avoid these tools)

- "What's the weather tomorrow?" → NO transaction tools
- "How do I cook ugali?" → NO transaction tools
- "What's the capital of Kenya?" → NO transaction tools

## Understanding Results

### Output Format

```
✓ Test 1/12: Show my total spending for the last 30 days
   Category: golden
   ✓ Selected: calculateTransactionsByLastDays
   Expected: calculateTransactionsByLastDays
   Scores: {"toolsSelected":1,"toolsAvoided":1,"selectedAnyTool":1,"toolCount":1}
```

### Summary Report

```
📊 EVALUATION SUMMARY
============================================================
Total Tests: 12
✓ Passed: 11
❌ Failed: 1
Success Rate: 91.7%

GOLDEN: 5/5 passed (100.0%)
SECONDARY: 3/4 passed (75.0%)
NEGATIVE: 3/3 passed (100.0%)

📈 AVERAGE SCORES BY EVALUATOR
  toolsSelected: 100.0%
  toolsAvoided: 100.0%
  toolSelectionScore: 75.0%
```

### Generated Files

After running, two files are created:

- **`results.json`** - Detailed results for every test case (for debugging)
- **`summary.json`** - Summary statistics (for tracking over time)

## Adding New Test Cases

To add new test cases:

1. Open `data/transaction-tools.json`
2. Add a new object with:
   - `data`: the prompt and tools
   - `target`: expected tools and category
   - `metadata.description`: what the test checks

Example:
```json
{
  "data": {
    "prompt": "Show me my transactions from last week",
    "tools": ["calculateTransactionsByDate", "calculateTransactionsByDateRange", "calculateTransactionsByLastDays", "getSpendingByType", "detectSpendingLeaks"]
  },
  "target": {
    "expectedTools": ["calculateTransactionsByLastDays"],
    "category": "golden",
    "description": "Week request - should use calculateTransactionsByLastDays"
  }
}
```

## Scoring Logic

### Golden Cases
- **toolsSelected**: 1 if all expected tools present, else 0
- **toolsAvoided**: 1 if no forbidden tools present, else 0
- **Pass**: both scores = 1

### Secondary Cases
- **toolSelectionScore**: F1 score of precision/recall
  - Precision = TP / (TP + FP)
  - Recall = TP / (TP + FN)
  - F1 = 2 × (P × R) / (P + R)
- **Pass**: score > 0.5

### Negative Cases
- **toolsAvoided**: 1 if all forbidden tools avoided, else 0
- **Pass**: score = 1

## Debugging Failed Tests

If a test fails:

1. Check the `results.json` file for detailed output
2. Look at what tools the agent selected vs. what was expected
3. Review the prompt - might need to be more specific
4. Check if the agent's output shows tool considerations

Example from results.json:
```json
{
  "data": { "prompt": "...", "tools": [...] },
  "target": { "expectedTools": [...], "category": "golden" },
  "output": {
    "toolNames": ["wrongTool"],
    "toolCalls": [...]
  },
  "scores": { "toolsSelected": 0 }
}
```

## Files Generated During Evaluation

- `results.json` - Complete test results for analysis
- `summary.json` - High-level summary and metrics

These are gitignored but useful for tracking performance over time.

## Future Enhancements

- [ ] Multi-turn evaluation with tool execution chains
- [ ] Tracing with OpenTelemetry/Laminar
- [ ] Dataset versioning and comparison
- [ ] Automated alerts for performance regression
- [ ] Web dashboard for result visualization

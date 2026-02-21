# AI Evaluation System - Quick Reference

## Two Evaluation Approaches

### 🏠 **Local Evaluation**

**File:** `src/services/ai/eval/index.ts`

**Command:**
```bash
npm run eval:transactions
```

**Features:**
- ✓ No API key needed (except OpenAI)
- ✓ Fast execution
- ✓ Works offline
- ✓ Outputs JSON files locally

**Output:**
- `results.json` - All test details
- `summary.json` - Aggregate metrics

**Best For:**
- Quick testing during development
- Debugging individual tests
- No internet/dashboard access
- Local CI/CD pipelines

**Example:**
```bash
$ npm run eval:transactions
🚀 Starting Financial Tools Evaluation...
✓ Loaded 12 test cases

📋 Test 1/12: Show me my total spending...
✓ Selected: calculateTransactionsByLastDays

✓ Passed: 11
❌ Failed: 1
Success Rate: 91.7%
```

---

### ☁️ **Laminar Evaluation** (with Dashboard)

**File:** `src/services/ai/eval/transaction-tools.eval.ts`

**Command:**
```bash
npm run eval:transactions:laminar
```

**Features:**
- ✓ Dashboard visualization
- ✓ Historical tracking
- ✓ Performance trends
- ✓ Alerts & notifications
- ✓ Team collaboration
- ✓ Dataset versioning

**Output:**
- Results in Laminar dashboard
- Real-time trace visualization
- Metrics aggregation
- Historical comparison

**Best For:**
- Production evaluations
- Team monitoring
- Long-term tracking
- Setting up alerts
- Performance regression detection

**Example:**
```bash
$ npm run eval:transactions:laminar
✅ Evaluation complete! Check your Laminar dashboard for results.
→ https://dashboard.laminar.ai/project/your-id
```

---

## Decision Matrix

| Need | Local | Laminar |
|------|-------|---------|
| Quick test | ✅ | ❌ |
| Dashboard | ❌ | ✅ |
| Historical data | ❌ | ✅ |
| Alerts | ❌ | ✅ |
| Offline | ✅ | ❌ |
| Team access | ❌ | ✅ |
| API key | OpenAI only | OpenAI + Laminar |

---

## Setup Instructions

### Local Only
```bash
# All you need:
export OPENAI_API_KEY=sk_xxx
npm run eval:transactions
```

### With Laminar Dashboard
```bash
# Install
npm install @lmnr-ai/lmnr
npm install --save-dev tsx

# Configure
export OPENAI_API_KEY=sk_xxx
export OPENAI_MODEL=gpt-4o-mini
export LMNR_API_KEY=xxx          # Get from laminar.ai

# Run
npm run eval:transactions:laminar

# View
Open https://dashboard.laminar.ai
```

---

## Evaluation Flow

### Local Flow
```
Test Dataset
    ↓
singleTurnWithMocks()
    ↓
OpenAI API
    ↓
Evaluators
    ↓
results.json
summary.json
```

### Laminar Flow
```
Test Dataset
    ↓
singleTurnWithMocks()
    ↓
OpenAI API
    ↓
Evaluators
    ↓
Laminar API
    ↓
Dashboard
    ├── Metrics
    ├── Traces
    ├── Trends
    └── Alerts
```

---

## Test Categories

### 🟢 Golden (5 tests)
**Requirement:** Must select EXACT expected tools
```
Prompt: "Show me spending for last 30 days"
Expected: ["calculateTransactionsByLastDays"]
Score: 1 (pass) or 0 (fail)
```

### 🟡 Secondary (3 tests)
**Requirement:** Likely selections, scored on precision/recall
```
Prompt: "Give me complete spending overview"
Expected: ["calculateTransactionsByLastDays", "getSpendingByType"]
Score: 0-1 (F1 score)
```

### 🔴 Negative (4 tests)
**Requirement:** Must AVOID transaction tools
```
Prompt: "What's the weather?"
Forbidden: ["calculateTransactionsByDate", ...]
Score: 1 (pass) or 0 (fail)
```

---

## Evaluators Explained

| Evaluator | Type | Category | Description |
|-----------|------|----------|-------------|
| `toolsSelected` | Binary | Golden/Secondary | Did it select all expected? |
| `toolsAvoided` | Binary | Negative | Did it avoid forbidden? |
| `toolSelectionScore` | F1 Score | Secondary | Precision/recall balance |
| `selectedAnyTool` | Binary | All | Did it select ≥1 tool? |
| `toolCountSelected` | Count | All | How many tools selected? |

---

## Results Example

### Local Output
```json
{
  "data": { "prompt": "...", "tools": [...] },
  "target": { "expectedTools": [...], "category": "golden" },
  "output": { "toolNames": ["calculateTransactionsByLastDays"] },
  "scores": { "toolsSelected": 1, "toolsAvoided": 1 }
}
```

### Laminar Dashboard Shows
```
Test: Show my total spending for last 30 days
Category: Golden
Status: ✓ PASS
Selected: calculateTransactionsByLastDays
Scores: toolsSelected: 100%, toolsAvoided: 100%
Time: 1.2s
```

---

## Common Workflows

### 👨‍💻 Development Cycle

```bash
# 1. Make changes to agent/tools
# 2. Quick test
npm run eval:transactions

# 3. Check results
cat src/services/ai/eval/results.json

# 4. If good, run full Laminar eval
npm run eval:transactions:laminar

# 5. Monitor dashboard
# (Keep browser tab open)
```

### 🚀 Week 1 Setup

```bash
# Day 1: Install & Setup
npm install @lmnr-ai/lmnr
npm install --save-dev tsx
# Create .env with API keys

# Day 2: First run
npm run eval:transactions:laminar
# View dashboard

# Day 3-7: Daily monitoring
npm run eval:transactions:laminar  # Each morning
# Track trends in dashboard
```

### 🔄 CI/CD Pipeline

```bash
# GitHub Actions
- name: Run AI Evaluations
  run: |
    npm install @lmnr-ai/lmnr
    npm run eval:transactions:laminar
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    LMNR_API_KEY: ${{ secrets.LMNR_API_KEY }}
```

---

## Troubleshooting

### Local Evaluation Issues

**"OPENAI_API_KEY not found"**
```bash
export OPENAI_API_KEY=sk_xxx
npm run eval:transactions
```

**"Results not saved"**
```bash
# Check file permissions
ls -la src/services/ai/eval/
# Should be able to write to directory
```

### Laminar Evaluation Issues

**"LMNR_API_KEY not found"**
```bash
export LMNR_API_KEY=your_key  # Get from laminar.ai
export OPENAI_API_KEY=sk_xxx
npm run eval:transactions:laminar
```

**"Module not found"**
```bash
npm install @lmnr-ai/lmnr
npm install --save-dev tsx
npm run eval:transactions:laminar
```

**"Failed to connect"**
- Check internet connection
- Verify API key is correct
- Check Laminar service status

---

## Performance Expectations

### Local Evaluation
- **Speed:** ~10-30 seconds for 12 tests
- **Per test:** ~1-2 seconds
- **Storage:** ~50KB for results.json

### Laminar Evaluation
- **Speed:** ~20-60 seconds for 12 tests (slower due to API)
- **Per test:** ~2-5 seconds
- **Storage:** Unlimited (cloud)

---

## Next Steps

**Choose Your Path:**

1. **Quick Testing?** → Use Local
   ```bash
   npm run eval:transactions
   ```

2. **Production Tracking?** → Use Laminar
   ```bash
   npm install @lmnr-ai/lmnr
   npm run eval:transactions:laminar
   ```

3. **Need Both?** → Run both!
   ```bash
   npm run eval:transactions           # Local
   npm run eval:transactions:laminar   # Cloud
   ```

---

## Files Reference

```
src/services/ai/eval/
├── index.ts                    ← Local evaluator (no Laminar)
├── transaction-tools.eval.ts   ← Laminar evaluator (THIS FILE)
├── evaluators.ts               ← Scoring functions
├── executors.ts                ← Test execution
├── types.ts                    ← Type definitions
├── utils.ts                    ← Utilities
├── data/transaction-tools.json ← Test cases
├── README.md                   ← Full documentation
├── LAMINAR_SETUP.md            ← Laminar setup guide
├── QUICKSTART.js               ← Quick reference
└── setup-laminar.js            ← Setup helper
```

---

## Questions?

- **Local Eval:** Check `README.md`
- **Laminar Setup:** Check `LAMINAR_SETUP.md`
- **Quick Start:** Check `QUICKSTART.js`
- **Laminar Docs:** https://docs.laminar.ai

---

**Last Updated:** February 21, 2026

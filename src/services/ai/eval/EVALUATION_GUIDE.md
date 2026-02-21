# AI Chat Evaluation Guide

## Overview

This guide explains how to test the AI chat functionality with comprehensive transaction data. The system has been enhanced to support testing with realistic transaction volumes.

## Files Structure

### Core Files

- **`transaction-fixtures.ts`** - Transaction data generators
  - `generateTestTransactions()` - Generates N transactions automatically
  - `comprehensiveTransactions` - 60 days of randomized transactions
  - `scenarioTransactions` - Pre-built scenarios (high spenders, high fees, etc.)

- **`testDataLoader.ts`** - Test data orchestration
  - `loadEvalDataWithTransactions()` - Loads all evals with comprehensive transactions
  - `loadScenarioTests()` - Scenario-based tests
  - `createCustomEvalData()` - Create custom tests with specific transaction counts

- **`sampleRunner.ts`** - Example implementation
  - Shows how to run evaluations
  - Demonstrates all testing patterns

## Usage Examples

### 1. Run All Evaluations with Transactions

```typescript
import { loadEvalDataWithTransactions } from './data/testDataLoader';
import { testChatWithToolIntegration } from './executors';

const evalData = loadEvalDataWithTransactions();

for (const { data, target } of evalData) {
  const result = await testChatWithToolIntegration(
    data.prompt,
    data.transactions,
    []
  );
  console.log(`Prompt: ${data.prompt}`);
  console.log(`Response: ${result.response}`);
}
```

### 2. Test Specific Scenarios

```typescript
import { loadScenarioTests } from './data/testDataLoader';

const scenarios = loadScenarioTests();

for (const scenario of scenarios) {
  console.log(`Testing: ${scenario.scenario}`);
  const result = await testChatWithToolIntegration(
    scenario.data.prompt,
    scenario.data.transactions,
    []
  );
}
```

### 3. Generate Custom Transaction Sets

```typescript
import { createCustomEvalData } from './data/testDataLoader';

// Create eval data with 200 transactions
const customEval = createCustomEvalData(
  'What are my spending patterns?',
  ['calculateTransactionsByLastDays', 'getSpendingByType'],
  200 // transaction count
);
```

### 4. Multi-Turn Conversation Testing

```typescript
import { multiTurnChatTest } from './executors';
import { comprehensiveTransactions } from './data/transaction-fixtures';

const messages = [
  'How much did I spend last week?',
  'What were my top categories?',
  'Where can I save money?'
];

const result = await multiTurnChatTest(messages, comprehensiveTransactions);
```

## Transaction Data Options

### Option 1: Comprehensive (Recommended)
- 60 days of randomized transactions
- ~180-240 total transactions
- Realistic spending patterns
- Perfect for general testing

```typescript
import { comprehensiveTransactions } from './data/transaction-fixtures';
// Use comprehensiveTransactions in your tests
```

### Option 2: Custom Count
- Generate any number of transactions
- Automatic date spreading (~3 per day)
- Realistic patterns maintained

```typescript
import { generateTestTransactions } from './data/transaction-fixtures';
const transactions = generateTestTransactions(90); // 90 days
// ~270 transactions automatically generated
```

### Option 3: Scenario-Based
- Pre-designed test scenarios
- Specific spending patterns
- Perfect for edge cases

```typescript
import { scenarioTransactions } from './data/transaction-fixtures';

// High spending month
const highSpending = scenarioTransactions.highSpender();

// High fees (spending leak)
const highFees = scenarioTransactions.highFees();

// Date range scenario
const dateRange = scenarioTransactions.dateRangeScenario();
```

## Evaluation Categories

### Golden Tests
The core functionality tests. These should always pass:
- Last 30 days spending
- Today's spending
- Spending by category
- Date range analysis
- Spending leak detection

### Secondary Tests
Multi-tool scenarios requiring combined analysis:
- Complete monthly overview (requires 2+ tools)

### Negative Tests
Should NOT trigger tools or use specific tools (future expansion)

## Running Evaluations

### Via Node.js Script
```bash
npx ts-node src/services/ai/eval/examples/sampleRunner.ts
```

### Via npm Task (if configured)
```bash
npm run eval
# or
npm run eval:scenarios
```

### Programmatic
```typescript
import { runAllEvals, runScenarioTests } from './examples/sampleRunner';

await runAllEvals();
await runScenarioTests();
```

## Transaction Structure

Each transaction has:
```typescript
{
  transaction_id: string;       // Unique ID
  date: string;                 // YYYY-MM-DD format
  time: string;                 // HH:MM format
  type: string;                 // MONEY_TRANSFER, WITHDRAWAL, etc.
  direction: 'SENT' | 'RECEIVED';
  amount: number;               // Transaction amount
  counterparty_name: string;    // Who sent/received
  fee: number;                  // Transaction fee
  government_levy: number;      // Tax/levy
  balance_after: number;        // Balance after transaction
  currency: string;             // TSh, etc.
  status: 'COMPLETED';          // Status
}
```

## Testing Checklist

- [ ] Test with comprehensive transactions (60+ days)
- [ ] Test with minimal transactions (1 day)
- [ ] Test with scenario data (high fees, high spending)
- [ ] Test multi-turn conversations
- [ ] Verify tool selection accuracy
- [ ] Verify response accuracy
- [ ] Check conversation history persistence
- [ ] Validate date range handling

## Tips & Tricks

### Increase Transaction Volume for Stress Testing
```typescript
const manyTransactions = generateTestTransactions(365); // Full year
```

### Debug Tool Selection
```typescript
const result = await singleTurnWithMocks(evalData);
console.log('Tools selected:', result.toolNames);
console.log('Tool arguments:', result.toolCalls);
```

### Test Specific Date Ranges
```typescript
const today = new Date();
const dateStr = today.toISOString().split('T')[0];
const prompt = `How much did I spend on ${dateStr}?`;
```

### Verify Tool Execution
```typescript
const result = await testChatWithToolIntegration(prompt, transactions, []);
if (!result.success) {
  console.log('Error:', result.error);
}
```

## Troubleshooting

### "No transactions provided"
Ensure you're passing the transactions array to all functions.

### Tool not being called
Check if the prompt is clear about what it's asking. The AI needs context.

### Conversation history not preserved
Use `multiTurnChatTest` instead of calling individual tests, as it maintains state.

### Transactions dated in future
The fixture generator creates transactions relative to today's date. Adjust expectations if running in different timezones.

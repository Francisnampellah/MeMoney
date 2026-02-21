/**
 * Test Data Loader for AI Evaluation
 * Combines eval prompts with comprehensive transaction fixtures
 */

import type { EvalData } from '../types';
import { comprehensiveTransactions, scenarioTransactions, generateTestTransactions } from './transaction-fixtures';

// Raw eval data from JSON (without transactions)
const evalPromptsRaw = [
  {
    prompt: 'Show me my total spending for the last 30 days',
    expectedTools: ['calculateTransactionsByLastDays'],
    category: 'golden',
    description: 'Direct request for last 30 days - should use calculateTransactionsByLastDays',
  },
  {
    prompt: 'How much did I spend today?',
    expectedTools: ['calculateTransactionsByDate'],
    category: 'golden',
    description: "Request for today's spending - should use calculateTransactionsByDate",
  },
  {
    prompt: 'What are my biggest spending categories in January?',
    expectedTools: ['getSpendingByType'],
    category: 'golden',
    description: 'Spending by category request - should use getSpendingByType',
  },
  {
    prompt: 'Analyze my transactions from January 15 to January 31, 2026',
    expectedTools: ['calculateTransactionsByDateRange'],
    category: 'golden',
    description: 'Date range request - should use calculateTransactionsByDateRange',
  },
  {
    prompt: 'Find where I\'m wasting money with high transaction fees',
    expectedTools: ['detectSpendingLeaks'],
    category: 'golden',
    description: 'Spending leak detection - should use detectSpendingLeaks',
  },
  {
    prompt: 'Give me a complete overview of my spending patterns this month',
    expectedTools: ['calculateTransactionsByLastDays', 'getSpendingByType'],
    category: 'secondary',
    description: 'Multi-tool request - requires both last days and category analysis',
  },
];

/**
 * Load eval data with comprehensive transactions
 */
export function loadEvalDataWithTransactions(): Array<{ data: EvalData; target: any }> {
  return evalPromptsRaw.map((evalItem) => ({
    data: {
      prompt: evalItem.prompt,
      tools: [
        'calculateTransactionsByDate',
        'calculateTransactionsByDateRange',
        'calculateTransactionsByLastDays',
        'getSpendingByType',
        'detectSpendingLeaks',
      ],
      transactions: comprehensiveTransactions, // Include comprehensive transactions
    },
    target: {
      expectedTools: evalItem.expectedTools,
      category: evalItem.category,
      description: evalItem.description,
    },
  }));
}

/**
 * Load specific scenario tests with targeted transactions
 */
export function loadScenarioTests(): Array<{ data: EvalData; target: any; scenario: string }> {
  return [
    {
      scenario: 'High-Spending Month',
      data: {
        prompt: 'Analyze my spending patterns from the last 30 days',
        tools: [
          'calculateTransactionsByLastDays',
          'getSpendingByType',
          'detectSpendingLeaks',
        ],
        transactions: scenarioTransactions.highSpender(),
      },
      target: {
        expectedTools: ['calculateTransactionsByLastDays', 'getSpendingByType'],
        category: 'golden',
        description: 'Should identify high spending patterns',
      },
    },
    {
      scenario: 'High Fees (Spending Leaks)',
      data: {
        prompt: 'Where am I losing money to transaction fees?',
        tools: ['detectSpendingLeaks', 'calculateTransactionsByLastDays'],
        transactions: scenarioTransactions.highFees(),
      },
      target: {
        expectedTools: ['detectSpendingLeaks'],
        category: 'golden',
        description: 'Should detect high fee spending leaks',
      },
    },
    {
      scenario: 'Date Range Analysis',
      data: {
        prompt: 'What was my spending from Jan 15 to Jan 31?',
        tools: ['calculateTransactionsByDateRange', 'getSpendingByType'],
        transactions: scenarioTransactions.dateRangeScenario(),
      },
      target: {
        expectedTools: ['calculateTransactionsByDateRange'],
        category: 'golden',
        description: 'Should use date range tool for specific period',
      },
    },
  ];
}

/**
 * Create custom eval data with variable transaction counts
 */
export function createCustomEvalData(
  prompt: string,
  expectedTools: string[],
  transactionCount: number = 100
): EvalData {
  return {
    prompt,
    tools: [
      'calculateTransactionsByDate',
      'calculateTransactionsByDateRange',
      'calculateTransactionsByLastDays',
      'getSpendingByType',
      'detectSpendingLeaks',
    ],
    transactions: generateTestTransactions(Math.ceil(transactionCount / 3)), // ~3 tx per day
  };
}

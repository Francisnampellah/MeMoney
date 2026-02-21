/**
 * Utility Functions for AI Financial Tools Evaluation
 */

import type { EvalData } from './types';

/**
 * Build message array for LLM from eval data
 */
export function buildMessages(data: EvalData): Array<{ role: string; content: string }> {
  return [
    {
      role: 'system',
      content: `You are a financial analysis assistant for M-Pesa transactions in Tanzania.
You analyze spending patterns and provide insights using available tools.
Only select tools that are truly needed for the user's request.
Be precise about tool selection.`,
    },
    {
      role: 'user',
      content: data.prompt,
    },
  ];
}

/**
 * Build mocked tool definitions for testing
 * These define schemas without real implementations
 */
export function buildMockedTools(toolNames: string[]): Record<string, any> {
  const toolDefinitions: Record<string, any> = {
    calculateTransactionsByDate: {
      description:
        'Calculate total amount, count, and breakdown for transactions on a specific date',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: 'Target date in YYYY-MM-DD format',
          },
        },
        required: ['date'],
      },
    },
    calculateTransactionsByDateRange: {
      description: 'Calculate totals for transactions within a date range',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Start date in YYYY-MM-DD format',
          },
          endDate: {
            type: 'string',
            description: 'End date in YYYY-MM-DD format',
          },
        },
        required: ['startDate', 'endDate'],
      },
    },
    calculateTransactionsByLastDays: {
      description: 'Calculate transactions for the last N days from today',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to analyze',
          },
        },
        required: ['days'],
      },
    },
    getSpendingByType: {
      description: 'Analyze spending breakdown by transaction type',
      parameters: {
        type: 'object',
        properties: {
          startDate: {
            type: 'string',
            description: 'Optional start date',
          },
          endDate: {
            type: 'string',
            description: 'Optional end date',
          },
        },
        required: [],
      },
    },
    detectSpendingLeaks: {
      description:
        'Identify potential spending leaks like high fees and recurring patterns',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to analyze (default 30)',
          },
        },
        required: [],
      },
    },
  };

  const result: Record<string, any> = {};
  for (const toolName of toolNames) {
    if (toolDefinitions[toolName]) {
      result[toolName] = {
        description: toolDefinitions[toolName].description,
        parameters: toolDefinitions[toolName].parameters,
      };
    }
  }
  return result;
}

/**
 * Format evaluation result for display
 */
export function formatEvalResult(result: any): string {
  const scores = result.scores || {};
  const scoreStr = Object.entries(scores)
    .map(([key, value]) => `${key}: ${(value as number).toFixed(2)}`)
    .join(', ');

  return `
Category: ${result.target.category}
Expected Tools: ${result.target.expectedTools?.join(', ') || 'N/A'}
Selected Tools: ${result.output.toolNames?.join(', ') || 'N/A'}
Scores: ${scoreStr}
Description: ${result.metadata?.description || 'N/A'}
`;
}

/**
 * Calculate average score across results
 */
export function calculateAverageScores(results: any[]): Record<string, number> {
  const scores: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const result of results) {
    for (const [key, value] of Object.entries(result.scores)) {
      if (typeof value === 'number') {
        scores[key] = (scores[key] || 0) + value;
        counts[key] = (counts[key] || 0) + 1;
      }
    }
  }

  const averages: Record<string, number> = {};
  for (const [key, sum] of Object.entries(scores)) {
    averages[key] = sum / counts[key];
  }

  return averages;
}

/**
 * Group results by category
 */
export function groupResultsByCategory(results: any[]) {
  const grouped: Record<string, any[]> = {
    golden: [],
    secondary: [],
    negative: [],
  };

  for (const result of results) {
    const category = result.target.category;
    if (category in grouped) {
      grouped[category].push(result);
    }
  }

  return grouped;
}

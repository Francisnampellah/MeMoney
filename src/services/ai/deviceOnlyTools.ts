/**
 * Device-Only Tools for AI Chat
 * 
 * These tools trigger device-side processing and return only results.
 * NO transaction data is sent to the model - all processing happens on device.
 */

import { z } from 'zod';
import { Tool } from './tools/definitions';
import { DeviceTransactionProcessor } from './deviceProcessor';
import { Transaction } from '../sms/types';

/**
 * Cache for processor instance to avoid recreating
 */
let processorCache: DeviceTransactionProcessor | null = null;

/**
 * Get or create processor
 */
function getProcessor(transactions: Transaction[]): DeviceTransactionProcessor {
  if (!processorCache) {
    processorCache = new DeviceTransactionProcessor(transactions);
  }
  return processorCache;
}

/**
 * Reset processor cache (call when new transactions loaded)
 */
export function resetProcessorCache(): void {
  processorCache = null;
}

/**
 * Get overall spending analysis
 * DEVICE-ONLY: All processing on device, only results sent to model
 */
export const getOverallAnalysisTool: Tool = {
  name: 'getOverallAnalysis',
  description: 'Get comprehensive analysis of all spending patterns, including totals by direction and type. Returns only summarized results.',
  schema: z.object({
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    const analysis = processor.analyzeAll();
    
    // Return only summary, never raw transactions
    return {
      overview: analysis.summary,
      byDirection: analysis.byDirection,
      topSpendingTypes: analysis.byType,
      topCounterparties: analysis.topCounterparties,
      fees: analysis.fees,
      trends: analysis.recentTrend,
    };
  },
};

/**
 * Get spending for specific date
 */
export const getDateSpendingTool: Tool = {
  name: 'getDateSpending',
  description: 'Get detailed spending analysis for a specific date. Returns only aggregated results.',
  schema: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    return processor.getSpendingForDate(args.date);
  },
};

/**
 * Get spending for date range
 */
export const getDateRangeSpendingTool: Tool = {
  name: 'getDateRangeSpending',
  description: 'Get spending analysis for a date range. Returns aggregated totals and daily breakdown.',
  schema: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    return processor.getSpendingForDateRange(args.startDate, args.endDate);
  },
};

/**
 * Get spending for last N days
 */
export const getLastDaysSpendingTool: Tool = {
  name: 'getLastDaysSpending',
  description: 'Get spending for the last N days. Returns totals, averages, and trends.',
  schema: z.object({
    days: z.number().int().positive(),
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    return processor.getSpendingForLastDays(args.days);
  },
};

/**
 * Analyze spending by type
 */
export const analyzeSpendingByTypeTool: Tool = {
  name: 'analyzeSpendingByType',
  description: 'Analyze spending breakdown by transaction type. Returns percentages and rankings.',
  schema: z.object({
    transactions: z.array(z.any()),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    return processor.analyzeSpendingByType(args.startDate, args.endDate);
  },
};

/**
 * Detect spending leaks and anomalies
 */
export const detectSpendingLeaksTool: Tool = {
  name: 'detectSpendingLeaks',
  description: 'Identify spending leaks: high fees, frequent small transactions, recurring patterns. Returns risk score and recommendations.',
  schema: z.object({
    days: z.number().int().positive().optional().default(30),
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    return processor.detectSpendingLeaks(args.days);
  },
};

/**
 * Compare spending between two periods
 */
export const comparePeriodsTool: Tool = {
  name: 'comparePeriods',
  description: 'Compare spending patterns between two periods. Returns trend analysis.',
  schema: z.object({
    startDate1: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate1: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startDate2: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate2: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    return processor.comparePeriods(
      args.startDate1,
      args.endDate1,
      args.startDate2,
      args.endDate2
    );
  },
};

/**
 * Get insight recommendation based on analysis
 * This runs MULTIPLE analyses and provides a formatted recommendation
 */
export const getInsightRecommendationTool: Tool = {
  name: 'getInsightRecommendation',
  description: 'Get AI-powered insights and recommendations based on spending analysis. Analyzes patterns and suggests actions.',
  schema: z.object({
    analysisType: z.enum([
      'spending_patterns',
      'savings_opportunities',
      'category_analysis',
      'anomalies',
    ]),
    transactions: z.array(z.any()),
  }),
  execute: async (args: any) => {
    const processor = getProcessor(args.transactions);
    const analysis = processor.analyzeAll();
    const leaks = processor.detectSpendingLeaks(30);
    const lastMonth = processor.getSpendingForLastDays(30);
    const spendingByType = processor.analyzeSpendingByType();

    const recommendations = {
      spending_patterns: {
        type: 'Spending Patterns',
        totalMonthlySpending: lastMonth.totalSent,
        dailyAverage: lastMonth.dailyAverage.toFixed(0),
        topCategory: spendingByType.topType?.type || 'Unknown',
        topCategoryAmount: spendingByType.topType?.amount || 0,
        recommendation: `Your average daily spending is ${lastMonth.dailyAverage.toFixed(0)} TSh. Focus on ${spendingByType.topType?.type || 'categorized'} spending.`,
      },
      savings_opportunities: {
        type: 'Savings Opportunities',
        leakRiskScore: leaks.overallRiskScore,
        potentialSavings: leaks.frequentSmallTransactions.wasted,
        topRecommendation: leaks.frequentSmallTransactions.recommendation,
        recurringPayments: leaks.recurringPatterns.length,
        recommendation: `Potential monthly savings: ${leaks.frequentSmallTransactions.wasted.toFixed(0)} TSh. ${leaks.frequentSmallTransactions.recommendation}`,
      },
      category_analysis: {
        type: 'Category Analysis',
        totalCategories: Object.keys(spendingByType.types).length,
        topCategories: spendingByType.types.slice(0, 3),
        recommendation: `You have transactions in ${Object.keys(spendingByType.types).length} categories. Your top 3 are: ${spendingByType.types
          .slice(0, 3)
          .map((t) => t.type)
          .join(', ')}`,
      },
      anomalies: {
        type: 'Anomalies & Alerts',
        highFees: {
          flagged: leaks.highFees.flagged,
          amount: leaks.highFees.totalFees,
          percentage: leaks.highFees.percentOfSpending.toFixed(2),
          recommendation: leaks.highFees.recommendation,
        },
        smallTxs: {
          flagged: leaks.frequentSmallTransactions.flagged,
          count: leaks.frequentSmallTransactions.count,
          recommendation: leaks.frequentSmallTransactions.recommendation,
        },
      },
    };

    return recommendations[args.analysisType as keyof typeof recommendations] || recommendations.spending_patterns;
  },
};

/**
 * Export all device-only tools
 */
export const DEVICE_ONLY_TOOLS: Tool[] = [
  getOverallAnalysisTool,
  getDateSpendingTool,
  getDateRangeSpendingTool,
  getLastDaysSpendingTool,
  analyzeSpendingByTypeTool,
  detectSpendingLeaksTool,
  comparePeriodsTool,
  getInsightRecommendationTool,
];

/**
 * Create tool registry with device-only tools
 */
export function createDeviceOnlyToolRegistry() {
  return {
    tools: DEVICE_ONLY_TOOLS,
    getTool: (name: string) => DEVICE_ONLY_TOOLS.find((t) => t.name === name),
    getToolsForOpenAI: () =>
      DEVICE_ONLY_TOOLS.map((tool) => ({
        type: 'function' as const,
        function: {
          name: tool.name,
          description: tool.description,
          parameters: {
            type: 'object',
            properties: {},
          },
        },
      })),
  };
}

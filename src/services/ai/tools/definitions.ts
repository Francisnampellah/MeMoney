import { z } from 'zod';
import { Transaction } from '../../sms/types';

/**
 * Base tool schema definition using Zod
 */
export interface Tool {
    name: string;
    description: string;
    schema: z.ZodSchema;
    execute: (args: any) => Promise<any>;
}

/**
 * Tool definitions for AI financial analysis using Zod schemas
 */

/**
 * Calculate transactions for a specific date
 */
export const calculateTransactionsByDateTool: Tool = {
    name: 'calculateTransactionsByDate',
    description: 'Calculate the total amount, count, and breakdown of transactions for a specific date. Returns total amount, transaction count, fees, and breakdown by direction (sent/received).',
    schema: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        transactions: z.array(z.any()),
        direction: z.enum(['SENT', 'RECEIVED']).optional(),
    }),
    execute: async (args: any) => {
        const { date, transactions, direction } = args;
        const filtered = (transactions as Transaction[]).filter(tx => {
            if (tx.date !== date) return false;
            if (direction && tx.direction !== direction) return false;
            return true;
        });

        const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
        const fees = filtered.reduce((sum, tx) => sum + (tx.fee + (tx.government_levy || 0)), 0);
        const sentTotal = filtered
            .filter(tx => tx.direction === 'SENT')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const receivedTotal = filtered
            .filter(tx => tx.direction === 'RECEIVED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        return {
            date,
            total,
            count: filtered.length,
            fees,
            breakdown: {
                sent: sentTotal,
                received: receivedTotal
            }
        };
    }
};

/**
 * Calculate transactions within a date range
 */
export const calculateTransactionsByDateRangeTool: Tool = {
    name: 'calculateTransactionsByDateRange',
    description: 'Calculate the total amount, count, and breakdown of transactions within a date range (inclusive). Returns summary statistics for the period.',
    schema: z.object({
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
        transactions: z.array(z.any()),
        type: z.string().optional().describe('Optional: Filter by transaction type (e.g., MONEY_TRANSFER, WITHDRAWAL, BILL_PAYMENT)'),
    }),
    execute: async (args: any) => {
        const { startDate, endDate, transactions, type } = args;
        const filtered = (transactions as Transaction[]).filter(tx => {
            if (tx.date < startDate || tx.date > endDate) return false;
            if (type && tx.type !== type) return false;
            return true;
        });

        const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
        const fees = filtered.reduce((sum, tx) => sum + (tx.fee + (tx.government_levy || 0)), 0);
        const sentTotal = filtered
            .filter(tx => tx.direction === 'SENT')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const receivedTotal = filtered
            .filter(tx => tx.direction === 'RECEIVED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        return {
            period: `${startDate} to ${endDate}`,
            total,
            count: filtered.length,
            fees,
            dailyAverage: filtered.length > 0 ? (total / filtered.length).toFixed(0) : 0,
            breakdown: {
                sent: sentTotal,
                received: receivedTotal,
                net: receivedTotal - sentTotal
            }
        };
    }
};

/**
 * Calculate transactions for the last N days
 */
export const calculateTransactionsByLastDaysTool: Tool = {
    name: 'calculateTransactionsByLastDays',
    description: 'Calculate the total amount, count, and breakdown of transactions for the last N days from today.',
    schema: z.object({
        days: z.number().int().positive().describe('Number of days to look back (e.g., 7 for last week, 30 for last month)'),
        transactions: z.array(z.any()),
    }),
    execute: async (args: any) => {
        const { days, transactions } = args;
        const today = new Date();
        const endDate = today.toISOString().split('T')[0];
        
        const startDateObj = new Date(today);
        startDateObj.setDate(startDateObj.getDate() - (days - 1));
        const startDate = startDateObj.toISOString().split('T')[0];

        const filtered = (transactions as Transaction[]).filter(tx => {
            if (tx.date < startDate || tx.date > endDate) return false;
            return true;
        });

        const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);
        const fees = filtered.reduce((sum, tx) => sum + (tx.fee + (tx.government_levy || 0)), 0);
        const sentTotal = filtered
            .filter(tx => tx.direction === 'SENT')
            .reduce((sum, tx) => sum + tx.amount, 0);
        const receivedTotal = filtered
            .filter(tx => tx.direction === 'RECEIVED')
            .reduce((sum, tx) => sum + tx.amount, 0);

        return {
            period: `Last ${days} days`,
            dateRange: `${startDate} to ${endDate}`,
            total,
            count: filtered.length,
            fees,
            dailyAverage: filtered.length > 0 ? (total / filtered.length).toFixed(2) : 0,
            breakdown: {
                sent: sentTotal,
                received: receivedTotal,
                net: receivedTotal - sentTotal
            }
        };
    }
};

/**
 * Get spending by transaction type
 */
export const getSpendingByTypeTool: Tool = {
    name: 'getSpendingByType',
    description: 'Analyze spending breakdown by transaction type. Returns total spending for each type found in the transactions.',
    schema: z.object({
        transactions: z.array(z.any()),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().describe('Optional: Start date in YYYY-MM-DD format'),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional().describe('Optional: End date in YYYY-MM-DD format'),
    }),
    execute: async (args: any) => {
        const { transactions, startDate, endDate } = args;
        
        let filtered = transactions as Transaction[];
        if (startDate && endDate) {
            filtered = filtered.filter(tx => tx.date >= startDate && tx.date <= endDate);
        }

        const byType: Record<string, number> = {};
        filtered.forEach(tx => {
            byType[tx.type] = (byType[tx.type] || 0) + tx.amount;
        });

        const sorted = Object.entries(byType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, amount]) => ({ type, amount }));

        return {
            summary: sorted,
            topType: sorted[0] || null,
            totalSpent: filtered.reduce((sum, tx) => sum + tx.amount, 0)
        };
    }
};

/**
 * Detect potential spending leaks
 */
export const detectSpendingLeaksTool: Tool = {
    name: 'detectSpendingLeaks',
    description: 'Identify potential spending leaks like high fees, frequent small transactions, or recurring patterns that could be reduced.',
    schema: z.object({
        transactions: z.array(z.any()),
        days: z.number().int().positive().optional().default(30).describe('Number of days to analyze (default: 30)'),
    }),
    execute: async (args: any) => {
        const { transactions, days = 30 } = args;
        
        const today = new Date();
        const startDateObj = new Date(today);
        startDateObj.setDate(startDateObj.getDate() - (days - 1));
        const startDate = startDateObj.toISOString().split('T')[0];

        const filtered = (transactions as Transaction[]).filter(tx => tx.date >= startDate);

        // High fees detection
        const totalFees = filtered.reduce((sum, tx) => sum + (tx.fee + (tx.government_levy || 0)), 0);
        const avgFee = filtered.length > 0 ? totalFees / filtered.length : 0;
        const highFeeTransactions = filtered.filter(tx => (tx.fee + (tx.government_levy || 0)) > avgFee * 2);

        // Frequent small transactions (potential consolidation opportunity)
        const smallTransactions = filtered.filter(tx => tx.amount < 5000 && tx.direction === 'SENT');

        // Recurring patterns (same counterparty, similar amounts)
        const counterpartyMap: Record<string, number[]> = {};
        filtered.forEach(tx => {
            if (tx.counterparty_name) {
                if (!counterpartyMap[tx.counterparty_name]) {
                    counterpartyMap[tx.counterparty_name] = [];
                }
                counterpartyMap[tx.counterparty_name].push(tx.amount);
            }
        });

        const recurringPatterns = Object.entries(counterpartyMap)
            .filter(([, amounts]) => amounts.length >= 3)
            .map(([counterparty, amounts]) => ({
                counterparty,
                frequency: amounts.length,
                avgAmount: (amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(0),
                totalAmount: amounts.reduce((a, b) => a + b, 0)
            }));

        return {
            leaks: {
                highFees: {
                    count: highFeeTransactions.length,
                    totalAmount: highFeeTransactions.reduce((sum, tx) => sum + (tx.fee + (tx.government_levy || 0)), 0)
                },
                smallTransactions: {
                    count: smallTransactions.length,
                    totalAmount: smallTransactions.reduce((sum, tx) => sum + tx.amount, 0),
                    suggestion: 'Consider consolidating multiple small transfers into fewer, larger transactions'
                },
                recurringPatterns
            },
            totalAnalyzed: filtered.length,
            periodDays: days
        };
    }
};

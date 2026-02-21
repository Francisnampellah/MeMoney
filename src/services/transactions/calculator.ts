import { Transaction, TransactionDirection, TransactionType } from '../sms/types';

export interface TransactionSumOptions {
    direction?: TransactionDirection;
    type?: TransactionType;
    excludeFees?: boolean;
}

export interface TransactionSumResult {
    total: number;
    count: number;
    fees: number;
    breakdown: {
        bySent: number;
        byReceived: number;
    };
}

/**
 * Calculate the sum of transactions for a specific date
 * @param transactions - Array of transactions to analyze
 * @param date - Target date in YYYY-MM-DD format
 * @param options - Optional filtering options
 * @returns Transaction sum result with total, count, and breakdown
 */
export function calculateTransactionsByDate(
    transactions: Transaction[],
    date: string,
    options?: TransactionSumOptions
): TransactionSumResult {
    const filtered = transactions.filter(tx => {
        if (tx.date !== date) return false;
        if (options?.direction && tx.direction !== options.direction) return false;
        if (options?.type && tx.type !== options.type) return false;
        return true;
    });

    return computeResult(filtered, options?.excludeFees);
}

/**
 * Calculate the sum of transactions within a date range
 * @param transactions - Array of transactions to analyze
 * @param startDate - Start date in YYYY-MM-DD format (inclusive)
 * @param endDate - End date in YYYY-MM-DD format (inclusive)
 * @param options - Optional filtering options
 * @returns Transaction sum result with total, count, and breakdown
 */
export function calculateTransactionsByDateRange(
    transactions: Transaction[],
    startDate: string,
    endDate: string,
    options?: TransactionSumOptions
): TransactionSumResult {
    const filtered = transactions.filter(tx => {
        if (tx.date < startDate || tx.date > endDate) return false;
        if (options?.direction && tx.direction !== options.direction) return false;
        if (options?.type && tx.type !== options.type) return false;
        return true;
    });

    return computeResult(filtered, options?.excludeFees);
}

/**
 * Calculate the sum of transactions for the current month
 * @param transactions - Array of transactions to analyze
 * @param year - Year (YYYY)
 * @param month - Month (1-12)
 * @param options - Optional filtering options
 * @returns Transaction sum result with total, count, and breakdown
 */
export function calculateTransactionsByMonth(
    transactions: Transaction[],
    year: number,
    month: number,
    options?: TransactionSumOptions
): TransactionSumResult {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return calculateTransactionsByDateRange(transactions, startDate, endDate, options);
}

/**
 * Calculate the sum of transactions for the last N days
 * @param transactions - Array of transactions to analyze
 * @param days - Number of days to go back from today
 * @param options - Optional filtering options
 * @returns Transaction sum result with total, count, and breakdown
 */
export function calculateTransactionsByLastDays(
    transactions: Transaction[],
    days: number,
    options?: TransactionSumOptions
): TransactionSumResult {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    
    const startDateObj = new Date(today);
    startDateObj.setDate(startDateObj.getDate() - (days - 1));
    const startDate = startDateObj.toISOString().split('T')[0];

    return calculateTransactionsByDateRange(transactions, startDate, endDate, options);
}

/**
 * Calculate the sum of transactions by transaction type
 * @param transactions - Array of transactions to analyze
 * @param type - Transaction type to filter by
 * @returns Transaction sum result with total, count, and breakdown
 */
export function calculateTransactionsByType(
    transactions: Transaction[],
    type: TransactionType,
    options?: Omit<TransactionSumOptions, 'type'>
): TransactionSumResult {
    const filtered = transactions.filter(tx => {
        if (tx.type !== type) return false;
        if (options?.direction && tx.direction !== options.direction) return false;
        return true;
    });

    return computeResult(filtered, options?.excludeFees);
}

/**
 * Get a summary of spending by transaction direction (SENT vs RECEIVED)
 * @param transactions - Array of transactions to analyze
 * @param options - Optional filtering options
 * @returns Breakdown of SENT and RECEIVED totals
 */
export function getTransactionDirectionBreakdown(
    transactions: Transaction[],
    dateFilter?: { startDate: string; endDate: string },
    typeFilter?: TransactionType
) {
    const filtered = transactions.filter(tx => {
        if (dateFilter && (tx.date < dateFilter.startDate || tx.date > dateFilter.endDate)) {
            return false;
        }
        if (typeFilter && tx.type !== typeFilter) return false;
        return true;
    });

    const sent = filtered
        .filter(tx => tx.direction === 'SENT')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const received = filtered
        .filter(tx => tx.direction === 'RECEIVED')
        .reduce((sum, tx) => sum + tx.amount, 0);

    return {
        sent,
        received,
        net: received - sent,
    };
}

/**
 * Helper function to compute transaction result
 */
function computeResult(
    transactions: Transaction[],
    excludeFees?: boolean
): TransactionSumResult {
    let total = 0;
    let totalFees = 0;
    let sentTotal = 0;
    let receivedTotal = 0;

    transactions.forEach(tx => {
        total += tx.amount;
        totalFees += tx.fee + (tx.government_levy || 0);
        
        if (tx.direction === 'SENT') {
            sentTotal += tx.amount;
        } else {
            receivedTotal += tx.amount;
        }
    });

    return {
        total: excludeFees ? total - totalFees : total,
        count: transactions.length,
        fees: totalFees,
        breakdown: {
            bySent: sentTotal,
            byReceived: receivedTotal,
        },
    };
}

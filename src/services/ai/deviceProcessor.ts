/**
 * Device-Side Transaction Processor
 * 
 * All transaction analysis and processing happens on the device.
 * Model only receives summarized results, never raw transaction data.
 */

import { Transaction } from '../sms/types';

/**
 * Comprehensive transaction analysis results
 */
export interface TransactionAnalysis {
  summary: {
    totalTransactions: number;
    dateRange: {
      earliest: string;
      latest: string;
    };
    totalIncome: number;
    totalExpense: number;
    netFlow: number;
    currentBalance: number;
    currency: string;
  };
  byDirection: {
    sent: {
      total: number;
      count: number;
      average: number;
    };
    received: {
      total: number;
      count: number;
      average: number;
    };
  };
  byType: Record<
    string,
    {
      total: number;
      count: number;
      average: number;
    }
  >;
  topCounterparties: Array<{
    name: string;
    total: number;
    count: number;
    lastSeen: string;
  }>;
  fees: {
    totalFees: number;
    totalLevies: number;
    averageFeePerTransaction: number;
    highestFee: number;
  };
  recentTrend: {
    lastDaySpending: number;
    last7DaysSpending: number;
    last30DaysSpending: number;
    dailyAverageLastMonth: number;
  };
}

/**
 * Device-side transaction processor
 */
export class DeviceTransactionProcessor {
  private transactions: Transaction[];

  constructor(transactions: Transaction[]) {
    this.transactions = transactions;
  }

  /**
   * Get comprehensive analysis of all transactions
   * PROCESSES ENTIRELY ON DEVICE
   */
  analyzeAll(): TransactionAnalysis {
    const analysis: TransactionAnalysis = {
      summary: this.calculateSummary(),
      byDirection: this.analyzeByDirection(),
      byType: this.analyzeByType(),
      topCounterparties: this.getTopCounterparties(),
      fees: this.analyzeFees(),
      recentTrend: this.analyzeRecentTrends(),
    };

    return analysis;
  }

  /**
   * Get spending for a specific date
   */
  getSpendingForDate(date: string): {
    date: string;
    totalSent: number;
    totalReceived: number;
    netSpending: number;
    transactionCount: number;
    fees: number;
  } {
    const dayTransactions = this.transactions.filter((tx) => tx.date === date);

    const totalSent = dayTransactions
      .filter((tx) => tx.direction === 'SENT')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalReceived = dayTransactions
      .filter((tx) => tx.direction === 'RECEIVED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalFees = dayTransactions.reduce(
      (sum, tx) => sum + (tx.fee + (tx.government_levy || 0)),
      0
    );

    return {
      date,
      totalSent,
      totalReceived,
      netSpending: totalSent - totalReceived,
      transactionCount: dayTransactions.length,
      fees: totalFees,
    };
  }

  /**
   * Get spending for a date range
   */
  getSpendingForDateRange(startDate: string, endDate: string): {
    period: string;
    totalSent: number;
    totalReceived: number;
    netSpending: number;
    transactionCount: number;
    fees: number;
    dailyBreakdown: Record<string, number>;
    averageDailySpending: number;
    topSpendingDay: { date: string; spending: number };
  } {
    const filtered = this.transactions.filter(
      (tx) => tx.date >= startDate && tx.date <= endDate
    );

    const totalSent = filtered
      .filter((tx) => tx.direction === 'SENT')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalReceived = filtered
      .filter((tx) => tx.direction === 'RECEIVED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalFees = filtered.reduce(
      (sum, tx) => sum + (tx.fee + (tx.government_levy || 0)),
      0
    );

    // Daily breakdown
    const dailyBreakdown: Record<string, number> = {};
    filtered.forEach((tx) => {
      if (tx.direction === 'SENT') {
        dailyBreakdown[tx.date] = (dailyBreakdown[tx.date] || 0) + tx.amount;
      }
    });

    // Find top spending day
    const topSpendingDay = Object.entries(dailyBreakdown).reduce(
      (max, [date, spending]) => (spending > max.spending ? { date, spending } : max),
      { date: startDate, spending: 0 }
    );

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return {
      period: `${startDate} to ${endDate}`,
      totalSent,
      totalReceived,
      netSpending: totalSent - totalReceived,
      transactionCount: filtered.length,
      fees: totalFees,
      dailyBreakdown,
      averageDailySpending: totalSent / daysDiff,
      topSpendingDay,
    };
  }

  /**
   * Get spending for last N days
   */
  getSpendingForLastDays(days: number): {
    period: string;
    dateRange: { start: string; end: string };
    totalSent: number;
    totalReceived: number;
    netSpending: number;
    transactionCount: number;
    fees: number;
    dailyAverage: number;
    topSpendingDay: { date: string; spending: number };
  } {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().split('T')[0];

    const result = this.getSpendingForDateRange(startDateStr, endDate);

    return {
      period: `Last ${days} days`,
      dateRange: { start: startDateStr, end: endDate },
      totalSent: result.totalSent,
      totalReceived: result.totalReceived,
      netSpending: result.netSpending,
      transactionCount: result.transactionCount,
      fees: result.fees,
      dailyAverage: result.averageDailySpending,
      topSpendingDay: result.topSpendingDay,
    };
  }

  /**
   * Analyze spending by transaction type
   */
  analyzeSpendingByType(startDate?: string, endDate?: string): {
    types: Array<{
      type: string;
      totalSent: number;
      totalReceived: number;
      count: number;
      averageAmount: number;
      percentOfTotal: number;
    }>;
    topType: {
      type: string;
      amount: number;
    } | null;
  } {
    let filtered = this.transactions;

    if (startDate && endDate) {
      filtered = filtered.filter(
        (tx) => tx.date >= startDate && tx.date <= endDate
      );
    }

    const byType: Record<
      string,
      {
        sent: number;
        received: number;
        count: number;
      }
    > = {};

    filtered.forEach((tx) => {
      if (!byType[tx.type]) {
        byType[tx.type] = { sent: 0, received: 0, count: 0 };
      }

      if (tx.direction === 'SENT') {
        byType[tx.type].sent += tx.amount;
      } else {
        byType[tx.type].received += tx.amount;
      }
      byType[tx.type].count += 1;
    });

    const totalSpent = filtered
      .filter((tx) => tx.direction === 'SENT')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const types = Object.entries(byType)
      .map(([type, data]) => ({
        type,
        totalSent: data.sent,
        totalReceived: data.received,
        count: data.count,
        averageAmount: (data.sent + data.received) / data.count,
        percentOfTotal: totalSpent > 0 ? (data.sent / totalSpent) * 100 : 0,
      }))
      .sort((a, b) => b.totalSent - a.totalSent);

    return {
      types,
      topType: types.length > 0 ? { type: types[0].type, amount: types[0].totalSent } : null,
    };
  }

  /**
   * Detect spending leaks (high fees, frequent small transactions, etc.)
   */
  detectSpendingLeaks(days: number = 30): {
    highFees: {
      totalFees: number;
      percentOfSpending: number;
      highestSingleFee: number;
      flagged: boolean;
      recommendation: string;
    };
    frequentSmallTransactions: {
      count: number;
      totalAmount: number;
      wasted: number;
      flagged: boolean;
      recommendation: string;
    };
    recurringPatterns: Array<{
      counterparty: string;
      frequency: number;
      totalAmount: number;
      averageAmount: number;
      recommendation: string;
    }>;
    overallRiskScore: number; // 0-100
  } {
    const recentTxs = this.getSpendingForLastDays(days);

    // Analyze fees
    const totalSpending = recentTxs.totalSent;
    const feePercentage = totalSpending > 0 ? (recentTxs.fees / totalSpending) * 100 : 0;
    const highFeeFlagged = feePercentage > 5; // 5% is high

    // Analyze small transactions (transactions < 1000)
    const lastDaysTxs = this.transactions.slice(0, 30 * 3); // ~3 per day
    const smallTxs = lastDaysTxs.filter(
      (tx) => tx.direction === 'SENT' && tx.amount < 1000
    );
    const smallTxTotal = smallTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const smallTxWasted = smallTxTotal * 0.1; // Assume 10% could be optimized
    const smallTxFlagged = smallTxs.length > lastDaysTxs.length * 0.3;

    // Find recurring patterns
    const counterpartyMap: Record<
      string,
      {
        count: number;
        total: number;
        transactions: Transaction[];
      }
    > = {};

    lastDaysTxs
      .filter((tx) => tx.direction === 'SENT' && tx.counterparty_name)
      .forEach((tx) => {
        const name = tx.counterparty_name || 'Unknown';
        if (!counterpartyMap[name]) {
          counterpartyMap[name] = {
            count: 0,
            total: 0,
            transactions: [],
          };
        }
        counterpartyMap[name].count += 1;
        counterpartyMap[name].total += tx.amount;
        counterpartyMap[name].transactions.push(tx);
      });

    const recurring = Object.entries(counterpartyMap)
      .filter(([, data]) => data.count >= 3) // At least 3 transactions
      .map(([counterparty, data]) => ({
        counterparty,
        frequency: data.count,
        totalAmount: data.total,
        averageAmount: data.total / data.count,
        recommendation:
          data.count >= 5
            ? `Consider setting up automatic payment for ${counterparty} - saves time and may reduce fees`
            : `Frequent payments to ${counterparty} - look for bulk discounts`,
      }))
      .sort((a, b) => b.frequency - a.frequency);

    // Calculate overall risk score
    let riskScore = 0;
    if (highFeeFlagged) riskScore += 30;
    if (smallTxFlagged) riskScore += 25;
    if (recurring.length > 3) riskScore += 20;
    if (feePercentage > 10) riskScore += 25;

    return {
      highFees: {
        totalFees: recentTxs.fees,
        percentOfSpending: feePercentage,
        highestSingleFee: Math.max(
          ...this.transactions.map((tx) => tx.fee + (tx.government_levy || 0))
        ),
        flagged: highFeeFlagged,
        recommendation: highFeeFlagged
          ? `High fees: ${feePercentage.toFixed(2)}% of spending. Consider using M-Pesa agent for bulk transfers.`
          : 'Fees are within normal range.',
      },
      frequentSmallTransactions: {
        count: smallTxs.length,
        totalAmount: smallTxTotal,
        wasted: smallTxWasted,
        flagged: smallTxFlagged,
        recommendation: smallTxFlagged
          ? `High frequency small transactions detected. Consolidate purchases to save ${smallTxWasted.toFixed(0)} TSh`
          : 'Small transaction frequency is healthy.',
      },
      recurringPatterns: recurring,
      overallRiskScore: Math.min(100, riskScore),
    };
  }

  /**
   * Get period comparison (e.g., last month vs previous month)
   */
  comparePeriods(
    startDate1: string,
    endDate1: string,
    startDate2: string,
    endDate2: string
  ): {
    period1: { spending: number; count: number };
    period2: { spending: number; count: number };
    difference: number;
    percentChange: number;
    trend: 'up' | 'down' | 'stable';
  } {
    const result1 = this.getSpendingForDateRange(startDate1, endDate1);
    const result2 = this.getSpendingForDateRange(startDate2, endDate2);

    const diff = result1.totalSent - result2.totalSent;
    const percentChange =
      result2.totalSent > 0
        ? ((result1.totalSent - result2.totalSent) / result2.totalSent) * 100
        : 0;

    return {
      period1: {
        spending: result1.totalSent,
        count: result1.transactionCount,
      },
      period2: {
        spending: result2.totalSent,
        count: result2.transactionCount,
      },
      difference: diff,
      percentChange,
      trend: diff > 100 ? 'up' : diff < -100 ? 'down' : 'stable',
    };
  }

  // Private helper methods

  private calculateSummary() {
    const totalIncome = this.transactions
      .filter((tx) => tx.direction === 'RECEIVED')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = this.transactions
      .filter((tx) => tx.direction === 'SENT')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const dates = this.transactions.map((tx) => tx.date).sort();

    return {
      totalTransactions: this.transactions.length,
      dateRange: {
        earliest: dates[0] || 'N/A',
        latest: dates[dates.length - 1] || 'N/A',
      },
      totalIncome,
      totalExpense,
      netFlow: totalIncome - totalExpense,
      currentBalance: this.transactions[0]?.balance_after ?? 0,
      currency: this.transactions[0]?.currency ?? 'TSh',
    };
  }

  private analyzeByDirection() {
    const sent = this.transactions.filter((tx) => tx.direction === 'SENT');
    const received = this.transactions.filter((tx) => tx.direction === 'RECEIVED');

    const sentTotal = sent.reduce((sum, tx) => sum + tx.amount, 0);
    const receivedTotal = received.reduce((sum, tx) => sum + tx.amount, 0);

    return {
      sent: {
        total: sentTotal,
        count: sent.length,
        average: sent.length > 0 ? sentTotal / sent.length : 0,
      },
      received: {
        total: receivedTotal,
        count: received.length,
        average: received.length > 0 ? receivedTotal / received.length : 0,
      },
    };
  }

  private analyzeByType() {
    const byType: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    this.transactions.forEach((tx) => {
      if (!byType[tx.type]) {
        byType[tx.type] = { total: 0, count: 0 };
      }
      byType[tx.type].total += tx.amount;
      byType[tx.type].count += 1;
    });

    const result: Record<
      string,
      {
        total: number;
        count: number;
        average: number;
      }
    > = {};

    Object.entries(byType).forEach(([type, data]) => {
      result[type] = {
        ...data,
        average: data.total / data.count,
      };
    });

    return result;
  }

  private getTopCounterparties() {
    const counterpartyMap: Record<
      string,
      {
        total: number;
        count: number;
        lastSeen: string;
      }
    > = {};

    this.transactions.forEach((tx) => {
      const name = tx.counterparty_name || 'Unknown';
      if (!counterpartyMap[name]) {
        counterpartyMap[name] = {
          total: 0,
          count: 0,
          lastSeen: tx.date,
        };
      }
      counterpartyMap[name].total += tx.amount;
      counterpartyMap[name].count += 1;
      counterpartyMap[name].lastSeen = tx.date;
    });

    return Object.entries(counterpartyMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        lastSeen: data.lastSeen,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }

  private analyzeFees() {
    const totalFees = this.transactions.reduce((sum, tx) => sum + tx.fee, 0);
    const totalLevies = this.transactions.reduce((sum, tx) => sum + (tx.government_levy || 0), 0);
    const highestFee = Math.max(
      ...this.transactions.map((tx) => tx.fee + (tx.government_levy || 0))
    );

    return {
      totalFees,
      totalLevies,
      averageFeePerTransaction:
        this.transactions.length > 0
          ? (totalFees + totalLevies) / this.transactions.length
          : 0,
      highestFee,
    };
  }

  private analyzeRecentTrends() {
    return {
      lastDaySpending: this.getSpendingForLastDays(1).totalSent,
      last7DaysSpending: this.getSpendingForLastDays(7).totalSent,
      last30DaysSpending: this.getSpendingForLastDays(30).totalSent,
      dailyAverageLastMonth: this.getSpendingForLastDays(30).dailyAverage,
    };
  }
}

/**
 * Create a processor with transactions
 */
export function createProcessor(transactions: Transaction[]): DeviceTransactionProcessor {
  return new DeviceTransactionProcessor(transactions);
}

/**
 * Transaction fixtures for comprehensive AI evaluation testing
 * Includes ~100 transactions across different dates, types, and amounts
 */

import { Transaction } from '../../sms/types';

export const generateTestTransactions = (daysBack: number = 60): Transaction[] => {
  const transactions: Transaction[] = [];
  const today = new Date();
  const types = ['MONEY_TRANSFER', 'WITHDRAWAL', 'DEPOSIT', 'BILL_PAYMENT', 'AIRTIME'];
  const counterparties = [
    'John Doe',
    'Sarah Smith',
    'M-Pesa Shop',
    'Utility Company',
    'Safaricom',
    'Restaurant XYZ',
    'Grocery Store',
    'Taxi',
    'Cinema',
    'Online Store',
    'Landlord',
    'Insurance',
  ];

  let balance = 150000; // Starting balance

  // Generate transactions for the past N days
  for (let i = 0; i < daysBack; i++) {
    const transactionDate = new Date(today);
    transactionDate.setDate(transactionDate.getDate() - i);
    const date = transactionDate.toISOString().split('T')[0];

    // 1-4 transactions per day
    const txsPerDay = Math.floor(Math.random() * 4) + 1;

    for (let j = 0; j < txsPerDay; j++) {
      const direction = Math.random() > 0.7 ? 'RECEIVED' : 'SENT';
      const amount = Math.floor(Math.random() * 10000) + 500; // 500-10500
      const fee = direction === 'SENT' ? Math.floor(Math.random() * 200) + 10 : 0;
      const governmentLevy = direction === 'SENT' ? Math.floor(Math.random() * 50) : 0;
      const type = types[Math.floor(Math.random() * types.length)];
      const counterparty = counterparties[Math.floor(Math.random() * counterparties.length)];

      if (direction === 'SENT') {
        balance -= amount + fee + governmentLevy;
      } else {
        balance += amount;
      }

      transactions.push({
        transaction_id: `TX${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        date,
        time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
        type,
        direction,
        amount,
        counterparty_name: counterparty,
        fee,
        government_levy: governmentLevy,
        balance_after: balance,
        currency: 'TSh',
        status: 'COMPLETED',
      } as Transaction);
    }
  }

  return transactions.reverse(); // Newest first
};

/**
 * Curated test transactions for specific scenarios
 */
export const scenarioTransactions = {
  /**
   * High-spending month with clear patterns
   */
  highSpender: (): Transaction[] => {
    const transactions: Transaction[] = [];
    const baseDate = new Date('2026-01-01');

    // Daily spending patterns
    const patterns = [
      { amount: 2000, desc: 'Coffee', type: 'MONEY_TRANSFER' }, // Recurring
      { amount: 15000, desc: 'Lunch', type: 'MONEY_TRANSFER' }, // Daily
      { amount: 3000, desc: 'Snacks', type: 'MONEY_TRANSFER' }, // Random
      { amount: 50000, desc: 'Rent', type: 'MONEY_TRANSFER' }, // Once a week
      { amount: 5000, desc: 'Groceries', type: 'MONEY_TRANSFER' },
      { amount: 1000, desc: 'Airtime', type: 'AIRTIME' },
      { amount: 100000, desc: 'Salary', type: 'DEPOSIT' },
    ];

    let balance = 200000;
    let transactionCount = 0;

    for (let day = 0; day < 31; day++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      const dailyTxs = Math.random() > 0.5 ? 3 : 2;

      for (let i = 0; i < dailyTxs; i++) {
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        const direction = pattern.desc === 'Salary' ? 'RECEIVED' : 'SENT';
        const fee = direction === 'SENT' ? Math.floor(Math.random() * 200) + 10 : 0;
        const governmentLevy = direction === 'SENT' ? 50 : 0;

        if (direction === 'SENT') {
          balance -= pattern.amount + fee + governmentLevy;
        } else {
          balance += pattern.amount;
        }

        transactions.push({
          transaction_id: `TX_HS_${transactionCount++}`,
          date: dateStr,
          time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          type: pattern.type,
          direction,
          amount: pattern.amount,
          counterparty_name: pattern.desc,
          fee,
          government_levy: governmentLevy,
          balance_after: balance,
          currency: 'TSh',
          status: 'COMPLETED',
        } as Transaction);
      }
    }

    return transactions.reverse();
  },

  /**
   * Week with high fees (spending leak scenario)
   */
  highFees: (): Transaction[] => {
    const transactions: Transaction[] = [];
    const baseDate = new Date('2026-02-01');
    let balance = 100000;

    for (let i = 0; i < 20; i++) {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const amount = Math.random() > 0.5 ? 5000 : 20000;
      const highFee = Math.floor(Math.random() * 300) + 100; // High fees
      balance -= amount + highFee;

      transactions.push({
        transaction_id: `TX_HF_${i}`,
        date: dateStr,
        time: '14:30',
        type: 'MONEY_TRANSFER',
        direction: 'SENT',
        amount,
        counterparty_name: `Recipient ${i}`,
        fee: highFee,
        government_levy: 50,
        balance_after: balance,
        currency: 'TSh',
        status: 'COMPLETED',
      } as Transaction);
    }

    return transactions.reverse();
  },

  /**
   * Date range scenario (Jan 15-31, 2026)
   */
  dateRangeScenario: (): Transaction[] => {
    const transactions: Transaction[] = [];
    const startDate = new Date('2026-01-15');
    const endDate = new Date('2026-01-31');
    let balance = 75000;
    let id = 0;

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      const txCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < txCount; i++) {
        const direction = Math.random() > 0.8 ? 'RECEIVED' : 'SENT';
        const amount = Math.floor(Math.random() * 8000) + 1000;
        const fee = direction === 'SENT' ? 50 : 0;

        if (direction === 'SENT') {
          balance -= amount + fee;
        } else {
          balance += amount;
        }

        transactions.push({
          transaction_id: `TX_DR_${id++}`,
          date: dateStr,
          time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          type: ['MONEY_TRANSFER', 'WITHDRAWAL', 'BILL_PAYMENT'][Math.floor(Math.random() * 3)],
          direction,
          amount,
          counterparty_name: `Entity ${id}`,
          fee,
          government_levy: 0,
          balance_after: balance,
          currency: 'TSh',
          status: 'COMPLETED',
        } as Transaction);
      }
    }

    return transactions.reverse();
  },
};

/**
 * Export a comprehensive transaction set for general testing
 */
export const comprehensiveTransactions = generateTestTransactions(60);

import { Transaction } from '../../shared/types';
import { AddTransactionPayload } from './types';

export const transactionService = {
  addTransaction: async (payload: AddTransactionPayload): Promise<Transaction> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: Date.now().toString(),
          ...payload,
          date: new Date(),
        });
      }, 500);
    });
  },

  getTransactions: async (): Promise<Transaction[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  },
};

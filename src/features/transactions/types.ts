import { Transaction } from '../../shared/types';

export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export interface AddTransactionPayload {
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
}

/**
 * M-Pesa SMS Parser Types
 */

export type TransactionStatus = 'Confirmed' | 'Failed' | 'Unknown';

export type TransactionDirection = 'SENT' | 'RECEIVED';

export type TransactionType =
  | 'MONEY_TRANSFER'
  | 'WITHDRAWAL'
  | 'BILL_PAYMENT'
  | 'UTILITY_PAYMENT'
  | 'LOAN'
  | 'LOAN_REPAYMENT'
  | 'SAVINGS_WITHDRAWAL'
  | 'SAVINGS_DEPOSIT'
  | 'AIRTIME'
  | 'BUNDLES'
  | 'INSURANCE'
  | 'BETTING'
  | 'BALANCE_CHECK'
  | 'OTHER'
  | 'UNKNOWN';

export type Channel = 'M-PESA' | 'VISA' | 'BANK' | 'AGENT' | 'BUSINESS';

export interface ParsedTransaction {
  transaction_id: string | null;
  status: TransactionStatus;
  direction: TransactionDirection;
  type: TransactionType;
  amount: number;
  currency: 'Tsh';
  fee: number;
  government_levy: number;
  counterparty_name: string | null;
  counterparty_account: string | null;
  channel: Channel;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:MM:SS
  timestamp: number;
  balance_after: number | null;
  raw_text: string;
}

export type Transaction = ParsedTransaction;


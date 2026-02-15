export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
};

export type SmsMessage = {
  id: string;
  address: string;
  body: string;
  date: number;
  type: number;
};

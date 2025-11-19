export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
}

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  transactions: Transaction[];
}

export const CATEGORIES = {
  income: ['Gaji', 'Bonus', 'Investasi', 'Lainnya'],
  expense: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']
};
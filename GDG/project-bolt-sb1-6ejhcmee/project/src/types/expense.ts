export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  created_at: string;
}

export interface ExpenseInput {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Other',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

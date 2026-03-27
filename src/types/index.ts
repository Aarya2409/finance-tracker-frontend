export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type Category = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export type Transaction = {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  date: string;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export type TransactionFilters = {
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export type Stats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export type PaginatedTransactions = {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
}
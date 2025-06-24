export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon?: string;
}

export interface AppSettings {
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
}

export interface AppData {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  version: string;
  lastUpdated: string;
}

export interface MonthlyStats {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryStats {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DashboardData {
  currentMonthIncome: number;
  currentMonthExpense: number;
  currentMonthBalance: number;
  recentTransactions: Transaction[];
  monthlyStats: MonthlyStats[];
  categoryStats: CategoryStats[];
}

export type TransactionFilters = {
  dateFrom?: string;
  dateTo?: string;
  type?: 'income' | 'expense' | 'all';
  category?: string;
  amountMin?: number;
  amountMax?: number;
  description?: string;
};

export type SortField = 'date' | 'amount' | 'category' | 'description';
export type SortOrder = 'asc' | 'desc';
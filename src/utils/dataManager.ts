import { 
  Transaction, 
  Category, 
  AppData, 
  MonthlyStats, 
  CategoryStats, 
  DashboardData,
  TransactionFilters,
  SortField,
  SortOrder
} from '../types';

export class DataManager {
  // 新しいIDを生成
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 取引を追加
  static addTransaction(data: AppData, transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): AppData {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    };

    return {
      ...data,
      transactions: [newTransaction, ...data.transactions],
      lastUpdated: now,
    };
  }

  // 取引を更新
  static updateTransaction(data: AppData, id: string, updates: Partial<Transaction>): AppData {
    const transactions = data.transactions.map(transaction => 
      transaction.id === id 
        ? { ...transaction, ...updates, updatedAt: new Date().toISOString() }
        : transaction
    );

    return {
      ...data,
      transactions,
      lastUpdated: new Date().toISOString(),
    };
  }

  // 取引を削除
  static deleteTransaction(data: AppData, id: string): AppData {
    const transactions = data.transactions.filter(transaction => transaction.id !== id);

    return {
      ...data,
      transactions,
      lastUpdated: new Date().toISOString(),
    };
  }

  // カテゴリを追加
  static addCategory(data: AppData, category: Omit<Category, 'id'>): AppData {
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
    };

    return {
      ...data,
      categories: [...data.categories, newCategory],
      lastUpdated: new Date().toISOString(),
    };
  }

  // カテゴリを更新
  static updateCategory(data: AppData, id: string, updates: Partial<Category>): AppData {
    const categories = data.categories.map(category =>
      category.id === id ? { ...category, ...updates } : category
    );

    return {
      ...data,
      categories,
      lastUpdated: new Date().toISOString(),
    };
  }

  // カテゴリを削除
  static deleteCategory(data: AppData, id: string): AppData {
    const categories = data.categories.filter(category => category.id !== id);

    return {
      ...data,
      categories,
      lastUpdated: new Date().toISOString(),
    };
  }

  // 取引をフィルタリング
  static filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
    return transactions.filter(transaction => {
      if (filters.dateFrom && transaction.date < filters.dateFrom) return false;
      if (filters.dateTo && transaction.date > filters.dateTo) return false;
      if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) return false;
      if (filters.category && transaction.category !== filters.category) return false;
      if (filters.amountMin !== undefined && transaction.amount < filters.amountMin) return false;
      if (filters.amountMax !== undefined && transaction.amount > filters.amountMax) return false;
      if (filters.description && !transaction.description.toLowerCase().includes(filters.description.toLowerCase())) return false;
      
      return true;
    });
  }

  // 取引をソート
  static sortTransactions(transactions: Transaction[], field: SortField, order: SortOrder): Transaction[] {
    return [...transactions].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (field) {
        case 'date':
          aValue = a.date;
          bValue = b.date;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return order === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }

  // 月別統計を取得
  static getMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    transactions.forEach(transaction => {
      const month = transaction.date.slice(0, 7); // YYYY-MM
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }

      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  // カテゴリ別統計を取得
  static getCategoryStats(transactions: Transaction[], categories: Category[], type: 'income' | 'expense'): CategoryStats[] {
    const categoryTotals: Record<string, number> = {};
    const typeTransactions = transactions.filter(t => t.type === type);
    const totalAmount = typeTransactions.reduce((sum, t) => sum + t.amount, 0);

    typeTransactions.forEach(transaction => {
      categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
    });

    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => {
        const category = categories.find(c => c.id === categoryId);
        return {
          categoryId,
          categoryName: category?.name || 'Unknown',
          amount,
          percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
          color: category?.color || '#6b7280',
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }

  // ダッシュボードデータを取得
  static getDashboardData(data: AppData): DashboardData {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthTransactions = data.transactions.filter(t => t.date.startsWith(currentMonth));
    
    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentMonthExpense = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = [...data.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const monthlyStats = this.getMonthlyStats(data.transactions);
    const categoryStats = this.getCategoryStats(currentMonthTransactions, data.categories, 'expense');

    return {
      currentMonthIncome,
      currentMonthExpense,
      currentMonthBalance: currentMonthIncome - currentMonthExpense,
      recentTransactions,
      monthlyStats,
      categoryStats,
    };
  }

  // 金額をフォーマット
  static formatAmount(amount: number, currency: string = '¥'): string {
    return `${currency}${amount.toLocaleString()}`;
  }

  // 日付をフォーマット
  static formatDate(date: string, format: string = 'YYYY-MM-DD'): string {
    const d = new Date(date);
    
    switch (format) {
      case 'YYYY-MM-DD':
        return date;
      case 'MM/DD':
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
      case 'MM/DD/YYYY':
        return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear()}`;
      default:
        return date;
    }
  }

  // バリデーション
  static validateTransaction(transaction: Partial<Transaction>): string[] {
    const errors: string[] = [];

    if (!transaction.date) errors.push('日付は必須です');
    if (!transaction.type) errors.push('種類は必須です');
    if (!transaction.amount || transaction.amount <= 0) errors.push('金額は正の数値である必要があります');
    if (!transaction.category) errors.push('カテゴリは必須です');

    return errors;
  }

  static validateCategory(category: Partial<Category>): string[] {
    const errors: string[] = [];

    if (!category.name) errors.push('カテゴリ名は必須です');
    if (!category.type) errors.push('種類は必須です');
    if (!category.color) errors.push('色は必須です');

    return errors;
  }

  // データのエクスポート
  static exportData(data: AppData, format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    if (format === 'csv') {
      const headers = ['日付', '種類', '金額', 'カテゴリ', '説明'];
      const rows = data.transactions.map(t => [
        t.date,
        t.type === 'income' ? '収入' : '支出',
        t.amount.toString(),
        data.categories.find(c => c.id === t.category)?.name || '',
        t.description
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return '';
  }

  // データのインポート
  static importData(jsonString: string): AppData {
    try {
      const data = JSON.parse(jsonString) as AppData;
      
      // 基本的なバリデーション
      if (!data.transactions || !Array.isArray(data.transactions)) {
        throw new Error('Invalid transactions data');
      }
      if (!data.categories || !Array.isArray(data.categories)) {
        throw new Error('Invalid categories data');
      }
      
      return data;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }
}
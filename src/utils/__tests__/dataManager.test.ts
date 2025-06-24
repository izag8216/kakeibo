import { describe, it, expect, beforeEach } from 'vitest'
import { DataManager } from '../dataManager'
import { AppData, Transaction, Category } from '../../types'

describe('DataManager - 取引関連機能', () => {
  let mockData: AppData
  let mockTransaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  let mockCategories: Category[]

  beforeEach(() => {
    mockCategories = [
      {
        id: 'income-salary',
        name: '給与',
        type: 'income',
        color: '#10b981'
      },
      {
        id: 'expense-food',
        name: '食費',
        type: 'expense',
        color: '#ef4444'
      },
      {
        id: 'expense-transport',
        name: '交通費',
        type: 'expense',
        color: '#f97316'
      }
    ]

    mockData = {
      transactions: [],
      categories: mockCategories,
      settings: {
        currency: '¥',
        dateFormat: 'YYYY-MM-DD',
        theme: 'light'
      },
      version: '1.0.0',
      lastUpdated: '2025-06-24T10:00:00Z'
    }

    mockTransaction = {
      date: '2025-06-24',
      type: 'expense',
      amount: 1500,
      category: 'expense-food',
      description: 'ランチ代'
    }
  })

  describe('generateId()', () => {
    it('ユニークなIDを生成する', () => {
      const id1 = DataManager.generateId()
      const id2 = DataManager.generateId()
      
      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
    })
  })

  describe('addTransaction()', () => {
    it('新しい取引を追加する', () => {
      const result = DataManager.addTransaction(mockData, mockTransaction)

      expect(result.transactions).toHaveLength(1)
      
      const addedTransaction = result.transactions[0]
      expect(addedTransaction.id).toBeTruthy()
      expect(addedTransaction.date).toBe('2025-06-24')
      expect(addedTransaction.type).toBe('expense')
      expect(addedTransaction.amount).toBe(1500)
      expect(addedTransaction.category).toBe('expense-food')
      expect(addedTransaction.description).toBe('ランチ代')
      expect(addedTransaction.createdAt).toBeTruthy()
      expect(addedTransaction.updatedAt).toBeTruthy()
    })

    it('新しい取引が配列の先頭に追加される', () => {
      // 最初の取引を追加
      let result = DataManager.addTransaction(mockData, mockTransaction)
      
      // 2番目の取引を追加
      const secondTransaction = {
        ...mockTransaction,
        amount: 2000,
        description: 'ディナー代'
      }
      result = DataManager.addTransaction(result, secondTransaction)

      expect(result.transactions).toHaveLength(2)
      expect(result.transactions[0].amount).toBe(2000) // 新しい取引が先頭
      expect(result.transactions[1].amount).toBe(1500) // 古い取引が後
    })

    it('lastUpdatedが更新される', () => {
      const originalLastUpdated = mockData.lastUpdated
      // 少し時間を置いてから実行
      const result = DataManager.addTransaction(mockData, mockTransaction)

      expect(result.lastUpdated).not.toBe(originalLastUpdated)
      // タイムスタンプが現在時刻に近いことを確認
      const now = new Date().getTime()
      const resultTime = new Date(result.lastUpdated).getTime()
      expect(Math.abs(now - resultTime)).toBeLessThan(1000) // 1秒以内
    })

    it('元のデータが変更されない（イミュータブル）', () => {
      const originalTransactionsLength = mockData.transactions.length
      DataManager.addTransaction(mockData, mockTransaction)

      expect(mockData.transactions).toHaveLength(originalTransactionsLength)
    })
  })

  describe('updateTransaction()', () => {
    it('既存の取引を更新する', () => {
      // まず取引を追加
      let result = DataManager.addTransaction(mockData, mockTransaction)
      const transactionId = result.transactions[0].id

      // 取引を更新
      const updates = {
        amount: 2000,
        description: '更新されたランチ代'
      }
      result = DataManager.updateTransaction(result, transactionId, updates)

      const updatedTransaction = result.transactions[0]
      expect(updatedTransaction.amount).toBe(2000)
      expect(updatedTransaction.description).toBe('更新されたランチ代')
      expect(updatedTransaction.date).toBe('2025-06-24') // 更新されていない項目は維持
      expect(updatedTransaction.updatedAt).toBeTruthy()
    })

    it('存在しないIDで更新しても変更されない', () => {
      const result = DataManager.addTransaction(mockData, mockTransaction)
      const originalTransactions = [...result.transactions]

      const updatedResult = DataManager.updateTransaction(result, 'non-existent-id', {
        amount: 9999
      })

      expect(updatedResult.transactions).toEqual(originalTransactions)
    })

    it('updatedAtが更新される', async () => {
      let result = DataManager.addTransaction(mockData, mockTransaction)
      const transactionId = result.transactions[0].id
      const originalUpdatedAt = result.transactions[0].updatedAt

      // 少し待ってから更新（異なる時刻を確保）
      await new Promise(resolve => setTimeout(resolve, 1))
      result = DataManager.updateTransaction(result, transactionId, { amount: 2000 })

      expect(result.transactions[0].updatedAt).not.toBe(originalUpdatedAt)
      // 更新時刻が現在時刻に近いことを確認
      const now = new Date().getTime()
      const updatedTime = new Date(result.transactions[0].updatedAt).getTime()
      expect(Math.abs(now - updatedTime)).toBeLessThan(1000) // 1秒以内
    })
  })

  describe('deleteTransaction()', () => {
    it('指定されたIDの取引を削除する', () => {
      // 取引を追加
      let result = DataManager.addTransaction(mockData, mockTransaction)
      const transactionId = result.transactions[0].id

      expect(result.transactions).toHaveLength(1)

      // 取引を削除
      result = DataManager.deleteTransaction(result, transactionId)

      expect(result.transactions).toHaveLength(0)
    })

    it('複数の取引から指定されたもののみ削除する', () => {
      // 2つの取引を追加
      let result = DataManager.addTransaction(mockData, mockTransaction)
      const firstId = result.transactions[0].id

      const secondTransaction = { ...mockTransaction, amount: 3000 }
      result = DataManager.addTransaction(result, secondTransaction)
      
      expect(result.transactions).toHaveLength(2)

      // 最初の取引を削除
      result = DataManager.deleteTransaction(result, firstId)

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].amount).toBe(3000) // 2番目の取引が残る
    })

    it('存在しないIDで削除しても変更されない', () => {
      const result = DataManager.addTransaction(mockData, mockTransaction)
      const originalTransactions = [...result.transactions]

      const deletedResult = DataManager.deleteTransaction(result, 'non-existent-id')

      expect(deletedResult.transactions).toEqual(originalTransactions)
    })
  })

  describe('validateTransaction()', () => {
    it('有効な取引でエラーがない', () => {
      const validTransaction = {
        date: '2025-06-24',
        type: 'expense' as const,
        amount: 1500,
        category: 'expense-food',
        description: 'ランチ代'
      }

      const errors = DataManager.validateTransaction(validTransaction)
      expect(errors).toHaveLength(0)
    })

    it('必須項目が不足している場合エラーを返す', () => {
      const invalidTransaction = {
        // date: '2025-06-24', // 日付なし
        // type: 'expense', // タイプなし
        amount: 1500,
        category: 'expense-food',
        description: 'ランチ代'
      }

      const errors = DataManager.validateTransaction(invalidTransaction)
      expect(errors).toContain('日付は必須です')
      expect(errors).toContain('種類は必須です')
    })

    it('不正な金額でエラーを返す', () => {
      const invalidTransaction = {
        date: '2025-06-24',
        type: 'expense' as const,
        amount: -100, // 負の金額
        category: 'expense-food',
        description: 'ランチ代'
      }

      const errors = DataManager.validateTransaction(invalidTransaction)
      expect(errors).toContain('金額は正の数値である必要があります')
    })

    it('金額が0の場合エラーを返す', () => {
      const invalidTransaction = {
        date: '2025-06-24',
        type: 'expense' as const,
        amount: 0,
        category: 'expense-food',
        description: 'ランチ代'
      }

      const errors = DataManager.validateTransaction(invalidTransaction)
      expect(errors).toContain('金額は正の数値である必要があります')
    })

    it('カテゴリが不足している場合エラーを返す', () => {
      const invalidTransaction = {
        date: '2025-06-24',
        type: 'expense' as const,
        amount: 1500,
        // category: 'expense-food', // カテゴリなし
        description: 'ランチ代'
      }

      const errors = DataManager.validateTransaction(invalidTransaction)
      expect(errors).toContain('カテゴリは必須です')
    })
  })

  describe('formatAmount()', () => {
    it('金額を正しくフォーマットする', () => {
      expect(DataManager.formatAmount(1500)).toBe('¥1,500')
      expect(DataManager.formatAmount(10000)).toBe('¥10,000')
      expect(DataManager.formatAmount(1000000)).toBe('¥1,000,000')
    })

    it('カスタム通貨でフォーマットする', () => {
      expect(DataManager.formatAmount(1500, '$')).toBe('$1,500')
      expect(DataManager.formatAmount(1500, '€')).toBe('€1,500')
    })

    it('0円の場合も正しくフォーマットする', () => {
      expect(DataManager.formatAmount(0)).toBe('¥0')
    })
  })

  describe('formatDate()', () => {
    const testDate = '2025-06-24'

    it('デフォルトフォーマットでYYYY-MM-DDを返す', () => {
      expect(DataManager.formatDate(testDate)).toBe('2025-06-24')
    })

    it('MM/DD形式でフォーマットする', () => {
      expect(DataManager.formatDate(testDate, 'MM/DD')).toBe('06/24')
    })

    it('MM/DD/YYYY形式でフォーマットする', () => {
      expect(DataManager.formatDate(testDate, 'MM/DD/YYYY')).toBe('06/24/2025')
    })

    it('不明なフォーマットの場合デフォルトを返す', () => {
      expect(DataManager.formatDate(testDate, 'UNKNOWN')).toBe('2025-06-24')
    })
  })

  describe('統合テスト - 取引の完全なライフサイクル', () => {
    it('取引の作成→更新→削除の一連の流れ', () => {
      // 1. 取引を作成
      let result = DataManager.addTransaction(mockData, mockTransaction)
      expect(result.transactions).toHaveLength(1)
      
      const transactionId = result.transactions[0].id
      expect(result.transactions[0].amount).toBe(1500)

      // 2. 取引を更新
      result = DataManager.updateTransaction(result, transactionId, {
        amount: 2000,
        description: '更新されたランチ代'
      })
      expect(result.transactions[0].amount).toBe(2000)
      expect(result.transactions[0].description).toBe('更新されたランチ代')

      // 3. 取引を削除
      result = DataManager.deleteTransaction(result, transactionId)
      expect(result.transactions).toHaveLength(0)
    })
  })
})
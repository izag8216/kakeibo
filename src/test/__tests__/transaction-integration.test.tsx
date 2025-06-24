import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import TransactionForm from '../../components/TransactionForm'
import { DataManager } from '../../utils/dataManager'
import { Category, AppData } from '../../types'

// Mock notifications
vi.mock('@mantine/notifications', async () => {
  const actual = await vi.importActual('@mantine/notifications')
  return {
    ...actual,
    notifications: {
      show: vi.fn(),
    },
  }
})

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <ModalsProvider>
      <Notifications />
      {children}
    </ModalsProvider>
  </MantineProvider>
)

describe('取引追加 - 統合テスト', () => {
  let mockCategories: Category[]
  let mockData: AppData
  let mockOnSave: ReturnType<typeof vi.fn>
  let mockOnCancel: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    
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
      },
      {
        id: 'expense-entertainment',
        name: '娯楽費',
        type: 'expense',
        color: '#8b5cf6'
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

    mockOnSave = vi.fn()
    mockOnCancel = vi.fn()
  })

  describe('エラーハンドリング', () => {
    it('サーバーエラー時の処理', async () => {
      // onSaveでエラーを投げる
      mockOnSave.mockRejectedValueOnce(new Error('サーバーエラー'))
      
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 有効なデータを入力
      await user.type(screen.getByLabelText('金額'), '1500')
      await user.click(screen.getByLabelText('カテゴリ'))
      await user.click(screen.getByText('食費'))
      await user.type(screen.getByLabelText('説明'), 'ランチ代')

      // 保存試行
      await user.click(screen.getByRole('button', { name: /保存/ }))

      // エラーが処理される
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })
    })

    it('ネットワークエラー時の処理', async () => {
      mockOnSave.mockRejectedValueOnce(new Error('Network Error'))
      
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 有効なデータを入力
      await user.type(screen.getByLabelText('金額'), '1500')
      await user.click(screen.getByLabelText('カテゴリ'))
      await user.click(screen.getByText('食費'))

      // 保存試行
      await user.click(screen.getByRole('button', { name: /保存/ }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })
    })

    it('空のカテゴリリストでの処理', () => {
      render(
        <TestWrapper>
          <TransactionForm
            categories={[]}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // カテゴリセレクトボックスが存在する
      expect(screen.getByLabelText('カテゴリ')).toBeInTheDocument()
    })
  })

  describe('フォームバリデーション - 複合条件', () => {
    it('複数の必須項目が同時に未入力の場合', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 金額を削除
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)

      // 保存ボタンクリック
      await user.click(screen.getByRole('button', { name: /保存/ }))

      // 複数のエラーが表示される
      await waitFor(() => {
        expect(screen.getByText('金額は必須です')).toBeInTheDocument()
        expect(screen.getByText('カテゴリは必須です')).toBeInTheDocument()
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('非常に大きな金額の処理', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 非常に大きな金額
      await user.type(screen.getByLabelText('金額'), '999999999999')
      await user.click(screen.getByLabelText('カテゴリ'))
      await user.click(screen.getByText('食費'))

      await user.click(screen.getByRole('button', { name: /保存/ }))

      // 大きな金額でも処理される
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          type: 'expense',
          amount: 999999999999,
          category: 'expense-food',
          description: '',
          date: expect.any(String)
        })
      })
    })

    it('長い説明文の処理', async () => {
      const user = userEvent.setup()
      const longDescription = 'あ'.repeat(1000) // 1000文字の説明
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      await user.type(screen.getByLabelText('金額'), '1500')
      await user.click(screen.getByLabelText('カテゴリ'))
      await user.click(screen.getByText('食費'))
      await user.type(screen.getByLabelText('説明'), longDescription)

      await user.click(screen.getByRole('button', { name: /保存/ }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          type: 'expense',
          amount: 1500,
          category: 'expense-food',
          description: longDescription,
          date: expect.any(String)
        })
      })
    })
  })

  describe('完全なワークフロー', () => {
    it('収入取引の完全な追加フロー', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 1. 収入タイプを選択
      await user.click(screen.getByRole('radio', { name: '収入' }))

      // 2. 金額を入力
      await user.type(screen.getByLabelText('金額'), '250000')

      // 3. カテゴリを選択（収入カテゴリのみ表示されることを確認）
      await user.click(screen.getByLabelText('カテゴリ'))
      expect(screen.getByText('給与')).toBeInTheDocument()
      expect(screen.queryByText('食費')).not.toBeInTheDocument()
      await user.click(screen.getByText('給与'))

      // 4. 日付を設定（明日の日付）
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const tomorrowStr = tomorrow.toISOString().split('T')[0]
      
      const dateInput = screen.getByLabelText('日付')
      await user.clear(dateInput)
      await user.type(dateInput, tomorrowStr)

      // 5. 説明を入力
      await user.type(screen.getByLabelText('説明'), '6月分給与')

      // 6. 保存
      await user.click(screen.getByRole('button', { name: /保存/ }))

      // 7. 正しいデータで保存が呼ばれることを確認
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          type: 'income',
          amount: 250000,
          category: 'income-salary',
          description: '6月分給与',
          date: tomorrowStr
        })
      })
    })

    it('支出取引の完全な追加フロー', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 1. 支出は既にデフォルトで選択されている
      expect(screen.getByRole('radio', { name: '支出' })).toBeChecked()

      // 2. 金額を入力
      await user.type(screen.getByLabelText('金額'), '3200')

      // 3. カテゴリを選択
      await user.click(screen.getByLabelText('カテゴリ'))
      await user.click(screen.getByText('娯楽費'))

      // 4. 説明を入力
      await user.type(screen.getByLabelText('説明'), '映画鑑賞')

      // 5. 保存
      await user.click(screen.getByRole('button', { name: /保存/ }))

      // 6. 正しいデータで保存が呼ばれることを確認
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          type: 'expense',
          amount: 3200,
          category: 'expense-entertainment',
          description: '映画鑑賞',
          date: expect.any(String)
        })
      })
    })
  })

  describe('データとUIの整合性', () => {
    it('フォーム送信後にDataManagerで処理できる', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // フォーム入力
      await user.type(screen.getByLabelText('金額'), '1500')
      await user.click(screen.getByLabelText('カテゴリ'))
      await user.click(screen.getByText('食費'))
      await user.type(screen.getByLabelText('説明'), 'ランチ代')

      await user.click(screen.getByRole('button', { name: /保存/ }))

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalled()
      })

      // DataManagerで実際に処理できることを確認
      const transactionData = mockOnSave.mock.calls[0][0]
      const result = DataManager.addTransaction(mockData, transactionData)
      
      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].amount).toBe(1500)
      expect(result.transactions[0].category).toBe('expense-food')
    })

    it('バリデーションがDataManagerと一致する', async () => {
      const invalidData = {
        date: '',
        type: 'expense' as const,
        amount: -100,
        category: '',
        description: ''
      }

      // DataManagerのバリデーション
      const errors = DataManager.validateTransaction(invalidData)
      expect(errors.length).toBeGreaterThan(0)

      // フォームでも同様のエラーが発生することを確認
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 不正なデータを入力
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '-100')

      await user.click(screen.getByRole('button', { name: /保存/ }))

      // エラーが表示される
      await waitFor(() => {
        expect(screen.getByText('金額は0より大きい値を入力してください')).toBeInTheDocument()
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })
})
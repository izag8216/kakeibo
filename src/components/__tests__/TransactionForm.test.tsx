import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import TransactionForm from '../TransactionForm'
import { Category, Transaction } from '../../types'

// Mock categories for testing
const mockCategories: Category[] = [
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

// Mock transaction for editing tests
const mockTransaction: Transaction = {
  id: 'test-transaction',
  date: '2025-06-24',
  type: 'expense',
  amount: 1500,
  category: 'expense-food',
  description: 'ランチ',
  createdAt: '2025-06-24T10:00:00Z',
  updatedAt: '2025-06-24T10:00:00Z'
}

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    <ModalsProvider>
      <Notifications />
      {children}
    </ModalsProvider>
  </MantineProvider>
)

describe('TransactionForm - 取引を追加', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('新規取引作成モード', () => {
    it('フォームが正しく表示される', () => {
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // フォームタイトルの確認
      expect(screen.getByText('新しい取引を追加')).toBeInTheDocument()
      
      // 必要なフィールドの存在確認
      expect(screen.getByText('取引タイプ')).toBeInTheDocument()
      expect(screen.getByText('金額')).toBeInTheDocument()
      expect(screen.getByText('カテゴリ')).toBeInTheDocument()
      expect(screen.getByText('日付')).toBeInTheDocument()
      expect(screen.getByText('説明')).toBeInTheDocument()
      
      // ボタンの確認
      expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /キャンセル/ })).toBeInTheDocument()
    })

    it('デフォルト値が正しく設定される', () => {
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // デフォルトで支出が選択されている
      const expenseButton = screen.getByRole('radio', { name: '支出' })
      expect(expenseButton).toBeChecked()

      // 今日の日付がデフォルト値
      const today = new Date().toISOString().split('T')[0]
      const dateInput = screen.getByDisplayValue(today)
      expect(dateInput).toBeInTheDocument()
    })

    it('取引タイプ変更時にカテゴリがフィルタリングされる', async () => {
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

      // 収入タイプを選択
      const incomeButton = screen.getByRole('radio', { name: '収入' })
      await user.click(incomeButton)

      // カテゴリドロップダウンを開く
      const categorySelect = screen.getByLabelText('カテゴリ')
      await user.click(categorySelect)

      // 収入カテゴリのみが表示される
      await waitFor(() => {
        expect(screen.getByText('給与')).toBeInTheDocument()
        expect(screen.queryByText('食費')).not.toBeInTheDocument()
      })
    })

    it('有効なデータで保存が実行される', async () => {
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
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '1500')

      // カテゴリ選択
      const categorySelect = screen.getByLabelText('カテゴリ')
      await user.click(categorySelect)
      await user.click(screen.getByText('食費'))

      // 説明入力
      const descriptionInput = screen.getByLabelText('説明')
      await user.type(descriptionInput, 'ランチ代')

      // 保存ボタンクリック
      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      // onSaveが正しい引数で呼ばれる
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          type: 'expense',
          amount: 1500,
          category: 'expense-food',
          description: 'ランチ代',
          date: expect.any(String)
        })
      })
    })

    it('必須項目が未入力の場合エラーが表示される', async () => {
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

      // 金額を空にする
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)

      // 保存ボタンクリック
      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      // バリデーションエラーが表示される
      await waitFor(() => {
        expect(screen.getByText('金額は必須です')).toBeInTheDocument()
      })

      // onSaveが呼ばれない
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('不正な金額（負の数）の場合エラーが表示される', async () => {
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

      // 負の金額を入力
      const amountInput = screen.getByLabelText('金額')
      await user.clear(amountInput)
      await user.type(amountInput, '-100')

      // 保存ボタンクリック
      const saveButton = screen.getByRole('button', { name: /保存/ })
      await user.click(saveButton)

      // バリデーションエラーが表示される
      await waitFor(() => {
        expect(screen.getByText('金額は0より大きい値を入力してください')).toBeInTheDocument()
      })

      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('キャンセルボタンでonCancelが呼ばれる', async () => {
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

      const cancelButton = screen.getByRole('button', { name: /キャンセル/ })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('編集モード', () => {
    it('編集時にフォームに既存データが表示される', () => {
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            editingTransaction={mockTransaction}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // タイトルが編集モードに変わる
      expect(screen.getByText('取引を編集')).toBeInTheDocument()

      // 既存の値が表示される
      expect(screen.getByDisplayValue('1500')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ランチ')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2025-06-24')).toBeInTheDocument()

      // 支出タイプが選択されている
      const expenseButton = screen.getByRole('radio', { name: '支出' })
      expect(expenseButton).toBeChecked()
    })

    it('編集モードで保存時に更新が実行される', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            editingTransaction={mockTransaction}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      // 金額を変更
      const amountInput = screen.getByDisplayValue('1500')
      await user.clear(amountInput)
      await user.type(amountInput, '2000')

      // 保存ボタンクリック
      const saveButton = screen.getByRole('button', { name: /更新/ })
      await user.click(saveButton)

      // 更新されたデータでonSaveが呼ばれる
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          type: 'expense',
          amount: 2000,
          category: 'expense-food',
          description: 'ランチ',
          date: '2025-06-24'
        })
      })
    })
  })

  describe('カテゴリ表示', () => {
    it('選択されたカテゴリが正しく表示される', async () => {
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

      // カテゴリを選択
      const categorySelect = screen.getByLabelText('カテゴリ')
      await user.click(categorySelect)
      await user.click(screen.getByText('食費'))

      // 選択されたカテゴリの表示を確認
      await waitFor(() => {
        expect(screen.getByText('食費')).toBeInTheDocument()
      })
    })
  })

  describe('アクセシビリティ', () => {
    it('必須フィールドにaria-required属性が設定される', () => {
      render(
        <TestWrapper>
          <TransactionForm
            categories={mockCategories}
            onSave={mockOnSave}
            onCancel={mockOnCancel}
          />
        </TestWrapper>
      )

      const amountInput = screen.getByLabelText('金額')
      const categorySelect = screen.getByLabelText('カテゴリ')
      const dateInput = screen.getByLabelText('日付')

      expect(amountInput).toHaveAttribute('aria-required', 'true')
      expect(categorySelect).toHaveAttribute('aria-required', 'true')
      expect(dateInput).toHaveAttribute('aria-required', 'true')
    })
  })
})
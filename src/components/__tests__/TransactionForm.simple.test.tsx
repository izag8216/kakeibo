import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import TransactionForm from '../TransactionForm'
import { Category } from '../../types'

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
  }
]

// Simple test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>
    {children}
  </MantineProvider>
)

describe('TransactionForm - 簡単なテスト', () => {
  const mockOnSave = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('コンポーネントがレンダリングされる', () => {
    render(
      <TestWrapper>
        <TransactionForm
          categories={mockCategories}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    )

    // タイトルが表示される
    expect(screen.getByText('新しい取引を追加')).toBeInTheDocument()
  })

  it('基本的なフォーム要素が存在する', () => {
    render(
      <TestWrapper>
        <TransactionForm
          categories={mockCategories}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    )

    // ラベルが表示される
    expect(screen.getByText('取引タイプ')).toBeInTheDocument()
    expect(screen.getByText('金額')).toBeInTheDocument()
    expect(screen.getByText('カテゴリ')).toBeInTheDocument()
    expect(screen.getByText('日付')).toBeInTheDocument()
    
    // ボタンが存在する
    expect(screen.getByText('保存する')).toBeInTheDocument()
    expect(screen.getByText('キャンセル')).toBeInTheDocument()
  })

  it('収入・支出の選択肢が表示される', () => {
    render(
      <TestWrapper>
        <TransactionForm
          categories={mockCategories}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
        />
      </TestWrapper>
    )

    expect(screen.getByText('収入')).toBeInTheDocument()
    expect(screen.getByText('支出')).toBeInTheDocument()
  })

  it('編集モードで正しいタイトルが表示される', () => {
    const mockTransaction = {
      id: 'test-id',
      date: '2025-06-24',
      type: 'expense' as const,
      amount: 1500,
      category: 'expense-food',
      description: 'テスト',
      createdAt: '2025-06-24T10:00:00Z',
      updatedAt: '2025-06-24T10:00:00Z'
    }

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

    expect(screen.getByText('取引を編集')).toBeInTheDocument()
  })
})
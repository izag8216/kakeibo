# かけいぼ - テストドキュメント

## 📋 概要

「取引を追加」機能のユニットテストを作成しました。

## 🧪 テスト構成

### 1. DataManager ユニットテスト
**ファイル**: `src/utils/__tests__/dataManager.test.ts`

#### テスト対象
- ✅ `generateId()` - ユニークID生成
- ✅ `addTransaction()` - 取引追加
- ✅ `updateTransaction()` - 取引更新  
- ✅ `deleteTransaction()` - 取引削除
- ✅ `validateTransaction()` - バリデーション
- ✅ `formatAmount()` - 金額フォーマット
- ✅ `formatDate()` - 日付フォーマット

#### カバレッジ
- **24テスト** すべて成功
- CRUD操作の完全なライフサイクル
- エラーケースとバリデーション
- データ整合性とイミュータビリティ

### 2. TransactionForm コンポーネントテスト
**ファイル**: `src/components/__tests__/TransactionForm.simple.test.tsx`

#### テスト対象
- ✅ コンポーネントレンダリング
- ✅ 基本フォーム要素の存在確認
- ✅ 新規作成/編集モードの切り替え
- ✅ 収入・支出選択肢の表示

#### カバレッジ
- **4テスト** すべて成功
- UI要素の基本表示確認
- モード切り替えの動作確認

### 3. 統合テスト (参考実装)
**ファイル**: `src/test/__tests__/transaction-integration.test.tsx`

#### 含まれる機能
- エラーハンドリング
- フォームバリデーション
- 完全なワークフロー
- データとUIの整合性

## 🚀 テスト実行方法

### 全テスト実行
```bash
npm test
```

### 特定のテストファイル実行
```bash
# DataManagerテスト
npm test -- --run src/utils/__tests__/dataManager.test.ts

# TransactionFormテスト  
npm test -- --run src/components/__tests__/TransactionForm.simple.test.tsx
```

### カバレッジ確認
```bash
npm run test:coverage
```

## 🔧 テスト環境設定

### 必要パッケージ
- `vitest` - テストランナー
- `@testing-library/react` - React コンポーネントテスト
- `@testing-library/jest-dom` - DOM マッチャー
- `@testing-library/user-event` - ユーザーインタラクション
- `jsdom` - ブラウザ環境シミュレーション

### 設定ファイル
- `vite.config.ts` - Vitestの設定
- `src/test/setup.ts` - テスト環境のセットアップ

## ✅ テスト結果

### DataManager テスト
```
✓ DataManager - 取引関連機能 (24 tests) 37ms
```

### TransactionForm テスト
```
✓ TransactionForm - 簡単なテスト (4 tests) 510ms
```

## 📊 カバレッジ領域

### 実装済み
- ✅ 取引のCRUD操作
- ✅ データバリデーション
- ✅ フォーマット機能
- ✅ エラーハンドリング
- ✅ UI基本表示
- ✅ モード切り替え

### 今後の拡張可能性
- 🔄 ユーザーインタラクションテスト
- 🔄 フォーム送信テスト
- 🔄 カテゴリフィルタリングテスト
- 🔄 エラー表示テスト

## 🎯 テストの価値

1. **品質保証**: 取引データの整合性確保
2. **回帰防止**: 新機能追加時の既存機能保護  
3. **仕様書**: テストコードが機能仕様として機能
4. **リファクタリング支援**: 安全なコード改善

## 🚧 注意事項

- Mantineコンポーネントのテストには環境設定が重要
- `window.matchMedia`と`ResizeObserver`のモックが必要
- 統合テストは実装が複雑なため、簡易版を優先
- テスト環境でのMantine providerの適切な設定が必要
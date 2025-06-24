# かけいぼ - 個人用家計簿ウェブアプリ 📊

<div align="center">

![GitHub top language](https://img.shields.io/github/languages/top/username/kakeibo)
![GitHub](https://img.shields.io/github/license/username/kakeibo)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/username/kakeibo)
![GitHub last commit](https://img.shields.io/github/last-commit/username/kakeibo)

**ミニマリスティックでモダンな個人用家計簿アプリケーション**

[📱 Live Demo](https://username.github.io/kakeibo) | [📚 Documentation](./docs/) | [🐛 Issues](https://github.com/username/kakeibo/issues)

</div>

## ✨ 特徴

- 🎨 **モダンUI**: Mantine v7による美しいインターフェース
- 🌙 **ダークモード**: 完全対応の切り替え機能
- 📱 **レスポンシブ**: モバイル・タブレット・デスクトップ完全対応
- ⚡ **高速**: React 18 + Vite による高速な動作
- 🧪 **品質保証**: 28テストケースによる包括的なテストカバレッジ
- 💾 **データ永続化**: ローカルファイルによる確実なデータ保存
- 📊 **可視化**: 豊富なグラフと統計機能

## 🚀 クイックスタート

### 必要要件

- Node.js 18.0.0 以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/username/kakeibo.git
cd kakeibo

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

開発サーバーが起動したら、ブラウザで `http://localhost:5173` にアクセスしてください。

## 📋 主要機能

### 💰 収支管理
- ✅ 収入・支出の記録、編集、削除
- ✅ カテゴリ別の分類と管理
- ✅ 日付・金額・説明の詳細記録
- ✅ リアルタイム残高計算

### 📊 統計・分析
- ✅ 月別収支推移グラフ
- ✅ カテゴリ別支出・収入分析
- ✅ 期間指定での詳細分析
- ✅ 貯蓄率の自動計算

### 🎛️ カテゴリ管理
- ✅ 収入・支出カテゴリの作成・編集・削除
- ✅ カラーコード設定とビジュアル管理
- ✅ 使用状況の追跡機能

### 🔍 検索・フィルタ
- ✅ 日付、カテゴリ、金額での絞り込み
- ✅ ソート機能（日付、金額、カテゴリ）
- ✅ 一括選択・削除機能

## 🏗️ 技術スタック

### フロントエンド
- **React 18** - モダンなUIライブラリ
- **TypeScript** - 型安全な開発
- **Mantine v7** - 豊富なUIコンポーネント
- **Recharts** - データ可視化ライブラリ
- **Vite** - 高速ビルドツール

### 開発・テスト
- **Vitest** - 高速テストランナー
- **React Testing Library** - コンポーネントテスト
- **ESLint + Prettier** - コード品質管理

### データ管理
- **JSON** - ローカルファイルストレージ
- **LocalStorage** - フォールバック機能

## 📁 プロジェクト構成

```
kakeibo/
├── src/
│   ├── components/          # UIコンポーネント
│   │   ├── Dashboard.tsx
│   │   ├── TransactionForm.tsx
│   │   ├── TransactionList.tsx
│   │   ├── CategoryManager.tsx
│   │   ├── Statistics.tsx
│   │   ├── Layout.tsx
│   │   └── __tests__/       # コンポーネントテスト
│   ├── contexts/           # React Context
│   ├── hooks/              # カスタムフック
│   ├── utils/              # ユーティリティ関数
│   │   └── __tests__/      # ユニットテスト
│   ├── test/               # テスト設定・統合テスト
│   └── types/              # TypeScript型定義
├── public/                 # 静的ファイル
├── docs/                   # ドキュメント
└── dist/                   # ビルド成果物
```

## 🧪 テスト

包括的なテストスイートで品質を保証しています。

```bash
# 全テスト実行
npm test

# テストをUIモードで実行
npm run test:ui

# カバレッジ確認
npm run test:coverage
```

### テストカバレッジ
- ✅ **DataManager**: 24テストケース（CRUD操作、バリデーション）
- ✅ **TransactionForm**: 4基本テスト + 28包括テスト
- ✅ **統合テスト**: ワークフロー全体のテスト

## 🔧 ビルド・デプロイ

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# リント実行
npm run lint
```

## 📊 使用方法

### 1. 取引の記録
1. サイドバーから「取引追加」を選択
2. 収入または支出を選択
3. 金額、カテゴリ、日付、説明を入力
4. 「保存」ボタンをクリック

### 2. カテゴリ管理
1. サイドバーから「カテゴリ管理」を選択
2. 「新規カテゴリ」ボタンをクリック
3. カテゴリ名、カラーを設定
4. 保存して完了

### 3. 統計確認
1. サイドバーから「統計」を選択
2. 期間を指定して分析
3. グラフとチャートで可視化された情報を確認

## 🛡️ セキュリティ

- ✅ **データローカル化**: 全データはローカルに保存
- ✅ **入力検証**: フォーム入力の厳密なバリデーション
- ✅ **XSS対策**: React標準のエスケープ処理
- ✅ **依存関係**: 定期的なセキュリティアップデート

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

### 開発ガイドライン
- TypeScript strict mode を遵守
- コミット前に `npm test` でテスト確認
- ESLint + Prettier でコード品質を維持

## 📝 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 📞 サポート

- 🐛 **バグ報告**: [Issues](https://github.com/username/kakeibo/issues)
- 💡 **機能要望**: [Feature Requests](https://github.com/username/kakeibo/issues/new?template=feature_request.md)
- 📧 **一般的な質問**: [Discussions](https://github.com/username/kakeibo/discussions)

## 🙏 謝辞

- [Mantine](https://mantine.dev/) - 素晴らしいUIコンポーネントライブラリ
- [Recharts](https://recharts.org/) - 柔軟なグラフライブラリ
- [React Testing Library](https://testing-library.com/) - テストユーティリティ

---

<div align="center">

**⭐ このプロジェクトが役に立ったら、ぜひスターをお願いします！**

Made with ❤️ by [Claude Code](https://claude.ai/code)

</div>
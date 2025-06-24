# Claude Code 完全初心者向けハンズオンガイド：47のベストプラクティス

## 📚 目次

1. [はじめに](#はじめに)
2. [セットアップと基本操作](#セットアップと基本操作)
3. [コマンドライン基本操作](#コマンドライン基本操作)
4. [画像との連携](#画像との連携)
5. [MCP（Model Context Protocol）の活用](#mcpmodel-context-protocolの活用)
6. [CLAUDE.mdファイルの活用](#claudemdファイルの活用)
7. [スラッシュコマンドの活用](#スラッシュコマンドの活用)
8. [UI操作のコツ](#ui操作のコツ)
9. [バージョン管理との連携](#バージョン管理との連携)
10. [コンテキスト管理](#コンテキスト管理)

---

## はじめに

このガイドは、Claude Codeを初めて使う方向けの完全ハンズオンチュートリアルです。47のベストプラクティスを実際に手を動かしながら学び、Claude Codeを効果的に活用できるようになることを目指します。

### 前提条件
- Node.js 18以上がインストール済み
- 基本的なターミナル操作の知識
- Anthropic APIキーまたはClaude Proアカウント

### 学習の進め方
1. 各セクションを順番に進める
2. 実際にコマンドを実行する
3. 結果を確認し、理解を深める
4. 疑問点があれば、Claude Codeに質問する

---

## セットアップと基本操作

### 🚀 Claude Codeのインストール

まず、Claude Codeをインストールしましょう。

```bash
npm install -g @anthropic-ai/claude-code
```

**実習1：インストール確認**
```bash
claude --version
```

### 🔑 認証設定

Claude Codeを起動して認証を行います。

```bash
claude
```

**実習2：初回認証**
1. ターミナルで`claude`と入力
2. 認証プロンプトに従って設定
3. 成功メッセージを確認

### ⚙️ 基本設定

設定を確認・変更したい場合は以下のコマンドを使用します。

```bash
/config
```

**実習3：設定確認**
```bash
# Claude Codeを起動
claude

# 設定画面を開く
> /config
```

---

## コマンドライン基本操作

### Tip 1: Claude CodeをBash CLIとして使用

Claude Codeは通常のコマンドラインツールのように使用できます。

**実習4：基本的なプロジェクト操作**
```bash
# 新しいブランチを作成してプロジェクトをlintする
claude "新しいブランチを作成してプロジェクトをlintしてください"
```

### Tip 2: コマンドライン引数の使用

起動時に引数を渡すことができます。

**実習5：引数付き起動**
```bash
claude "このプロジェクトのファイル構造を教えてください"
```

### Tip 3: ヘッドレスモード（-pフラグ）

`-p`フラグを使用すると、対話モードに入らずに結果を直接出力します。

**実習6：ヘッドレスモードの使用**
```bash
claude -p "このプロジェクトには何個のファイルがありますか？"
```

期待される出力例：
```
834 files
```

### Tip 4: 他のCLIツールとの連携

Claude Codeは他のコマンドラインツールと組み合わせて使用できます。

**実習7：パイプ処理**
```bash
# CSVファイルを分析
cat data.csv | claude -p "最も多くゲームに勝ったのは誰ですか？"
```

### Tip 5: データをClaude Codeにパイプ

様々なデータをClaude Codeに送信して分析できます。

**実習8：ログファイルの分析**
```bash
# ログファイルを作成
echo "2025-01-01 10:00:00 INFO: Application started
2025-01-01 10:01:00 ERROR: Database connection failed
2025-01-01 10:02:00 INFO: Retrying connection
2025-01-01 10:03:00 INFO: Connection successful" > sample.log

# ログを分析
cat sample.log | claude -p "このログファイルのエラーを分析してください"
```

### Tip 6: 並列実行

複数のClaude Codeインスタンスを同時に実行できます。

**実習9：並列実行**
```bash
# ターミナルタブ1
claude "フロントエンドのコードを分析してください"

# ターミナルタブ2（新しいタブで）
claude "バックエンドのAPIを確認してください"
```

### Tip 7: サブエージェント（タスク）の活用

Claude Codeは複雑なタスクを自動的にサブタスクに分割します。

**実習10：サブエージェントの確認**
```bash
claude "gameState.directionが変更されている箇所をすべて見つけてください"
```

出力例：
```
Task(Find where gameState.direction is modified)...
```

---

## 画像との連携

### Tip 8: 画像ファイルのドラッグアンドドロップ

**実習11：画像ファイルの分析**
1. 画像ファイルを準備
2. Claude Codeを起動
3. 画像ファイルをターミナルにドラッグ
4. 分析を依頼

```bash
claude
> [画像をドラッグ]
> この画像について説明してください
```

### Tip 9: スクリーンショットのコピー&ペースト

**実習12：スクリーンショットの分析**
1. macOSで`Shift + Command + Control + 4`でスクリーンショット
2. Claude Codeで`Control + V`でペースト
3. 分析を依頼

```bash
> [Image #1]
> このスクリーンショットのUIを分析してください
```

### Tip 10: モックアップからのコード生成

**実習13：UIモックアップの実装**
```bash
> [モックアップ画像をペースト]
> このUIモックアップのHTMLとCSSを作成してください
```

### Tip 11: スクリーンショットを使ったフィードバック

**実習14：反復的なUI改善**
1. Claude CodeでUIを作成
2. ブラウザで確認
3. スクリーンショットを撮影
4. フィードバックを提供

```bash
> このスクリーンショット[Image #1]のボタンを青色にしてください
```

### Tip 12: Puppeteerを使った自動化

**実習15：自動スクリーンショット**
```bash
# Puppeteer MCPサーバーが設定済みの場合
> /mcp
> http://localhost:1234 を開いて'welcome-screen'という名前でスクリーンショットを撮ってください
```

---

## MCP（Model Context Protocol）の活用

### Tip 13: Claude CodeをMCPサーバーとして使用

Claude Code自体をMCPサーバーとして他のツールから利用できます。

**実習16：MCPサーバー設定の確認**
```bash
> /mcp
```

### Tip 14: Claude CodeをMCPクライアントとして使用

様々なMCPサーバーに接続できます。

**実習17：利用可能なMCPサーバーの確認**
```bash
claude mcp list
```

### Tip 15: データベースとの連携

**実習18：PostgreSQL MCPサーバーの設定**
```bash
# PostgreSQL MCPサーバーを追加
claude mcp add postgres-db -- /path/to/postgres-mcp-server --connection-string "postgresql://user:pass@localhost:5432/mydb"
```

**実習19：データベースクエリ**
```bash
> データベースを確認できますか？
```

### Tip 16: APIとの連携

**実習20：Stripe API連携**
```bash
# Stripe MCPサーバー設定後
> Stripeの現在の残高を確認してください
```

### Tip 17: ドキュメントのインポート

**実習21：Cloudflare ドキュメントMCP**
```bash
claude mcp add --transport sse sse-server https://docs.mcp.cloudflare.com/sse
```

```bash
> 最新のCloudflareドキュメントを使用して、このアプリをCloudflare Workersにデプロイする方法を教えてください
```

### Tip 18: URLからのドキュメントインポート

**実習22：URL直接指定**
```bash
> https://ai.pydantic.dev/ を参考にPydanticAIのHello Worldを作成してください
```

### Tip 19: 一般的な知識のインポート

**実習23：ゲームルールの取得**
```bash
> https://www.unorules.com/ のルールに基づいてUNOゲームの疑似コードを作成してください
```

---

## CLAUDE.mdファイルの活用

### Tip 20: CLAUDE.mdファイルの基本

CLAUDE.mdファイルは、Claude Codeが自動的に読み込む設定ファイルです。

**実習24：CLAUDE.mdファイルの作成**
```bash
# プロジェクトルートでCLAUDE.mdを作成
cat > CLAUDE.md << 'EOF'
# Bashコマンド
npm run build: プロジェクトをビルド
npm run typecheck: 型チェックを実行

# コードスタイル
- ES modules (import/export) 構文を使用、CommonJS (require) は使わない
- 可能な限り分割代入を使用 (例: import { foo } from 'bar')

# ワークフロー
- コード変更後は必ず型チェックを実行
- パフォーマンスのため、テストスイート全体ではなく単一テストを実行
EOF
```

### Tip 21: /initコマンドでCLAUDE.mdを自動生成

**実習25：自動生成**
```bash
claude
> /init
```

### Tip 22: #記号でCLAUDE.mdに追加

**実習26：プロジェクトメモリへの追加**
```bash
> # 新しいメソッドを作成する際は常に単一責任原則を使用する
```

### Tip 23: グローバルCLAUDE.md

**実習27：グローバル設定**
```bash
# グローバルCLAUDE.mdディレクトリを作成
mkdir -p ~/.claude

# グローバル設定を作成
cat > ~/.claude/CLAUDE.md << 'EOF'
# グローバル設定
- 常にクリーンで保守可能なコードを書く
- セキュリティを最優先に考慮する
- パフォーマンスを最適化する
EOF
```

### Tip 24: サブディレクトリでのCLAUDE.md

**実習28：テスト用CLAUDE.md**
```bash
# testsディレクトリを作成
mkdir -p tests

# テスト専用の設定を作成
cat > tests/CLAUDE.md << 'EOF'
# テスト設定
- すべてのテストは独立して実行可能であること
- モックを適切に使用すること
- テストの命名は分かりやすくすること
EOF
```

### Tip 25: CLAUDE.mdの定期的なリファクタリング

**実習29：CLAUDE.mdの整理**
```bash
> CLAUDE.mdファイルを確認して、不要な情報を削除し、整理してください
```

### Tip 26: Anthropicのプロンプト改善ツール

**実習30：プロンプト最適化**
```bash
> CLAUDE.mdファイルをより効果的なプロンプトに改善してください
```

---

## スラッシュコマンドの活用

### Tip 27: .claude/commandsでスラッシュコマンドを定義

**実習31：カスタムコマンドの作成**
```bash
# コマンドディレクトリを作成
mkdir -p .claude/commands

# issueコマンドを作成
cat > .claude/commands/issue.md << 'EOF'
GitHubイシューを分析して修正してください: $ARGUMENTS

以下の手順に従ってください:
1. 'gh issue view'を使用してイシューの詳細を取得
2. イシューで説明されている問題を理解
3. 関連ファイルをコードベースで検索
4. 問題を修正するために必要な変更を実装
5. lintと型チェックが通ることを確認
6. 説明的なコミットメッセージを作成
7. プッシュしてPRを作成

すべてのGitHub関連タスクにはGitHub CLI ('gh')を使用してください。
EOF
```

### Tip 28: 引数付きスラッシュコマンド

**実習32：引数付きコマンドの使用**
```bash
claude
> /issue 39
```

---

## UI操作のコツ

### Tip 29: Tabキーでファイル名補完

**実習33：ファイル名補完**
```bash
> src/com[Tab]
# src/components/ に補完される
```

### Tip 30: Escキーで早期中断

**実習34：処理の中断**
```bash
> 複雑な処理を開始...
# 処理が想定と違う場合、Escキーで中断
```

### Tip 31: アンドゥ機能

**実習35：変更の取り消し**
```bash
> 前の変更を取り消してください
```

---

## バージョン管理との連携

### Tip 32: バージョン管理の活用

**実習36：Git操作の指示**
```bash
> 'feature-xyz'という名前の新しいブランチをチェックアウトして、これらの変更をコミットしてください
```

### Tip 33: 頻繁なコミット

**実習37：定期的なコミット**
```bash
> 変更を「機能Xを実装」というメッセージでコミットしてください
```

### Tip 34: コミットメッセージの自動生成

**実習38：コミットメッセージ生成**
```bash
> 現在の変更に適切なコミットメッセージを作成してコミットしてください
```

### Tip 35: 積極的なリバート

**実習39：変更の取り消し**
```bash
git log --oneline -5
git revert HEAD
```

### Tip 36: GitHub CLIのインストール

**実習40：GitHub CLI設定**
```bash
# macOSの場合
brew install gh

# 認証
gh auth login
```

### Tip 37: GitHub MCP

**実習41：GitHub MCP設定**
```bash
claude mcp add github-mcp -- github-mcp-server
```

### Tip 38: PR作成

**実習42：プルリクエスト作成**
```bash
> 現在のブランチでプルリクエストを作成してください
```

### Tip 39: PRレビュー

**実習43：PRレビュー**
```bash
> https://github.com/user/repo/pull/123 のコードレビューを行ってください
```

---

## コンテキスト管理

### Tip 40: 自動コンパクト機能の確認

**実習44：コンテキスト残量確認**
```bash
# UI右下のコンテキスト残量インジケーターを確認
```

### Tip 41: 手動コンパクト

**実習45：手動コンパクト実行**
```bash
> /compact
```

### Tip 42: クリア vs コンパクト

**実習46：コンテキストクリア**
```bash
> /clear
```

### Tip 43: スクラッチパッドの活用

**実習47：計画の文書化**
```bash
> game.jsのリファクタリングを行う前に、SCRATCHPAD.mdで計画を立ててください
```

### Tip 44: GitHub Issuesでの作業計画

**実習48：Issue駆動開発**
```bash
> GitHub Issue #123の内容を確認して、作業計画を立ててください
```

### Tip 45: コンテキストサイズとコスト

**実習49：コスト最適化**
```bash
# 不要なファイルを除外
> 現在のコンテキストから不要な情報を削除してください
```

### Tip 46: OpenTelemetryサポート

**実習50：テレメトリ設定**
```bash
# managed-settings.jsonファイルを作成
mkdir -p ~/Library/Application\ Support/ClaudeCode/
cat > ~/Library/Application\ Support/ClaudeCode/managed-settings.json << 'EOF'
{
  "env": {
    "CLAUDE_CODE_ENABLE_TELEMETRY": "1",
    "OTEL_METRICS_EXPORTER": "otlp",
    "OTEL_EXPORTER_OTLP_PROTOCOL": "grpc"
  }
}
EOF
```

### Tip 47: Claude Maxプランの活用

**実習51：プランの確認**
```bash
> 現在のプランと使用状況を確認してください
```

---

## 🎯 まとめ

このガイドでは、Claude Codeの47のベストプラクティスを実際に手を動かしながら学習しました。

### 学習したスキル
- ✅ 基本的なコマンドライン操作
- ✅ 画像との連携
- ✅ MCP（Model Context Protocol）の活用
- ✅ CLAUDE.mdファイルの効果的な使用
- ✅ カスタムスラッシュコマンドの作成
- ✅ UI操作のコツ
- ✅ バージョン管理との連携
- ✅ コンテキスト管理

### 次のステップ
1. 実際のプロジェクトでこれらのテクニックを適用
2. チーム内でのClaude Code活用方法を検討
3. 独自のワークフローを構築
4. より高度なMCPサーバーの活用を検討

### 参考リンク
- [Claude Code公式ドキュメント](https://docs.anthropic.com/claude-code)
- [MCP公式サイト](https://modelcontextprotocol.io/)
- [GitHub CLI](https://cli.github.com/)

---

## 📞 サポート

質問や問題がある場合は、Claude Codeに直接質問してください：

```bash
> このガイドの内容について質問があります
```

**Happy Coding with Claude Code! 🚀** 
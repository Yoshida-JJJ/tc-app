# 🤖 GA MCP Agent - インタラクティブ分析チャット

Google Analytics データを自然言語で分析するAIエージェント

## ✨ 主な機能

- 🗣️ **自然言語での分析依頼**
- 💬 **インタラクティブチャット** - 継続的な会話分析  
- ⏹️ **分析途中停止** - ⏹️ボタンやEscキーで中断可能
- 👥 **ユーザー属性分析** - 性別・年齢の詳細分析
- 📈 **トラフィック源分析** - 流入経路の解析
- 🔒 **Basic認証** - 2人限定のアクセス制御
- 📱 **レスポンシブUI** - モバイル対応

## ⚙️ 技術スタック

- **Backend**: Node.js + Express
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **Analytics**: Google Analytics 4 API
- **MCP**: @modelcontextprotocol/sdk
- **Deployment**: Vercel
- **Frontend**: Vanilla HTML/CSS/JavaScript

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして設定:

```bash
cp .env.example .env
```

以下の値を設定してください:

```
GOOGLE_ANALYTICS_VIEW_ID=your_view_id_here
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

### 3. Google Analytics API設定

1. [Google Cloud Console](https://console.cloud.google.com/)で新しいプロジェクトを作成
2. Google Analytics Reporting API を有効化
3. OAuth 2.0認証情報を作成
4. リダイレクトURIに `http://localhost:3000/auth/callback` を追加

### 4. アプリケーションの起動

開発モード:
```bash
npm run dev
```

本番モード:
```bash
npm start
```

## 使用方法

1. ブラウザで `http://localhost:3000` にアクセス
2. Google AnalyticsのビューIDを入力
3. 自然言語で質問を入力
4. 「分析実行」ボタンをクリック

### サンプル質問

- "今月の人気ページトップ10を教えて"
- "過去30日のトラフィック源と流入数を分析して"
- "先週と今週のセッション数を比較して"
- "直帰率が高いページを教えて"

## API エンドポイント

### POST /api/query
自然言語クエリの分析と実行

**Request Body:**
```json
{
  "query": "質問内容",
  "viewId": "GA_VIEW_ID"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {...},
  "data": {...},
  "report": {...}
}
```

### POST /api/interpret
質問の意図解析のみ実行

### POST /api/mcp/:tool
MCPツールの直接呼び出し

### GET /api/health
システムのヘルスチェック

## MCPツール

### get_ga_data
基本的なGoogle Analyticsデータ取得

**パラメータ:**
- `viewId`: ビューID
- `startDate`: 開始日 (YYYY-MM-DD)
- `endDate`: 終了日 (YYYY-MM-DD)
- `metrics`: メトリクス配列
- `dimensions`: ディメンション配列

### get_top_pages
人気ページランキングの取得

### get_traffic_sources
トラフィック源の分析

## プロジェクト構造

```
├── src/
│   ├── server.js          # メインサーバー
│   ├── mcp-server.js      # MCPサーバー
│   └── ai-agent.js        # AIエージェント
├── public/
│   └── index.html         # フロントエンド
├── package.json
├── .env.example
└── README.md
```

## 開発

### MCPサーバーの単体テスト

```bash
node src/mcp-server.js
```

### ログの確認

アプリケーションはコンソールに詳細なログを出力します。

## トラブルシューティング

### Google Analytics API認証エラー
- OAuth認証情報が正しく設定されているか確認
- リダイレクトURIが正確に設定されているか確認
- ビューIDが正しいか確認

### OpenAI API エラー
- API キーが正しく設定されているか確認
- 使用量制限に達していないか確認

### MCP通信エラー
- MCPサーバーが正常に起動しているか確認
- 標準入出力でのプロセス間通信が正常か確認

## ライセンス

MIT License

## 貢献

プルリクエストやIssueは歓迎です。

## サポート

問題が発生した場合は、Issueを作成してください。
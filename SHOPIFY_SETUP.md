# Shopify MCP サーバー設定ガイド

## 🛒 必要な環境変数

MCPサーバー経由でShopifyデータにアクセスするために、以下の環境変数を設定してください：

```bash
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔧 Shopifyアクセストークンの取得方法

### 1. Shopify管理画面にログイン
- あなたのShopifyストア管理画面にアクセス

### 2. プライベートアプリの作成
1. **設定** > **アプリと販売チャネル** > **アプリを開発する**
2. **プライベートアプリを作成する**をクリック
3. アプリ名を入力（例：「Analytics MCP Server」）

### 3. Admin API権限の設定
以下の権限を有効にしてください：
- ✅ **read_orders** - 注文データの読み取り
- ✅ **read_products** - 商品データの読み取り  
- ✅ **read_customers** - 顧客データの読み取り
- ✅ **read_inventory** - 在庫データの読み取り
- ✅ **read_analytics** - 分析データの読み取り

### 4. アクセストークンの取得
1. **保存**をクリック
2. **Admin APIアクセストークン**をコピー
3. 安全な場所に保存

## 🌐 Netlify環境変数の設定

### Netlify Web UI での設定
1. Netlifyダッシュボードにログイン
2. プロジェクトを選択
3. **Site settings** > **Environment variables**
4. **Add a variable**で以下を追加：

```
Variable name: SHOPIFY_STORE_URL
Value: your-store.myshopify.com

Variable name: SHOPIFY_ACCESS_TOKEN  
Value: shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Netlify CLI での設定（オプション）
```bash
netlify env:set SHOPIFY_STORE_URL "your-store.myshopify.com"
netlify env:set SHOPIFY_ACCESS_TOKEN "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

## ✅ 設定確認

環境変数設定後、以下のテストで接続を確認してください：

1. **基本接続テスト**: https://spectacular-caramel-1892fa.netlify.app/test
2. **チャットで確認**: 「shopifyの接続テスト」

## 🎯 使用可能なクエリ例

設定完了後、以下のクエリが使用可能になります：

- ✅ 「先月の売上、売れた商品情報をおしえて」
- ✅ 「shopifyの過去1週間の売上実績」
- ✅ 「shopifyで最も売れている商品5つ」
- ✅ 「shopifyの在庫が少ない商品」

## 🔒 セキュリティ注意事項

- アクセストークンは絶対に公開リポジトリにコミットしないでください
- 定期的にアクセストークンを更新してください
- 必要最小限の権限のみを付与してください
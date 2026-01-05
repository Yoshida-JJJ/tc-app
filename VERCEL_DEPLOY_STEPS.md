# Vercel無料デプロイ完全手順

## 🚀 Step 1: GitHubリポジトリ作成

1. [GitHub](https://github.com)で新しいリポジトリ作成
2. リポジトリ名：`ga-mcp-agent`
3. Private設定（推奨）

## 📁 Step 2: コードをGitHubにプッシュ

```bash
cd /Users/jun_yoshida/Documents/my-pj

# Gitリポジトリ初期化
git init

# ファイルを追加
git add .

# 初回コミット
git commit -m "Initial commit: GA MCP Agent with Claude AI"

# GitHubリポジトリに接続
git remote add origin https://github.com/YOUR_USERNAME/ga-mcp-agent.git

# プッシュ
git branch -M main
git push -u origin main
```

## 🌐 Step 3: Vercelデプロイ

1. **[vercel.com](https://vercel.com)**でアカウント作成
2. **Import Git Repository**をクリック
3. 作成したGitHubリポジトリを選択
4. **Deploy**をクリック

## ⚙️ Step 4: 環境変数設定

Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
GOOGLE_CLIENT_ID=939289626939-bvn56vmqjf4vd3fardo2sklkrdgqr4oo.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=https://YOUR_APP_NAME.vercel.app/auth/callback
ANTHROPIC_API_KEY=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
GA4_PROPERTY_ID=419224498
GOOGLE_ANALYTICS_VIEW_ID=G-H0NVZTZGMJ
BASIC_AUTH_USER=your_username
BASIC_AUTH_PASS=your_secure_password
```

## 🔐 Step 5: Google OAuth設定更新

1. **Google Cloud Console** → **APIs & Services** → **Credentials**
2. OAuth 2.0 Client ID を編集
3. **承認済みのリダイレクトURI**に追加：
   ```
   https://YOUR_APP_NAME.vercel.app/auth/callback
   ```
4. **保存**

## 🔄 Step 6: 再デプロイ

Vercel Dashboard → Deployments → **Redeploy**

## ✅ Step 7: 動作テスト

1. `https://YOUR_APP_NAME.vercel.app`にアクセス
2. Basic認証でログイン
3. Google認証実行
4. GA分析テスト

## 🔒 セキュリティ設定

### Basic認証ログイン
- ユーザー名: `your_username`
- パスワード: `your_secure_password`

### アクセス制限
- Basic認証により2人だけのアクセス
- HTTPS自動対応
- 環境変数で機密情報保護

## 📱 使用方法

1. **Webアクセス**: `https://YOUR_APP_NAME.vercel.app`
2. **認証**: Basic認証 → Google認証
3. **分析**: 自然言語でGA4データ分析

## 🔧 トラブルシューティング

### デプロイエラー
- Build Logs確認
- 環境変数設定確認
- Node.jsバージョン確認

### 認証エラー
- Google OAuth設定確認
- リダイレクトURI確認
- 環境変数確認

## 💰 コスト

- **Vercel**: 無料プラン（月100GB転送量）
- **Claude API**: 月$5無料クレジット
- **Google API**: 無料（制限内）

## 📞 サポート

問題が発生した場合は、以下を確認：
1. Vercel Build Logs
2. Browser Developer Console
3. 環境変数設定
4. Google Cloud Console設定
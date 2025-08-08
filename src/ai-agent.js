const Anthropic = require('@anthropic-ai/sdk');
const { v4: uuidv4 } = require('uuid');

class AIAgent {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.systemPrompt = `あなたはGoogle Analyticsデータを分析する専門のAIエージェントです。
ユーザーの自然言語での質問を受け取り、適切なGoogle Analyticsクエリを生成し、結果を分かりやすく解釈してレポートを作成します。

利用可能なツール:
1. get_ga_data - 基本的なGAデータ取得
2. get_top_pages - 人気ページランキング
3. get_traffic_sources - トラフィック源分析
4. get_demographics - ユーザー属性分析（性別・年齢）
5. get_interests - アフィニティカテゴリー分析

レスポンス形式:
- 質問の理解
- 必要なデータの特定
- MCPツール呼び出し指示
- データ解釈とインサイト
- 具体的な推奨アクション

日付形式はYYYY-MM-DD、期間は適切にデフォルト設定してください。`;
  }

  async processQuery(userQuery, viewId) {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        temperature: 0.7,
        system: this.systemPrompt,
        messages: [
          { 
            role: "user", 
            content: `Google Analyticsビュー ID: ${viewId}\n質問: ${userQuery}\n\n適切なMCPツールを使用してデータを取得し、分析結果を提供してください。`
          }
        ]
      });

      const aiResponse = response.content[0].text;
      
      // AIの回答から必要なアクションを解析
      const analysis = this.parseAIResponse(aiResponse, viewId);
      
      return {
        id: uuidv4(),
        query: userQuery,
        aiAnalysis: aiResponse,
        suggestedActions: analysis.actions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI処理エラー: ${error.message}`);
    }
  }

  parseAIResponse(aiResponse, viewId) {
    const actions = [];
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    // キーワードベースでアクションを推定
    if (aiResponse.includes('属性') || aiResponse.includes('性別') || aiResponse.includes('年齢') || aiResponse.includes('デモグラフィック')) {
      actions.push({
        tool: 'get_demographics',
        params: {
          viewId,
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today)
        }
      });
    }

    if (aiResponse.includes('アフィニティ') || aiResponse.includes('興味') || aiResponse.includes('関心') || aiResponse.includes('カテゴリー')) {
      actions.push({
        tool: 'get_interests',
        params: {
          viewId,
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today)
        }
      });
    }

    if (aiResponse.includes('人気ページ') || aiResponse.includes('トップページ') || aiResponse.includes('ページビュー')) {
      actions.push({
        tool: 'get_top_pages',
        params: {
          viewId,
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today),
          maxResults: 10
        }
      });
    }

    if (aiResponse.includes('トラフィック') || aiResponse.includes('流入') || aiResponse.includes('参照元')) {
      actions.push({
        tool: 'get_traffic_sources',
        params: {
          viewId,
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today)
        }
      });
    }

    // 基本データ取得（セッション、ユーザー数など）
    if (aiResponse.includes('セッション') || aiResponse.includes('ユーザー') || aiResponse.includes('PV') || actions.length === 0) {
      actions.push({
        tool: 'get_ga_data',
        params: {
          viewId,
          startDate: formatDate(thirtyDaysAgo),
          endDate: formatDate(today),
          metrics: ['sessions', 'totalUsers', 'screenPageViews'],
          dimensions: ['ga:date']
        }
      });
    }

    return { actions };
  }

  async generateReport(query, mcpResults, aiAnalysis) {
    try {
      const reportPrompt = `以下のGoogle Analyticsデータを基に、詳細なレポートを作成してください：

元の質問: ${query}
AI分析: ${aiAnalysis}

取得データ:
${JSON.stringify(mcpResults, null, 2)}

レポート要件:
1. データの要約と主要な発見
2. トレンドや異常値の特定
3. ビジネスへの影響分析
4. 具体的な改善提案
5. 次に取るべきアクション

日本語で分かりやすく、視覚的にも読みやすい形式で作成してください。`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0.5,
        system: "あなたはGoogle Analyticsのデータアナリストです。データを分析し、実用的なインサイトとレポートを提供します。",
        messages: [
          { role: "user", content: reportPrompt }
        ]
      });

      return {
        id: uuidv4(),
        originalQuery: query,
        report: response.content[0].text,
        data: mcpResults,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`レポート生成エラー: ${error.message}`);
    }
  }

  async interpretQuery(query) {
    const interpretationPrompt = `以下の質問を分析し、必要なGoogle Analyticsデータとクエリパラメータを特定してください：

質問: "${query}"

回答形式（JSON）:
{
  "intent": "質問の意図",
  "timeframe": "期間（デフォルト30日）",
  "metrics": ["必要なメトリクス配列"],
  "dimensions": ["必要なディメンション配列"],
  "tools": ["使用すべきMCPツール"],
  "priority": "high/medium/low"
}`;

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          { role: "user", content: interpretationPrompt }
        ]
      });

      return JSON.parse(response.content[0].text);
    } catch (error) {
      // フォールバック解析
      return this.fallbackInterpretation(query);
    }
  }

  async processQueryWithHistory(userQuery, viewId, conversationHistory) {
    try {
      // 会話履歴をフォーマット
      const historyContext = conversationHistory.slice(-4).map(msg => {
        if (msg.role === 'user') {
          return `ユーザー: ${msg.content}`;
        } else {
          return `アシスタント: ${msg.content.substring(0, 200)}...`;
        }
      }).join('\n');

      const contextualPrompt = `Google Analyticsビュー ID: ${viewId}
現在の質問: ${userQuery}

会話履歴:
${historyContext}

上記の会話の流れを考慮して、現在の質問に適切なMCPツールを使用してデータを取得し、分析結果を提供してください。
前回の分析結果を踏まえて、より深い洞察や追加の分析を行ってください。`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        temperature: 0.7,
        system: this.systemPrompt,
        messages: [
          { role: "user", content: contextualPrompt }
        ]
      });

      const aiResponse = response.content[0].text;
      const analysis = this.parseAIResponse(aiResponse, viewId);
      
      return {
        id: uuidv4(),
        query: userQuery,
        aiAnalysis: aiResponse,
        suggestedActions: analysis.actions,
        conversationContext: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`AI処理エラー: ${error.message}`);
    }
  }

  async generateReportWithHistory(query, mcpResults, aiAnalysis, conversationHistory) {
    try {
      // 前回の分析結果を取得
      const previousResponses = conversationHistory
        .filter(msg => msg.role === 'assistant')
        .slice(-2)
        .map(msg => msg.content.substring(0, 300))
        .join('\n---\n');

      const reportPrompt = `以下のGoogle Analyticsデータを基に、会話の流れを考慮した詳細なレポートを作成してください：

元の質問: ${query}
AI分析: ${aiAnalysis}

前回までの分析:
${previousResponses}

取得データ:
${JSON.stringify(mcpResults, null, 2)}

レポート要件:
1. 前回の分析からの継続性を考慮
2. データの要約と主要な発見
3. 前回と比較した新しいインサイト
4. トレンドや異常値の特定
5. ビジネスへの影響分析
6. 具体的な改善提案
7. 次に分析すべき項目の提案

日本語で分かりやすく、視覚的にも読みやすい形式で作成してください。`;

      const response = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        temperature: 0.5,
        system: "あなたはGoogle Analyticsのデータアナリストです。会話の流れを理解し、継続的で深い洞察を提供します。",
        messages: [
          { role: "user", content: reportPrompt }
        ]
      });

      return response.content[0].text;
    } catch (error) {
      throw new Error(`レポート生成エラー: ${error.message}`);
    }
  }

  fallbackInterpretation(query) {
    const query_lower = query.toLowerCase();
    
    if (query_lower.includes('ページ') || query_lower.includes('コンテンツ')) {
      return {
        intent: "ページパフォーマンス分析",
        timeframe: "30日",
        metrics: ["ga:pageviews", "ga:uniquePageviews"],
        dimensions: ["ga:pagePath"],
        tools: ["get_top_pages"],
        priority: "high"
      };
    }
    
    if (query_lower.includes('トラフィック') || query_lower.includes('流入')) {
      return {
        intent: "トラフィック分析",
        timeframe: "30日", 
        metrics: ["ga:sessions", "ga:users"],
        dimensions: ["ga:source", "ga:medium"],
        tools: ["get_traffic_sources"],
        priority: "high"
      };
    }
    
    return {
      intent: "基本分析",
      timeframe: "30日",
      metrics: ["ga:sessions", "ga:users", "ga:pageviews"],
      dimensions: ["ga:date"],
      tools: ["get_ga_data"],
      priority: "medium"
    };
  }
}

module.exports = AIAgent;
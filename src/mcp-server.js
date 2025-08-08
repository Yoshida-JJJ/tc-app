#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { google } = require('googleapis');
require('dotenv').config();

class GoogleAnalyticsMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'google-analytics-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    this.analyticsData = google.analyticsdata('v1beta');
    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_ga_data',
          description: 'Google Analyticsからデータを取得します',
          inputSchema: {
            type: 'object',
            properties: {
              viewId: {
                type: 'string',
                description: 'Google AnalyticsのビューID'
              },
              startDate: {
                type: 'string',
                description: '開始日 (YYYY-MM-DD形式)'
              },
              endDate: {
                type: 'string',
                description: '終了日 (YYYY-MM-DD形式)'
              },
              metrics: {
                type: 'array',
                items: { type: 'string' },
                description: '取得するメトリクス（例: ga:sessions, ga:users）'
              },
              dimensions: {
                type: 'array',
                items: { type: 'string' },
                description: '取得するディメンション（例: ga:date, ga:country）'
              }
            },
            required: ['viewId', 'startDate', 'endDate', 'metrics']
          }
        },
        {
          name: 'get_top_pages',
          description: '人気ページのランキングを取得します',
          inputSchema: {
            type: 'object',
            properties: {
              viewId: { type: 'string', description: 'ビューID' },
              startDate: { type: 'string', description: '開始日' },
              endDate: { type: 'string', description: '終了日' },
              maxResults: { type: 'number', description: '最大結果数', default: 10 }
            },
            required: ['viewId', 'startDate', 'endDate']
          }
        },
        {
          name: 'get_traffic_sources',
          description: 'トラフィック源の情報を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              viewId: { type: 'string', description: 'ビューID' },
              startDate: { type: 'string', description: '開始日' },
              endDate: { type: 'string', description: '終了日' }
            },
            required: ['viewId', 'startDate', 'endDate']
          }
        },
        {
          name: 'get_demographics',
          description: 'ユーザーの属性情報（性別・年齢）を取得します',
          inputSchema: {
            type: 'object',
            properties: {
              viewId: { type: 'string', description: 'ビューID' },
              startDate: { type: 'string', description: '開始日' },
              endDate: { type: 'string', description: '終了日' }
            },
            required: ['viewId', 'startDate', 'endDate']
          }
        },
        {
          name: 'get_interests',
          description: 'ユーザーのアフィニティカテゴリーを取得します',
          inputSchema: {
            type: 'object',
            properties: {
              viewId: { type: 'string', description: 'ビューID' },
              startDate: { type: 'string', description: '開始日' },
              endDate: { type: 'string', description: '終了日' }
            },
            required: ['viewId', 'startDate', 'endDate']
          }
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_ga_data':
            return await this.getGAData(args);
          case 'get_top_pages':
            return await this.getTopPages(args);
          case 'get_traffic_sources':
            return await this.getTrafficSources(args);
          case 'get_demographics':
            return await this.getDemographics(args);
          case 'get_interests':
            return await this.getInterests(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error('MCP Server Error:', error);
        console.error('Error stack:', error.stack);
        return {
          content: [
            {
              type: 'text',
              text: `エラー: ${error.message}\nStack: ${error.stack}`
            }
          ]
        };
      }
    });
  }

  async getGAData(args) {
    const { viewId, startDate, endDate, metrics, dimensions = [], authTokens } = args;

    // 認証トークンを使用（パラメータまたはグローバル）
    const tokens = authTokens || global.authTokens;
    if (tokens) {
      this.auth.setCredentials(tokens);
    } else {
      throw new Error('認証トークンが設定されていません。Google認証を完了してください。');
    }

    // GA4用のメトリクスとディメンションに変換
    const ga4Metrics = metrics.map(m => ({ name: m.replace('ga:', '') }));
    const ga4Dimensions = dimensions.map(d => ({ name: d.replace('ga:', '') }));

    // GA4 Property IDの処理
    let propertyId;
    if (viewId.startsWith('G-')) {
      // G-から始まる場合は環境変数の数値IDを使用
      propertyId = process.env.GA4_PROPERTY_ID || '419224498';
    } else {
      propertyId = viewId;
    }
    
    const response = await this.analyticsData.properties.runReport({
      auth: this.auth,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: ga4Metrics.length > 0 ? ga4Metrics : [{ name: 'sessions' }],
        dimensions: ga4Dimensions.length > 0 ? ga4Dimensions : [{ name: 'date' }]
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            dimensionHeaders: response.data.dimensionHeaders,
            metricHeaders: response.data.metricHeaders,
            rows: response.data.rows || [],
            rowCount: response.data.rowCount
          }, null, 2)
        }
      ]
    };
  }

  async getTopPages(args) {
    const { viewId, startDate, endDate, maxResults = 10, authTokens } = args;

    // 認証トークンを使用（パラメータまたはグローバル）
    const tokens = authTokens || global.authTokens;
    if (tokens) {
      this.auth.setCredentials(tokens);
    } else {
      throw new Error('認証トークンが設定されていません。Google認証を完了してください。');
    }

    // GA4 Property IDの処理
    let propertyId;
    if (viewId.startsWith('G-')) {
      // G-から始まる場合は環境変数の数値IDを使用
      propertyId = process.env.GA4_PROPERTY_ID || '419224498';
    } else {
      propertyId = viewId;
    }
    
    const response = await this.analyticsData.properties.runReport({
      auth: this.auth,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'averageSessionDuration' }
        ],
        dimensions: [
          { name: 'pagePath' },
          { name: 'pageTitle' }
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: maxResults
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: `人気ページランキング (${startDate} - ${endDate}):\n\n${
            response.data.rows?.map((row, index) => 
              `${index + 1}. ${row.dimensionValues[1].value}\n   URL: ${row.dimensionValues[0].value}\n   PV: ${row.metricValues[0].value}, セッション: ${row.metricValues[1].value}, 滞在時間: ${Math.round(row.metricValues[2].value)}秒\n`
            ).join('\n') || 'データがありません'
          }`
        }
      ]
    };
  }

  async getTrafficSources(args) {
    const { viewId, startDate, endDate, authTokens } = args;

    // 認証トークンを使用（パラメータまたはグローバル）
    const tokens = authTokens || global.authTokens;
    if (tokens) {
      this.auth.setCredentials(tokens);
    } else {
      throw new Error('認証トークンが設定されていません。Google認証を完了してください。');
    }

    // GA4 Property IDの処理
    let propertyId;
    if (viewId.startsWith('G-')) {
      // G-から始まる場合は環境変数の数値IDを使用
      propertyId = process.env.GA4_PROPERTY_ID || '419224498';
    } else {
      propertyId = viewId;
    }
    
    const response = await this.analyticsData.properties.runReport({
      auth: this.auth,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' }
        ],
        dimensions: [
          { name: 'source' },
          { name: 'medium' }
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: `トラフィック源 (${startDate} - ${endDate}):\n\n${
            response.data.rows?.map(row => 
              `${row.dimensionValues[0].value}/${row.dimensionValues[1].value}: セッション ${row.metricValues[0].value}, ユーザー ${row.metricValues[1].value}`
            ).join('\n') || 'データがありません'
          }`
        }
      ]
    };
  }

  async getDemographics(args) {
    const { viewId, startDate, endDate, authTokens } = args;

    // 認証トークンを使用（パラメータまたはグローバル）
    const tokens = authTokens || global.authTokens;
    if (tokens) {
      this.auth.setCredentials(tokens);
    } else {
      throw new Error('認証トークンが設定されていません。Google認証を完了してください。');
    }

    // GA4 Property IDの処理
    let propertyId;
    if (viewId.startsWith('G-')) {
      // G-から始まる場合は環境変数の数値IDを使用
      propertyId = process.env.GA4_PROPERTY_ID || '419224498';
    } else {
      propertyId = viewId;
    }

    const response = await this.analyticsData.properties.runReport({
      auth: this.auth,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' }
        ],
        dimensions: [
          { name: 'userGender' },
          { name: 'userAgeBracket' }
        ]
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: `ユーザー属性分析 (${startDate} - ${endDate}):\n\n${[
            response.data.rows?.map(row => 
              `性別: ${row.dimensionValues[0].value}, 年齢: ${row.dimensionValues[1].value} - セッション: ${row.metricValues[0].value}, ユーザー: ${row.metricValues[1].value}`
            ).join('\n') || 'データがありません'
          ]}`
        }
      ]
    };
  }

  async getInterests(args) {
    const { viewId, startDate, endDate, authTokens } = args;

    // 認証トークンを使用（パラメータまたはグローバル）
    const tokens = authTokens || global.authTokens;
    if (tokens) {
      this.auth.setCredentials(tokens);
    } else {
      throw new Error('認証トークンが設定されていません。Google認証を完了してください。');
    }

    // GA4 Property IDの処理
    let propertyId;
    if (viewId.startsWith('G-')) {
      // G-から始まる場合は環境変数の数値IDを使用
      propertyId = process.env.GA4_PROPERTY_ID || '419224498';
    } else {
      propertyId = viewId;
    }

    const response = await this.analyticsData.properties.runReport({
      auth: this.auth,
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' }
        ],
        dimensions: [
          { name: 'interestAffinityCategory' }
        ]
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: `アフィニティカテゴリー分析 (${startDate} - ${endDate}):\n\n${
            response.data.rows?.map(row => 
              `カテゴリー: ${row.dimensionValues[0].value} - セッション: ${row.metricValues[0].value}, ユーザー: ${row.metricValues[1].value}`
            ).join('\n') || 'データがありません'
          }`
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

if (require.main === module) {
  const server = new GoogleAnalyticsMCPServer();
  server.run().catch(console.error);
}

module.exports = GoogleAnalyticsMCPServer;
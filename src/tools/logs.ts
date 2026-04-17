import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerLogTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'access-log',
    'アクセスログを取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（必須、Punycodeで指定）'),
      lines: z.number().optional().describe('取得行数（末尾から）'),
      keyword: z.string().optional().describe('絞り込みキーワード'),
    },
    async ({ servername, domain, lines, keyword }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('access-log 実行', { servername: name, domain });
        const query: Record<string, string> = { domain };
        if (lines !== undefined) query.lines = String(lines);
        if (keyword !== undefined) query.keyword = keyword;
        return await apiClient.get(apiClient.serverPath(name, '/access-log'), query);
      });
    },
  );

  server.tool(
    'error-log',
    'エラーログを取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（必須、Punycodeで指定）'),
      lines: z.number().optional().describe('取得行数（末尾から）'),
      keyword: z.string().optional().describe('絞り込みキーワード'),
    },
    async ({ servername, domain, lines, keyword }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('error-log 実行', { servername: name, domain });
        const query: Record<string, string> = { domain };
        if (lines !== undefined) query.lines = String(lines);
        if (keyword !== undefined) query.keyword = keyword;
        return await apiClient.get(apiClient.serverPath(name, '/error-log'), query);
      });
    },
  );
}

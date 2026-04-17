import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerServerInfoTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'server-info',
    'サーバースペック・バージョン情報を取得します',
    { servername: servernameSchema },
    async ({ servername }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('server-info 実行', { servername: name });
        return await apiClient.get(apiClient.serverPath(name, '/server-info'));
      });
    },
  );

  server.tool(
    'server-usage',
    'ディスク使用量・各種設定件数を取得します',
    { servername: servernameSchema },
    async ({ servername }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('server-usage 実行', { servername: name });
        return await apiClient.get(apiClient.serverPath(name, '/server-info/usage'));
      });
    },
  );
}

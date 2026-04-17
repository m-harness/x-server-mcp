import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { Logger } from '../utils/logger.js';
import { handleToolExecution } from './helpers.js';

export function registerApiKeyTools(
  server: McpServer,
  apiClient: XServerApiClient,
  logger: Logger,
): void {
  server.tool(
    'apikey-info',
    '認証中のAPIキー情報を取得します',
    {},
    async () => {
      return handleToolExecution(async () => {
        logger.info('apikey-info 実行');
        return await apiClient.get('/v1/me');
      });
    },
  );
}

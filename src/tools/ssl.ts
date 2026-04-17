import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerSslTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'ssl-list',
    'SSL設定一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ssl-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/ssl'), query);
      });
    },
  );

  server.tool(
    'ssl-create',
    '無料SSLをインストールします。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      common_name: z.string().describe('ドメイン名（Punycodeで指定）'),
    },
    async ({ servername, common_name }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ssl-create 実行', { servername: name, common_name });
        return await apiClient.post(apiClient.serverPath(name, '/ssl'), { common_name });
      });
    },
  );

  server.tool(
    'ssl-delete',
    '無料SSLをアンインストールします。【警告】SSL証明書を削除するとHTTPS通信ができなくなります。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      common_name: z.string().describe('ドメイン名（Punycodeで指定）'),
    },
    async ({ servername, common_name }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('ssl-delete 実行', { servername: name, common_name });
        return await apiClient.delete(
          apiClient.serverPath(name, `/ssl/${encodeURIComponent(common_name)}`),
        );
      });
    },
  );
}

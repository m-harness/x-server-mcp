import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerPhpVersionTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'php-version-list',
    'PHPバージョン設定一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('php-version-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/php-version'), query);
      });
    },
  );

  server.tool(
    'php-version-update',
    'PHPバージョンを変更します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().describe('ドメイン名（Punycodeで指定）'),
      version: z.string().describe('PHPバージョン（例: 8.2）'),
    },
    async ({ servername, domain, version }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('php-version-update 実行', { servername: name, domain, version });
        return await apiClient.put(
          apiClient.serverPath(name, `/php-version/${encodeURIComponent(domain)}`),
          { version },
        );
      });
    },
  );
}

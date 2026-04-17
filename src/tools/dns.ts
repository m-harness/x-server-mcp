import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { XServerApiClient } from '../client/api-client.js';
import type { AppConfig } from '../utils/config.js';
import type { Logger } from '../utils/logger.js';
import { servernameSchema, resolveServername, handleToolExecution } from './helpers.js';

export function registerDnsTools(
  server: McpServer,
  apiClient: XServerApiClient,
  config: AppConfig,
  logger: Logger,
): void {
  server.tool(
    'dns-list',
    'DNSレコード一覧を取得します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().optional().describe('ドメインでフィルタ（Punycodeで指定）'),
    },
    async ({ servername, domain }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('dns-list 実行', { servername: name });
        const query = domain ? { domain } : undefined;
        return await apiClient.get(apiClient.serverPath(name, '/dns'), query);
      });
    },
  );

  server.tool(
    'dns-create',
    'DNSレコードを追加します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      domain: z.string().max(253).describe('ドメイン名（Punycodeで指定）'),
      host: z.string().max(255).describe('ホスト名（@はapex）'),
      type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA']).describe('レコードタイプ'),
      content: z.string().describe('レコード値'),
      ttl: z.number().min(60).max(86400).optional().describe('TTL（デフォルト: 3600）'),
      priority: z.number().optional().describe('優先度（MXレコード用）'),
    },
    async ({ servername, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('dns-create 実行', { servername: name, domain: body.domain, type: body.type });
        return await apiClient.post(apiClient.serverPath(name, '/dns'), body);
      });
    },
  );

  server.tool(
    'dns-update',
    'DNSレコードを変更します。日本語ドメインはPunycodeで指定してください',
    {
      servername: servernameSchema,
      dns_id: z.number().describe('DNS ID'),
      domain: z.string().max(253).optional().describe('ドメイン名（Punycodeで指定）'),
      host: z.string().max(255).optional().describe('ホスト名'),
      type: z.enum(['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA']).optional().describe('レコードタイプ'),
      content: z.string().optional().describe('レコード値'),
      ttl: z.number().min(60).max(86400).optional().describe('TTL'),
      priority: z.number().optional().describe('優先度'),
    },
    async ({ servername, dns_id, ...body }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('dns-update 実行', { servername: name, dns_id: String(dns_id) });
        return await apiClient.put(apiClient.serverPath(name, `/dns/${dns_id}`), body);
      });
    },
  );

  server.tool(
    'dns-delete',
    'DNSレコードを削除します。【警告】この操作は元に戻せません',
    {
      servername: servernameSchema,
      dns_id: z.number().describe('DNS ID'),
    },
    async ({ servername, dns_id }) => {
      return handleToolExecution(async () => {
        const name = resolveServername(servername, config);
        logger.info('dns-delete 実行', { servername: name, dns_id: String(dns_id) });
        return await apiClient.delete(apiClient.serverPath(name, `/dns/${dns_id}`));
      });
    },
  );
}

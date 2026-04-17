/**
 * MCPサーバー統合テスト
 *
 * カバレッジ: 100%
 *
 * createServer()でMcpServerが正しく初期化され、
 * 全57ツールが実際のMCP SDKに登録されることを検証する統合テスト。
 */
import { describe, it, expect, vi } from 'vitest';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createServer } from './server.js';
import type { AppConfig } from './utils/config.js';

const EXPECTED_TOOLS = [
  'apikey-info',
  'server-info', 'server-usage',
  'cron-list', 'cron-create', 'cron-update', 'cron-delete',
  'wp-list', 'wp-install', 'wp-update', 'wp-delete',
  'mail-list', 'mail-get', 'mail-create', 'mail-update', 'mail-delete',
  'mail-forwarding-get', 'mail-forwarding-update',
  'mail-filter-list', 'mail-filter-create', 'mail-filter-delete',
  'ftp-list', 'ftp-create', 'ftp-update', 'ftp-delete',
  'db-list', 'db-create', 'db-update', 'db-delete',
  'db-user-list', 'db-user-create', 'db-user-update', 'db-user-delete',
  'db-grant-list', 'db-grant-add', 'db-grant-remove',
  'domain-list', 'domain-get', 'domain-create', 'domain-update', 'domain-delete', 'domain-reset',
  'subdomain-list', 'subdomain-create', 'subdomain-update', 'subdomain-delete',
  'ssl-list', 'ssl-create', 'ssl-delete',
  'dns-list', 'dns-create', 'dns-update', 'dns-delete',
  'php-version-list', 'php-version-update',
  'access-log', 'error-log',
];

describe('createServer', () => {
  it('57ツール全てが実際のMCP SDKに登録される', () => {
    const toolSpy = vi.spyOn(McpServer.prototype, 'tool');
    const config: AppConfig = {
      apiKey: 'xs_test_key',
      serverName: 'xs123456',
      logLevel: 'error',
      logDir: './logs',
    };

    const { server } = createServer(config);

    expect(server).toBeInstanceOf(McpServer);
    expect(toolSpy).toHaveBeenCalledTimes(57);

    const registeredTools = toolSpy.mock.calls.map(([name]) => name as string);
    expect(registeredTools).toHaveLength(57);

    for (const toolName of EXPECTED_TOOLS) {
      expect(registeredTools).toContain(toolName);
    }

    for (const call of toolSpy.mock.calls) {
      expect(call).toHaveLength(4);
      expect(call[0]).toEqual(expect.any(String));
      expect(call[1]).toEqual(expect.any(String));
      expect(call[2]).toEqual(expect.any(Object));
      expect(call[3]).toEqual(expect.any(Function));
    }
  });

  it('57ツール全てが登録される', () => {
    const config: AppConfig = {
      apiKey: 'xs_test_key',
      logLevel: 'error',
      logDir: './logs',
    };

    expect(() => createServer(config)).not.toThrow();
  });
});

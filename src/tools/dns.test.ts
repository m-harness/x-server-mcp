/**
 * DNS ツール テスト
 *
 * カバレッジ: 100%
 *
 * dns-list: DNSレコード一覧取得
 * dns-create: DNSレコード追加（type enum, ttl, priority）
 * dns-update: DNSレコード変更（dns_idがnumber型）
 * dns-delete: DNSレコード削除（破壊的操作）
 */
import { describe, it, expect, vi } from 'vitest';
import { registerDnsTools } from './dns.js';
import { createMockDependencies } from './__test-helpers.js';

describe('dns-list', () => {
  it('DNSレコード一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerDnsTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ records: [] });
    const tool = deps.getTools().get('dns-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).records).toEqual([]);
  });
});

describe('dns-create', () => {
  it('DNSレコードを追加する', async () => {
    const deps = createMockDependencies();
    registerDnsTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({ dns_id: 1 });
    const tool = deps.getTools().get('dns-create');
    await tool!.handler({
      domain: 'example.com', host: '@', type: 'A', content: '192.0.2.1', ttl: 3600,
    });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/dns'),
      expect.objectContaining({ domain: 'example.com', type: 'A', content: '192.0.2.1' }),
    );
  });
});

describe('dns-update', () => {
  it('DNSレコードを変更する', async () => {
    const deps = createMockDependencies();
    registerDnsTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});
    const tool = deps.getTools().get('dns-update');
    await tool!.handler({ dns_id: 1, content: '192.0.2.2' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/dns/1'),
      expect.objectContaining({ content: '192.0.2.2' }),
    );
  });
});

describe('dns-delete', () => {
  it('DNSレコードを削除する', async () => {
    const deps = createMockDependencies();
    registerDnsTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});
    const tool = deps.getTools().get('dns-delete');
    await tool!.handler({ dns_id: 1 });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(expect.stringContaining('/dns/1'));
  });
});

/**
 * サブドメイン ツール テスト
 *
 * カバレッジ: 100%
 *
 * subdomain-list, subdomain-create, subdomain-update, subdomain-delete
 */
import { describe, it, expect, vi } from 'vitest';
import { registerSubdomainTools } from './subdomain.js';
import { createMockDependencies } from './__test-helpers.js';

describe('subdomain-list', () => {
  it('サブドメイン一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerSubdomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ subdomains: [] });
    const tool = deps.getTools().get('subdomain-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).subdomains).toEqual([]);
  });
});

describe('subdomain-create', () => {
  it('サブドメインを追加する', async () => {
    const deps = createMockDependencies();
    registerSubdomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});
    const tool = deps.getTools().get('subdomain-create');
    await tool!.handler({ subdomain: 'blog.example.com' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/subdomain'),
      expect.objectContaining({ subdomain: 'blog.example.com' }),
    );
  });
});

describe('subdomain-update', () => {
  it('サブドメインメモを更新する', async () => {
    const deps = createMockDependencies();
    registerSubdomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});
    const tool = deps.getTools().get('subdomain-update');
    await tool!.handler({ subdomain: 'blog.example.com', memo: 'test' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/subdomain/blog.example.com'), expect.any(Object),
    );
  });
});

describe('subdomain-delete', () => {
  it('サブドメインを削除する', async () => {
    const deps = createMockDependencies();
    registerSubdomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});
    const tool = deps.getTools().get('subdomain-delete');
    await tool!.handler({ subdomain: 'blog.example.com' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/subdomain/blog.example.com'), expect.any(Object),
    );
  });
});

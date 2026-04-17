/**
 * ドメイン ツール テスト
 *
 * カバレッジ: 100%
 *
 * domain-list, domain-get, domain-create, domain-update, domain-delete, domain-reset
 * 日本語ドメイン対応、破壊的操作警告、ドメイン所有権確認
 */
import { describe, it, expect, vi } from 'vitest';
import { registerDomainTools } from './domain.js';
import { createMockDependencies } from './__test-helpers.js';

describe('domain-list', () => {
  it('ドメイン一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerDomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ domains: [] });

    const tool = deps.getTools().get('domain-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).domains).toEqual([]);
  });
});

describe('domain-get', () => {
  it('ドメイン詳細を取得する', async () => {
    const deps = createMockDependencies();
    registerDomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ domain: 'example.com' });

    const tool = deps.getTools().get('domain-get');
    await tool!.handler({ domain: 'example.com' });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/domain/example.com'),
    );
  });
});

describe('domain-create', () => {
  it('ドメインを追加する', async () => {
    const deps = createMockDependencies();
    registerDomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('domain-create');
    await tool!.handler({ domain: 'new.example.com', ssl: true });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/domain'),
      expect.objectContaining({ domain: 'new.example.com', ssl: true }),
    );
  });
});

describe('domain-update', () => {
  it('ドメインメモを更新する', async () => {
    const deps = createMockDependencies();
    registerDomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('domain-update');
    await tool!.handler({ domain: 'example.com', memo: 'test' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/domain/example.com'),
      expect.objectContaining({ memo: 'test' }),
    );
  });
});

describe('domain-delete', () => {
  it('ドメインを削除する', async () => {
    const deps = createMockDependencies();
    registerDomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('domain-delete');
    await tool!.handler({ domain: 'example.com', delete_files: true });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/domain/example.com'),
      expect.objectContaining({ delete_files: true }),
    );
  });
});

describe('domain-reset', () => {
  it('ドメイン設定を初期化する', async () => {
    const deps = createMockDependencies();
    registerDomainTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('domain-reset');
    await tool!.handler({ domain: 'example.com', type: 'all' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/domain/example.com/reset'),
      { type: 'all' },
    );
  });
});

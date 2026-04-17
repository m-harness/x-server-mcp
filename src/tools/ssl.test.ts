/**
 * SSL ツール テスト
 *
 * カバレッジ: 100%
 *
 * ssl-list: SSL設定一覧取得
 * ssl-create: 無料SSLインストール
 * ssl-delete: 無料SSLアンインストール（HTTPS不可警告）
 */
import { describe, it, expect, vi } from 'vitest';
import { registerSslTools } from './ssl.js';
import { createMockDependencies } from './__test-helpers.js';

describe('ssl-list', () => {
  it('SSL設定一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerSslTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ ssls: [] });
    const tool = deps.getTools().get('ssl-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).ssls).toEqual([]);
  });

  it('ドメインでフィルタできる', async () => {
    const deps = createMockDependencies();
    registerSslTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ ssls: [] });
    const tool = deps.getTools().get('ssl-list');
    await tool!.handler({ domain: 'example.com' });
    expect(deps.apiClient.get).toHaveBeenCalledWith(expect.any(String), { domain: 'example.com' });
  });
});

describe('ssl-create', () => {
  it('SSLをインストールする', async () => {
    const deps = createMockDependencies();
    registerSslTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});
    const tool = deps.getTools().get('ssl-create');
    await tool!.handler({ common_name: 'example.com' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/ssl'), { common_name: 'example.com' },
    );
  });
});

describe('ssl-delete', () => {
  it('SSLをアンインストールする', async () => {
    const deps = createMockDependencies();
    registerSslTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});
    const tool = deps.getTools().get('ssl-delete');
    await tool!.handler({ common_name: 'example.com' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/ssl/example.com'),
    );
  });
});

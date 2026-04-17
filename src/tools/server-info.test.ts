/**
 * サーバー情報ツール テスト
 *
 * カバレッジ: 100%
 *
 * server-info: サーバースペック・バージョン情報を取得
 * server-usage: ディスク使用量・各種設定件数を取得
 * 両ツールともservernameパラメータ（任意、環境変数フォールバック）を持つ。
 */
import { describe, it, expect, vi } from 'vitest';
import { registerServerInfoTools } from './server-info.js';
import { createMockDependencies } from './__test-helpers.js';

describe('server-info', () => {
  it('サーバー情報を取得して返す', async () => {
    const { server, apiClient, config, logger, getTools } = createMockDependencies();
    registerServerInfoTools(server, apiClient, config, logger);

    const mockData = { server_id: 1, hostname: 'sv1.xserver.ne.jp' };
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);

    const tool = getTools().get('server-info');
    const result = await tool!.handler({});
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.hostname).toBe('sv1.xserver.ne.jp');
  });

  it('引数でサーバー名を指定できる', async () => {
    const { server, apiClient, config, logger, getTools } = createMockDependencies();
    registerServerInfoTools(server, apiClient, config, logger);

    vi.mocked(apiClient.get).mockResolvedValueOnce({});
    const tool = getTools().get('server-info');
    await tool!.handler({ servername: 'custom_sv' });
    expect(apiClient.serverPath).toHaveBeenCalledWith('custom_sv', '/server-info');
  });

  it('サーバー名がない場合はエラーを返す', async () => {
    const { server, apiClient, config, logger, getTools } = createMockDependencies({ serverName: undefined });
    registerServerInfoTools(server, apiClient, config, logger);

    const tool = getTools().get('server-info');
    const result = await tool!.handler({});
    expect((result as any).isError).toBe(true);
  });
});

describe('server-usage', () => {
  it('サーバー使用量を取得して返す', async () => {
    const { server, apiClient, config, logger, getTools } = createMockDependencies();
    registerServerInfoTools(server, apiClient, config, logger);

    const mockData = { disk: { quota_gb: 300, used_gb: 10 } };
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockData);

    const tool = getTools().get('server-usage');
    const result = await tool!.handler({});
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.disk.quota_gb).toBe(300);
  });
});

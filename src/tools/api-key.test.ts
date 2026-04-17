/**
 * APIキーツール テスト
 *
 * カバレッジ: 100%
 *
 * apikey-info: 認証中のAPIキー情報を取得する。
 * パスパラメータなし、ベースパス /v1/me へのGETリクエスト。
 */
import { describe, it, expect, vi } from 'vitest';
import { registerApiKeyTools } from './api-key.js';
import { createMockDependencies } from './__test-helpers.js';

describe('apikey-info', () => {
  it('APIキー情報を取得して返す', async () => {
    const { server, apiClient, logger, getTools } = createMockDependencies();
    registerApiKeyTools(server, apiClient, logger);

    const tool = getTools().get('apikey-info');
    expect(tool).toBeDefined();

    const mockResponse = {
      service_type: 'xserver',
      expires_at: null,
      servername: 'xs123456',
      permission_type: 'full',
    };
    vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse);

    const result = await tool!.handler({});
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.permission_type).toBe('full');
    expect(apiClient.get).toHaveBeenCalledWith('/v1/me');
  });

  it('エラー時はMCPエラー形式で返す', async () => {
    const { server, apiClient, logger, getTools } = createMockDependencies();
    registerApiKeyTools(server, apiClient, logger);

    const { XServerApiError } = await import('../utils/errors.js');
    vi.mocked(apiClient.get).mockRejectedValueOnce(
      new XServerApiError(401, 'UNAUTHORIZED', '認証エラー'),
    );

    const tool = getTools().get('apikey-info');
    const result = await tool!.handler({});
    expect((result as any).isError).toBe(true);
  });
});

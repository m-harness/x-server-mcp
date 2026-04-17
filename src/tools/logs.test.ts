/**
 * ログ ツール テスト
 *
 * カバレッジ: 100%
 *
 * access-log: アクセスログ取得（domain必須、lines/keywordオプション）
 * error-log: エラーログ取得（domain必須、lines/keywordオプション）
 */
import { ZodError } from 'zod';
import { describe, it, expect, vi } from 'vitest';
import { registerLogTools } from './logs.js';
import { createMockDependencies } from './__test-helpers.js';

describe('access-log', () => {
  it('アクセスログを取得する', async () => {
    const deps = createMockDependencies();
    registerLogTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ domain: 'example.com', log: 'GET / 200' });
    const tool = deps.getTools().get('access-log');
    const result = await tool!.handler({ domain: 'example.com' });
    expect(JSON.parse((result as any).content[0].text)).toEqual({
      domain: 'example.com',
      log: 'GET / 200',
    });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/access-log'), { domain: 'example.com' },
    );
  });

  it('lines/keywordオプションを付与する', async () => {
    const deps = createMockDependencies();
    registerLogTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ domain: 'example.com', log: 'GET /missing 404' });
    const tool = deps.getTools().get('access-log');
    await tool!.handler({ domain: 'example.com', lines: 100, keyword: '404' });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.any(String), { domain: 'example.com', lines: '100', keyword: '404' },
    );
  });

  it('domainがない入力はZodErrorで失敗する', async () => {
    const deps = createMockDependencies();
    registerLogTools(deps.server, deps.apiClient, deps.config, deps.logger);
    const tool = deps.getTools().get('access-log');

    await expect(tool!.handler({})).rejects.toBeInstanceOf(ZodError);
  });
});

describe('error-log', () => {
  it('エラーログを取得する', async () => {
    const deps = createMockDependencies();
    registerLogTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ domain: 'example.com', log: '[php:error] fatal' });
    const tool = deps.getTools().get('error-log');
    const result = await tool!.handler({ domain: 'example.com' });
    expect(JSON.parse((result as any).content[0].text)).toEqual({
      domain: 'example.com',
      log: '[php:error] fatal',
    });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/error-log'), { domain: 'example.com' },
    );
  });
});

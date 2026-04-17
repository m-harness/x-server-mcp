/**
 * PHPバージョン ツール テスト
 *
 * カバレッジ: 100%
 *
 * php-version-list: PHPバージョン設定一覧取得
 * php-version-update: PHPバージョン変更
 */
import { describe, it, expect, vi } from 'vitest';
import { registerPhpVersionTools } from './php-version.js';
import { createMockDependencies } from './__test-helpers.js';

describe('php-version-list', () => {
  it('PHPバージョン一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerPhpVersionTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ php_versions: [] });
    const tool = deps.getTools().get('php-version-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).php_versions).toEqual([]);
  });
});

describe('php-version-update', () => {
  it('PHPバージョンを変更する', async () => {
    const deps = createMockDependencies();
    registerPhpVersionTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});
    const tool = deps.getTools().get('php-version-update');
    await tool!.handler({ domain: 'example.com', version: '8.2' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/php-version/example.com'), { version: '8.2' },
    );
  });
});

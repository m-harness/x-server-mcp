/**
 * メール振り分け ツール テスト
 *
 * カバレッジ: 100%
 *
 * mail-filter-list: 振り分けルール一覧取得
 * mail-filter-create: 振り分けルール追加（conditions配列+actionオブジェクト）
 * mail-filter-delete: 振り分けルール削除（破壊的操作）
 */
import { z } from 'zod';
import { describe, it, expect, vi } from 'vitest';
import { registerMailFilterTools } from './mail-filter.js';
import { createMockDependencies } from './__test-helpers.js';

describe('mail-filter-list', () => {
  it('振り分けルール一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerMailFilterTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ filters: [] });

    const tool = deps.getTools().get('mail-filter-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).filters).toEqual([]);
  });
});

describe('mail-filter-create', () => {
  it('振り分けルールを作成する', async () => {
    const deps = createMockDependencies();
    registerMailFilterTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({ id: 'filter_hash_1' });

    const tool = deps.getTools().get('mail-filter-create');
    await tool!.handler({
      domain: 'example.com',
      conditions: [{ keyword: 'spam', field: 'subject', match_type: 'contain' }],
      action: { type: 'trash', method: 'move' },
    });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/mail-filter'),
      expect.objectContaining({
        domain: 'example.com',
        conditions: [{ keyword: 'spam', field: 'subject', match_type: 'contain' }],
      }),
    );
  });

  it('不正なenum値は入力検証で失敗する', async () => {
    const deps = createMockDependencies();
    registerMailFilterTools(deps.server, deps.apiClient, deps.config, deps.logger);

    const tool = deps.getTools().get('mail-filter-create');
    await expect(tool!.handler({
      domain: 'example.com',
      conditions: [{ keyword: 'spam', field: 'invalid', match_type: 'contain' }],
      action: { type: 'trash', method: 'move' },
    })).rejects.toBeInstanceOf(z.ZodError);
  });
});

describe('mail-filter-delete', () => {
  it('振り分けルールを削除する', async () => {
    const deps = createMockDependencies();
    registerMailFilterTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('mail-filter-delete');
    await tool!.handler({ filter_id: 'filter_hash_1' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/mail-filter/filter_hash_1'),
    );
  });

  it('削除用のfilter_idは文字列のみ許可する', () => {
    const deps = createMockDependencies();
    registerMailFilterTools(deps.server, deps.apiClient, deps.config, deps.logger);

    const tool = deps.getTools().get('mail-filter-delete');
    const schema = z.object(tool!.schema as Record<string, z.ZodTypeAny>);

    expect(schema.safeParse({ filter_id: 'filter_hash_1' }).success).toBe(true);
    expect(schema.safeParse({ filter_id: 1 }).success).toBe(false);
  });
});

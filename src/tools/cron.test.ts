/**
 * Cron ツール テスト
 *
 * カバレッジ: 100%
 *
 * cron-list: Cron設定一覧を取得（パターンA: 単純GET）
 * cron-create: Cronジョブ新規追加（パターンD: POST）
 * cron-update: Cronジョブ変更（パターンE: PUT+パスパラメータ）
 * cron-delete: Cronジョブ削除（パターンE: DELETE+パスパラメータ、破壊的操作）
 */
import { z } from 'zod';
import { describe, it, expect, vi } from 'vitest';
import { registerCronTools } from './cron.js';
import { createMockDependencies } from './__test-helpers.js';

describe('cron-list', () => {
  it('Cron一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerCronTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ crons: [{ id: 'cron_hash_1' }] });

    const tool = deps.getTools().get('cron-list');
    const result = await tool!.handler({});
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.crons).toHaveLength(1);
    expect(parsed.crons[0].id).toBe('cron_hash_1');
  });
});

describe('cron-create', () => {
  it('Cronジョブを作成する', async () => {
    const deps = createMockDependencies();
    registerCronTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({ id: 'cron_hash_2' });

    const tool = deps.getTools().get('cron-create');
    const result = await tool!.handler({
      minute: '*/5', hour: '*', day: '*', month: '*', weekday: '*',
      command: '/usr/bin/php test.php',
    });
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.id).toBe('cron_hash_2');
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/cron'),
      expect.objectContaining({ minute: '*/5', command: '/usr/bin/php test.php' }),
    );
  });
});

describe('cron-update', () => {
  it('Cronジョブを更新する', async () => {
    const deps = createMockDependencies();
    registerCronTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({ success: true });

    const tool = deps.getTools().get('cron-update');
    await tool!.handler({ cron_id: 'cron_hash_1', enabled: false });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/cron/cron_hash_1'),
      expect.objectContaining({ enabled: false }),
    );
  });

  it('Cron IDは文字列のみ許可する', () => {
    const deps = createMockDependencies();
    registerCronTools(deps.server, deps.apiClient, deps.config, deps.logger);

    const tool = deps.getTools().get('cron-update');
    const schema = z.object(tool!.schema as Record<string, z.ZodTypeAny>);

    expect(schema.safeParse({ cron_id: 'cron_hash_1' }).success).toBe(true);
    expect(schema.safeParse({ cron_id: 1 }).success).toBe(false);
  });
});

describe('cron-delete', () => {
  it('Cronジョブを削除する', async () => {
    const deps = createMockDependencies();
    registerCronTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('cron-delete');
    await tool!.handler({ cron_id: 'cron_hash_1' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/cron/cron_hash_1'),
    );
  });

  it('削除用のCron IDも数値を拒否する', () => {
    const deps = createMockDependencies();
    registerCronTools(deps.server, deps.apiClient, deps.config, deps.logger);

    const tool = deps.getTools().get('cron-delete');
    const schema = z.object(tool!.schema as Record<string, z.ZodTypeAny>);

    expect(schema.safeParse({ cron_id: 'cron_hash_1' }).success).toBe(true);
    expect(schema.safeParse({ cron_id: 1 }).success).toBe(false);
  });
});

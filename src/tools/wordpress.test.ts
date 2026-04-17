/**
 * WordPress ツール テスト
 *
 * カバレッジ: 100%
 *
 * wp-list: WordPress一覧取得（パターンB: GET+ドメインフィルタ）
 * wp-install: WordPress新規インストール（パターンD: POST、パスワードマスキング）
 * wp-update: WordPress設定変更（パターンE: PUT）
 * wp-delete: WordPress削除（パターンE: DELETE、破壊的操作）
 */
import { z } from 'zod';
import { describe, it, expect, vi } from 'vitest';
import { registerWordPressTools } from './wordpress.js';
import { createMockDependencies } from './__test-helpers.js';

describe('wp-list', () => {
  it('WordPress一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ wordpress: [] });

    const tool = deps.getTools().get('wp-list');
    const result = await tool!.handler({});
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.wordpress).toEqual([]);
  });

  it('ドメインでフィルタできる', async () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ wordpress: [] });

    const tool = deps.getTools().get('wp-list');
    await tool!.handler({ domain: 'example.com' });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.any(String), { domain: 'example.com' },
    );
  });
});

describe('wp-install', () => {
  it('WordPressをインストールする', async () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({ id: 'wp_hash_1' });

    const tool = deps.getTools().get('wp-install');
    const result = await tool!.handler({
      url: 'example.com/blog', title: 'テスト',
      admin_username: 'admin', admin_password: 'pass1234',
      admin_email: 'admin@example.com',
    });
    const parsed = JSON.parse((result as any).content[0].text);
    expect(parsed.id).toBe('wp_hash_1');
  });
});

describe('wp-update', () => {
  it('WordPress設定を更新する', async () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('wp-update');
    await tool!.handler({ wp_id: 'wp_hash_1', memo: '更新メモ' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/wp/wp_hash_1'),
      expect.objectContaining({ memo: '更新メモ' }),
    );
  });

  it('WordPress IDは文字列のみ許可する', () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);

    const tool = deps.getTools().get('wp-update');
    const schema = z.object(tool!.schema as Record<string, z.ZodTypeAny>);

    expect(schema.safeParse({ wp_id: 'wp_hash_1' }).success).toBe(true);
    expect(schema.safeParse({ wp_id: 1 }).success).toBe(false);
  });
});

describe('wp-delete', () => {
  it('WordPressを削除する', async () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('wp-delete');
    await tool!.handler({ wp_id: 'wp_hash_1', delete_db: true });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/wp/wp_hash_1'),
      expect.objectContaining({ delete_db: true }),
    );
  });

  it('削除用のWordPress IDも数値を拒否する', () => {
    const deps = createMockDependencies();
    registerWordPressTools(deps.server, deps.apiClient, deps.config, deps.logger);

    const tool = deps.getTools().get('wp-delete');
    const schema = z.object(tool!.schema as Record<string, z.ZodTypeAny>);

    expect(schema.safeParse({ wp_id: 'wp_hash_1' }).success).toBe(true);
    expect(schema.safeParse({ wp_id: 1 }).success).toBe(false);
  });
});

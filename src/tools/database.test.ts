/**
 * データベース ツール テスト
 *
 * カバレッジ: 100%
 *
 * DB操作: db-list, db-create, db-update, db-delete
 * DBユーザー操作: db-user-list, db-user-create, db-user-update, db-user-delete
 * DB権限操作: db-grant-list, db-grant-add, db-grant-remove
 * encodeURIComponent対応（db_user）、ネストパス（/db/user/{db_user}/grant）
 */
import { describe, it, expect, vi } from 'vitest';
import { registerDatabaseTools } from './database.js';
import { createMockDependencies } from './__test-helpers.js';

describe('db-list', () => {
  it('データベース一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ databases: [] });

    const tool = deps.getTools().get('db-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).databases).toEqual([]);
  });
});

describe('db-create', () => {
  it('データベースを作成する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-create');
    await tool!.handler({ name_suffix: 'db01' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/db'),
      expect.objectContaining({ name_suffix: 'db01' }),
    );
  });
});

describe('db-update', () => {
  it('データベースメモを更新する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-update');
    await tool!.handler({ db_name: 'xs123_db01', memo: 'test' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/db/xs123_db01'),
      expect.objectContaining({ memo: 'test' }),
    );
  });
});

describe('db-delete', () => {
  it('データベースを削除する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-delete');
    await tool!.handler({ db_name: 'xs123_db01' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(expect.stringContaining('/db/xs123_db01'));
  });
});

describe('db-user-list', () => {
  it('DBユーザー一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ users: [] });

    const tool = deps.getTools().get('db-user-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).users).toEqual([]);
  });
});

describe('db-user-create', () => {
  it('DBユーザーを作成する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-user-create');
    await tool!.handler({ name_suffix: 'user01', password: 'pass123' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/db/user'),
      expect.objectContaining({ name_suffix: 'user01' }),
    );
  });
});

describe('db-user-update', () => {
  it('DBユーザーを更新する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-user-update');
    await tool!.handler({ db_user: 'xs123_user01', memo: 'updated' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/db/user/xs123_user01'),
      expect.objectContaining({ memo: 'updated' }),
    );
  });
});

describe('db-user-delete', () => {
  it('DBユーザーを削除する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-user-delete');
    await tool!.handler({ db_user: 'xs123_user01' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/db/user/xs123_user01'),
    );
  });
});

describe('db-grant-list', () => {
  it('DB権限一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ grants: [] });

    const tool = deps.getTools().get('db-grant-list');
    const result = await tool!.handler({ db_user: 'xs123_user01' });
    expect(JSON.parse((result as any).content[0].text).grants).toEqual([]);
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/db/user/xs123_user01/grant'),
    );
  });
});

describe('db-grant-add', () => {
  it('DB権限を付与する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-grant-add');
    await tool!.handler({ db_user: 'xs123_user01', db_name: 'xs123_db01' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/db/user/xs123_user01/grant'),
      { db_name: 'xs123_db01' },
    );
  });
});

describe('db-grant-remove', () => {
  it('DB権限を削除する', async () => {
    const deps = createMockDependencies();
    registerDatabaseTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('db-grant-remove');
    await tool!.handler({ db_user: 'xs123_user01', db_name: 'xs123_db01' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/db/user/xs123_user01/grant'),
      { db_name: 'xs123_db01' },
    );
  });
});

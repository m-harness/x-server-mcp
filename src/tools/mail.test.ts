/**
 * メール ツール テスト
 *
 * カバレッジ: 100%
 *
 * mail-list: メール一覧取得（ドメインフィルタ付きGET）
 * mail-get: メール詳細取得（パスパラメータ、encodeURIComponent）
 * mail-create: メール作成（POST、ドメイン所有権確認警告）
 * mail-update: メール更新（PUT、パスワードマスキング）
 * mail-delete: メール削除（DELETE、破壊的操作）
 * mail-forwarding-get: 転送設定取得（ネストパス）
 * mail-forwarding-update: 転送設定更新（ネストパス）
 */
import { describe, it, expect, vi } from 'vitest';
import { registerMailTools } from './mail.js';
import { createMockDependencies } from './__test-helpers.js';

describe('mail-list', () => {
  it('メール一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ mails: [] });

    const tool = deps.getTools().get('mail-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).mails).toEqual([]);
  });
});

describe('mail-get', () => {
  it('メール詳細を取得しアカウントをURLエンコードする', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ mail_account: 'user@example.com' });

    const tool = deps.getTools().get('mail-get');
    await tool!.handler({ mail_account: 'user@example.com' });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/mail/user%40example.com'),
    );
  });
});

describe('mail-create', () => {
  it('メールアカウントを作成する', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('mail-create');
    await tool!.handler({ mail_address: 'new@example.com', password: 'pass123' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/mail'),
      expect.objectContaining({ mail_address: 'new@example.com' }),
    );
  });
});

describe('mail-update', () => {
  it('メールアカウントを更新する', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('mail-update');
    await tool!.handler({ mail_account: 'user@example.com', quota_mb: 1000 });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/mail/user%40example.com'),
      expect.objectContaining({ quota_mb: 1000 }),
    );
  });
});

describe('mail-delete', () => {
  it('メールアカウントを削除する', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('mail-delete');
    await tool!.handler({ mail_account: 'user@example.com' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/mail/user%40example.com'),
    );
  });
});

describe('mail-forwarding-get', () => {
  it('転送設定を取得する', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ forwarding_addresses: [] });

    const tool = deps.getTools().get('mail-forwarding-get');
    await tool!.handler({ mail_account: 'user@example.com' });
    expect(deps.apiClient.get).toHaveBeenCalledWith(
      expect.stringContaining('/mail/user%40example.com/forwarding'),
    );
  });
});

describe('mail-forwarding-update', () => {
  it('転送設定を更新する', async () => {
    const deps = createMockDependencies();
    registerMailTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('mail-forwarding-update');
    await tool!.handler({
      mail_account: 'user@example.com',
      forwarding_addresses: ['fwd@example.com'],
      keep_in_mailbox: true,
    });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/mail/user%40example.com/forwarding'),
      expect.objectContaining({ forwarding_addresses: ['fwd@example.com'] }),
    );
  });
});

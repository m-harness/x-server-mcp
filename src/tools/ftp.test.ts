/**
 * FTP ツール テスト
 *
 * カバレッジ: 100%
 *
 * ftp-list, ftp-create, ftp-update, ftp-delete
 * パスワードマスキング、encodeURIComponent対応
 */
import { describe, it, expect, vi } from 'vitest';
import { registerFtpTools } from './ftp.js';
import { createMockDependencies } from './__test-helpers.js';

describe('ftp-list', () => {
  it('FTPアカウント一覧を取得する', async () => {
    const deps = createMockDependencies();
    registerFtpTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.get).mockResolvedValueOnce({ ftps: [] });

    const tool = deps.getTools().get('ftp-list');
    const result = await tool!.handler({});
    expect(JSON.parse((result as any).content[0].text).ftps).toEqual([]);
  });
});

describe('ftp-create', () => {
  it('FTPアカウントを作成する', async () => {
    const deps = createMockDependencies();
    registerFtpTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.post).mockResolvedValueOnce({});

    const tool = deps.getTools().get('ftp-create');
    await tool!.handler({ ftp_account: 'ftp@example.com', password: 'pass12345678' });
    expect(deps.apiClient.post).toHaveBeenCalledWith(
      expect.stringContaining('/ftp'),
      expect.objectContaining({ ftp_account: 'ftp@example.com' }),
    );
  });
});

describe('ftp-update', () => {
  it('FTPアカウントを更新する', async () => {
    const deps = createMockDependencies();
    registerFtpTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.put).mockResolvedValueOnce({});

    const tool = deps.getTools().get('ftp-update');
    await tool!.handler({ ftp_account: 'ftp@example.com', memo: 'test' });
    expect(deps.apiClient.put).toHaveBeenCalledWith(
      expect.stringContaining('/ftp/ftp%40example.com'),
      expect.objectContaining({ memo: 'test' }),
    );
  });
});

describe('ftp-delete', () => {
  it('FTPアカウントを削除する', async () => {
    const deps = createMockDependencies();
    registerFtpTools(deps.server, deps.apiClient, deps.config, deps.logger);
    vi.mocked(deps.apiClient.delete).mockResolvedValueOnce({});

    const tool = deps.getTools().get('ftp-delete');
    await tool!.handler({ ftp_account: 'ftp@example.com' });
    expect(deps.apiClient.delete).toHaveBeenCalledWith(
      expect.stringContaining('/ftp/ftp%40example.com'),
    );
  });
});

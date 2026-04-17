/**
 * Logger テスト
 *
 * カバレッジ: 100% (statements, branches, functions, lines)
 *
 * Loggerはstderr(console.error)とファイルにログを出力するクラス。
 * stdout(console.log)は使用しない（JSON-RPC専用のため）。
 * パスワードやAPIキーなどの機密情報を自動マスキングする。
 * ログレベル: error > warn > info > debug
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger, LogLevel } from './logger.js';

vi.mock('node:fs');

describe('Logger', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.appendFileSync).mockImplementation(() => {});
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ログレベルフィルタリング', () => {
    it('infoレベルではdebugメッセージを出力しない', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.debug('デバッグメッセージ');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('infoレベルではinfo,warn,errorを出力する', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    });

    it('debugレベルでは全レベルを出力する', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'debug' });
      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(4);
    });

    it('errorレベルではerrorのみ出力する', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'error' });
      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('warnレベルではwarnとerrorのみ出力する', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'warn' });
      logger.debug('デバッグ');
      logger.info('情報');
      logger.warn('警告');
      logger.error('エラー');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('console.logを使用しない', () => {
    it('どのレベルでもconsole.logを呼ばない', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'debug' });
      logger.debug('d');
      logger.info('i');
      logger.warn('w');
      logger.error('e');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('マスキング', () => {
    it('passwordフィールドをマスキングする', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('データ', { password: 'secret123' });
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('****');
      expect(output).not.toContain('secret123');
    });

    it('apiKeyフィールドをマスキングする', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('データ', { apiKey: 'xs_abcdef123456' });
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('xs_****');
      expect(output).not.toContain('xs_abcdef123456');
    });

    it('Authorizationヘッダーをマスキングする', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('リクエスト', { Authorization: 'Bearer xs_abcdef123456' });
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('xs_****');
      expect(output).not.toContain('xs_abcdef123456');
    });

    it('admin_passwordフィールドをマスキングする', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('WP', { admin_password: 'wppass' });
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('****');
      expect(output).not.toContain('wppass');
    });

    it('ネストされたオブジェクトのパスワードもマスキングする', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('データ', { user: { password: 'nested_secret' } });
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('****');
      expect(output).not.toContain('nested_secret');
    });

    it('データなしでも正常に動作する', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('メッセージのみ');
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('ファイル出力', () => {
    it('ログをファイルに書き込む', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('テストメッセージ');
      expect(fs.appendFileSync).toHaveBeenCalled();
      const [filePath, content] = vi.mocked(fs.appendFileSync).mock.calls[0];
      expect(String(filePath)).toContain('logs');
      expect(String(content)).toContain('テストメッセージ');
    });

    it('ログディレクトリが存在しない場合は作成する', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('テスト');
      expect(fs.mkdirSync).toHaveBeenCalledWith('./logs', { recursive: true });
    });

    it('ファイル書き込みエラーでもクラッシュしない', () => {
      vi.mocked(fs.appendFileSync).mockImplementation(() => {
        throw new Error('書き込みエラー');
      });
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      expect(() => logger.info('テスト')).not.toThrow();
    });
  });

  describe('ログフォーマット', () => {
    it('タイムスタンプとレベルを含む', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('テスト');
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toMatch(/\d{4}-\d{2}-\d{2}T/);
      expect(output).toContain('[INFO]');
    });

    it('追加データをJSON形式で出力する', () => {
      const logger = new Logger({ logDir: './logs', logLevel: 'info' });
      logger.info('テスト', { key: 'value' });
      const output = consoleErrorSpy.mock.calls[0][0] as string;
      expect(output).toContain('"key"');
      expect(output).toContain('"value"');
    });
  });
});

import { config as dotenvConfig } from 'dotenv';
import { type LogLevel } from './logger.js';

export interface AppConfig {
  apiKey: string;
  serverName?: string;
  logLevel: LogLevel;
  logDir: string;
}

const VALID_LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

export function loadConfig(): AppConfig {
  // .envファイルから環境変数を読み込む（既存のprocess.envは上書きしない）
  dotenvConfig();

  const apiKey = process.env.XSERVER_API_KEY;
  if (!apiKey) {
    throw new Error('環境変数 XSERVER_API_KEY が設定されていません');
  }

  const serverName = process.env.XSERVER_SERVER_NAME || undefined;

  const rawLogLevel = process.env.LOG_LEVEL;
  const logLevel: LogLevel = VALID_LOG_LEVELS.includes(rawLogLevel as LogLevel)
    ? (rawLogLevel as LogLevel)
    : 'info';

  const logDir = process.env.LOG_DIR || './logs';

  return { apiKey, serverName, logLevel, logDir };
}

export interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CORS_ORIGIN: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD?: string;
  ADMIN_PASSWORD_HASH?: string;
  LLM_API_BASE_URL?: string;
  LLM_API_KEY?: string;
  LLM_MODEL?: string;
}

const ALLOWED_NODE_ENVS = new Set<EnvConfig['NODE_ENV']>(['development', 'production', 'test']);

function readNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function validateEnv(raw: Record<string, unknown>): EnvConfig {
  const rawEnv = typeof raw.NODE_ENV === 'string' ? raw.NODE_ENV : 'development';
  if (!ALLOWED_NODE_ENVS.has(rawEnv as EnvConfig['NODE_ENV'])) {
    throw new Error(`Invalid NODE_ENV: "${rawEnv}". Expected development | production | test.`);
  }
  const nodeEnv = rawEnv as EnvConfig['NODE_ENV'];

  const rawPort = raw.PORT !== undefined ? Number(raw.PORT) : 4000;
  if (!Number.isInteger(rawPort) || rawPort <= 0 || rawPort > 65535) {
    throw new Error(`Invalid PORT: "${String(raw.PORT)}". Expected an integer between 1 and 65535.`);
  }

  const corsOrigin = readNonEmptyString(raw.CORS_ORIGIN) ?? 'http://localhost:3000';
  if (nodeEnv === 'production' && corsOrigin === '*') {
    throw new Error('CORS_ORIGIN cannot be "*" in production when credentials are enabled.');
  }
  const mongodbUri =
    readNonEmptyString(raw.MONGODB_URI) ?? 'mongodb://127.0.0.1:27017/mohammedbajhaw';

  const jwtSecret =
    readNonEmptyString(raw.JWT_SECRET) ??
    (nodeEnv === 'production'
      ? (() => {
          throw new Error('JWT_SECRET is required in production.');
        })()
      : 'dev-only-jwt-secret-change-in-production');

  if (
    nodeEnv === 'production' &&
    (jwtSecret.length < 32 || jwtSecret === 'dev-only-jwt-secret-change-in-production')
  ) {
    throw new Error('JWT_SECRET must be a strong secret of at least 32 characters in production.');
  }

  const jwtExpiresIn = readNonEmptyString(raw.JWT_EXPIRES_IN) ?? '7d';
  const adminEmail =
    readNonEmptyString(raw.ADMIN_EMAIL)?.toLowerCase() ?? 'mohammedbajhaw2020@gmail.com';
  const adminPassword = readNonEmptyString(raw.ADMIN_PASSWORD);
  const adminPasswordHash = readNonEmptyString(raw.ADMIN_PASSWORD_HASH);
  const llmApiBaseUrl = readNonEmptyString(raw.LLM_API_BASE_URL);
  const llmApiKey = readNonEmptyString(raw.LLM_API_KEY);
  const llmModel = readNonEmptyString(raw.LLM_MODEL);

  if (nodeEnv === 'production' && !adminPasswordHash && !adminPassword) {
    throw new Error('Either ADMIN_PASSWORD_HASH or ADMIN_PASSWORD must be configured in production.');
  }

  return {
    NODE_ENV: nodeEnv,
    PORT: rawPort,
    CORS_ORIGIN: corsOrigin,
    MONGODB_URI: mongodbUri,
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: jwtExpiresIn,
    ADMIN_EMAIL: adminEmail,
    ...(adminPassword ? { ADMIN_PASSWORD: adminPassword } : {}),
    ...(adminPasswordHash ? { ADMIN_PASSWORD_HASH: adminPasswordHash } : {}),
    ...(llmApiBaseUrl ? { LLM_API_BASE_URL: llmApiBaseUrl } : {}),
    ...(llmApiKey ? { LLM_API_KEY: llmApiKey } : {}),
    ...(llmModel ? { LLM_MODEL: llmModel } : {}),
  };
}

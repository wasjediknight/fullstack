import 'dotenv/config';

function required(key: string, fallback?: string) {
  const v = process.env[key] ?? fallback;
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000),
  JWT_SECRET: required('JWT_SECRET', 'dev-secret'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',
  DATABASE_URL: required('DATABASE_URL')
};

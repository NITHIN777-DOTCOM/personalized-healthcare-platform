import dotenv from 'dotenv';
import z from 'zod';
import path from 'path';

// Only load .env automatically during local development/testing
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

// Normalize SQLite DATABASE_URL to be absolute to avoid CWD resolution issues
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (process.env.DATABASE_URL.startsWith('file:')) {
  const rawPath = process.env.DATABASE_URL.replace(/^file:/, '');
  if (!path.isAbsolute(rawPath)) {
    // Resolve relative to the backend's prisma directory
    const resolvedPath = path.resolve(__dirname, '../../prisma', rawPath);
    process.env.DATABASE_URL = `file:${resolvedPath}`;
  }
}

const configSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('file:./dev.db'),
  JWT_ACCESS_SECRET: z.string().default('fallback-access-token-secret-key-1234567890-very-long'),
  JWT_REFRESH_SECRET: z.string().default('fallback-refresh-token-secret-key-1234567890-very-long'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parsedConfig = configSchema.safeParse(process.env);

if (!parsedConfig.success) {
  console.error('❌ Invalid environment configuration:', parsedConfig.error.format());
  process.exit(1);
}

export const config = parsedConfig.data;
export default config;

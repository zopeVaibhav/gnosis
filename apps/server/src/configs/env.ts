import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SERVER_PORT: z.coerce.number().default(8080),
    WEB_ORIGIN: z.url(),
    DATABASE_URL: z.url(),

    JWT_ACCESS_SECRET: z.string().min(32),
    ACCESS_TOKEN_TTL_SEC: z.coerce.number().default(900), // 15 mins
    REFRESH_TOKEN_TTL_SEC: z.coerce.number().default(2592000), // 30 days
});

export const env = envSchema.parse(process.env);

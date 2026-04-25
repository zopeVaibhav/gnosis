import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SERVER_PORT: z.coerce.number().default(8080),
    DATABASE_URL: z.url(),
});

export const env = envSchema.parse(process.env);

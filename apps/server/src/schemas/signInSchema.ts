import { z } from 'zod';

export const signInSchema = z.object({
    provider: z.enum(['google', 'github']),
    providerAccountId: z.string().min(1),
    email: z.email(),
    name: z.string().min(1),
    image: z.url().nullable().optional(),
    accessToken: z.string().nullable().optional(),
    refreshToken: z.string().nullable().optional(),
    expiresAt: z.number().nullable().optional(),
    scope: z.string().nullable().optional(),
});

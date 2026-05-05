import z from 'zod';

export const chatSchema = z.object({
    id: z.string().optional(),
    message: z.string().min(1),
});

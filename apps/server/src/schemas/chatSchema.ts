import z from 'zod';

export const chatSchema = z.object({
    chatId: z.string().optional(),
    message: z.string().min(1),
});

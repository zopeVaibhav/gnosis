import { Request, Response } from 'express';
import { prisma } from '@gnosis/database';
import { ResponseWriter } from '../../utility/responseWriter';

export const getChatsController = async (req: Request, res: Response) => {
    try {
        const chats = await prisma.chat.findMany({
            where: { userId: req.user.id },
            orderBy: { updatedAt: 'desc' },
            select: { id: true, title: true, updatedAt: true },
            take: 50,
        });
        return ResponseWriter.success(res, chats);
    } catch (error) {
        console.error('getChatsController error', error);
        return ResponseWriter.system_error(res);
    }
};

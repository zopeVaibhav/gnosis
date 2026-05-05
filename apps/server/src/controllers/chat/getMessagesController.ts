import { Request, Response } from 'express';
import { ResponseWriter } from '../../utility/responseWriter';
import { ERROR_CODES } from '@gnosis/types';
import { prisma } from '@gnosis/database';

export const getChatMessagesController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== 'string') return ResponseWriter.invalid_data(res, 'Invalid chat id');

        const messages = await prisma.chatMessage.findMany({
            where: {
                chatId: id,
                chats: {
                    userId: req.user.id,
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });
        return ResponseWriter.success(res, messages);
    } catch (error) {
        console.error('getChatMessagesController', error);
        ResponseWriter.system_error(res, ERROR_CODES.SYSTEM_ERROR);
    }
};

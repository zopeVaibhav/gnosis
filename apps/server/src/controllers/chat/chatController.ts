import { Request, Response } from 'express';
import { ResponseWriter } from '../../utility/responseWriter';
import graph from '../../agent/graph';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { chatSchema } from '../../schemas/chatSchema';
import { prisma } from '@gnosis/database';
import { ROLE, STREAM_MESSAGE } from '@gnosis/types';

export const chatController = async (req: Request, res: Response) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) return ResponseWriter.invalid_data(res, 'Invalid Data');

    const { message, id } = parsed.data;
    const userId = req.user.id;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const isNewChat = !id;
        let activeChatId = id;

        if (isNewChat) {
            const chat = await prisma.chat.create({ data: { userId } });
            activeChatId = chat.id;
        }

        await prisma.chatMessage.create({
            data: { chatId: activeChatId!, role: ROLE.USER, content: message },
        });

        const history = isNewChat
            ? []
            : await prisma.chatMessage.findMany({
                  where: { chatId: activeChatId },
                  orderBy: { createdAt: 'asc' },
              });

        const historyMessages = history.map((m) =>
            m.role === ROLE.USER ? new HumanMessage(m.content) : new AIMessage(m.content),
        );

        const result = await graph.invoke({
            messages: [...historyMessages, new HumanMessage(message)],
            intent: null,
            answer: '',
            title: '',
            isNewChat,
        });

        await prisma.chatMessage.create({
            data: {
                chatId: activeChatId!,
                role: ROLE.ASSISTANT,
                content: result.answer,
            },
        });

        if (isNewChat) {
            await prisma.chat.update({
                where: { id: activeChatId },
                data: { title: result.title },
            });
            ResponseWriter.stream(res, result.title, STREAM_MESSAGE.CHAT_CREATED);
        }
        ResponseWriter.stream(res, result.answer, STREAM_MESSAGE.CHAT_MESSAGE);
        ResponseWriter.stream(res, ' ', STREAM_MESSAGE.COMPLETED);

        res.end();
    } catch (error) {
        console.error('chatControllerError', error);
        ResponseWriter.system_error(res);
    }
};

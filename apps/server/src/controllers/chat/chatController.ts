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
    res.flushHeaders();

    try {
        const isNewChat = !id;
        let activeChatId = id;

        if (isNewChat) {
            const chat = await prisma.chat.create({ data: { userId } });
            activeChatId = chat.id;
            ResponseWriter.stream(res, chat.id, STREAM_MESSAGE.CHAT_CREATED);
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

        let title = '';
        let answer = '';

        const events = graph.streamEvents(
            {
                messages: [...historyMessages, new HumanMessage(message)],
                intent: null,
                answer: '',
                title: '',
                isNewChat,
            },
            {
                version: 'v2',
                configurable: {
                    userId,
                },
            },
        );
        for await (const ev of events) {
            if (ev.event === 'on_chat_model_stream') {
                const node = ev.metadata?.langgraph_node;
                const token =
                    typeof ev.data.chunk?.content === 'string' ? ev.data.chunk.content : '';
                if (!token) continue;

                if (node === 'synthesizer') {
                    answer += token;
                    ResponseWriter.stream(res, token, STREAM_MESSAGE.CHAT_MESSAGE);
                }
            }
            if (ev.event === 'on_chain_end' && ev.metadata?.langgraph_node === 'title_generator') {
                title = ev.data.output?.title ?? '';
            }
        }

        await prisma.chatMessage.create({
            data: {
                chatId: activeChatId!,
                role: ROLE.ASSISTANT,
                content: answer,
            },
        });

        if (isNewChat && title) {
            await prisma.chat.update({
                where: { id: activeChatId },
                data: { title },
            });
            ResponseWriter.stream(res, title, STREAM_MESSAGE.CHAT_TITLE);
        }
        ResponseWriter.stream(res, ' ', STREAM_MESSAGE.COMPLETED);
        res.end();
    } catch (error) {
        console.error('chatControllerError', error);
        ResponseWriter.system_error(res);
    }
};

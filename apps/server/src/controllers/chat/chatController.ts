import { Request, Response } from 'express';
import { ResponseWriter } from '../../utility/responseWriter';
import graph from '../../agent/graph';
import { HumanMessage } from '@langchain/core/messages';

export const chatController = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const result = await graph.invoke({
            messages: [new HumanMessage(message)],
            intent: null,
            answer: '',
        });

        res.write(`data: ${JSON.stringify({ type: 'token', content: result.answer })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
    } catch (error) {
        console.error('chatControllerError', error);
        ResponseWriter.system_error(res);
    }
};

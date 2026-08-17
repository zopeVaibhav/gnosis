import { Request, Response } from "express";
import z from "zod";
import { prisma } from "@gnosis/database";
import ResponseWriter from "../../services/service.response";

export default class GetMessagesController {
    static params_schema = z.object({
        id: z.string().min(1),
    });

    static async process(req: Request, res: Response) {
        try {
            const { data, success } = GetMessagesController.params_schema.safeParse(req.params);
            if (!success) {
                return ResponseWriter.invalid_data(res, "Invalid chat id");
            }

            const chat = await prisma.chat.findFirst({
                where: { id: data.id, userId: req.user.id },
                select: { id: true },
            });
            if (!chat) {
                return ResponseWriter.not_found(res, "Chat not found");
            }

            const messages = await prisma.chatMessage.findMany({
                where: { chatId: chat.id },
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    createdAt: true,
                },
            });

            return ResponseWriter.success(res, messages);
        } catch (err) {
            console.error("GetMessagesController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }
}

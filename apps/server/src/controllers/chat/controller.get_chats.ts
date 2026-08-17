import { Request, Response } from "express";
import { prisma } from "@gnosis/database";
import ResponseWriter from "../../services/service.response";

export default class GetChatsController {
    static async process(req: Request, res: Response) {
        try {
            const chats = await prisma.chat.findMany({
                where: { userId: req.user.id },
                orderBy: { updatedAt: "desc" },
                select: { id: true, title: true, updatedAt: true },
                take: 50,
            });

            return ResponseWriter.success(res, chats);
        } catch (err) {
            console.error("GetChatsController error: ", err);
            return ResponseWriter.system_error(res);
        }
    }
}

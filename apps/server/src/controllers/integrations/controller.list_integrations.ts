import { Request, Response } from "express";
import { prisma } from "@gnosis/database";
import ResponseWriter from "../../services/service.response";

const GOOGLE_SERVICE_SCOPE: Record<string, string> = {
    gmail: "gmail",
    calendar: "calendar",
    drive: "drive",
};

export default class ListIntegrationsController {
    static async process(req: Request, res: Response) {
        try {
            const accounts = await prisma.account.findMany({
                where: { userId: req.user.id },
                select: { provider: true, scope: true },
            });

            const connections = accounts.flatMap((account) => {
                if (account.provider === "google") {
                    return Object.entries(GOOGLE_SERVICE_SCOPE)
                        .filter(([, keyword]) => account.scope?.includes(keyword))
                        .map(([service]) => ({ service, connected: true }));
                }
                return [{ service: account.provider, connected: true }];
            });

            return ResponseWriter.success(res, connections, "Integration fetched");
        } catch (err) {
            console.error("ListIntegrationsController error: ", err);
            return ResponseWriter.system_error(res, "Failed to fetch connectors");
        }
    }
}

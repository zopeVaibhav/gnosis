import { prisma } from "@gnosis/database";
import { Octokit } from "@octokit/rest";
import { NotConnectedError } from "./error";

export const githubClient = async (userId: string): Promise<Octokit> => {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: "github",
        },
    });
    if (!account?.accessToken) throw new NotConnectedError("github");

    return new Octokit({ auth: account.accessToken });
};

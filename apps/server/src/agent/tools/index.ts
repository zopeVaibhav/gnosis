import { StructuredToolInterface } from "@langchain/core/tools";
import { buildGmailTools } from "./gmail";

export const buildTools = (userId: string): StructuredToolInterface[] => [
    ...buildGmailTools(userId),
];

export const buildToolMap = (userId: string) =>
    Object.fromEntries(buildTools(userId).map((t) => [t.name, t]));

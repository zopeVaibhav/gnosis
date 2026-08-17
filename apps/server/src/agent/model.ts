import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../configs/env";

export const model = new ChatGoogleGenerativeAI({
    apiKey: env.GEMINI_API_KEY,
    model: env.LLM_MODEL,
});

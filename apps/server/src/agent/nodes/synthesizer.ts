import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { env } from '../../configs/env';
import { AgentState } from '../state';

const model = new ChatGoogleGenerativeAI({
    apiKey: env.GEMINI_API_KEY,
    model: env.LLM_MODEL,
});

export const synthesizerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const response = await model.invoke(state.messages);
    return {
        answer: response.content as string,
    };
};

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model } from "../model";
import { AgentState } from "../state";

export const titleGeneratorNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const firstMessage = state.messages[0]?.content as string;
    const response = await model.invoke([
        new SystemMessage(
            "Generate a concise 3-6 word title for this conversation. Return only the title, no punctuation, no quotes.",
        ),
        new HumanMessage(firstMessage),
    ]);
    return { title: response.content as string };
};

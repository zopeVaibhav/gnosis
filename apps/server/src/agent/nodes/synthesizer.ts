import { AgentState } from '../state';
import { model } from '../model';
import { RunnableConfig } from '@langchain/core/runnables';
import { buildTools } from '../tools';
import { AIMessage, SystemMessage } from '@langchain/core/messages';
import { SYSTEM_PROMPT } from '../const/nodesDescription';

export const synthesizerNode = async (
    state: AgentState,
    config: RunnableConfig,
): Promise<Partial<AgentState>> => {
    const userId = config.configurable?.userId as string | undefined;
    if (!userId) throw new Error('synthesizerNode: userId missing');

    const llm = model.bindTools(buildTools(userId));

    const hasSystem = state.messages[0] instanceof SystemMessage;
    const input = hasSystem
        ? state.messages
        : [new SystemMessage(SYSTEM_PROMPT), ...state.messages];

    const response = (await llm.invoke(input)) as AIMessage;

    const isFinal = !response.tool_calls?.length;
    const answerText =
        typeof response.content === 'string'
            ? response.content
            : response.content.map((c) => (c.type === 'text' ? c.text : '')).join('');

    return {
        messages: [response],
        ...(isFinal ? { answer: answerText } : {}),
    };
};

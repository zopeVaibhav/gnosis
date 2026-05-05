import { AgentState } from '../state';
import { model } from '../model';

export const synthesizerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    const response = await model.invoke(state.messages);
    return {
        answer: response.content as string,
    };
};

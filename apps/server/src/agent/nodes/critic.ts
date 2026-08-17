import { AgentState } from "../state";

export const criticNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    return {
        answer: state.answer,
    };
};

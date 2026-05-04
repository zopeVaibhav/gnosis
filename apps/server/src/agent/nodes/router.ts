import { AgentState } from '../state';

export const routerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    return { intent: 'general' };
};

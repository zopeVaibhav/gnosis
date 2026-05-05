import { AgentState } from '../state';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const routerNode = async (state: AgentState): Promise<Partial<AgentState>> => {
    return { intent: 'general' };
};

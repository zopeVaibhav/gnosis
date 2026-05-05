import { BaseMessage } from '@langchain/core/messages';

export interface AgentState {
    messages: BaseMessage[];
    intent: string | null;
    answer: string;
    title: string;
    isNewChat: boolean;
}

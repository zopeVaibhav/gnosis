import { RunnableConfig } from '@langchain/core/runnables';
import { AgentState } from '../state';
import { AIMessage, ToolMessage } from '@langchain/core/messages';
import { buildToolMap } from '../tools';

export const toolExecutorNode = async (
    state: AgentState,
    config: RunnableConfig,
): Promise<Partial<AgentState>> => {
    const userId = config.configurable?.userId as string | undefined;
    if (!userId) throw new Error('toolExecutorNode: userId missing');

    const last = state.messages.at(-1) as AIMessage | undefined;
    const calls = last?.tool_calls ?? [];

    const tools = buildToolMap(userId);

    // console.log(
    //     '[toolExecutor] calls',
    //     calls.map((c) => ({ name: c.name, args: c.args })),
    // );

    const settled = await Promise.allSettled(
        calls.map(async (call) => {
            const tool = tools[call.name];
            if (!tool) {
                // console.warn('[toolExecutor] unknown_tool', call.name);
                return new ToolMessage({
                    content: JSON.stringify({ error: 'unknown_tool', name: call.name }),
                    tool_call_id: call.id!,
                    name: call.name,
                });
            }
            return (await tool.invoke(call)) as ToolMessage;
        }),
    );

    const results = settled.map((r, i) => {
        if (r.status == 'fulfilled') return r.value;

        const call = calls[i]!;
        // console.warn('[toolExecutor] tool_threw', {
        //     name: call.name,
        //     args: call.args,
        //     reason: r.reason instanceof Error ? r.reason.message : String(r.reason),
        // });
        return new ToolMessage({
            content: JSON.stringify({
                error: 'tool_threw',
                message: r.reason instanceof Error ? r.reason.message : String(r.reason),
            }),
            tool_call_id: call.id!,
            name: call.name,
        });
    });

    return {
        messages: results,
    };
};

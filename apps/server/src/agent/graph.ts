import { Annotation, StateGraph } from '@langchain/langgraph';
import { routerNode } from './nodes/router';
import { synthesizerNode } from './nodes/synthesizer';
import { criticNode } from './nodes/critic';
import { AIMessage, BaseMessage } from '@langchain/core/messages';
import { titleGeneratorNode } from './nodes/titleGenerator';
import { toolExecutorNode } from './nodes/toolExecutor';

const stateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({ reducer: (a, b) => [...a, ...b] }),
    intent: Annotation<string | null>,
    answer: Annotation<string>,
    title: Annotation<string>,
    isNewChat: Annotation<boolean>,
});

const shouldUseTools = (state: { messages: BaseMessage[] }) => {
    const last = state.messages.at(-1) as AIMessage | undefined;
    return last?.tool_calls?.length ? 'tool' : 'critic';
};

const graph = new StateGraph(stateAnnotation)
    .addNode('router', routerNode)
    .addNode('synthesizer', synthesizerNode)
    .addNode('tool', toolExecutorNode)
    .addNode('title_generator', titleGeneratorNode)
    .addNode('critic', criticNode)
    .addEdge('__start__', 'router')
    .addEdge('router', 'synthesizer')
    .addConditionalEdges('synthesizer', shouldUseTools, {
        tool: 'tool',
        critic: 'critic',
    })
    .addEdge('tool', 'synthesizer')
    .addConditionalEdges('critic', (state) => (state.isNewChat ? 'title_generator' : '__end__'))
    .addEdge('title_generator', '__end__')
    .compile();

export default graph;

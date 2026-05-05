import { Annotation, StateGraph } from '@langchain/langgraph';
import { routerNode } from './nodes/router';
import { synthesizerNode } from './nodes/synthesizer';
import { criticNode } from './nodes/critic';
import { BaseMessage } from '@langchain/core/messages';
import { titleGeneratorNode } from './nodes/titleGenerator';

const stateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({ reducer: (a, b) => [...a, ...b] }),
    intent: Annotation<string | null>,
    answer: Annotation<string>,
    title: Annotation<string>,
    isNewChat: Annotation<boolean>,
});

const graph = new StateGraph(stateAnnotation)
    .addNode('router', routerNode)
    .addNode('synthesizer', synthesizerNode)
    .addNode('title_generator', titleGeneratorNode)
    .addNode('critic', criticNode)
    .addEdge('__start__', 'router')
    .addEdge('router', 'synthesizer')
    .addEdge('synthesizer', 'critic')
    .addConditionalEdges('critic', (state) => (state.isNewChat ? 'title_generator' : '__end__'))
    .addEdge('title_generator', '__end__')
    .compile();

export default graph;

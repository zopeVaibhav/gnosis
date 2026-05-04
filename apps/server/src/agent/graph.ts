import { Annotation, StateGraph } from '@langchain/langgraph';
import { routerNode } from './nodes/router';
import { synthesizerNode } from './nodes/synthesizer';
import { criticNode } from './nodes/critic';
import { BaseMessage } from '@langchain/core/messages';

const stateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({ reducer: (a, b) => [...a, ...b] }),
    intent: Annotation<string | null>,
    answer: Annotation<string>,
});

const graph = new StateGraph(stateAnnotation)
    .addNode('router', routerNode)
    .addNode('synthesizer', synthesizerNode)
    .addNode('critic', criticNode)
    .addEdge('__start__', 'router')
    .addEdge('router', 'synthesizer')
    .addEdge('synthesizer', 'critic')
    .addEdge('critic', '__end__')
    .compile();

export default graph;

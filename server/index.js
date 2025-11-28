import { ChatGroq } from "@langchain/groq";
import {
  MemorySaver,
  MessagesAnnotation,
  StateGraph,
} from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { TavilySearch } from "@langchain/tavily";
import readLine from "node:readline/promises";

const checkpointer = new MemorySaver();

const tool = new TavilySearch({
  maxResults: 3,
  topic: "general",
});

//initilise the too node
const tools = [tool];
const toolNode = new ToolNode(tools);

// 1. define node function
// 2.built the graph
// 3. complete and invoke the graph

//inintilize llm model here

const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxRetries: 2,
}).bindTools(tools);

function shouldContinue(state) {
  //put you conditional wether to call a tool or end the chat
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
    return "tools";
  }
  return "__end__";
}

async function callModel(state) {
  //call llm using apis
  console.log("Calling LLM..");
  const response = await llm.invoke(state.messages);
  return { messages: [response] };
}

// build the graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "agent")
  .addEdge("tools", "agent")
  .addConditionalEdges("agent", shouldContinue);

// complie the graph
const app = workflow.compile({ checkpointer });

async function main() {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  while (true) {
    const userInput = await rl.question("You:");
    if (userInput.toLowerCase() === "exit") break;

    const finalState = await app.invoke(
      {
        messages: [{ role: "user", content: userInput }],
      },
      { configurable: { thread_id: "1" } }
    );
    const lastMessage = finalState.messages[finalState.messages.length - 1];
    console.log("AI:", lastMessage.content);
  }

  rl.close();
}

main();

import { Agent, run } from "@openai/agents";
import "dotenv/config"; // To load our API Key

const agent = new Agent({
  name: "Greet In Coding Terms Agent",
  instructions: "You always greet the user in some coding terms",
});

const result = await run(agent, "Hi, My name is Ramanath!");

console.log(result.finalOutput);

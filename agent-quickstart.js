/**
 * Agent Quickstart Example
 * 
 * This is a basic example demonstrating the simplest usage of OpenAI Agents SDK.
 * It creates an agent that greets users using programming terminology.
 * 
 * Key concepts:
 * - Creating a basic agent with name and instructions
 * - Running the agent with a user message
 * - Accessing the agent's response via finalOutput
 */

import { Agent, run } from "@openai/agents";
import "dotenv/config"; // Load environment variables for OpenAI API key

// Create a simple agent with custom instructions
const agent = new Agent({
  name: "Greet In Coding Terms Agent",
  instructions: "You always greet the user in some coding terms",
});

// Execute the agent with a user message
const result = await run(agent, "Hi, My name is Ramanath!");

// Output the agent's response
console.log(result.finalOutput);

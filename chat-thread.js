/**
 * Conversational Thread Example with Context Persistence
 * 
 * This example demonstrates how to maintain conversation context across multiple
 * agent interactions using a thread (conversation history). The agent remembers
 * previous messages and can reference them in subsequent responses.
 * 
 * Key concepts:
 * - Maintaining conversation history (thread)
 * - Passing entire conversation history to agent for context
 * - Using result.history to preserve agent's internal state
 * - Multi-turn conversations with context awareness
 * - Agent can reference previous user information (e.g., user's name)
 * 
 * Use case:
 * Database query agent that remembers user details and previous interactions
 * to provide personalized SQL query generation.
 */

import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";

/**
 * Thread: Conversation history array
 * 
 * Stores the entire conversation between user and agent.
 * Each message is an object with 'role' (user/assistant) and 'content'.
 * This allows the agent to maintain context across multiple interactions.
 */
let thread = [];

/**
 * SQL Execute Tool
 * 
 * Simulates SQL query execution. In a real application, this would
 * connect to an actual database and execute the query.
 */
const executeTool = tool({
  name: "sql_execute_tool",
  description: "This tool helps to execute the sql query provided",
  parameters: z.object({
    sql: z.string().describe("SQL to execute"),
  }),
  execute: async function ({ sql }) {
    console.log(`SQL Executed: ${sql}`);
    // In production, this would execute against a real database
    return "done";
  },
});

/**
 * Database Query Agent
 * 
 * An agent specialized in generating and executing SQL queries.
 * Has knowledge of the database schema and can create queries based on
 * natural language requests while maintaining conversation context.
 */
const DbQueryAgent = new Agent({
  name: "Database query agent",
  instructions: `You are an expert in building SQL queries. Below are the details of the database and tables present.
      - Database: postgres
      - Database name: nenapidu
      -Tables-columns:
          1. users: user_id, username, email, phone
          2. reminders: reminder_id, reminder_name, reminder_desc, reminder_date, user_id
          3. favourites: favourite_id, favourite_name, favourite_desc, user_id
          4. audit: audit_id, audit_query, audit_result, user_id`,
  tools: [executeTool],
});

/**
 * Main function: Handles conversational interaction with context
 * 
 * Flow:
 * 1. Add user message to thread (conversation history)
 * 2. Pass entire thread to agent (provides full context)
 * 3. Agent processes with awareness of all previous messages
 * 4. Update thread with complete conversation history from result
 * 5. Display agent's response
 * 
 * Why this matters:
 * - Agent can reference information from earlier in the conversation
 * - Enables natural multi-turn dialogues
 * - Maintains state between agent calls
 */
async function main(query = "") {
  // Add user's message to the conversation thread
  thread.push({ role: "user", content: query });
  
  // Run agent with full conversation history for context
  const result = await run(DbQueryAgent, thread);
  
  // Update thread with the complete history including agent's response
  // This preserves the full conversation state for the next interaction
  thread = result.history;
  
  console.log(result.finalOutput);
}

/**
 * Example conversation demonstrating context persistence:
 * 
 * Turn 1: User introduces themselves
 * Turn 2: User makes a request using "my" - agent remembers the user from Turn 1
 *         and can personalize the SQL query (e.g., filtering by username "Ramnath")
 */
await main("My name is Ramnath");
await main("help me write a query to get all my favourites and execute it");

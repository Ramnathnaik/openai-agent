/**
 * Agent with Structured Output Example
 * 
 * This example demonstrates how to enforce structured output from an agent.
 * The agent uses a tool to fetch mutual fund data and returns the result
 * in a predefined schema format.
 * 
 * Key concepts:
 * - Defining output schemas using Zod
 * - Setting outputType on agents to enforce structured responses
 * - Combining tools with structured output
 * - Agent transforms unstructured API responses into structured format
 */

import { Agent, tool, run } from "@openai/agents";
import "dotenv/config";
import { z } from "zod"; // Schema validation library
import axios from "axios"; // HTTP client for API calls

// API key for mutual fund data service
const MUTUAL_FUND_API_KEY = process.env.API_NINJA_KEY;

/**
 * Mutual Fund Schema
 * 
 * Defines the exact structure that the agent's output must conform to.
 * This ensures consistency and type safety in the response.
 */
const MutualFundSchema = z.object({
  fund_name: z.string().describe("Name of the fund"),
  country: z.string().describe("Country to which the mutual fund belongs to"),
  number_of_holdings: z.number().describe("Total number of holdings"),
  aum: z.number().describe("Total AUM of the mutual fund"),
  holding_company: z.array(
    z.object({
      company_name: z
        .string()
        .describe("The company which is hold by this mutual fund"),
    })
  ),
});

/**
 * Mutual Fund Info Tool
 * 
 * Fetches mutual fund information from API Ninjas using the fund's ticker symbol.
 * Returns raw data that the agent will transform into the structured format.
 */
const mutualFundInfoTool = tool({
  name: "mutual_fund_info_tool",
  description: "Give the information of the mutual fund",
  parameters: z.object({
    ticker: z
      .string()
      .describe("Mutual Fund ticker symbol (e.g., VFIAX, FXAIX, FZROX)."),
  }),
  execute: async ({ ticker }) => {
    console.log("Ticker: ", ticker);
    // Fetch mutual fund data from the API
    const result = await axios.get(
      `https://api.api-ninjas.com/v1/mutualfund?ticker=${ticker}`,
      {
        headers: {
          "X-Api-Key": MUTUAL_FUND_API_KEY,
        },
      }
    );
    return result.data;
  },
});

/**
 * Mutual Fund Agent
 * 
 * This agent combines a tool with structured output enforcement.
 * The outputType property ensures the agent's response matches MutualFundSchema.
 */
const agent = new Agent({
  name: "Mutual Fund Agent",
  instructions:
    "You are an helpful agent who will provide information of mutual fund to the user",
  tools: [mutualFundInfoTool],
  outputType: MutualFundSchema, // Enforce structured output format
});

// Run the agent with a natural language query
// The agent will use the tool and format the response according to the schema
const result = await run(
  agent,
  "Give me information regarding the Vanguard 500 Index"
);
console.log(result.finalOutput);

/**
 * Agent with External Tool Example
 * 
 * This example demonstrates how to create custom tools that agents can use.
 * The Weather Agent uses a tool that makes real API calls to fetch weather data.
 * 
 * Key concepts:
 * - Creating custom tools with the tool() function
 * - Defining tool parameters using Zod schemas
 * - Making external API calls within tool execution
 * - Attaching tools to agents
 * - Agent automatically determines when to use tools based on user query
 */

import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod"; // Schema validation library
import axios from "axios"; // HTTP client for API calls

// Example of a simple tool with static response (commented out)
// This shows the basic structure before adding real API integration
// const weatherTool = tool({
//   name: "weather_tool",
//   description: "Returns the weather details of a city provided as a input",
//   execute: async ({ city }) => `The weather of ${city} is sunny`,
//   parameters: z.object({
//     city: z.string().describe("Name of the City"),
//   }),
// });

// API key for weather service (API Ninjas)
const WEATHER_API_KEY = process.env.API_NINJA_KEY;

/**
 * Weather Tool - Fetches real-time weather data
 * 
 * This tool integrates with the API Ninjas weather API to fetch current weather
 * information based on geographic coordinates (latitude/longitude).
 */
const weatherTool = tool({
  name: "weather_tool",
  description:
    "Returns the weather information for the given latitude and longitude of the city",
  // Define the expected parameters with validation
  parameters: z.object({
    lat: z.number().describe("Latitude of the City"),
    lon: z.number().describe("Longitude of the City"),
  }),
  // Execute function that makes the actual API call
  execute: async ({ lat, lon }) => {
    const result = await axios.get(
      `https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`,
      {
        headers: {
          "X-Api-Key": WEATHER_API_KEY,
        },
      }
    );

    return result.data;
  },
});

// Create an agent equipped with the weather tool
const agent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are an weather agent who will provide details of the weather",
  tools: [weatherTool], // Attach the tool to the agent
});

// Run the agent with a query about multiple cities
// The agent will automatically invoke the tool for each city
const result = await run(
  agent,
  "What's the weather of Bangalore, Delhi and Honnavar currently?"
);
console.log(result.finalOutput);

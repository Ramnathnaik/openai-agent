import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

// A new tool is created for getting the info of the weather as a static response
// const weatherTool = tool({
//   name: "weather_tool",
//   description: "Returns the weather details of a city provided as a input",
//   execute: async ({ city }) => `The weather of ${city} is sunny`,
//   parameters: z.object({
//     city: z.string().describe("Name of the City"),
//   }),
// });

const WEATHER_API_KEY = process.env.API_NINJA_KEY;

// Tool with an API call to get real time weather details
const weatherTool = tool({
  name: "weather_tool",
  description:
    "Returns the weather information for the given latitude and longitude of the city",
  parameters: z.object({
    lat: z.number().describe("Latitude of the City"),
    lon: z.number().describe("Longitude of the City"),
  }),
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

const agent = new Agent({
  name: "Weather Agent",
  instructions:
    "You are an weather agent who will provide details of the weather",
  tools: [weatherTool],
});

const result = await run(
  agent,
  "What's the weather of Bangalore, Delhi and Honnavar currently?"
);
console.log(result.finalOutput);

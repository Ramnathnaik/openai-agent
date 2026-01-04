import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";
import axios from "axios";
import { Resend } from "resend";
import readline from "node:readline/promises";

const WEATHER_API_KEY = process.env.API_NINJA_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const resend = new Resend(RESEND_API_KEY);

const getWeatherTool = tool({
  name: "get_weather_tool",
  description: `This tool helps to get the weather information of a given location`,
  parameters: z.object({
    lat: z.string().describe("Latitude of the location"),
    lon: z.string().describe("Longitude of the location"),
  }),
  execute: async function ({ lat, lon }) {
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

const sendEmailTool = tool({
  name: "send_email_tool",
  description: `This tool helps to send email to the users`,
  parameters: z.object({
    from: z.string().describe("From email ID"),
    to: z.string().describe("To email ID"),
    subject: z.string().describe("Subject of the email"),
    html: z.string().describe("HTML body of the email"),
  }),
  needsApproval: true,
  execute: async function ({ from, to, subject, html }) {
    const { data, error } = await resend.emails.send({
      from: `WeatherApp <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });

    if (error) return error;

    return data;
  },
});

const weatherEmailAgent = new Agent({
  name: "Weather Email Agent",
  instructions: `You are an expert in getting the weather details of a city and email them to the user.`,
  tools: [getWeatherTool, sendEmailTool],
});

async function askApproval(question: string = "") {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(`${question} (y/n): `);
  const normalizedAnswer = answer.toLocaleLowerCase();
  rl.close();
  return normalizedAnswer === "y" || normalizedAnswer === "yes";
}

async function main(query = "") {
  let result = await run(weatherEmailAgent, query);
  let currentState = result.state;
  let interruptions = result.interruptions;
  let hasInterruptions = interruptions?.length > 0;

  while (hasInterruptions) {
    for (let interruption of interruptions) {
      if (interruption.type === "tool_approval_item") {
        const confirmed = await askApproval(
          `Agent ${interruption.agent.name} would like to use the tool ${interruption.rawItem.name} with ${interruption.rawItem.arguments}. Do you approve?`
        );

        if (confirmed) {
          currentState.approve(interruption);
        } else {
          currentState.reject(interruption);
        }

        result = await run(weatherEmailAgent, currentState);
        hasInterruptions = result.interruptions?.length > 0;
      }
    }

    console.log(result.finalOutput);
  }
}

main(
  `What's the weather of Banglore? Send me the info to ramnathnaik447@gmail.com`
);

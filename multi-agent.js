/**
 * Multi-Agent System Example
 * 
 * This example demonstrates a multi-agent architecture where specialized agents
 * are used as tools by a main coordinator agent.
 * 
 * Architecture:
 * - ValidatorAgent: Main coordinator that determines which validation to perform
 * - EmailValidatorAgent: Specialized agent for email validation
 * - PhoneValidatorAgent: Specialized agent for phone number validation
 * 
 * Key concepts:
 * - Converting agents to tools using .asTool()
 * - Agent composition - agents using other agents as tools
 * - Specialized agents with focused responsibilities
 * - Main agent automatically routes requests to the appropriate sub-agent
 */

import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { z } from "zod";
import axios from "axios";

// API key for validation services
const VALIDATOR_API_KEY = process.env.API_NINJA_KEY;

/**
 * Email Validator Tool
 * 
 * Calls API Ninjas email validation endpoint to verify email addresses.
 */
const emailValidatorTool = tool({
  name: "email_validator",
  description: "This tool will help to validate the email address provided",
  parameters: z.object({
    email: z.string().describe("Email address provided"),
  }),
  execute: async function ({ email }) {
    const result = await axios.get(
      `https://api.api-ninjas.com/v1/validateemail?email=${email}`,
      {
        headers: {
          "X-Api-Key": VALIDATOR_API_KEY,
        },
      }
    );
    return result.data;
  },
});

/**
 * Phone Number Validator Tool
 * 
 * Calls API Ninjas phone validation endpoint to verify phone numbers.
 */
const phoneNumberValidatorTool = tool({
  name: "phone_number_validator",
  description: "This tool will help to validate the phone number",
  parameters: z.object({
    phoneNumber: z.string().describe("Phone number provided"),
  }),
  execute: async function ({ phoneNumber }) {
    const result = await axios.get(
      `https://api.api-ninjas.com/v1/validatephone?number=${phoneNumber}`,
      {
        headers: {
          "X-Api-Key": VALIDATOR_API_KEY,
        },
      }
    );
    return result.data;
  },
});

/**
 * Email Validator Agent
 * 
 * Specialized agent focused solely on email validation.
 * This agent will be used as a tool by the main ValidatorAgent.
 */
const EmailValidatorAgent = new Agent({
  name: "Email Validator Agent",
  instructions: "You are expert in validating the email",
  tools: [emailValidatorTool],
});

/**
 * Phone Number Validator Agent
 * 
 * Specialized agent focused solely on phone number validation.
 * This agent will be used as a tool by the main ValidatorAgent.
 */
const PhoneValidatorAgent = new Agent({
  name: "Phone Number Validator Agent",
  instructions: "You are an expert in validating the phone number",
  tools: [phoneNumberValidatorTool],
});

/**
 * Main Validator Agent
 * 
 * Coordinator agent that uses specialized agents as tools.
 * It analyzes the user's query and delegates to the appropriate sub-agent.
 * 
 * The .asTool() method converts an agent into a tool that can be used
 * by another agent, enabling agent composition.
 */
const ValidatorAgent = new Agent({
  name: "Validator Agent",
  instructions: "You are an expert in validation of email and phone numbers",
  tools: [
    PhoneValidatorAgent.asTool({ toolName: "phone_number_validator_agent" }),
    EmailValidatorAgent.asTool({ toolName: "email_validator_agent" }),
  ],
});

// Run the main agent - it will automatically route to EmailValidatorAgent
const result = await run(
  ValidatorAgent,
  "Hi, is the emailID: tjn@njna.com correct?"
);

console.log(result.finalOutput);

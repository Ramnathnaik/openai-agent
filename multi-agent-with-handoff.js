/**
 * Multi-Agent System with Handoff Example
 * 
 * This example demonstrates agent handoff - a pattern where a coordinator agent
 * transfers control to specialized agents rather than using them as tools.
 * 
 * Handoff vs. Agent-as-Tool:
 * - Handoff: Control is transferred completely to the specialized agent
 * - Agent-as-Tool: The main agent remains in control and uses sub-agents as tools
 * 
 * Architecture:
 * - ValidatorAgent: Coordinator that analyzes the query and hands off to specialists
 * - EmailValidatorAgent: Handles email validation requests
 * - PhoneValidatorAgent: Handles phone number validation requests
 * 
 * Key concepts:
 * - Using handoffs property to define available agents for handoff
 * - RECOMMENDED_PROMPT_PREFIX for better handoff decision-making
 * - handoffDescription to guide the coordinator on when to use each agent
 * - Accessing result.history to see the handoff chain
 */

import "dotenv/config";
import { Agent, tool, run } from "@openai/agents";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";
import { z } from "zod";
import axios from "axios";

// API key for validation services
const VALIDATOR_API_KEY = process.env.API_NINJA_KEY;

/**
 * Email Validator Tool
 * 
 * Validates email addresses using API Ninjas service.
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
 * Validates phone numbers using API Ninjas service.
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
 * Specialized agent for email validation.
 * Receives control via handoff from the main ValidatorAgent.
 */
const EmailValidatorAgent = new Agent({
  name: "Email Validator Agent",
  instructions: "You are expert in validating the email",
  tools: [emailValidatorTool],
});

/**
 * Phone Number Validator Agent
 * 
 * Specialized agent for phone number validation.
 * Receives control via handoff from the main ValidatorAgent.
 */
const PhoneValidatorAgent = new Agent({
  name: "Phone Number Validator Agent",
  instructions: "You are an expert in validating the phone number",
  tools: [phoneNumberValidatorTool],
});

/**
 * Main Validator Agent with Handoff Capability
 * 
 * This coordinator agent uses handoffs instead of treating agents as tools.
 * It analyzes the query and transfers control to the appropriate specialist.
 * 
 * RECOMMENDED_PROMPT_PREFIX improves the agent's ability to make handoff decisions.
 */
const ValidatorAgent = new Agent({
  name: "Validator Agent",
  instructions: `${RECOMMENDED_PROMPT_PREFIX}
    You are an expert in understanding the user query on validation of email or phone number. Upon understanding the query you will handoff the query to the relavent agent.
  `,
  handoffs: [EmailValidatorAgent, PhoneValidatorAgent], // Available agents for handoff
  handoffDescription: `You have 2 agents to handoff:
  1. Email Validator: helps to validate the email.
  2. Phone number Validator: helps to validate the phone number`,
});

/**
 * Main execution function
 * 
 * Runs the validator agent and displays both the final output and
 * the execution history showing the handoff chain.
 */
async function main(query = "") {
  const result = await run(ValidatorAgent, query);
  console.log(result.finalOutput);
  console.log(result.history); // Shows the handoff chain
}

// Example query - will be handed off to EmailValidatorAgent
main("Hi there, is this a correct email: ramnathnaik447@gmail.com?");

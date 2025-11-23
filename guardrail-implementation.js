import "dotenv/config";
import {
  Agent,
  run,
  InputGuardrailTripwireTriggered,
  OutputGuardrailTripwireTriggered,
} from "@openai/agents";
import { z } from "zod";

const AuditGuardRailAgent = new Agent({
  name: "Audit Guardrail Agent",
  instructions: `You are an expert in understanding whether an incoming query is related to audit table or not. Below are the rules to be followed:
  1. If a query is made of the audit table, reject that query
  2. Audit table info:
    - audit: audit_id, audit_query, audit_result, user_id`,
  outputType: z.object({
    isAuditSql: z
      .boolean()
      .describe("true is the query is related to audit table"),
    reasonForRejection: z
      .string()
      .optional()
      .describe("Reason for the rejection"),
  }),
});

const dbOutputGuardRail = {
  name: "Database audit table guardrail",
  execute: async function ({ agentOutput, context }) {
    // console.log(`agentOutput ${agentOutput}`);
    const result = await run(AuditGuardRailAgent, agentOutput);
    return {
      outputInfo: result.finalOutput.reasonForRejection,
      tripwireTriggered: result.finalOutput.isAuditSql,
    };
  },
};

const SelectQueryValidateAgent = new Agent({
  name: "Select Query Validate Agent",
  instructions: `You are an expert in validating user query based on the below rules:
  1. User is asking to create a database query which is readonly, meaning, select queries only.
  2. In our database we do have the below tables
  -Tables-columns:
        1. users: user_id, username, email, phone
        2. reminders: reminder_id, reminder_name, reminder_desc, reminder_date, user_id
        3. favourites: favourite_id, favourite_name, favourite_desc, user_id
        4. audit: audit_id, audit_query, audit_result, user_id
  3. User must be asking only about the tables present in our database`,
  outputType: z.object({
    isValidSelectQuery: z
      .boolean()
      .describe("true only if it's a valid select query"),
    rejectionReason: z
      .string()
      .optional()
      .describe("Reason for the rejection of creating the query"),
  }),
});

const dbSelectInputGuardRail = {
  name: "Database select query gaurdrail",
  runInParallel: false,
  execute: async function ({ input, context }) {
    const result = await run(SelectQueryValidateAgent, input);
    return {
      tripwireTriggered: !result.finalOutput.isValidSelectQuery,
      outputInfo: result.finalOutput.rejectionReason,
    };
  },
};

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
  inputGuardrails: [dbSelectInputGuardRail],
  outputGuardrails: [dbOutputGuardRail],
});

async function main(query = "") {
  try {
    const result = await run(DbQueryAgent, query);
    console.log(result.finalOutput);
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log(`Reason for rejection: `, e.message);
    } else if (e instanceof OutputGuardrailTripwireTriggered) {
      console.log(`Reason for rejection: `, e.message);
    }
  }
}

/**
 * Test Cases:
 * Uncomment different scenarios to test the guardrails
 */

// Test Case 1: UPDATE query - Should trigger INPUT guardrail (not a SELECT)
// main(
//   "Help me query the user table to get the users who's name starts with 'S' and then change there name to start with 'R'"
// );

// Test Case 2: INSERT query - Should trigger INPUT guardrail (not a SELECT)
// main(
//   "Help me insert an user. The username is ramnath, email id is rman@gmail.com and phone number is 6345545343"
// );

// Test Case 3: Valid SELECT query - Should pass both guardrails
// main(
//   "Help me create a query to get all the users who has added some reminders"
// );

// Test Case 4: Query on audit table - Should trigger OUTPUT guardrail
main(
  "Help me create a query to get users who's entires are present in the audit"
);

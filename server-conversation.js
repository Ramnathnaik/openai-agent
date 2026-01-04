import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { OpenAI } from "openai";
import { z } from "zod";

// const client = new OpenAI();
// const { id } = client.conversations.create({});

const executeTool = tool({
  name: "execute_sql_tool",
  description: "This tool helps to execute the SQL queries on the database",
  parameters: z.object({
    sql: z.string().describe("SQL to execute"),
  }),
  execute: async function ({ sql }) {
    console.log(`Executing SQL: ${sql}`);
  },
});

const DbQueryAgent = new Agent({
  name: "Database Query Agent",
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

async function main() {
  const firstResult = await run(DbQueryAgent, "Hi, my name is Ramanath", {
    conversationId: "conv_69294dbb725c8195bee5447bbddeeb860df14f329b672b2a",
  });
  console.log(firstResult.finalOutput);
  const secondResult = await run(
    DbQueryAgent,
    "Create a sql to get the reminders which I have created using my name as username",
    {
      conversationId: "conv_69294dbb725c8195bee5447bbddeeb860df14f329b672b2a",
    }
  );
  console.log(secondResult.finalOutput);
}

main();

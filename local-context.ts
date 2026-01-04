import "dotenv/config";
import { Agent, tool, run, RunContext } from "@openai/agents";
import { z } from "zod";

interface NewsPaper {
  name: string;
  section: Section[];
}

interface Section {
  name: string;
  details: string;
}

const getSectionDetailsTool = tool({
  name: "get_section_details_tool",
  description: "This tool helps to get the relavent details of the newspaper",
  parameters: z.object({
    newsPaperName: z.string().describe(`Newspaper name`),
    sectionAsked: z.string().describe("Section details asked by the user"),
  }),
  execute: async function (
    { newsPaperName, sectionAsked },
    runContext?: RunContext<NewsPaper[]>
  ): Promise<string> {
    const newspapers = runContext?.context;

    const foundNewspaper = newspapers?.find(
      (paper) => paper.name === newsPaperName
    );
    const sectionDetails = foundNewspaper?.section.find(
      (section) => section.name === sectionAsked
    );
    return sectionDetails?.details ?? "No details found";
  },
});

const newsAgent = new Agent<NewsPaper[]>({
  name: "News Agent",
  instructions: `You are an expert in analyzing the news articles and providing relavent information to the user`,
  tools: [getSectionDetailsTool],
});

async function main() {
  const newsPaper1: NewsPaper = {
    name: "Prajavani",
    section: [
      {
        name: "jobs",
        details: "Companies are hiring people who work with AI says OpenAI",
      },
      {
        name: "sports",
        details: "Rohit has becomes number 1 in ODI",
      },
    ],
  };
  const newsPaper2: NewsPaper = {
    name: "Vijayavani",
    section: [
      {
        name: "jobs",
        details: "Code optimization is done using AI says Google",
      },
      {
        name: "sports",
        details: "Kohli will be playing only ODI format, BCCI clarifies",
      },
    ],
  };
  const newspapers = [newsPaper1, newsPaper2];

  const result = await run(
    newsAgent,
    `Bring me the sports news from Prajavani news paper`,
    {
      context: newspapers,
    }
  );

  console.log(result.finalOutput);
}

main();

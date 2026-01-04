import "dotenv/config";
import { Agent, run, type RunStreamEvent } from "@openai/agents";

const storyAgent = new Agent({
  name: "Story Agent",
  instructions: `You are an expert in telling any story in a fun manner.`,
});

async function* streamEvents(result: AsyncIterable<string>) {
  for await (const event of result) {
    yield event;
  }
}

async function main(query: string = "") {
  const result = await run(storyAgent, query, { stream: true });

  /* Checking event type
    for await (const event of result) {
      if (event.type === "raw_model_stream_event") {
        console.log(event.data);
      } else if (event.type === "run_item_stream_event") {
        console.log(event.item);
      } else if (event.type === "agent_updated_stream_event") {
        console.log(event.agent);
      }
    }
      */

  /* Using stream to print
  const stream = result.toTextStream();

  for await (const event of stream) {
    console.log(event);
  } */

  /* formatting the output in a better manner
    result
    .toTextStream({
      compatibleWithNodeStreams: true,
    })
    .pipe(process.stdout);
    */

  for await (const event of streamEvents(result.toTextStream())) {
    console.log(event);
  }
}

main(`Tell me a story about a cat which is wandering around in 300 words`);

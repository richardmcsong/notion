import {
  iteratePaginatedAPI,
  Client,
  collectPaginatedAPI,
} from "@notionhq/client";
import { getDate } from "./util/util";
import type {
  BlockObjectResponse,
  UpdateBlockResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  MentionRichTextItemResponse,
  DatePropertyItemObjectResponse,
} from "@notionhq/client/build/src/api-endpoints.d.ts";

if (process.env.NOTION_TOKEN === undefined) {
  console.log("Please set the NOTION_TOKEN environment variable");
  process.exit(1);
}
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function main(): Promise<void> {
  // Initializing a client
  if (process.env.DEFERRED_TASKS_DASHBOARD_ID === undefined) {
    console.log(
      "Please set the DEFERRED_TASKS_DASHBOARD_ID environment variable",
    );
    return;
  }
  for await (const blockResponse of iteratePaginatedAPI(
    notion.blocks.children.list,
    {
      block_id: process.env.DEFERRED_TASKS_DASHBOARD_ID,
    },
  )) {
    const block = blockResponse as BlockObjectResponse;
    if (
      block.type === "heading_1" &&
      block.heading_1.is_toggleable &&
      block.heading_1.rich_text[0].plain_text === "Schedule Tasks"
    ) {
      void handleSchedule(block);
    }
  }
}

async function handleSchedule(
  block: Heading1BlockObjectResponse,
): Promise<void> {
  // There should be 3 children: Today, Tomorrow, and Monthly.
  const children = await collectPaginatedAPI(notion.blocks.children.list, {
    block_id: block.id,
  });
  for (let i = 0; i < children.length; i++) {
    const h2Block = children[i] as Heading2BlockObjectResponse;
    await handleRescheduledTasks(h2Block);
    if (i < 2) {
      // only update the date of the first two
      if (
        (
          (h2Block.heading_2.rich_text[0] as MentionRichTextItemResponse)
            .mention as DatePropertyItemObjectResponse
        ).date?.start !== getDate(i)
      ) {
        await updateToDate(h2Block, getDate(i));
      }
    }
  }
}

async function updateToDate(
  block: Heading2BlockObjectResponse,
  date: string,
): Promise<UpdateBlockResponse> {
  return await notion.blocks.update({
    block_id: block.id,
    heading_2: {
      rich_text: [
        {
          type: "mention",
          mention: {
            date: { start: date },
          },
        },
      ],
    },
  });
}

async function handleRescheduledTasks(
  block: Heading2BlockObjectResponse,
): Promise<void> {
  for await (const blockResponse of iteratePaginatedAPI(
    notion.blocks.children.list,
    {
      block_id: block.id,
    },
  )) {
    const block = blockResponse as BlockObjectResponse; //eslint-disable-line
    // console.log(block);
  }
}

void main();

import "dotenv/config";
import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

interface NotionPageProperties {
  title: { title: Array<{ plain_text: string }> };
  date?: { date: { start: string } | null };
  summary?: { rich_text: Array<{ plain_text: string }> };
  tags?: { multi_select: Array<{ name: string }> };
  slug?: { rich_text: Array<{ plain_text: string }> };
  published?: { checkbox: boolean };
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function extractProperty(properties: NotionPageProperties) {
  const title =
    properties.title?.title?.map((t) => t.plain_text).join("") || "Untitled";
  const date = properties.date?.date?.start || "";
  const summary =
    properties.summary?.rich_text?.map((t) => t.plain_text).join("") || "";
  const tags = properties.tags?.multi_select?.map((t) => t.name) || [];
  const slug =
    properties.slug?.rich_text?.map((t) => t.plain_text).join("") ||
    title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
  const published = properties.published?.checkbox ?? true;

  return { title, date, summary, tags, slug, published };
}

function buildFrontmatter(meta: {
  title: string;
  date: string;
  summary: string;
  tags: string[];
}): string {
  const lines = [
    "---",
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `date: "${meta.date}"`,
    `summary: "${meta.summary.replace(/"/g, '\\"')}"`,
    `tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`,
    `source: "notion"`,
    "---",
  ];
  return lines.join("\n");
}

export async function syncNotion(): Promise<number> {
  const apiKey = getEnv("NOTION_API_KEY");
  const databaseId = getEnv("NOTION_DATABASE_ID");

  const notion = new Client({ auth: apiKey });
  const n2m = new NotionToMarkdown({ notionClient: notion });

  const response = await notion.dataSources.query({
    data_source_id: databaseId,
    sorts: [{ property: "date", direction: "descending" }],
  });

  let count = 0;

  for (const page of response.results) {
    if (!("properties" in page)) continue;

    const properties = page.properties as unknown as NotionPageProperties;
    const meta = extractProperty(properties);

    if (!meta.published) continue;

    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdContent = n2m.toMarkdownString(mdBlocks).parent;

    const frontmatter = buildFrontmatter(meta);
    const fileContent = `${frontmatter}\n\n${mdContent}`;

    const filePath = path.join(POSTS_DIR, `${meta.slug}.mdx`);
    fs.writeFileSync(filePath, fileContent, "utf8");

    console.log(`  [Notion] Synced: ${meta.title} -> ${meta.slug}.mdx`);
    count++;
  }

  return count;
}

// 单独运行
if (process.argv[1]?.includes("sync-notion")) {
  syncNotion()
    .then((count) => console.log(`\nNotion sync complete: ${count} posts`))
    .catch((err) => {
      console.error("Notion sync failed:", err.message);
      process.exit(1);
    });
}

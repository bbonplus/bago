import "dotenv/config";
import fs from "fs";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");
const YUQUE_API = "https://www.yuque.com/api/v2";

interface YuqueDoc {
  id: number;
  slug: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  status: number;
  public: number;
}

interface YuqueDocDetail {
  id: number;
  slug: string;
  title: string;
  description: string;
  created_at: string;
  body: string;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

async function yuqueFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${YUQUE_API}${path}`, {
    headers: {
      "X-Auth-Token": token,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Yuque API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { data: T };
  return json.data;
}

function cleanYuqueMarkdown(body: string): string {
  return body
    .replace(/<a name="[^"]*"><\/a>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toSlug(title: string, yuqueSlug: string): string {
  // 如果语雀 slug 是有意义的英文，直接用
  if (/^[a-z0-9-]+$/.test(yuqueSlug) && yuqueSlug.length > 2) {
    return yuqueSlug;
  }
  // 否则用标题生成
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildFrontmatter(meta: {
  title: string;
  date: string;
  summary: string;
}): string {
  const lines = [
    "---",
    `title: "${meta.title.replace(/"/g, '\\"')}"`,
    `date: "${meta.date}"`,
    `summary: "${meta.summary.replace(/"/g, '\\"')}"`,
    `tags: []`,
    `source: "yuque"`,
    "---",
  ];
  return lines.join("\n");
}

export async function syncYuque(): Promise<number> {
  const token = getEnv("YUQUE_TOKEN");
  const namespace = getEnv("YUQUE_NAMESPACE");

  const docs = await yuqueFetch<YuqueDoc[]>(
    `/repos/${namespace}/docs`,
    token
  );

  const publicDocs = docs.filter((d) => d.status === 1 && d.public === 1);
  let count = 0;

  for (const doc of publicDocs) {
    const detail = await yuqueFetch<YuqueDocDetail>(
      `/repos/${namespace}/docs/${doc.slug}`,
      token
    );

    const slug = toSlug(detail.title, detail.slug);
    const date = detail.created_at.split("T")[0];
    const content = cleanYuqueMarkdown(detail.body);

    const frontmatter = buildFrontmatter({
      title: detail.title,
      date,
      summary: detail.description || "",
    });

    const fileContent = `${frontmatter}\n\n${content}`;
    const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
    fs.writeFileSync(filePath, fileContent, "utf8");

    console.log(`  [Yuque] Synced: ${detail.title} -> ${slug}.mdx`);
    count++;
  }

  return count;
}

// 单独运行
if (process.argv[1]?.includes("sync-yuque")) {
  syncYuque()
    .then((count) => console.log(`\nYuque sync complete: ${count} posts`))
    .catch((err) => {
      console.error("Yuque sync failed:", err.message);
      process.exit(1);
    });
}

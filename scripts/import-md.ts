import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "src/content/posts");

function cleanForMdx(content: string): string {
  return content
    .replace(/<!--[\s\S]*?-->/g, "") // HTML 注释在 MDX 中不合法
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toSlug(filename: string): string {
  const name = filename.replace(/\.mdx?$/, "");
  // 提取 ASCII 部分作为 slug 前缀
  const asciiPart = name
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  // 如果有足够的 ASCII 内容，直接用；否则加短 hash 保证唯一
  if (asciiPart.length >= 3) {
    return asciiPart;
  }
  const hash = crypto.createHash("md5").update(name).digest("hex").slice(0, 8);
  return asciiPart ? `${asciiPart}-${hash}` : `post-${hash}`;
}

function importMarkdown(filePaths: readonly string[]): void {
  if (filePaths.length === 0) {
    console.error("Usage: npx tsx scripts/import-md.ts <file1.md> [file2.md] ...");
    console.error("       npx tsx scripts/import-md.ts path/to/folder/");
    process.exit(1);
  }

  const resolvedFiles = filePaths.flatMap((p) => {
    const resolved = path.resolve(p);
    if (fs.statSync(resolved).isDirectory()) {
      return fs
        .readdirSync(resolved)
        .filter((f) => /\.mdx?$/.test(f))
        .map((f) => path.join(resolved, f));
    }
    return [resolved];
  });

  if (resolvedFiles.length === 0) {
    console.error("No .md / .mdx files found.");
    process.exit(1);
  }

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  let count = 0;
  for (const file of resolvedFiles) {
    const raw = fs.readFileSync(file, "utf8");
    const filename = path.basename(file);
    const slug = toSlug(filename);
    const { data, content } = matter(raw);

    const title = data.title ?? filename.replace(/\.mdx?$/, "");
    const date = data.date ?? new Date().toISOString().split("T")[0];
    const summary = data.summary ?? data.description ?? "";
    const tags = data.tags ?? [];

    const frontmatter = [
      "---",
      `title: "${String(title).replace(/"/g, '\\"')}"`,
      `date: "${date}"`,
      `summary: "${String(summary).replace(/"/g, '\\"')}"`,
      `tags: ${JSON.stringify(tags)}`,
      "---",
    ].join("\n");

    const cleaned = cleanForMdx(content);
    const output = `${frontmatter}\n\n${cleaned}\n`;
    const dest = path.join(POSTS_DIR, `${slug}.mdx`);

    fs.writeFileSync(dest, output, "utf8");
    console.log(`  ✓ ${filename} -> ${slug}.mdx`);
    count++;
  }

  console.log(`\nImported ${count} post(s).`);
}

importMarkdown(process.argv.slice(2));

import "dotenv/config";
import { syncNotion } from "./sync-notion";
import { syncYuque } from "./sync-yuque";

async function main() {
  console.log("Starting content sync...\n");

  let notionCount = 0;
  let yuqueCount = 0;

  // Notion 同步
  if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
    console.log("[Notion] Syncing...");
    try {
      notionCount = await syncNotion();
    } catch (err) {
      console.error("[Notion] Sync failed:", (err as Error).message);
    }
  } else {
    console.log("[Notion] Skipped (no credentials configured)");
  }

  // 语雀同步
  if (process.env.YUQUE_TOKEN && process.env.YUQUE_NAMESPACE) {
    console.log("[Yuque] Syncing...");
    try {
      yuqueCount = await syncYuque();
    } catch (err) {
      console.error("[Yuque] Sync failed:", (err as Error).message);
    }
  } else {
    console.log("[Yuque] Skipped (no credentials configured)");
  }

  console.log(`\nSync complete: Notion(${notionCount}) + Yuque(${yuqueCount}) posts`);
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});

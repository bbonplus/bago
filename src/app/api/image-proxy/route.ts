import { NextRequest } from "next/server";

const ALLOWED_HOSTS = ["cdn.nlark.com", "cdn.yuque.com"];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new Response("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return new Response("Host not allowed", { status: 403 });
  }

  const res = await fetch(url, {
    headers: { Referer: "https://www.yuque.com/" },
  });

  if (!res.ok) {
    return new Response("Failed to fetch image", { status: res.status });
  }

  const contentType = res.headers.get("content-type") ?? "image/png";
  const body = await res.arrayBuffer();

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

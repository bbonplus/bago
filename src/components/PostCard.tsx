import Link from "next/link";
import { format } from "date-fns";
import type { PostMeta } from "@/lib/posts";

export default function PostCard({ post }: { readonly post: PostMeta }) {
  return (
    <article className="group py-6">
      <Link href={`/posts/${post.slug}`} className="block">
        <h2 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          {post.date && (
            <time dateTime={post.date}>
              {format(new Date(post.date), "yyyy-MM-dd")}
            </time>
          )}
          <span>&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        {post.summary && (
          <p className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
            {post.summary}
          </p>
        )}
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-0.5 text-xs text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  );
}

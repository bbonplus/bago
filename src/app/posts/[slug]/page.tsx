import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getAllSlugs, getPostBySlug } from "@/lib/posts";
import MdxContent from "@/components/MdxContent";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
          {post.date && (
            <time dateTime={post.date}>
              {format(new Date(post.date), "yyyy-MM-dd")}
            </time>
          )}
          <span>&middot;</span>
          <span>{post.readingTime}</span>
        </div>
        {post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose-custom">
        <MdxContent source={post.content} />
      </div>

      <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8">
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm"
        >
          &larr; 返回文章列表
        </Link>
      </footer>
    </article>
  );
}

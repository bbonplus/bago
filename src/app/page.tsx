import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <section className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Bago Blog</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          记录技术、编程与生活的点滴。
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">最新文章</h2>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <p className="py-8 text-gray-500">暂无文章，快去写第一篇吧！</p>
          )}
        </div>
      </section>
    </div>
  );
}

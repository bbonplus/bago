import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">关于</h1>
      <div className="mt-8 space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>
          欢迎来到 Bago Blog！这是一个使用 Next.js 和 MDX 搭建的个人博客。
        </p>
        <p>
          在这里，我会分享关于技术、编程和生活的思考与经验。
        </p>
        <h2 className="text-2xl font-semibold text-foreground pt-4">技术栈</h2>
        <ul className="list-disc ml-6 space-y-1">
          <li>Next.js (App Router)</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>MDX</li>
        </ul>
      </div>
    </div>
  );
}

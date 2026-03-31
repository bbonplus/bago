import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Bago Blog
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            首页
          </Link>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            关于
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            GitHub
          </a>
        </div>
      </nav>
    </header>
  );
}

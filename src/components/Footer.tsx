export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto max-w-3xl px-6 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Bago Blog. All rights reserved.</p>
      </div>
    </footer>
  );
}

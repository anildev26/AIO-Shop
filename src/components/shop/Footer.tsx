export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          &copy; {currentYear} AIO Shop. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-200 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar skeleton */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="w-28 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="aspect-square bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="p-8 space-y-4">
              <div className="w-3/4 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="w-1/3 h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="space-y-2 mt-4">
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
              <div className="mt-8 space-y-3">
                <div className="w-full h-12 bg-green-200 dark:bg-green-900 rounded-xl animate-pulse" />
                <div className="w-full h-12 bg-blue-200 dark:bg-blue-900 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Navbar skeleton */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="w-48 h-7 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="w-32 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl animate-pulse" />
            <div className="w-24 h-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="flex flex-wrap gap-3 sm:gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-[120px] flex-1 max-w-[200px] sm:max-w-[240px] bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="aspect-square bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="p-2 sm:p-3 space-y-2">
                <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="w-1/2 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-360 px-4 pb-12 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex items-center gap-2 py-3">
        <div className="h-3 w-12 animate-pulse rounded bg-gray-light" />
        <div className="h-3 w-3 animate-pulse rounded bg-gray-light" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-light" />
      </div>

      {/* Header skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="h-6 w-40 animate-pulse rounded bg-gray-light" />
          <div className="mt-1.5 h-3 w-24 animate-pulse rounded bg-gray-light" />
        </div>
        <div className="h-8 w-36 animate-pulse rounded-lg bg-gray-light" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <div className="hidden w-[240px] shrink-0 space-y-4 lg:block">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 border-b border-gray-border pb-4">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-light" />
              <div className="space-y-1.5">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="h-3.5 w-full animate-pulse rounded bg-gray-light"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-2.5">
                <div className="aspect-square animate-pulse rounded-xl bg-gray-light" />
                <div className="h-3 w-3/4 animate-pulse rounded bg-gray-light" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-light" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-gray-light" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

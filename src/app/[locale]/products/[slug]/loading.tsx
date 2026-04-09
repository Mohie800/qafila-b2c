export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-360 px-4 pb-12 sm:px-6">
      {/* Breadcrumb skeleton */}
      <div className="mb-4 flex gap-2 py-3">
        <div className="h-3 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-3 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery skeleton — mirrors ImageGallery layout exactly */}
        <div className="flex min-w-0 flex-col-reverse gap-3 overflow-hidden lg:flex-row">
          {/* Thumbnails */}
          <div className="flex gap-2 lg:flex-col">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[72px] w-[72px] shrink-0 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700"
              />
            ))}
          </div>
          {/* Main image */}
          <div className="relative min-h-[300px] flex-1 animate-pulse overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-700 lg:aspect-square lg:min-h-0" />
        </div>

        {/* Right column skeleton */}
        <div className="space-y-5">
          <div>
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>

          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 w-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>

          {/* Color swatches */}
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[72px] w-[60px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

          {/* Sizes */}
          <div className="space-y-2">
            <div className="h-4 w-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-14 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <div className="h-12 flex-1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="h-12 w-14 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* Accordion lines */}
          <div className="space-y-3 pt-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-100 dark:bg-dark" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

export function ProductSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
          <div className="animate-pulse">
            <div className="h-48 bg-surface-200 dark:bg-surface-700"></div>
            <div className="p-4">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded mb-2 w-1/2"></div>
              <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded mb-3 w-2/3"></div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
                <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartItemSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 p-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded"></div>
              <div>
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded mb-2 w-32"></div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-24"></div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-surface-200 dark:bg-surface-700 rounded"></div>
                <div className="h-8 w-12 bg-surface-200 dark:bg-surface-700 rounded"></div>
                <div className="h-8 w-8 bg-surface-200 dark:bg-surface-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BillingSummarySkeleton() {
  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-1/3"></div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24"></div>
            <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
          </div>
          <div className="border-t border-surface-200 dark:border-surface-700 pt-2">
            <div className="flex justify-between">
              <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-16"></div>
              <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-28"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OfferSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 p-4">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded w-16"></div>
            </div>
            <div className="flex space-x-4">
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-24"></div>
              <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-surface-300 border-t-primary-600 ${sizeClasses[size]} ${className}`}></div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-surface-600 dark:text-surface-400 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

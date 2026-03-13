export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'card') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="skeleton h-5 w-3/4 rounded" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
            <div className="mt-3 flex gap-2">
              <div className="skeleton h-8 w-20 rounded-lg" />
              <div className="skeleton h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="card animate-pulse">
        <div className="flex items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-5 w-32 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-3 items-start animate-pulse">
            <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="skeleton h-4 w-24 rounded" />
              <div className={`skeleton h-12 rounded-xl ${i % 2 === 0 ? 'w-3/4' : 'w-1/2'}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

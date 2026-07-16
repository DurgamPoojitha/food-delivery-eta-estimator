const MetricSkeleton = () => (
  <div className="card p-4 flex items-center gap-4">
    <div className="skeleton w-10 h-10 rounded-xl" />
    <div className="flex-1">
      <div className="skeleton h-6 w-16 rounded mb-2" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="animate-fade-in">
    <div className="flex items-center justify-between mb-4">
      <div className="skeleton h-5 w-48 rounded" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      {[...Array(5)].map((_, i) => <MetricSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-4 flex items-center gap-4">
        <div className="skeleton w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <div className="skeleton h-4 w-24 rounded mb-2" />
          <div className="skeleton h-6 w-16 rounded" />
        </div>
      </div>
      <div className="card p-4">
        <div className="skeleton h-4 w-32 rounded mb-4" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="skeleton h-3 w-12 rounded mb-2" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

export default LoadingSkeleton

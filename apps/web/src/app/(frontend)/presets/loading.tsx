export default function PresetsLoading() {
  return (
    <div className="min-h-screen pt-20 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 rounded bg-[var(--lp-surface)] animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-[var(--lp-surface)] animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

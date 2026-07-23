export function LoadingSkeleton() {
  return (
    <div
      className="divide-y divide-line/80 rounded-md border border-line bg-panel py-4"
      aria-label="Loading articles"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="grid animate-pulse grid-cols-[72px_1fr] gap-4 px-5 py-3 sm:grid-cols-[96px_1fr]"
        >
          <div className="h-12 rounded-md bg-thumb sm:h-16" />
          <div className="space-y-2.5">
            <div className="h-5 w-10/12 rounded bg-[#D7E1EE]" />
            <div className="h-4 w-7/12 rounded bg-[#E7EEF7]" />
          </div>
        </div>
      ))}
    </div>
  );
}

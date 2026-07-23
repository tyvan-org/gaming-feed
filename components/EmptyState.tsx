import { SearchX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="mx-5 rounded-md border border-dashed border-line bg-ink p-8 text-center">
      <SearchX aria-hidden="true" className="mx-auto h-10 w-10 text-mist" />
      <h2 className="mt-4 text-xl font-semibold text-paper">No articles found.</h2>
      <p className="mt-2 text-sm text-mist">Try changing your search or source filter.</p>
    </div>
  );
}

import { Search } from "lucide-react";

type SearchInputProps = {
  defaultValue?: string;
  feed?: "articles" | "videos";
};

export function SearchInput({ defaultValue = "", feed = "articles" }: SearchInputProps) {
  const itemLabel = feed === "videos" ? "videos" : "articles";

  return (
    <form action="/" className="flex min-w-0 flex-1 items-center gap-2">
      {feed === "videos" ? <input type="hidden" name="feed" value={feed} /> : null}
      <label className="relative block min-w-0 flex-1">
        <span className="sr-only">Search {itemLabel}</span>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist"
        />
        <input
          name="q"
          defaultValue={defaultValue}
          placeholder="Search title or summary"
          className="h-9 w-full rounded-md border border-line bg-panel px-9 text-xs font-medium text-paper outline-none transition placeholder:text-mist focus:border-glow sm:text-sm"
        />
      </label>
      <button
        type="submit"
        className="h-9 shrink-0 rounded-md border border-line bg-panel px-3 text-xs font-bold uppercase tracking-wide text-mist transition hover:border-glow hover:text-paper"
      >
        Search
      </button>
    </form>
  );
}

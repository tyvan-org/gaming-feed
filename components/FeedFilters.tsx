import Link from "next/link";

import type { SourceOption } from "@/lib/sources";

type FeedFiltersProps = {
  sources: SourceOption[];
  activeSource?: string;
  q?: string;
};

function buildHref(source: string | undefined, q: string | undefined) {
  const params = new URLSearchParams();

  if (source) {
    params.set("source", source);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function FeedFilters({ sources, activeSource, q }: FeedFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href={buildHref(undefined, q)}
        className={`whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
          activeSource
            ? "border-line bg-panel text-mist hover:border-glow/60 hover:text-paper"
            : "border-glow/70 bg-[#E8F2FF] text-glow"
        }`}
      >
        All sources
      </Link>
      {sources.map((source) => (
        <Link
          key={source.id}
          href={buildHref(source.id, q)}
          className={`whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
            activeSource === source.id
              ? "border-glow/70 bg-[#E8F2FF] text-glow"
              : "border-line bg-panel text-mist hover:border-glow/60 hover:text-paper"
          }`}
        >
          {source.label}
          <span className="ml-1.5 text-[11px] text-mist">{source.count}</span>
        </Link>
      ))}
    </div>
  );
}

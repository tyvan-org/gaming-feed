import Link from "next/link";

type FeedFiltersProps = {
  activeFeed: "articles" | "videos";
  q?: string;
};

const tabs = [
  { id: "articles", label: "R/GAMINGNEWS" },
  { id: "videos", label: "R/VIDEOGAMES" },
] as const;

function buildHref(feed: "articles" | "videos", q: string | undefined) {
  const params = new URLSearchParams();

  if (feed === "videos") {
    params.set("feed", feed);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function FeedFilters({ activeFeed, q }: FeedFiltersProps) {
  return (
    <nav className="flex gap-3 overflow-x-auto pb-1" aria-label="Feed tabs">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={buildHref(tab.id, q)}
          className={`whitespace-nowrap border-b pb-1 text-base font-bold uppercase tracking-wide transition sm:text-lg ${
            activeFeed === tab.id
              ? "border-glow text-glow"
              : "border-dotted border-mist text-mist hover:border-glow/70 hover:text-paper"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

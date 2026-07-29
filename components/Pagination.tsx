import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  totalPages: number;
  feed?: "articles" | "videos";
  q?: string;
};

function pageHref(page: number, feed: "articles" | "videos" | undefined, q: string | undefined) {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", page.toString());
  }

  if (feed === "videos") {
    params.set("feed", feed);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export function Pagination({ page, totalPages, feed = "articles", q }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav className="flex items-center justify-between gap-3 px-5 pt-4" aria-label="Pagination">
      <Link
        href={pageHref(previousPage, feed, q)}
        aria-disabled={page <= 1}
        className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold uppercase tracking-wide transition ${
          page <= 1
            ? "pointer-events-none border-line text-mist/45"
            : "border-line text-mist hover:border-glow/70 hover:text-paper"
        }`}
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Newer
      </Link>
      <span className="text-xs font-bold text-mist sm:text-sm">
        Page {page} of {totalPages}
      </span>
      <Link
        href={pageHref(nextPage, feed, q)}
        aria-disabled={page >= totalPages}
        className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-bold uppercase tracking-wide transition ${
          page >= totalPages
            ? "pointer-events-none border-line text-mist/45"
            : "border-line text-mist hover:border-glow/70 hover:text-paper"
        }`}
      >
        Older
        <ChevronRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </nav>
  );
}

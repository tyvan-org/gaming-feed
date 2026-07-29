import { ExternalLink } from "lucide-react";

import { ArticleThumbnail } from "@/components/ArticleThumbnail";
import type { ArticleListItem } from "@/lib/articles";
import { formatArticleDate } from "@/lib/formatDate";
import { formatSourceLabel } from "@/lib/sourceLabels";

type ArticleCardProps = {
  article: ArticleListItem;
  priority?: boolean;
};

const sourceFallbackImages = {
  ign: "https://upload.wikimedia.org/wikipedia/commons/4/47/IGN_logo.svg",
  pcgamer: "https://www.pcgamer.com/media/img/pcgamer_logo.svg",
  steam: "https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg",
};

function getFallbackImageUrl(sourceId: string) {
  const normalizedSourceId = sourceId.toLowerCase();

  if (normalizedSourceId === "ign") {
    return sourceFallbackImages.ign;
  }

  if (normalizedSourceId === "pcgamer" || normalizedSourceId === "pc-gamer") {
    return sourceFallbackImages.pcgamer;
  }

  if (normalizedSourceId.startsWith("steam")) {
    return sourceFallbackImages.steam;
  }

  return null;
}

function formatSummary(summary: string | null) {
  return summary
    ?.replace(/&lt;[^&]*?&gt;/g, " ")
    ?.replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function ArticleCard({
  article,
  priority = false,
}: ArticleCardProps) {
  const displayDate = article.publishedAt ?? article.fetchedAt;
  const sourceLabel = formatSourceLabel(article.sourceId);
  const summary = formatSummary(article.summary);
  const fallbackImageUrl = getFallbackImageUrl(article.sourceId);
  const thumbnailUrl = article.imageUrl || fallbackImageUrl;

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group grid grid-cols-[72px_1fr] gap-4 px-3 py-2.5 transition hover:bg-row sm:grid-cols-[96px_1fr] sm:px-5 sm:py-3"
    >
      <ArticleThumbnail
        fit={article.imageUrl ? "cover" : "contain"}
        src={thumbnailUrl}
        priority={priority}
      />
      <div className="min-w-0">
        <div className="space-y-1">
          <h2
            className={
              priority
                ? "line-clamp-2 text-sm font-bold leading-snug text-paper sm:text-base"
                : "line-clamp-2 text-sm font-bold leading-snug text-paper sm:text-base"
            }
          >
            {article.title}
          </h2>
          {summary ? (
            <p className="line-clamp-2 text-xs font-medium leading-5 text-soft sm:text-[13px]">
              {summary}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] font-bold text-mist sm:text-xs">
            <time dateTime={displayDate.toISOString()}>{formatArticleDate(displayDate)}</time>
            <span aria-hidden="true">•</span>
            <span>{sourceLabel}</span>
            {article.author ? (
              <>
                <span aria-hidden="true">•</span>
                <span>{article.author}</span>
              </>
            ) : null}
            <span aria-hidden="true">•</span>
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </a>
  );
}

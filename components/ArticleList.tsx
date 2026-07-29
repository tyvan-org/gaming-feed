"use client";

import { useState } from "react";

import type { ArticleListItem } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";

type ArticleListProps = {
  articles: ArticleListItem[];
  feed: "articles" | "videos";
  itemLabel?: "article" | "video";
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  q?: string;
};

type SerializedArticle = Omit<ArticleListItem, "publishedAt" | "fetchedAt"> & {
  publishedAt: string | null;
  fetchedAt: string;
};

function deserializeArticle(article: SerializedArticle): ArticleListItem {
  return {
    ...article,
    publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
    fetchedAt: new Date(article.fetchedAt),
  };
}

export function ArticleList({
  articles,
  feed,
  itemLabel = "article",
  pagination,
  q,
}: ArticleListProps) {
  const [items, setItems] = useState(articles);
  const [page, setPage] = useState(pagination.page);
  const [totalPages, setTotalPages] = useState(pagination.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMore = page < totalPages;

  async function loadMore() {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: "5",
        feed,
      });

      if (q) {
        params.set("q", q);
      }

      const response = await fetch(`/api/articles?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Could not load more items.");
      }

      const data = await response.json() as {
        items: SerializedArticle[];
        pagination: {
          page: number;
          totalPages: number;
        };
      };

      setItems((currentItems) => [
        ...currentItems,
        ...data.items.map(deserializeArticle),
      ]);
      setPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
    } catch {
      setError("Could not load more. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (items.length === 0) {
    return <EmptyState itemLabel={itemLabel} />;
  }

  return (
    <>
      <div className="divide-y divide-line/80">
        {items.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            priority={index === 0}
          />
        ))}
      </div>
      {hasMore ? (
        <div className="px-5 pt-4">
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoading}
            className="h-9 rounded-md border border-line bg-panel px-3 text-xs font-bold uppercase tracking-wide text-mist transition hover:border-glow hover:text-paper disabled:cursor-wait disabled:text-mist/45"
          >
            {isLoading ? "Loading..." : "Show more"}
          </button>
          {error ? <p className="mt-2 text-xs font-semibold text-glow">{error}</p> : null}
        </div>
      ) : null}
    </>
  );
}

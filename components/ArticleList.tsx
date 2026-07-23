import type { ArticleListItem } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { EmptyState } from "@/components/EmptyState";

type ArticleListProps = {
  articles: ArticleListItem[];
};

export function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="divide-y divide-line/80">
      {articles.map((article, index) => (
        <ArticleCard
          key={article.id}
          article={article}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

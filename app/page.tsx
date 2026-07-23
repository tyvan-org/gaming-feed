import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { ArticleList } from "@/components/ArticleList";
import { FeedFilters } from "@/components/FeedFilters";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { getArticles, parseArticleQuery } from "@/lib/articles";
import { getSourceOptions } from "@/lib/sources";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const query = parseArticleQuery(resolvedSearchParams);

  try {
    const [articlePage, sources] = await Promise.all([
      getArticles(query),
      getSourceOptions(),
    ]);

    return (
      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-4 border-b border-line">
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <Link href="/" className="inline-flex items-end">
                <span className="border-b border-dotted border-mist pb-1 text-base font-bold uppercase tracking-wide text-mist sm:text-lg">
                  R/PCGAMING
                </span>
              </Link>
              <SearchInput defaultValue={query.q} source={query.source} />
            </div>
            <FeedFilters sources={sources} activeSource={query.source} q={query.q} />
          </div>
        </header>

        <section className="rounded-md border border-line bg-panel py-4">
          <div className="mb-1 px-4 text-xs font-bold uppercase tracking-wide text-mist sm:px-5">
            {articlePage.pagination.total.toLocaleString()} article
            {articlePage.pagination.total === 1 ? "" : "s"}
          </div>

          <ArticleList articles={articlePage.items} />
          <Pagination
            page={articlePage.pagination.page}
            totalPages={articlePage.pagination.totalPages}
            source={query.source}
            q={query.q}
          />
        </section>

        <footer className="py-6 text-sm text-mist" />
      </main>
    );
  } catch (error) {
    console.error("Could not load articles", error);

    return (
      <main className="mx-auto grid min-h-screen w-full max-w-3xl place-items-center px-4 py-10">
        <div className="rounded-md border border-line bg-panel p-8 text-center">
          <AlertTriangle aria-hidden="true" className="mx-auto h-10 w-10 text-glow" />
          <h1 className="mt-4 text-2xl font-semibold text-paper">
            Could not load articles.
          </h1>
          <p className="mt-2 text-sm leading-6 text-mist">
            Please check the database configuration and try again later.
          </p>
        </div>
      </main>
    );
  }
}

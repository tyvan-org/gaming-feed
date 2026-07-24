import { z } from "zod";

import { getArticlesTableSql, getPool } from "@/lib/db";

export const articleQuerySchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  limit: z.coerce.number().int().min(1).max(50).catch(20),
  source: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1).optional(),
});

export type ArticleQuery = z.infer<typeof articleQuerySchema>;

export type ArticleListItem = {
  id: string;
  sourceId: string;
  externalId: string;
  title: string;
  url: string;
  summary: string | null;
  author: string | null;
  imageUrl: string | null;
  publishedAt: Date | null;
  fetchedAt: Date;
};

export type ArticlePage = {
  items: ArticleListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function parseArticleQuery(input: Record<string, string | string[] | undefined>) {
  const firstValue = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  );

  return articleQuerySchema.parse(firstValue);
}

type ArticleRow = {
  id: string;
  source_id: string;
  external_id: string;
  title: string;
  url: string;
  summary: string | null;
  author: string | null;
  image_url: string | null;
  published_at: Date | null;
  fetched_at: Date;
};

function buildWhereClause(query: ArticleQuery) {
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (query.source) {
    values.push(query.source);
    conditions.push(`source_id = $${values.length}`);
  }

  if (query.q) {
    values.push(`%${query.q}%`);
    const searchIndex = values.length;
    conditions.push(
      `(title ILIKE $${searchIndex} OR coalesce(summary, '') ILIKE $${searchIndex})`,
    );
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

export async function getArticles(query: ArticleQuery): Promise<ArticlePage> {
  const page = query.page;
  const limit = query.limit;
  const offset = (page - 1) * limit;
  const where = buildWhereClause(query);
  const articlesTable = getArticlesTableSql();
  const pool = getPool();
  const limitIndex = where.values.length + 1;
  const offsetIndex = where.values.length + 2;

  const [itemsResult, countResult] = await Promise.all([
    pool.query<ArticleRow>(
      `
        SELECT
          (source_id || ':' || external_id) AS id,
          source_id,
          external_id,
          title,
          url,
          summary,
          author,
          img_url AS image_url,
          published_at,
          fetched_at
        FROM ${articlesTable}
        ${where.clause}
        ORDER BY published_at DESC NULLS LAST, fetched_at DESC
        LIMIT $${limitIndex}
        OFFSET $${offsetIndex}
      `,
      [...where.values, limit, offset],
    ),
    pool.query<{ total: string }>(
      `
        SELECT count(*)::text AS total
        FROM ${articlesTable}
        ${where.clause}
      `,
      where.values,
    ),
  ]);
  const total = Number(countResult.rows[0]?.total ?? 0);

  return {
    items: itemsResult.rows.map((article) => ({
      id: article.id,
      sourceId: article.source_id,
      externalId: article.external_id,
      title: article.title,
      url: article.url,
      summary: article.summary,
      author: article.author,
      imageUrl: article.image_url,
      publishedAt: article.published_at,
      fetchedAt: article.fetched_at,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function serializeArticle(article: ArticleListItem) {
  return {
    ...article,
    img_url: article.imageUrl ?? "",
    publishedAt: article.publishedAt?.toISOString() ?? null,
    fetchedAt: article.fetchedAt.toISOString(),
  };
}

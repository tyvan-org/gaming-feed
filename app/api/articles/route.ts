import { NextResponse } from "next/server";

import { getArticles, parseArticleQuery, serializeArticle } from "@/lib/articles";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseArticleQuery(Object.fromEntries(searchParams.entries()));
  const page = await getArticles(query);

  return NextResponse.json({
    items: page.items.map(serializeArticle),
    pagination: page.pagination,
  });
}


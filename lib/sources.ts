import { getArticlesTableSql, getPool } from "@/lib/db";
import { formatSourceLabel } from "@/lib/sourceLabels";

export { formatSourceLabel } from "@/lib/sourceLabels";

export type SourceOption = {
  id: string;
  label: string;
  count: number;
};

export async function getSourceOptions(): Promise<SourceOption[]> {
  const articlesTable = getArticlesTableSql();
  const pool = getPool();
  const result = await pool.query<{ source_id: string; count: string }>(
    `
      SELECT source_id, count(*)::text AS count
      FROM ${articlesTable}
      GROUP BY source_id
      ORDER BY source_id ASC
    `,
  );

  return result.rows.map((source) => ({
    id: source.source_id,
    label: formatSourceLabel(source.source_id),
    count: Number(source.count),
  }));
}

import { getArticlesTableSql, getPool } from "@/lib/db";

const sourceLabels: Record<string, string> = {
  ign: "IGN",
  pcgamer: "PC Gamer",
  gamespot: "GameSpot",
  polygon: "Polygon",
  kotaku: "Kotaku",
  eurogamer: "Eurogamer",
};

export type SourceOption = {
  id: string;
  label: string;
  count: number;
};

export function formatSourceLabel(sourceId: string) {
  return (
    sourceLabels[sourceId] ??
    sourceId
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

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


import { Pool } from "pg";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);

    if (!match || process.env[match[1]]) {
      continue;
    }

    process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is not configured.");
  process.exit(1);
}

const parsedUrl = new URL(databaseUrl);
const schema = parsedUrl.searchParams.get("schema");
const sslMode = parsedUrl.searchParams.get("sslmode");
const sslAccept = parsedUrl.searchParams.get("sslaccept");
const articlesTable = process.env.ARTICLES_TABLE ?? "public.rss_articles";

parsedUrl.searchParams.delete("schema");
parsedUrl.searchParams.delete("sslaccept");
parsedUrl.searchParams.delete("sslmode");

const pool = new Pool({
  connectionString: parsedUrl.toString(),
  options: schema ? `-c search_path=${schema},public` : undefined,
  ssl:
    sslMode === "disable"
      ? false
      : {
          minVersion: "TLSv1.3",
          rejectUnauthorized: sslAccept !== "accept_invalid_certs",
        },
});

function quoteIdentifier(identifier) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }

  return `"${identifier}"`;
}

function tableSql(tableName) {
  const parts = tableName.split(".");

  if (parts.length < 1 || parts.length > 2) {
    throw new Error("ARTICLES_TABLE must be table or schema.table.");
  }

  return parts.map(quoteIdentifier).join(".");
}

try {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      current_user AS user,
      current_setting('search_path') AS search_path,
      count(*)::text AS article_count
    FROM ${tableSql(articlesTable)}
  `);

  console.log(result.rows[0]);
} finally {
  await pool.end();
}

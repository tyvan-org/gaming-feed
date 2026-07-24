import { Pool, type PoolConfig } from "pg";

type GlobalWithPool = typeof globalThis & {
  pgPool?: Pool;
};

const globalForPool = globalThis as GlobalWithPool;
let modulePool: Pool | undefined;

function getCachedPool() {
  return globalForPool.pgPool ?? modulePool;
}

function buildPoolConfig(): PoolConfig {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const parsedUrl = new URL(databaseUrl);
  const schema = parsedUrl.searchParams.get("schema");
  const sslMode = parsedUrl.searchParams.get("sslmode");
  const sslAccept = parsedUrl.searchParams.get("sslaccept");

  parsedUrl.searchParams.delete("schema");
  parsedUrl.searchParams.delete("sslaccept");
  parsedUrl.searchParams.delete("sslmode");

  const config: PoolConfig = {
    connectionString: parsedUrl.toString(),
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };

  if (schema) {
    config.options = `-c search_path=${schema},public`;
  }

  if (sslMode !== "disable") {
    config.ssl = {
      minVersion: "TLSv1.3",
      rejectUnauthorized: sslAccept !== "accept_invalid_certs",
    };
  }

  return config;
}

export function getPool() {
  const existingPool = getCachedPool();

  if (existingPool) {
    return existingPool;
  }

  const pool = new Pool(buildPoolConfig());
  modulePool = pool;

  if (process.env.NODE_ENV !== "production") {
    globalForPool.pgPool = pool;
  }

  return pool;
}

function quoteIdentifier(identifier: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }

  return `"${identifier}"`;
}

export function getArticlesTableSql() {
  const tableName = process.env.ARTICLES_TABLE ?? "public.rss_articles";
  const parts = tableName.split(".");

  if (parts.length < 1 || parts.length > 2) {
    throw new Error("ARTICLES_TABLE must be table or schema.table.");
  }

  return parts.map(quoteIdentifier).join(".");
}

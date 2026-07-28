import { createHash } from "node:crypto";
import { createRequire } from "node:module";

function fingerprint(value) {
  if (!value) {
    return "missing";
  }

  return createHash("sha256").update(value).digest("hex").slice(0, 12);
}

function maskDatabaseUrl(value) {
  if (!value) {
    return "<missing>";
  }

  try {
    const parsedUrl = new URL(value);
    if (parsedUrl.username) {
      parsedUrl.username = "redacted";
    }
    if (parsedUrl.password) {
      parsedUrl.password = "redacted";
    }

    return parsedUrl.toString();
  } catch {
    return `<invalid-url length=${value.length}>`;
  }
}

const databaseUrl = process.env.DATABASE_URL ?? "";

console.log(
  [
    "Runtime DATABASE_URL",
    `value=${maskDatabaseUrl(databaseUrl)}`,
    `length=${databaseUrl.length}`,
    `sha256=${fingerprint(databaseUrl)}`,
  ].join(" "),
);

const require = createRequire(import.meta.url);
require("../server.js");

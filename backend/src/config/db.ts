import mysql, { type Pool, type PoolOptions } from "mysql2/promise";
import { env } from "./env";

let pool: Pool | null = null;

function getSslOptions() {
  const urlSslMode = env.DATABASE_URL
    ? new URL(env.DATABASE_URL).searchParams.get("ssl-mode")?.toLowerCase()
    : null;
  const mode = urlSslMode === "required" ? "require" : env.DB_SSL_MODE;

  if (mode === "require") {
    // Aiven's `ssl-mode=REQUIRED` expects TLS without custom CA wiring in local development.
    return { rejectUnauthorized: false };
  }

  if (mode === "preferred") {
    return {};
  }

  return undefined;
}

export function buildDbConfig(extra: Partial<PoolOptions> = {}): PoolOptions {
  if (env.DATABASE_URL) {
    const databaseUrl = new URL(env.DATABASE_URL);

    return {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 3306),
      database: databaseUrl.pathname.replace(/^\//, ""),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: getSslOptions(),
      ...extra
    };
  }

  return {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: getSslOptions(),
    ...extra
  };
}

export function getDbPool(): Pool {
  if (!pool) {
    pool = mysql.createPool(buildDbConfig());
  }

  return pool;
}

export async function query<T>(sql: string, params: unknown[] = []): Promise<T> {
  const [rows] = await getDbPool().query(sql, params as any[]);
  return rows as T;
}

export async function execute(sql: string, params: unknown[] = []): Promise<void> {
  await getDbPool().execute(sql, params as any[]);
}

export async function pingDatabase(): Promise<void> {
  await getDbPool().query("SELECT 1");
}

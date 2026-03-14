import type { ResultSetHeader } from "mysql2";
import { execute, getDbPool, query } from "../../config/db";
import type { RefreshTokenRecord } from "../../types/domain";

export async function createRefreshTokenRecord(
  userId: number,
  tokenHash: string,
  expiresAt: Date
) {
  await getDbPool().execute<ResultSetHeader>(
    `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `,
    [userId, tokenHash, expiresAt]
  );
}

export async function findActiveRefreshTokenByHash(
  tokenHash: string
): Promise<RefreshTokenRecord | null> {
  const rows = await query<RefreshTokenRecord[]>(
    `
      SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
      FROM refresh_tokens
      WHERE token_hash = ?
        AND revoked_at IS NULL
        AND expires_at > UTC_TIMESTAMP()
      LIMIT 1
    `,
    [tokenHash]
  );

  return rows[0] ?? null;
}

export async function revokeRefreshTokenByHash(tokenHash: string) {
  await execute(
    `
      UPDATE refresh_tokens
      SET revoked_at = UTC_TIMESTAMP()
      WHERE token_hash = ?
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );
}

export async function revokeExpiredRefreshTokens(userId: number) {
  await execute(
    `
      UPDATE refresh_tokens
      SET revoked_at = UTC_TIMESTAMP()
      WHERE user_id = ?
        AND revoked_at IS NULL
        AND expires_at <= UTC_TIMESTAMP()
    `,
    [userId]
  );
}


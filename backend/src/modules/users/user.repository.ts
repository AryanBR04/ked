import type { ResultSetHeader } from "mysql2";
import { getDbPool, query } from "../../config/db";
import type { UserRecord } from "../../types/domain";

interface CreateUserInput {
  email: string;
  passwordHash: string;
  name: string;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const rows = await query<UserRecord[]>(
    `
      SELECT id, email, password_hash, name, created_at, updated_at
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<UserRecord | null> {
  const rows = await query<UserRecord[]>(
    `
      SELECT id, email, password_hash, name, created_at, updated_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] ?? null;
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const [result] = await getDbPool().execute<ResultSetHeader>(
    `
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `,
    [input.email, input.passwordHash, input.name]
  );

  const user = await findUserById(Number(result.insertId));

  if (!user) {
    throw new Error("Failed to load user after creation.");
  }

  return user;
}


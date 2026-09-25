import { cookies } from "next/headers";
import { and, eq, gt, sql } from "drizzle-orm";
import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual
} from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./db";
import { authSessions, authUsers } from "./schema";

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number }
) => Promise<Buffer>;

export const SESSION_COOKIE_NAME = "devops_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEY_LENGTH = 64;
const SESSION_TOKEN_BYTES = 32;

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS
};

export type CurrentUser = {
  id: string;
  email: string;
};

let authSchemaReady = false;

async function ensureAuthSchema() {
  if (authSchemaReady) return;

  const db = getDb();

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "auth_users" (
      "id" text PRIMARY KEY NOT NULL,
      "email" text NOT NULL,
      "password_hash" text NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL
    )
  `));

  await db.execute(sql.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS "auth_users_email_uq"
      ON "auth_users" ("email")
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "auth_sessions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
      "token_hash" text NOT NULL,
      "expires_at" timestamptz NOT NULL,
      "created_at" timestamptz DEFAULT now() NOT NULL
    )
  `));

  await db.execute(sql.raw(`
    CREATE UNIQUE INDEX IF NOT EXISTS "auth_sessions_token_hash_uq"
      ON "auth_sessions" ("token_hash")
  `));

  await db.execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS "auth_sessions_user_id_idx"
      ON "auth_sessions" ("user_id")
  `));

  authSchemaReady = true;
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function validateRegistrationInput(input: {
  email: string;
  password: string;
  confirmPassword: string;
}): { ok: true; email: string } | { ok: false; error: string } {
  const email = normalizeEmail(input.email);

  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    email.length > 320 ||
    input.password.length < 12 ||
    input.password.length > 200
  ) {
    return {
      ok: false,
      error: "Enter a valid email and a stronger password."
    };
  }

  if (input.password !== input.confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }

  return { ok: true, email };
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, SCRYPT_KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 128 * 1024 * 1024
  })) as Buffer;

  return [
    "scrypt",
    `N=${SCRYPT_N}`,
    `r=${SCRYPT_R}`,
    `p=${SCRYPT_P}`,
    salt.toString("hex"),
    derived.toString("hex")
  ].join("$");
}

export async function verifyPassword(password: string, encoded: string) {
  try {
    const [algorithm, nPart, rPart, pPart, saltHex, hashHex] =
      encoded.split("$");

    if (
      algorithm !== "scrypt" ||
      !nPart?.startsWith("N=") ||
      !rPart?.startsWith("r=") ||
      !pPart?.startsWith("p=") ||
      !saltHex ||
      !hashHex
    ) {
      return false;
    }

    const N = Number(nPart.slice(2));
    const r = Number(rPart.slice(2));
    const p = Number(pPart.slice(2));
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(hashHex, "hex");

    if (
      !Number.isSafeInteger(N) ||
      !Number.isSafeInteger(r) ||
      !Number.isSafeInteger(p) ||
      N < 16384 ||
      r < 1 ||
      p < 1 ||
      salt.length < 16 ||
      expected.length !== SCRYPT_KEY_LENGTH
    ) {
      return false;
    }

    const derived = (await scryptAsync(password, salt, expected.length, {
      N,
      r,
      p,
      maxmem: 128 * 1024 * 1024
    })) as Buffer;

    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
}

async function createSessionForUser(userId: string) {
  const token = randomBytes(SESSION_TOKEN_BYTES).toString("hex");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await getDb().insert(authSessions).values({
    userId,
    tokenHash,
    expiresAt
  });

  await setSessionCookie(token);
}

export async function registerUserAndCreateSession(
  rawEmail: string,
  password: string
): Promise<CurrentUser> {
  await ensureAuthSchema();
  const email = normalizeEmail(rawEmail);
  const passwordHash = await hashPassword(password);
  const id = `user_${randomUUID()}`;

  try {
    await getDb().insert(authUsers).values({
      id,
      email,
      passwordHash
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      throw new Error("ACCOUNT_EXISTS");
    }
    throw error;
  }

  await createSessionForUser(id);
  return { id, email };
}

export async function loginUserAndCreateSession(
  rawEmail: string,
  password: string
): Promise<CurrentUser> {
  await ensureAuthSchema();
  const email = normalizeEmail(rawEmail);
  const [user] = await getDb()
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new Error("INVALID_CREDENTIALS");
  }

  await createSessionForUser(user.id);
  return { id: user.id, email: user.email };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  await ensureAuthSchema();
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const [row] = await getDb()
    .select({
      id: authUsers.id,
      email: authUsers.email
    })
    .from(authSessions)
    .innerJoin(authUsers, eq(authSessions.userId, authUsers.id))
    .where(
      and(
        eq(authSessions.tokenHash, tokenHash),
        gt(authSessions.expiresAt, new Date())
      )
    )
    .limit(1);

  return row ?? null;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  return user;
}

export async function logoutCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await getDb()
      .delete(authSessions)
      .where(eq(authSessions.tokenHash, hashSessionToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

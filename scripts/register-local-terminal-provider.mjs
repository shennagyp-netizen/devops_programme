#!/usr/bin/env node

import { createPublicKey } from "node:crypto";
import { readFile } from "node:fs/promises";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(new URL("../app/package.json", import.meta.url));
const { Pool } = require("pg");

function parseArgs(argv) {
  const values = new Map();
  const allowed = new Set([
    "learner-id",
    "provider-id",
    "key-id",
    "public-key-file"
  ]);

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      throw new Error("Unexpected argument: " + token);
    }

    const key = token.slice(2);
    if (!allowed.has(key)) {
      throw new Error("Unknown option: --" + key);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error("Missing value for --" + key);
    }

    values.set(key, value);
    index += 1;
  }

  for (const required of ["learner-id", "provider-id", "key-id", "public-key-file"]) {
    if (!values.has(required)) {
      throw new Error(
        "Usage: node scripts/register-local-terminal-provider.mjs " +
          "--learner-id <id> --provider-id <id> --key-id <id> " +
          "--public-key-file <pem>"
      );
    }
  }

  return values;
}

function required(value, name, maxLength) {
  if (value.length === 0 || value.length > maxLength) {
    throw new Error(name + " must be non-empty and within its length limit.");
  }

  return value;
}

const args = parseArgs(process.argv);
const learnerId = required(args.get("learner-id"), "learner-id", 200);
const providerId = required(args.get("provider-id"), "provider-id", 128);
const keyId = required(args.get("key-id"), "key-id", 128);
const publicKeyPem = await readFile(args.get("public-key-file"), "utf8");

const publicKey = createPublicKey(publicKeyPem);
if (publicKey.asymmetricKeyType !== "ed25519") {
  throw new Error("The supplied provider public key is not Ed25519.");
}

const canonicalPublicKey = publicKey.export({
  type: "spki",
  format: "pem"
}).toString();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 10_000
});

try {
  const result = await pool.query(
    `INSERT INTO verification_provider_keys
      (user_id, provider_id, key_id, algorithm, public_key)
     VALUES ($1, $2, $3, 'ed25519', $4)
     ON CONFLICT (user_id, provider_id, key_id) DO NOTHING
     RETURNING id`,
    [learnerId, providerId, keyId, canonicalPublicKey]
  );

  if (result.rowCount === 0) {
    console.log("Trusted provider key already exists; no change made.");
  } else {
    console.log("Trusted local terminal provider key registered.");
  }

  console.log("Learner:", learnerId);
  console.log("Provider:", providerId);
  console.log("Key ID:", keyId);
} finally {
  await pool.end();
}

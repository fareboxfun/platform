import { randomBytes } from "crypto";

export function generateId(prefix?: string): string {
  const id = randomBytes(16).toString("hex");
  return prefix ? `${prefix}_${id}` : id;
}

export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const { createHash } = require("crypto");
  const raw = `sk-fbx-${randomBytes(32).toString("base64url")}`;
  const prefix = raw.substring(0, 12);
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash, prefix };
}

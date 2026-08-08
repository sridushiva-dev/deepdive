import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    if (process.env.NODE_ENV === "development") {
      return Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "hex");
    }
    throw new Error("ENCRYPTION_KEY must be 64 hex characters (32 bytes)");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(text: string): { encrypted: string; iv: string } {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return {
    encrypted: `${encrypted}:${authTag}`,
    iv: iv.toString("hex"),
  };
}

export function decrypt(encrypted: string, iv: string): string {
  const [data, authTag] = encrypted.split(":");
  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

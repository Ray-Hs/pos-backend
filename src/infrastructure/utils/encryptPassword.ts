import { pbkdf2Sync, randomBytes } from "crypto";

export function hash(
  contentToHash: string,
  salt: string = randomBytes(16).toString("hex")
) {
  const hash = pbkdf2Sync(contentToHash, salt, 10000, 64, "sha512").toString(
    "hex"
  );
  return `${hash}:${salt}`;
}

export function verifyHash(contentToHash: string, storedHash: string) {
  const [hash, salt] = storedHash.split(":");
  const hashedPassword = pbkdf2Sync(
    contentToHash,
    salt,
    10000,
    64,
    "sha512"
  ).toString("hex");
  return hashedPassword === hash;
}

hash("DoTiViVe");

import { createHash, timingSafeEqual } from "node:crypto";

export type AdminCredentials = { email: string; password: string };

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

// Hash first so both buffers have equal length, then compare in constant time.
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function adminUnionId(email: string): string {
  return `admin:${normalizeEmail(email)}`;
}

export function credentialsMatch(
  input: AdminCredentials,
  expected: AdminCredentials,
): boolean {
  // An unconfigured admin account must never be loggable-into.
  if (!expected.email.trim() || !expected.password) return false;
  const emailOk = safeEqual(
    normalizeEmail(input.email),
    normalizeEmail(expected.email),
  );
  const passwordOk = safeEqual(input.password, expected.password);
  return emailOk && passwordOk;
}

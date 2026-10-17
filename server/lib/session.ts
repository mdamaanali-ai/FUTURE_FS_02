import * as jose from "jose";
import { env } from "./env.js";

export type SessionPayload = { unionId: string };

const JWT_ALG = "HS256";

function keyFrom(secret: string): Uint8Array {
  if (secret.length < 32) {
    throw new Error(
      "APP_SECRET must be set to a random string of at least 32 characters",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: SessionPayload,
  secret: string = env.appSecret,
): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(keyFrom(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string = env.appSecret,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, keyFrom(secret), {
      algorithms: [JWT_ALG],
    });
    const unionId = payload.unionId;
    return typeof unionId === "string" && unionId ? { unionId } : null;
  } catch {
    return null;
  }
}

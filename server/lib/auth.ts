import * as cookie from "cookie";
import { Session } from "../../contracts/constants.js";
import { Errors } from "../../contracts/errors.js";
import { env } from "./env.js";
import { adminUnionId } from "./credentials.js";
import { verifySessionToken } from "./session.js";
import { findUserByUnionId } from "../queries/users.js";

export async function authenticateRequest(headers: Headers) {
  const token = cookie.parse(headers.get("cookie") || "")[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  // The session is only valid for the admin account currently set in ADMIN_EMAIL.
  if (!claim || claim.unionId !== adminUnionId(env.adminEmail)) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please sign in again.");
  }
  return user;
}

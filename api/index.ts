import { handle } from "hono/vercel";
import app from "../server/app.js";

// Single Vercel Function that serves every /api/* request (see rewrites in vercel.json).
const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
export const HEAD = handler;

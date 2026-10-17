import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "../contracts/constants.js";
import { getSessionCookieOptions } from "./lib/cookies.js";
import { env } from "./lib/env.js";
import { adminUnionId, credentialsMatch } from "./lib/credentials.js";
import { signSessionToken } from "./lib/session.js";
import { upsertUser } from "./queries/users.js";
import { createRouter, publicQuery, authedQuery } from "./middleware.js";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  login: publicQuery
    .input(
      z.object({
        email: z.string().trim().min(1).max(320),
        password: z.string().min(1).max(200),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ok = credentialsMatch(input, {
        email: env.adminEmail,
        password: env.adminPassword,
      });
      if (!ok) {
        // Small delay slows down password guessing.
        await new Promise((resolve) => setTimeout(resolve, 400));
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }

      const unionId = adminUnionId(env.adminEmail);
      await upsertUser({
        unionId,
        name: "Admin",
        email: env.adminEmail.trim(),
        role: "admin",
      });

      const token = await signSessionToken({ unionId });
      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Session.maxAgeMs / 1000,
        }),
      );
      return { ok: true };
    }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});

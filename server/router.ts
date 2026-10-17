import { authRouter } from "./auth-router.js";
import { leadRouter } from "./lead-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  leads: leadRouter,
});

export type AppRouter = typeof appRouter;

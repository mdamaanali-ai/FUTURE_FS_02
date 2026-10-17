# LeadDesk — Client Lead Management CRM

A mini CRM for managing client leads generated from a website contact form.
Full-stack app: a public studio website with a contact form, plus a password-protected admin dashboard.

## Features

- **Public contact form** — inquiries are stored as leads (name, email, phone, company, source, message) with client-side and server-side validation.
- **Lead listing** — spreadsheet-style table with name, email, source, status, note count and received date.
- **Status pipeline** — move leads through `new → contacted → converted`, inline from the table or from the lead detail page.
- **Notes & follow-ups** — timestamped notes per lead with an optional follow-up date; upcoming follow-ups surface on the dashboard.
- **Search & filters** — debounced search across name/email/company, plus status and source filters.
- **Analytics** — total leads, per-status counts, last-7-days intake, conversion rate.
- **Secure admin access** — email + password sign-in for a single admin account (set via environment variables). Sessions are signed JWTs in an HttpOnly cookie, and every lead API except the contact form is rejected server-side unless the session belongs to the admin.

## Tech stack

| Layer     | Tech                                        |
| --------- | ------------------------------------------- |
| Frontend  | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend   | Hono + tRPC (type-safe APIs)                |
| Database  | MySQL via Drizzle ORM                       |
| Auth      | Admin email/password + JWT session cookie   |
| Hosting   | Vercel (static frontend + one serverless function) |

## Project structure

```
src/pages/            Home (public site + contact form), Login, admin/Dashboard, admin/LeadDetail
src/components/       AdminShell (auth-gated admin layout)
server/app.ts         Hono app + tRPC mount (shared by dev server and Vercel)
server/boot.ts        Optional plain-Node entry (npm start) for non-Vercel hosts
server/*-router.ts    tRPC routers (auth, leads)
server/queries/       Drizzle query functions
server/lib/           env, session (JWT), credentials check, cookies
api/index.ts          Vercel Function entry; forwards /api/* to server/app.ts
db/schema.ts          users, leads, lead_notes tables
contracts/            Shared constants (frontend <-> backend)
```

## Run locally (Windows / VS Code)

You need Node 20+ and a MySQL database (local MySQL, or a free hosted one such as TiDB Cloud).

```powershell
npm install
Copy-Item .env.example .env      # then fill in the four values
npm run db:push                  # create the tables
npx tsx db/seed.ts               # optional: sample leads
npm run dev                      # http://localhost:3000
```

Public site: `/` · Login: `/login` · Dashboard: `/admin`

## Environment variables

| Name             | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `DATABASE_URL`   | MySQL connection string (add `?ssl={"rejectUnauthorized":true}` if the host needs TLS) |
| `APP_SECRET`     | Random string, 32+ characters, used to sign session cookies     |
| `ADMIN_EMAIL`    | Email of the admin account                                      |
| `ADMIN_PASSWORD` | Password of the admin account (use a long, unique one)          |

Never commit `.env` — it is already in `.gitignore`.

## Deploy on Vercel

1. Push this project to GitHub (repository root = the folder containing `package.json`).
2. In Vercel: **Add New → Project**, import the repository. Vercel detects Vite; `vercel.json` already sets the build command and output folder.
3. Under **Environment Variables**, add `DATABASE_URL`, `APP_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. The database must be reachable from the internet (not `localhost`).
4. Run `npm run db:push` once from your PC with `DATABASE_URL` pointing at that same hosted database.
5. Deploy, then check `https://<your-project>.vercel.app/api/trpc/ping` returns JSON, and sign in at `/login`.

How it works on Vercel: `vite build` produces the static site in `dist/public`; `api/index.ts` is a single serverless function that serves every `/api/*` request through the same Hono + tRPC app used in development; all other paths fall back to `index.html` for client-side routing (see `vercel.json`).

## Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Vite dev server + API on http://localhost:3000       |
| `npm run build`     | Frontend build + bundled Node server (`dist/boot.js`) |
| `npm run check`     | TypeScript project check                             |
| `npm test`          | Unit tests (login credential check, session tokens)  |
| `npm run db:push`   | Sync the Drizzle schema to the database              |

## API overview (tRPC)

| Procedure            | Access  | Purpose                          |
| -------------------- | ------- | -------------------------------- |
| `auth.login`         | Public  | Admin sign-in, sets session cookie |
| `auth.me` / `auth.logout` | Admin | Current user / sign out     |
| `leads.submit`       | Public  | Create lead from contact form    |
| `leads.list`         | Admin   | List leads with filters/search   |
| `leads.get`          | Admin   | Lead detail incl. notes          |
| `leads.updateStatus` | Admin   | Move lead through the pipeline   |
| `leads.addNote`      | Admin   | Add note + optional follow-up    |
| `leads.deleteNote`   | Admin   | Remove a note                    |
| `leads.remove`       | Admin   | Delete lead and its notes        |
| `leads.stats`        | Admin   | Counts, conversion, follow-ups   |

## Known limitations

- One admin account, configured through environment variables (no user management UI).
- No login rate limiting beyond a short delay on failed attempts; use a strong `ADMIN_PASSWORD`.

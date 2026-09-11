# Deploying UniPilot on Vercel

The frontend and FastAPI backend deploy together. Browser requests always use
the same-origin `/api` path, so do not set `VITE_API_URL` in Vercel.

Before deploying, add these environment variables in **Vercel → Project →
Settings → Environment Variables** for Production and Preview:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | A durable PostgreSQL connection string (for example, from Neon or Supabase). `POSTGRES_URL` is also supported. |
| `SECRET_KEY` | A new long random secret used to sign login sessions. |
| `OPENROUTER_API_KEY` | Optional; required only for AI-generated content. |

SQLite is used only when running locally. Vercel Functions are serverless, so
their local disk cannot safely store accounts between invocations. The deployed
API intentionally refuses SQLite unless `DATABASE_URL` points to PostgreSQL;
this prevents user accounts from disappearing or being split across instances.

After redeploying, open `https://YOUR_DEPLOYMENT.vercel.app/api/health`. It
must return JSON with `"status":"healthy"`. Then create a new account in the
deployed app and log out/in once to confirm persistence.

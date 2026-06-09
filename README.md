# Gnosis

TypeScript monorepo (pnpm workspaces + Turborepo) with a Next.js web app and an Express API server, backed by Postgres + Prisma.

```
apps/
  web/       # Next.js 16 (@gnosis/web)
  server/    # Express 5 (@gnosis/server)
packages/
  database/           # Prisma schema + client (@gnosis/database)
  types/              # Shared types
  eslint-config/
  typescript-config/
docker-compose.yml         # Local Postgres
docker-compose.prod.yml    # Prod server container (DB on Neon)
.env                       # Single root env file
```

## Setup

```sh
pnpm install
cp .env.example .env
docker compose up -d        # local Postgres
pnpm db:generate
pnpm db:migrate
pnpm dev
```

`.env` (root) keys:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gnosis_db
SERVER_PORT=8080
```

All apps read this single root `.env`.

## Commands

| Command                                         | What it does            |
| ----------------------------------------------- | ----------------------- |
| `pnpm dev`                                      | Run web + server in dev |
| `pnpm build`                                    | Build everything        |
| `pnpm lint` / `pnpm check-types`                | Lint / typecheck        |
| `pnpm db:generate` / `db:migrate` / `db:studio` | Prisma                  |

Filter: `pnpm --filter @gnosis/web dev`, `pnpm --filter @gnosis/server dev`.

- Web: http://localhost:3000
- Server: http://localhost:8080

## Production

Postgres lives on Neon (not in compose). On the deploy host, place a `.env` next to `docker-compose.prod.yml` with the Neon `DATABASE_URL` (`?sslmode=require`), then:

```sh
docker compose -f docker-compose.prod.yml up -d
```

`env_file: .env` in compose injects vars into the container at runtime; nothing is baked into the image.

## Git hooks

- pre-commit: `lint-staged` (Prettier).
- pre-push: typecheck + build.

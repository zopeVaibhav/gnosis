# Gnosis

TypeScript monorepo (Bun workspaces + Turborepo) with a Next.js web app and an Express API server, backed by Postgres + Prisma.

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
bun install
cp .env.example .env
docker compose up -d        # local Postgres
bun run db:generate
bun run db:migrate
bun run dev
```

`.env` (root) keys:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/gnosis_db
SERVER_PORT=8080
```

All apps read this single root `.env`.

## Commands

| Command                                            | What it does            |
| -------------------------------------------------- | ----------------------- |
| `bun run dev`                                      | Run web + server in dev |
| `bun run build`                                    | Build everything        |
| `bun run lint` / `bun run check-types`             | Lint / typecheck        |
| `bun run db:generate` / `db:migrate` / `db:studio` | Prisma                  |

Filter: `bun run --filter @gnosis/web dev`, `bun run --filter @gnosis/server dev`.

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

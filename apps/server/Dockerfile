FROM oven/bun:1.3-debian

WORKDIR /app

# Manifests first. Bun resolves the whole workspace graph before installing, so
# every workspace package.json must be present for --frozen-lockfile to match
# bun.lock -- including apps/web, whose sources this image never needs.
# This layer also stays cached until a package.json actually changes.
COPY package.json bun.lock turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/types/package.json ./packages/types/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN bun install --frozen-lockfile --filter '@gnosis/server' --filter '@gnosis/database' --filter '@gnosis/types'

COPY apps/server/ ./apps/server/
COPY packages/database/ ./packages/database/
COPY packages/types/ ./packages/types/
COPY packages/typescript-config/ ./packages/typescript-config/

WORKDIR /app/packages/database
RUN bunx prisma generate

WORKDIR /app/apps/server
RUN bun run build

EXPOSE 8080

CMD ["bun", "run", "start"]

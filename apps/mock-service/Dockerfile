FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/mock-service/package.json ./apps/mock-service/
RUN pnpm install --frozen-lockfile

# Build
FROM deps AS build
COPY apps/mock-service ./apps/mock-service
RUN pnpm --filter @app/mock-service build

# Production image
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/mock-service/package.json ./apps/mock-service/
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/apps/mock-service/dist ./apps/mock-service/dist

WORKDIR /app/apps/mock-service

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/index.js"]

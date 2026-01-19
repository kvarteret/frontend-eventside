FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY bun.lock bunfig.toml package.json ./
RUN bun install --frozen-lockfile

FROM deps AS dev
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "--hot", "src/index.ts"]

FROM deps AS prod
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "start"]

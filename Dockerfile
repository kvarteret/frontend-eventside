FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY bun.lock bunfig.toml package.json ./
RUN bun install --frozen-lockfile

FROM deps AS dev
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
ENV NODE_ENV=development
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint"]
CMD ["bun", "--hot", "src/index.ts"]

FROM deps AS prod
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint"]
CMD ["bun", "run", "start"]

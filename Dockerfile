FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CONVEX_URL=https://abundant-meadowlark-701.convex.cloud

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
# HocusPocus packages and all transitive dependencies
COPY --from=builder /app/node_modules/@hocuspocus ./node_modules/@hocuspocus
COPY --from=builder /app/node_modules/yjs ./node_modules/yjs
COPY --from=builder /app/node_modules/ws ./node_modules/ws
COPY --from=builder /app/node_modules/lib0 ./node_modules/lib0
COPY --from=builder /app/node_modules/y-protocols ./node_modules/y-protocols
# @hocuspocus/server transitive deps
COPY --from=builder /app/node_modules/async-lock ./node_modules/async-lock
COPY --from=builder /app/node_modules/async-mutex ./node_modules/async-mutex
COPY --from=builder /app/node_modules/kleur ./node_modules/kleur
# @hocuspocus/provider transitive deps
COPY --from=builder /app/node_modules/@lifeomic ./node_modules/@lifeomic

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

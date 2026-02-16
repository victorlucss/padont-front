FROM node:22-alpine AS base

# Install dependencies for better-sqlite3 and build tools
RUN apk add --no-cache python3 make g++ libc6-compat

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CONVEX_URL=https://abundant-meadowlark-701.convex.cloud

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CONVEX_URL=https://abundant-meadowlark-701.convex.cloud

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy custom server and dependencies
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/convex ./convex
COPY --from=builder /app/node_modules/convex ./node_modules/convex
COPY --from=builder /app/node_modules/y-websocket ./node_modules/y-websocket
COPY --from=builder /app/node_modules/yjs ./node_modules/yjs
COPY --from=builder /app/node_modules/ws ./node_modules/ws
COPY --from=builder /app/node_modules/lib0 ./node_modules/lib0

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

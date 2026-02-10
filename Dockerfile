FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install pnpm in builder
RUN npm install -g pnpm

# Generate Prisma Client
RUN pnpm prisma generate

# Build-time environment variables
ARG NEXT_PUBLIC_AI_API_URL
ARG NEXT_PUBLIC_AI_API_KEY
ENV DATABASE_URL="postgresql://daisyadmin:database1%21@daisy.postgres.database.azure.com:5432/postgres?sslmode=require"
ENV NEXT_PUBLIC_AI_API_URL=$NEXT_PUBLIC_AI_API_URL
ENV NEXT_PUBLIC_AI_API_KEY=$NEXT_PUBLIC_AI_API_KEY
ENV DOCKER_BUILD=true

# Build Next.js
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files from builder (includes generated client with correct hash)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Use full path to node so it's found when running as nextjs user (avoids exit 127 in Azure)
CMD ["/usr/local/bin/node", "server.js"]
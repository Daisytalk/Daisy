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
ENV NEXT_PUBLIC_AI_API_URL=$NEXT_PUBLIC_AI_API_URL
ENV NEXT_PUBLIC_AI_API_KEY=$NEXT_PUBLIC_AI_API_KEY
# Для сборки (prisma generate) реальный URL не нужен; в проде App Service передаёт DATABASE_URL в runtime
ARG DATABASE_URL=postgresql://local:local@localhost:5432/local
ENV DATABASE_URL=${DATABASE_URL}
ENV DOCKER_BUILD=true

# Build Next.js
RUN pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy all necessary files from builder
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Startup: run migrations (DATABASE_URL from App Service), then start Next.js
COPY scripts/docker-start.sh ./
RUN chmod +x docker-start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# DATABASE_URL задаётся в Azure App Service → Configuration → Application settings
CMD ["./docker-start.sh"]
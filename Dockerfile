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

# Only non-secret build-time vars here.
# Secrets (AI_API_KEY, JWT_SECRET, DATABASE_URL, etc.) are injected at
# runtime via Azure App Service → Configuration → Application Settings.
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=$NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
# Placeholder DATABASE_URL for prisma generate only (not used at runtime)
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
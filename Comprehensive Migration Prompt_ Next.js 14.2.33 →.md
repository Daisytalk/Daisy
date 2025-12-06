<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Comprehensive Migration Prompt: Next.js 14.2.33 → Next.js 16 for Daisy Mental Health Platform

## With GitHub Actions + Azure Container Apps Deployment

## Executive Summary

Upgrade Daisy Mental Health Platform from Next.js 14.2.33 to Next.js 16 (latest stable as of December 2025) to resolve Windows dev server 404 issues, gain Turbopack performance improvements, and ensure compatibility with GitHub Actions + Azure Container Apps deployment.

***

## Pre-Migration Checklist

### 1. Prerequisites Verification

```powershell
# Verify Node.js version (must be 20.9.0+)
node --version

# Verify pnpm version
pnpm --version

# Create backup branch
git checkout -b backup/pre-nextjs16-upgrade
git push origin backup/pre-nextjs16-upgrade

# Create migration branch
git checkout -b feat/upgrade-nextjs16
```


### 2. Environment Backup

```powershell
# Backup critical files
Copy-Item package.json package.json.backup
Copy-Item pnpm-lock.yaml pnpm-lock.yaml.backup
Copy-Item next.config.js next.config.js.backup
Copy-Item Dockerfile Dockerfile.backup
Copy-Item .github/workflows/azure-docker-deploy.yml .github/workflows/azure-docker-deploy.yml.backup
```


***

## Phase 1: Dependency Upgrades

### Step 1.1: Run Automated Upgrade

```powershell
# Clean existing build artifacts
Remove-Item -Recurse -Force .next, node_modules, .turbo -ErrorAction SilentlyContinue

# Run Next.js upgrade codemod
npx @next/codemod@latest upgrade latest

# This upgrades:
# - Next.js 14.2.33 → 16.0.7+
# - React 18.3.1 → 19.2.0
# - React DOM 18.3.1 → 19.2.0
# - TypeScript types updated
```


### Step 1.2: Verify package.json Updates

Expected `package.json` changes:

```json
{
  "dependencies": {
    "next": "^16.0.7",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "next-intl": "^4.3.9"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.1.0"
  },
  "engines": {
    "node": ">=20.9.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```


### Step 1.3: Install Dependencies

```powershell
pnpm install
```


***

## Phase 2: Configuration File Updates

### Step 2.1: Convert next.config.js to TypeScript

**File: `next.config.ts` (rename from `.js`)**

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Standalone output for Docker/Azure deployment
  output: 'standalone',
  
  // Updated image configuration for Next.js 16
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Optimize for production
    formats: ['image/webp', 'image/avif'],
  },
  
  // Turbopack is stable in Next.js 16
  // Enabled by default in dev mode
  
  // Compression for production
  compress: true,
  
  // Powered by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
```


### Step 2.2: Update tsconfig.json

**File: `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```


***

## Phase 3: Core Layout Updates (Breaking Changes)

### Step 3.1: Update Root Layout

**File: `src/app/layout.tsx`**

```typescript
// NO CHANGES NEEDED - Root layout remains pass-through
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
```


### Step 3.2: Update Locale Layout (CRITICAL - Async Params)

**File: `src/app/[locale]/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Inter } from 'next/font/google'
import '../globals.css';
import { ContextualProviders } from '../ContextualProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Daisy - Quality Mental Health Conversations | Online Therapy Platform',
  description: 'Connect with licensed therapists through secure, HIPAA-compliant online therapy. 24/7 mental health support, flexible scheduling, and personalized care.',
  keywords: ['mental health', 'online therapy', 'licensed therapists', 'HIPAA compliant', 'teletherapy', 'counseling', 'mental wellness'],
  authors: [{ name: 'Daisy Mental Health' }],
  openGraph: {
    title: 'Daisy - Quality Mental Health Conversations',
    description: 'Connect with licensed therapists through secure, HIPAA-compliant online therapy. 24/7 mental health support and personalized care.',
    type: 'website',
    siteName: 'Daisy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daisy - Quality Mental Health Conversations',
    description: 'Connect with licensed therapists through secure, HIPAA-compliant online therapy.',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 🚨 BREAKING CHANGE: params is now Promise<{ locale: string }>
export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Changed from { locale: string }
}) {
  // 🚨 MUST await params
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Load messages for the current locale
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ContextualProviders>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </ContextualProviders>
      </body>
    </html>
  );
}
```


***

## Phase 4: Page Component Updates (Async Params)

### Step 4.1: Update All Dynamic Route Pages

Apply this pattern to **ALL pages with dynamic segments**:

**Pages to update:**

- `src/app/[locale]/page.tsx` (if it has params)
- `src/app/api/cbt/conversations/[id]/route.ts` (API routes with dynamic segments)
- Any other pages with `params` prop

**Example: API Route with Dynamic Params**

```typescript
// src/app/api/cbt/conversations/[id]/route.ts

// Before (Next.js 14):
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ...
}

// After (Next.js 16):
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // MUST await
  // ...
}
```

**Note:** Your current `src/app/[locale]/page.tsx` is a client component (`'use client'`) and doesn't use `params`, so **no changes needed**.

***

## Phase 5: i18n Configuration Updates

### Step 5.1: Update Routing Configuration

**File: `src/i18n/routing.ts`**

```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
  localePrefix: 'always', // Explicit locale in URL (Next.js 16 default)
});

// Re-export for convenience
export const locales = routing.locales;
export const defaultLocale = routing.defaultLocale;
export type Locale = (typeof locales)[number];
```


### Step 5.2: Update Request Configuration

**File: `src/i18n/request.ts`**

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale contains the locale from the [locale] segment
  let locale = await requestLocale;
  
  // Validate that the incoming locale parameter is valid
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```


### Step 5.3: Update i18n.ts Export File

**File: `src/i18n.ts`**

```typescript
// Re-export from routing (not from request)
export { routing, locales, defaultLocale, type Locale } from './i18n/routing';
```


***

## Phase 6: Middleware Updates

### Step 6.1: Simplify Middleware for Initial Testing

**File: `src/middleware.ts`**

```typescript
import { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create next-intl middleware
const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Simple i18n handling only for initial testing
  return handleI18nRouting(request);
}

export const config = {
  // Match all pathnames except API routes, static files, and Next.js internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```


### Step 6.2: Add Back Auth Logic (After Initial Testing Works)

**File: `src/middleware.ts` (Full Version with Auth)**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { AuthService } from '@/shared/lib/auth';

const handleI18nRouting = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let next-intl handle the routing first
  const response = handleI18nRouting(request);
  
  // If response is a redirect (locale handling), return it immediately
  if (response.status === 307 || response.status === 308) {
    return response;
  }

  // Extract locale from pathname for auth checks
  const localeMatch = pathname.match(/^\/(en|ru)(\/|$)/);
  if (!localeMatch) {
    return response;
  }
  
  const locale = localeMatch[1];
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
  
  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/register', '/onboarding', '/terms', '/privacy'];
  if (publicRoutes.some(route => pathWithoutLocale === route || pathWithoutLocale.startsWith(route + '/'))) {
    return response;
  }

  // Check auth token
  const token = request.cookies.get('auth_token')?.value ||
                request.headers.get('authorization')?.substring(7);

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/login?redirect=${pathname}`, request.url));
  }

  try {
    const decoded = AuthService.verifyToken(token);
    if (!decoded) {
      const redirectResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      redirectResponse.cookies.delete('auth_token');
      return redirectResponse;
    }

    // Onboarding redirect logic
    if (!decoded.isOnboarded && pathWithoutLocale !== '/onboarding') {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }
    if (decoded.isOnboarded && pathWithoutLocale === '/onboarding') {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    const redirectResponse = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    redirectResponse.cookies.delete('auth_token');
    return redirectResponse;
  }
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```


***

## Phase 7: Docker Configuration Updates

### Step 7.1: Update Dockerfile for Next.js 16

**File: `Dockerfile`**

```dockerfile
# Multi-stage build for Next.js 16 standalone output

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma generate

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application (standalone output)
RUN pnpm build

# Stage 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Copy standalone output (Next.js 16 optimization)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start Next.js using standalone server
CMD ["node", "server.js"]
```


### Step 7.2: Update .dockerignore

**File: `.dockerignore`**

```
.next/
node_modules/
.git/
.github/
.env*.local
.turbo/
out/
build/
dist/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.DS_Store
*.pem
.vscode/
.idea/
*.backup
```


***

## Phase 8: GitHub Actions Workflow Updates

### Step 8.1: Update Azure Deployment Workflow

**File: `.github/workflows/azure-docker-deploy.yml`**

```yaml
name: Build and Deploy to Azure Container Apps

on:
  push:
    branches:
      - main
      - production
  workflow_dispatch:

env:
  AZURE_CONTAINER_REGISTRY: <your-registry>.azurecr.io
  AZURE_CONTAINER_APP_NAME: daisy-app
  RESOURCE_GROUP: <your-resource-group>
  IMAGE_NAME: daisy-nextjs16

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.9.0'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: Login to Azure Container Registry
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.AZURE_CONTAINER_REGISTRY }}
          username: ${{ secrets.AZURE_REGISTRY_USERNAME }}
          password: ${{ secrets.AZURE_REGISTRY_PASSWORD }}
      
      - name: Build and push Docker image
        run: |
          docker build \
            --build-arg NEXT_PUBLIC_GA_ID=${{ secrets.NEXT_PUBLIC_GA_ID }} \
            --build-arg DATABASE_URL=${{ secrets.DATABASE_URL }} \
            -t ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }} \
            -t ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:latest \
            .
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:latest
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure Container Apps
        uses: azure/container-apps-deploy-action@v1
        with:
          containerAppName: ${{ env.AZURE_CONTAINER_APP_NAME }}
          resourceGroup: ${{ env.RESOURCE_GROUP }}
          imageToDeploy: ${{ env.AZURE_CONTAINER_REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          environmentVariables: |
            NODE_ENV=production
            DATABASE_URL=${{ secrets.DATABASE_URL }}
            NEXTAUTH_SECRET=${{ secrets.NEXTAUTH_SECRET }}
            GOOGLE_CLIENT_ID=${{ secrets.GOOGLE_CLIENT_ID }}
            GOOGLE_CLIENT_SECRET=${{ secrets.GOOGLE_CLIENT_SECRET }}
            STRIPE_SECRET_KEY=${{ secrets.STRIPE_SECRET_KEY }}
            MAILGUN_API_KEY=${{ secrets.MAILGUN_API_KEY }}
            MAILGUN_DOMAIN=${{ secrets.MAILGUN_DOMAIN }}
            GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
            AZURE_ML_ENDPOINT=${{ secrets.AZURE_ML_ENDPOINT }}
            AZURE_ML_API_KEY=${{ secrets.AZURE_ML_API_KEY }}
            CBT_API_URL=${{ secrets.CBT_API_URL }}
            CBT_API_KEY=${{ secrets.CBT_API_KEY }}
            NEXT_PUBLIC_GA_ID=${{ secrets.NEXT_PUBLIC_GA_ID }}
            NEXT_TELEMETRY_DISABLED=1
```


### Step 8.2: Add PR Testing Workflow

**File: `.github/workflows/pr-tests.yml`**

```yaml
name: PR Tests

on:
  pull_request:
    branches:
      - main
      - production

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: '20.9.0'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run TypeScript checks
        run: pnpm tsc --noEmit
      
      - name: Run linter
        run: pnpm lint
      
      - name: Build application
        run: pnpm build
        env:
          DATABASE_URL: "postgresql://test:test@localhost:5432/test"
```


***

## Phase 9: Azure Container Apps Configuration

### Step 9.1: Update Azure Container App Settings

**Via Azure CLI:**

```bash
# Update container app with Next.js 16 requirements
az containerapp update \
  --name daisy-app \
  --resource-group <your-resource-group> \
  --min-replicas 1 \
  --max-replicas 5 \
  --cpu 1.0 \
  --memory 2Gi \
  --env-vars \
    NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=1536" \
    NEXT_TELEMETRY_DISABLED=1
```


### Step 9.2: Health Check Configuration

Ensure Azure Container Apps health check is configured:

```bash
az containerapp update \
  --name daisy-app \
  --resource-group <your-resource-group> \
  --health-probe-type http \
  --health-probe-path /api/health \
  --health-probe-interval 30 \
  --health-probe-timeout 10
```

**Create Health Check API Route:**
**File: `src/app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      nextVersion: '16.0.7',
    },
    { status: 200 }
  );
}
```


***

## Phase 10: Environment Variables Update

### Step 10.1: Update Local .env Files

**File: `.env.local`**

```bash
# Database
DATABASE_URL="postgresql://..."

# Next.js
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Auth
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Mailgun)
MAILGUN_API_KEY="..."
MAILGUN_DOMAIN="..."

# AI APIs
GEMINI_API_KEY="..."
AZURE_ML_ENDPOINT="..."
AZURE_ML_API_KEY="..."

# CBT API
CBT_API_URL="..."
CBT_API_KEY="..."

# Analytics
NEXT_PUBLIC_GA_ID="G-..."
```


### Step 10.2: Update GitHub Secrets

Ensure all secrets are set in GitHub repository settings:

```
AZURE_CREDENTIALS
AZURE_REGISTRY_USERNAME
AZURE_REGISTRY_PASSWORD
DATABASE_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_SECRET_KEY
MAILGUN_API_KEY
MAILGUN_DOMAIN
GEMINI_API_KEY
AZURE_ML_ENDPOINT
AZURE_ML_API_KEY
CBT_API_URL
CBT_API_KEY
NEXT_PUBLIC_GA_ID
```


***

## Phase 11: Testing \& Validation

### Step 11.1: Local Development Testing

```powershell
# Clean install
Remove-Item -Recurse -Force .next, node_modules, .turbo
pnpm install

# Test development server with Turbopack
pnpm dev

# Verify routes work:
# - http://localhost:3000/ (redirects to /en)
# - http://localhost:3000/en
# - http://localhost:3000/ru
# - All protected routes with auth
# - API routes
```


### Step 11.2: Production Build Testing

```powershell
# Build for production
pnpm build

# Run production server
pnpm start

# Test all routes in production mode
```


### Step 11.3: Docker Build Testing

```powershell
# Build Docker image locally
docker build -t daisy-nextjs16-test .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  daisy-nextjs16-test

# Test application
curl http://localhost:3000/api/health
```


### Step 11.4: Prisma Migration Test

```powershell
# Generate Prisma client
pnpm prisma generate

# Test database connection
pnpm prisma db push

# Verify migrations
pnpm prisma migrate status
```


***

## Phase 12: Deployment Checklist

### Step 12.1: Pre-Deployment Validation

- [ ] All TypeScript errors resolved (`pnpm tsc --noEmit`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Docker image builds successfully
- [ ] Health check endpoint responds
- [ ] Environment variables configured in Azure
- [ ] GitHub secrets updated
- [ ] Database migrations ready


### Step 12.2: Deployment Steps

```bash
# 1. Commit changes
git add .
git commit -m "chore: upgrade to Next.js 16"

# 2. Push to feature branch
git push origin feat/upgrade-nextjs16

# 3. Create PR and test via PR workflow
# - Check GitHub Actions build
# - Review changes

# 4. Merge to main (triggers deployment)
git checkout main
git merge feat/upgrade-nextjs16
git push origin main

# 5. Monitor deployment in Azure Portal
# - Check container logs
# - Verify health status
# - Test production URLs
```


### Step 12.3: Post-Deployment Verification

```bash
# Test production endpoints
curl https://your-app.azurecontainerapps.io/api/health
curl https://your-app.azurecontainerapps.io/en

# Check Azure logs
az containerapp logs show \
  --name daisy-app \
  --resource-group <your-resource-group> \
  --follow

# Monitor metrics
az monitor metrics list \
  --resource /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.App/containerApps/daisy-app \
  --metric "Requests"
```


***

## Phase 13: Rollback Plan

### If Deployment Fails:

```bash
# Option 1: Revert Git commit
git revert HEAD
git push origin main

# Option 2: Redeploy previous image
az containerapp update \
  --name daisy-app \
  --resource-group <your-resource-group> \
  --image ${{ env.AZURE_CONTAINER_REGISTRY }}/daisy-nextjs14:latest

# Option 3: Restore from backup branch
git checkout main
git reset --hard backup/pre-nextjs16-upgrade
git push origin main --force
```


***

## Phase 14: Performance Monitoring

### Step 14.1: Monitor Key Metrics

- **Build time**: Should be faster with Turbopack
- **Cold start time**: Monitor Azure Container Apps startup
- **Page load performance**: Use Lighthouse/Core Web Vitals
- **Error rates**: Check Azure Application Insights
- **Memory usage**: Monitor container resource consumption


### Step 14.2: Expected Improvements

- **Dev Server**: 5-10x faster Fast Refresh
- **Production Build**: 20-40% faster builds
- **Bundle Size**: Potential reduction with improved tree-shaking
- **Runtime Performance**: React 19 optimizations

***

## Common Issues \& Solutions

### Issue 1: Symlink Errors on Windows (EPERM)

**Solution**: Already handled by removing `output: 'standalone'` in dev mode

### Issue 2: Prisma Client Not Generated in Docker

**Solution**: Dockerfile includes `pnpm prisma generate` in deps stage

### Issue 3: Environment Variables Not Loading

**Solution**: Verify all secrets are set in GitHub and Azure

### Issue 4: Health Check Failing

**Solution**: Ensure `/api/health` route is accessible and returns 200

### Issue 5: Azure Container Crash Loop

**Solution**: Check logs with `az containerapp logs show` and verify `NODE_OPTIONS`

***

## Success Criteria

✅ Local dev server runs without 404 errors
✅ Production build completes successfully
✅ Docker image builds and runs
✅ GitHub Actions workflow passes
✅ Azure Container Apps deployment succeeds
✅ All routes accessible (/, /en, /ru, /api/*)
✅ Authentication flow works
✅ i18n routing functions correctly
✅ Database connections stable
✅ Health check endpoint responds

***

## Timeline Estimate

- **Phase 1-6** (Code Updates): 2-3 hours
- **Phase 7-9** (Docker/Azure Config): 1-2 hours
- **Phase 10-11** (Testing): 2-3 hours
- **Phase 12-13** (Deployment): 1 hour
- **Phase 14** (Monitoring): Ongoing

**Total**: 6-9 hours

***

## Support Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading/version-16)
- [next-intl Documentation](https://next-intl.dev)
- [Azure Container Apps Docs](https://learn.microsoft.com/en-us/azure/container-apps/)
- [GitHub Actions for Azure](https://github.com/Azure/actions)

***

This comprehensive migration prompt covers every aspect of upgrading your Daisy Mental Health Platform from Next.js 14.2.33 to Next.js 16, with specific focus on GitHub Actions CI/CD and Azure Container Apps deployment.


# AI-Powered Landing Page

A scalable, maintainable landing page built with Feature-Sliced Design (FSD) architecture and Dependency Injection (DI) for long-term extensibility.

## 🏗️ Architecture

This project follows **Feature-Sliced Design (FSD)** methodology with **Dependency Injection** for maximum scalability and maintainability.

### Project Structure

```
src/
├── app/                 # App layer - Next.js app router
├── pages/              # Pages layer - Page compositions
├── widgets/            # Widgets layer - UI blocks
├── features/           # Features layer - Business features
├── entities/           # Entities layer - Business entities
└── shared/             # Shared layer - Reusable code
    ├── api/           # API utilities
    ├── config/        # Configuration
    ├── lib/           # Libraries (DI, utils)
    ├── services/      # External services
    └── ui/            # UI components
```

## 🚀 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Prisma** - Database ORM
- **PostgreSQL** - Database (via Neon.tech)
- **Stripe** - Payment processing
- **Mailgun** - Email services
- **Google Analytics** - Analytics tracking

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables.

3. **Set up database:**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

4. **Run development server:**
   ```bash
   pnpm dev
   ```

## 🔧 Configuration

### Database (Neon.tech)
1. Create a Neon.tech account
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Stripe
1. Create a Stripe account
2. Get your API keys from the dashboard
3. Add to environment variables

### Mailgun
1. Create a Mailgun account
2. Set up a domain
3. Get API key and domain

### Google Analytics
1. Create a GA4 property
2. Get the measurement ID
3. Add to environment variables

## 🏛️ Dependency Injection

The project uses a custom DI container for service management:

```typescript
// Register services
container
  .bindSingleton(TOKENS.ANALYTICS_SERVICE, GoogleAnalyticsService)
  .bindSingleton(TOKENS.PAYMENT_SERVICE, StripePaymentService)

// Use services
const analytics = container.get<IAnalyticsService>(TOKENS.ANALYTICS_SERVICE)
```

## 🎯 Future Extensions

The architecture supports easy addition of:

- **Onboarding System** - Multi-step user onboarding
- **AI Agent Integration** - Personalized AI assistance
- **User Profiles** - Account management
- **Dashboard** - Analytics and insights

## 📦 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:push` - Push schema to database
- `pnpm db:studio` - Open Prisma Studio

## 🚀 Deployment

### AWS Deployment
1. Build the application: `pnpm build`
2. Deploy to AWS using your preferred method (Amplify, EC2, etc.)
3. Set up environment variables in your deployment platform
4. Ensure database connectivity

### Environment Variables in Production
Make sure to set all required environment variables in your production environment.

## 🤝 Contributing

1. Follow the FSD architecture principles
2. Use TypeScript for all new code
3. Add proper error handling
4. Write tests for new features
5. Update documentation

## 📄 License

MIT License - see LICENSE file for details.
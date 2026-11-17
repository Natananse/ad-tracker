# Technology Stack

## Build System

- **Monorepo**: Turborepo 2.6.2 with pnpm workspaces
- **Package Manager**: pnpm 10.14.0
- **Node Version**: >= 20
- **TypeScript**: 5.9.3

## Core Framework

- **Next.js**: 15.5.7 (App Router)
- **React**: 19.2.1
- **TypeScript**: 5.9.3 - Full type safety across the stack

## Key Libraries

### Frontend
- **UI Components**: Radix UI primitives + Shadcn UI
- **Styling**: Tailwind CSS 4.1.12
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)
- **Internationalization**: next-intl 4.3.5
- **Routing**: nuqs for URL state management

### Backend
- **API**: oRPC (type-safe RPC) + Hono
- **Authentication**: better-auth 1.4.5
- **Database ORM**: Prisma 6.15.0 (with Drizzle 0.44.5 support)
- **AI**: Vercel AI SDK 5.0.106
- **Email**: React Email with multiple providers
- **Payments**: Multi-provider support (Stripe, LemonSqueezy, Polar, etc.)
- **Storage**: S3-compatible storage (AWS SDK 3.716.0)

### Development Tools
- **Linting/Formatting**: Biome 2.3.8
- **Testing**: Playwright 1.55.0
- **Content**: Content Collections for MDX

## Common Commands

### Development
```bash
pnpm dev              # Start all workspaces in dev mode
pnpm build            # Build all workspaces
pnpm start            # Start production server
```

### Code Quality
```bash
pnpm lint             # Lint all files
pnpm check            # Check formatting and linting
pnpm format           # Format all files
```

### Database
```bash
pnpm --filter @repo/database generate    # Generate Prisma client
pnpm --filter @repo/database push        # Push schema to database
pnpm --filter @repo/database migrate     # Run migrations
pnpm --filter @repo/database studio      # Open Prisma Studio
```

### Testing
```bash
pnpm --filter @repo/web e2e              # Run Playwright tests (UI mode)
pnpm --filter @repo/web e2e:ci           # Run Playwright tests (CI mode)
```

### Type Checking
```bash
pnpm --filter @repo/web type-check       # Type check web app
turbo type-check                         # Type check all workspaces
```

## Environment Setup

Copy `.env.local.example` to `.env.local` and configure:
- Database connection
- Authentication providers
- Payment provider credentials
- Email provider settings
- Storage/S3 credentials

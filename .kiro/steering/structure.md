# Project Structure

## Monorepo Organization

This is a Turborepo monorepo with the following structure:

### `/apps/web`
Main Next.js application containing all frontend code.

**Routes:**
- `app/(marketing)/[locale]/*` - Public marketing pages (home, blog, docs, legal)
- `app/(saas)/app/*` - Authenticated SaaS application
- `app/auth/*` - Authentication pages (login, signup, verify, etc.)
- `app/api/*` - API routes

**Modules:**
- `modules/marketing/*` - Marketing components (blog, changelog, home)
- `modules/saas/*` - SaaS features (admin, ai, auth, organizations, payments, settings)
- `modules/shared/*` - Shared components and utilities
- `modules/ui/*` - UI component library (Shadcn/Radix wrappers)
- `modules/i18n/*` - Internationalization utilities

**Content:**
- `content/docs/*` - Documentation MDX files
- `content/posts/*` - Blog post MDX files
- `content/legal/*` - Legal documents (privacy, terms)

### `/packages`
Shared packages used across the application:

- **`@repo/api`** - API routes and procedures (oRPC)
- **`@repo/auth`** - Authentication configuration (better-auth)
- **`@repo/database`** - Database schema and queries (Prisma/Drizzle)
- **`@repo/i18n`** - Translation files and i18n utilities
- **`@repo/ai`** - AI integration and prompts
- **`@repo/mail`** - Email templates and providers
- **`@repo/payments`** - Payment provider integrations
- **`@repo/storage`** - File storage (S3)
- **`@repo/logs`** - Logging configuration
- **`@repo/utils`** - Shared utility functions

### `/config`
Application configuration (`@repo/config`) - centralized settings for features, auth, payments, etc.

### `/tooling`
Development tooling packages:

- **`tooling/typescript`** - Shared TypeScript configurations
- **`tooling/tailwind`** - Shared Tailwind configuration and theme
- **`tooling/scripts`** - Utility scripts (e.g., create-user)

## File Naming Conventions

- **Directories**: lowercase-with-dashes (e.g., `auth-wizard`)
- **Components**: PascalCase (e.g., `UserAvatar.tsx`)
- **Utilities**: camelCase (e.g., `orpc-client.ts`)
- **Routes**: Next.js conventions (e.g., `[locale]`, `[[...path]]`)

## Import Patterns

- Use workspace aliases: `@repo/api`, `@repo/auth`, etc.
- Relative imports within the same module
- Barrel exports from `index.ts` files
- Named exports preferred over default exports (except for Next.js pages/layouts)

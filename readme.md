# The Ultimate Starter - Setup Guide

A production-ready Next.js SaaS starter template with authentication, payments, organizations, and internationalization.

## Prerequisites

- Node.js >= 20
- Docker & Docker Compose
- pnpm (package manager)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/DevYon4s/The-Ultimate-Starter.git
cd The-Ultimate-Starter
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Docker Containers

#### PostgreSQL Database

```bash
docker run -d \
  --name postgres-nopass \
  -p 3000:5432 \
  -e POSTGRES_DB=mydb \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  postgres
```

#### MailHog (Email Testing)

```bash
docker run -d \
  --name mailhog \
  -p 1025:1025 \
  -p 8025:8025 \
  mailhog/mailhog
```

### 4. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and update with the following values:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

```env
# Database
DATABASE_URL="postgresql://myuser:@localhost:3000/mydb"
DIRECT_URL=""

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3001"

# Authentication
BETTER_AUTH_SECRET="your-random-secret-key-here"

# MailHog Configuration
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
MAIL_FROM="noreply@localhost"

# Optional: Social Login (GitHub, Google)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 5. Initialize Database

Generate Prisma client and push schema to database:

```bash
pnpm --filter @repo/database generate
pnpm --filter @repo/database push
```

### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at:
- **Web App**: http://localhost:3001
- **MailHog UI**: http://localhost:8025 (view sent emails)

## Verification

### Test Authentication

1. Navigate to http://localhost:3001/auth/signup
2. Create a new account with a test email
3. Check MailHog at http://localhost:8025 for the verification email
4. Click the verification link to complete signup

### Test Email Sending

All emails sent during signup, password reset, and other auth flows will appear in MailHog:
- SMTP Server: localhost:1025
- Web UI: http://localhost:8025

## Docker Container Management

### View Running Containers

```bash
docker ps
```

### Stop Containers

```bash
docker stop postgres-nopass mailhog
```

### Start Containers

```bash
docker start postgres-nopass mailhog
```

### Remove Containers

```bash
docker rm postgres-nopass mailhog
```

### View Container Logs

```bash
docker logs postgres-nopass
docker logs mailhog
```

## Common Commands

### Development

```bash
# Start dev server
pnpm dev

# Type check
pnpm --filter @repo/web type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

### Database

```bash
# Generate Prisma client
pnpm --filter @repo/database generate

# Push schema to database
pnpm --filter @repo/database push

# Run migrations
pnpm --filter @repo/database migrate

# Open Prisma Studio
pnpm --filter @repo/database studio
```

### Build & Production

```bash
# Build all packages
pnpm build

# Start production server
pnpm start

# Clean build artifacts
pnpm clean
```

## Project Structure

```
├── apps/web                 # Next.js application
│   ├── app/                # App Router pages
│   ├── modules/            # Feature modules
│   └── content/            # MDX content (docs, blog, legal)
├── packages/
│   ├── api/               # API routes (oRPC)
│   ├── auth/              # Authentication (better-auth)
│   ├── database/          # Database schema (Prisma)
│   ├── ai/                # AI integration
│   ├── mail/              # Email templates & providers
│   ├── payments/          # Payment providers
│   ├── storage/           # File storage (S3)
│   ├── i18n/              # Internationalization
│   └── utils/             # Shared utilities
├── config/                # Application configuration
└── tooling/               # Build tools & configs
```

## Technology Stack

- **Framework**: Next.js 15.5.7
- **Language**: TypeScript 5.9.3
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: better-auth 1.4.5
- **UI**: React 19.2.1 with Radix UI & Tailwind CSS
- **API**: oRPC (type-safe RPC)
- **Email**: MailHog (development) with nodemailer
- **Build**: Turbo monorepo
- **Linting**: Biome

## Features

- ✅ Multi-tenant SaaS with organizations
- ✅ User & organization-level billing
- ✅ Multiple authentication methods (email, social, passkeys, 2FA)
- ✅ Payment processing (Stripe, LemonSqueezy, Polar, etc.)
- ✅ Internationalization (i18n)
- ✅ AI integration (Vercel AI SDK)
- ✅ Email system with multiple providers
- ✅ File storage (S3)
- ✅ Admin panel
- ✅ Marketing site with blog & docs

## Troubleshooting

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**: 
- Verify PostgreSQL container is running: `docker ps | grep postgres`
- Check DATABASE_URL in `.env.local` matches your Docker port mapping
- Default: `postgresql://myuser:@localhost:3000/mydb`

### Email Not Sending

**Error**: `Could not send email`

**Solution**:
- Verify MailHog container is running: `docker ps | grep mailhog`
- Check EMAIL_SERVER_HOST and EMAIL_SERVER_PORT in `.env.local`
- Default: `localhost:1025`
- View emails at http://localhost:8025

### 422 Error on Signup

**Error**: `POST /api/auth/sign-up/email 422`

**Solution**:
- Use a new email address (user might already exist)
- Check email format is valid
- Verify database is initialized: `pnpm --filter @repo/database push`

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
- Change Docker port mapping: `-p 3001:5432` instead of `-p 3000:5432`
- Or kill the process using the port: `lsof -i :3000`

## Environment Variables Reference

See `.env.local.example` for all available configuration options including:
- Social login providers (GitHub, Google)
- Payment providers (Stripe, LemonSqueezy, Polar)
- Analytics (Google Analytics, Mixpanel, Plausible)
- Storage (S3)
- AI (OpenAI)

## Next Steps

1. **Customize Configuration**: Edit `config/index.ts` for your app settings and refer to [MARKETING_VARIANTS_SETUP.md](./MARKETING_VARIANTS_SETUP.md)
2. **Update Branding**: Replace logo and colors in `apps/web/public/images`
3. **Configure Payment Plans**: Set up pricing in `config/index.ts`
4. **Add Social Providers**: Configure GitHub and Google OAuth
5. **Deploy**: Follow Next.js deployment guide for your hosting platform

## Documentation

- [Project Structure](./apps/web/README.md)
- [API Documentation](./packages/api/README.md)
- [Database Schema](./packages/database/README.md)
- [Steering Docs](./.kiro/steering/README.md)

## Support

For issues and questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Steering Documentation](./.kiro/steering/)
3. Check [Migration Notes](./.kiro/steering/migration-notes.md) for recent changes

## License

MIT

# Migration Notes - December 2024 Update

## Overview

All dependencies have been updated to their latest stable versions. This document outlines breaking changes and required code modifications.

## Breaking Changes

### better-auth 1.3.7 → 1.4.5

**Issue:** The `passkeyClient` export was removed from `better-auth/client/plugins`, and passkey functionality moved to a separate package.

**Fix Applied:**
- Removed `passkeyClient` import from `packages/auth/client.ts`
- Removed `passkeyClient()` from the client plugins array
- Updated server import: changed `from "better-auth/plugins/passkey"` to `from "@better-auth/passkey"`
- Added `@better-auth/passkey@^1.4.5` to `packages/auth/package.json`

**Files Modified:**
- `packages/auth/client.ts`
- `packages/auth/auth.ts`
- `packages/auth/package.json`

### @content-collections/core 0.11.1 → 0.12.0

**Issue:** Version 0.11.1 was incompatible with Zod v4, causing runtime errors. Version 0.12.0 also deprecated implicit content properties.

**Fix Applied:**
- Updated to version 0.12.0 which supports Zod v4
- Added explicit `content: z.string()` property to all collection schemas in `apps/web/content-collections.ts`:
  - `posts` collection
  - `legalPages` collection
  - `docs` collection
  - `docsMeta` collection (optional)

**Files Modified:**
- `apps/web/content-collections.ts`

## Dependency Conflicts Resolved

### Zod Version Conflict

**Problem:** 
- Vercel AI SDK requires Zod 4.1.8+
- OpenAI SDK expects Zod 3.x
- content-collections 0.11.1 was incompatible with Zod 4.x

**Solution:**
- Updated to Zod 4.1.13
- Updated content-collections to 0.12.0
- Added pnpm override for Zod to ensure consistency

### Next.js Version Constraint

**Problem:**
- Next.js 16 is available but incompatible with:
  - fumadocs (expects 14.x or 15.x)
  - next-intl (expects up to 15.x)
  - @content-collections/next (expects up to 15.x)

**Solution:**
- Staying on Next.js 15.5.7 (latest in 15.x line)
- Added pnpm override to prevent accidental upgrades

## Email Provider Configuration

**Development Setup with MailHog:**
A custom MailHog provider has been created for local development. MailHog is a mail testing tool that runs in Docker and captures all emails sent to it.

**Setup:**
1. Run MailHog in Docker:
```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

2. Configure environment variables in `.env.local`:
```env
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
MAIL_FROM="noreply@localhost"
```

3. View emails at: http://localhost:8025

**Switching Email Providers:**
To use a different email provider, update `packages/mail/src/provider/index.ts`:
```typescript
// For Plunk
export * from "./plunk";

// For Resend
export * from "./resend";

// For Mailgun
export * from "./mailgun";

// For Postmark
export * from "./postmark";

// For Nodemailer
export * from "./nodemailer";

// For Console (logs to console)
export * from "./console";
```

Then configure the appropriate environment variables in `.env.local`.

## Testing Checklist

After updating dependencies, verify:

- [ ] Dev server starts without errors: `pnpm dev`
- [ ] Build completes successfully: `pnpm build`
- [ ] Type checking passes: `pnpm --filter @repo/web type-check`
- [ ] Authentication flows work (login, signup, passkeys)
- [ ] Content collections generate properly
- [ ] AI features function correctly
- [ ] Emails are logged to console during signup/password reset

## Future Updates

**Next.js 16:**
Wait for these packages to add support before upgrading:
- fumadocs
- next-intl
- @content-collections/next

**Monitoring:**
Check for updates regularly:
```bash
pnpm outdated --recursive
```

## Rollback Instructions

If issues arise, revert to previous versions:

```bash
git checkout HEAD -- package.json apps/web/package.json packages/*/package.json
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

Previous stable versions:
- Next.js: 15.5.2
- React: 19.1.1
- better-auth: 1.3.7
- TypeScript: 5.9.2

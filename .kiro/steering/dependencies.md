# Dependency Management

## Updated Dependencies (December 2024)

All dependencies have been updated to their latest compatible versions with proper peer dependency resolution.

### Key Version Updates

**Core Framework:**
- Next.js: 15.5.7 (latest stable in 15.x line)
- React: 19.2.1 (latest stable)
- TypeScript: 5.9.3 (latest stable)
- Zod: 4.1.8+ (required for AI SDK compatibility)

**Authentication:**
- better-auth: 1.4.5 (latest stable)

**AI & ML:**
- Vercel AI SDK: 5.0.106
- @ai-sdk/react: 2.0.106
- @ai-sdk/anthropic: 2.0.53
- @ai-sdk/openai: 2.0.77

**Database:**
- Prisma: 6.15.0
- Drizzle ORM: 0.44.5
- PostgreSQL driver: 8.16.3
- prisma-zod-generator: 1.32.2 (latest for Prisma 6.x)

**AWS SDK:**
- @aws-sdk/client-s3: 3.716.0 (major update from 3.437.0)
- @aws-sdk/s3-request-presigner: 3.716.0

**UI Components:**
- Radix UI: Latest versions (1.1.x - 2.2.x)
- Tailwind CSS: 4.1.12
- Lucide React: 0.542.0

**Development Tools:**
- Biome: 2.3.8 (latest stable)
- Turbo: 2.6.2 (latest stable)
- Playwright: 1.55.0
- @types/node: 24.10.1

**Content Management:**
- @content-collections/core: 0.12.0 (updated for Zod v4 compatibility)
- @content-collections/mdx: 0.2.2
- @content-collections/next: 0.2.7

**Removed Deprecated Packages:**
- oslo: 1.2.1 (removed - was unused and deprecated by maintainer)

## Peer Dependency Resolution

Added pnpm overrides to resolve compatibility issues:
```json
"pnpm": {
  "overrides": {
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.9",
    "zod": "^4.1.8",
    "next": "^15.5.7"
  }
}
```

**Why these overrides?**
- **Zod**: Ensures compatibility between Vercel AI SDK (requires 4.1.8+) and OpenAI SDK (expects 3.x but works with 4.x)
- **Next.js**: Keeps all packages on Next.js 15.x (Next.js 16 is too new for fumadocs, next-intl, and content-collections)
- **React types**: Ensures consistent React 19 types across all packages

## Version Strategy

All dependencies now use caret (^) ranges for automatic minor/patch updates:
- `^X.Y.Z` allows updates to `X.*.*` (excluding major versions)
- Ensures security patches and bug fixes are automatically available
- Maintains compatibility within major versions

## Common Issues

**Content Collections Not Generated:**
If you see TypeScript errors about missing 'content-collections', run:
```bash
pnpm --filter @repo/database generate
```

**Build Scripts Ignored:**
pnpm may ignore build scripts for security. Approve them with:
```bash
pnpm approve-builds
```

**better-auth 1.4.5 Breaking Changes:**
The `passkeyClient` export was removed from `better-auth/client/plugins` in version 1.4.5. Passkey functionality is now a separate package `@better-auth/passkey@^1.4.5`. The client configuration in `packages/auth/client.ts` has been updated to remove this import.

**Deprecated Packages Removed:**
- `oslo@1.2.1` - Was unused and marked as deprecated by maintainer. Removed from `apps/web/package.json`

**Deprecated Packages Updated:**
- `prisma-zod-generator` - Updated from 1.18.5 to 1.32.2 (latest for Prisma 6.x; v2.x requires Prisma 7)

## Updating Dependencies

To check for outdated packages:
```bash
pnpm outdated --recursive
```

To update all dependencies:
```bash
pnpm update --recursive --latest
```

To update a specific package:
```bash
pnpm update <package-name> --latest
```

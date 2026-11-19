#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
for tool in node pnpm docker; do
  if ! command -v "$tool" >/dev/null; then
    echo "Install $tool to run local setup." >&2
    exit 1
  fi
done

node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  if (!(major === 22 && minor >= 13 || major >= 24)) {
    process.stderr.write("Use Node.js 22.13+ on the 22.x line or Node.js 24+.\n");
    process.exit(1);
  }
'
expected_pnpm="$(node -p 'require("./package.json").packageManager.split("@").pop()')"
if [[ "$(pnpm --version)" != "$expected_pnpm" ]]; then
  echo "Use pnpm $expected_pnpm, the version pinned in package.json." >&2
  exit 1
fi
if ! docker compose version >/dev/null; then
  echo "Install Docker Compose v2.17+ with support for up --wait." >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "Start Docker Engine or Docker Desktop, then rerun pnpm run setup." >&2
  exit 1
fi

node scripts/setup-local-env.mjs
pnpm install --frozen-lockfile
docker compose --env-file .env.local --file docker-compose.yml up --detach --wait
pnpm --filter @repo/database generate
pnpm --filter @repo/database push
pnpm --filter @repo/database seed

echo "Local setup complete. Start the app with pnpm dev. Mailpit is at http://localhost:8025."

#!/usr/bin/env bash
# commit.sh — make a commit inside the OneDrive-mounted working folder.
#
# Why this exists: the Windows filesystem refuses to delete .git/*.lock, so
# any git command interrupted mid-flight leaves a zero-byte lock behind and
# every later `git add` fails with "File exists" forever. Committing from a
# local copy and copying the objects back works around it.
#
# Usage:  scripts/commit.sh "<message>"
#
# Safe to run repeatedly. If the repo is on a normal filesystem this is
# equivalent to `git add -A && git commit -m "$1"`.

set -euo pipefail

MSG="${1:-}"
if [ -z "$MSG" ]; then
  echo "usage: scripts/commit.sh \"<message>\"" >&2
  exit 1
fi

# Resolve the repo root from this script's location, so it works from any cwd.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Copy the working tree and its .git, excluding build artefacts and deps.
rsync -a \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='pnpm-lock.yaml' \
  --exclude='playwright-report' \
  --exclude='test-results' \
  "$REPO/" "$WORK/"

cd "$WORK"

# Drop any stale locks the mount left behind.
find .git -name '*.lock' -delete 2>/dev/null || true

git add -A

if git diff --cached --quiet; then
  echo "nothing to commit — working tree matches HEAD"
  exit 0
fi

# Wrap to ~72 cols, matching Conventional Commits style used in this repo.
git commit -q -F - <<EOF
$MSG
EOF

NEW_HEAD="$(git rev-parse HEAD)"
BRANCH="$(git symbolic-ref --short HEAD)"

echo "committed $NEW_HEAD on $BRANCH"

# --- Copy objects and refs back into the mounted repo -----------------------
# Loose objects are written directly; packfiles are copied wholesale. Existing
# objects are never overwritten, so this is safe against concurrent work.
if [ -d "$REPO/.git/objects" ]; then
  find .git/objects -type f | grep -v '/pack/' | while read -r f; do
    rel="${f#.git/objects/}"
    mkdir -p "$REPO/.git/objects/$(dirname "$rel")" 2>/dev/null || true
    cp -n "$f" "$REPO/.git/objects/$rel" 2>/dev/null || true
  done
fi

if [ -d .git/objects/pack ]; then
  mkdir -p "$REPO/.git/objects/pack" 2>/dev/null || true
  cp -n .git/objects/pack/* "$REPO/.git/objects/pack/" 2>/dev/null || true
fi

# Refs are single small files — write them directly rather than via the lock.
mkdir -p "$REPO/.git/refs/heads/$(dirname "$BRANCH")" 2>/dev/null || true
printf '%s\n' "$NEW_HEAD" > "$REPO/.git/refs/heads/$BRANCH"

# The index cannot be lock-then-renamed on this mount, so overwrite it with the
# one we just built. Without this the mount's stale index shows every committed
# file as deleted.
cp .git/index "$REPO/.git/index" 2>/dev/null || true

# Remove pack indexes' stale lock files if any were copied.
find "$REPO/.git" -name '*.lock' -newer "$REPO/package.json" -delete 2>/dev/null || true

echo "--- verified in the mounted repo ---"
git -C "$REPO" log --oneline -1
git -C "$REPO" status --short || true
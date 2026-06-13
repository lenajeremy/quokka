#!/usr/bin/env bash
set -e

new_version=""
current=""
did_commit=false
did_tag=false

rollback() {
  echo ""
  echo "Something went wrong — rolling back..."

  if $did_tag; then
    git tag -d "v$new_version" && echo "  Removed tag v$new_version" || true
  fi

  if $did_commit; then
    git reset HEAD~1 && echo "  Reverted commit" || true
  fi

  git stash push -q -- package.json && git stash drop -q \
    && echo "  Restored package.json to v$current" || true

  echo ""
  echo "Back to v$current. Nothing was pushed or published."
  exit 1
}

trap rollback ERR

# ── 1. Build ──────────────────────────────────────────────────────────────────
echo "Building package..."
pnpm build

# ── 2. Prompt for bump type ───────────────────────────────────────────────────
echo ""
echo "Version bump type:"
echo "  1) major  (breaking changes)"
echo "  2) minor  (new features, backwards compatible)"
echo "  3) patch  (bug fixes)"
echo ""
read -p "Choice (major / minor / patch): " bump_type

case $bump_type in
  major|1) bump=major ;;
  minor|2) bump=minor ;;
  patch|3) bump=patch ;;

  *)
    echo "Invalid choice. Expected major, minor, or patch."
    exit 1
    ;;
esac

# ── 3. Compute new version ────────────────────────────────────────────────────
current=$(node -p "require('./package.json').version")
IFS='.' read -r maj min pat <<< "$current"

case $bump in
  major) maj=$((maj + 1)); min=0; pat=0 ;;
  minor) min=$((min + 1)); pat=0 ;;
  patch) pat=$((pat + 1)) ;;
esac

new_version="$maj.$min.$pat"
echo ""
echo "Bumping $current → $new_version"
echo ""
read -p "Confirm release v$new_version? (y/N): " confirm

case $confirm in
  y|Y) ;;
  *)
    echo "Aborted."
    exit 0
    ;;
esac

# ── 4. Write version into package.json ───────────────────────────────────────
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$new_version';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# ── 5. Commit and tag ─────────────────────────────────────────────────────────
git add package.json
git commit -m "v$new_version"
did_commit=true

git tag "v$new_version"
did_tag=true

# ── 6. Publish ────────────────────────────────────────────────────────────────
# --ignore-scripts prevents pnpm from re-running prepublish inside this script
echo ""
echo "Publishing to npm..."
pnpm publish --ignore-scripts

# ── 7. Push commit and tag (only reached if publish succeeded) ────────────────
echo ""
echo "Pushing to remote..."
git push
git push origin "v$new_version"

echo ""
echo "✓ Released v$new_version"

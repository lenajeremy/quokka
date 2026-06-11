#!/usr/bin/env bash
set -e

# ── 1. Build ──────────────────────────────────────────────────────────────────
echo "Building package..."
pnpm build

# ── 2. Prompt for bump type ───────────────────────────────────────────────────
echo ""
echo "Version bump type:"
echo "  1) patch  (bug fixes)"
echo "  2) minor  (new features, backwards compatible)"
echo "  3) major  (breaking changes)"
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

# ── 4. Write version into package.json ───────────────────────────────────────
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = '$new_version';
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# ── 5. Stage changes ──────────────────────────────────────────────────────────
git add package.json
git add -f lib/

# ── 6. Commit, tag, push ──────────────────────────────────────────────────────
git commit -m "v$new_version"
git tag "v$new_version"
git push
git push origin "v$new_version"

echo ""
echo "✓ Released v$new_version"

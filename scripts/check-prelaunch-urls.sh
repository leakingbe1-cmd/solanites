#!/usr/bin/env bash
# Enforces the PRELAUNCH URL RULE (docs/marketing/prelaunch-rules.md): no website or
# deployment preview address in campaign sources, templates, captions or post copy.
#
#   scripts/check-prelaunch-urls.sh        exits 1 and lists every match
#
# Two scans: campaign paths must contain no web address at all, and every other tracked
# file (the repository is public) must not name a Vercel deployment host.
# Run automatically by scripts/promo-assets.sh; rendered images and videos are checked
# visually, since they contain no text to search.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
PATHS=(docs/marketing art/promo art/campaign scripts/promo-assets.sh scripts/promo-overlays.mjs scripts/phoenix-intro.sh art/intro)
PATTERN='https?://|www\.|\b[a-z0-9-]+\.(vercel\.app|app|com|io|xyz|net|org|fun|gg|so|dev|site|link)\b'
# The rule document quotes example domains on purpose; the URL pattern lines in the scripts are not addresses.
hits="$(grep -rnIiE "$PATTERN" "${PATHS[@]}" 2>/dev/null \
  | grep -v '^docs/marketing/prelaunch-rules.md:' \
  | grep -vE '^scripts/[a-z-]+\.(sh|mjs):[0-9]+:.*(PATTERN|URL_PATTERN)' || true)"
# The whole public tree: no deployment host anywhere (the rules document quotes the patterns).
hosts="$(git grep -nIiE '[a-z0-9-]+\.vercel\.app' -- . ':!package-lock.json' ':!docs/marketing/prelaunch-rules.md' 2>/dev/null || true)"
[ -n "$hosts" ] && hits="${hits:+$hits
}$hosts"
if [ -n "$hits" ]; then
  echo "PRELAUNCH URL RULE: web addresses found in campaign files:" >&2
  echo "$hits" >&2
  exit 1
fi
echo "Prelaunch URL check: no web addresses in campaign files, no deployment host in the repository."

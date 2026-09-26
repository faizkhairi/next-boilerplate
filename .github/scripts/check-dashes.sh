#!/usr/bin/env bash
# Fails when a tracked file contains an em dash (U+2014), or when Markdown
# prose uses " -- " as a dash. Fenced code blocks and inline code spans are
# skipped, so shell examples such as `npm test -- --watch` stay valid.
set -euo pipefail

status=0
emdash=$'\xe2\x80\x94'

if git grep -nIF "$emdash" -- . ':!*.lock' ':!pnpm-lock.yaml' ':!package-lock.json'; then
  echo "::error::Em dash (U+2014) found. Use a period, colon, comma or parentheses instead."
  status=1
fi

while IFS= read -r file; do
  if ! awk -v f="$file" '
    /^[[:space:]]*(```|~~~)/ { fence = !fence; next }
    fence { next }
    {
      line = $0
      gsub(/`[^`]*`/, "", line)
      if (line ~ / -- /) { printf "%s:%d: %s\n", f, NR, $0; bad = 1 }
    }
    END { exit bad }
  ' "$file"; then
    echo "::error file=$file::' -- ' used as a dash in Markdown prose."
    status=1
  fi
done < <(git ls-files '*.md' '*.mdx')

exit "$status"

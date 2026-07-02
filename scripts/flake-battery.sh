#!/usr/bin/env bash
# Flake-stability battery: run the SAME suite N times in a chosen mode,
# strictly sequentially (no overlap), one summary line per run.
# Usage: flake-battery.sh <mode: canonical|isolate-false> <count> <results-file>
set -u
cd /Users/vincentschnetzer/Documents/Playground/Kimi_Agent_SizhuAtelier_Webdesign/app

mode="$1"; count="$2"; out_file="$3"
if [ "$mode" = "isolate-false" ]; then
  cmd=(node ./node_modules/vitest/vitest.mjs run --isolate=false)
else
  cmd=(node ./node_modules/vitest/vitest.mjs run)
fi

: > "$out_file"
for i in $(seq 1 "$count"); do
  raw="$("${cmd[@]}" 2>&1)"
  files_line="$(printf '%s\n' "$raw" | grep -E '^ Test Files' | tail -1)"
  tests_line="$(printf '%s\n' "$raw" | grep -E '^      Tests'  | tail -1)"
  fails="$(printf '%s\n' "$raw" | grep -E '× |Unable to find|Test timed out|TestingLibraryElementError' | grep -v 'Not implemented' | head -10)"
  # A real full run reports 31 files / 441 tests. Flag anything else.
  if printf '%s' "$tests_line" | grep -q '441 passed (441)' && printf '%s' "$files_line" | grep -q '31 passed (31)'; then
    verdict="GREEN"
  elif printf '%s' "$tests_line" | grep -q '(441)'; then
    verdict="FLAKE"        # full collection, but some failed
  else
    verdict="ABORTED"      # did not collect all 441 (contention/abort, not a suite verdict)
  fi
  printf '%s | RUN %02d | %s | files:%s | tests:%s\n' \
    "$mode" "$i" "$verdict" \
    "$(printf '%s' "$files_line" | sed 's/ Test Files//' | tr -s ' ')" \
    "$(printf '%s' "$tests_line" | sed 's/      Tests//' | tr -s ' ')" >> "$out_file"
  if [ -n "$fails" ]; then
    printf '%s\n' "$fails" | sed 's/^/    /' >> "$out_file"
  fi
done
echo "BATTERY-DONE $mode" >> "$out_file"

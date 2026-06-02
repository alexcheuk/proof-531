#!/usr/bin/env bash
# ----------------------------------------------------------------------------
# build-and-validate.sh : out-of-band UI validation harness for 531 Strength.
#
# Pipeline:  build standalone APK  ->  install on emulator  ->  run ALL Maestro
#            flows  ->  write a PASS/FAIL result the loop ingests next tick.
#
# Usage:     do-work/scripts/build-and-validate.sh <commit-sha>
#            (sha optional; defaults to the current short HEAD)
#
# This is the slow, out-of-band leg of proof-by-type for UI items. The loop
# does NOT block on it: it kicks this off in the BACKGROUND at a validation
# milestone, keeps working, and on the next tick reads do-work/builds/<sha>.json
# plus <sha>.result.txt to learn PASS or FAIL (see validation.mjs ingest).
#
# Requirements on the host running this:
#   - Android SDK (adb + an AVD), JDK 17, and the EAS CLI (via npx).
#   - An emulator named per AVD_NAME below, or one already booted as $DEVICE.
#   - Maestro installed at ~/.maestro/bin/maestro.
#
# Build: `pnpm build:prod` -> apps/mobile/531-prod.apk. That is the
# `production-apk` EAS profile: a release-signed STANDALONE apk that runs with
# NO Metro server, which is what makes autonomous Maestro smoke possible. The
# dev-client build (`pnpm build:dev`) is deliberately NOT used here: it needs a
# Metro bundler attached and would hang/blank-screen under automation.
#
# APP-ID INTEGRITY (ported from koresore tick-70/71, the highest-value part):
# the prod apk installs as the BASE package `com.alexcheuk.fivethreeone`, but
# the committed Maestro flows pin the DEV id `com.alexcheuk.fivethreeone.dev`
# (inline, or inherited from .maestro/config.yaml). If a stale .dev app were
# installed, launchApp would open THAT and the flows could pass against old
# code: a silent FALSE PASS. To make that impossible we (a) uninstall every
# `com.alexcheuk.fivethreeone*` variant before installing, (b) install the
# fresh apk, (c) VERIFY the package is actually present (adb prints "Success"
# even when it no-ops), and (d) detect the ACTUAL installed id at runtime and
# rewrite the appId in a temp runtime copy of every flow + the maestro config
# so a flow can never target a different/stale app than the one just built.
#
# DEVICE pinning: every adb/maestro call is pinned to $DEVICE. A physical phone
# may be attached at the same time; un-pinned commands then error ("more than
# one device") or, worse, install on / screencap the physical device. Pin all.
# ----------------------------------------------------------------------------
set -uo pipefail

# --- locate the repo root so the script is callable from anywhere -----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

COMMIT="${1:-$(git rev-parse --short HEAD)}"
DEVICE="${DEVICE:-emulator-5554}"
AVD_NAME="${AVD_NAME:-Pixel_7}"
EMULATOR_BIN="${EMULATOR_BIN:-$HOME/Library/Android/sdk/emulator/emulator}"
MAESTRO_BIN="${MAESTRO_BIN:-$HOME/.maestro/bin/maestro}"

# The 531 Android package family. The production-apk build installs the BASE id;
# the .dev/.preview-style variants share this prefix, so this grep matches the
# whole family for the "uninstall every variant" sweep.
PKG_PREFIX="com.alexcheuk.fivethreeone"

APK_PATH="apps/mobile/531-prod.apk"

OUT="do-work/builds"; mkdir -p "$OUT"
RESULT="$OUT/${COMMIT}.result.txt"
STATE="$OUT/${COMMIT}.json"
LOG="$OUT/${COMMIT}.build.log"
: > "$LOG"

echo '{"state":"building","commit":"'"$COMMIT"'"}' > "$STATE"

log() { echo "[validate $(date -u +%H:%M:%S)] $*" | tee -a "$LOG"; }

# --- 1. Build the standalone release apk ------------------------------------
#    Slow: needs Android SDK + JDK + network for the EAS local build. The full
#    build output is teed to the log so a failure is diagnosable next tick.
log "building $APK_PATH via pnpm build:prod (commit $COMMIT)"
if ! pnpm build:prod >>"$LOG" 2>&1; then
  echo "FAIL: build (pnpm build:prod) failed - see ${LOG}" > "$RESULT"
  echo '{"state":"failed","stage":"build","commit":"'"$COMMIT"'"}' > "$STATE"
  exit 0
fi
if [ ! -f "$APK_PATH" ]; then
  echo "FAIL: build reported success but $APK_PATH is missing - see ${LOG}" > "$RESULT"
  echo '{"state":"failed","stage":"build-output","commit":"'"$COMMIT"'"}' > "$STATE"
  exit 0
fi

# --- 2. Boot the emulator if $DEVICE is not already up ----------------------
if ! adb devices | grep -qE "^${DEVICE}[[:space:]]+device$"; then
  log "emulator $DEVICE not up; booting AVD $AVD_NAME"
  ( "$EMULATOR_BIN" -avd "$AVD_NAME" -no-snapshot -no-audio >/dev/null 2>&1 & )
  if ! adb -s "$DEVICE" wait-for-device; then
    echo "FAIL: emulator $DEVICE did not come up - see ${LOG}" > "$RESULT"
    echo '{"state":"failed","stage":"emulator","commit":"'"$COMMIT"'"}' > "$STATE"
    exit 0
  fi
fi

# --- 2a. Uninstall every 531 variant so only the fresh build can be launched -
#    Prevents a stale prod/dev/preview app from satisfying launchApp (false PASS).
for p in $(adb -s "$DEVICE" shell pm list packages 2>/dev/null \
            | sed 's/^package://' \
            | grep -E "^${PKG_PREFIX}([.][a-z_]+)?$"); do
  log "uninstalling stale variant: $p"
  adb -s "$DEVICE" uninstall "$p" >>"$LOG" 2>&1 || true
done

# --- 2b. Install the freshly built apk --------------------------------------
log "installing $APK_PATH on $DEVICE"
if ! adb -s "$DEVICE" install -r -d "$APK_PATH" >>"$LOG" 2>&1; then
  echo "FAIL: install of $APK_PATH failed - see ${LOG}" > "$RESULT"
  echo '{"state":"failed","stage":"install","commit":"'"$COMMIT"'"}' > "$STATE"
  exit 0
fi

# --- 2c. VERIFY the package is actually present -----------------------------
#    adb can print "Success" yet install nothing; never trust it alone.
PKG="$(adb -s "$DEVICE" shell pm list packages 2>/dev/null \
        | sed 's/^package://' \
        | grep -E "^${PKG_PREFIX}([.][a-z_]+)?$" \
        | head -1)"
if [ -z "$PKG" ]; then
  echo "FAIL: install reported success but no ${PKG_PREFIX}* package is present (false-PASS guard) - see ${LOG}" > "$RESULT"
  echo '{"state":"failed","stage":"install-verify","commit":"'"$COMMIT"'"}' > "$STATE"
  exit 0
fi
log "installed package verified present: $PKG"

# --- 3. Build a runtime copy of .maestro pinned to the ACTUAL installed id ---
#    The committed flows pin the .dev id (inline) or inherit it from
#    config.yaml. Rewrite both the config appId and any inline flow appId to the
#    detected $PKG so no flow can ever target a different/stale app. Never trust
#    a hardcoded id.
RUNTIME_MAESTRO="$OUT/maestro.runtime"
rm -rf "$RUNTIME_MAESTRO"
mkdir -p "$RUNTIME_MAESTRO/flows"

if [ -f ".maestro/config.yaml" ]; then
  sed "s/^appId:.*/appId: ${PKG}/" .maestro/config.yaml > "$RUNTIME_MAESTRO/config.yaml"
fi

shopt -s nullglob
FLOWS=( .maestro/flows/*.yaml )
shopt -u nullglob
if [ "${#FLOWS[@]}" -eq 0 ]; then
  echo "FAIL: no Maestro flows found under .maestro/flows/ - see ${LOG}" > "$RESULT"
  echo '{"state":"failed","stage":"no-flows","commit":"'"$COMMIT"'"}' > "$STATE"
  exit 0
fi

for f in "${FLOWS[@]}"; do
  base="$(basename "$f")"
  # Rewrite any inline `appId:` to the detected id. Flows without an inline
  # appId inherit it from the runtime config.yaml we just rewrote.
  sed "s/^appId:.*/appId: ${PKG}/" "$f" > "$RUNTIME_MAESTRO/flows/$base"
done

# --- 3a. Run EVERY flow; ANY single failure makes the whole run a FAIL -------
log "running ${#FLOWS[@]} Maestro flow(s) against $PKG on $DEVICE"
OVERALL_PASS=1
FAILED_FLOWS=""
for f in "${FLOWS[@]}"; do
  base="$(basename "$f")"
  rf="$RUNTIME_MAESTRO/flows/$base"
  log "flow: $base"
  if "$MAESTRO_BIN" --device "$DEVICE" test "$rf" >>"$LOG" 2>&1; then
    log "flow PASS: $base"
  else
    log "flow FAIL: $base"
    OVERALL_PASS=0
    FAILED_FLOWS="${FAILED_FLOWS}${FAILED_FLOWS:+, }${base}"
  fi
done

# --- 4. Write the result the loop ingests next tick -------------------------
if [ "$OVERALL_PASS" -eq 1 ]; then
  echo "PASS: all ${#FLOWS[@]} Maestro flows green (pkg ${PKG}, commit ${COMMIT})" > "$RESULT"
  echo '{"state":"passed","commit":"'"$COMMIT"'","pkg":"'"$PKG"'"}' > "$STATE"
else
  echo "FAIL: Maestro flow(s) failed [${FAILED_FLOWS}] (pkg ${PKG}) - see ${LOG}" > "$RESULT"
  echo '{"state":"failed","stage":"maestro","commit":"'"$COMMIT"'","failed_flows":"'"$FAILED_FLOWS"'"}' > "$STATE"
fi
exit 0

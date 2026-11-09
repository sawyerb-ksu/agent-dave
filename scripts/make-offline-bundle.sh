#!/usr/bin/env bash
# Build an offline copy of agent-dave for a room without internet.
# Run it while online, the week of the workshop, from the agent-dave folder:
#   ./scripts/make-offline-bundle.sh            (writes ../agent-dave-offline.tar.gz)
#   ./scripts/make-offline-bundle.sh ~/Desktop  (writes it there)
#
# The bundle has everything a studio machine needs that would normally come from the
# internet: campus-events' packages, a fresh calendar snapshot, and local copies of the
# pi packages used on slides 34 and 36. pi itself must already be installed.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$(cd "${1:-..}" && pwd)"
NAME="$(basename "$PWD")"
ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$1"; }
npmq() { npm "$@" --no-audit --no-fund --no-update-notifier --loglevel=error >/dev/null; }

echo "Building the offline bundle"

npmq install --prefix mcp/campus-events
ok "campus-events packages"

if npm run --silent --prefix mcp/campus-events snapshot; then ok "Fresh calendar snapshot"
else warn "Couldn't refresh the snapshot; the bundle keeps the one already in mcp/campus-events/data/"; fi

# A pi package folder that wraps an npm package installed inside it, so the command
# stays short: pi install ./vendor/<folder>. The wrapper reuses the package's own
# pi manifest (extensions, skills, prompts), pointed into node_modules.
vendor() { # vendor <folder> <package name> <npm specs...>
  local dir="vendor/$1" pkg="$2"; shift 2
  rm -rf "$dir" && mkdir -p "$dir"
  npmq install --prefix "$dir" --omit=peer "$@"
  PKG="$pkg" node -e '
    const fs = require("fs"), path = require("path"), dir = process.argv[1], pkg = process.env.PKG;
    const inner = JSON.parse(fs.readFileSync(path.join(dir, "node_modules", pkg, "package.json"), "utf8"));
    const wrap = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
    const into = (v) => "./" + path.posix.join("node_modules", pkg, v);
    wrap.name = "vendored-" + path.basename(dir);
    wrap.private = true;
    wrap.pi = Object.fromEntries(Object.entries(inner.pi || {})
      .filter(([k]) => ["extensions", "skills", "prompts", "themes"].includes(k))
      .map(([k, v]) => [k, v.map(into)]));
    fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(wrap, null, 2) + "\n");' "$dir"
}
vendor ask-user-question @juicesharp/rpiv-ask-user-question @juicesharp/rpiv-ask-user-question@2.15.0 @juicesharp/rpiv-i18n
ok "Slide 34 package: pi install ./vendor/ask-user-question"
vendor pi-subagents pi-subagents pi-subagents@0.86.0
ok "Finale package: pi install ./vendor/pi-subagents"

cd ..
tar --exclude="$NAME/.git" --exclude="$NAME/presentation-resources/*.pptx" --exclude="$NAME/*.ics" --exclude="$NAME/notes" --exclude="$NAME/briefs" \
  -czf "$OUT/agent-dave-offline.tar.gz" "$NAME"
ok "$OUT/agent-dave-offline.tar.gz ($(du -h "$OUT/agent-dave-offline.tar.gz" | cut -f1))"
if command -v zip >/dev/null 2>&1; then
  rm -f "$OUT/agent-dave-offline.zip"
  zip -qr "$OUT/agent-dave-offline.zip" "$NAME" -x "$NAME/.git/*" "$NAME/presentation-resources/*.pptx" "$NAME/*.ics" "$NAME/notes/*" "$NAME/briefs/*"
  ok "$OUT/agent-dave-offline.zip"
fi

echo
echo "Copy the bundle to USB drives or the studio share. On each machine:"
echo "  extract it, open the folder in VS Code, then run ./setup.sh in its terminal."

#!/usr/bin/env bash
set -Eeuo pipefail
umask 022
BASE=/opt/leopnt
exec 9>"$BASE/state/deploy.lock"
flock -w 900 9
export HOME=/opt/leopnt/deployer NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
export NODE_OPTIONS=--max-old-space-size=768

git --git-dir="$BASE/repository.git" fetch --prune origin +refs/heads/main:refs/remotes/origin/main
sha=$(git --git-dir="$BASE/repository.git" rev-parse refs/remotes/origin/main)
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 1
if [[ -f "$BASE/current/.release.env" ]] && grep -qx "LEOPNT_RELEASE=$sha" "$BASE/current/.release.env" && curl -fsS --max-time 5 http://127.0.0.1:3200/api/health | grep -q "\"release\":\"$sha\""; then
    echo "Already serving $sha"
    exit 0
fi

release="$BASE/releases/$sha-$(date +%s%N)"
mkdir -p "$release"
git --git-dir="$BASE/repository.git" archive "$sha" | tar -x -C "$release"
ln -s "$BASE/shared/cache" "$release/.cache"
printf 'LEOPNT_RELEASE=%s\n' "$sha" > "$release/.release.env"
cd "$release"
timeout 600s npm ci --include=dev --no-audit --no-fund
timeout 180s npm test
timeout 600s npm run build
if [[ -d .next/cache ]]; then chgrp -R leopnt .next/cache; chmod -R g+rwX .next/cache; fi
mkdir -p "$BASE/assets/_next/static"
cp -a .next/static/. "$BASE/assets/_next/static/"

previous=$(readlink -f "$BASE/current" 2>/dev/null || true)
ln -sfn "$release" "$BASE/current.next"
mv -Tf "$BASE/current.next" "$BASE/current"
if ! sudo /usr/bin/systemctl restart leopnt-web.service; then
    if [[ -n "$previous" ]]; then ln -sfn "$previous" "$BASE/rollback.next"; mv -Tf "$BASE/rollback.next" "$BASE/current"; sudo /usr/bin/systemctl restart leopnt-web.service; fi
    exit 1
fi
healthy=false
for attempt in $(seq 1 30); do
    if curl -fsS --max-time 3 http://127.0.0.1:3200/api/health | grep -q "\"release\":\"$sha\""; then healthy=true; break; fi
    sleep 1
done
if [[ "$healthy" != true ]]; then
    echo "Health check failed; restoring prior release" >&2
    if [[ -n "$previous" ]]; then ln -sfn "$previous" "$BASE/rollback.next"; mv -Tf "$BASE/rollback.next" "$BASE/current"; sudo /usr/bin/systemctl restart leopnt-web.service; fi
    exit 1
fi
if [[ -n "$previous" ]]; then ln -sfn "$previous" "$BASE/previous.next"; mv -Tf "$BASE/previous.next" "$BASE/previous"; fi
printf '%s\n' "$sha" > "$BASE/state/active-release"
echo "Deployed $sha"

# Keep five builds, always retaining current and previous for rollback.
find "$BASE/releases" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -nr | tail -n +6 | cut -d' ' -f2- |
while IFS= read -r old; do
    resolved=$(realpath "$old")
    [[ "$resolved" == "$BASE/releases/"* && "$(basename "$resolved")" =~ ^[0-9a-f]{40}-[0-9]+$ ]] || continue
    [[ "$resolved" != "$release" && "$resolved" != "$previous" ]] || continue
    rm -rf -- "$resolved"
done

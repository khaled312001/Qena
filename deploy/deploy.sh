#!/usr/bin/env bash
# Deploy Qena Guide on Hostinger
# Run this script ON THE SERVER from /home/u492425110/qena-app

set -e
APP_ROOT="/home/u492425110/qena-app"
DOMAIN_ROOT="/home/u492425110/domains/barmagly.tech"
PUBLIC_DIR="${DOMAIN_ROOT}/public_html/qena"
PASS_DIR="${DOMAIN_ROOT}/qena-nodejs"
NODE="/opt/alt/alt-nodejs22/root/bin/node"
NPM="/opt/alt/alt-nodejs22/root/bin/npm"

echo "› pulling latest code..."
cd "$APP_ROOT"
git pull origin main

echo "› installing backend deps..."
cd "$APP_ROOT/backend"
"$NPM" install --omit=dev

echo "› installing & building frontend..."
cd "$APP_ROOT/frontend"
"$NPM" install
"$NPM" run build

echo "› syncing frontend dist to public_html/qena..."
mkdir -p "$PUBLIC_DIR"
# keep existing api/ folder
rsync -a --delete --exclude='api' --exclude='.htaccess' "$APP_ROOT/frontend/dist/" "$PUBLIC_DIR/"
cp "$APP_ROOT/deploy/public_html.htaccess" "$PUBLIC_DIR/.htaccess"

echo "› setting up /api passenger folder..."
mkdir -p "$PUBLIC_DIR/api"
cp "$APP_ROOT/deploy/api.htaccess" "$PUBLIC_DIR/api/.htaccess"

echo "› setting up qena-nodejs passenger entry..."
mkdir -p "$PASS_DIR/tmp"
cp "$APP_ROOT/deploy/server.js" "$PASS_DIR/server.js"
ln -sfn "$APP_ROOT/backend/node_modules" "$PASS_DIR/node_modules"

echo "› restarting passenger..."
touch "$PASS_DIR/tmp/restart.txt"

echo "✓ Deployed. Visit https://qena.barmagly.tech"

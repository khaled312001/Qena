#!/usr/bin/env bash
# Deploy Qinawy on Hostinger — serves from https://qinawy.com directly
# Run this script ON THE SERVER from /home/u492425110/qena-app

set -e
APP_ROOT="/home/u492425110/qena-app"
PUBLIC_DIR="/home/u492425110/domains/qinawy.com/public_html"
PASS_DIR="/home/u492425110/domains/barmagly.tech/qena-nodejs"
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

echo "› syncing frontend dist to qinawy.com/public_html..."
mkdir -p "$PUBLIC_DIR"
# keep existing api/ folder and .htaccess (we overwrite .htaccess explicitly below)
rsync -a --delete --exclude='api' --exclude='.htaccess' "$APP_ROOT/frontend/dist/" "$PUBLIC_DIR/"
cp "$APP_ROOT/deploy/qinawy_public_html.htaccess" "$PUBLIC_DIR/.htaccess"

echo "› setting up /api passenger folder..."
mkdir -p "$PUBLIC_DIR/api"
cp "$APP_ROOT/deploy/api.htaccess" "$PUBLIC_DIR/api/.htaccess"

echo "› setting up qena-nodejs passenger entry (still serves /api/*)..."
mkdir -p "$PASS_DIR/tmp"
cp "$APP_ROOT/deploy/server.js" "$PASS_DIR/server.js"
ln -sfn "$APP_ROOT/backend/node_modules" "$PASS_DIR/node_modules"

# Hostinger created its own Node.js app at qinawy.com/nodejs/ when the
# domain was added in hPanel; LiteSpeed routes everything that isn't a
# static file or /api/* to it. Sync our backend source there too so that
# the SPA catch-all (in seo.js) can serve per-route SSR'd HTML for /about,
# /category/*, /service/*, etc. .env has to live next to the app or
# dotenv can't find it and DB connections fail.
QINAWY_APP="/home/u492425110/domains/qinawy.com/nodejs"
echo "› syncing backend source into qinawy.com/nodejs..."
rsync -a --delete \
  --exclude='node_modules' --exclude='.env' --exclude='uploads' --exclude='tmp' \
  "$APP_ROOT/backend/" "$QINAWY_APP/"
mkdir -p "$QINAWY_APP/tmp"
cp "$APP_ROOT/backend/.env" "$QINAWY_APP/.env"
ln -sfn "$APP_ROOT/backend/node_modules" "$QINAWY_APP/node_modules"
ln -sfn "$APP_ROOT/backend/uploads" "$QINAWY_APP/uploads"

echo "› restarting passenger (both apps)..."
touch "$PASS_DIR/tmp/restart.txt"
touch "$QINAWY_APP/tmp/restart.txt"

echo "✓ Deployed. Visit https://qinawy.com"

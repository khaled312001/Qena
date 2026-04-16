'use strict';
// Passenger entry for qena.barmagly.tech
// Deployed to: /home/u492425110/domains/barmagly.tech/qena-nodejs/server.js
// Source app: /home/u492425110/qena-app/

const fs = require('fs');
const path = require('path');

const LOG = '/home/u492425110/domains/barmagly.tech/qena-nodejs/startup.log';
const ERR_LOG = '/home/u492425110/domains/barmagly.tech/qena-nodejs/error.log';

function log(msg) {
  try { fs.appendFileSync(LOG, new Date().toISOString() + ' ' + msg + '\n'); } catch (_) {}
  console.log(msg);
}

process.on('uncaughtException', (err) => {
  try { fs.appendFileSync(ERR_LOG, new Date().toISOString() + '\n' + err.stack + '\n'); } catch (_) {}
  process.exit(1);
});

const envFile = '/home/u492425110/qena-app/.env';
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || !t.includes('=')) continue;
    const idx = t.indexOf('=');
    const key = t.substring(0, idx).trim();
    const val = t.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !process.env[key]) process.env[key] = val;
  }
  log('Loaded .env OK; DB=' + process.env.DB_NAME);
} else {
  log('WARNING: .env not found at ' + envFile);
}

process.chdir('/home/u492425110/qena-app/backend');
log('cwd=' + process.cwd());

log('Loading backend/src/index.js...');
require('/home/u492425110/qena-app/backend/src/index.js');
log('app loaded');

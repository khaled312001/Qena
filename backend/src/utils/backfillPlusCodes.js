// Backfill lat/lng for services that have a Plus Code in the address but
// no decimal coordinates. The /nearby query needs lat/lng, so without this
// the newly-imported Qift services don't show up in proximity searches.
require('dotenv').config();
const OLC = require('open-location-code').OpenLocationCode;
const olc = new OLC();
const { sequelize, Service } = require('../models');
const { Op } = require('sequelize');

// Reference center for قنا governorate. Plus Code short forms (4 chars + plus)
// will be expanded relative to this point.
const QENA_REF = { lat: 26.158, lng: 32.718 };

// Match Plus Codes in Arabic addresses. Format examples:
//   XRX5+7W3   (4+3 short code)
//   2R26+VXW
//   5PJQ+9P6 أمام دار رعاية
//   XRCW+VX قفط
const PLUS_CODE_RE = /([23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3})/i;

function decodeCode(raw) {
  let code = raw.toUpperCase();
  if (!olc.isValid(code)) return null;
  if (olc.isShort(code)) {
    code = olc.recoverNearest(code, QENA_REF.lat, QENA_REF.lng);
  }
  if (!olc.isFull(code)) return null;
  const area = olc.decode(code);
  return { lat: area.latitudeCenter, lng: area.longitudeCenter };
}

async function main() {
  const dry = process.argv.includes('--dry');
  await sequelize.authenticate();

  const rows = await Service.findAll({
    where: {
      [Op.and]: [
        { [Op.or]: [{ lat: null }, { lng: null }] },
        { address: { [Op.like]: '%+%' } },
      ],
    },
    attributes: ['id', 'name', 'address'],
  });
  console.log(`scanning ${rows.length} services with no lat/lng but '+' in address${dry ? ' (dry-run)' : ''}...`);

  let updated = 0, skipped = 0, badCode = 0;
  const samples = [];
  for (const s of rows) {
    const m = (s.address || '').match(PLUS_CODE_RE);
    if (!m) { skipped++; continue; }
    const decoded = decodeCode(m[1]);
    if (!decoded) { badCode++; continue; }
    // Sanity: قنا governorate roughly between 25.0–27.0 lat, 32.0–33.5 lng
    if (decoded.lat < 24 || decoded.lat > 28 || decoded.lng < 31 || decoded.lng > 34.5) {
      badCode++;
      continue;
    }
    if (samples.length < 5) {
      samples.push(`#${s.id} "${s.name.slice(0, 30)}" → ${decoded.lat.toFixed(5)}, ${decoded.lng.toFixed(5)}  (from ${m[1]})`);
    }
    if (!dry) {
      await Service.update({ lat: decoded.lat, lng: decoded.lng }, { where: { id: s.id } });
    }
    updated++;
  }
  console.log(`\n${dry ? 'WOULD UPDATE' : 'UPDATED'} ${updated} services · skipped ${skipped} · bad code ${badCode}`);
  console.log('samples:');
  samples.forEach((x) => console.log('  ' + x));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });

/**
 * What the renderer knows about each hotlinked listing image.
 *
 * 480 of the 484 listing images live on third-party news sites, and a full
 * sweep found eleven already answering 403 or 404 for good. Nothing here
 * re-hosts a file or edits a row: `image_url` stays exactly as the contributor
 * entered it, and the only thing decided is whether an <img> goes on the page
 * today. A host that starts serving the file again brings its image back on the
 * next sweep, with no intervention.
 *
 * Three things come out of the sweep and all three are used at render time:
 *
 *   • dead — confirmed 403/404/410 on two separate requests. Those images are
 *     not rendered. A timeout or a DNS failure is NOT dead: this runs from one
 *     shared host on one network, and a reader's browser reaches places it
 *     cannot, so an unreachable image still renders. Hiding a picture that
 *     works for the reader is the worse mistake of the two.
 *
 *   • referrer — a few hosts refuse a request carrying a foreign Referer and
 *     serve the same file happily without one. Those get
 *     referrerpolicy="no-referrer" and start working again.
 *
 *   • w/h — the intrinsic size, read from the file header during the sweep.
 *     Real numbers, so the browser can reserve the right box and stop the page
 *     jumping as each image arrives, without cropping or stretching anything.
 *
 * The map refreshes itself: a small batch of the stalest entries is re-probed
 * in the background every twelve hours, which is what keeps this from decaying
 * into a stale list of yesterday's dead links. There is no cron on this account
 * to do it instead.
 */
const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', '..', 'data', 'image-health.json');
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' +
  'Chrome/131.0.0.0 Safari/537.36';
const TIMEOUT_MS = 15_000;
const DEAD_STATUS = new Set([403, 404, 410, 451]);

const RELOAD_MS = 5 * 60 * 1000;
const REFRESH_EVERY_MS = 12 * 60 * 60 * 1000;
const REFRESH_FIRST_MS = 5 * 60 * 1000;
const REFRESH_BATCH = 30;
const REFRESH_CONCURRENCY = 3;
const STALE_MS = 14 * 24 * 60 * 60 * 1000;

let cache = null;
let cacheAt = 0;

/** The map, re-read from disk at most every five minutes. */
function load() {
  const now = Date.now();
  if (cache && now - cacheAt < RELOAD_MS) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (_) {
    // No sweep has run yet, or the file is mid-write. An empty map means every
    // image renders exactly as it did before this existed.
    cache = cache || {};
  }
  cacheAt = now;
  return cache;
}

/**
 * What to do with one image URL.
 *
 * An unknown URL is treated as healthy — a listing added since the last sweep
 * must not have its picture withheld until the next one.
 */
function getHealth(url) {
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return { render: true, w: null, h: null, noReferrer: false };
  }
  const entry = load()[url];
  if (!entry) return { render: true, w: null, h: null, noReferrer: false };
  return {
    render: entry.ok !== false,
    w: entry.w || null,
    h: entry.h || null,
    noReferrer: entry.referrer === 'no-referrer',
  };
}

/* ── Intrinsic size from the file header ────────────────────────────── */

function pngSize(b) {
  if (b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

function gifSize(b) {
  if (b.length < 10 || b.toString('latin1', 0, 3) !== 'GIF') return null;
  return { w: b.readUInt16LE(6), h: b.readUInt16LE(8) };
}

function webpSize(b) {
  if (b.length < 30) return null;
  if (b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') return null;
  const chunk = b.toString('latin1', 12, 16);
  if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = b.readUInt32LE(21);
    return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') {
    return {
      w: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1,
      h: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1,
    };
  }
  return null;
}

/** Walks JPEG segments to the frame header; the size is not at a fixed offset. */
function jpegSize(b) {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const len = b.readUInt16BE(i + 2);
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSof) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
    if (marker === 0xda) return null;
    i += 2 + len;
  }
  return null;
}

function imageSize(buf) {
  return pngSize(buf) || jpegSize(buf) || gifSize(buf) || webpSize(buf);
}

/* ── Probing ────────────────────────────────────────────────────────── */

async function fetchHeader(url, sendReferer) {
  const headers = {
    'User-Agent': UA,
    Accept: 'image/*,*/*;q=0.8',
    // Enough for any header; servers that ignore Range send more and that is
    // still bounded by the timeout.
    Range: 'bytes=0-65535',
  };
  if (sendReferer) headers.Referer = 'https://qinawy.com/';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal, headers, redirect: 'follow' });
    if (res.status !== 200 && res.status !== 206) return { status: res.status, buf: null };
    return { status: res.status, buf: Buffer.from(await res.arrayBuffer()) };
  } catch (err) {
    return { status: err.name === 'AbortError' ? 'timeout' : 'error', buf: null };
  } finally {
    clearTimeout(timer);
  }
}

async function probe(url) {
  let res = await fetchHeader(url, true);
  let referrer = 'origin';

  if (typeof res.status === 'number' && DEAD_STATUS.has(res.status)) {
    const bare = await fetchHeader(url, false);
    if (bare.status === 200 || bare.status === 206) {
      res = bare;
      referrer = 'no-referrer';
    } else {
      // Confirm before condemning: a single refusal can be a rate limit.
      const retry = await fetchHeader(url, true);
      if (retry.status === 200 || retry.status === 206) res = retry;
      else return { ok: false, status: res.status, at: Date.now() };
    }
  }

  if (res.status !== 200 && res.status !== 206) {
    return { ok: true, unknown: true, status: String(res.status), referrer, at: Date.now() };
  }

  const size = res.buf ? imageSize(res.buf) : null;
  return {
    ok: true,
    referrer,
    ...(size && size.w > 0 && size.h > 0 ? { w: size.w, h: size.h } : {}),
    at: Date.now(),
  };
}

/** Probes `urls` with a small concurrency and merges the results into `map`. */
async function probeInto(map, urls, concurrency) {
  const queue = urls.slice();
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      for (;;) {
        const url = queue.shift();
        if (!url) return;
        try {
          map[url] = await probe(url);
        } catch (_) {
          /* leave the previous verdict in place */
        }
      }
    }),
  );
  return map;
}

function save(map) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  // Write then rename, so a reader never sees a half-written file.
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(map, null, 0));
  fs.renameSync(tmp, FILE);
  cache = map;
  cacheAt = Date.now();
}

/**
 * Re-probes the stalest entries in the background.
 *
 * Bounded on purpose: thirty URLs at a time, three at once. This account is
 * capped on tasks rather than processes, and a burst of outbound requests from
 * the web app is exactly the kind of thing that takes every site on it down.
 */
async function refreshStalest(listUrls) {
  const map = load();
  const known = Object.keys(map);
  const urls = typeof listUrls === 'function' ? await listUrls() : known;

  const cutoff = Date.now() - STALE_MS;
  const missing = urls.filter((u) => !map[u]);
  const stale = known
    .filter((u) => urls.includes(u) && (map[u].at ?? 0) < cutoff)
    .sort((a, b) => (map[a].at ?? 0) - (map[b].at ?? 0));

  const batch = [...missing, ...stale].slice(0, REFRESH_BATCH);
  if (batch.length === 0) return 0;

  await probeInto(map, batch, REFRESH_CONCURRENCY);

  // Forget images no longer referenced by any listing.
  const live = new Set(urls);
  for (const key of Object.keys(map)) if (!live.has(key)) delete map[key];

  save(map);
  return batch.length;
}

let started = false;

/**
 * Starts the background refresh. Safe to call more than once.
 *
 * `listUrls` returns the image URLs currently in use; it is injected so this
 * module never reaches for the database itself.
 */
function startRefresher(listUrls, log) {
  if (started) return;
  started = true;
  const tick = () => {
    refreshStalest(listUrls)
      .then((n) => {
        if (n > 0 && log) log(`image health: re-probed ${n} URL(s)`);
      })
      .catch(() => {
        /* never let this take a request down */
      });
  };
  // Not at boot: the first minutes belong to serving requests.
  setTimeout(tick, REFRESH_FIRST_MS).unref?.();
  setInterval(tick, REFRESH_EVERY_MS).unref?.();
}

module.exports = { getHealth, load, save, probe, probeInto, refreshStalest, startRefresher, FILE };

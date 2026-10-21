'use strict';
/**
 * kaios-polyfill.js — preload for the app webview.
 *
 * Runs in the page's main world (contextIsolation:false, sandbox:false) and
 * polyfills every KaiOS / Gecko privileged API that Chromium lacks, based on
 * a scan of 673 real KaiOS app packages (see docs/API-COVERAGE.md):
 *
 *   navigator.mozApps / mozApps.mgmt        apps registry
 *   navigator.mozSetMessageHandler          system messages (alarm/activity/notification)
 *   MozActivity / Activity                  web activities router
 *   navigator.mozTCPSocket / mozUDPSocket   real TCP/UDP via node:net/dgram
 *   navigator.getDeviceStorage (+b2g)       virtual sdcard FS
 *   navigator.mozSettings                   persisted settings store
 *   navigator.mozAlarms / b2g.alarmManager  alarms
 *   Notification / navigator.mozNotification
 *   navigator.volumeManager / mozAudioChannelManager
 *   navigator.spatialNavigationEnabled      arrow-key focus navigation
 *   navigator.vibrate, mozL10n, mozPower, mozTime, mozId, mozContacts,
 *   mozVoicemail, mozMobileConnection, mozTelephony, mozBluetooth,
 *   mozCameras/mozCamera, mozFMRadio, mozNfc, mozNetworkStats,
 *   mozPermissionSettings, mozInputMethod, mozCellBroadcast, mozUsb,
 *   navigator.b2g.* namespace
 *   getKaiAd (KaiAds offline stub), serviceWorker stub, window.open override
 *   KaiOS key translation (F1/F2/Esc/PageUp/PageDown -> SoftLeft/SoftRight/EndCall/Volume*)
 *
 * Two platform generations are supported and selected by the simulator's
 * API mode (工具 ▸ API 模式, src/main/mode.js):
 *   "new"    KaiOS 3.x / 4.x — Store API 3.0, manifest.webmanifest
 *   "legacy" KaiOS 2.5       — Store API 2.0, manifest.webapp,
 *                              navigator.getDeviceStorages() and friends
 * Generation-specific APIs are installed only in the matching mode, because
 * apps use `typeof navigator.X === 'function'` to detect the generation.
 */

/* global window, navigator, document, location, KeyboardEvent, Blob, File */

const { ipcRenderer } = require('electron');
const net = require('node:net');
const tls = require('node:tls');
const dgram = require('node:dgram');
const nodeFs = require('node:fs');
const nodePath = require('node:path');
const nodeOs = require('node:os');
const nodeCrypto = require('node:crypto');

/* The polyfill is injected into the top frame *and* into the Store's remote
 * catalog iframe. Their JS contexts are separate, so every log line says which
 * one it came from — otherwise "0 listener(s)" is impossible to attribute. */
const __KAIOS_IS_SUBFRAME = (() => {
  try { return window.top !== window; } catch (e) { return true; }
})();

const LOG = (...a) => { try { ipcRenderer.send('shell:log', { text: (__KAIOS_IS_SUBFRAME ? '[sub] ' : '') + a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' ') }); } catch (e) {} };

/* App-manager event bus -----------------------------------------------
 * `addEventListener` on the app registry can be reached through four
 * different objects on a real device (the bare `AppsManager` global, the
 * `api.appsmanager` service object, `navigator.mozApps`, and
 * `navigator.mozApps.mgmt`) and the Store uses whichever its bundle resolved.
 * They all feed this one listener table per frame, so a subscription through
 * any of them is honoured by an event emitted through any other.
 *
 * Cross-frame: the install pipeline may run in a different frame than the one
 * that subscribed. Events are therefore reported to the main process, fanned
 * out to every frame, and dispatched again there. The originating frame
 * remembers its event ids and ignores the echo, so nothing fires twice. */
const __kaiosAppsBus = (window.__kaiosAppsBus = window.__kaiosAppsBus || (() => {
  const map = Object.create(null);
  const norm = (t) => String(t == null ? '' : t).toLowerCase();
  return {
    on(type, cb) {
      if (typeof cb !== 'function') return;
      const k = norm(type);
      (map[k] = map[k] || []).push(cb);
      LOG('[kaios-sim] appsmanager subscribe "' + k + '" -> ' + map[k].length + ' listener(s)');
    },
    off(type, cb) {
      const k = norm(type);
      const arr = map[k];
      if (!arr) return;
      const i = arr.indexOf(cb);
      if (i >= 0) arr.splice(i, 1);
    },
    count(type) { return (map[norm(type)] || []).length; },
    emit(type, arg) {
      const k = norm(type);
      const arr = (map[k] || []).slice();
      LOG('[kaios-sim] appsmanager event ' + k + ' -> ' + arr.length + ' listener(s)');
      arr.forEach((cb) => {
        try { cb(arg); } catch (e) { LOG('[kaios-sim] appsmanager listener threw: ' + (e && e.message)); }
      });
      return arr.length;
    },
  };
})());

const __kaiosEchoGuard = new Set();
function __kaiosAppsEvent(type, arg) {
  const id = 'e' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  __kaiosEchoGuard.add(id);
  setTimeout(() => { try { __kaiosEchoGuard.delete(id); } catch (e) {} }, 10000);
  // Dispatch here right away (this frame may be the one holding the listeners)
  // and let the main process reach the other ones.
  try { __kaiosAppsBus.emit(type, arg); } catch (e) {}
  try { ipcRenderer.send('kaios:apps-event', { id, type, arg }); } catch (e) {}
}
try {
  ipcRenderer.on('kaios:apps-event', (e, p) => {
    if (!p || !p.type) return;
    if (p.id && __kaiosEchoGuard.has(p.id)) return; // already dispatched in this frame
    __kaiosAppsBus.emit(p.type, p.arg);
  });
} catch (e) {}


/* global error capture: without this, app JS errors are invisible in the simulator */
try {
  window.addEventListener('error', (e) => {
    LOG('[kaios-sim] window error:', e.message, 'at', (e.filename || '') + ':' + (e.lineno || 0), e.error && e.error.stack ? e.error.stack : '');
  });
  window.addEventListener('unhandledrejection', (e) => {
    LOG('[kaios-sim] unhandled rejection:', e.reason && e.reason.stack ? e.reason.stack : String(e.reason));
  });
} catch (e) {}

/* ------------------------------------------------------------------ */
/* API mode: "new" (KaiOS 3.x / 4.x, Store API 3.0)                    */
/*            "legacy" (KaiOS 2.5, Store API 2.0)                      */
/* ------------------------------------------------------------------ */
/* The two generations expose different Web APIs to apps (and different  */
/* device/UA identities to the store), so the preload has to know which  */
/* one it is *synchronously* — before any API is installed.             */
/* Main process is authoritative (settings.json `apiMode`); if its sync  */
/* channel is unavailable we fall back to sniffing the webview UA,      */
/* which the shell sets from the very same profile.                     */
/* ------------------------------------------------------------------ */
const KAIOS_MODE_INFO = (() => {
  try {
    const r = ipcRenderer.sendSync('mode:get-sync');
    if (r && (r.mode === 'new' || r.mode === 'legacy')) return r;
  } catch (e) { /* no sync IPC (unit test, or a non-app frame) */ }
  const ua = String(navigator.userAgent || '');
  const m = /KAIOS\/(\d+(?:\.\d+)?)/i.exec(ua);
  const legacy = !!m && parseFloat(m[1]) < 3;
  return {
    mode: legacy ? 'legacy' : 'new',
    ua,
    apiVersion: legacy ? '2.0' : '3.0',
    storeApiVersion: legacy ? '2.0' : '3.0',
    osVersion: legacy ? '2.5' : '3.0',
  };
})();
const KAIOS_MODE = KAIOS_MODE_INFO.mode;
const IS_LEGACY = KAIOS_MODE === 'legacy';
// Debug hook: app pages and the smoke tests read which generation the
// simulator is presenting (and with which UA / API version).
try { if (!window.__kaiosMode) window.__kaiosMode = KAIOS_MODE_INFO; } catch (e) {}

/* ------------------------------------------------------------------ */
/* KaiOS Store backend auth (real network, real token)                  */
/* The Store obtains a restricted token from api.kaiostech.com and uses */
/* Hawk HMAC-SHA256 to authenticate every catalog / manifest / package  */
/* request. We fetch a REAL token here: machine identity is faked, but   */
/* the token request and all business-data calls hit the REAL backend   */
/* so the catalog + downloads actually work in the simulator.            */
/* ------------------------------------------------------------------ */
const __KAIOS_STORE_AUTH_KEY = 'baJ_nea27HqSskijhZlT';
const __KAIOS_STORE_APP_ID = 'CAlTn_6yQsgyJKrr-nCh';
let __storeTokenCache = null; // {kid, macKey, accessToken, expiresInSeconds, fetchedAt}
// Disk-backed token cache: reloads and simulator restarts reuse a still-valid
// token instead of re-hitting api.kaiostech.com every time. Re-requesting on
// each boot is what trips the backend's rate-limiting / transient 503s.
const __storeTokenCacheFile = (() => {
  try { return nodePath.join(nodeOs.tmpdir(), 'kaios-sim-store-token.json'); } catch (e) { return null; }
})();
function __loadStoreTokenDisk() {
  if (!__storeTokenCacheFile) return null;
  try {
    const t = JSON.parse(nodeFs.readFileSync(__storeTokenCacheFile, 'utf8'));
    if (t && typeof t.expiresInSeconds === 'number' && typeof t.fetchedAt === 'number') {
      const remaining = t.expiresInSeconds * 1000 - (Date.now() - t.fetchedAt);
      if (remaining > 120000) return t;
    }
  } catch (e) { /* no / stale cache */ }
  return null;
}
function __saveStoreTokenDisk(t) {
  if (!__storeTokenCacheFile) return;
  try { nodeFs.writeFileSync(__storeTokenCacheFile, JSON.stringify(t)); } catch (e) { /* best-effort */ }
}

/* HTTP from the preload. `net` is a MAIN-process-only module: the renderer's
 * require('electron') does not expose it, so requests used to throw
 * "Cannot read properties of undefined (reading 'fetch')". Everything goes
 * through the `kaios-http` IPC handler instead (see src/main/ipc.js), which
 * uses the main process' net.fetch — that also means the session's UA/CORS
 * rules in main.js apply to the store's own backend calls. */
/* Every store-backend call carries the Kai-* device headers: the API routing
 * layer uses them to pick a shard (that is exactly what answers 503 "No server
 * is available to handle this request" when they are absent). */
function __kaiosKaiHeaders() {
  const apiVer = KAIOS_MODE_INFO.storeApiVersion || '3.0';
  const dev = (KAIOS_MODE_INFO.device && KAIOS_MODE_INFO.device.model) ? KAIOS_MODE_INFO.device : null;
  // Same identity the token request sends: a signed catalog URL is bound to it.
  const imei = (dev && (dev.device_id || dev.imei)) || '123456789012345';
  const curef = (dev && (dev.reference || dev.curef)) || '4044O-2BAQUS1-R';
  return {
    'Kai-API-Version': apiVer,
    'Kai-Request-Info': 'ct="wifi", rt="auto", utc="' + Date.now() + '", utc_off="1"',
    'Kai-Device-Info': 'imei="' + imei + '", curef = "' + curef + '"',
  };
}

function __kaiosHttp(url, opts) {
  const o = opts || {};
  const payload = { url, method: o.method || 'GET', headers: o.headers || {} };
  if (o.body != null) {
    payload.bodyBase64 = Buffer.from(
      typeof o.body === 'string' ? o.body : Buffer.from(o.body),
    ).toString('base64');
  }
  return ipcRenderer.invoke('kaios-http', payload).then((r) => {
    if (!r) throw new Error('kaios-http: no response');
    const buf = () => Buffer.from(r.bodyBase64 || '', 'base64');
    return {
      ok: !!r.ok,
      status: r.status,
      headers: r.headers || {},
      text: () => Promise.resolve(buf().toString('utf8')),
      json: () => Promise.resolve(JSON.parse(buf().toString('utf8'))),
      arrayBuffer: () => Promise.resolve(
        buf().buffer.slice(buf().byteOffset, buf().byteOffset + buf().byteLength),
      ),
    };
  });
}

// One token request. Throws a plain Error for non-retryable failures
// (4xx / malformed body) and an Error with `.retryable = true` for
// transient ones (5xx / 429 / network) so the caller can back off and retry.
function __fetchStoreTokenOnce(tokenUrl, headers, deviceBody) {
  return __kaiosHttp(tokenUrl, { method: 'POST', headers, body: deviceBody })
    .then((res) => res.text().then((raw) => ({ res, raw })))
    .then(({ res, raw }) => {
      const status = res.status;
      if (!res.ok) {
        const retryable = (status >= 500 || status === 429);
        let detail = '';
        if (!retryable) {
          try { const j = JSON.parse(raw); if (j && j.message) detail = ' (' + j.message + ')'; } catch (e) { /* non-JSON */ }
        }
        const e = new Error('token endpoint returned HTTP ' + status + detail + (retryable ? ' — will retry' : ''));
        e.status = status; e.retryable = retryable;
        throw e;
      }
      let tok = null;
      try {
        tok = JSON.parse(raw);
      } catch (e) {
        // A non-JSON body is almost always an HTML error page from a CDN /
        // proxy in front of the backend. Report it verbatim: the raw text is
        // the only clue about what actually answered.
        throw new Error('token endpoint returned HTTP ' + status + ' ' +
          (res.headers['content-type'] || res.headers['Content-Type'] || '?') +
          ' instead of JSON: ' + String(raw).slice(0, 300).replace(/\s+/g, ' '));
      }
      const cache = {
        kid: tok.kid,
        macKey: tok.mac_key, // base64 — Hawk signs with the raw (decoded) key
        accessToken: tok.access_token,
        expiresInSeconds: (tok.exp - tok.iat) || 3600,
        fetchedAt: Date.now(),
      };
      __storeTokenCache = cache;
      __saveStoreTokenDisk(cache);
      LOG('[kaios-sim] store token fetched: kid=' + tok.kid);
      return cache;
    });
}

const __STORE_TOKEN_MAX_ATTEMPTS = 3;
function __kaiosStoreToken() {
  if (__storeTokenCache) {
    const remaining = __storeTokenCache.expiresInSeconds * 1000 - (Date.now() - __storeTokenCache.fetchedAt);
    if (remaining > 120000) return Promise.resolve(__storeTokenCache);
  }
  // Reuse a still-valid token shared across reloads / restarts on disk.
  const disk = __loadStoreTokenDisk();
  if (disk) { __storeTokenCache = disk; return Promise.resolve(disk); }
  LOG('[kaios-sim] store token: requesting from api.kaiostech.com (' + KAIOS_MODE + ') ...');
  // Device identity follows the selected generation: the store answers with
  // a catalog built for that OS/API version (see src/main/mode.js).
  const device = (KAIOS_MODE_INFO.device && KAIOS_MODE_INFO.device.model) ? {
    brand: KAIOS_MODE_INFO.device.brand,
    device_id: KAIOS_MODE_INFO.device.device_id,
    device_type: KAIOS_MODE_INFO.device.device_type,
    model: KAIOS_MODE_INFO.device.model,
    os: KAIOS_MODE_INFO.device.os,
    os_version: KAIOS_MODE_INFO.device.os_version,
    reference: KAIOS_MODE_INFO.device.reference,
  } : {
    brand: 'Nokia',
    device_id: '123456789012345',
    device_type: 999999,
    model: '2780 Flip',
    os: 'KaiOS',
    os_version: '3.1',
    reference: '4044O-2BAQUS1-R',
  };
  const apiVer = KAIOS_MODE_INFO.storeApiVersion || '3.0';
  const headers = Object.assign({ 'Content-Type': 'application/json' }, __kaiosKaiHeaders(),
    { Authorization: 'Key ' + __KAIOS_STORE_AUTH_KEY });
  const tokenUrl = 'https://api.kaiostech.com/v' + apiVer + '/applications/' + __KAIOS_STORE_APP_ID + '/tokens';
  const deviceBody = JSON.stringify(device);
  let attemptNo = 0;
  const run = () => __fetchStoreTokenOnce(tokenUrl, headers, deviceBody).catch((err) => {
    const retryable = err.retryable ||
      /no response|network|ECONN|ETIMEDOUT|ENOTFOUND|timeout/i.test(err.message || '');
    if (retryable && attemptNo < __STORE_TOKEN_MAX_ATTEMPTS - 1) {
      attemptNo++;
      const delay = 600 * attemptNo * attemptNo; // 600ms, then 2400ms
      LOG('[kaios-sim] store token fetch failed (HTTP ' + (err.status || '?') +
        '), retry ' + attemptNo + '/' + (__STORE_TOKEN_MAX_ATTEMPTS - 1) + ' in ' + delay + 'ms');
      return new Promise((r) => setTimeout(r, delay)).then(run);
    }
    LOG('[kaios-sim] store token fetch FAILED: ' + (err && err.message));
    throw err;
  });
  return run();
}

// Hawk HMAC-SHA256 header (no payload hash — used for GET manifest/package).
function __kaiosHawk(url, method, tok) {
  const u = new URL(url);
  const ts = Math.floor(Date.now() / 1000);
  const nonce = nodeCrypto.randomBytes(6).toString('hex').slice(0, 12);
  const norm =
    'hawk.1.header\n' + ts + '\n' + nonce + '\n' +
    method.toUpperCase() + '\n' + (u.pathname + u.search) + '\n' +
    u.hostname + '\n' + (u.port || 443) + '\n' + '\n' + '\n';
  const mac = nodeCrypto
    .createHmac('sha256', Buffer.from(tok.macKey, 'base64'))
    .update(norm)
    .digest('base64');
  return 'Hawk id="' + tok.kid + '", ts="' + ts + '", nonce="' + nonce + '", mac="' + mac + '"';
}

// Resolve an (possibly relative) KaiOS backend URL against the API host.
function __kaiosAbsUrl(maybeUrl) {
  const u = String(maybeUrl == null ? '' : maybeUrl).trim();
  if (/^https?:\/\//i.test(u)) return u;
  // Protocol-relative ("//cdn.host/x") must keep its scheme, not gain a host.
  if (u.slice(0, 2) === '//') return 'https:' + u;
  return 'https://api.kaiostech.com' + (u.charAt(0) === '/' ? '' : '/') + u;
}

/* ------------------------------------------------------------------ */
/* fake device profile (machine data)                                  */
/* ------------------------------------------------------------------ */
/* The simulator has no real KaiOS hardware, so it presents apps with a */
/* consistent, plausible device identity: model, IMEI, ICCID, MSISDN,   */
/* radio/SIM state, etc. Business data (weather, location, web content) */
/* is NOT faked — it flows over the REAL network via unmodified         */
/* fetch()/XHR. Apps read machine data through navigator.b2g            */
/* .mobileConnections, navigator.b2g.iccManager, navigator             */
/* .mozMobileConnection/mozIccManager and window.deviceInfos.get().      */

function _randDigits(n) {
  let s = '';
  for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
  return s;
}
function _luhnCheckDigit(base) {
  // base = digits excluding the check digit; returns the Luhn check digit (0-9).
  // Doubling starts at the rightmost base digit (the digit immediately left of
  // the check position), matching the standard account-number Luhn test.
  let sum = 0, alt = true;
  for (let i = base.length - 1; i >= 0; i--) {
    let d = +base[i];
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}
function _genImei() {
  // Real-looking Nokia TAC + random serial + Luhn check digit (15 digits)
  const base = '357785' + _randDigits(8);
  return base + _luhnCheckDigit(base);
}
function _genIccid() {
  // E.118: 89 (SIM) + issuer + serial + Luhn check (19 digits)
  const base = '898600' + _randDigits(12);
  return base + _luhnCheckDigit(base);
}

const FAKE_DEVICE = {
  // identity
  os: 'KaiOS 3.0.1',
  software: 'KaiOS 3.0.1',
  hardware: 'KaiOS',
  productModel: 'Nokia 8110 4G',
  device: 'AMBER',
  brand: 'Nokia',
  manufacturer: 'HMD Global',
  version: '15.00.17.02',
  platformVersion: '48.0',
  firmwareRevision: 'KaiOS 3.0.1',
  series: 'Nokia',
  // capabilities
  telephony: true,
  cdma: false,
  isOnline: true,
  rilDataDefaultServiceId: 0,
  // localization
  languageCurrent: 'en-US',
  languageDefault: 'en-US',
  timezone: 'UTC',
  // screen
  screenType: 'lcd',
  // identifiers (well-formed but fake)
  imei: _genImei(),
  imei2: _genImei(),
  iccid: _genIccid(),
  meid: '',
  msisdn: '+10000000000',
  imsi: '001010' + _randDigits(9),
};

// The selected API mode can override the identity fields (OS version, model,
// brand, firmware…). Everything else — IMEI/ICCID/MSISDN and the capability
// flags — stays the same across generations.
if (KAIOS_MODE_INFO.deviceinfo) {
  Object.assign(FAKE_DEVICE, KAIOS_MODE_INFO.deviceinfo);
}

// window.deviceInfos.get(key) -> KaiOS DeviceInfo service values. Unknown
// keys resolve to '' so string concatenations degrade gracefully.
const DEVICEINFO_MAP = {
  'deviceinfo.os': FAKE_DEVICE.os,
  'deviceinfo.software': FAKE_DEVICE.software,
  'deviceinfo.hardware': FAKE_DEVICE.hardware,
  'deviceinfo.product_model': FAKE_DEVICE.productModel,
  'deviceinfo.product': FAKE_DEVICE.productModel,
  'deviceinfo.device': FAKE_DEVICE.device,
  'deviceinfo.brand': FAKE_DEVICE.brand,
  'deviceinfo.manufacturer': FAKE_DEVICE.manufacturer,
  'deviceinfo.version': FAKE_DEVICE.version,
  'deviceinfo.platform_version': FAKE_DEVICE.platformVersion,
  'deviceinfo.firmware_revision': FAKE_DEVICE.firmwareRevision,
  'deviceinfo.firmware_version': FAKE_DEVICE.firmwareRevision,
  'deviceinfo.series': FAKE_DEVICE.series,
  'deviceinfo.telephony': FAKE_DEVICE.telephony,
  'deviceinfo.cdma': FAKE_DEVICE.cdma,
  'deviceinfo.isOnline': FAKE_DEVICE.isOnline,
  'ril.data.defaultServiceId': FAKE_DEVICE.rilDataDefaultServiceId,
  'deviceinfo.language.current': FAKE_DEVICE.languageCurrent,
  'deviceinfo.language.default': FAKE_DEVICE.languageDefault,
  'deviceinfo.timezone': FAKE_DEVICE.timezone,
  'deviceinfo.screen.type': FAKE_DEVICE.screenType,
  'deviceinfo.imei': FAKE_DEVICE.imei,
};

function _fakeNetwork() {
  return {
    mcc: '001', mnc: '01',
    shortName: 'KaiOS Sim', longName: 'KaiOS Simulator',
    state: 'registered',
  };
}
function _fakeIcc(id) {
  const net = _fakeNetwork();
  return {
    iccid: id,
    cardState: 'ready',
    msisdn: FAKE_DEVICE.msisdn,
    imsi: FAKE_DEVICE.imsi,
    spn: 'KaiOS Sim',
    network: net,
    iccInfo: {
      iccid: id, mcc: '001', mnc: '01', spn: 'KaiOS Sim', msisdn: FAKE_DEVICE.msisdn,
    },
    addEventListener() {}, removeEventListener() {},
  };
}
function _fakeMobileConnection(idx) {
  const iccid = FAKE_DEVICE.iccid;
  const imei = idx === 0 ? FAKE_DEVICE.imei : FAKE_DEVICE.imei2;
  const net = _fakeNetwork();
  return {
    iccId: iccid,
    radioState: 'enabled',
    emergencyCallsOnly: false,
    lastKnownNetwork: '001001',
    lastKnownHomeNetwork: '001001',
    voice: {
      connected: true, emergencyCallsOnly: false, roaming: false,
      signalStrength: 4, relSignalStrength: 80, cardState: 'ready',
      network: net, cell: null,
    },
    data: {
      connected: true, emergencyCallsOnly: false, roaming: false, type: 'lte',
      signalStrength: 4, relSignalStrength: 80, network: net,
    },
    deviceIdentities: { imei: imei, meid: FAKE_DEVICE.meid, iccId: iccid },
    connection: { type: 'wifi' },
    getDeviceIdentities() { return Promise.resolve({ imei: imei, meid: FAKE_DEVICE.meid, iccId: iccid }); },
    addEventListener() {}, removeEventListener() {},
  };
}

LOG('[kaios-sim] fake device profile:', FAKE_DEVICE.productModel, '/ IMEI', FAKE_DEVICE.imei, '/ ICCID', FAKE_DEVICE.iccid);

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function defNav(name, value) {
  try {
    Object.defineProperty(Navigator.prototype, name, {
      value, configurable: true, writable: true, enumerable: false,
    });
  } catch (e) { /* ignore */ }
}

function defGlobal(name, value) {
  try {
    // Only define when absent: these are fallbacks that a real SDK script
    // (loaded later) is allowed to replace.
    if (!(name in window)) {
      Object.defineProperty(window, name, { value, configurable: true, writable: true });
    }
  } catch (e) { /* ignore */ }
}

/** Gecko-style DOMRequest (onsuccess/onerror + result/error). */
function makeRequest(opts) {
  const once = !opts || opts.once !== false;
  const req = {
    readyState: 'pending', result: null, error: null, onsuccess: null, onerror: null,
  };
  let fired = false;
  req._fire = (ok, value) => {
    if (once && fired) return;
    fired = true;
    if (ok) {
      req.result = value;
      if (typeof req.onsuccess === 'function') {
        try { req.onsuccess({ target: req, type: 'success', request: req }); } catch (e) { console.error(e); }
      }
    } else {
      req.error = value;
      if (typeof req.onerror === 'function') {
        try { req.onerror({ target: req, type: 'error', request: req }); } catch (e) { console.error(e); }
      }
    }
  };
  req._ok = (v) => setTimeout(() => req._fire(true, v), 0);
  req._fail = (e) => setTimeout(() => req._fire(false, e), 0);
  return req;
}

function stubOk(value) { const r = makeRequest(); r._ok(value); return r; }
function stubFail(msg) { const r = makeRequest(); r._fail({ name: 'Error', message: msg }); return r; }

const APP_ID = (() => {
  try { return location.protocol === 'app:' ? decodeURIComponent(location.hostname) : null; }
  catch (e) { return null; }
})();

/* ------------------------------------------------------------------ */
/* navigator.mozApps                                                   */
/* ------------------------------------------------------------------ */

function appObject(rec) {
  if (!rec) return null;
  return {
    manifest: {
      name: rec.name, short_name: rec.shortName || rec.name, version: rec.version,
      description: rec.description, developer: rec.developer ? { name: rec.developer } : undefined,
      type: rec.type, icons: rec.icons, start_url: rec.startUrl, origin: rec.origin,
    },
    launch() { ipcRenderer.send('kaios-launch-app', rec.id); return Promise.resolve(); },
    uninstall() { return ipcRenderer.invoke('apps:uninstall', rec.id); },
    checkForUpdate() { return Promise.resolve(null); },
    getManifest() { return this.manifest; },
  };
}

const appsMgr = {
  mgmt: null,
  getSelf() {
    const r = makeRequest();
    ipcRenderer.invoke('apps:self').then((rec) => r._ok(appObject(rec)));
    return r;
  },
  getAll() {
    const r = makeRequest();
    ipcRenderer.invoke('apps:list').then((list) => r._ok(list.map(appObject)));
    return r;
  },
  install(url) {
    const r = makeRequest();
    ipcRenderer.invoke('kaios-install-url', String(url)).then((res) => {
      if (res && res.ok) r._ok(appObject(res.app));
      else r._fail({ name: 'InstallError', message: (res && res.error) || 'remote install not supported in simulator' });
    });
    return r;
  },
  uninstall(app) { return ipcRenderer.invoke('apps:uninstall', app && (app.manifestURL || app.manifest && app.manifest.name)); },
  getLocalizationResource(id, ver, p, type) {
    // No langpack system in the simulator: fail so bundled l10n.js falls back
    // to the app's own .properties files.
    return stubFail({ name: 'NotFoundError', message: 'no localization resource' });
  },
  getAdditionalLanguages() { return Promise.resolve([]); },
  // The Store sometimes subscribes through navigator.mozApps(.mgmt) instead of
  // the bare AppsManager global — feed the same listener table.
  addEventListener(type, cb) { __kaiosAppsBus.on(type, cb); },
  removeEventListener(type, cb) { __kaiosAppsBus.off(type, cb); },
};
appsMgr.mgmt = appsMgr; // mozApps.mgmt.getAll() etc.
defNav('mozApps', appsMgr);

/* ------------------------------------------------------------------ */
/* navigator.mozSetMessageHandler + message bus                        */
/* ------------------------------------------------------------------ */

const messageHandlers = new Map();
defNav('mozSetMessageHandler', (type, cb) => {
  messageHandlers.set(type, cb);
  ipcRenderer.send('kaios-register-handler', { type, active: true });
});

ipcRenderer.on('kaios-message', (e, msg) => {
  const cb = messageHandlers.get(msg.type);
  if (cb) {
    try { cb(msg.message !== undefined ? msg.message : msg); }
    catch (err) { console.error(err); }
  }
});

/* ------------------------------------------------------------------ */
/* WebActivity / MozActivity / Activity                                */
/* ------------------------------------------------------------------ */
/*
 * KaiOS ships BOTH constructor shapes:
 *   new MozActivity({name, data})            — Gecko legacy object form
 *   new WebActivity(name, data)              — KaiOS positional form
 * The KaiOS Store (v3.0 bundle) only uses WebActivity, and in BOTH
 * shapes interchangeably. The constructor accepts either.
 *
 * Promise semantics (verified against the store bundle's own handlers):
 *   resolve value  = the raw activity result, carrying a non-enumerable
 *                    `target` back-reference to the activity, so both
 *                    `.then(r => r.field)` (legacy) and
 *                    `.then(e => e.target.result)` (KaiOS) work.
 *   reject value   = the Error itself, with `target` attached and
 *                    `activity.error` set, so `.catch(e => e.message)`
 *                    (legacy) and `.catch(e => e.target.error.name)`
 *                    (KaiOS) both work.
 */
class KaiActivity {
  constructor(nameOrOptions, data) {
    const options = (typeof nameOrOptions === 'string')
      ? { name: nameOrOptions, data: data || {} }
      : (nameOrOptions || {});
    this.name = options.name;
    this.data = options.data || {};
    this.onsuccess = null;
    this.onerror = null;
    this.result = null;
    this.error = null;
    this._done = false;
  }
  start() { return this._start(); }
  _start() {
    return ipcRenderer.invoke('kaios-activity', { name: this.name, data: this.data }).then((result) => {
      if (result && result.__pick) {
        // 'pick' activity: open a host file chooser and resolve with a File.
        return ipcRenderer.invoke('pick-file', (this.data && this.data.type) || '').then((picked) => {
          if (picked && picked.canceled) throw new Error('pick canceled');
          const buf = Uint8Array.from(atob(picked.base64), (c) => c.charCodeAt(0));
          const file = new File([buf], picked.name, { type: picked.type || 'application/octet-stream' });
          const res = { blob: file, name: picked.name, type: picked.type, size: picked.size };
          this._resolveValue(res);
          this._succeed(res);
          return res;
        });
      }
      if (result && result.error) throw this._makeError(result);
      if (result && result.__file) {
        const buf = Uint8Array.from(atob(result.base64), (c) => c.charCodeAt(0));
        result.blob = new File([buf], result.name, { type: result.type || 'application/octet-stream' });
        delete result.__file; delete result.base64;
      }
      this._resolveValue(result);
      this._succeed(result);
      return result;
    }).catch((err) => {
      this.error = err;
      this._fail(err);
      // KaiOS rejects with an event-like value (e.target === activity);
      // keep the Error identity for legacy .catch(e => e.message) callers.
      try { Object.defineProperty(err, 'target', { value: this, configurable: true }); } catch (e) { /* frozen */ }
      throw err;
    });
  }
  _makeError(result) {
    const err = new Error(String(result.error || 'activity error'));
    if (result.errorName) err.name = String(result.errorName);
    return err;
  }
  _resolveValue(r) {
    this.result = r;
    // Attach the KaiOS event shape without disturbing the raw result:
    // non-enumerable so JSON.stringify / spread / array methods are safe.
    if (r && typeof r === 'object') {
      try {
        Object.defineProperty(r, 'target', { value: this, configurable: true, enumerable: false });
      } catch (e) { /* frozen */ }
    }
    return r;
  }
  _succeed(r) {
    if (this._done) return;
    this.result = r;
    this._done = true;
    if (typeof this.onsuccess === 'function') this.onsuccess({ target: this, type: 'success', result: r });
  }
  _fail(e) {
    if (this._done) return;
    this.error = e;
    this._done = true;
    if (typeof this.onerror === 'function') this.onerror({ target: this, type: 'error', error: e });
  }
  postResult(result) {
    return ipcRenderer.invoke('kaios-activity-result', { name: this.name, result });
  }
  cancel() {}
}
defGlobal('MozActivity', KaiActivity);
defGlobal('WebActivity', KaiActivity);
defGlobal('Activity', KaiActivity);

/* ------------------------------------------------------------------ */
/* navigator.mozSettings                                               */
/* ------------------------------------------------------------------ */

const settingsObservers = [];
let settingsObsId = 1;

const settingsLock = {
  get(keys) {
    const r = makeRequest();
    ipcRenderer.invoke('settings:get', keys).then((res) => r._ok(res));
    return r;
  },
  set(obj) {
    const r = makeRequest();
    ipcRenderer.invoke('settings:set', obj).then(() => {
      for (const name of Object.keys(obj || {})) {
        for (const o of settingsObservers) {
          if (o.name === name) { try { o.cb({ settingName: name, settingValue: obj[name] }); } catch (e) {} }
        }
      }
      r._ok(true);
    });
    return r;
  },
  addObserver(name, cb) { const id = settingsObsId++; settingsObservers.push({ id, name, cb }); return id; },
  removeObserver(id) { const i = settingsObservers.findIndex((o) => o.id === id); if (i >= 0) settingsObservers.splice(i, 1); },
};

const mozSettings = {
  createLock: () => settingsLock,
  addObserver(name, cb) { return settingsLock.addObserver(name, cb); },
  removeObserver(id) { return settingsLock.removeObserver(id); },
};
defNav('mozSettings', mozSettings);
defGlobal('SettingsListener', {
  observe(name, cb) { return settingsLock.addObserver(name, cb); },
  unobserve(id) { return settingsLock.removeObserver(id); },
});

/* ------------------------------------------------------------------ */
/* navigator.mozAlarms + navigator.b2g.alarmManager                    */
/* ------------------------------------------------------------------ */

const alarms = new Map();
let alarmId = 1;

function fireAlarm(rec) {
  const h = messageHandlers.get('alarm');
  if (h) { try { h({ id: rec.id, data: rec.data }); } catch (e) {} }
  showSimNotification({ title: (rec.data && rec.data.title) || '闹钟', body: (rec.data && rec.data.body) || '', tag: 'alarm-' + rec.id });
}

const mozAlarms = {
  getAll() { const r = makeRequest(); r._ok([...alarms.values()]); return r; },
  add(time, honorTimezone, data) {
    const r = makeRequest();
    const date = time instanceof Date ? time : new Date(time);
    const id = alarmId++;
    const rec = { id, date, honorTimezone: !!honorTimezone, ignoreTimezone: !honorTimezone, data };
    alarms.set(id, rec);
    const delay = Math.max(0, date.getTime() - Date.now());
    setTimeout(() => { alarms.delete(id); fireAlarm(rec); }, Math.min(delay, 0x7fffffff));
    r._ok({ id });
    return r;
  },
  remove(id) { const r = makeRequest(); alarms.delete(id); r._ok(true); return r; },
};
defNav('mozAlarms', mozAlarms);

const b2gAlarmManager = {
  getAll() { return Promise.resolve([...alarms.values()]); },
  add(a) {
    a = a || {};
    return new Promise((resolve) => {
      const req = mozAlarms.add(a.date instanceof Date ? a.date : new Date(a.date), !a.ignoreTimezone, a.data);
      req.onsuccess = (e) => {
        const id = e.target.result.id;
        resolve({ id, date: a.date, data: a.data, ignoreTimezone: !!a.ignoreTimezone });
      };
    });
  },
  remove(id) { alarms.delete(id); return Promise.resolve(); },
};

/* ------------------------------------------------------------------ */
/* Notification / navigator.mozNotification                            */
/* ------------------------------------------------------------------ */

const liveNotifications = [];

function showSimNotification(opts) {
  ipcRenderer.send('notify', {
    title: opts.title || '', body: opts.body || opts.description || '',
    icon: opts.icon || null, tag: opts.tag || null,
  });
}

class KaiNotification extends EventTarget {
  constructor(title, options) {
    super();
    options = options || {};
    this.title = title == null ? '' : String(title);
    this.body = options.body != null ? String(options.body) : '';
    this.tag = options.tag != null ? String(options.tag) : '';
    this.icon = options.icon || '';
    this.lang = options.lang || '';
    this.dir = options.dir || 'auto';
    this.closed = false;
    this.onclick = null; this.onclose = null; this.onshow = null; this.onerror = null;
  }
  static create(title, desc, opts) {
    return new KaiNotification(title, Object.assign({}, opts, { body: desc }));
  }
  static requestPermission(cb) {
    if (cb) setTimeout(() => cb('granted'), 0);
    return Promise.resolve('granted');
  }
  show() {
    this.closed = false;
    liveNotifications.push(this);
    showSimNotification(this);
    if (typeof this.onshow === 'function') setTimeout(() => this.onshow({ target: this }), 0);
    return this;
  }
  close() {
    const i = liveNotifications.indexOf(this);
    if (i >= 0) liveNotifications.splice(i, 1);
    if (this.closed) return;
    this.closed = true;
    if (typeof this.onclose === 'function') { try { this.onclose({ target: this }); } catch (e) {} }
  }
}
KaiNotification.permission = 'granted';
defGlobal('Notification', KaiNotification);
defNav('mozNotification', {
  createNotification(title, desc, icon, tag) { return new KaiNotification(title, { body: desc, icon, tag }); },
});

ipcRenderer.on('kaios-notif-click', (e, payload) => {
  const tag = payload && payload.tag;
  for (const n of liveNotifications) {
    if (!tag || !n.tag || n.tag === tag) {
      if (typeof n.onclick === 'function') { try { n.onclick({ target: n }); } catch (err) {} }
      break;
    }
  }
});

/* ------------------------------------------------------------------ */
/* navigator.mozTCPSocket (real TCP via node:net)                      */
/* ------------------------------------------------------------------ */

function toBuffer(data) {
  if (typeof data === 'string') return Buffer.from(data, 'binary');
  if (Buffer.isBuffer(data)) return data;
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  return Buffer.from(String(data));
}

function toWire(buf, binaryType) {
  if (binaryType === 'arraybuffer') return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return buf.toString('binary');
}

function wrapTcpSocket(rawSock, binaryType) {
  const sock = {
    binaryType: binaryType || 'string',
    bufferedAmount: 0,
    onopen: null, onerror: null, onclose: null, ondata: null, ondrain: null,
  };
  sock.send = (data) => {
    try {
      const b = toBuffer(data);
      sock.bufferedAmount += b.length;
      rawSock.write(b);
    } catch (e) { /* ignore */ }
  };
  sock.close = () => { try { rawSock.destroy(); } catch (e) {} };
  sock.suspend = () => rawSock.pause();
  sock.resume = () => rawSock.resume();
  sock.up = () => {};
  rawSock.on('connect', () => sock.onopen && sock.onopen({ target: sock }));
  rawSock.on('data', (chunk) => {
    sock.bufferedAmount = Math.max(0, rawSock.writableLength);
    if (sock.ondata) sock.ondata({ target: sock, data: toWire(chunk, sock.binaryType) });
  });
  rawSock.on('error', (err) => sock.onerror && sock.onerror({ target: sock, error: err, name: err.code || 'error' }));
  rawSock.on('close', () => sock.onclose && sock.onclose({ target: sock }));
  rawSock.on('drain', () => sock.ondrain && sock.ondrain({ target: sock }));
  rawSock.setNoDelay(true);
  return sock;
}

const mozTCPSocket = {
  open(host, port, options) {
    options = options || {};
    let raw;
    if (options.useSecureTransport) {
      raw = tls.connect({ host, port, rejectUnauthorized: false });
    } else {
      raw = net.connect({ host, port });
    }
    return wrapTcpSocket(raw, options.binaryType);
  },
  listen(port, options, backlog) {
    options = options || {};
    const server = net.createServer((conn) => {
      const sock = wrapTcpSocket(conn, options.binaryType);
      if (srv.onconnect) srv.onconnect({ target: srv, socket: sock });
    });
    const srv = {
      onconnect: null, onerror: null,
      binaryType: options.binaryType || 'string',
      close() { try { server.close(); } catch (e) {} },
    };
    server.on('error', (err) => srv.onerror && srv.onerror({ target: srv, error: err }));
    server.listen(port);
    return srv;
  },
};
defNav('mozTCPSocket', mozTCPSocket);
defGlobal('TCPSocket', mozTCPSocket);

const mozUDPSocket = {
  create(options) {
    options = options || {};
    const type = options.type === 'udp6' ? 'udp6' : 'udp4';
    const raw = dgram.createSocket({ type });
    const sock = {
      binaryType: options.binaryType || 'string',
      localAddress: null, localPort: null,
      onmessage: null, onerror: null, onopen: null, onclose: null, onbound: null,
      send(data, addr, port) { try { raw.send(toBuffer(data), port, addr); } catch (e) {} },
      close() { try { raw.close(); } catch (e) {} },
      joinMulticastGroup(addr) { try { raw.addMembership(addr); } catch (e) {} },
      leaveMulticastGroup(addr) { try { raw.dropMembership(addr); } catch (e) {} },
    };
    raw.on('message', (msg, rinfo) => {
      if (sock.onmessage) sock.onmessage({ target: sock, data: toWire(msg, sock.binaryType), remoteAddress: rinfo.address, remotePort: rinfo.port });
    });
    raw.on('error', (err) => sock.onerror && sock.onerror({ target: sock, error: err }));
    raw.on('close', () => sock.onclose && sock.onclose({ target: sock }));
    raw.bind(options.localPort || 0, options.localAddress, () => {
      try { sock.localAddress = raw.address().address; sock.localPort = raw.address().port; } catch (e) {}
      if (sock.onbound) sock.onbound({ target: sock });
    });
    return sock;
  },
};
defNav('mozUDPSocket', mozUDPSocket);

/* ------------------------------------------------------------------ */
/* navigator.getDeviceStorage / navigator.b2g.getDeviceStorage         */
/* ------------------------------------------------------------------ */

const MIME_BY_EXT = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.bmp': 'image/bmp', '.ico': 'image/x-icon',
  '.txt': 'text/plain', '.json': 'application/json', '.xml': 'text/xml', '.html': 'text/html',
  '.pdf': 'application/pdf', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav',
  '.m4a': 'audio/mp4', '.mp4': 'video/mp4', '.webm': 'video/webm', '.3gp': 'video/3gpp',
  '.opml': 'text/x-opml', '.csv': 'text/csv', '.ics': 'text/calendar',
};

function mimeFromName(name) {
  return MIME_BY_EXT[nodePath.extname(String(name)).toLowerCase()] || 'application/octet-stream';
}

function normalizeRel(p) {
  let rel = String(p || '').replace(/\\/g, '/');
  if (rel.startsWith('/')) rel = rel.slice(1);
  return rel;
}

function walkFiles(dir, out) {
  out = out || [];
  let entries;
  try { entries = nodeFs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const abs = nodePath.join(dir, e.name);
    if (e.isDirectory()) walkFiles(abs, out);
    else out.push(abs);
  }
  return out;
}

let STORAGE_ROOT = null;
function ensureStorageRoot() {
  if (STORAGE_ROOT) return Promise.resolve(STORAGE_ROOT);
  return ipcRenderer.invoke('storage:path', '__root__').then((p) => {
    // main returns the per-app storage root (<apps>/<id>/storage) for '__root__'.
    STORAGE_ROOT = p;
    return STORAGE_ROOT;
  });
}

const storageChangeListeners = [];
function fireStorageChange(kind) {
  for (const cb of storageChangeListeners) {
    try { cb({ target: { storageName: kind }, type: 'change' }); } catch (e) {}
  }
}

function makeFileFromDisk(absPath) {
  const buf = nodeFs.readFileSync(absPath);
  const name = nodePath.basename(absPath);
  return new File([buf], name, { type: mimeFromName(name) });
}

function getDeviceStorage(type) {
  const storageName = type || 'sdcard';
  return {
    storageName,
    available() { const r = makeRequest(); r._ok('available'); return r; },
    freeSpace() { const r = makeRequest(); r._ok(512 * 1024 * 1024); return r; },
    get(p) {
      const r = makeRequest();
      ensureStorageRoot().then((root) => {
        const abs = nodePath.join(root, storageName, normalizeRel(p));
        try {
          if (nodeFs.existsSync(abs) && nodeFs.statSync(abs).isFile()) r._ok(makeFileFromDisk(abs));
          else r._fail({ name: 'NotFoundError', message: 'File not found: ' + p });
        } catch (e) { r._fail({ name: 'NotFoundError', message: String(e) }); }
      });
      return r;
    },
    addNamed(blob, name) {
      const r = makeRequest();
      ensureStorageRoot().then((root) => {
        const abs = nodePath.join(root, storageName, normalizeRel(name));
        nodeFs.mkdirSync(nodePath.dirname(abs), { recursive: true });
        blob.arrayBuffer().then((ab) => {
          nodeFs.writeFileSync(abs, Buffer.from(ab));
          fireStorageChange(storageName);
          r._ok(name);
        }).catch((e) => r._fail({ name: 'Error', message: String(e) }));
      });
      return r;
    },
    delete(p) {
      const r = makeRequest();
      ensureStorageRoot().then((root) => {
        const abs = nodePath.join(root, storageName, normalizeRel(p));
        try { nodeFs.unlinkSync(abs); fireStorageChange(storageName); r._ok(true); }
        catch (e) { r._fail({ name: 'NotFoundError', message: String(e) }); }
      });
      return r;
    },
    enumerate() {
      const r = makeRequest({ once: false });
      ensureStorageRoot().then((root) => {
        const base = nodePath.join(root, storageName);
        const files = walkFiles(base);
        let idx = 0;
        const cursor = { result: null, continue() { step(); } };
        function step() {
          if (idx < files.length) { cursor.result = makeFileFromDisk(files[idx]); idx += 1; }
          else { cursor.result = null; }
          r._fire(true, cursor);
        }
        step();
      });
      return r;
    },
    addEventListener(type, cb) {
      if (type === 'change') storageChangeListeners.push(cb);
    },
    removeEventListener() {},
  };
}
// NOTE: only the SINGULAR form stays on navigator (KaiOS 2.5-era apps and
// try/catch probes use it). The PLURAL navigator.getDeviceStorages is
// deliberately NOT defined: KaiOS 3.0 removed it, and many apps detect the
// KaiOS generation with `typeof navigator.getDeviceStorages === 'function'
// ? 2 : navigator.b2g ? 3 : null` — defining it would make them take the
// pre-3.0 code path (e.g. NES Emulator reading ./roms/ inside the package).
defNav('getDeviceStorage', getDeviceStorage);

/* ------------------------------------------------------------------ */
/* volumeManager / mozAudioChannelManager                              */
/* ------------------------------------------------------------------ */

const volumeManager = {
  channel: 'content',
  _volume: 0.6,
  get volume() { return this._volume; },
  onvolumechange: null,
  requestShow() { return ipcRenderer.invoke('volume:show'); },
  requestUp() { return ipcRenderer.invoke('volume:up'); },
  requestDown() { return ipcRenderer.invoke('volume:down'); },
  requestSet(v) { return ipcRenderer.invoke('volume:set', v); },
  requestForceVolume(v) { return ipcRenderer.invoke('volume:set', v); },
  addEventListener() {}, removeEventListener() {},
};
ipcRenderer.on('kaios-volume', (e, v) => {
  volumeManager._volume = v;
  if (typeof volumeManager.onvolumechange === 'function') {
    try { volumeManager.onvolumechange({ target: volumeManager, volume: v }); } catch (err) {}
  }
});
ipcRenderer.invoke('volume:get').then((v) => { volumeManager._volume = v; });
defNav('volumeManager', volumeManager);
defNav('mozAudioChannelManager', {
  headphones: false,
  onheadphoneschange: null,
  volumeManager,
});

/* ------------------------------------------------------------------ */
/* spatialNavigationEnabled + arrow-key focus movement                 */
/* ------------------------------------------------------------------ */

let spatialNavEnabled = false;
Object.defineProperty(Navigator.prototype, 'spatialNavigationEnabled', {
  get() { return spatialNavEnabled; },
  set(v) { spatialNavEnabled = !!v; },
  configurable: true,
});

function focusableElements() {
  const sel = 'a[href], button, input:not([type="hidden"]):not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(document.querySelectorAll(sel)).filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  });
}

function moveSpatialFocus(dir) {
  const cur = document.activeElement;
  const els = focusableElements();
  if (!els.length) return false;
  let best = null;
  let bestScore = Infinity;
  const cx = cur ? cur.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, right: innerWidth / 2, bottom: innerHeight / 2, width: 0, height: 0 };
  for (const el of els) {
    if (el === cur) continue;
    const r = el.getBoundingClientRect();
    const ex = r.left + r.width / 2;
    const ey = r.top + r.height / 2;
    const mx = cx.left + cx.width / 2;
    const my = cx.top + cx.height / 2;
    const dx = ex - mx;
    const dy = ey - my;
    let primary;
    let secondary;
    if (dir === 'up') { primary = -dy; secondary = Math.abs(dx); }
    else if (dir === 'down') { primary = dy; secondary = Math.abs(dx); }
    else if (dir === 'left') { primary = -dx; secondary = Math.abs(dy); }
    else { primary = dx; secondary = Math.abs(dy); }
    if (primary <= 2) continue;
    const score = primary + secondary * 2;
    if (score < bestScore) { bestScore = score; best = el; }
  }
  if (best) { best.focus(); return true; }
  return false;
}

/* ------------------------------------------------------------------ */
/* vibrate / misc small APIs                                           */
/* ------------------------------------------------------------------ */

defNav('vibrate', (pattern) => {
  try { ipcRenderer.send('kaios-vibrate', { pattern }); } catch (e) {}
  return true;
});

const mozL10n = {
  language: {
    code: navigator.language || 'en-US',
    get direction() { return /^(ar|he|fa|ur|ps|qps)/i.test(this.code) ? 'rtl' : 'ltr'; },
  },
  // Gaia's l10n.js reports 'complete' once the first translation round is
  // done. The KaiOS Store remote bundle reads this in its softkey helper
  // (`navigator.mozL10n.readyState === 'complete'`), so keep it a string.
  readyState: 'complete',
  ready(cb) { setTimeout(() => { try { cb && cb(); } catch (e) {} }, 0); },
  // The remote catalog entry point renders React through `mozL10n.once()`:
  //   navigator.mozL10n.once(function(){ ReactDOM.render(..., #root) });
  // Without this method that call throws a TypeError and #root stays empty
  // forever, so the catalog never posts remote_ui_is_ready and the Store sits
  // on Loading (0%). Fire on the next tick so callers can finish evaluating
  // their module first.
  once(cb) {
    if (typeof cb !== 'function') return;
    setTimeout(() => { try { cb(); } catch (e) { /* surface as page error */ throw e; } }, 0);
  },
  getDirection(code) { return /^(ar|he|fa|ur|ps|qps)/i.test(String(code || this.language.code)) ? 'rtl' : 'ltr'; },
  get(id) { return String(id); },
  formatValue(id) { return String(id); },
  getAttributes(el) { return { id: el.getAttribute('data-l10n-id'), args: el.getAttribute('data-l10n-args') }; },
  setAttributes(el, id, args) {
    el.setAttribute('data-l10n-id', id);
    if (args != null) el.setAttribute('data-l10n-args', JSON.stringify(args));
    return el;
  },
  localize(el, id, args) { return this.setAttributes(el, id, args); },
  translateElement() {},
  translateFragment() {},
  setLanguage(code) { this.language.code = code; },
  onLocalized: null,
  qps: {},
};
defNav('mozL10n', mozL10n);
defGlobal('document.l10n', {
  setAttributes: mozL10n.setAttributes, getAttributes: mozL10n.getAttributes,
  formatValue: mozL10n.formatValue, translateElement: mozL10n.translateElement,
});

/* ------------------------------------------------------------------ */
/* stubs: telephony, contacts, bluetooth, cameras, power, ...          */
/* ------------------------------------------------------------------ */

const telephonyCalls = [];
let telephonyActive = null;
function makeCall(number, emergency) {
  const call = {
    number: String(number || ''), state: 'dialing', disconnectedReason: '',
    secondNumber: null, emergency: !!emergency, conference: false,
    onconnected: null, ondisconnected: null, onstatechange: null, ongroupchange: null,
    hangUp() { finish(''); },
  };
  telephonyCalls.push(call);
  telephonyActive = call;
  setTimeout(() => {
    call.state = 'connected';
    if (call.onstatechange) call.onstatechange({ target: call });
    if (call.onconnected) call.onconnected({ target: call });
  }, 900);
  setTimeout(() => finish(''), 6500);
  function finish(reason) {
    const i = telephonyCalls.indexOf(call);
    if (i < 0) return;
    telephonyCalls.splice(i, 1);
    if (telephonyActive === call) telephonyActive = null;
    call.state = 'disconnected';
    call.disconnectedReason = reason;
    if (call.ondisconnected) call.ondisconnected({ target: call });
  }
  return call;
}

defNav('mozTelephony', {
  calls: telephonyCalls,
  get activeCall() { return telephonyActive; },
  dial: (n) => makeCall(n, false),
  dialEmergency: (n) => makeCall(n, true),
  sendTones() {},
  onincoming: null,
  oncallschanged: null,
  addEventListener() {}, removeEventListener() {},
});

defNav('mozMobileConnection', {
  iccId: FAKE_DEVICE.iccid,
  radioState: 'enabled',
  deviceIdentities: { imei: FAKE_DEVICE.imei, meid: FAKE_DEVICE.meid, iccId: FAKE_DEVICE.iccid },
  voice: {
    connected: true, emergencyCallsOnly: false, roaming: false,
    signalStrength: 4, relSignalStrength: 80, cardState: 'ready',
    network: { name: 'KaiOS Sim', mcc: '001', mnc: '01' },
    iccInfo: { iccid: FAKE_DEVICE.iccid, mcc: '001', mnc: '01', msisdn: FAKE_DEVICE.msisdn, spn: 'KaiOS Sim' },
  },
  data: { connected: true, roaming: false, type: 'lte', network: { name: 'KaiOS Sim', mcc: '001', mnc: '01' } },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozIccManager', {
  iccIds: [FAKE_DEVICE.iccid],
  getIcc(id) { return stubOk(_fakeIcc(id || FAKE_DEVICE.iccid)); },
  getIccById(id) { return _fakeIcc(id || FAKE_DEVICE.iccid); },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozVoicemail', {
  getStatus() { const r = makeRequest(); r._ok({ hasMessages: false, totalMessageCount: 0 }); return r; },
  getMessages() { const r = makeRequest(); r._ok([]); return r; },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozContacts', {
  getAll() { return stubOk([]); },
  find(q) { return stubOk([]); },
  clear() { return stubOk(true); },
  addEventListener() {}, removeEventListener() {},
});

const btAdapter = {
  state: 'disabled', enabled: false, discoverable: false, discovering: false,
  name: 'Simulator Bluetooth', address: '02:00:00:00:00:00',
  _ls: [],
  enable() { const r = makeRequest(); setTimeout(() => { this.state = 'enabled'; this.enabled = true; this._emit('enabled'); r._ok(true); }, 150); return r; },
  disable() { const r = makeRequest(); setTimeout(() => { this.state = 'disabled'; this.enabled = false; this._emit('disabled'); r._ok(true); }, 150); return r; },
  startLeScan() {}, stopLeScan() {},
  _emit(type) { for (const [t, cb] of this._ls) { if (t === type) { try { cb({ target: this }); } catch (e) {} } } },
  addEventListener(t, cb) { this._ls.push([t, cb]); },
  removeEventListener() {},
};
defNav('mozBluetooth', {
  getAdapters: () => stubOk([btAdapter]),
  getDefaultAdapter: () => stubOk(btAdapter),
  addEventListener() {}, removeEventListener() {},
});

function makeCamera() {
  return {
    capabilities: {
      effects: [], whiteBalancingModes: [], isoModes: [], sceneModes: [], flashModes: [],
      focusModes: [], zoomRatios: [], maxFocusAreas: 0, maxMeteringAreas: 0, maxDetectedFaces: 0,
      minExposureCompensation: 0, maxExposureCompensation: 0, stepExposureCompensation: 0,
    },
    getConfiguration: () => stubOk({}),
    setConfiguration: (c) => stubOk(c),
    getPreviewStream() {
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    },
    release() { return Promise.resolve(); },
    addEventListener() {}, removeEventListener() {},
    takePhoto() {
      return navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then((stream) => {
        const v = document.createElement('video');
        v.srcObject = stream; v.muted = true;
        return new Promise((resolve, reject) => {
          v.onloadedmetadata = () => {
            v.play().then(() => {
              setTimeout(() => {
                const c = document.createElement('canvas');
                c.width = v.videoWidth; c.height = v.videoHeight;
                c.getContext('2d').drawImage(v, 0, 0);
                stream.getTracks().forEach((t) => t.stop());
                c.toBlob((blob) => {
                  if (blob) resolve(new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
                  else reject(new Error('capture failed'));
                }, 'image/jpeg', 0.92);
              }, 250);
            }).catch(reject);
          };
          v.onerror = () => reject(new Error('camera error'));
        });
      });
    },
  };
}
const cameraSingleton = makeCamera();
defNav('mozCameras', {
  getCamera: () => stubOk(cameraSingleton),
  getListOfCameras: () => stubOk(['back', 'front']),
  addEventListener() {}, removeEventListener() {},
});
defNav('mozCamera', {
  getCameraManager: () => ({
    getCamera: () => stubOk(cameraSingleton),
    getListOfCameras: () => stubOk(['back', 'front']),
  }),
});

defNav('mozPower', {
  screenEnabled: true, screenBrightness: 1, keyLightEnabled: true, cpuSleepAllowed: true,
  factoryReset() { return stubOk(true); },
  reboot() { return stubOk(true); },
  powerOff() { return stubOk(true); },
  addWakeLockListener() {}, removeWakeLockListener() {},
  getWakeLockState() { return 'unlocked'; },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozTime', () => Promise.resolve(new Date()));

defNav('mozId', {
  get: { watchedApps: () => Promise.resolve({ apps: [] }) },
  request: () => Promise.reject(new Error('Persona not available in simulator')),
  watch: () => stubOk(null),
  logout: () => stubOk(true),
  addEventListener() {}, removeEventListener() {},
});

defNav('mozFMRadio', {
  enabled: false, frequency: null, antennaAvailable: true,
  enable() { return stubFail('no radio hardware'); },
  disable() { return stubFail('no radio hardware'); },
  seekUp() { return stubFail('no radio hardware'); },
  seekDown() { return stubFail('no radio hardware'); },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozNfc', {
  checkP2PRegistration(cb) { setTimeout(() => cb && cb(false), 0); return stubOk(false); },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozNetworkStats', {
  getSamples() { return stubOk([]); },
  clearStats() { return stubOk(true); },
  getAvailableNetworks() { return stubOk([]); },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozPermissionSettings', {
  get(perm, manifest) { return stubOk('allow'); },
  set(perm, value, manifest) { return stubOk(true); },
  isExplicit() { return stubOk(false); },
});

defNav('mozInputMethod', {
  mgmt: {
    getAll: () => stubOk([]),
    next: () => stubOk(true),
    hasNext: () => stubOk(false),
    addEventListener() {}, removeEventListener() {},
  },
  inputcontext: {
    getText() { return ''; },
    setSelectionRange() {},
    replaceSurroundingText() { return Promise.resolve(); },
    sendKey() {},
  },
  addEventListener() {}, removeEventListener() {},
});

defNav('mozCellBroadcast', { addEventListener() {}, removeEventListener() {} });
defNav('mozUsb', { getDevices: () => stubOk([]), addEventListener() {}, removeEventListener() {} });

/* navigator.b2g namespace (KaiOS 3.0) */
function b2gGetDeviceStorages(type) {
  // Real KaiOS 3: getDeviceStorages(type) returns the storage(s) of that
  // type; getDeviceStorages() with no argument returns all of them.
  if (type) return [getDeviceStorage(type)];
  return ['sdcard', 'pictures', 'music', 'videos', 'apps', 'downloads'].map(getDeviceStorage);
}
defNav('b2g', {
  getDeviceStorage,
  getDeviceStorages: b2gGetDeviceStorages,
  alarmManager: b2gAlarmManager,
  cameras: { getCamera: () => stubOk(cameraSingleton), getListOfCameras: () => stubOk(['back', 'front']) },
  iccManager: {
    iccIds: [FAKE_DEVICE.iccid],
    getIcc(id) { return stubOk(_fakeIcc(id || FAKE_DEVICE.iccid)); },
    getIccById(id) { return _fakeIcc(id || FAKE_DEVICE.iccid); },
    addEventListener() {}, removeEventListener() {},
  },
  voicemail: { getStatus() { return stubOk({ hasMessages: false }); } },
  AudioContext: window.AudioContext,
  settings: mozSettings,
  addEventListener() {}, removeEventListener() {},
});

/* ------------------------------------------------------------------ */
/* external-api stubs (lib_session / lib_audiovolume)                  */
/* KaiOS serves these from http://127.0.0.1:8081/api/v1/shared/*.js;   */
/* they are unreachable in the simulator, so define them here. The     */
/* session never "connects", it just resolves once and never fires     */
/* disconnect (avoids the apps' reconnect loops).                     */
/* ------------------------------------------------------------------ */

defGlobal('lib_session', {
  Session: function Session() {
    this.open = function open(type, url, token, callbacks) {
      if (callbacks && typeof callbacks.onsessionconnected === 'function') {
        setTimeout(function () {
          try { callbacks.onsessionconnected(); } catch (e) {}
        }, 0);
      }
    };
    this.close = function close() {};
    this.on = function on() {};
    this.emit = function emit() {};
  },
});

defGlobal('lib_audiovolume', {
  AudioVolumeManager: {
    get: function get() {
      return Promise.resolve({
        requestVolumeUp: function () { return volumeManager.requestUp(); },
        requestVolumeDown: function () { return volumeManager.requestDown(); },
        requestVolumeShow: function () { return volumeManager.requestShow(); },
        requestVolumeSet: function (v) { return volumeManager.requestSet(v); },
        requestForceVolume: function (v) { return volumeManager.requestSet(v); },
      });
    },
  },
});

/* ------------------------------------------------------------------ */
/* KaiAds offline stub (fallback before the SDK script loads)          */
/* ------------------------------------------------------------------ */

function kaiAdFallback(opts) {
  const ad = { call() {}, display() {}, close() {}, onerror: null };
  if (opts && typeof opts.onready === 'function') {
    setTimeout(() => { try { opts.onready(ad); } catch (e) {} }, 0);
  }
  return ad;
}
defGlobal('getKaiAd', kaiAdFallback);

/* ------------------------------------------------------------------ */
/* serviceWorker stub (custom scheme blocks real SW registration)      */
/* ------------------------------------------------------------------ */

function fakeRegistration() {
  return {
    scope: location.origin + '/',
    active: null, installing: null, waiting: null, passive: true,
    pushManager: {
      subscribe: () => Promise.reject(new Error('push not supported in simulator')),
      getSubscription: () => Promise.resolve(null),
      permissionState: () => Promise.resolve('denied'),
    },
    update: () => Promise.resolve(),
    unregister: () => Promise.resolve(true),
    showNotification: () => Promise.resolve(),
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    onupdatefound: null,
  };
}
try {
  const sw = navigator.serviceWorker;
  if (sw) {
    Object.defineProperty(sw, 'register', { value: () => Promise.resolve(fakeRegistration()), configurable: true });
    Object.defineProperty(sw, 'getRegistration', { value: () => Promise.resolve(null), configurable: true });
    Object.defineProperty(sw, 'getRegistrations', { value: () => Promise.resolve([]), configurable: true });
    // navigator.serviceWorker.ready is a PROMISE PROPERTY (not a function).
    // The KaiOS Store does `serviceWorker.ready.then(r => r.pushManager...)`
    // in unregisterPushService(); exposing a function here throws
    // "navigator.serviceWorker.ready.then is not a function".
    Object.defineProperty(sw, 'ready', { value: Promise.resolve(fakeRegistration()), configurable: true });
  }
} catch (e) { /* ignore */ }

/* ------------------------------------------------------------------ */
/* window.open -> the OS default browser (the in-sim browser was       */
/* removed; the simulator never renders web pages itself)              */
/* ------------------------------------------------------------------ */

const fakeWindow = {
  closed: false,
  location: { href: '' },
  document: { write() {}, close() {}, title: '' },
  close() { this.closed = true; },
  focus() {}, blur() {}, postMessage() {},
  addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
};
window.open = function (url, target, features) {
  const s = String(url == null ? '' : url);
  const feat = String(features == null ? '' : features);
  fakeWindow.location.href = s;

  /* Launching an installed app.
   *
   * KaiOS 3 storefronts start an app with
   *   window.open(manifestURL, "_blank", "kind=app,noopener=yes")
   * and on a real device the system resolves a *manifest* URL to the
   * installed package, then starts it full screen. Here that URL is only a
   * JSON endpoint, so sending it to the OS browser opened Chrome/Firefox
   * outside the phone (and never started anything). Route it through the
   * shell so the app opens on the simulated screen instead. */
  const isAppLaunch = /(^|,)\s*kind\s*=\s*app\b/i.test(feat) ||
    /\/apps\/manifest\//i.test(s) ||
    /^app:\/\//i.test(s);
  if (isAppLaunch) {
    try {
      ipcRenderer.invoke('kaios-launch-by-manifest', { url: s }).then((r) => {
        if (r && r.ok) {
          LOG('[kaios-sim] launch app ' + ((r.app && r.app.name) || '?') +
            ' (' + ((r.app && r.app.id) || '?') + ')');
        } else {
          // Deliberately NOT falling back to the OS browser: that is the bug
          // this branch exists to prevent.
          LOG('[kaios-sim] launch failed: ' + ((r && r.error) || 'unknown'));
        }
      }).catch((err) => {
        LOG('[kaios-sim] launch error: ' + ((err && err.message) || err));
      });
    } catch (e) { /* ignore */ }
    return fakeWindow;
  }

  try { ipcRenderer.send('kaios-open-url', { url: s }); } catch (e) {}
  return fakeWindow;
};

/* KaiOS apps exit by calling window.close(): the shell returns to the
 * launcher and stops the guest page. */
window.close = function () {
  try { ipcRenderer.send('kaios-app-close'); } catch (e) {}
  fakeWindow.closed = true;
};

/* ------------------------------------------------------------------ */
/* KaiOS key translation                                               */
/* ------------------------------------------------------------------ */

const PHYS_MAP = {
  F1: 'SoftLeft',
  F2: 'SoftRight',
  // Back / Hang-up are *shell-level* actions (webview history back, or a real
  // app exit), so they are forwarded to the host shell rather than dispatched
  // straight to the app — see the keydown/keyup handlers below.
  Escape: 'Back',
  Backspace: 'Back',
  PageUp: 'VolumeUp',
  PageDown: 'VolumeDown',
};
const KAIOS_KEYCODES = {
  SoftLeft: 112, SoftRight: 113, EndCall: 8, Call: 0,
  VolumeUp: 0, VolumeDown: 0,
  ArrowUp: 38, ArrowDown: 40, ArrowLeft: 37, ArrowRight: 39, Enter: 13,
  '0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57,
  '*': 42, '#': 35,
};

function dispatchKaiosKey(key, type) {
  let ev;
  try {
    ev = new KeyboardEvent(type, { key, code: key, bubbles: true, cancelable: true, composed: true });
  } catch (e) { return false; }
  try {
    Object.defineProperty(ev, 'keyCode', { get: () => (KAIOS_KEYCODES[key] != null ? KAIOS_KEYCODES[key] : 0) });
    Object.defineProperty(ev, 'which', { get: () => (KAIOS_KEYCODES[key] != null ? KAIOS_KEYCODES[key] : 0) });
  } catch (e) { /* ignore */ }
  ev.__kaios = true;
  const t = (document.activeElement && document.activeElement !== document.body)
    ? document.activeElement
    : (document.body || document);
  t.dispatchEvent(ev);
  window.dispatchEvent(ev);
  // true when the app handled the key (called preventDefault) — the shell
  // uses this to decide whether EndCall should also return to the desktop.
  return !!ev.defaultPrevented;
}

function isTypingTarget(t) {
  return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

window.addEventListener('keydown', (e) => {
  if (e.__kaios) return;
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    if (spatialNavEnabled) {
      const dir = e.key.slice(5).toLowerCase();
      if (moveSpatialFocus(dir)) { e.preventDefault(); e.stopImmediatePropagation(); }
    }
    return;
  }
  const mapped = PHYS_MAP[e.key];
  if (!mapped) return;
  if (e.key === 'Backspace' && isTypingTarget(e.target)) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  // Back / Exit are handled by the host shell (webview history / real exit),
  // not the app. Forward to the shell; it will re-dispatch EndCall to the app
  // when appropriate so apps that implement their own back-nav keep working.
  if (mapped === 'Back' || mapped === 'Exit') {
    try { ipcRenderer.sendToHost('shell:kaios-key', { key: mapped, down: true }); } catch (e2) {}
    return;
  }
  dispatchKaiosKey(mapped, 'keydown');
}, true);

window.addEventListener('keyup', (e) => {
  if (e.__kaios) return;
  const mapped = PHYS_MAP[e.key];
  if (!mapped) return;
  if (e.key === 'Backspace' && isTypingTarget(e.target)) return;
  // Back/Exit keyup is not needed by the shell (it synthesises its own keyup).
  if (mapped === 'Back' || mapped === 'Exit') return;
  e.preventDefault();
  e.stopImmediatePropagation();
  dispatchKaiosKey(mapped, 'keyup');
}, true);

/* Called by the phone shell for on-screen hardware buttons.
 * Returns whether the app consumed the key (preventDefault). */
window.__kaiosKey = (key, down) => dispatchKaiosKey(key, down ? 'keydown' : 'keyup');
window.__kaiosTap = (key) => {
  const consumed = dispatchKaiosKey(key, 'keydown');
  setTimeout(() => dispatchKaiosKey(key, 'keyup'), 110);
  return consumed;
};

/* ------------------------------------------------------------------ */
/* screen.orientation lock (KaiOS supports it, desktop Chromium does  */
/* not — apps like IPTV Tube lock portrait on launch and in fullscreen) */
/* ------------------------------------------------------------------ */

try {
  const so = screen.orientation;
  if (so) {
    if (typeof so.lock === 'function') {
      so.lock = function lock() { return Promise.resolve(); };
    }
    if (typeof so.unlock === 'function') {
      so.unlock = function unlock() {};
    }
  }
} catch (e) { /* ignore */ }

/* ------------------------------------------------------------------ */
/* hls.js compat shim                                                   */
/* Some app builds (IPTV Tube) call hls.loadLevel(0) as a method, but   */
/* the hls.js version they ship only exposes loadLevel as a property.  */
/* Add a method to the prototype when the page defines window.Hls.     */
/* ------------------------------------------------------------------ */

(function patchHlsConstructor() {
  let patched = false;
  function patch(Ctor) {
    if (patched || !Ctor || !Ctor.prototype) return;
    try {
      if (typeof Ctor.prototype.loadLevel !== 'function') {
        Object.defineProperty(Ctor.prototype, 'loadLevel', {
          value: function loadLevel(level) {
            try { this.currentLevel = level; } catch (e) { /* ignore */ }
            return level;
          },
          configurable: true,
          writable: true,
        });
      }
      patched = true;
    } catch (e) { /* ignore */ }
  }
  let current = window.Hls;
  if (current) patch(current);
  try {
    Object.defineProperty(window, 'Hls', {
      configurable: true,
      get() { return current; },
      set(v) { current = v; patch(v); },
    });
  } catch (e) { /* ignore */ }
})();

/* ------------------------------------------------------------------ */
/* screen.mozOrientation (Gecko/KaiOS: "portrait*"/"landscape*")       */
/* KaiWeather reads it to pick ad sizes; desktop Chromium lacks it.    */
/* ------------------------------------------------------------------ */

try {
  if (screen && !('mozOrientation' in screen)) {
    Object.defineProperty(screen, 'mozOrientation', {
      get() {
        return (window.innerHeight >= window.innerWidth) ? 'portrait-primary' : 'landscape-primary';
      },
      configurable: true,
    });
  }
} catch (e) { /* ignore */ }

/* ------------------------------------------------------------------ */
/* navigator.connection (KaiOS reports wifi/cellular; desktop Chromium */
/* reports "unknown", which makes KaiWeather think it is offline)      */
/* ------------------------------------------------------------------ */

try {
  // Read the native connection defensively: in some embedded webviews the
  // navigator.connection getter itself throws, and even touching conn.type
  // can blow up. We must never let that propagate.
  let conn;
  try { conn = navigator.connection; } catch (e) { conn = undefined; }
  let nativeType = '';
  try { nativeType = conn ? String(conn.type || '') : ''; } catch (e) { nativeType = ''; }
  if (!/^(wifi|cellular|ethernet)$/.test(nativeType)) {
    // The KaiOS Store's isOnline() reads navigator.connection.type and only
    // accepts "wifi"/"cellular"
    //   (bundle: hasInternet = ["wifi","cellular"].includes(type))
    // Desktop Chromium either leaves type "unknown" OR makes the native
    // getter throw entirely. Either way the store's first render crashes
    // before the component ever mounts — so it never sets its INIT_*
    // performance marks and never creates the remote catalog iframe, leaving
    // the catalog stuck at "Loading (0%)". Replace the whole connection
    // object with a safe copy that can never throw and always reports "wifi".
    const safe = {
      type: 'wifi',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      onchange: null,
      ontypechange: null,
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return false; },
    };
    // Carry over any extra native fields without invoking throwing getters.
    if (conn && typeof conn === 'object') {
      for (const k of ['effectiveType', 'downlink', 'rtt', 'saveData']) {
        try { if (k in conn && conn[k] !== undefined) safe[k] = conn[k]; } catch (e) { /* ignore */ }
      }
    }
    // Layer 1: replace on the prototype (mirrors how defNav works and
    // overrides the native getter for every navigator instance).
    let ok = false;
    try { defNav('connection', safe); ok = true; } catch (e) { /* ignore */ }
    // Layer 2: own property on this navigator instance shadows the prototype.
    if (!ok) {
      try { Object.defineProperty(navigator, 'connection', { value: safe, configurable: true, writable: true }); ok = true; } catch (e) { /* ignore */ }
    }
    // Layer 3: at minimum, force a safe own `type` getter on the live object.
    if (!ok && conn) {
      try { Object.defineProperty(conn, 'type', { get: () => 'wifi', configurable: true }); } catch (e) { /* ignore */ }
    }
  }
} catch (e) { /* ignore */ }

/* ------------------------------------------------------------------ */
/* navigator.largeTextEnabled (Gecko accessibility flag)                */
/* ------------------------------------------------------------------ */

try {
  if (!('largeTextEnabled' in navigator)) {
    Object.defineProperty(navigator, 'largeTextEnabled', { value: false, configurable: true });
  }
} catch (e) { /* ignore */ }

/* ------------------------------------------------------------------ */
/* LazyLoader (KaiOS shared/js/lazy_loader.js equivalent)              */
/* KaiStore's ssr.js and other system apps expect a global             */
/* LazyLoader that loads scripts/stylesheets then fires a callback.    */
/* ------------------------------------------------------------------ */

(function defineLazyLoader() {
  if (window.LazyLoader) return;
  const loaded = new Set();
  function loadOne(url, done) {
    const isCss = /\.css(\?|#|$)/i.test(url);
    const el = document.createElement(isCss ? 'link' : 'script');
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      done();
    };
    if (isCss) {
      el.rel = 'stylesheet';
      el.href = url;
    } else {
      el.type = 'text/javascript';
      el.src = url;
    }
    el.onload = finish;
    el.onerror = finish; // never block the app on a missing asset
    document.head.appendChild(el);
  }
  window.LazyLoader = {
    load: function load(urls, callback) {
      const list = Array.isArray(urls) ? urls.slice() : [urls];
      return new Promise((resolve) => {
        let remaining = list.length;
        const done = () => {
          if (typeof callback === 'function') callback();
          resolve();
        };
        if (!remaining) { done(); return; }
        for (const url of list) {
          if (loaded.has(url)) {
            if (--remaining === 0) done();
            continue;
          }
          loaded.add(url);
          loadOne(url, () => {
            if (--remaining === 0) done();
          });
        }
      });
    },
    loadOnce: function loadOnce(urls, callback) { return window.LazyLoader.load(urls, callback); },
  };
})();

/* ------------------------------------------------------------------ */
/* Auto-focus the first visible text field                            */
/* KaiOS devices put the cursor in the search box when a screen opens  */
/* (e.g. KaiWeather's add-city screen). Desktop Chromium leaves focus  */
/* on <body>, so physical typing goes nowhere. Apps that manage focus  */
/* themselves are unaffected (activeElement is no longer <body>).      */
/* Stops for good once the user interacts with the page.              */
/* ------------------------------------------------------------------ */

(function autoFocusFirstField() {
  let userInteracted = false;
  let timer = null;
  const stop = (e) => {
    // Ignore synthetic KaiOS keys forwarded from the virtual keypad window:
    // those are taps on on-screen buttons, not the user typing on the
    // physical keyboard, and must not cancel the auto-focus.
    if (e && e.__kaios) return;
    userInteracted = true;
    window.removeEventListener('keydown', stop, true);
    window.removeEventListener('pointerdown', stop, true);
    window.removeEventListener('touchstart', stop, true);
  };
  window.addEventListener('keydown', stop, true);
  window.addEventListener('pointerdown', stop, true);
  window.addEventListener('touchstart', stop, true);

  function focusFirstField() {
    if (userInteracted) return;
    try {
      const ae = document.activeElement;
      if (ae && ae !== document.body) return;
      const el = document.querySelector(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]):not([type="file"]), textarea, [contenteditable="true"]',
      );
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== 'hidden';
      if (visible) {
        el.focus();
        stop();
        try { LOG('[kaios-sim] auto-focus: ' + el.tagName.toLowerCase() + (el.type ? '[type=' + el.type + ']' : '')); } catch (e) {}
      }
    } catch (e) { /* ignore */ }
  }

  function schedule() {
    if (userInteracted) return;
    clearTimeout(timer);
    timer = setTimeout(focusFirstField, 600);
  }

  if (document.body) {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    });
  }
  schedule();
})();

/* ------------------------------------------------------------------ */
/* System-app globals (KaiStore and friends expect these on the device) */
/* libSession / AppsManager / deviceInfos / Toaster / api.l10n          */
/* ------------------------------------------------------------------ */

(function defineSystemAppGlobals() {
  // libSession: connects to KaiOS system services over WebSocket on the
  // device. Nothing to connect to here — resolve immediately.
  if (!window.libSession) {
    window.libSession = {
      initService: function initService() { return Promise.resolve(); },
      getService: function getService() { return Promise.resolve(null); },
    };
  }

  // AppsManager: the system app-management service. Stubs resolve with
  // empty/neutral values so the Store's init chain completes; nothing is
  // actually installed, updated or removed.
  if (!window.AppsManager) {
    const AppsServiceError = {
      INVALID_MANIFEST: 'INVALID_MANIFEST',
      MANIFEST_URL_ERROR: 'MANIFEST_URL_ERROR',
      MANIFEST_PARSE_ERROR: 'MANIFEST_PARSE_ERROR',
      NETWORK_ERROR: 'NETWORK_ERROR',
      DOWNLOAD_ERROR: 'DOWNLOAD_ERROR',
      INSTALL_STATE_CANCELED: 'INSTALL_STATE_CANCELED',
      APP_INTERNAL_ERROR: 'APP_INTERNAL_ERROR',
      CERTIFICATE_ERROR: 'CERTIFICATE_ERROR',
      PACKAGE_DOWNLOAD_ERROR: 'PACKAGE_DOWNLOAD_ERROR',
      OFFLINE_ERROR: 'OFFLINE_ERROR',
      REBOOT_ERROR: 'REBOOT_ERROR',
      CANCELED: 'CANCELED',
    };
    const AppsUpdateState = {
      IDLE: 'IDLE',
      PENDING: 'PENDING',
      UPDATING: 'UPDATING',
      UPDATED: 'UPDATED',
      FAILED: 'FAILED',
      DOWNLOADING: 'DOWNLOADING',
    };
    /* KaiOS reports install state as an INTEGER from AppsManager: the Store's
     * bundle maps it back to a string with
     *   APPS_INSTALL_STATE_MAP = new Map([[0,'installed'],[1,'installing'],[2,'pending']])
     * and filters installed apps with
     *   app.installState === AppsManager.AppsInstallState.INSTALLED
     * Both sides must use the same numeric enum — with the string 'installed'
     * here the filter accidentally matched, but transformCompatibleAppsObject
     * turned installState into `undefined` (Map.get('installed') === undefined),
     * so every app the Store listed came back without a usable install state. */
    const AppsInstallState = {
      INSTALLED: 0,
      INSTALLING: 1,
      PENDING: 2,
    };
    // ConnectionType: the AppsManager constants the Store reads when building
    // its auto-update policy map (autoUpdatePolicyMap). Without these the
    // bundle throws "Cannot read properties of undefined (reading 'WI_FI_ONLY')".
    const ConnectionType = {
      WI_FI_ONLY: 'wifi-only',
      ANY: 'any',
      DATA: 'data',
    };
    const ClearType = { DATA: 'data', CACHE: 'cache', ALL: 'all' };

    // ---- real install / list / uninstall backed by the main process ----
    // The Store's bare `AppsManager` global (this object) is what the bundle
    // calls for installPackage / getAll / uninstall, so implementing these for
    // real lets the simulator actually download KaiOS Store packages and
    // register them. Machine identity is faked, but the manifest + package
    // downloads hit the LIVE backend (authenticated with the real Hawk token).
    function _appsManagerOn(type, cb) { __kaiosAppsBus.on(type, cb); }
    function _appsManagerOff(type, cb) { __kaiosAppsBus.off(type, cb); }
    function _appsManagerEmit(type, detail) {
      /* KaiOS hands the app object (not an event envelope) to the listener:
       * the Store does transformCompatibleAppsObject(e) + getAppRemoteURL(e)
       * straight off the argument. Passing {type, detail} here silently broke
       * the whole "installed" flow — the Store never got the app, never sent
       * mozapp_update to its remote UI, and the detail page stayed on
       * "installing" forever. */
      const arg = detail !== undefined ? detail : { type, detail };
      __kaiosAppsEvent(type, arg);
    }

    function __kaiosListApps() {
      return ipcRenderer.invoke('kaios-list-apps').then((list) => list || []);
    }

    /* Catalog manifest/package URLs are usually pre-signed (they carry
     * signature/timestamp/nonce query params issued by the store backend for
     * THIS device). Such a URL must be fetched verbatim — bolting a Hawk
     * Authorization header onto it makes the gateway re-validate the request
     * against Hawk and answer 400. Unsigned URLs (older catalog shapes) still
     * need Hawk. So: pick the likely mode from the URL, and if the backend
     * disagrees, retry once the other way. Every failure logs the URL, the
     * status and the first bytes of the body — that body is the only place the
     * backend says WHY it refused. */
    function __kaiosStoreGet(url, tok, label) {
      const kai = __kaiosKaiHeaders();
      const hawk = __kaiosHawk(url, 'GET', tok);
      const presigned = /[?&](signature|sig|token|expires|timestamp|nonce)=/i.test(url);
      const attempt = (withHawk) => __kaiosHttp(url, {
        headers: withHawk ? Object.assign({ Authorization: hawk }, kai) : kai,
      }).then((res) => {
        if (res.ok) return res;
        return res.text().then((raw) => {
          const detail = String(raw || '').replace(/\s+/g, ' ').slice(0, 240);
          const e = new Error(label + ' HTTP ' + res.status + (detail ? ' — ' + detail : '') +
            ' (url=' + url + ', hawk=' + (withHawk ? 'yes' : 'no') + ')');
          e.status = res.status;
          e.url = url;
          throw e;
        });
      }, (err) => {
        // Transport-level failure: surface the URL too, it is never in the log.
        const e = new Error(label + ' failed — ' + (err && err.message) + ' (url=' + url + ')');
        e.url = url;
        throw e;
      });
      return attempt(!presigned).catch((err) => {
        if (err.status && err.status >= 400 && err.status < 500) {
          LOG('[kaios-sim] ' + label + ': retrying with hawk=' + (presigned ? 'yes' : 'no') +
            ' (previous: ' + err.message.slice(0, 120) + ')');
          return attempt(presigned);
        }
        throw err;
      });
    }

    function __kaiosInstallPackage(manifestURL, opts) {
      const finalUrl = __kaiosAbsUrl(manifestURL);
      const receipts = (opts && opts.receipts) || null;
      LOG('[kaios-sim] install: manifest ' + finalUrl + (receipts ? ' (receipts=' + receipts.length + ')' : ''));
      return __kaiosStoreToken().then((tok) => {
        return __kaiosStoreGet(finalUrl, tok, 'manifest')
          .then((res) => res.text().then((raw) => {
            let m = null;
            try { m = JSON.parse(raw); } catch (e) { m = null; }
            if (!m || typeof m !== 'object') {
              // A gateway/CDN error page served with 200: the body is the only
              // clue (JSON.parse alone would just say "Unexpected token '<'").
              throw new Error('manifest is not JSON (' + String(raw || '').replace(/\s+/g, ' ').slice(0, 200) +
                ', url=' + finalUrl + ')');
            }
            return m;
          }))
          .then((manifest) => {
            const pkgRel = manifest.package_path || manifest.packagePath;
            if (!pkgRel) {
              throw new Error('manifest has no package_path (keys=' +
                Object.keys(manifest).slice(0, 12).join(',') + ', url=' + finalUrl + ')');
            }
            const pkgPath = __kaiosAbsUrl(pkgRel);
            LOG('[kaios-sim] install: package ' + pkgPath);
            return __kaiosStoreGet(pkgPath, tok, 'package')
              .then((res) => res.arrayBuffer());
          })
          .then((buf) => {
            const zipPath = nodePath.join(nodeOs.tmpdir(), 'kaios-store-pkg-' + Date.now() + '.zip');
            nodeFs.writeFileSync(zipPath, Buffer.from(buf));
            LOG('[kaios-sim] package downloaded: ' + (buf.byteLength || 0) + ' bytes -> ' + zipPath);
            _appsManagerEmit('downloadsuccess', { manifestURL: finalUrl });
            return ipcRenderer
              .invoke('kaios-install-file', { zipPath, manifestURL: finalUrl })
              // The main-process handler answers { ok, app } (or { ok:false,
              // error }) — NOT the bare app record. Reading `.name` off the
              // envelope is what printed "app installed: undefined".
              .then((r) => {
                if (!r || r.ok === false || !r.app) {
                  throw new Error('install-file failed: ' +
                    ((r && r.error) || 'no app record returned'));
                }
                const rec = r.app;
                /* THE event the Store actually subscribes to is 'install'
                 * (AppsService.startEventListeners → handleInstalled), not
                 * 'installsuccess'. handleInstalled transforms the app object
                 * and pushes a `mozapp_update` command to the remote catalog;
                 * that push is the ONLY thing that flips the detail page from
                 * "正在安装" to "已安装" and inserts the app into
                 * mozApps.installed — the very map served for
                 * request_installed_apps. Emit the KaiOS event name, with the
                 * app object itself shaped like a device record. */
                const appObj = {
                  manifestUrl: finalUrl,
                  manifestURL: finalUrl,
                  id: rec.id,
                  name: rec.name,
                  version: rec.version || '1.0',
                  developer: rec.developer,
                  updateUrl: undefined,
                  removable: true,
                  // Integer enum, matching AppsManager.AppsInstallState.INSTALLED.
                  installState: 0,
                  updateState: 'IDLE',
                  manifest: { version: rec.version || '1.0', activities: {} },
                };
                _appsManagerEmit('install', appObj);
                _appsManagerEmit('installsuccess', { manifestURL: finalUrl, app: rec });
                LOG('[kaios-sim] app installed: ' + rec.name + ' (' + rec.id + ')' +
                  (r.mapped ? '' : ' [manifestURL not recorded' + (r.mapError ? ': ' + r.mapError : '') + ']'));
                return rec;
              });
          });
      }).catch((err) => {
        LOG('[kaios-sim] install failed: ' + (err && err.message));
        // KaiOS install errors are DOMError-shaped ({ name, value }).
        const e = new Error('INSTALL_ERROR');
        e.name = 'INSTALL_ERROR';
        e.value = 'INSTALL_ERROR';
        throw e;
      });
    }

    function __kaiosUninstall(manifestURL) {
      const finalUrl = __kaiosAbsUrl(manifestURL);
      return ipcRenderer
        .invoke('kaios-uninstall', { manifestURL: finalUrl })
        .then((ok) => {
          if (ok !== false) {
            // handleUninstall(e) reads e AS the manifest URL string (it calls
            // getAppRemoteURL(e) directly), so pass the URL, not an envelope.
            _appsManagerEmit('uninstall', finalUrl);
            LOG('[kaios-sim] app uninstalled: ' + finalUrl);
          }
          return ok !== false;
        });
    }

    window.AppsManager = {
      AppsServiceError,
      AppsUpdateState,
      AppsInstallState,
      ConnectionType,
      ClearType,
      init: function init() {},
      // KaiStore calls getApp(self) and getApp(system) and then immediately
      // reads app.manifestUrl inside transformCompatibleAppsObject — a null
      // here throws "Cannot read properties of null (reading 'manifestUrl')".
      // The simulator has no real installed apps, so resolve a minimal fake
      // app object (manifestUrl set) so the Store's self/system lookups
      // transform gracefully instead of null-derefing. The transform's
      // shouldFetchManifest default triggers a harmless app:// fetch that 404s
      // and is caught internally, so the call always resolves.
      getApp: function getApp(manifestURL) {
        return Promise.resolve({
          manifestUrl: manifestURL || '',
          manifestURL: manifestURL || '',
          name: 'Unknown App',
          removable: false,
          installState: 0,
          manifest: { activities: {} },
        });
      },
      getApps: function getApps() { return __kaiosListApps(); },
      getAll: function getAll() { return __kaiosListApps(); },
      getUpdatePolicy: function getUpdatePolicy() { return Promise.resolve('wifi-only'); },
      setUpdatePolicy: function setUpdatePolicy() { return Promise.resolve(); },
      checkForUpdate: function checkForUpdate() { return Promise.resolve(null); },
      update: function update() { return Promise.resolve(null); },
      cancelDownload: function cancelDownload() { return Promise.resolve(); },
      installPackage: function installPackage(manifestURL, options) {
        return __kaiosInstallPackage(manifestURL, options);
      },
      installPwa: function installPwa(manifestURL, options) {
        return __kaiosInstallPackage(manifestURL, options);
      },
      uninstall: function uninstall(manifestURL) { return __kaiosUninstall(manifestURL); },
      addEventListener: _appsManagerOn,
      removeEventListener: _appsManagerOff,
    };
  }

  /* The Store reaches app management through both entry points: the bare
   * `AppsManager` global (bundle module scope) and `window.api.appsmanager`
   * (web/kaios3 origin). Expose the implementation built above so the session
   * services installer can wire the latter to the real install pipeline
   * instead of leaving it on the catch-all stub. */
  window.__kaiosAppsServiceImpl = window.AppsManager;

  // deviceInfos: system settings store (DeviceInfo service). get(key) is
  // async; known machine-data keys resolve to the fake profile values, while
  // unknown keys resolve to '' so string concatenations degrade gracefully.
  if (!window.deviceInfos) {
    window.deviceInfos = {
      get: function get(key) {
        if (Object.prototype.hasOwnProperty.call(DEVICEINFO_MAP, key)) {
          return Promise.resolve(DEVICEINFO_MAP[key]);
        }
        return Promise.resolve('');
      },
      addEventListener() {}, removeEventListener() {},
    };
  }

  // Toaster: system toast API.
  if (!window.Toaster) {
    window.Toaster = {
      showToast: function showToast() {},
      hideToast: function hideToast() {},
    };
  }

  // api.l10n: minimal localization handle (readyState 'complete' + get()
  // returning the key, matching KaiOS behaviour when no translation exists).
  if (!window.api) {
    window.api = {
      l10n: {
        readyState: 'complete',
        get: function get(key) { return key; },
        formatValue: function formatValue(k) { return k; },
        setAttributes: function setAttributes(el, key) { if (el) el.setAttribute('data-l10n-id', key); },
        getAttributes: function getAttributes(el) { return el ? { id: el.getAttribute('data-l10n-id') || '' } : {}; },
        translateElement: function translateElement() {},
        once: function once(cb) { setTimeout(cb, 0); },
        ready: function ready(cb) { setTimeout(cb, 0); },
        language: { code: 'en-US', direction: 'ltr' },
      },
    };
  }

  /* ---------------------------------------------------------------- */
  /* KaiOS session services (window.api.*)                             */
  /* ---------------------------------------------------------------- */
  /* The shared Gaia runtime (assets/shared/js/session/*) reaches the     */
  /* KaiOS system services over a WebSocket to 127.0.0.1. There is no    */
  /* such daemon in the simulator, so libSession never fires             */
  /* "services-load-complete" -> taskScheduler.connected stays false ->  */
  /* every SettingsObserver.getValue() parks in _pendingGetValueRequests */
  /* forever. That is exactly what hung KaiStore right after it printed  */
  /* "All deviceInfos are from mozSettings". We serve the managers       */
  /* locally and fire the event ourselves so the queue drains.           */
  function __kaiosStubManager(name) {
    return new Proxy({}, {
      get(t, prop) {
        if (typeof prop === 'symbol') return undefined;
        // Anything explicitly assigned (Object.assign) wins over the catch-all.
        if (Object.prototype.hasOwnProperty.call(t, prop)) return t[prop];
        if (prop === 'then' || prop === '__kaiosStub') return prop === '__kaiosStub';
        return function stubbed() {
          LOG('[kaios-sim] api.' + name + '.' + String(prop) + '() -> stub');
          return Promise.resolve(undefined);
        };
      },
      has() { return true; },
    });
  }

  /* Values the KaiStore bundle itself defaults to (settingsQuery in
   * dist/bundle.js), plus the fake handset identity the rest of the
   * polyfill reports. */
  const __KAIOS_SETTINGS = (() => {
    const legacy = KAIOS_MODE === 'legacy';
    const apiVer = legacy ? 'v2.0' : 'v3.0';
    return {
      'deviceinfo.os': legacy ? '2.5' : '3.0.1',
      'deviceinfo.product_model': legacy ? 'Alcatel Go Flip 2' : 'Nokia 8110 4G',
      'deviceinfo.hardware': 'qcom',
      'deviceinfo.software': legacy ? 'KaiOS 2.5' : 'KaiOS 3.0.1',
      'deviceinfo.cu': '4044O-2AAQUS0',
      'deviceinfo.platform_build_id': '20210901103040',
      'deviceinfo.build_number': '4044O-2AAQUS0',
      'deviceinfo.platform_version': legacy ? '48.0' : '84.0',
      // KaiOS stores this as an integer. The Store validates its DeviceInfo
      // model with typeforce (`settings["ril.data.defaultServiceId"]: Number`)
      // and throws "expecting ... to be Number, got String" — which aborts the
      // whole boot at "Loading... (0%)" — if this comes back as "0".
      'ril.data.defaultServiceId': 0,
      'apps.serviceCenterUrl': 'https://api.kaiostech.com/' + apiVer,
      'apps.serviceCenter.microServiceUrl': 'https://api.kaiostech.com/kc_ksfe/v1.0',
      'apps.searchBaseUrl': 'https://search.kaiostech.com/v1.0',
      'apps.graphqlBaseUrl': 'https://api.store.kaiostech.com',
      'apps.graphql.key': 'vTPQIDW1Qc5PjgLDBdGDN8334Yil3fre334oToEn',
      'apps.analyticsEventBaseUrl': 'https://analytics.kaiostech.com/v1',
      'apps.serviceCenter.remoteUrl': 'https://kaios-plus.kaiostech.com',
      'identity.kaiaccounts.api.uri': 'https://api.kaiostech.com',
      'apps.serviceCenter.settingsEnabled': false,
      'store.coreUpdate.enable': false,
    };
  })();

  function __kaiosInstallSessionServices(api) {
    if (!api || typeof api !== 'object') return api;
    if (!api.settingsmanager) {
      api.settingsmanager = {
        get(name) {
          const key = Array.isArray(name) ? name[0] : name;
          const known = Object.prototype.hasOwnProperty.call(__KAIOS_SETTINGS, key);
          LOG('[kaios-sim] settingsmanager.get ' + JSON.stringify(key) +
            (known ? ' = ' + JSON.stringify(__KAIOS_SETTINGS[key]) : ' (unknown -> undefined)'));
          return Promise.resolve({ name: key, value: __KAIOS_SETTINGS[key] });
        },
        getBatch(names) {
          const arr = Array.isArray(names) ? names : [names];
          const flat = arr.flat ? arr.flat(Infinity) : arr;
          return Promise.resolve(flat.map((n) => ({ name: n, value: __KAIOS_SETTINGS[n] })));
        },
        set(records) { return Promise.resolve(records); },
        addObserver() { return Promise.resolve(); },
        removeObserver() { return Promise.resolve(); },
      };
    }
    ['powermanager', 'usbmanager', 'accountmanager',
      'tcpsocketmanager', 'telephonymanager', 'devicecapabilitymanager',
      'contactsmanager', 'audiovolumemanager', 'procmanager', 'timeservice',
    ].forEach((n) => { if (!api[n]) api[n] = __kaiosStubManager(n); });
    if (!api.session) api.session = { addEventListener() {}, removeEventListener() {} };
    /* appsmanager needs real return values: the store calls getApp() and
     * reads .manifestUrl off the result, and a bare undefined throws inside
     * transformCompatibleAppsObject() and kills the boot promise. (It also
     * cannot be a Proxy — a Proxy answers truthily for every property, so
     * "is it already the real one?" checks always pass.) */
    if (!api.appsmanager || api.appsmanager.__kaiosStub === true) {
      // NOTE: updateUrl must stay `undefined`, never null — the store does
      // `typeof updateUrl === "object" ? updateUrl.href : updateUrl` and
      // `typeof null === "object"`, so a null here throws "Cannot read
      // properties of null (reading 'href')" inside
      // APIAdapterHelper.transformCompatibleAppsObject().
      const emptyApp = (manifestUrl) => ({
        manifestUrl: manifestUrl || null,
        manifestURL: manifestUrl || null,
        name: null,
        version: null,
        updateUrl: undefined,
        removable: false,
        installState: 0,
        updateState: 'IDLE',
        manifest: { activities: {} },
      });
      /* The store installs through whichever entry point its bundle resolved
       * (bare `AppsManager` module global on a device, `window.api.appsmanager`
       * on the web origin). Both must reach the REAL pipeline — manifest fetch
       * → authenticated package download → kaios-install-file — otherwise
       * install_app lands on the catch-all stub, resolves `undefined` and the
       * Store silently drops the install. */
      const impl = window.__kaiosAppsServiceImpl;
      const safeList = (fn) => (...args) => {
        try {
          const r = fn.apply(impl, args);
          return (r && typeof r.then === 'function')
            ? r.catch((e) => { LOG('[kaios-sim] appsmanager list failed: ' + (e && e.message)); return []; })
            : Promise.resolve(r);
        } catch (e) { return Promise.resolve([]); }
      };
      const realApps = (impl && typeof impl.installPackage === 'function') ? {
        init: impl.init,
        getApp: impl.getApp,
        getAll: safeList(impl.getAll),
        getApps: safeList(impl.getApps),
        getInstalled: safeList(impl.getApps),
        getUpdatePolicy: impl.getUpdatePolicy,
        setUpdatePolicy: impl.setUpdatePolicy,
        checkForUpdate: impl.checkForUpdate,
        update: impl.update,
        cancelDownload: impl.cancelDownload,
        installPackage: impl.installPackage,
        installPwa: impl.installPwa,
        install: impl.installPackage,
        uninstall: impl.uninstall,
        AppsServiceError: impl.AppsServiceError,
        AppsUpdateState: impl.AppsUpdateState,
        AppsInstallState: impl.AppsInstallState,
        ConnectionType: impl.ConnectionType,
        ClearType: impl.ClearType,
      } : {
        getApp: (manifestUrl) => Promise.resolve(emptyApp(manifestUrl)),
        // Collection calls must resolve to an array: the store chains
        // .filter()/.map() straight onto the result.
        getAll: () => Promise.resolve([]),
        getInstalled: () => Promise.resolve([]),
        getApps: () => Promise.resolve([]),
        getUpdatePolicy: () => Promise.resolve('auto-update-off'),
      };
      api.appsmanager = Object.assign(__kaiosStubManager('appsmanager'), {
        __kaiosReal: true,
        getSelf: () => Promise.resolve(emptyApp(null)),
        getBookmarks: () => Promise.resolve([]),
        /* Service event constants. The Store does NOT subscribe on this object
         * directly: `shared.localhost/js/session/apps_manager/apps_manager.js`
         * replaces the global `AppsManager` with its daemon client, and that
         * client forwards every subscription here as
         *   api.appsmanager.addEventListener(api.appsmanager.APP_INSTALLED_EVENT, cb)
         * (see its getServiceEventList()). With these constants undefined the
         * key became `undefined`, so the forwarded listener could never match
         * an emitted event — the shell's handleInstalled never ran and the
         * detail page stayed on "正在安装" until the app was restarted.
         * Values mirror the event names we emit on the bus. */
        APP_DOWNLOAD_FAILED_EVENT: 'download_failed',
        APP_INSTALLED_EVENT: 'install',
        APP_INSTALLING_EVENT: 'installing',
        APP_UNINSTALLED_EVENT: 'uninstall',
        APP_UPDATE_AVAILABLE_EVENT: 'update_available',
        APP_UPDATED_EVENT: 'update',
        APP_UPDATING_EVENT: 'updating',
        APPSTATUS_CHANGED_EVENT: 'status_changed',
        // Real event wiring: the install pipeline reports on the shared bus.
        addEventListener: (t, cb) => __kaiosAppsBus.on(t, cb),
        removeEventListener: (t, cb) => __kaiosAppsBus.off(t, cb),
      }, realApps);
    }
    return api;
  }

  /* The session scripts build their observers by extending a base class that
   * lives in the per-service lib module (lib_accounts.AccountObserverBase,
   * lib_settings.SettingObserverBase, ...) — modules the simulator never
   * loads, because they come from the 127.0.0.1 daemon. Without them,
   * firing "services-load-complete" makes AccountManager.createObserver()
   * throw "lib_accounts is not defined". */
  (function __kaiosInstallLibBases() {
    class KaiosObserverBase {
      constructor(id, session) { this.id = id; this.session = session; }
      display() { return 'observer'; }
      callback() { return Promise.resolve(); }
    }
    const bases = {
      lib_accounts: 'AccountObserverBase',
      lib_settings: 'SettingObserverBase',
      lib_powermanager: 'PowerObserverBase',
      lib_apps: 'AppObserverBase',
      lib_telephony: 'TelephonyObserverBase',
      lib_contacts: 'ContactObserverBase',
      lib_audiovolume: 'AudioVolumeObserverBase',
      lib_devicecapability: 'DeviceCapabilityObserverBase',
      lib_time: 'TimeObserverBase',
      lib_usbmanager: 'UsbObserverBase',
      lib_tcpsocket: 'TcpSocketObserverBase',
      lib_procmanager: 'ProcObserverBase',
    };
    for (const lib of Object.keys(bases)) {
      if (!window[lib]) {
        try { window[lib] = { [bases[lib]]: KaiosObserverBase }; } catch (e) { /* ignore */ }
      } else if (!window[lib][bases[lib]]) {
        try { window[lib][bases[lib]] = KaiosObserverBase; } catch (e) { /* ignore */ }
      }
    }

    /* apps_manager.js's updateDefaultConsts() does
     *   ({ AppsInstallState, AppsServiceError, AppsServiceState, AppsStatus,
     *      AppsUpdateState, ClearType, ConnectionType } = lib_apps)
     * and overwrites its own defaults with whatever it finds there. Our
     * lib_apps exists (it carries AppObserverBase) but shipped no constants,
     * so the first `services-load-observer` would have replaced every enum
     * with `undefined` — and the Store compares installState against
     * AppsManager.AppsInstallState.INSTALLED on every getInstalledApps() call.
     * Supply the real KaiOS values so the takeover is lossless. */
    try {
      const libApps = window.lib_apps || (window.lib_apps = {});
      const addIf = (k, v) => { if (!libApps[k]) libApps[k] = v; };
      addIf('AppsInstallState', { INSTALLED: 0, INSTALLING: 1, PENDING: 2 });
      addIf('AppsServiceState', { INITIALIZING: 0, RUNNING: 1, TERMINATING: 2 });
      addIf('AppsStatus', { ENABLED: 0, DISABLED: 1 });
      addIf('AppsUpdateState', { IDLE: 0, AVAILABLE: 1, DOWNLOADING: 2, UPDATING: 3, PENDING: 4 });
      addIf('ClearType', { BROWSER: 0, STORAGE: 1 });
      addIf('ConnectionType', { WI_FI_ONLY: 0, ANY: 1 });
      addIf('AppsServiceError', {
        APP_NOT_FOUND: 0, CANCELED: 1, CLEAR_DATA_ERROR: 2, DEPENDENCIES_ERROR: 3,
        DISK_SPACE_NOT_ENOUGH: 4, DOWNLOAD_MANIFEST_FAILED: 5, DOWNLOAD_PACKAGE_FAILED: 6,
        DUPLICATED_ACTION: 7, INVALID_APP_NAME: 8, INVALID_START_URL: 9, INVALID_STATE: 10,
        INVALID_MANIFEST: 11, INVALID_PACKAGE: 12, INVALID_SIGNATURE: 13,
        INVALID_CERTIFICATE: 14, NETWORK_FAILURE: 15, FILESYSTEM_FAILURE: 16,
        PACKAGE_CORRUPT: 17, REGISTRATION_ERROR: 18, REINSTALL_FORBIDDEN: 19,
        UPDATE_ERROR: 20, UNKNOWN_ERROR: 21,
      });
    } catch (e) { /* ignore */ }
  })();

  __kaiosInstallSessionServices(window.api);
  try {
    let _apiCurrent = window.api;
    Object.defineProperty(window, 'api', {
      configurable: true,
      get() { return _apiCurrent; },
      set(v) { _apiCurrent = __kaiosInstallSessionServices(v || {}); },
    });
  } catch (e) { /* ignore */ }

  /* Fire the event the session daemon would have fired. Idempotent: a
   * second dispatch only re-runs convertToGetBatch() against an already
   * drained queue. */
  let __servicesFired = false;
  function __kaiosFireServicesLoadComplete(why) {
    try {
      __kaiosInstallSessionServices(window.api);
      __kaiosFireServicesLoadObserver(why);
      window.dispatchEvent(new Event('services-load-complete'));
      if (!__servicesFired) {
        __servicesFired = true;
        LOG('[kaios-sim] fired services-load-complete (' + why + ')');
      }
    } catch (e) {
      LOG('[kaios-sim] services-load-complete dispatch failed: ' + e.message);
    }
  }

  /* `services-load-observer` and `services-load-complete` are a pair: the real
   * daemon client (lib_session.sessionInit) dispatches the observer event
   * first, then the complete event. We only ever fired the latter.
   *
   * Why that matters here: `shared.localhost/js/session/apps_manager/apps_manager.js`
   * replaces the global `AppsManager` with its own daemon client. That client
   * keeps connected=false until it sees `services-load-observer`, and while
   * disconnected its addEventListener() merely buffers callbacks in
   * `eventListenerInfo` — it never forwards them to `window.api.appsmanager`.
   * Result: the Store's `startEventListeners()` looked successful but our bus
   * stayed empty ("appsmanager event install -> 0 listener(s)"), no
   * handleInstalled, no `mozapp_update` to the remote catalog, and the detail
   * page sat on "正在安装" until the whole app was restarted.
   *
   * Fired once, and only after the deferred session scripts have parsed —
   * a dispatch while readyState is still "loading" would reach nobody. */
  let __servicesObserverFired = false;
  function __kaiosFireServicesLoadObserver(why) {
    if (__servicesObserverFired) return;
    try { if (document.readyState === 'loading') return; } catch (e) { /* keep going */ }
    try {
      __kaiosInstallSessionServices(window.api);
      window.dispatchEvent(new Event('services-load-observer'));
      __servicesObserverFired = true;
      LOG('[kaios-sim] fired services-load-observer (' + why + ')');
    } catch (e) {
      LOG('[kaios-sim] services-load-observer dispatch failed: ' + e.message);
    }
  }
  try {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => __kaiosFireServicesLoadObserver('DOMContentLoaded'));
    } else {
      __kaiosFireServicesLoadObserver('early');
    }
    window.addEventListener('load', () => __kaiosFireServicesLoadObserver('load'));
  } catch (e) { /* ignore */ }

  /* Wiring report: says, in one line, whether the session client took over the
   * `AppsManager` global, whether it considers itself connected, and how many
   * install listeners the Store managed to register. If this prints
   * `install-listeners=0`, nothing can ever flip the Store's UI and the
   * surrounding numbers say why. */
  [600, 1500, 3000].forEach((ms) => setTimeout(() => {
    try {
      const g = window.AppsManager;
      const kind = g === window.__kaiosAppsServiceImpl ? 'polyfill'
        : (g && typeof g.connected !== 'undefined' ? 'session-client' : 'other');
      LOG('[kaios-sim] appsmanager wiring: global=' + kind +
        ' connected=' + !!(g && g.connected) +
        ' observer=' + __servicesObserverFired +
        ' install-listeners=' + __kaiosAppsBus.count('install'));
    } catch (e) { /* ignore */ }
  }, ms));

  // SettingsObserver: system settings observation service. KaiStore's entry calls
  // SettingsObserver.init(); many modules use .observe/.unobserve/.getValue/.setValue.
  // In the simulator there is no live settings daemon, so observers never fire and
  // getValue() resolves to undefined (apps fall back to their built-in defaults).
  // It is referenced as a bare global, so it must live on window.
  if (!window.__kaiosSOReal) {
    const _obsStore = new Map(); // key -> Set of callbacks
    const _realSO = {
      init() { LOG('[SettingsObserver.init]'); },
      observe(key, defaultValue, callback) {
        LOG('[SettingsObserver.observe] key=' + JSON.stringify(key));
        if (!_obsStore.has(key)) _obsStore.set(key, new Set());
        if (callback) _obsStore.get(key).add(callback);
      },
      unobserve(key, callback) {
        LOG('[SettingsObserver.unobserve] key=' + JSON.stringify(key));
        const s = _obsStore.get(key);
        if (s && callback) s.delete(callback);
      },
      getValue(key) {
        LOG('[SettingsObserver.getValue] key=' + JSON.stringify(key));
        return Promise.resolve(undefined);
      },
      setValue(records) {
        LOG('[SettingsObserver.setValue] records=' + JSON.stringify(records));
        return Promise.resolve();
      },
    };
    window.__kaiosSOReal = _realSO;
    const _soProxy = new Proxy(_realSO, {
      get(target, prop, recv) {
        const v = target[prop];
        if (typeof v === 'function') {
          return function (...args) {
            LOG('[SettingsObserver.PROXY] -> ' + String(prop) + '(' + args.map(a => typeof a === 'string' ? JSON.stringify(a) : typeof a).join(', ') + ')');
            try { return v.apply(target, args); } catch (e) { LOG('[SettingsObserver.PROXY] error in ' + String(prop) + ': ' + e.message); throw e; }
          };
        }
        return v;
      },
    });
    // Trap reassignment so we can see if the app/bundle swaps our object.
    let _soCurrent = _soProxy;
    try {
      Object.defineProperty(window, 'SettingsObserver', {
        configurable: true,
        enumerable: true,
        get() { return _soCurrent; },
        set(v) {
        LOG('[SettingsObserver.ASSIGN] bundle set window.SettingsObserver -> ' + (v && (v.constructor ? v.constructor.name : typeof v)));
        try {
          if (v && typeof v.getValue === 'function') LOG('[SettingsObserver.BUNDLE getValue src] ' + v.getValue.toString().slice(0, 500));
          if (v && typeof v.init === 'function') LOG('[SettingsObserver.BUNDLE init src] ' + v.init.toString().slice(0, 400));
          if (v && typeof v.observe === 'function') LOG('[SettingsObserver.BUNDLE observe src] ' + v.observe.toString().slice(0, 400));
          const keys = v ? Object.keys(v) : [];
          LOG('[SettingsObserver.BUNDLE keys] ' + JSON.stringify(keys));
        } catch (e) { LOG('[SettingsObserver.ASSIGN] introspect err ' + e.message); }
        _soCurrent = v;
        // The shared runtime's getValue() only resolves once taskScheduler
        // is connected, and that only happens on "services-load-complete".
        // Fire it right after the app calls init() — by then its listeners
        // (and TaskScheduler's, registered when the shared script loaded)
        // are in place.
        try {
          if (v && typeof v.init === 'function' && !v.__kaiosInitPatched) {
            const origInit = v.init;
            v.init = function patchedInit() {
              const r = origInit.apply(this, arguments);
              setTimeout(() => __kaiosFireServicesLoadComplete('SettingsObserver.init'), 0);
              return r;
            };
            v.__kaiosInitPatched = true;
          }
        } catch (e) { LOG('[kaios-sim] SettingsObserver init patch err ' + e.message); }
      },
      });
    } catch (e) {
      window.SettingsObserver = _soProxy;
    }
    // Fallback: some entry points never call init(). Repeat a few times so
    // we land after the shared session scripts have registered listeners.
    [400, 1200, 2500, 5000].forEach((ms) => {
      setTimeout(() => __kaiosFireServicesLoadComplete('timer ' + ms + 'ms'), ms);
    });
  }

  // asyncStorage: KaiStore uses the bare global `asyncStorage` (key/value, callback
  // API) in ~34 places. Provide an in-memory implementation so modules that read
  // cached settings at load time don't throw a ReferenceError — such a throw would
  // otherwise cascade and break the utils service KaiStore pulls getCommsInfo from.
  if (!window.asyncStorage) {
    const _kv = new Map();
    window.asyncStorage = {
      setItem(key, value, callback) {
        _kv.set(key, value);
        if (typeof callback === 'function') setTimeout(() => callback(), 0);
        return Promise.resolve();
      },
      getItem(key, callback) {
        const v = _kv.has(key) ? _kv.get(key) : null;
        if (typeof callback === 'function') setTimeout(() => callback(v), 0);
        return Promise.resolve(v);
      },
      removeItem(key, callback) {
        _kv.delete(key);
        if (typeof callback === 'function') setTimeout(() => callback(), 0);
        return Promise.resolve();
      },
      clear(callback) {
        _kv.clear();
        if (typeof callback === 'function') setTimeout(() => callback(), 0);
        return Promise.resolve();
      },
    };
  }

  // DeviceCapabilityManager: KaiStore's SystemApp service reads feature flags
  // via DeviceCapabilityManager.get(DEVICE_CAPABILITY_KEY.*).then(...). The
  // store only inspects the resolved boolean (e.g. isWiFiCertified), so a stub
  // that resolves a sane default is enough for the UI to render.
  if (!window.DeviceCapabilityManager) {
    window.DeviceCapabilityManager = {
      get(key) { return Promise.resolve(false); },
      set() { return Promise.resolve(); },
      addEventListener() {}, removeEventListener() {},
    };
  }

  // AppOrigin: KaiStore uses AppOrigin.getManifestURL("kaios-plus"|"kaios-pay")
  // to build manifest URLs fed into AppsManager.getApp(). Returns a plausible
  // app:// URL so the store's self/update lookups resolve (to null) gracefully.
  if (!window.AppOrigin) {
    window.AppOrigin = {
      getManifestURL(name) {
        const id = name ? String(name).toLowerCase().replace(/[^a-z0-9]/g, '-') : 'unknown';
        return 'app://' + id + '/manifest.webmanifest';
      },
      addEventListener() {}, removeEventListener() {},
    };
  }

  // b2g.mobileConnections: KaiStore reads connection[0].iccId and the SIM
  // info block. Present two plausible SIM connections with valid iccId,
  // deviceIdentities (IMEI) and registered voice/data networks.
  if (navigator.b2g && !navigator.b2g.mobileConnections) {
    navigator.b2g.mobileConnections = [_fakeMobileConnection(0), _fakeMobileConnection(1)];
  }

  // b2g.iccManager: ensure getIccById/getIcc return a fake Icc with a valid
  // iccId/msisdn so callers that read SIM info don't crash on null. getIcc
  // returns a DOMRequest (stubOk); getIccById returns the Icc object directly
  // (KaiOS 3 synchronous signature).
  if (navigator.b2g && navigator.b2g.iccManager) {
    const im = navigator.b2g.iccManager;
    if (!im.iccIds) im.iccIds = [FAKE_DEVICE.iccid];
    if (!im.getIccById) im.getIccById = (id) => _fakeIcc(id || FAKE_DEVICE.iccid);
    if (!im.getIcc) im.getIcc = (id) => stubOk(_fakeIcc(id || FAKE_DEVICE.iccid));
  }

  // b2g.authorizationManager: KaiStore's AccountManager.getDeviceToken() calls
  // navigator.b2g.authorizationManager.getRestrictedToken("service") to obtain
  // a restricted token for its API auth. We fetch a REAL token from
  // api.kaiostech.com (machine identity is faked, but the request hits the real
  // backend) and return the well-formed {kid, macKey, type, expiresInSeconds,
  // token} object the Store's setToken() expects. With a real kid + mac_key the
  // Store's HawkRequester can authenticate every catalog / manifest / package
  // request against the live KaiOS Store backend.
  if (navigator.b2g && !navigator.b2g.authorizationManager) {
    navigator.b2g.authorizationManager = {
      getRestrictedToken() {
        LOG('[kaios-sim] getRestrictedToken called by store');
        return __kaiosStoreToken().then((tok) => ({
          kid: tok.kid,
          macKey: tok.macKey,
          type: 0, // 0 = RESTRICTED (per store's setToken: 0===type?"RESTRICTED":"ACCOUNT")
          expiresInSeconds: tok.expiresInSeconds,
          token: tok.accessToken,
        }));
      },
      getAccount() { return Promise.resolve(null); },
    };
  }

  // mozApps.installing / mozApps.installed: KaiStore tracks install state
  // through these (object index + Map semantics on the device).
  const ma = navigator.mozApps;
  if (ma) {
    if (!ma.installing) ma.installing = {};
    if (!ma.installed) ma.installed = new Map();
  }
})();

/* ------------------------------------------------------------------ */
/* systemXHR emulation                                                 */
/* ------------------------------------------------------------------ */
/* Privileged KaiOS apps declare the "systemXHR" permission and build   */
/* cross-origin requests with `new XMLHttpRequest({mozSystem:true})`.   */
/* On the device Gecko then:                                           */
/*   (a) reports xhr.mozSystem === true,                               */
/*   (b) lets the app set Referer/Origin/User-Agent/Cookie on them,     */
/*   (c) skips the CORS check entirely.                                */
/* Chromium does none of the three, so apps like Bilibili detect the    */
/* missing permission ("systemXHR permission is not active") and refuse */
/* to touch their media stack at all.                                  */
/*                                                                     */
/* This shim subclasses XMLHttpRequest:                                */
/*   - {mozSystem:true} — or ANY xhr created inside an app:// page      */
/*     (covers libraries such as flv.js that build plain XHRs and      */
/*     expect the app permission to cover them) — marks the instance   */
/*     with mozSystem = true;                                          */
/*   - setRequestHeader() for the Gecko-restricted header names stashes */
/*     the value instead of letting Chromium silently drop it;         */
/*   - send() re-attaches the stash as X-KaiOS-Sys-Hdr-<name> headers   */
/*     plus an X-KaiOS-Sys-Xhr marker. The main process (session       */
/*     .webRequest) rewrites those back to the real header names and   */
/*     answers with permissive CORS headers — which is exactly what a  */
/*     System XHR looks like on the wire.                              */

(function defineSystemXHR() {
  if (window.__kaiosSysXHR) return;
  const NativeXHR = window.XMLHttpRequest ||
    (typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest : null);
  if (typeof NativeXHR !== 'function') return;

  // Headers Gecko's System XHR may set but the Fetch spec forbids on a
  // regular XHR (Chromium drops them from setRequestHeader()).
  // `authorization` is included: the KaiOS Store's HawkRequester signs every
  // API call and sets it via setRequestHeader('Authorization', 'Hawk ...') —
  // we stash + re-attach it explicitly so it always reaches the server.
  const SYS_HEADERS = new Set([
    'referer', 'origin', 'user-agent', 'cookie', 'cookie2',
    'host', 'connection', 'proxy-authorization', 'sec-fetch-mode',
    'authorization',
  ]);
  const MARK = 'x-kaios-sys-hdr-';
  const FLAG = 'x-kaios-sys-xhr';
  const ANON = 'x-kaios-sys-anon';
  // A sub-frame (e.g. an ad/player iframe an app embeds) belongs to the same
  // app even when its own URL is https://, so it inherits the app's
  // privileges — the same way the parent's app origin does in Gecko.
  const isChildFrame = (() => {
    try { return !!(window.parent && window.parent !== window); } catch (e) { return false; }
  })();
  const inAppPage = (() => {
    try { return location.protocol === 'app:'; } catch (e) { return false; }
  })() || isChildFrame;

  class KaiSystemXHR extends NativeXHR {
    constructor(options) {
      super();
      this.mozSystem = !!(options && options.mozSystem) || inAppPage;
      // Gecko-only XHR flags: mozAnon = drop cookies/credentials
      // (10-16 real packages use it), mozBackgroundRequest = low priority.
      this.mozAnon = !!(options && options.mozAnon);
      this.mozBackgroundRequest = !!(options && options.mozBackgroundRequest);
      this._sysHeaders = null;
      this._allHeaders = {};
      this._sysStamped = false;
      this._method = 'GET';
      this._url = '';
      this._responseType = '';
      this._chunk = null;
    }
    // Chromium rejects unknown responseType values (it would silently reset to
    // ''), so the Gecko-only streaming type is kept on the instance.
    get responseType() { return this._responseType; }
    set responseType(v) {
      this._responseType = String(v);
      if (this._responseType !== 'moz-chunked-arraybuffer') {
        try { super.responseType = this._responseType; } catch (e) { /* ignore */ }
      }
    }
    setRequestHeader(name, value) {
      const lower = String(name).toLowerCase();
      this._allHeaders[String(name)] = String(value);
      if (SYS_HEADERS.has(lower)) {
        if (this.mozSystem) {
          if (!this._sysHeaders) this._sysHeaders = {};
          this._sysHeaders[lower] = String(value);
          return;
        }
        // Inside an app this should never happen. Report the caller instead
        // of letting Chromium silently drop the header (which is what makes
        // apps log `Refused to set unsafe header "Cookie"`).
        try {
          LOG('[kaios-sim] restricted header ' + name + ' set on a NON-system XHR' +
            ' (Chromium will drop it): ' + (new Error().stack || ''));
        } catch (e) { /* ignore */ }
      }
      super.setRequestHeader(name, value);
    }
    open(method, url) {
      this._sysStamped = false;
      this._method = String(method || 'GET').toUpperCase();
      this._url = String(url);
      return super.open.apply(this, arguments);
    }
    send(body) {
      if (this.mozSystem && !this._sysStamped) {
        this._sysStamped = true;
        try { super.setRequestHeader(FLAG, '1'); } catch (e) { /* ignore */ }
        if (this.mozAnon) {
          try { super.setRequestHeader(ANON, '1'); } catch (e) { /* ignore */ }
        }
        if (this._sysHeaders) {
          for (const key of Object.keys(this._sysHeaders)) {
            try { super.setRequestHeader(MARK + key, this._sysHeaders[key]); } catch (e) { /* ignore */ }
          }
        }
      }
      // Gecko's `moz-chunked-arraybuffer` streams the body chunk by chunk;
      // apps (live FLV / radio players) read the current chunk from
      // xhr.response inside a `progress` handler. Chromium has no such mode,
      // so it is emulated with fetch() + a ReadableStream reader.
      if (this._responseType === 'moz-chunked-arraybuffer') {
        try { return this._sendChunked(body); } catch (e) { /* falls through */ }
      }
      return super.send.apply(this, arguments);
    }
    _sendChunked(body) {
      const self = this;
      const init = {
        method: this._method,
        headers: this._allHeaders || {},
        credentials: this.withCredentials ? 'include' : 'same-origin',
      };
      if (body != null && this._method !== 'GET' && this._method !== 'HEAD') init.body = body;
      Object.defineProperty(this, 'response', {
        configurable: true,
        get() { return self._chunk; },
      });
      // readyState/status/statusText are read-only accessors on the prototype
      // (assigning them throws in strict mode), so they are shadowed by own
      // data properties on this instance. `response` returns the latest chunk.
      const shadow = (name, value) => {
        try {
          Object.defineProperty(this, name, { value, configurable: true, writable: true });
        } catch (e) { /* ignore */ }
      };
      const finish = (evt) => {
        try { self.dispatchEvent(new Event(evt)); } catch (e) { /* ignore */ }
      };
      fetch(this._url, init).then((res) => {
        shadow('status', res.status);
        shadow('statusText', res.statusText);
        shadow('readyState', 2); // HEADERS_RECEIVED
        finish('readystatechange');
        const reader = res.body && typeof res.body.getReader === 'function' ? res.body.getReader() : null;
        if (!reader) {
          // No streaming support: hand the whole body over as one chunk.
          return res.arrayBuffer().then((buf) => { self._chunk = buf; return null; });
        }
        let loaded = 0;
        const pump = () => reader.read().then((r) => {
          if (r.done) return null;
          self._chunk = r.value;
          loaded += r.value ? r.value.byteLength : 0;
          try {
            self.dispatchEvent(new ProgressEvent('progress', {
              lengthComputable: false, loaded, total: 0,
            }));
          } catch (e) { /* ignore */ }
          return pump();
        });
        return pump();
      }).then(() => {
        self._chunk = null;
        finish('load');
        finish('loadend');
      }).catch(() => {
        finish('error');
        finish('loadend');
      });
    }
  }

  window.XMLHttpRequest = KaiSystemXHR;

  // fetch() drops the very same headers *silently* (no console warning), so
  // an app that sends its login cookie / Authorization through fetch just
  // loses it. Route those through the marker headers as well, without touching
  // anything else: a request without restricted headers is forwarded
  // byte-for-byte. (CORS for cross-origin app requests — including plain
  // fetches to the KaiOS API — is granted host-based in the main process.)
  const NativeFetch = typeof window.fetch === 'function' ? window.fetch : null;
  if (NativeFetch && inAppPage) {
    window.fetch = function kaiosFetch(input, init) {
      try {
        const h = init && init.headers;
        if (h) {
          let entries = null;
          if (typeof Headers !== 'undefined' && h instanceof Headers) entries = Array.from(h.entries());
          else if (Array.isArray(h)) entries = h.slice();
          else if (typeof h.forEach === 'function') { entries = []; h.forEach((v, k) => entries.push([k, v])); }
          else if (typeof h === 'object') entries = Object.keys(h).map((k) => [k, h[k]]);
          const moved = (entries || []).filter((pair) => SYS_HEADERS.has(String(pair[0]).toLowerCase()));
          if (moved.length) {
            const keep = {};
            (entries || []).forEach((pair) => {
              if (!SYS_HEADERS.has(String(pair[0]).toLowerCase())) keep[pair[0]] = pair[1];
            });
            keep[FLAG] = '1';
            moved.forEach((pair) => { keep[MARK + String(pair[0]).toLowerCase()] = pair[1]; });
            init = Object.assign({}, init, { headers: keep });
          }
        }
      } catch (e) { /* never break the app's fetch */ }
      return NativeFetch.call(window, input, init);
    };
  }

  window.__kaiosSysXHR = true;
  LOG('[kaios-sim] systemXHR shim installed (app page: ' + inAppPage + ')');
})();

/* ------------------------------------------------------------------ */
/* corpus-driven compatibility layer                                   */
/* ------------------------------------------------------------------ */
/* tools/scan_apps_apis.py mined 1393 real KaiOS packages for the        */
/* Gecko / B2G surface they actually touch. Everything below is used by  */
/* real apps and missing from Chromium (and was missing here). Counts    */
/* are "number of packages referencing it":                             */
/*   b2g.audioChannelManager 14 · b2g.requestWakeLock 8 · wifiManager 4  */
/*   virtualCursor 4 · bluetooth 2 · externalapi 2 · power 1 ·           */
/*   audioVolumeManager 1 · MozBlobBuilder 60 · MozActivity 38 (above)   */
/*   mozIndexedDB 50 · mozURL 36 · moz-chunked-arraybuffer 10 (above)    */
/*   mozAnon 16 (above) · MozWebSocket 4 · MozSpeakerManager 2 ·         */
/*   mozRequestFullScreen 910 · mozFullScreen* 832 · mozHidden 859 ·     */
/*   mozImageSmoothingEnabled 837 · mozBackingStorePixelRatio 830 ·      */
/*   mozSrcObject 28 · mozVibrate 30 · MozTransform 35 · getDataStores 2 */
/*                                                                      */
/* NOTE: navigator.getDeviceStorages() is deliberately NOT defined — on  */
/* real KaiOS 3.x it was removed and apps use `typeof navigator          */
/* .getDeviceStorages === 'function'` to detect the pre-3.0 generation.  */

(function corpusCompat() {
  if (window.__kaiosCorpusCompat) return;
  window.__kaiosCorpusCompat = true;

  const listeners = () => ({
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
  });
  const done = (v) => Promise.resolve(v);

  function add(target, name, value) {
    try {
      if (target && !(name in target)) {
        Object.defineProperty(target, name, { value, configurable: true, writable: true });
      }
    } catch (e) { /* ignore */ }
  }

  /* ---- navigator.b2g: services apps reach for directly --------------- */
  const b2g = navigator.b2g;

  // KaiOS audio channels: content/notification/alarm/telephony/ringer...
  const CHANNELS = ['normal', 'content', 'notification', 'alarm', 'telephony', 'ringer', 'background', 'system'];
  const audioChannelManager = Object.assign(listeners(), {
    volumeMaster: 1,
    headphones: false,
    telephonySpeaker: false,
    audioCompeting: false,
    allowedAudioChannels: CHANNELS,
    setVolume(channel, volume) { done(volume); return done({ channel, volume }); },
    getVolume(channel) { return done({ channel, volume: 1 }); },
    getVolumeControlChannels() { return done(CHANNELS.slice()); },
    setAudioChannelMuted(channel, muted) { return done({ channel, muted }); },
    isAudioChannelMuted(channel) { return done({ channel, muted: false }); },
    requestAudioChannel(channel) { return done(channel); },
    releaseAudioChannel() { return done(true); },
  });

  add(b2g, 'audioChannelManager', audioChannelManager);
  add(b2g, 'AudioChannelManager', function AudioChannelManager() { return audioChannelManager; });

  // WakeLock: `navigator.requestWakeLock('cpu'|'screen'|'wifi')` -> lock.unlock()
  function makeWakeLock(topic) {
    // (Object.assign would copy a getter's *value*, so unlock() is assigned
    // afterwards and flips the plain property instead.)
    const lock = Object.assign(listeners(), { topic: topic, unlocked: false });
    lock.unlock = function unlock() {
      lock.unlocked = true;
      try { lock.dispatchEvent(new Event('unlocked')); } catch (e) { /* ignore */ }
    };
    return lock;
  }
  add(b2g, 'requestWakeLock', makeWakeLock);
  add(navigator, 'requestWakeLock', makeWakeLock);
  add(window, 'WakeLock', function WakeLock(topic) { return makeWakeLock(topic); });

  add(b2g, 'wifiManager', Object.assign(listeners(), {
    enabled: false, connected: false, macAddress: '02:00:00:00:00:00',
    connection: { status: 'disconnected', ssid: null, signalStrength: 0 },
    getNetworks() { return done([]); },
    associate() { return done(false); },
    forget() { return done(false); },
    setWifiEnabled(v) { return done(!!v); },
    getKnownNetworks() { return done([]); },
  }));

  add(b2g, 'bluetooth', Object.assign(listeners(), {
    enabled: false, state: 'disabled',
    getDefaultAdapter() { return done(null); },
    setEnabled(v) { return done(!!v); },
  }));

  // Real host battery, mirrored from the main process. The shell forwards the
  // current value over the 'kaios:battery' channel (and on AC<->battery switches
  // every minute); we also request a fresh reading on load. Desktop machines
  // without a battery are reported as 100% on AC by the host.
  const batteryInfo = { level: 1, charging: true };
  try {
    ipcRenderer.on('kaios:battery', (e, info) => {
      if (info && typeof info.level === 'number') batteryInfo.level = info.level;
      if (info) batteryInfo.charging = !!info.charging;
    });
    ipcRenderer.sendToHost('kaios:battery:request');
  } catch (e) { /* webview without IPC (e.g. unit test) */ }

  add(b2g, 'power', Object.assign(listeners(), {
    screenEnabled: true, cpuSleepAllowed: true, brightness: 1,
    setScreenEnabled(v) { return done(!!v); },
    setCpuSleepAllowed(v) { return done(!!v); },
    setBrightness(v) { return done(v); },
    getBattery() {
      try { ipcRenderer.sendToHost('kaios:battery:request'); } catch (e2) {}
      return done({ level: batteryInfo.level, charging: batteryInfo.charging });
    },
  }));

  // KaiOS volume API used by a few players (separate from volumeManager).
  add(b2g, 'audioVolumeManager', Object.assign(listeners(), {
    getVolume(channel) { return done(1); },
    setVolume(channel, v) { return done(v); },
    requestUp() { return done(1); },
    requestDown() { return done(1); },
    requestShow() { return done(true); },
  }));

  // Virtual cursor (pointer drawn on screen for TV / non-touch devices).
  add(b2g, 'virtualCursor', Object.assign(listeners(), {
    enabled: false, visible: false, x: 0, y: 0,
    show() { return done(true); }, hide() { return done(false); },
    move(x, y) { return done({ x, y }); },
    setEnabled(v) { return done(!!v); },
  }));

  // navigator.b2g.externalapi: vendor hook a couple of apps probe.
  add(b2g, 'externalapi', Object.assign(listeners(), {
    call() { return done(null); }, get() { return done(null); }, set() { return done(true); },
  }));

  add(b2g, 'speakerManager', Object.assign(listeners(), {
    speakerEnabled: false, forcespeaker: false,
    setSpeakerEnabled(v) { return done(!!v); },
    setForcespeaker(v) { return done(!!v); },
  }));

  /* ---- legacy Gecko aliases (bundled engines check every prefix) ----- */
  if (typeof window.indexedDB !== 'undefined') add(window, 'mozIndexedDB', window.indexedDB);
  if (typeof window.URL !== 'undefined') add(window, 'mozURL', window.URL);
  if (typeof window.WebSocket !== 'undefined') add(window, 'MozWebSocket', window.WebSocket);
  if (typeof window.requestAnimationFrame === 'function') {
    add(window, 'mozRequestAnimationFrame', window.requestAnimationFrame.bind(window));
    add(window, 'mozCancelAnimationFrame', window.cancelAnimationFrame
      ? window.cancelAnimationFrame.bind(window) : () => {});
  }
  if (typeof navigator.vibrate === 'function') {
    add(navigator, 'mozVibrate', navigator.vibrate.bind(navigator));
  }

  // MozBlobBuilder (pre-Blob Gecko builder): append() + getBlob().
  add(window, 'MozBlobBuilder', function MozBlobBuilder() {
    const parts = [];
    return {
      append(data) { parts.push(data); },
      getBlob(type) { return new Blob(parts, type ? { type } : undefined); },
      getFile(name) { return new File(parts, name || 'blob'); },
    };
  });
  add(window, 'MozSpeakerManager', function MozSpeakerManager() { return b2g && b2g.speakerManager; });

  // Full-screen + page-visibility vendor prefixes.
  try {
    const doc = document;
    const define = (obj, name, get) => {
      try {
        if (obj && !(name in obj)) {
          Object.defineProperty(obj, name, { get, configurable: true });
        }
      } catch (e) { /* ignore */ }
    };
    define(doc, 'mozHidden', () => !!doc.hidden);
    define(doc, 'mozVisibilityState', () => doc.visibilityState || 'visible');

    // Full-screen: KaiOS apps call requestFullscreen()/mozRequestFullScreen() to
    // go fullscreen on a real device. The simulator must NOT let that reach the
    // OS / Electron fullscreen (it would blow the 240x320 screen out of the
    // window and cover the desktop) — instead we route it to the shell's
    // *in-window* fullscreen (the app screen fills the simulator window with all
    // chrome hidden). The standard API promise is still resolved so app code
    // believes it entered/left fullscreen, and the standard fullscreen state
    // getters / change events are emulated so polling / listening apps keep
    // working. (The shell listens for `kaios:fullscreen` on the webview host.)
    try {
      const DOC = document;
      let winFsEl = null;
      const dispatchFs = () => {
        try {
          DOC.dispatchEvent(new Event('fullscreenchange'));
          DOC.dispatchEvent(new Event('mozfullscreenchange'));
          DOC.dispatchEvent(new Event('webkitfullscreenchange'));
        } catch (e2) {}
      };
      const enterFs = (el) => {
        winFsEl = el || DOC.documentElement;
        try { ipcRenderer.sendToHost('kaios:fullscreen', { on: true }); } catch (e2) {}
        dispatchFs();
        return Promise.resolve();
      };
      const exitFs = () => {
        winFsEl = null;
        try { ipcRenderer.sendToHost('kaios:fullscreen', { on: false }); } catch (e2) {}
        dispatchFs();
        return Promise.resolve();
      };
      const EP = typeof Element !== 'undefined' ? Element.prototype : null;
      if (EP) {
        if ('requestFullscreen' in EP) {
          EP.requestFullscreen = function () { return enterFs(this); };
        } else {
          Object.defineProperty(EP, 'requestFullscreen', {
            configurable: true, writable: true,
            value: function () { return enterFs(this); },
          });
        }
        for (const m of ['mozRequestFullScreen', 'webkitRequestFullscreen', 'msRequestFullscreen']) {
          try {
            if (!(m in EP)) {
              Object.defineProperty(EP, m, {
                configurable: true, writable: true,
                value: function () { return enterFs(this); },
              });
            }
          } catch (e2) {}
        }
      }
      DOC.exitFullscreen = function () { return exitFs(); };
      DOC.webkitExitFullscreen = function () { return exitFs(); };
      DOC.mozCancelFullScreen = function () { return exitFs(); };
      const elGetter = () => (winFsEl || null);
      const boolGetter = () => !!winFsEl;
      const stateDefs = [
        ['fullscreenElement', elGetter],
        ['webkitFullscreenElement', elGetter],
        ['mozFullScreenElement', elGetter],
        ['fullscreen', boolGetter],
        ['webkitIsFullScreen', boolGetter],
        ['mozFullScreen', boolGetter],
        ['fullscreenEnabled', () => true],
        ['mozFullScreenEnabled', () => true],
      ];
      for (const [name, get] of stateDefs) {
        try { Object.defineProperty(DOC, name, { configurable: true, get }); } catch (e2) {}
      }
    } catch (e2) { /* ignore */ }

    const MP = typeof HTMLMediaElement !== 'undefined' ? HTMLMediaElement.prototype : null;
    if (MP && !('mozSrcObject' in MP)) {
      Object.defineProperty(MP, 'mozSrcObject', {
        configurable: true,
        get() { return this.srcObject; },
        set(v) { this.srcObject = v; },
      });
    }
    // Canvas: `ctx.mozImageSmoothingEnabled = false` is how ~830 packages
    // disable smoothing; Chromium only knows the unprefixed property.
    const CP = typeof CanvasRenderingContext2D !== 'undefined' ? CanvasRenderingContext2D.prototype : null;
    if (CP && !('mozImageSmoothingEnabled' in CP)) {
      Object.defineProperty(CP, 'mozImageSmoothingEnabled', {
        configurable: true,
        get() { return this.imageSmoothingEnabled; },
        set(v) { this.imageSmoothingEnabled = !!v; },
      });
    }
    if (CP && !('mozBackingStorePixelRatio' in CP)) {
      Object.defineProperty(CP, 'mozBackingStorePixelRatio', {
        configurable: true, get() { return 1; }, set() { /* read-only in Gecko */ },
      });
    }
    // CSS: `el.style.MozTransform = ...` is a no-op in Chromium.
    const SP = typeof CSSStyleDeclaration !== 'undefined' ? CSSStyleDeclaration.prototype : null;
    const CSS_MAP = {
      MozTransform: 'transform', MozTransformOrigin: 'transformOrigin',
      MozTransition: 'transition', MozTransitionDuration: 'transitionDuration',
      MozTransitionProperty: 'transitionProperty', MozTransitionTimingFunction: 'transitionTimingFunction',
      MozAnimation: 'animation', MozAnimationName: 'animationName',
      MozAnimationDuration: 'animationDuration', MozAnimationDelay: 'animationDelay',
      MozAnimationIterationCount: 'animationIterationCount',
      MozUserSelect: 'userSelect', MozBoxSizing: 'boxSizing',
      MozPerspective: 'perspective', MozBackfaceVisibility: 'backfaceVisibility',
      MozAppearance: 'appearance', MozColumnCount: 'columnCount',
    };
    if (SP) {
      for (const mozName of Object.keys(CSS_MAP)) {
        if (mozName in SP) continue;
        const real = CSS_MAP[mozName];
        try {
          Object.defineProperty(SP, mozName, {
            configurable: true,
            get() { return this[real]; },
            set(v) { this[real] = v; },
          });
        } catch (e) { /* ignore */ }
      }
    }
  } catch (e) { /* ignore */ }

  // DataStore (navigator.getDataStores) — KaiOS exposes it for a few system
  // apps; returning "no stores" keeps callers on their fallback path.
  add(navigator, 'getDataStores', () => done([]));
})();

/* ------------------------------------------------------------------ */
/* startup log                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Gecko / FxOS surface Chromium never shipped                          */
/* ------------------------------------------------------------------ */
/* Mined from the 2.5 corpus (1611 packages) with tools/snippets.py; */
/* the minimal set that actually changes app behaviour — the rest of the */
/* moz* tokens in the corpus are `A || B || C` prefix probes that        */
/* Chromium's standard implementation already satisfies.                */
(function defineGeckoRemainder() {
  // Firefox detection: `window.mozInnerScreenX != null && /firefox/(ua)` is
  // how ~60 game bundles (Construct-2 "game.js", SeamlessLoop.js) pick their
  // audio backend. Chromium lacks the property, so a KaiOS UA + Chromium
  // engine combo makes them think they are NOT on Gecko.
  try {
    if (typeof window.mozInnerScreenX === 'undefined') {
      Object.defineProperty(window, 'mozInnerScreenX', { configurable: true, get: () => window.screenX || 0 });
      Object.defineProperty(window, 'mozInnerScreenY', { configurable: true, get: () => window.screenY || 0 });
    }
  } catch (e) { /* ignore */ }

  try {
    if (typeof screen !== 'undefined') {
      const SP = Object.getPrototypeOf(screen) === Object.prototype ? screen : Object.getPrototypeOf(screen);
      if (!('mozLockOrientation' in screen)) {
        // Gecko returns a boolean (true = locked). Chromium's own
        // screen.orientation.lock() is a promise and refuses without
        // fullscreen; apps guard the call, so reporting success keeps them on
        // the KaiOS path without touching the real window orientation.
        Object.defineProperty(SP, 'mozLockOrientation', {
          configurable: true, writable: true,
          value: function mozLockOrientation(orientation) {
            try {
              if (screen.orientation && typeof screen.orientation.lock === 'function') {
                const p = screen.orientation.lock(String(orientation || 'portrait'));
                if (p && typeof p.catch === 'function') p.catch(() => {});
              }
            } catch (e) { /* ignore */ }
            return true;
          },
        });
        Object.defineProperty(SP, 'mozUnlockOrientation', {
          configurable: true, writable: true,
          value: function mozUnlockOrientation() {
            try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
            return true;
          },
        });
        Object.defineProperty(SP, 'mozOrientation', {
          configurable: true,
          get() { return (screen.orientation && screen.orientation.type) || 'portrait-primary'; },
        });
      }
    }
  } catch (e) { /* ignore */ }

  // Element.mozMatchesSelector — jQuery/Zepto probe it directly.
  try {
    const EP = typeof Element !== 'undefined' ? Element.prototype : null;
    if (EP && !('mozMatchesSelector' in EP)) {
      Object.defineProperty(EP, 'mozMatchesSelector', {
        configurable: true, writable: true,
        value: function mozMatchesSelector(sel) { return this.matches(sel); },
      });
      if (!('msMatchesSelector' in EP)) {
        Object.defineProperty(EP, 'msMatchesSelector', {
          configurable: true, writable: true,
          value: function msMatchesSelector(sel) { return this.matches(sel); },
        });
      }
    }
  } catch (e) { /* ignore */ }

  // XMLHttpRequest.mozResponseArrayBuffer / .mozResponse — Gecko's binary
  // response accessors (pdf.js and the Construct-2 loader feature-detect them
  // straight on the prototype: `"mozResponseArrayBuffer" in
  // XMLHttpRequest.prototype`).
  try {
    const XP = typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest.prototype : null;
    if (XP && !('mozResponseArrayBuffer' in XP)) {
      const latin1 = (s) => {
        const out = new Uint8Array(s.length);
        for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
        return out.buffer;
      };
      Object.defineProperty(XP, 'mozResponseArrayBuffer', {
        configurable: true,
        get() {
          try {
            const r = this.response;
            if (r instanceof ArrayBuffer) return r;
            if (typeof r === 'string') return latin1(r);
            if (typeof this.responseText === 'string') return latin1(this.responseText);
          } catch (e) { /* ignore */ }
          return null;
        },
      });
      Object.defineProperty(XP, 'mozResponse', {
        configurable: true,
        get() {
          try {
            if (typeof this.response === 'string') return this.response;
            if (typeof this.responseText === 'string') return this.responseText;
            return this.response;
          } catch (e) { return null; }
        },
      });
    }
  } catch (e) { /* ignore */ }
})();

/* ------------------------------------------------------------------ */
/* legacy (KaiOS 2.5) generation surface                               */
/* ------------------------------------------------------------------ */
/* Only installed when the simulator runs in "legacy" mode: these are   */
/* the APIs KaiOS 3.x *removed*, and apps use `typeof navigator.X ===   */
/* 'function'` to tell the generations apart — which is exactly why     */
/* navigator.getDeviceStorages() must stay undefined in "new" mode.     */
/* Counts = packages out of 1611 (see docs/API-COVERAGE.md §6).         */
(function defineLegacySurface() {
  if (!IS_LEGACY) return;

  /* navigator.getDeviceStorages — 47 packages.
   * Real usage: `navigator.getDeviceStorages('sdcard')[0]`,
   * `navigator.getDeviceStorages(type)` iterated as an array (Boomplay
   * checks `sdcards.length > 1` for an external card). One storage per
   * type matches a card-less 2.5 handset. */
  const DS_TYPES = ['apps', 'pictures', 'videos', 'music', 'sdcard', 'downloads'];
  defNav('getDeviceStorages', function getDeviceStorages(type) {
    try {
      if (type) return [getDeviceStorage(type)];
      return DS_TYPES.map((t) => getDeviceStorage(t));
    } catch (e) { return []; }
  });

  /* navigator.mozMobileConnections — plural, 2.5 only (3.x has a single
   * navigator.mozMobileConnection + b2g.mobileConnections). */
  defNav('mozMobileConnections', [navigator.mozMobileConnection].filter(Boolean));

  /* navigator.mozSms — 2.5 SMS manager (3.x moved it to
   * b2g.mobileMessageManager). "sms" permission: 14 packages. */
  defNav('mozSms', {
    getSegmentInfoForText() { return stubOk({ segments: 1, charsPerSegment: 160 }); },
    send() { return stubOk(true); },
    getMessages() { return stubOk([]); },
    delete() { return stubOk(true); },
    markMessageRead() { return stubOk(true); },
    addEventListener() {}, removeEventListener() {},
  });

  /* navigator.mozWifiManager — 2.5 name (3.x exposes b2g.wifiManager).
   * "wifi-manage" permission: 7 packages. */
  if (!('mozWifiManager' in navigator)) {
    defNav('mozWifiManager', (navigator.b2g && navigator.b2g.wifiManager) || null);
  }

  /* navigator.mozBluetooth already exists; 2.5 also exposes the default
   * adapter synchronously for legacy code paths. Nothing to add. */

  /* Feature detection API ("feature-detection" permission, 29 packages):
   * navigator.getFeature / hasFeature / setFeature. A minimal 2.5 handset
   * reports "not supported" for everything, which is what these callers
   * fall back to. */
  if (!('hasFeature' in navigator)) {
    defNav('hasFeature', (name) => stubOk(false));
    defNav('getFeature', (name) => stubOk(null));
    defNav('setFeature', () => stubOk(false));
  }

  /* navigator.mozApps: 2.5-only entry points. The 3.x surface
   * (getSelf/mgmt/getLocalizationResource) is already installed above. */
  try {
    if (!appsMgr.getInstalled) {
      appsMgr.getInstalled = function getInstalled() {
        const r = makeRequest();
        ipcRenderer.invoke('apps:list').then((list) => r._ok(list.map(appObject)));
        return r;
      };
    }
    if (!appsMgr.checkInstalled) {
      appsMgr.checkInstalled = function checkInstalled(url) {
        const r = makeRequest();
        ipcRenderer.invoke('apps:list').then((list) => {
          const hit = list.some((a) => a && (a.manifestURL === url || a.origin === url));
          r._ok(hit);
        });
        return r;
      };
    }
    if (!appsMgr.installPackage) appsMgr.installPackage = appsMgr.install;
  } catch (e) { /* ignore */ }
})();

/* ------------------------------------------------------------------ */
/* Gecko prefix surface (mined from the KaiOS 1.0 corpus, 1037 pkgs)    */
/* ------------------------------------------------------------------ */
/* Unlike the block above, these are NOT generation markers: KaiOS 3.x  */
/* and 4.x still ship Gecko, so they are installed in BOTH modes. They  */
/* are either direct Gecko-only calls (`elem.mozRequestFullScreen()`)   */
/* or the tail of `standard || webkit || moz || ms` prefix chains       */
/* whose standard/aliased variants Chromium no longer exposes (notably  */
/* navigator.getUserMedia, removed in favour of mediaDevices).          */
/* Contexts were read out of the corpus with tools/snippets.py.         */
(function defineGeckoPrefixSurface() {
  function defProto(proto, name, desc) {
    if (!proto) return;
    try {
      if (desc.get || desc.set) {
        Object.defineProperty(proto, name, {
          get: desc.get, set: desc.set, configurable: true,
        });
      } else if (!(name in proto)) {
        Object.defineProperty(proto, name, {
          value: desc.value, configurable: true, writable: true,
        });
      }
    } catch (e) { /* ignore */ }
  }

  /* --- fullscreen: `elem.mozRequestFullScreen()` — 496 packages.
   * Chromium only has requestFullscreen / webkitRequestFullscreen, so the
   * whole `if (el.mozRequestFullScreen) { ... }` branch is dead and games
   * silently stay in windowed mode. */
  const mozReqFs = function mozRequestFullScreen() {
    const el = this;
    const fn = el.requestFullscreen || el.webkitRequestFullscreen || el.webkitRequestFullScreen;
    if (typeof fn === 'function') {
      try { return fn.call(el); } catch (e) { /* ignore */ }
    }
    return undefined;
  };
  defProto(Element.prototype, 'mozRequestFullScreen', { value: mozReqFs });
  // Gecko also spells it with a lowercase "s" (76 / 72 packages walk the
  // whole ["requestFullscreen","webkitRequestFullScreen",...,"mozRequest
  // Fullscreen"] chain), and puts the exit call on document.
  defProto(Element.prototype, 'mozRequestFullscreen', { value: mozReqFs });
  try {
    if (!document.mozRequestFullScreen) {
      Object.defineProperty(document, 'mozRequestFullScreen', {
        value: () => mozReqFs.call(document.documentElement || document.body),
        configurable: true, writable: true,
      });
    }
    if (!document.mozExitFullscreen) {
      Object.defineProperty(document, 'mozExitFullscreen', {
        value: () => { try { document.exitFullscreen && document.exitFullscreen(); } catch (e) {} },
        configurable: true, writable: true,
      });
    }
  } catch (e) { /* ignore */ }

  /* --- rAF: mozRequestAnimationFrame / mozCancelAnimationFrame —
   * 527 / 50 packages. Plain aliases. */
  if (typeof window.requestAnimationFrame === 'function') {
    defGlobal('mozRequestAnimationFrame', window.requestAnimationFrame.bind(window));
  }
  if (typeof window.cancelAnimationFrame === 'function') {
    defGlobal('mozCancelAnimationFrame', window.cancelAnimationFrame.bind(window));
  }

  /* --- canvas: ctx.mozImageSmoothingEnabled (483) and
   * ctx.mozBackingStorePixelRatio (420). The first one actually matters:
   * pixel-art games set it to false and get blurry upscaling without it. */
  const C2D = window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype;
  defProto(C2D, 'mozImageSmoothingEnabled', {
    get() { return this.imageSmoothingEnabled; },
    set(v) { try { this.imageSmoothingEnabled = !!v; } catch (e) { /* ignore */ } },
  });
  defProto(C2D, 'mozBackingStorePixelRatio', { get() { return 1; } });

  /* --- getUserMedia: 450 / 449 / 448 / 440 packages walk the prefix
   * chain. Chromium removed navigator.getUserMedia (mediaDevices only),
   * so every branch misses and camera/mic apps fail outright. */
  const gum = function (constraints, onOk, onErr) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onErr) setTimeout(() => onErr({ name: 'NotSupportedError' }), 0);
      return undefined;
    }
    const p = navigator.mediaDevices.getUserMedia(constraints);
    if (onOk || onErr) { p.then(onOk || (() => {}), onErr || (() => {})); return undefined; }
    return p;
  };
  ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia', 'msGetUserMedia'].forEach((n) => {
    if (!(n in navigator)) defNav(n, gum);
  });

  /* --- navigator.mozConnection — 445 packages (alias of the standard
   * Network Information API, which Chromium does expose). */
  if (!('mozConnection' in navigator)) defNav('mozConnection', navigator.connection || null);

  /* --- navigator.app.exitApp() — 21 packages. Construct 2's teardown
   * chain tries navigator.app.exitApp() then navigator.device.exitApp();
   * without it "Quit" in those games does nothing. window.close() is the
   * simulator's exit path. */
  const cordovaExit = {
    exitApp() { LOG('[kaios-sim] exitApp() -> window.close()'); try { window.close(); } catch (e) {} },
    exit() { this.exitApp(); },
  };
  if (!('app' in navigator)) defNav('app', cordovaExit);
  if (!('device' in navigator)) defNav('device', cordovaExit);

  /* --- navigator.mozBattery — 26 packages (B2G Battery Manager). The
   * corpus also probes webkitBattery / plain `battery` in the same chain,
   * so all three resolve to the same object. */
  const BATTERY = {
    level: 1, charging: true, chargingTime: 0, dischargingTime: Infinity,
    addEventListener() {}, removeEventListener() {},
  };
  ['battery', 'webkitBattery', 'mozBattery'].forEach((n) => {
    if (!(n in navigator)) defNav(n, BATTERY);
  });

  /* --- misc prefix aliases: mozIndexedDB (30), MozWebSocket (5). */
  defGlobal('mozIndexedDB', window.indexedDB);
  defGlobal('MozWebSocket', window.WebSocket);

  /* --- pointer lock: mozRequestPointerLock (30) + friends. */
  defProto(Element.prototype, 'mozRequestPointerLock', {
    value: function mozRequestPointerLock() {
      const fn = this.requestPointerLock || this.webkitRequestPointerLock;
      if (typeof fn === 'function') { try { return fn.call(this); } catch (e) { /* ignore */ } }
      return undefined;
    },
  });
  try {
    if (!document.mozExitPointerLock) {
      Object.defineProperty(document, 'mozExitPointerLock', {
        value: () => {
          const fn = document.exitPointerLock || document.webkitExitPointerLock;
          if (typeof fn === 'function') { try { fn.call(document); } catch (e) { /* ignore */ } }
        },
        configurable: true, writable: true,
      });
    }
    if (!('mozPointerLockElement' in document)) {
      Object.defineProperty(document, 'mozPointerLockElement', {
        get() { return document.pointerLockElement || null; }, configurable: true,
      });
    }
  } catch (e) { /* ignore */ }

  /* --- mozAudioChannelType — 434 packages. Reads as an audio channel
   * name; on media elements it also drives the real routing, but storing
   * it is enough for the games that just assign 'content'/'normal'. */
  const actDesc = {
    get() { return this.__mozAudioChannelType || 'content'; },
    set(v) { try { this.__mozAudioChannelType = v; } catch (e) { /* ignore */ } },
  };
  defProto(window.HTMLMediaElement && window.HTMLMediaElement.prototype,
    'mozAudioChannelType', actDesc);
  defProto(window.AudioContext && window.AudioContext.prototype,
    'mozAudioChannelType', actDesc);
})();

/* ------------------------------------------------------------------ */
/* Cross-corpus remainder (4134 packages over eggs_1.0/2.5/3.0/4.0/Jio) */
/* ------------------------------------------------------------------ */
/* Triage output of tools/api_gap.py: everything below is either a       */
/* Gecko/legacy prefix that Chromium dropped, or a KaiOS-only navigator  */
/* service that the corpus calls directly. Counts are packages using it. */
(function defineCorpusRemainder() {
  function defProto(proto, name, desc) {
    if (!proto) return;
    try {
      if (desc.get || desc.set) {
        Object.defineProperty(proto, name, {
          get: desc.get, set: desc.set, configurable: true,
        });
      } else if (!(name in proto)) {
        Object.defineProperty(proto, name, {
          value: desc.value, configurable: true, writable: true,
        });
      }
    } catch (e) { /* ignore */ }
  }

  /* --- prefix-chain tails. The standard/aliased branch usually wins on
   * Chromium, but several chains put the prefixed name first. */
  if (!('webkitConnection' in navigator)) {
    defNav('webkitConnection', navigator.connection || null);
  }
  ['webkitVibrate', 'msVibrate'].forEach((n) => {
    if (!(n in navigator) && navigator.vibrate) defNav(n, navigator.vibrate.bind(navigator));
  });
  if (!('oGetUserMedia' in navigator)) defNav('oGetUserMedia', navigator.getUserMedia);

  /* --- IE-era language probes (129 / 43 / 7 packages) — same value as
   * navigator.language, so `userLanguage || language` chains resolve the
   * same way a real handset would. */
  const lang = navigator.language || 'en-US';
  ['userLanguage', 'browserLanguage', 'systemLanguage'].forEach((n) => {
    if (!(n in navigator)) defNav(n, lang);
  });

  /* --- window-level constructor prefixes. */
  defGlobal('mozRTCPeerConnection', window.RTCPeerConnection);
  defGlobal('mozAudioContext', window.AudioContext);
  defGlobal('mozOfflineAudioContext', window.OfflineAudioContext);
  defGlobal('mozIDBIndex', window.IDBIndex);
  defGlobal('mozIDBObjectStore', window.IDBObjectStore);
  defGlobal('mozRTCSessionDescription', window.RTCSessionDescription);
  defGlobal('mozRTCIceCandidate', window.RTCIceCandidate);
  defGlobal('mozSpeechRecognition', window.webkitSpeechRecognition || window.SpeechRecognition);
  defGlobal('mozSpeechSynthesisUtterance', window.SpeechSynthesisUtterance);
  // Old name of mozCancelAnimationFrame (20 packages).
  if (typeof window.cancelAnimationFrame === 'function') {
    defGlobal('mozCancelRequestAnimationFrame', window.cancelAnimationFrame.bind(window));
  }

  /* --- screen.mozUnLockOrientation — 8 packages spell it with a capital
   * L; the lowercase form is already installed above. */
  try {
    if (!screen.mozUnLockOrientation && screen.mozUnlockOrientation) {
      Object.defineProperty(screen, 'mozUnLockOrientation', {
        value: screen.mozUnlockOrientation.bind(screen),
        configurable: true, writable: true,
      });
    }
  } catch (e) { /* ignore */ }

  /* --- Blob.mozSlice — 16 packages (pre-standard slice name). */
  defProto(window.Blob && window.Blob.prototype, 'mozSlice', {
    value: function mozSlice(a, b, c) { return this.slice(a, b, c); },
  });

  /* --- HTMLMediaElement.mozCaptureStream — 3 packages. */
  defProto(window.HTMLMediaElement && window.HTMLMediaElement.prototype,
    'mozCaptureStream', {
      value: function mozCaptureStream() {
        return this.captureStream ? this.captureStream.apply(this, arguments) : null;
      },
    });

  /* --- canvas line-dash prefixes: ctx.mozDash / mozDashOffset /
   * mozFillRule (3 packages each) map onto setLineDash. */
  defProto(window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype,
    'mozDash', {
      get() { return typeof this.getLineDash === 'function' ? this.getLineDash() : []; },
      set(v) { try { this.setLineDash(v || []); } catch (e) { /* ignore */ } },
    });
  defProto(window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype,
    'mozDashOffset', {
      get() { return this.lineDashOffset; },
      set(v) { try { this.lineDashOffset = v; } catch (e) { /* ignore */ } },
    });
  defProto(window.CanvasRenderingContext2D && window.CanvasRenderingContext2D.prototype,
    'mozFillRule', {
      get() { return this.__mozFillRule || 'nonzero'; },
      set(v) { this.__mozFillRule = v; },
    });

  /* --- B2G message plumbing that pairs with mozSetMessageHandler. */
  if (!('mozHasPendingMessage' in navigator)) {
    defNav('mozHasPendingMessage', () => stubOk(false));
  }
  if (!('mozSetMessageHandlerPromise' in navigator)) {
    defNav('mozSetMessageHandlerPromise', () => Promise.resolve(null));
  }

  /* --- navigator.msSaveOrOpenBlob — 129 packages. Chromium has no IE
   * download API, and some of them have no other branch; fall back to an
   * anchor download so "save file" still does something. */
  if (!('msSaveOrOpenBlob' in navigator)) {
    defNav('msSaveOrOpenBlob', function msSaveOrOpenBlob(blob, name) {
      try {
        const a = document.createElement('a');
        const url = URL.createObjectURL(blob);
        a.href = url;
        a.download = name || 'download';
        a.rel = 'noopener';
        (document.body || document.documentElement).appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
        return true;
      } catch (e) { return false; }
    });
  }

  /* --- navigator.splashscreen — 68 packages. Construct 2/3 and Ionic
   * call `navigator.splashscreen.hide()`; the call is guarded, but a
   * no-op is closer to a real handset than nothing. */
  if (!('splashscreen' in navigator)) {
    defNav('splashscreen', { show() {}, hide() {} });
  }

  /* --- navigator.minimizeMemoryUsage — 9 packages (PodLP). Real KaiOS
   * asks the system to trim the app; here there is nothing to trim. */
  if (!('minimizeMemoryUsage' in navigator)) defNav('minimizeMemoryUsage', () => {});

  /* --- navigator.softkeyManager — 11 Jio packages. registerKeys() feeds
   * the soft-key bar; the shell owns the keys, so accept and ignore. */
  if (!('softkeyManager' in navigator)) {
    defNav('softkeyManager', {
      registerKeys() { return true; },
      unregisterKeys() { return true; },
      setSoftkeyBar() { return true; },
      addEventListener() {}, removeEventListener() {},
    });
  }

  /* --- window.DeviceStorage — 4 packages use the B2G constructor
   * directly (`new DeviceStorage('sdcard')`). */
  defGlobal('DeviceStorage', function DeviceStorage(type) {
    return getDeviceStorage(type);
  });

  /* --- navigator.kaiAuth — KaiOS Store 3.7.2 / KaiOS Pay.
   * `navigator.kaiAuth.getRestrictedToken("apps")` is what the store's
   * quick-launch / ftu / silent-install bundles call to seed their Hawk
   * credentials (setToken(kid, macKey)). It is the same live token we hand
   * to b2g.authorizationManager, so the store can sign its catalog /
   * manifest / package requests against the real backend. */
  if (!('kaiAuth' in navigator)) {
    defNav('kaiAuth', {
      getRestrictedToken(name) {
        LOG('[kaios-sim] kaiAuth.getRestrictedToken(' + name + ')');
        return __kaiosStoreToken().then((tok) => ({
          kid: tok.kid,
          macKey: tok.macKey,
          type: 0,
          expiresInSeconds: tok.expiresInSeconds,
          token: tok.accessToken,
        }));
      },
      getAccount() { return Promise.resolve(null); },
    });
  }

  /* --- navigator.dongleManager — 5 Jio packages (JioCinema / JioHome TV
   * dongle). dongleStatus === false is what a handset with nothing plugged
   * in reports, so the DIAL clients stay in their disconnected state. */
  if (!('dongleManager' in navigator)) {
    defNav('dongleManager', {
      dongleStatus: false,
      ondonglestatuschange: null,
      getDongleStatus() { return Promise.resolve(false); },
      addEventListener() {}, removeEventListener() {},
    });
  }

  /* --- HTMLMediaElement.mozGetMetadata — 5 packages (SHAREit, Xender,
   * Video) read tags off an offscreen <video>. Chromium exposes none of
   * it, so hand back the few values we can derive from the element. */
  defProto(window.HTMLMediaElement && window.HTMLMediaElement.prototype,
    'mozGetMetadata', {
      value: function mozGetMetadata() {
        try {
          return {
            duration: isFinite(this.duration) ? this.duration : undefined,
            width: this.videoWidth || undefined,
            height: this.videoHeight || undefined,
          };
        } catch (e) { return {}; }
      },
    });

  /* --- 2.5-only services below this line: KaiOS 3.x moved them behind
   * navigator.b2g, so defining them would send generation-sniffing apps
   * down the wrong path. */
  if (!IS_LEGACY) return;

  /* navigator.mozMobileMessage — 60 packages. Real usage is carrier
   * billing: ODSDK / Billing.js call
   * `navigator.mozMobileMessage.send(number, text, {serviceId})` and wait
   * for onsuccess. There is no SIM in the simulator, so every send fails
   * cleanly — that keeps in-app purchase flows from "succeeding" against
   * a number that does not exist. */
  if (!('mozMobileMessage' in navigator)) {
    defNav('mozMobileMessage', {
      send() {
        LOG('[kaios-sim] mozMobileMessage.send() -> no SIM in simulator');
        return stubFail('SimNotAvailable: no SIM in the simulator');
      },
      getSegmentInfoForText() { return stubOk({ segments: 1, charsPerSegment: 160 }); },
      getMessage() { return stubOk(null); },
      getMessages() { return stubOk([]); },
      delete() { return stubOk(true); },
      markMessageRead() { return stubOk(true); },
      addEventListener() {}, removeEventListener() {},
    });
  }

  /* navigator.mozContact — 10 packages construct B2G contacts when
   * reading/writing the (empty) contacts store. */
  if (!('mozContact' in navigator)) {
    defNav('mozContact', function MozContact(init) {
      Object.assign(this, init || {});
      this.id = this.id || 'contact-' + Math.random().toString(36).slice(2, 10);
    });
  }
})();

/* ------------------------------------------------------------------ */
/* postMessage origin relaxation for the store's remote UI             */
/* ------------------------------------------------------------------ */
/* On a real handset the store's remote UI (Tiny-Store-UI) is installed  */
/* as a LOCAL app (app://kaios-plus.kaiostech.com), so the store talks   */
/* to it with an app:// targetOrigin. In the simulator that UI is served  */
/* over https, so the target never matches and the browser refuses the    */
/* message:                                                              */
/*   "Failed to execute 'postMessage' ... The target origin provided      */
/*    ('app://kaios-plus.kaiostech.com') does not match the recipient     */
/*    window's origin ('app://kaios-store')"                             */
/* -> the token is never delivered, the UI stays on "Loading... (0%)".    */
/* Deliver app://-addressed messages inside the simulator regardless of   */
/* the recipient scheme. */
(function __kaiosRelaxPostMessage() {
  try {
    // DISABLED for the moment: any wrapper installed here runs in THIS frame's
    // realm, so a child calling `parent.postMessage(...)` re-enters Chromium
    // from the store's settings object and the message's `source` becomes the
    // store itself (origin app://kaios-store), which the store rejects as an
    // unpermitted origin. Kept as a no-op so the reasoning stays documented.
    if (!window.__KAIOS_WRAP_POSTMESSAGE) return;
    const orig = window.postMessage;
    if (typeof orig !== 'function' || orig.__kaiosPatched) return;
    const patched = function (message, targetOrigin, transfer) {
      const to = targetOrigin;
      let out = to;
      if (typeof to === 'string' && to !== '*' && to.indexOf('app://') === 0) {
        let st = '';
        try { st = new Error().stack.split('\n').slice(1, 4).join(' | ').slice(0, 400); } catch (e2) {}
        LOG('[kaios-sim] postMessage: app:// targetOrigin ' + to +
          ' self=' + (this === window) + ' action=' +
          String((message && message.action) || '?') + ' st=' + st);
        out = to; // observation only — see below
      }
      return orig.call(this, out, transfer);
    };
    patched.__kaiosPatched = true;
    Object.defineProperty(window, 'postMessage', {
      value: patched, configurable: true, writable: true,
    });
  } catch (e) { /* ignore */ }
})();

/* ------------------------------------------------------------------ */
/* Sub-frame bridge: cross-frame postMessage with app:// target origins */
/* ------------------------------------------------------------------ */
/* KaiOS apps post to window.parent with a hard-coded targetOrigin that  */
/* is their OWN app:// URL (the Store's remote catalog UI sends          */
/* "app://kaios-plus.kaiostech.com" when asking the host for device      */
/* info). On a handset both documents live on app://, but in the         */
/* simulator the remote UI is served over https while the host is        */
/* app://kaios-store, so the browser drops the message before dispatch:  */
/*   Failed to execute 'postMessage' on 'DOMWindow': The target origin    */
/*   provided ('app://kaios-plus.kaiostech.com') does not match the       */
/*   recipient window's origin ('app://kaios-store')                     */
/* Wrapping window.postMessage in the PARENT frame cannot fix that: the  */
/* wrapper runs in the parent's realm, so re-issuing the call reports    */
/* the PARENT as the message source and the receiver rejects it as an    */
/* unpermitted origin. The rewrite has to happen in the CHILD's realm,   */
/* which is why the preload also runs in sub-frames (the shell sets      */
/* webpreferences nodeIntegrationInSubFrames=yes).                       */
(function __kaiosSubframeBridge() {
  try {
    if (window.top === window || window.__kaiosBridge) return;
    window.__kaiosBridge = true;
    const realParent = window.parent;
    const relax = function (msg, targetOrigin, transfer) {
      let to = targetOrigin;
      if (typeof to === 'string' && to.indexOf('app://') === 0) {
        LOG('[kaios-sim] sub-frame postMessage: ' + to + ' -> * (' +
          String((msg && msg.action) || '?') + ')');
        to = '*';
      }
      return realParent.postMessage(msg, to, transfer);
    };
    let shim = null;
    Object.defineProperty(window, 'parent', {
      configurable: true,
      get() {
        if (shim) return shim;
        try {
          shim = new Proxy(realParent, {
            get(target, prop) {
              if (prop === 'postMessage') return relax;
              const v = target[prop];
              return typeof v === 'function' ? v.bind(target) : v;
            },
            set(target, prop, value) { target[prop] = value; return true; },
            has(target, prop) { return prop === 'postMessage' || prop in target; },
          });
        } catch (e) {
          // A WindowProxy cannot always be proxied; fall back to a minimal
          // facade — the messenger only ever touches postMessage.
          shim = { postMessage: relax };
        }
        return shim;
      },
    });
  } catch (e) { /* ignore */ }
})();

LOG('[kaios-sim] polyfill loaded for app=' + (APP_ID || '(web)') +
  ' mode=' + KAIOS_MODE + ' ua=' + navigator.userAgent);

/* Frames matter: the Store catalog is a cross-origin iframe and its bundle
 * renders through navigator.mozL10n.once(). If this line never shows up for
 * the kaios-plus frame, the preload is not reaching subframes and the catalog
 * cannot boot no matter what the polyfill exposes. */
try {
  if (window.top !== window) {
    LOG('[kaios-sim] polyfill in SUBFRAME url=' + String(location.href).slice(0, 90) +
      ' mozL10n=' + (typeof navigator.mozL10n));
    /* Mirror inbound postMessages so we can tell "the parent never replied"
     * apart from "the catalog got the reply and stalled elsewhere". Only
     * active inside subframes, so it cannot affect normal apps. */
    try {
      const __origPostMessage = window.postMessage;
      window.postMessage = function (msg, origin, transfer) {
        try {
          const a = msg && msg.action;
          const id = msg && msg.id;
          LOG('[kaios-sim] SUBFRAME recv ' + (a ? ('action=' + a) : ('reply id=' + String(id).slice(0, 40))) +
            ' success=' + (msg && msg.success));
        } catch (e) { /* ignore */ }
        return __origPostMessage.apply(this, arguments);
      };
    } catch (e) { /* ignore */ }
  }
} catch (e) { /* cross-origin top access — still a subframe */ }

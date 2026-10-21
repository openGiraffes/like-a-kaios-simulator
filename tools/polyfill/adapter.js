'use strict';
const Buffer = require('buffer').Buffer;
const path = require('path-browserify');
const config = window.__kaiosHost;
const NativeXHR = window.XMLHttpRequest;
const nativeGetUserMedia = navigator.mozGetUserMedia && navigator.mozGetUserMedia.bind(navigator);
const listeners = Object.create(null);
const sockets = Object.create(null);
const client = Date.now().toString(36) + Math.random().toString(36).slice(2);
let alive = true;

function request(channel, payload, sync) {
  const xhr = new NativeXHR();
  const body = JSON.stringify({ channel, payload, client, token: config.token });
  function unpack() {
    if (xhr.status !== 200) throw new Error('Host unavailable: HTTP ' + xhr.status);
    const reply = JSON.parse(xhr.responseText);
    if (reply.error) throw new Error(reply.error);
    return reply.value;
  }
  xhr.open('POST', config.endpoint, !sync);
  xhr.setRequestHeader('Content-Type', 'application/json');
  if (sync) { xhr.send(body); return unpack(); }
  return new Promise((resolve, reject) => {
    xhr.timeout = 30000;
    xhr.onload = () => { try { resolve(unpack()); } catch (e) { reject(e); } };
    xhr.onerror = () => reject(new Error('Cannot reach simulator host'));
    xhr.ontimeout = () => reject(new Error('Simulator request timed out: ' + channel));
    xhr.send(body);
  });
}
function emit(name, payload) { (listeners[name] || []).slice().forEach(cb => cb({}, payload)); }
const ipcRenderer = {
  invoke: (channel, payload) => request(channel, payload, false),
  sendSync: (channel, payload) => request(channel, payload, true),
  send: (channel, payload) => { request(channel, payload, false).catch(() => {}); },
  sendToHost: (channel, payload) => { request(channel, payload, false).catch(() => {}); },
  on: (name, cb) => { (listeners[name] || (listeners[name] = [])).push(cb); },
  removeListener: (name, cb) => { listeners[name] = (listeners[name] || []).filter(f => f !== cb); },
};
function poll() {
  if (!alive) return;
  request('events:poll', null, false).then(events => {
    events.forEach(event => {
      try {
        if (event.channel === 'socket:event') {
          const p = event.payload, socket = sockets[p.id];
          if (socket) socket.dispatch(p);
        } else emit(event.channel, event.payload);
      } catch (e) { console.error('Host event: ' + e.message); }
    });
  }).catch(() => {}).then(() => { if (alive) setTimeout(poll, 60); });
}
function stat(info) { return { name: info.name, size: info.size, isFile: () => !info.directory, isDirectory: () => !!info.directory }; }
const fs = {
  readFileSync: (file, encoding) => { const b = Buffer.from(request('fs:read', { path: file }, true), 'base64'); return encoding ? b.toString(encoding) : b; },
  writeFileSync: (file, data) => request('fs:write', { path: file, base64: Buffer.from(data).toString('base64') }, true),
  existsSync: file => request('fs:exists', { path: file }, true),
  mkdirSync: file => request('fs:mkdir', { path: file }, true),
  unlinkSync: file => request('fs:unlink', { path: file }, true),
  statSync: file => stat(request('fs:stat', { path: file }, true)),
  readdirSync: (file, options) => request('fs:readdir', { path: file }, true).map(info => options && options.withFileTypes ? stat(info) : info.name),
};
const crypto = {
  randomBytes: count => Buffer.from(request('crypto:random', { count }, true), 'base64'),
  createHmac: (algorithm, key) => {
    let text = '';
    const hmac = {
      update(value) { text += value; return hmac; },
      digest(encoding) { return Buffer.from(request('crypto:hmac', { algorithm, key: Buffer.from(key).toString('base64'), text }, true), 'base64').toString(encoding); },
    };
    return hmac;
  },
};
class Socket {
  constructor(kind, options, id) {
    this.events = Object.create(null);
    this.id = id || request('socket:create', { kind, options: options || {} }, true);
    sockets[this.id] = this;
    this.writableLength = 0;
    this.connected = !!id;
    this.writes = [];
    this.writing = false;
  }
  on(name, fn) { (this.events[name] || (this.events[name] = [])).push(fn); return this; }
  dispatch(p) {
    if (p.event === 'connect') { this.connected = true; this.flush(); }
    let args = [];
    if (p.event === 'data') args = [Buffer.from(p.data, 'base64')];
    else if (p.event === 'message') args = [Buffer.from(p.data, 'base64'), p.remote];
    else if (p.event === 'connection') args = [new Socket('tcp', {}, p.connection)];
    else if (p.event === 'error') { const e = new Error(p.message); e.code = p.code; args = [e]; }
    (this.events[p.event] || []).forEach(fn => fn.apply(null, args));
    if (p.event === 'close') delete sockets[this.id];
  }
  call(action, data) { return request('socket:action', Object.assign({ id: this.id, action }, data), false); }
  write(data) { const b = Buffer.from(data); this.writes.push(b); this.writableLength += b.length; this.flush(); return this.writableLength < 65536; }
  flush() {
    if (!this.connected || this.writing || !this.writes.length) return;
    this.writing = true;
    const b = this.writes.shift();
    this.call('write', { data: b.toString('base64') }).then(() => {
      this.writableLength -= b.length; this.writing = false; this.flush(); if (!this.writableLength) this.dispatch({ event: 'drain' });
    }, e => { this.writing = false; this.dispatch({ event: 'error', message: e.message }); });
  }
  setNoDelay() { return this; }
  pause() { this.call('pause').catch(() => {}); }
  resume() { this.call('resume').catch(() => {}); }
  destroy() { this.call('close').catch(() => {}); }
  close() { this.destroy(); }
  listen(port) { this.call('listen', { port }).catch(e => this.dispatch({ event: 'error', message: e.message })); }
  bind(port, address, cb) { this.call('bind', { port, address }).then(result => { this.endpoint = result; if (cb) cb(); }).catch(e => this.dispatch({ event: 'error', message: e.message })); }
  address() { return this.endpoint; }
  send(data, port, address) { this.call('send', { data: Buffer.from(data).toString('base64'), port, address }).catch(e => this.dispatch({ event: 'error', message: e.message })); }
  addMembership(address) { this.call('join', { address }).catch(() => {}); }
  dropMembership(address) { this.call('leave', { address }).catch(() => {}); }
}
const modules = {
  electron: { ipcRenderer },
  'node:fs': fs, 'node:path': path, 'node:os': { tmpdir: () => '/tmp' }, 'node:crypto': crypto,
  'node:net': { connect: options => new Socket('tcp', options), createServer: cb => new Socket('server').on('connection', cb) },
  'node:tls': { connect: options => new Socket('tls', options) },
  'node:dgram': { createSocket: options => new Socket('udp', options) },
};
exports.require = name => { if (!modules[name]) throw new Error('Unsupported host module: ' + name); return modules[name]; };
function resourceUrl(value) {
  const url = String(value), base = config.endpoint.replace(/\/__sim\/rpc$/, '');
  if (/^https?:\/\/shared\.localhost(?::\d+)?\//i.test(url)) return url.replace(/^https?:\/\/shared\.localhost(?::\d+)?/i, base + '/__sim/shared');
  if (/^https?:\/\/static\.kaiads\.com\//i.test(url) || /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/sdk\/ads\//i.test(url)) return base + '/__sim/ads.js';
  if (/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/api\/v1\//i.test(url)) return url.replace(/^https?:\/\/[^/]+\/api\/v1/i, base + '/__sim/external-api');
  return value;
}
exports.install = () => {
  // Remote app frames address the packaged app by its device origin. Preserve
  // that identity for messages from this app's loopback parent only.
  const realParent = window.parent;
  if (window.top !== window) window.addEventListener('message', event => {
    if (event.origin === config.parentOrigin && event.source === realParent) {
      Object.defineProperty(event, 'origin', { configurable: true, value: config.appOrigin });
    }
  }, true);
  // Map system endpoints before Gecko applies cross-origin redirect restrictions.
  const open = NativeXHR.prototype.open;
  NativeXHR.prototype.open = function () { const args = Array.prototype.slice.call(arguments); args[1] = resourceUrl(args[1]); return open.apply(this, args); };
  if (window.fetch) { const fetch = window.fetch.bind(window); window.fetch = (url, options) => fetch(typeof url === 'string' ? resourceUrl(url) : url, options); }

  // Gecko 45 embeddings may omit ServiceWorker entirely; KE expects a container
  // to exist before replacing registration with its passive simulator stub.
  if (!navigator.serviceWorker) Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: Object.assign(new exports.EventTarget(), { controller: null, oncontrollerchange: null, onmessage: null, startMessages() {} }) });
  if (!window.caches) {
    const cacheMap = new Map();
    window.caches = { keys: () => Promise.resolve(Array.from(cacheMap.keys())), delete: name => Promise.resolve(cacheMap.delete(name)), has: name => Promise.resolve(cacheMap.has(name)),
      open: name => { if (!cacheMap.has(name)) { const entries = new Map(); cacheMap.set(name, { match: request => Promise.resolve(entries.get(String(request.url || request))), put: (request, response) => { entries.set(String(request.url || request), response); return Promise.resolve(); }, delete: request => Promise.resolve(entries.delete(String(request.url || request))), keys: () => Promise.resolve(Array.from(entries.keys())) }); } return Promise.resolve(cacheMap.get(name)); },
      match: request => Promise.all(Array.from(cacheMap.values()).map(cache => cache.match(request))).then(values => values.find(value => value !== undefined)),
    };
  }
  // Gecko 45 has Blob/File, but predates these Promise-based methods.
  ['arrayBuffer', 'text'].forEach(method => {
    if (!Blob.prototype[method]) Blob.prototype[method] = function () {
      const blob = this;
      return new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(r.error); if (method === 'text') r.readAsText(blob); else r.readAsArrayBuffer(blob); });
    };
  });
  if (!window.TextEncoder) window.TextEncoder = function () { this.encode = text => new Uint8Array(Buffer.from(text, 'utf8')); };
  if (!window.TextDecoder) window.TextDecoder = function () { this.decode = data => Buffer.from(data || []).toString('utf8'); };
  if (!window.queueMicrotask) window.queueMicrotask = fn => Promise.resolve().then(fn);
  if (!window.CSS) window.CSS = {};
  if (!window.CSS.escape) window.CSS.escape = text => String(text).replace(/[^a-zA-Z0-9_-]/g, c => '\\' + c.charCodeAt(0).toString(16) + ' ');
  // Gecko 45 accepts only the boolean overload, and throws on modern options.
  const scrollIntoView = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function (options) {
    return scrollIntoView.call(this, options && typeof options === 'object' ? options.block !== 'end' : options === undefined ? true : options);
  };
  // The polyfill's prefix wrappers must have an actual standard entry point.
  if (!navigator.mediaDevices) Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: {
    getUserMedia: constraints => new Promise((resolve, reject) => nativeGetUserMedia ? nativeGetUserMedia(constraints, resolve, reject) : reject(new Error('Camera unavailable'))),
    enumerateDevices: () => Promise.resolve([]),
  } });
  poll();
  window.addEventListener('unload', () => { alive = false; try { request('client:close', null, true); } catch (e) {} });
};
exports.ready = () => {
  window.__kaiosGeckoReady = true;
  ipcRenderer.send('bridge:ready', { mode: window.__kaiosMode.mode });
  ['log', 'warn', 'error'].forEach(level => {
    const original = console[level] && console[level].bind(console);
    console[level] = function () {
      const args = Array.prototype.slice.call(arguments);
      if (original) original.apply(null, args);
      request('shell:log', { text: '[' + level + '] ' + args.map(v => { try { return typeof v === 'string' ? v : JSON.stringify(v); } catch (e) { return String(v); } }).join(' ') }, false).catch(() => {});
    };
  });
};

// Gecko 45 exposes EventTarget but does not support constructing it directly.
exports.EventTarget = class {
  constructor() { this._events = Object.create(null); }
  addEventListener(name, callback) { if (callback) (this._events[name] || (this._events[name] = [])).push(callback); }
  removeEventListener(name, callback) { this._events[name] = (this._events[name] || []).filter(cb => cb !== callback); }
  dispatchEvent(event) { try { Object.defineProperty(event, 'target', { value: this, configurable: true }); } catch (e) {} (this._events[event.type] || []).slice().forEach(cb => { if (typeof cb === 'function') cb.call(this, event); else cb.handleEvent(event); }); return !event.defaultPrevented; }
};

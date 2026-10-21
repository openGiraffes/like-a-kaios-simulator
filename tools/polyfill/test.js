'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'KaiosSim/Polyfills/kaios-gecko.js'), 'utf8');
require('acorn').parse(source, { ecmaVersion: 5, allowReserved: true });
assert(source.includes('__kaiosGeckoReady'));
assert(source.includes('mozTCPSocket') && source.includes('mozUDPSocket'));
assert(!fs.existsSync(path.join(root, 'runtime')));
const upstream = fs.readFileSync(path.join(root, 'KaiosSim/Polyfills/upstream/kaios-polyfill.js'), 'utf8');
const host = fs.readFileSync(path.join(root, 'KaiosSim/BridgeHost.cs'), 'utf8');
for (const match of upstream.matchAll(/ipcRenderer\.(?:invoke|send|sendSync|sendToHost)\('([^']+)'/g)) {
  assert(host.includes('"' + match[1] + '"'), 'Missing host channel: ' + match[1]);
}
console.log('PASS: ES5 syntax, full upstream host-channel coverage, no Electron runtime');

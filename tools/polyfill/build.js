'use strict';
const fs = require('fs');
const path = require('path');
const browserify = require('browserify');
const babel = require('@babel/core');
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'KaiosSim/Polyfills/upstream/kaios-polyfill.js'), 'utf8');
const entry = path.join(__dirname, '.entry.js');
// Keep the upstream file byte-for-byte. Only its module boundary is adapted.
// A bubbling event already reaches window; KE's second dispatch doubles # and softkeys.
const adapted = source.replace(/\brequire\(/g, 'hostRequire(')
  .replace("typeof to === 'string' && to.indexOf('app://') === 0", "typeof to === 'string' && (to === window.__kaiosHost.appOrigin || to.indexOf('app://') === 0)")
  .replace("' -> * ('", "' -> host ('")
  .replace("to = '*';", "to = window.__kaiosHost.parentOrigin;")
  .replace('t.dispatchEvent(ev);\n  window.dispatchEvent(ev);', 't.dispatchEvent(ev);')
  .replace('this.mozSystem = !!(options && options.mozSystem) || inAppPage;', "Object.defineProperty(this, 'mozSystem', { value: !!(options && options.mozSystem) || inAppPage, configurable: true, writable: true });")
  .replace('this.mozAnon = !!(options && options.mozAnon);', "Object.defineProperty(this, 'mozAnon', { value: !!(options && options.mozAnon), configurable: true, writable: true });")
  .replace('this.mozBackgroundRequest = !!(options && options.mozBackgroundRequest);', "Object.defineProperty(this, 'mozBackgroundRequest', { value: !!(options && options.mozBackgroundRequest), configurable: true, writable: true });")
  .replace("defGlobal('Notification', KaiNotification);", "function GeckoNotification(title, options) { var n = new KaiNotification(title, options); setTimeout(function(){ n.show(); }, 0); return n; } GeckoNotification.prototype = KaiNotification.prototype; GeckoNotification.permission = 'granted'; GeckoNotification.requestPermission = KaiNotification.requestPermission; Object.defineProperty(window, 'Notification', {value:GeckoNotification, configurable:true, writable:true});")
  .replace('function defNav(name, value) {', 'function defNav(name, value) { try { Object.defineProperty(navigator, name, { value: value, configurable: true, writable: true }); } catch (e) {}');
fs.writeFileSync(entry, "require('core-js/stable');\nconst Buffer = require('buffer').Buffer;\nconst adapter = require('./adapter');\nadapter.install();\n(function(hostRequire, EventTarget){\n" + adapted + '\n})(adapter.require, adapter.EventTarget);\nadapter.ready();\n');
browserify(entry).bundle((err, data) => {
  try {
    if (err) throw err;
    const result = babel.transformSync(data.toString(), {
      presets: [[require.resolve('@babel/preset-env'), { targets: { ie: '11' }, modules: false, include: ['@babel/plugin-transform-block-scoped-functions'] }]],
      comments: true, compact: false, sourceType: 'script',
    });
    require('acorn').parse(result.code, { ecmaVersion: 5, allowReserved: true });
    const out = path.join(root, 'KaiosSim/Polyfills/kaios-gecko.js');
    fs.writeFileSync(out, '/* KE KaiOS polyfill + Gecko 45 host adapter. AGPL-3.0; see upstream/LICENSE. */\n' + result.code + '\n');
    console.log('Gecko 45 bundle: ' + fs.statSync(out).size + ' bytes; ES5 syntax verified');
    function shared(directory, relative = '') {
      for (const name of fs.readdirSync(directory)) {
        const input = path.join(directory, name), rel = path.join(relative, name);
        if (fs.statSync(input).isDirectory()) { shared(input, rel); continue; }
        if (!name.endsWith('.js')) continue;
        const code = babel.transformSync(fs.readFileSync(input, 'utf8'), {
          presets: [[require.resolve('@babel/preset-env'), { targets: { ie: '11' }, modules: false, include: ['@babel/plugin-transform-block-scoped-functions'] }]],
          sourceType: 'script', comments: true,
        }).code;
        require('acorn').parse(code, { ecmaVersion: 5, allowReserved: true });
        const dest = path.join(root, 'KaiosSim/Polyfills/shared', rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, code + '\n');
      }
    }
    shared(path.join(root, 'KaiosSim/Polyfills/upstream/shared'));
    console.log('Shared scripts: ES5 syntax verified');
  } finally { fs.unlinkSync(entry); }
});

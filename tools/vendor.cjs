const fs = require('node:fs');
const path = require('node:path');
const root = path.dirname(require.resolve('alpinejs/package.json'));
fs.mkdirSync('assets/vendor', { recursive: true });
fs.copyFileSync(path.join(root, 'dist/cdn.min.js'), 'assets/vendor/alpine.min.js');
// License is checked in alongside the vendored runtime (the npm package omits it).

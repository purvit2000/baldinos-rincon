const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  'index.html',
  'menu.html',
  'careers.html',
  'styles.css',
  'script.js',
  'favicon.ico',
  'Employment-Job-Application.pdf',
  'assets/american-salad-plate.webp',
  'assets/apple-touch-icon.png',
  'assets/catering-subs.webp',
  'assets/dining.webp',
  'assets/favicon.svg',
  'assets/home-hero.webp',
  'assets/italian-battalion.webp',
  'assets/italian-salad-plate.webp',
  'assets/smoked-turkey-provolone.webp',
  'assets/steak-mushrooms.webp',
  'assets/wrap-cut.webp',
  'assets/vendor/alpine-LICENSE.md',
  'assets/vendor/alpine.min.js',
];

fs.rmSync(output, { recursive: true, force: true });
for (const file of files) {
  const destination = path.join(output, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(root, file), destination);
}

console.log(`Prepared ${files.length} website files in dist/`);

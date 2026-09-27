import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { recordEvent } from '../worker.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' };

// Local preview only: form requests never leave the machine. This file is not deployed.
export function createPreviewServer() {
  return http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      if (url.pathname === '/events') {
        const request = new Request(url, { method: req.method, headers: req.headers, ...(req.method === 'POST' ? { body: req, duplex: 'half' } : {}) });
        const result = await recordEvent(request, () => {});
        res.writeHead(result.status, Object.fromEntries(result.headers)); res.end(); return;
      }
      if (url.pathname.startsWith('/__test-form/')) {
        req.resume();
        if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }
        if (url.pathname.endsWith('/application')) {
          res.writeHead(303, { Location: '/careers?sent=1#application-success', 'Cache-Control': 'no-store' }); res.end(); return;
        }
        const failure = url.searchParams.get('mode') === 'failure';
        res.writeHead(failure ? 503 : 200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ success: !failure })); return;
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
      const redirects = { '/index.html': '/', '/menu.html': '/menu', '/careers.html': '/careers', '/menu/': '/menu', '/careers/': '/careers' };
      if (redirects[url.pathname]) { res.writeHead(301, { Location: redirects[url.pathname] + url.search }); res.end(); return; }
      const name = ({ '/': 'index.html', '/menu': 'menu.html', '/careers': 'careers.html' })[url.pathname] || decodeURIComponent(url.pathname).slice(1);
      let file = path.resolve(root, name);
      if (!file.startsWith(root) || path.basename(file).startsWith('_')) { res.writeHead(404); res.end(); return; }
      let status = 200;
      let body;
      try { body = await fs.readFile(file); } catch { file = path.join(root, '404.html'); body = await fs.readFile(file); status = 404; }
      const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' };
      const rules = await fs.readFile(path.join(root, '_headers'), 'utf8');
      let matches = false;
      for (const line of rules.split('\n')) {
        if (line.startsWith('/')) matches = line.endsWith('*') ? url.pathname.startsWith(line.slice(0, -1)) : url.pathname === line;
        else if (matches && /^\s+\S/.test(line)) {
          const colon = line.indexOf(':');
          headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim().replace(/; upgrade-insecure-requests/, '');
        }
      }
      if (path.extname(file) === '.html') {
        const mode = url.searchParams.get('form-test') === 'failure' ? 'failure' : 'success';
        const destination = file.endsWith('careers.html') ? 'application' : `catering?mode=${mode}`;
        body = body.toString().replaceAll('action="https://formsubmit.co/6ecc42b3db2bd9b97b383e3cda7d425c"', `action="/__test-form/${destination}"`);
      }
      res.writeHead(status, headers); res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(500); res.end('Preview failed. Run npm run build.'); }
  });
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  createPreviewServer().listen(4173, '127.0.0.1', () => {
    console.log('Preview: http://127.0.0.1:4173 — all forms are simulated; no email is sent.');
  });
}

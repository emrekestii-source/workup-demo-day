// Deneme icin: invite.html icindeki e-posta govdesini tek basina bir HTML dosyasina cikarir.
import fs from 'node:fs';

const [, , src, out] = process.argv;
const h = fs.readFileSync(src, 'utf8');
const m = h.match(/<div id="mail">([\s\S]*?)<\/div><\/div>\s*<script>/);
if (!m) { console.log('govde bulunamadi'); process.exit(1); }
fs.writeFileSync(out, `<!doctype html><html><head><meta charset="utf-8"></head><body>${m[1]}</body></html>`);
console.log('ok', m[1].length);

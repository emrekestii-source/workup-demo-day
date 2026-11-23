// Deneme icin: bir HTML dosyasini verilen genislikte tarayicida acip ekran goruntusu alir.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const [, , file, out, width = '512', scale = '2'] = process.argv;
const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((p) => fs.existsSync(p));
const b = await puppeteer.launch({ executablePath: chrome, headless: true });
const t = await b.newPage();
await t.setViewport({ width: Number(width), height: 800, deviceScaleFactor: Number(scale) });
await t.goto(pathToFileURL(file).href, { waitUntil: 'networkidle0' });
const info = await t.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  tables: Array.from(document.querySelectorAll('table')).map((x) => x.offsetWidth).slice(0, 6),
  img: Array.from(document.images).map((i) => [i.offsetWidth, i.offsetHeight, i.naturalWidth, i.naturalHeight]),
}));
console.log(JSON.stringify(info));
await t.screenshot({ path: out, fullPage: true });
await b.close();

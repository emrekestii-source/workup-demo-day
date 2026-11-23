#!/usr/bin/env node
/*
  Workup Gaming Demo Day Zoom seti: butun ekranlari uretir.

  Kullanim (proje kokunden):
    node workup-demo-day/build.mjs            hepsini uret
    node workup-demo-day/build.mjs opening bg sadece adi bu kelimeleri icerenleri uret

  Kaynak HTML dosyalari src/ altina, 1920x1080 PNG'ler out/ altina yazilir.
  Metin ya da stüdyo bilgisi degisecekse asagidaki STUDIOS ve LEVELS listelerini duzenle.
*/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SRC = path.join(HERE, 'src');
const OUT = path.join(HERE, 'out');

const STUDIOS = [
  { p: 'P1', name: 'threeW Games', slug: 'threew', tags: ['PC'], c: '#0c4ed3', d: '#0a2e7f' },
  { p: 'P2', name: 'Yeapp Game Studio', slug: 'yeapp', tags: ['Mobile', 'Hybrid casual'], c: '#da3273', d: '#671a44' },
  { p: 'P3', name: 'Portuma', slug: 'portuma', tags: ['GameTech', 'In-game ads'], c: '#4c4c58', d: '#222228' },
  { p: 'P4', name: 'HOGO Games', slug: 'hogo', tags: ['PC', 'Mobile'], c: '#6d3dc7', d: '#341a6f' },
  { p: 'P5', name: 'Wide Game Studio', slug: 'wide', tags: ['VR'], c: '#c72b37', d: '#68151c' },
  { p: 'P6', name: 'Krono Games', slug: 'krono', tags: ['Mobile'], c: '#6d58e2', d: '#332686' },
];

const LEVELS = [
  { n: 1, time: '16:00', title: 'Opening', sub: 'Remarks from İş Bankası and INVEXEN', big: ['OPENING'] },
  { n: 2, time: '16:10', title: 'Studio pitches', sub: 'Six studios, 3–4 minutes each', big: ['STUDIO', 'PITCHES'] },
  { n: 3, time: '16:35', title: 'Meeting rooms open', sub: 'One Zoom room per studio, any order', big: ['MEETING', 'ROOMS OPEN'] },
  { n: 4, time: '17:30', title: 'Wrap-up', sub: 'Game over, until the next cohort', big: ['WRAP-UP'] },
];

const lockup = (style) => `<img class="lockup" style="${style}" src="../brand/lockup-white.png" alt="INVEXEN and Workup Gaming">`;
const mark = (size = 22) => `<i class="mark" style="border-width:${size / 2}px 0 ${size / 2}px ${size * 0.8}px;margin-right:${size * 0.9}px"></i>`;
const sq = (size = 16) => `<i class="sq" style="width:${size}px;height:${size}px;margin-right:${size}px"></i>`;
const logo = (s, size, style = '') => `<img src="../brand/studios/${s.slug}.png" alt="${s.name}" style="display:block;flex:none;width:${size}px;height:${size}px;border-radius:${s.slug === 'wide' ? '50%' : '18%'};${style}">`;
const chips = (tags, fs = 17) => tags.map((t) => `<span class="chip" style="font-size:${fs}px;padding:${fs * 0.65}px ${fs * 0.9}px ${fs * 0.58}px">${t}</span>`).join('');
const dateTile = (style) => `<div class="tile" style="${style}"><span class="px px--flat" style="font-size:48px;line-height:1">26</span><span class="hud hud--white" style="font-size:17px;margin:12px 0 0 0.22em">Nov</span></div>`;

function page(title, body, pix, css = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title}</title>
<link rel="stylesheet" href="../kit/kit.css">
<style>${css}</style>
</head>
<body>
<main class="canvas">
${body}
</main>
<script src="../kit/pixels.js"></script>
<script>pixels(${JSON.stringify(pix)});</script>
</body>
</html>
`;
}

const pages = {};

/* 01 Acilis ekrani: yayin baslamadan once ekranda duran bekleme karesi */
pages['screens/01-opening'] = page('Opening screen', `
  ${lockup('left:96px;top:70px')}
  <div style="right:96px;top:58px;display:flex;align-items:center;gap:28px">
    <div style="text-align:right"><p class="hud hud--mute" style="font-size:19px">LV 1 starts at</p><p class="hud hud--white" style="font-size:24px;margin-top:12px"><b>16:00 GMT+3</b></p></div>
    ${dateTile('width:150px;height:128px')}
  </div>
  <div style="left:96px;top:252px;display:flex;align-items:center;gap:26px">
    <span class="tag" style="font-size:22px;padding:13px 18px 11px">COHORT 4</span>
    <span class="hud" style="font-size:22px">Acceleration program finale</span>
  </div>
  <h1 class="px px--lilac" style="left:96px;top:322px;font-size:80px">WORKUP GAMING</h1>
  <h1 class="px" style="left:96px;top:432px;font-size:152px">DEMO DAY</h1>
  <div style="left:96px;top:700px;display:flex;align-items:center;gap:30px">
    <span class="hud hud--white" style="font-size:22px">${sq(16)}Now loading</span>
    <span style="display:flex;gap:8px">${Array.from({ length: 28 }, (_, i) => `<i style="width:22px;height:22px;background:${i < 10 ? 'var(--purple)' : 'var(--dim)'}"></i>`).join('')}</span>
    <span class="hud hud--mute" style="font-size:19px">We start shortly</span>
  </div>
  <div style="left:96px;right:96px;top:764px;display:grid;grid-template-columns:repeat(6,1fr);gap:16px">
    ${STUDIOS.map((s) => `<div style="display:flex;align-items:center;gap:16px">${logo(s, 80)}<div><span class="hud" style="font-size:15px;font-weight:700">${s.p}</span><p style="margin:6px 0 0;font-size:21px;line-height:1.1">${s.name}</p></div></div>`).join('')}
  </div>
  <div style="left:96px;right:96px;top:886px;display:flex;gap:20px;align-items:stretch">
    <div class="card info"><span class="hud hud--mute">Date</span><p>Thu, 26 Nov 2026</p></div>
    <div class="card info"><span class="hud hud--mute">Time</span><p>16:00–17:30 GMT+3</p></div>
    <div class="card info"><span class="hud hud--mute">Format</span><p>Pitches, then meeting rooms</p></div>
    <div class="tile" style="margin-left:auto;padding:0 34px"><span class="px px--flat" style="font-size:24px;line-height:1.5">GET<br>READY</span></div>
  </div>
`, {
  seed: 11,
  emitters: [{ x: 1930, y: 520, rx: 300, ry: 300, s: 0.9 }, { x: 20, y: 1075, rx: 230, ry: 110, s: 0.55 }],
  avoid: [[60, 40, 520, 160], [1380, 30, 1920, 215], [70, 230, 1330, 660], [70, 680, 1560, 745], [70, 750, 1860, 856], [70, 868, 1860, 1012]],
});

/* 02 Zoom duvar kagidi: video karelerinin arkasinda durur, ortasi bos.
   Altta yazi yok: kullanici sag ve sol alt yaziyi istemedi (17 Kasim 2026). */
pages['zoom/wallpaper'] = page('Zoom wallpaper', `
  ${lockup('left:64px;top:34px;height:52px')}
  <div style="right:64px;top:42px;display:flex;align-items:center;gap:22px">
    <span class="px" style="font-size:24px">DEMO DAY</span>
    <span class="tag" style="font-size:15px;padding:10px 12px 8px">COHORT 4</span>
  </div>
`, {
  seed: 23,
  emitters: [{ x: 1920, y: 0, rx: 420, ry: 230, s: 0.5 }, { x: 0, y: 1080, rx: 460, ry: 250, s: 0.6 }, { x: 1920, y: 1080, rx: 380, ry: 230, s: 0.55 }, { x: 0, y: 0, rx: 300, ry: 180, s: 0.35 }, { x: 0, y: 540, rx: 110, ry: 300, s: 0.4 }, { x: 1920, y: 540, rx: 110, ry: 300, s: 0.4 }],
  avoid: [[30, 14, 470, 106], [1380, 20, 1900, 100]],
  dust: 0.0012,
});

/*
  Genel sanal arka plan: herkes ayni dosyayi kullanir (kullanicinin karari, 17 Kasim 2026).
  Kisiye ya da studyoya ozel arka plan yok. Uc secenek hazirlandi (sahne karti, sade, ust bant),
  kullanici secimi bana birakti, ust bant secildi (17 Kasim 2026). Digerleri kaldirildi.
  Kural: logolar ust koselerde, orta ve alt alan bos (konusmaci orada durur), kenarlardan 140 piksel pay.
*/
const bgTop = (y = 54) => `
  ${lockup(`left:140px;top:${y}px;height:54px`)}
  <div style="right:140px;top:${y + 8}px;display:flex;align-items:center;gap:22px">
    <span class="px" style="font-size:26px">DEMO DAY</span>
    <span class="tag" style="font-size:16px;padding:10px 13px 8px">COHORT 4</span>
  </div>`;

// Ust bant: konusmacinin basi mor bandin onunde kalir, logolar bandin icinde.
pages['zoom/background'] = page('Virtual background', `
  <div class="band" style="left:0;right:0;top:0;height:300px;--card:#000"></div>
  ${bgTop(98)}
`, { seed: 77, emitters: [{ x: 960, y: 334, rx: 1100, ry: 44, s: 0.32 }, { x: 0, y: 900, rx: 150, ry: 260, s: 0.55 }, { x: 1920, y: 900, rx: 150, ry: 260, s: 0.55 }], avoid: [[0, 0, 1920, 314], [400, 300, 1520, 1080]], dust: 0.001 }, '.px{--accent:#2e1873;--accent-deep:#160a3d} .tag{background:#000}');

/* Seviye ekranlari: solda o anki seviye, sagda dort seviyelik liste */
function levelList(current) {
  return `<h2 class="px" style="left:1108px;top:212px;font-size:44px">LEVELS</h2>
  <div class="levels" style="left:1108px;right:96px;top:300px">
    ${LEVELS.map((l) => `<div class="lv ${l.n === current ? 'lv--on' : l.n < current ? 'lv--done' : ''}"><span class="hud">LV ${l.n}</span><span class="t">${l.time}</span><div><h3>${l.title}</h3><p>${l.sub}</p></div></div>`).join('')}
  </div>`;
}
LEVELS.forEach((l) => {
  const longest = Math.max(...l.big.map((x) => x.length));
  const size = Math.min(128, Math.floor(920 / longest / 8) * 8);
  const lineH = Math.round(size * 1.2);
  const top = 400;
  pages[`screens/${{ 1: '02', 2: '03', 3: '11', 4: '13' }[l.n]}-lv${l.n}-${l.title.toLowerCase().replace(/[^a-z]+/g, '-')}`] = page(`LV ${l.n}, ${l.title}`, `
  ${lockup('left:96px;top:70px')}
  <p class="hud hud--mute" style="right:96px;top:92px;font-size:19px">Workup Gaming Demo Day, 26 Nov 2026</p>
  <div style="left:96px;top:306px;display:flex;align-items:center;gap:28px">
    <span class="tag" style="font-size:26px;padding:15px 20px 12px">LV ${l.n}</span>
    <span class="px px--flat" style="font-size:34px;line-height:1">${l.time}</span>
  </div>
  ${l.big.map((line, i) => `<h1 class="px ${i === 1 ? 'px--lilac' : ''}" style="left:96px;top:${top + i * lineH}px;font-size:${size}px">${line}</h1>`).join('\n  ')}
  <p style="left:96px;top:${top + l.big.length * lineH + 44}px;margin:0;font-size:44px;line-height:1.2;color:var(--lilac);width:900px">${l.sub}</p>
  <p class="hud" style="left:96px;bottom:84px;font-size:19px">${mark(20)}Cohort 4 finale</p>
  ${levelList(l.n)}
`, {
    seed: 60 + l.n,
    emitters: [{ x: 0, y: 1080, rx: 420, ry: 200, s: 0.55 }, { x: 1920, y: 1080, rx: 300, ry: 150, s: 0.45 }, { x: 1920, y: 0, rx: 200, ry: 120, s: 0.3 }],
    avoid: [[60, 40, 520, 160], [1000, 60, 1900, 150], [70, 280, 1060, 900], [1080, 190, 1900, 880], [70, 960, 700, 1020]],
  });
});

/* Stüdyo kartlari: Lineup ve odalar ekrani ayni karti kullanir */
function studioCards(extraChip) {
  return `<div style="left:96px;right:96px;top:412px;display:grid;grid-template-columns:repeat(6,1fr);gap:20px">
    ${STUDIOS.map((s) => `<article class="card" style="position:relative;height:452px;overflow:hidden;--accent:${s.c};--accent-deep:${s.d}">
      <div class="band" style="position:absolute;left:0;right:0;top:0;height:214px"></div>
      <span class="px px--flat" style="position:absolute;left:20px;top:20px;font-size:22px;line-height:1;z-index:2">${s.p}</span>
      ${logo(s, 132, 'position:absolute;left:50%;top:44px;margin-left:-66px;z-index:2;box-shadow:0 14px 30px -12px rgba(0,0,0,0.6)')}
      <div style="position:absolute;left:24px;right:20px;top:240px">
        <h3 style="margin:0;font-size:31px;font-weight:500;line-height:1.1;height:70px">${s.name}</h3>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:22px">${extraChip ? `<span class="chip" style="font-size:14px;padding:9px 11px 8px;background:var(--purple);color:#fff">${extraChip}</span>` : ''}${chips(s.tags, 14)}</div>
      </div>
    </article>`).join('')}
  </div>`;
}

pages['screens/04-lineup'] = page('The lineup', `
  ${lockup('left:96px;top:70px')}
  <div style="right:96px;top:58px;display:flex;align-items:center;gap:28px">
    <div style="text-align:right"><p class="hud hud--mute" style="font-size:19px">6 players</p><p class="hud hud--white" style="font-size:24px;margin-top:12px"><b>Ready</b></p></div>
    ${dateTile('width:150px;height:128px')}
  </div>
  <p class="hud" style="left:96px;top:204px;font-size:19px">${sq(15)}Player select</p>
  <h1 class="px" style="left:96px;top:250px;font-size:72px">THE <span class="px--lilac">LINEUP</span></h1>
  ${studioCards('')}
  <p class="hud hud--white" style="left:96px;bottom:84px;font-size:19px">${mark(20)}Six studios, 3–4 minutes each</p>
  <p class="hud hud--mute" style="right:96px;bottom:84px;font-size:19px">LV 2, 16:10 GMT+3</p>
`, {
  seed: 71,
  emitters: [{ x: 0, y: 1080, rx: 300, ry: 120, s: 0.5 }, { x: 1920, y: 300, rx: 150, ry: 160, s: 0.35 }],
  avoid: [[60, 40, 520, 160], [1380, 30, 1920, 215], [70, 190, 1100, 370], [80, 396, 1840, 880], [70, 960, 1860, 1020]],
});

STUDIOS.forEach((s, i) => {
  const next = STUDIOS[i + 1];
  pages[`screens/${String(5 + i).padStart(2, '0')}-pitch-${s.p.toLowerCase()}-${s.slug}`] = page(`Now pitching, ${s.name}`, `
  ${lockup('left:96px;top:70px')}
  <p class="hud hud--mute" style="right:96px;top:92px;font-size:19px">LV 2, studio pitches</p>
  <p class="hud hud--white" style="left:96px;top:232px;font-size:24px">${sq(18)}Now pitching</p>
  <h1 class="px" style="left:96px;top:296px;font-size:240px;line-height:1">${s.p}</h1>
  ${logo(s, 340, 'left:1400px;top:300px;box-shadow:0 0 0 14px #000')}
  <h2 style="left:96px;top:622px;margin:0;font-size:108px;font-weight:600;letter-spacing:-0.035em;line-height:1;white-space:nowrap">${s.name}</h2>
  <div style="left:96px;top:766px;display:flex;gap:14px">${chips(s.tags, 22)}</div>
  <div style="left:96px;bottom:80px;display:flex;align-items:center;gap:26px">
    <span class="hud" style="font-size:19px">Pitch ${i + 1} of 6</span>
    <span style="display:flex;gap:10px">${STUDIOS.map((_, j) => `<i style="width:26px;height:26px;background:${j === i ? s.c : j < i ? 'var(--dim)' : '#24212d'}"></i>`).join('')}</span>
  </div>
  <p class="hud hud--mute" style="right:96px;bottom:84px;font-size:19px">Up next: ${next ? `${next.p} ${next.name}` : 'meeting rooms, 16:35'}</p>
`, {
    seed: 80 + i,
    color: s.c, deep: s.d,
    emitters: [{ x: 1570, y: 470, rx: 400, ry: 400, s: 0.95 }, { x: 0, y: 1080, rx: 200, ry: 90, s: 0.4 }],
    avoid: [[60, 40, 520, 160], [1200, 60, 1900, 140], [70, 210, 1180, 850], [70, 960, 1900, 1030]],
  }, `:root{--accent:${s.c};--accent-deep:${s.d}}`);
});

pages['screens/12-meeting-rooms'] = page('Meeting rooms open', `
  ${lockup('left:96px;top:70px')}
  <p class="hud hud--mute" style="right:96px;top:92px;font-size:19px">Workup Gaming Demo Day, 26 Nov 2026</p>
  <div style="left:96px;top:196px;display:flex;align-items:center;gap:26px">
    <span class="tag" style="font-size:22px;padding:13px 18px 11px">LV 3</span>
    <span class="hud" style="font-size:22px">Drop in on any room, in any order</span>
  </div>
  <h1 class="px" style="left:96px;top:264px;font-size:72px">MEETING ROOMS <span class="px--lilac">OPEN</span></h1>
  ${studioCards('Room open')}
  <p class="hud hud--white" style="left:96px;bottom:84px;font-size:19px">${mark(20)}One Zoom room per studio</p>
  <p class="hud hud--mute" style="right:96px;bottom:84px;font-size:19px">Rooms close at 17:30 GMT+3</p>
`, {
  seed: 91,
  emitters: [{ x: 1920, y: 1080, rx: 300, ry: 120, s: 0.5 }, { x: 1920, y: 250, rx: 150, ry: 150, s: 0.35 }],
  avoid: [[60, 40, 520, 160], [1000, 60, 1900, 150], [70, 180, 1700, 380], [80, 396, 1840, 880], [70, 960, 1860, 1020]],
});

pages['screens/14-game-over'] = page('Wrap-up, game over', `
  ${lockup('left:96px;top:70px')}
  <p class="hud hud--mute" style="right:96px;top:92px;font-size:19px">Workup Gaming Demo Day, Cohort 4</p>
  <div style="left:96px;top:300px;display:flex;align-items:center;gap:26px">
    <span class="tag" style="font-size:22px;padding:13px 18px 11px">LV 4</span>
    <span class="hud" style="font-size:22px">Wrap-up</span>
  </div>
  <h1 class="px" style="left:96px;top:376px;font-size:160px">GAME OVER</h1>
  <p style="left:100px;top:612px;margin:0;font-size:52px;line-height:1.15;color:var(--lilac)">Until the next cohort.</p>
  <div style="left:96px;top:800px;display:flex;gap:20px;align-items:stretch">
    <div class="tile" style="padding:0 34px"><span class="px px--flat" style="font-size:24px;line-height:1.5">CONTINUE?</span></div>
    <div class="card info"><span class="hud hud--mute">Keep talking to the studios</span><p>workup@isbank.com.tr</p></div>
  </div>
  <p class="hud" style="left:96px;bottom:84px;font-size:19px">${mark(20)}Thank you for playing</p>
`, {
  seed: 97,
  emitters: [{ x: 1930, y: 560, rx: 380, ry: 420, s: 0.9 }, { x: 0, y: 1080, rx: 320, ry: 140, s: 0.5 }],
  avoid: [[60, 40, 520, 160], [1100, 60, 1900, 150], [70, 280, 1580, 700], [70, 780, 1100, 930], [70, 960, 800, 1020]],
});


/* Onizlemeler: yalnizca nasil duracagini gormek icin. Zoom'a yuklenmez. */
const person = (w) => `<svg viewBox="0 0 400 420" style="position:absolute;left:50%;bottom:0;width:${w}px;margin-left:${-w / 2}px" aria-hidden="true"><ellipse cx="200" cy="130" rx="74" ry="90" fill="#3b3944"/><path d="M168 205h64v40c0 14 10 22 28 28l62 22c28 10 44 32 44 60v65H34v-65c0-28 16-50 44-60l62-22c18-6 28-14 28-28Z" fill="#33313b"/></svg>`;
const nameTag = (name, role) => `<div style="position:absolute;left:14px;bottom:12px;display:flex;align-items:stretch;border-radius:8px;overflow:hidden;font-family:'Space Grotesk'"><i style="width:7px;background:#7b4dff"></i><div style="background:#18161f;padding:7px 14px 8px"><b style="display:block;font-size:17px;font-weight:600;color:#fff">${name}</b><span style="font-size:13px;color:#c6b4ff">${role}</span></div></div>`;
const tileView = (img, name, role, w, style) => `<div style="${style};width:${w}px;height:${Math.round(w * 9 / 16)}px;border-radius:16px;overflow:hidden;background:#000"><img src="../out/zoom/${img}.png" style="position:absolute;inset:0;width:100%;height:100%">${person(Math.round(w * 0.42))}${nameTag(name, role)}</div>`;
const previewLabel = (t) => `<p class="hud hud--mute" style="left:50%;transform:translateX(-50%);bottom:8px;font-size:13px;background:#000;padding:4px 10px">${t}</p>`;

pages['preview/zoom-webinar'] = page('Preview, webinar view', `
  <img src="../out/zoom/wallpaper.png" style="left:0;top:0;width:1920px;height:1080px">
  ${tileView('background', 'Host', 'INVEXEN', 548, 'left:110px;top:386px')}
  ${tileView('background', 'Speaker', 'Studio', 548, 'left:686px;top:386px')}
  ${tileView('background', 'Guest', 'Investor', 548, 'left:1262px;top:386px')}
  ${previewLabel('Preview only: the shared background as Zoom tiles on the wallpaper')}
`, { seed: 1, emitters: [], dust: 0 });

pages['preview/background'] = page('Preview, background', `
  <img src="../out/zoom/background.png" style="left:0;top:0;width:1920px;height:1080px">
  ${person(820)}
  ${previewLabel('Preview only: the shared background with a speaker in front')}
`, { seed: 1, emitters: [], dust: 0 });

/*
  Davet e-postasi. Iki parca:
  1. email/banner: 960x440 baslik bandi (e-postada 480x220 gosterilir).
  2. out/email/invite.html: Outlook'a yapistirilacak e-posta. Tarayicida acilir, "E-postayi kopyala" ile kopyalanir.
  Metin kullanicinin 18 Kasim 2026'da gonderdigi davet metninden yeniden yazildi.

  Kullanici klasik Outlook kullaniyor (Word motoru). Bu yuzden:
  - Her sey tek bir tablonun satirlari. Bosluk margin ile degil hucre dolgusuyla verilir (Word tablo margin'ini bozuyor).
  - Dugme ic ice iki tablo: distaki koyu mor golge, icteki mor yuzey. Kenarlik ve border-radius yok.
  - Bant gorseli link icinde degil (Word linkli gorselin altina mavi cizgi ciziyor).
  - Genislik 480 piksel ve govde yazisi 16 piksel. Klasik Outlook gonderirken HTML'i yeniden yazdigi icin
    gercek duyarli duzen (media query) alicida kalmaz. Telefonlar sabit genisligi ekrana sigdirir,
    480 piksel ve buyuk yazi kuculdugunde de okunur kalir.
  - Tarih, saat ve sure kalin (kullanicinin istegi).
*/
const LUMA = 'https://luma.com/n47g9vtv';
const SIZES = { 'email/banner': [960, 440] };

pages['email/banner'] = page('Email banner', `
  ${lockup('left:48px;top:50px;height:54px')}
  <div class="tile" style="right:48px;top:40px;width:170px;height:150px"><span class="px px--flat" style="font-size:56px;line-height:1">26</span><span class="hud hud--white" style="font-size:22px;margin:14px 0 0 0.22em">Nov</span></div>
  <p class="hud hud--white" style="right:48px;top:212px;font-size:24px"><b>16:00 GMT+3</b></p>
  <span class="tag" style="left:48px;top:150px;font-size:22px;padding:13px 16px 10px">COHORT 4</span>
  <h1 class="px px--lilac" style="left:48px;top:218px;font-size:42px">WORKUP GAMING</h1>
  <h1 class="px" style="left:48px;top:282px;font-size:100px">DEMO DAY</h1>
`, {
  w: 960, h: 440, seed: 41,
  emitters: [{ x: 970, y: 330, rx: 150, ry: 150, s: 0.85 }, { x: 560, y: 0, rx: 240, ry: 90, s: 0.45 }, { x: 0, y: 440, rx: 120, ry: 50, s: 0.4 }],
  avoid: [[28, 30, 440, 124], [720, 24, 932, 250], [30, 136, 280, 206], [30, 206, 900, 424]],
  dust: 0.001,
}, '.canvas{width:960px;height:440px}');

function inviteEmail(bannerB64) {
  const W = 480;
  const F = "font-family:Arial,Helvetica,sans-serif";
  const MONO = "font-family:'Courier New',Courier,monospace";
  const EXACT = 'mso-line-height-rule:exactly';
  const TABLE = 'role="presentation" cellpadding="0" cellspacing="0" border="0"';
  const TSTYLE = 'border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt';
  // Her hucredeki yazi <p style="margin:0"> icinde durur. Yapistirilan belgenin "Normal" stilinde paragraf
  // sonrasi bosluk varsa (Word'de 8pt) ciplak hucre yazisi onu devralir ve satirlar siser. margin:0 bunu keser.
  const P = (style, html, extra = '') => `<p style="margin:0;${extra}${style}">${html}</p>`;
  const BODY = `${F};font-size:16px;line-height:24px;${EXACT};color:#1b1a22`;
  const LABEL = `${MONO};font-size:13px;line-height:18px;${EXACT};font-weight:bold;letter-spacing:2px;color:#7b4dff`;
  // Bir paragraf = bir satir. pad: ust, sag, alt, sol dolgu.
  const row = (html, pad = '0 0 16px 0') => `
    <tr><td style="padding:${pad};${BODY}">${P(BODY, html)}</td></tr>`;
  const label = (t) => `
    <tr><td style="padding:12px 0 10px 0;${LABEL}">${P(LABEL, t)}</td></tr>`;
  const TAG = `${MONO};font-size:14px;line-height:20px;${EXACT};font-weight:bold;color:#ffffff`;
  const NAME = `${F};font-size:16px;line-height:20px;${EXACT};color:#1b1a22`;
  const KIND = `${F};font-size:14px;line-height:20px;${EXACT};color:#5d5a70`;
  const studioRows = STUDIOS.map((s) => `
        <tr>
          <td width="46" align="center" valign="middle" bgcolor="#7b4dff" style="width:46px;background:#7b4dff;border-bottom:6px solid #ffffff;${TAG};padding:10px 0">${P(TAG, s.p, 'text-align:center;')}</td>
          <td valign="middle" bgcolor="#f5f3fc" style="background:#f5f3fc;border-bottom:6px solid #ffffff;${NAME};padding:10px 6px 10px 14px">${P(NAME, `<b>${s.name}</b>`)}</td>
          <td align="right" valign="middle" bgcolor="#f5f3fc" style="background:#f5f3fc;border-bottom:6px solid #ffffff;${KIND};padding:10px 14px 10px 6px">${P(KIND, s.tags.join(', '), 'text-align:right;')}</td>
        </tr>`).join('');
  const AGENDA = [['16:00', 'Opening remarks, İş Bankası and INVEXEN'], ['16:10', 'Studio pitches'], ['16:35', 'Studio breakout rooms'], ['17:30', 'Close']];
  const TIME = `${MONO};font-size:16px;line-height:22px;${EXACT};font-weight:bold;color:#7b4dff`;
  const ITEM = `${F};font-size:16px;line-height:22px;${EXACT};color:#1b1a22`;
  const agendaRows = AGENDA.map(([t, d]) => `
        <tr>
          <td width="74" valign="top" style="width:74px;border-bottom:1px solid #e4e0f2;${TIME};padding:10px 0">${P(TIME, `<b>${t}</b>`)}</td>
          <td valign="top" style="border-bottom:1px solid #e4e0f2;${ITEM};padding:10px 0">${P(ITEM, d)}</td>
        </tr>`).join('');
  const BTN = `${F};font-size:16px;line-height:20px;${EXACT};font-weight:bold;color:#ffffff`;
  const button = `<table ${TABLE} style="${TSTYLE}"><tr><td bgcolor="#2e1873" style="background:#2e1873;padding:0 4px 4px 0"><table ${TABLE} style="${TSTYLE}"><tr><td align="center" bgcolor="#7b4dff" style="background:#7b4dff;padding:14px 30px;${BTN}">${P(BTN, `<a href="${LUMA}" style="${F};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none"><span style="color:#ffffff;text-decoration:none">Register on Luma</span></a>`, 'text-align:center;')}</td></tr></table></td></tr></table>`;
  const mail = `<table ${TABLE} width="${W}" style="width:${W}px;${TSTYLE};background:#ffffff">
    <tr><td style="padding:0"><p style="margin:0"><img src="data:image/png;base64,${bannerB64}" width="${W}" height="220" alt="Workup Gaming Demo Day, Cohort 4. Thursday 26 November 2026, 16:00 GMT+3, live on Zoom." style="display:block;border:0;outline:none;text-decoration:none;width:${W}px;height:220px"></p></td></tr>${row('Hi [First name],', '26px 0 16px 0')}${row('On <b>Thursday, 26 November at 16:00 (GMT+3)</b>, six game studios will pitch <b>live on Zoom</b>, and we would like you in the room.')}${row('It is the Demo Day of Workup Gaming’s 4th cohort, the game studio acceleration program our Firstpoint VC team runs together with INVEXEN, under the Workup Entrepreneurship Program whose main supporter is İş Bankası.')}${row('The format is built around your time. The pitches take <b>25 minutes</b> in total. After that, every studio opens its own breakout room, so you can go straight to the teams you want to meet.')}${label('THE SIX STUDIOS')}
    <tr><td style="padding:0"><table ${TABLE} width="${W}" style="width:${W}px;${TSTYLE}">${studioRows}
      </table></td></tr>${label('AGENDA, THU 26 NOV 2026 (GMT+3)')}
    <tr><td style="padding:0"><table ${TABLE} width="${W}" style="width:${W}px;${TSTYLE};border-top:1px solid #e4e0f2">${agendaRows}
      </table></td></tr>
    <tr><td style="padding:26px 0 18px 0">${button}</td></tr>${row(`Registration takes a minute: <a href="${LUMA}" style="color:#5b33d6">${LUMA}</a>`)}${row('If a colleague of yours should see these studios, please feel free to forward this to them.')}${row('Best regards,', '0')}
  </table>`;
  return { mail, page: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Workup Gaming Demo Day, invitation email</title>
<style>
  body { margin: 0; background: #eceaf3; font-family: Arial, Helvetica, sans-serif; }
  .bar { position: sticky; top: 0; display: flex; align-items: center; gap: 18px; padding: 14px 24px; background: #18161f; color: #e4def6; font-size: 14px; line-height: 20px; }
  .bar button { flex: none; border: 0; padding: 11px 20px; background: #7b4dff; color: #fff; font: bold 14px Arial, Helvetica, sans-serif; cursor: pointer; box-shadow: 4px 4px 0 #2e1873; }
  .bar button:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #2e1873; }
  .sheet { width: 480px; margin: 28px auto 60px; padding: 36px 40px 40px; background: #fff; }
</style>
</head>
<body>
<div class="bar"><button id="copy" type="button">E-postayı kopyala</button><span>Sonra Outlook'ta yeni e-postanın gövdesine yapıştır (Ctrl+V). Göndermeden önce [First name] yerine kişinin adını yaz.</span></div>
<div class="sheet"><div id="mail">${mail}</div></div>
<script>
  const mail = document.getElementById('mail');
  const btn = document.getElementById('copy');
  btn.addEventListener('click', async () => {
    let ok = false;
    try {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([mail.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([mail.innerText], { type: 'text/plain' }),
      })]);
      ok = true;
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(mail);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      ok = document.execCommand('copy');
      sel.removeAllRanges();
    }
    btn.textContent = ok ? 'Kopyalandı' : 'Kopyalanamadı: elle seçip kopyala';
    setTimeout(() => { btn.textContent = 'E-postayı kopyala'; }, 2600);
  });
</script>
</body>
</html>
` };
}

/* ---------- uretim ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (rel === '/favicon.ico') { res.writeHead(204); res.end(); return; }
  // Bu klasor tek basina bir depo olarak klonlandiysa node_modules icindedir, ust klasorun parcasiysa bir ustundedir.
  // Sayfalar her iki durumda da /workup-demo-day/... ve /node_modules/... adreslerini kullanir.
  const MODULES = [path.join(HERE, 'node_modules'), path.join(ROOT, 'node_modules')].find((p) => fs.existsSync(p)) || path.join(ROOT, 'node_modules');
  const mount = rel.startsWith('/workup-demo-day/') ? [HERE, rel.slice('/workup-demo-day/'.length)]
    : rel.startsWith('/node_modules/') ? [MODULES, rel.slice('/node_modules/'.length)]
    : [ROOT, rel];
  const file = path.join(mount[0], mount[1]);
  if (!file.startsWith(mount[0]) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const chrome = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).find((p) => fs.existsSync(p));
const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars', '--force-color-profile=srgb', '--font-render-hinting=none'] });
fs.mkdirSync(SRC, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2);
try {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  tab.on('response', (r) => { if (r.status() >= 400) console.warn('yuklenemedi:', r.status(), r.url()); });
  for (const [name, html] of Object.entries(pages)) {
    const flat = name.replace('/', '--');
    fs.writeFileSync(path.join(SRC, `${flat}.html`), html);
    if (only.length && !only.some((k) => name.includes(k))) continue;
    fs.mkdirSync(path.dirname(path.join(OUT, `${name}.png`)), { recursive: true });
    const [w, h] = SIZES[name] || [1920, 1080];
    await tab.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await tab.goto(`http://127.0.0.1:${port}/workup-demo-day/src/${flat}.html`, { waitUntil: 'networkidle0' });
    await tab.evaluate(async () => { await document.fonts.ready; await Promise.all(Array.from(document.images).map((i) => (i.decode ? i.decode().catch(() => {}) : null))); });
    await tab.screenshot({ path: path.join(OUT, `${name}.png`), type: 'png', clip: { x: 0, y: 0, width: w, height: h } });
    console.log('PNG', `out/${name}.png`, Math.round(fs.statSync(path.join(OUT, `${name}.png`)).size / 1024) + ' KB');
  }
  const banner = path.join(OUT, 'email', 'banner.png');
  if (fs.existsSync(banner) && (!only.length || only.some((k) => 'email/invite'.includes(k)))) {
    fs.writeFileSync(path.join(OUT, 'email', 'invite.html'), inviteEmail(fs.readFileSync(banner).toString('base64')).page);
    console.log('HTML out/email/invite.html', Math.round(fs.statSync(path.join(OUT, 'email', 'invite.html')).size / 1024) + ' KB');
  }
  if (!only.length) {
    const shots = fs.readdirSync(path.join(OUT, 'screens')).filter((n) => n.endsWith('.png')).sort();
    const deck = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:1920px 1080px;margin:0}html,body{margin:0;background:#000}img{display:block;width:1920px;height:1080px;page-break-after:always}</style></head><body>${shots.map((n) => `<img src="../out/screens/${n}">`).join('')}</body></html>`;
    fs.writeFileSync(path.join(SRC, '_deck.html'), deck);
    await tab.goto(`http://127.0.0.1:${port}/workup-demo-day/src/_deck.html`, { waitUntil: 'networkidle0' });
    await tab.pdf({ path: path.join(OUT, 'screens', 'demo-day-screens.pdf'), width: '1920px', height: '1080px', printBackground: true });
    console.log('PDF out/screens/demo-day-screens.pdf', shots.length + ' sayfa');
  }
} finally {
  await browser.close();
  server.close();
}

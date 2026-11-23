/*
  Piksel serpintisi: Luma gorsellerindeki kenarlardan dagilan mor kareler.
  Ayni tohum (seed) her zaman ayni deseni verir.

  pixels({
    seed: 7,
    emitters: [{ x, y, rx, ry, s }],   // yogunluk merkezleri: konum, yaricap, guc (0 ile 1)
    avoid: [[x0, y0, x1, y1]],         // karelerin girmeyecegi alanlar (yazi ve kartlar)
    color: '#7b4dff', deep: '#2e1873', // ana renk ve koyu tonu
    dust: 0.002,                       // serbest dagilan kucuk gri kareler
    w: 1920, h: 1080                   // tuval olcusu (varsayilan 1920x1080, e-posta bandi icin 1200x440)
  })
*/
(function () {
  function rng(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  window.pixels = function (o) {
    const W = o.w || 1920, H = o.h || 1080, pitch = o.pitch || 20, size = o.size || 15;
    const rnd = rng(o.seed || 1), color = o.color || '#7b4dff', deep = o.deep || '#2e1873';
    const avoid = o.avoid || [], dust = o.dust === undefined ? 0.002 : o.dust;
    const parts = [];
    for (let gy = 0; gy < H / pitch; gy++) {
      for (let gx = 0; gx < W / pitch; gx++) {
        const x = gx * pitch, y = gy * pitch, cx = x + pitch / 2, cy = y + pitch / 2;
        const r1 = rnd(), r2 = rnd(), r3 = rnd();
        if (avoid.some((a) => cx > a[0] && cx < a[2] && cy > a[1] && cy < a[3])) continue;
        let p = 0;
        for (const e of o.emitters || []) { const dx = (cx - e.x) / e.rx, dy = (cy - e.y) / e.ry; p += e.s * Math.exp(-(dx * dx + dy * dy)); }
        if (r1 < p) {
          let fill = color, op = 1;
          if (r2 < 0.1) { fill = '#c6b4ff'; op = 0.85; }
          else if (r2 < 0.42) { fill = deep; }
          else if (r2 < 0.7) { op = 0.55; }
          const off = (pitch - size) / 2;
          parts.push(`<rect x="${x + off}" y="${y + off}" width="${size}" height="${size}" fill="${fill}" opacity="${op}"/>`);
        } else if (r3 < dust) {
          parts.push(`<rect x="${x + 6}" y="${y + 6}" width="8" height="8" fill="#8a8794" opacity="0.8"/>`);
        }
      }
    }
    const holder = document.createElement('div');
    holder.innerHTML = `<svg class="px-field" viewBox="0 0 ${W} ${H}" aria-hidden="true">${parts.join('')}</svg>`;
    document.querySelector('.canvas').prepend(holder.firstChild);
  };
})();

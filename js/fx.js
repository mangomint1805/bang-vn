// Hiệu ứng: bài bay, rung, số sát thương, âm thanh tổng hợp (không cần file âm thanh)
let muted = false;
try { muted = localStorage.getItem('bangvn-mute') === '1'; } catch (e) {}
export function isMuted() { return muted; }
export function toggleMute() { muted = !muted; try { localStorage.setItem('bangvn-mute', muted ? '1' : '0'); } catch (e) {} return muted; }

let ac = null;
function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (ac.state === 'suspended') ac.resume(); return ac; }
function noise(dur, filterFreq, gain, decay = dur) {
  const a = ctx(); if (!a) return;
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
  const src = a.createBufferSource(); src.buffer = buf;
  const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq;
  const g = a.createGain(); g.gain.setValueAtTime(gain, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + decay);
  src.connect(f); f.connect(g); g.connect(a.destination); src.start();
}
function tone(freq, dur, type = 'sine', gain = 0.15, slide = 0) {
  const a = ctx(); if (!a) return;
  const o = a.createOscillator(); o.type = type; o.frequency.setValueAtTime(freq, a.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), a.currentTime + dur);
  const g = a.createGain(); g.gain.setValueAtTime(gain, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur);
}
export const sfx = {
  card() { if (!muted) noise(0.08, 3500, 0.25, 0.07); },
  shot() { if (!muted) { noise(0.35, 1800, 0.9, 0.3); tone(120, 0.2, 'triangle', 0.3, -80); } },
  hit() { if (!muted) { tone(220, 0.25, 'sawtooth', 0.12, -150); } },
  dodge() { if (!muted) { noise(0.25, 6000, 0.15, 0.25); tone(900, 0.2, 'sine', 0.05, 600); } },
  heal() { if (!muted) { tone(523, 0.12, 'sine', 0.12); setTimeout(() => tone(784, 0.18, 'sine', 0.12), 90); } },
  turn() { if (!muted) { tone(660, 0.1, 'triangle', 0.08); } },
  death() { if (!muted) { tone(300, 0.6, 'sawtooth', 0.12, -250); } },
  win() { if (!muted) [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.3, 'triangle', 0.12), i * 130)); },
  boom() { if (!muted) { noise(0.9, 900, 1, 0.9); } },
};

// Lớp bay
function layer() { let l = document.getElementById('fx-layer'); if (!l) { l = document.createElement('div'); l.id = 'fx-layer'; document.body.appendChild(l); } return l; }
function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }

// Bay một phần tử (HTML) từ A đến B
export function fly(html, fromEl, toEl, { delay = 0, duration = 520, scaleTo = 1, rotate = 0, onEnd } = {}) {
  if (!fromEl || !toEl) return;
  const a = center(fromEl), b = center(toEl);
  const n = document.createElement('div'); n.className = 'flyer'; n.innerHTML = html;
  layer().appendChild(n);
  const w = n.offsetWidth || 70, h = n.offsetHeight || 98;
  n.style.transform = `translate(${a.x - w / 2}px, ${a.y - h / 2}px) scale(.85)`;
  n.style.opacity = '0';
  setTimeout(() => {
    n.style.transition = `transform ${duration}ms cubic-bezier(.2,.8,.25,1), opacity 160ms`;
    n.style.opacity = '1';
    n.style.transform = `translate(${b.x - w / 2}px, ${b.y - h / 2}px) scale(${scaleTo}) rotate(${rotate}deg)`;
    sfx.card();
    setTimeout(() => { n.style.transition = 'opacity 180ms'; n.style.opacity = '0'; setTimeout(() => { n.remove(); onEnd && onEnd(); }, 180); }, duration);
  }, delay);
}

export function shake(el) { if (!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 600); }
export function flash(el, cls = 'flash-red') { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 700); }
export function floatText(el, text, color = '#c0392b') {
  if (!el) return; const c = center(el);
  const n = document.createElement('div'); n.className = 'float-text'; n.textContent = text; n.style.color = color;
  n.style.left = c.x + 'px'; n.style.top = (c.y - 10) + 'px';
  layer().appendChild(n); setTimeout(() => n.remove(), 1200);
}
export function banner(text, sub = '') {
  const n = document.createElement('div'); n.className = 'banner'; n.innerHTML = `<div>${text}</div>${sub ? `<small>${sub}</small>` : ''}`;
  layer().appendChild(n); setTimeout(() => n.classList.add('out'), 1400); setTimeout(() => n.remove(), 1900);
}

// ================= Hạt hiệu ứng trên canvas =================
let fcv, fcx, fparts = [], fraf = 0, FW = 0, FH = 0;
function fcanvas() {
  if (!fcv) { fcv = document.createElement('canvas'); fcv.id = 'fx-canvas'; document.body.appendChild(fcv); fcx = fcv.getContext('2d'); const rs = () => { const d = Math.min(2, devicePixelRatio || 1); FW = innerWidth; FH = innerHeight; fcv.width = FW * d; fcv.height = FH * d; fcx.setTransform(d, 0, 0, d, 0, 0); }; addEventListener('resize', rs); rs(); }
  if (!fraf) fraf = requestAnimationFrame(ftick);
}
function ftick() {
  fcx.clearRect(0, 0, FW, FH);
  for (let i = fparts.length - 1; i >= 0; i--) {
    const p = fparts[i]; p.t++;
    if (p.t > p.life) { fparts.splice(i, 1); continue; }
    const k = p.t / p.life;
    if (p.type === 'tracer') {
      const head = Math.min(1, p.t / p.speed), tail = Math.max(0, (p.t - 5) / p.speed);
      const hx = p.x + (p.tx - p.x) * head, hy = p.y + (p.ty - p.y) * head, tx = p.x + (p.tx - p.x) * tail, ty = p.y + (p.ty - p.y) * tail;
      const g = fcx.createLinearGradient(tx, ty, hx, hy); g.addColorStop(0, 'rgba(255,200,80,0)'); g.addColorStop(1, 'rgba(255,240,180,1)');
      fcx.strokeStyle = g; fcx.lineWidth = 3; fcx.lineCap = 'round'; fcx.beginPath(); fcx.moveTo(tx, ty); fcx.lineTo(hx, hy); fcx.stroke();
      if (head >= 1 && !p.hit) { p.hit = true; p.onHit && p.onHit(); }
      continue;
    }
    if (p.type === 'arrow') {
      const h = Math.min(1, p.t / p.speed); const x = p.x + (p.tx - p.x) * h, y = p.y + (p.ty - p.y) * h - Math.sin(h * Math.PI) * p.arc;
      const ang = Math.atan2((p.ty - p.y) - Math.cos(h * Math.PI) * p.arc * Math.PI, p.tx - p.x);
      fcx.save(); fcx.translate(x, y); fcx.rotate(ang); fcx.strokeStyle = '#5a3a22'; fcx.lineWidth = 2.5; fcx.beginPath(); fcx.moveTo(-22, 0); fcx.lineTo(6, 0); fcx.stroke();
      fcx.fillStyle = '#444'; fcx.beginPath(); fcx.moveTo(10, 0); fcx.lineTo(2, -4); fcx.lineTo(2, 4); fcx.fill();
      fcx.fillStyle = '#c0392b'; fcx.beginPath(); fcx.moveTo(-22, 0); fcx.lineTo(-28, -5); fcx.lineTo(-16, 0); fcx.lineTo(-28, 5); fcx.fill(); fcx.restore();
      if (h >= 1) { p.t = p.life; p.onHit && p.onHit(); }
      continue;
    }
    p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.vx *= p.drag || 1; p.vy *= p.drag || 1;
    const a = p.fade === false ? 1 : 1 - k;
    if (p.type === 'spark') { fcx.fillStyle = `rgba(${p.c},${a})`; fcx.beginPath(); fcx.arc(p.x, p.y, p.r * (1 - k * .5), 0, 6.28); fcx.fill(); }
    else if (p.type === 'smoke') { fcx.fillStyle = `rgba(${p.c},${a * .35})`; fcx.beginPath(); fcx.arc(p.x, p.y, p.r * (1 + k * 2), 0, 6.28); fcx.fill(); }
    else if (p.type === 'flash') { const r = p.r * (1 + k); const g = fcx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); g.addColorStop(0, `rgba(255,250,210,${a})`); g.addColorStop(.4, `rgba(255,170,40,${a * .8})`); g.addColorStop(1, 'rgba(255,120,0,0)'); fcx.fillStyle = g; fcx.beginPath(); fcx.arc(p.x, p.y, r, 0, 6.28); fcx.fill(); }
    else if (p.type === 'confetti') { p.rot += p.vr; fcx.save(); fcx.translate(p.x, p.y); fcx.rotate(p.rot); fcx.globalAlpha = Math.min(1, (1 - k) * 3); fcx.fillStyle = p.c; if (p.star) { fcx.font = `${p.r * 3}px serif`; fcx.fillText('★', -p.r, p.r); } else fcx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); fcx.restore(); }
    else if (p.type === 'bubble') { fcx.strokeStyle = `rgba(${p.c},${a})`; fcx.lineWidth = 1.5; fcx.beginPath(); fcx.arc(p.x + Math.sin(p.t / 6) * 3, p.y, p.r, 0, 6.28); fcx.stroke(); }
    else if (p.type === 'plus') { fcx.fillStyle = `rgba(${p.c},${a})`; fcx.font = `bold ${p.r}px sans-serif`; fcx.fillText('+', p.x, p.y); }
  }
  fraf = fparts.length ? requestAnimationFrame(ftick) : 0;
  if (!fraf) fcx.clearRect(0, 0, FW, FH);
}
const R = (a, b) => a + Math.random() * (b - a);
function pt(el) { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function burst(x, y, n, opt) { for (let i = 0; i < n; i++) { const a = R(0, 6.28), s = R(opt.smin || 1, opt.smax || 4); fparts.push({ type: opt.type || 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: opt.g || 0, drag: opt.drag || .96, r: R(opt.rmin || 1.5, opt.rmax || 3), c: opt.c || '255,200,80', life: R(opt.lmin || 20, opt.lmax || 40), t: 0 }); } }

// Phát bắn: chớp nòng + vệt đạn + tia lửa khi trúng
export function shoot(fromEl, toEl, { delay = 0, onHit } = {}) {
  const a = pt(fromEl), b = pt(toEl); if (!a || !b) return;
  setTimeout(() => {
    fcanvas();
    fparts.push({ type: 'flash', x: a.x, y: a.y, vx: 0, vy: 0, r: 26, life: 10, t: 0 });
    burst(a.x, a.y, 8, { type: 'smoke', c: '200,190,170', smin: .3, smax: 1.2, rmin: 6, rmax: 12, lmin: 30, lmax: 50 });
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    fparts.push({ type: 'tracer', x: a.x, y: a.y, tx: b.x + R(-8, 8), ty: b.y + R(-8, 8), speed: Math.max(6, dist / 55), life: Math.max(6, dist / 55) + 8, t: 0,
      onHit: () => { burst(b.x, b.y, 14, { c: '255,210,90', smin: 1.5, smax: 5 }); onHit && onHit(); } });
  }, delay);
}
export function arrows(fromEl, toEl, { delay = 0, onHit } = {}) {
  const a = pt(fromEl), b = pt(toEl); if (!a || !b) return;
  setTimeout(() => { fcanvas(); fparts.push({ type: 'arrow', x: a.x, y: a.y, tx: b.x, ty: b.y, arc: 60, speed: 32, life: 40, t: 0, onHit: () => { burst(b.x, b.y, 6, { c: '120,80,40', smin: 1, smax: 3 }); onHit && onHit(); } }); }, delay);
}
export function explode(el) {
  const a = pt(el); if (!a) return; fcanvas();
  fparts.push({ type: 'flash', x: a.x, y: a.y, vx: 0, vy: 0, r: 90, life: 18, t: 0 });
  burst(a.x, a.y, 50, { c: '255,170,40', smin: 2, smax: 9, g: .12, rmin: 2, rmax: 4.5, lmin: 30, lmax: 60 });
  burst(a.x, a.y, 20, { type: 'smoke', c: '90,80,70', smin: .5, smax: 2.5, rmin: 10, rmax: 22, lmin: 50, lmax: 90 });
  const w = document.createElement('div'); w.className = 'white-flash'; document.body.appendChild(w); setTimeout(() => w.remove(), 600);
  screenShake();
}
export function sparkle(el, c = '90,200,120') {
  const a = pt(el); if (!a) return; fcanvas();
  for (let i = 0; i < 12; i++) fparts.push({ type: i % 2 ? 'plus' : 'bubble', x: a.x + R(-30, 30), y: a.y + R(-10, 20), vx: R(-.3, .3), vy: R(-1.6, -.6), r: i % 2 ? R(12, 20) : R(3, 6), c, life: R(40, 70), t: 0 });
}
export function confetti() {
  fcanvas(); const cols = ['#d4a63a', '#b8322a', '#2f6fa8', '#3f8f4f', '#f3e6c8', '#e08a2a'];
  for (let i = 0; i < 160; i++) fparts.push({ type: 'confetti', x: R(0, FW), y: R(-FH * .5, -10), vx: R(-1, 1), vy: R(1.5, 4), g: .03, drag: .995, r: R(3, 7), rot: R(0, 6), vr: R(-.15, .15), c: cols[i % cols.length], star: Math.random() < .25, life: R(160, 260), t: 0, fade: false });
}
export function stamp(el, text) {
  const a = pt(el); if (!a) return;
  const n = document.createElement('div'); n.className = 'stamp'; n.textContent = text; n.style.left = a.x + 'px'; n.style.top = a.y + 'px';
  layer().appendChild(n); setTimeout(() => n.remove(), 950);
}
export function screenShake() { const s = document.querySelector('#screen-game'); if (!s) return; s.classList.remove('screen-shake'); void s.offsetWidth; s.classList.add('screen-shake'); setTimeout(() => s.classList.remove('screen-shake'), 650); }

/* ====== EDIT THIS SECTION ====== */
const birthdayPerson = {
  name: "Mim Apu",
  photo: "image.jpeg",
  birthDate: "2005-10-31",               // format: YYYY-MM-DD
  message: "May your life always be filled with happiness, love, and beautiful memories.",
  secretMessage: "You make the world brighter just by being in it. Thank you for being you. 💜"
};
/* ====== END OF SETTINGS ====== */

const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#ff8fc7', '#b38cff', '#f4d58d', '#5ee7ff', '#ffffff'];
const rand = (a, b) => a + Math.random() * (b - a);
const dpr = () => Math.min(devicePixelRatio || 1, 2);

/* ---------- Dates ---------- */
function parseDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3], dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? { y, mo, d } : null;
}
function calcAge(b, now = new Date()) {
  let age = now.getFullYear() - b.y;
  const m = now.getMonth() + 1 - b.mo;
  if (m < 0 || (m === 0 && now.getDate() < b.d)) age--;   // birthday not reached yet this year
  return age;
}
function nextBirthday(b, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let n = new Date(now.getFullYear(), b.mo - 1, b.d);
  if (n < today) n = new Date(now.getFullYear() + 1, b.mo - 1, b.d);
  return n;
}

/* ---------- Fill the card ---------- */
const birth = parseDate(birthdayPerson.birthDate);
function fillCard() {
  const p = birthdayPerson, img = $('#photo');
  $('#name').textContent = p.name;
  $('#message').textContent = p.message;
  $('#secret').textContent = p.secretMessage;
  $('#initial').textContent = (p.name.trim()[0] || '🎂').toUpperCase();
  img.alt = p.name;
  img.onerror = () => { img.hidden = true; };          // fallback: show initial
  if (p.photo) img.src = p.photo; else img.hidden = true;
  $('#dob').textContent = birth
    ? 'Born on ' + new Date(birth.y, birth.mo - 1, birth.d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Add a birth date in script.js 🎂';
  [...$('#card').children].forEach((e, i) => e.style.setProperty('--i', i));
  for (let i = 0; i < 10; i++) {                       // sparkles around the card
    const s = document.createElement('i');
    s.className = 'sp';
    s.style.cssText = `left:${rand(-2, 96)}%;top:${rand(-2, 96)}%;animation-delay:${rand(0, 2.6)}s;transform:scale(${rand(.6, 1.2)})`;
    $('#card').appendChild(s);
  }
}
function tick() {
  const now = new Date(), age = $('#age'), cd = $('#countdown');
  if (!birth || calcAge(birth, now) < 0) {
    age.textContent = 'Age: a wonderful surprise ✨';
    cd.hidden = true; $('#todayBanner').hidden = true; return;
  }
  age.textContent = `Age: ${calcAge(birth, now)} years`;
  const today = now.getMonth() + 1 === birth.mo && now.getDate() === birth.d;
  $('#todayBanner').hidden = !today;
  cd.hidden = today;
  if (today) return;
  const ms = nextBirthday(birth, now) - now;
  const v = [Math.floor(ms / 864e5), Math.floor(ms / 36e5) % 24, Math.floor(ms / 6e4) % 60, Math.floor(ms / 1e3) % 60];
  cd.innerHTML = ['days', 'hrs', 'min', 'sec'].map((l, i) => `<b>${v[i]}<small>${l}</small></b>`).join('');
}

/* ---------- Cake ---------- */
function buildCake() {
  const ns = 'http://www.w3.org/2000/svg';
  const el = (t, a, par) => { const e = document.createElementNS(ns, t); for (const k in a) e.setAttribute(k, a[k]); par.appendChild(e); return e; };
  [[30, 180, 140], [55, 130, 100], [80, 80, 64]].forEach(([x, w, y]) => {
    const n = Math.round(w / 20);
    el('rect', { x, y: y - 3, width: w, height: 10, rx: 5, fill: '#fff' }, $('#icing'));
    for (let i = 0; i < n; i++) el('circle', { cx: x + (i + .5) * w / n + rand(-2, 2), cy: y + 4, r: w / n / 2.4 + rand(0, 2), fill: '#fff' }, $('#icing'));
  });
  [[40, 200, 152, 202, 24], [62, 178, 112, 140, 14], [86, 154, 76, 98, 9]].forEach(([x1, x2, y1, y2, n]) => {
    for (let i = 0; i < n; i++)
      el('rect', { x: rand(x1, x2), y: rand(y1, y2), width: 6, height: 2.4, rx: 1.2, fill: COLORS[i % 5], transform: `rotate(${rand(0, 180)} 100 100)` }, $('#sprinkles'));
  });
  [92, 106, 120, 134, 148].forEach((x, i) => {
    el('rect', { x: x - 3, y: 44, width: 6, height: 21, rx: 2, fill: COLORS[i % 5] }, $('#candles'));
    el('ellipse', { cx: x, cy: 36, rx: 4, ry: 8, class: 'flame' }, $('#candles'));
  });
}

/* ---------- Confetti (canvas) ---------- */
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], raf = 0, rainUntil = 0;
function sizeCanvas(c, ctx) { const r = dpr(); c.width = innerWidth * r; c.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
function add(x, y, vx, vy, kind) {
  parts.push({ x, y, vx, vy, kind, w: kind === 'streamer' ? 5 : rand(6, 12), h: kind === 'streamer' ? rand(18, 34) : rand(4, 8),
    r: rand(0, 6), vr: rand(-.3, .3), t: rand(0, 6), c: kind === 'spark' ? (Math.random() < .5 ? '#f4d58d' : '#ff8fc7') : COLORS[(Math.random() * 5) | 0] });
}
function popper(side) {
  const x = side < 0 ? 0 : innerWidth, y = innerHeight * .85;
  for (let i = 0; i < 80; i++) {
    const a = (side < 0 ? -rand(40, 85) : -rand(95, 140)) * Math.PI / 180, s = rand(11, 24);
    add(x, y, Math.cos(a) * s, Math.sin(a) * s, i % 9 === 0 ? 'streamer' : i % 5 === 0 ? 'spark' : 'paper');
  }
}
function burst(x, y) {
  for (let i = 0; i < 45; i++) { const a = rand(0, 6.28), s = rand(3, 10); add(x, y, Math.cos(a) * s, Math.sin(a) * s - 3, i % 2 ? 'spark' : 'paper'); }
  startLoop();
}
function loop(now) {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  if (now < rainUntil) for (let i = 0; i < 2; i++) add(rand(0, innerWidth), -20, rand(-1, 1), rand(2, 4), Math.random() < .15 ? 'streamer' : Math.random() < .2 ? 'spark' : 'paper');
  parts = parts.filter(p => p.y < innerHeight + 40);
  for (const p of parts) {
    p.vy += .3; p.vx *= .985; p.vy *= .985; p.x += p.vx + Math.sin(p.t) * .6; p.y += p.vy; p.r += p.vr; p.t += .08;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    if (p.kind === 'spark') { cx.globalAlpha = .6 + Math.sin(p.t * 2) * .4; cx.beginPath(); cx.arc(0, 0, 2.5, 0, 6.28); cx.fill(); }
    else { cx.scale(1, Math.cos(p.t)); cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
    cx.restore();
  }
  raf = (parts.length || now < rainUntil) ? requestAnimationFrame(loop) : 0;   // auto-stops
}
function startLoop() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }
function celebrate() {
  if (reduce) return;
  popper(-1); popper(1);
  setTimeout(() => { popper(-1); popper(1); }, 400);
  rainUntil = performance.now() + 5000;
  startLoop();
}
function stopConfetti() { parts = []; rainUntil = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }

/* ---------- Balloons ---------- */
function balloons() {
  if (reduce) return;
  const box = $('#balloons'); box.innerHTML = '';
  for (let i = 0; i < 8; i++) {
    const b = document.createElement('span');
    b.className = 'balloon';
    b.style.cssText = `left:${4 + i * 12 + rand(0, 6)}%;--c:${COLORS[i % 5]};animation-duration:${rand(14, 22)}s;animation-delay:${rand(0, 3)}s`;
    b.onanimationend = () => b.remove();
    box.appendChild(b);
  }
}

/* ---------- Starry background ---------- */
const bg = $('#bg'), bx = bg.getContext('2d');
let stars = [];
function bgInit() {
  sizeCanvas(bg, bx);
  const n = Math.min(110, innerWidth / 9 | 0);
  stars = Array.from({ length: n }, () => ({ x: rand(0, innerWidth), y: rand(0, innerHeight), r: rand(.3, 1.7), p: rand(0, 6), s: rand(.5, 1.5) }));
  for (let i = 0; i < 6; i++) stars.push({ x: rand(0, innerWidth), y: rand(0, innerHeight), r: rand(30, 80), p: 0, s: 0, vx: rand(-.15, .15), c: COLORS[i % 4], bokeh: true });
}
function bgDraw(t) {
  bx.clearRect(0, 0, innerWidth, innerHeight);
  for (const s of stars) {
    if (s.bokeh) {
      s.x += s.vx; if (s.x < -90) s.x = innerWidth + 90; if (s.x > innerWidth + 90) s.x = -90;
      bx.globalAlpha = .07; bx.fillStyle = s.c;
    } else { bx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t / 1000 * s.s + s.p)); bx.fillStyle = '#fff'; }
    bx.beginPath(); bx.arc(s.x, s.y, s.r, 0, 6.28); bx.fill();
  }
  if (!reduce) requestAnimationFrame(bgDraw);
}

/* ---------- Music (generated, no file needed; starts only on click) ---------- */
const melody = [[392,.75],[392,.25],[440,1],[392,1],[523,1],[494,2],[392,.75],[392,.25],[440,1],[392,1],[587,1],[523,2],
  [392,.75],[392,.25],[784,1],[659,1],[523,1],[494,1],[440,1],[698,.75],[698,.25],[659,1],[523,1],[587,1],[523,2]];
let ac = null, timer = 0, musicPlaying = false, musicStarting = false, oscillators = [];
const musicButton = $('#music');
function updateMusicButton() {
  musicButton.textContent = musicPlaying ? '⏸ Pause' : '🎵 Music';
  musicButton.setAttribute('aria-pressed', String(musicPlaying));
}
function playMelody() {
  if (!ac || !musicPlaying) return;
  let t = ac.currentTime + .05;
  for (const [f, b] of melody) {
    const o = ac.createOscillator(), g = ac.createGain(), d = b * .5;
    o.type = 'triangle'; o.frequency.value = f; o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + .03); g.gain.exponentialRampToValueAtTime(.001, t + d * .95);
    oscillators.push(o);
    o.onended = () => { oscillators = oscillators.filter(node => node !== o); };
    o.start(t); o.stop(t + d); t += d;
  }
  timer = setTimeout(playMelody, (t - ac.currentTime + 1) * 1000);
}
function startMusic() {
  if (musicPlaying || musicStarting) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!ac && !AC) return;
  if (!ac) ac = new AC();
  musicStarting = true;
  ac.resume().then(() => {
    musicStarting = false;
    musicPlaying = true;
    updateMusicButton();
    playMelody();
  }).catch(error => {
    musicStarting = false;
    console.error('Unable to start birthday music:', error);
  });
}
musicButton.onclick = () => {
  if (musicStarting) return;
  if (!musicPlaying) {
    startMusic();
    return;
  }
  musicPlaying = false;
  clearTimeout(timer);
  timer = 0;
  for (const oscillator of oscillators) oscillator.stop();
  oscillators = [];
  updateMusicButton();
  ac.suspend().catch(error => console.error('Unable to pause birthday music:', error));
};

/* ---------- Navigation & buttons ---------- */
const welcome = $('#welcome'), party = $('#celebration');
let clock = 0, lit = true;
function swap(from, to, after) {
  from.classList.add('leave');
  setTimeout(() => { from.classList.remove('leave', 'active'); to.classList.add('active'); window.scrollTo(0, 0); after && after(); }, 600);
}
$('#openBtn').onclick = () => {
  startMusic();
  swap(welcome, party, () => {
    tick(); clearInterval(clock); clock = setInterval(tick, 1000);
    celebrate(); balloons();
  });
};
$('#backBtn').onclick = () => { clearInterval(clock); stopConfetti(); $('#balloons').innerHTML = ''; swap(party, welcome); };
$('#replayBtn').onclick = () => { celebrate(); balloons(); };
$('#secretBtn').onclick = e => {
  const s = $('#secret'); s.hidden = !s.hidden;
  e.currentTarget.textContent = s.hidden ? 'Reveal Message 💌' : 'Hide Message 💌';
};
$('#wishBtn').onclick = e => {
  lit = !lit;
  $('#cake').classList.toggle('out', !lit);
  $('#wishText').textContent = lit ? '' : 'Make a wish! May all your dreams come true. ✨';
  e.currentTarget.textContent = lit ? 'Make a Wish ✨' : 'Light the Candles 🕯️';
  if (!lit) {
    const r = $('#cake').getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * .3);
    const c = $('#card'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop');
  }
};

/* ---------- Init ---------- */
(function init() {
  const t = $('#title');
  t.setAttribute('aria-label', t.textContent);
  t.innerHTML = t.textContent.split(' ').map((w, i) => `<span style="--i:${i}" aria-hidden="true">${w}</span>`).join(' ');
  buildCake(); fillCard(); bgInit(); sizeCanvas(cv, cx); requestAnimationFrame(bgDraw);
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { bgInit(); sizeCanvas(cv, cx); if (reduce) bgDraw(0); }, 150); });
})();

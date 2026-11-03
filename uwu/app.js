(() => {
  'use strict';

  const DB = window.UWU_DB, TYPES = window.UWU_TYPES, PEOPLE = window.UWU_PEOPLE;
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const box = document.getElementById('modal-box');

  /* ================= утилиты ================= */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = seed => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const plural = (n, f) => { const m10 = n % 10, m100 = n % 100; return f[m10 === 1 && m100 !== 11 ? 0 : m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? 1 : 2]; };
  const fmt = n => n.toLocaleString('ru-RU');
  const avg = a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  const byId = id => DB[id];
  let uid = 0;

  const STATUS = {
    watching: { ru: 'Смотрю', jp: 'しちゅう' },
    done: { ru: 'Просмотрено', jp: 'かんりょう' },
    plan: { ru: 'В планах', jp: 'よてい' },
    dropped: { ru: 'Брошено', jp: 'ちゅうだん' }
  };
  const TIERS = { S: '#ff4d6d', A: '#ff9f43', B: '#ffd23f', C: '#3dff8f', D: '#4dabff' };
  const PILLS = ['#ffd23f', '#ff5fd2', '#3dff8f', '#2dfcff', '#ff9f43'];

  /* ================= состояние ================= */
  const KEY = 'uwu-v1';
  const fresh = () => ({
    ratings: {}, status: {}, rewarded: {},
    tiers: { S: [], A: [], B: [], C: [], D: [] },
    coins: 300,
    owned: ['frame-neon', 'banner-eye', 'fx-glitch', 'fx-plain'],
    eq: { frame: 'frame-neon', banner: 'banner-eye', fx: 'fx-glitch' },
    profile: { nick: 'UWU-kun', bio: '', avatar: '' },
    showcase: [],
    friends: ['Kurome', 'Senpai_404', 'Tomoe', 'Rin.exe'],
    stats: { games: 0, wins: 0, earned: 0 }
  });
  let S;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const base = fresh();
    S = Object.assign(base, raw);
    S.tiers = Object.assign(base.tiers, raw.tiers || {});
    S.eq = Object.assign(fresh().eq, raw.eq || {});
    S.profile = Object.assign(fresh().profile, raw.profile || {});
    S.stats = Object.assign(fresh().stats, raw.stats || {});
  } catch { S = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* приватный режим */ } renderTop(); };

  const rated = () => Object.keys(S.ratings).map(Number).filter(id => DB[id]);
  const myHue = () => hash(S.profile.nick) % 360;

  /* ================= друзья-боты ================= */
  const person = name => PEOPLE.find(p => p.name === name);
  function frRating(name, t) {
    const p = person(name); if (!p) return null;
    const r = rng(hash(name + '#' + t.id));
    if (r() > 0.72) return null;
    return clamp(Math.round(t.imdb + p.bias + (r() - 0.5) * 2 * p.spread), 1, 10);
  }
  const frRated = name => DB.filter(t => frRating(name, t) != null);
  function match(name) {
    const common = rated().map(byId).filter(t => frRating(name, t) != null);
    if (!common.length) return null;
    const d = avg(common.map(t => Math.abs(frRating(name, t) - S.ratings[t.id])));
    return { pct: clamp(Math.round(100 - d * 14), 0, 100), n: common.length };
  }
  const friendsAvg = t => {
    const v = S.friends.map(n => frRating(n, t)).filter(x => x != null);
    return v.length ? avg(v) : null;
  };

  /* ================= графика ================= */
  const KANJI = { anime: 'アニメ', series: 'ドラマ', film: 'えいが', game: 'ゲーム' };
  function poster(t, badges) {
    const r = rng(hash(t.orig + t.year));
    const h = Math.floor(r() * 360), h2 = Math.floor((h + 30 + r() * 80) % 360);
    const bg = `linear-gradient(${150 + Math.floor(r() * 60)}deg, hsl(${h} 75% ${38 + Math.floor(r() * 14)}%), hsl(${h2} 70% 11%) 78%)`;
    const sx = 25 + r() * 55, sy = 18 + r() * 35, ss = 55 + r() * 55;
    const shape = `left:${sx}%;top:${sy}%;width:${ss}%;aspect-ratio:1;transform:translate(-50%,-50%);background:radial-gradient(circle at 35% 35%, hsl(${(h + 180) % 360} 90% 72% / .85), hsl(${h2} 80% 40% / 0) 70%)`;
    const lines = r() > 0.5 ? '<div class="lines"></div>' : '';
    let b = '';
    if (badges) {
      b = `<span class="badge imdb">${t.imdb.toFixed(1)}</span>`;
      if (S.ratings[t.id]) b += `<span class="badge mine">${S.ratings[t.id]}</span>`;
    }
    return `<div class="poster"><div class="bg" style="background:${bg}"></div><div class="shape" style="${shape}"></div>${lines}<span class="py">${t.year}</span><span class="kanji">${KANJI[t.type]}</span><span class="pt">${esc(t.title)}</span>${b}</div>`;
  }
  function ava(name, img, hue, cls = '') {
    const style = img ? `background-image:url('${img}')` : `background:linear-gradient(135deg, hsl(${hue} 85% 58%), hsl(${(hue + 60) % 360} 75% 28%))`;
    return `<div class="ava ${cls}" style="${style}">${img ? '' : esc([...String(name)][0] || '?')}</div>`;
  }
  const myAva = cls => ava(S.profile.nick, S.profile.avatar, myHue(), cls);
  const personAva = (p, cls) => ava(p.name, '', p.hue, cls);

  function ringSvg(kind) {
    const id = 'r' + (++uid);
    const glow = c => `style="filter:drop-shadow(0 0 6px ${c}) drop-shadow(0 0 14px ${c})"`;
    switch (kind) {
      case 'frame-fire':
        return `<svg viewBox="0 0 100 100" ${glow('#ff6a2d')}><defs><linearGradient id="${id}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff2d3f"/><stop offset=".6" stop-color="#ff8a2d"/><stop offset="1" stop-color="#ffd23f"/></linearGradient></defs><circle cx="50" cy="50" r="47" fill="none" stroke="url(#${id})" stroke-width="3"/><g class="spin"><circle cx="50" cy="50" r="49.5" fill="none" stroke="#ffd23f" stroke-width="1.2" stroke-dasharray="3 9" stroke-linecap="round"/></g></svg>`;
      case 'frame-sakura': {
        let petals = '';
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, x = 50 + Math.cos(a) * 48, y = 50 + Math.sin(a) * 48; petals += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3.4" ry="2" fill="#ffc2e2" transform="rotate(${(a * 180 / Math.PI + 90).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }
        return `<svg viewBox="0 0 100 100" ${glow('#ff7ac8')}><circle cx="50" cy="50" r="47" fill="none" stroke="#ff7ac8" stroke-width="2.4"/><g class="spin">${petals}</g></svg>`;
      }
      case 'frame-glitch':
        return `<svg viewBox="0 0 100 100" ${glow('#c33bff')}><circle cx="49" cy="50" r="47" fill="none" stroke="#ff2df0" stroke-width="2.4" opacity=".9"/><circle cx="51.5" cy="50" r="47" fill="none" stroke="#2dfcff" stroke-width="2.4" opacity=".9"/><g class="spin"><path d="M50 1 A49 49 0 0 1 99 50" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="14 4 2 4"/></g></svg>`;
      case 'frame-gold': {
        let ticks = '';
        for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; ticks += `<line x1="${(50 + Math.cos(a) * 49).toFixed(1)}" y1="${(50 + Math.sin(a) * 49).toFixed(1)}" x2="${(50 + Math.cos(a) * (i % 3 ? 47.5 : 45.5)).toFixed(1)}" y2="${(50 + Math.sin(a) * (i % 3 ? 47.5 : 45.5)).toFixed(1)}" stroke="#ffe08a" stroke-width="1"/>`; }
        return `<svg viewBox="0 0 100 100" ${glow('#ffc23f')}><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#ffb52d"/><stop offset="1" stop-color="#b86b00"/></linearGradient></defs><circle cx="50" cy="50" r="44" fill="none" stroke="url(#${id})" stroke-width="3"/><g class="spin">${ticks}</g></svg>`;
      }
      default:
        return `<svg viewBox="0 0 100 100" ${glow('#c33bff')}><circle cx="50" cy="50" r="46" fill="none" stroke="#c33bff" stroke-width="2.6"/><g class="spin"><circle cx="50" cy="50" r="49.5" fill="none" stroke="#ff7af2" stroke-width="1" stroke-dasharray="22 6 3 6"/></g><circle cx="50" cy="50" r="42.5" fill="none" stroke="#fff" stroke-width=".4" opacity=".5"/></svg>`;
    }
  }

  function sparkles(r, n, color) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = r() * 1200, y = r() * 400, k = 4 + r() * 10;
      s += `<path d="M${x} ${y - k}L${x + k * .22} ${y - k * .22}L${x + k} ${y}L${x + k * .22} ${y + k * .22}L${x} ${y + k}L${x - k * .22} ${y + k * .22}L${x - k} ${y}L${x - k * .22} ${y - k * .22}Z" fill="${color}" opacity="${(.4 + r() * .6).toFixed(2)}"/>`;
    }
    return s;
  }
  function bannerSvg(kind) {
    const p = 'b' + (++uid);
    const r = rng(hash(kind));
    const open = '<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    const dots = `<pattern id="${p}d" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="#fff" opacity=".16"/></pattern>`;
    if (kind === 'banner-city') {
      let b = '', w = '';
      for (let x = 0; x < 1200;) { const bw = 40 + r() * 70, bh = 80 + r() * 190; b += `<rect x="${x}" y="${400 - bh}" width="${bw}" height="${bh}" fill="#0d0420"/>`; for (let i = 0; i < 6; i++) if (r() > .4) w += `<rect x="${x + 6 + r() * (bw - 14)}" y="${400 - bh + 10 + r() * (bh - 30)}" width="4" height="6" fill="${r() > .5 ? '#ff4fd8' : '#2dfcff'}" opacity=".85"/>`; x += bw + 4; }
      let grid = ''; for (let i = 0; i <= 24; i++) grid += `<line x1="${600 + (i - 12) * 18}" y1="300" x2="${600 + (i - 12) * 120}" y2="400" stroke="#ff4fd8" stroke-width="1" opacity=".5"/>`;
      return `${open}<defs><linearGradient id="${p}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14062e"/><stop offset=".7" stop-color="#5d1491"/><stop offset="1" stop-color="#ff4fa8"/></linearGradient><linearGradient id="${p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14f"/><stop offset="1" stop-color="#ff2d8a"/></linearGradient>${dots}</defs><rect width="1200" height="400" fill="url(#${p}g)"/><rect width="1200" height="400" fill="url(#${p}d)"/>${sparkles(r, 30, '#fff')}<circle cx="840" cy="210" r="130" fill="url(#${p}s)"/>${[0, 1, 2, 3, 4].map(i => `<rect x="700" y="${225 + i * 22}" width="280" height="${4 + i * 2}" fill="#5d1491"/>`).join('')}${grid}${b}${w}</svg>`;
    }
    if (kind === 'banner-sakura') {
      let pet = ''; for (let i = 0; i < 46; i++) { const x = r() * 1200, y = r() * 400; pet += `<ellipse cx="${x}" cy="${y}" rx="${5 + r() * 6}" ry="${3 + r() * 3}" fill="#ffd1ea" opacity="${(.5 + r() * .5).toFixed(2)}" transform="rotate(${r() * 180} ${x} ${y})"/>`; }
      return `${open}<defs><linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a0b3d"/><stop offset=".55" stop-color="#b8327a"/><stop offset="1" stop-color="#ffb3d1"/></linearGradient>${dots}</defs><rect width="1200" height="400" fill="url(#${p}g)"/><rect width="1200" height="400" fill="url(#${p}d)"/><circle cx="860" cy="170" r="120" fill="#fff0f6" opacity=".9"/><path d="M1220 40 C1000 90 900 60 760 150 S520 210 420 330" stroke="#2a0b1d" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M980 80 C960 140 1000 190 1060 230" stroke="#2a0b1d" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M760 150 C740 220 690 250 640 290" stroke="#2a0b1d" stroke-width="7" fill="none" stroke-linecap="round"/>${pet}<text x="1150" y="370" text-anchor="end" font-family="Noto Sans JP" font-weight="700" font-size="54" fill="#fff" opacity=".18">さくら</text></svg>`;
    }
    if (kind === 'banner-space') {
      let st = ''; for (let i = 0; i < 140; i++) st += `<circle cx="${r() * 1200}" cy="${r() * 400}" r="${(r() * 1.6 + .3).toFixed(1)}" fill="#fff" opacity="${(.3 + r() * .7).toFixed(2)}"/>`;
      return `${open}<defs><radialGradient id="${p}n" cx=".7" cy=".4" r=".6"><stop offset="0" stop-color="#7b2bff" stop-opacity=".9"/><stop offset=".5" stop-color="#ff2d8a" stop-opacity=".35"/><stop offset="1" stop-color="#05010d" stop-opacity="0"/></radialGradient><radialGradient id="${p}p" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#9ef0ff"/><stop offset=".5" stop-color="#4b5bff"/><stop offset="1" stop-color="#14062e"/></radialGradient></defs><rect width="1200" height="400" fill="#05010d"/><rect width="1200" height="400" fill="url(#${p}n)"/>${st}${sparkles(r, 10, '#fff')}<circle cx="860" cy="200" r="110" fill="url(#${p}p)"/><ellipse cx="860" cy="205" rx="200" ry="34" fill="none" stroke="#ffd2f4" stroke-width="6" opacity=".7" transform="rotate(-14 860 205)"/></svg>`;
    }
    /* banner-eye — аниме-взгляд */
    let lash = '';
    [[990, 188, 1050, 160], [975, 178, 1030, 140], [955, 165, 1000, 120], [930, 150, 960, 104], [900, 138, 915, 96], [600, 205, 560, 190]].forEach(([x1, y1, x2, y2]) => { lash += `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + 12} ${(y1 + y2) / 2 + 6} ${x2} ${y2}" stroke="#14031f" stroke-width="7" fill="none" stroke-linecap="round"/>`; });
    let irisLines = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; irisLines += `<line x1="${(770 + Math.cos(a) * 36).toFixed(1)}" y1="${(195 + Math.sin(a) * 36).toFixed(1)}" x2="${(770 + Math.cos(a) * 86).toFixed(1)}" y2="${(195 + Math.sin(a) * 86).toFixed(1)}" stroke="#ffd6f6" stroke-width="1.4" opacity=".35"/>`; }
    return `${open}<defs>
      <linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12052a"/><stop offset=".45" stop-color="#4a1796"/><stop offset=".8" stop-color="#c34bd8"/><stop offset="1" stop-color="#ffc0ec"/></linearGradient>
      <radialGradient id="${p}i" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="#fff6a8"/><stop offset=".22" stop-color="#ff8ad8"/><stop offset=".55" stop-color="#8a3bff"/><stop offset="1" stop-color="#1c0640"/></radialGradient>
      <linearGradient id="${p}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cdb6f2"/><stop offset=".5" stop-color="#f8f0ff"/></linearGradient>
      <clipPath id="${p}c"><path d="M560 212 Q760 66 990 188 Q780 302 560 212Z"/></clipPath>
      <filter id="${p}b"><feGaussianBlur stdDeviation="18"/></filter>
      ${dots}
    </defs>
    <rect width="1200" height="400" fill="url(#${p}g)"/>
    <rect width="1200" height="400" fill="url(#${p}d)"/>
    <path d="M380 -20 C 520 120 560 240 500 420" stroke="#ff9be8" stroke-width="54" fill="none" opacity=".22"/>
    <path d="M1140 -20 C 1080 140 1120 260 1210 420" stroke="#8fd8ff" stroke-width="70" fill="none" opacity=".25"/>
    <path d="M460 -20 C 600 60 700 40 820 -20" stroke="#2a0a4a" stroke-width="60" fill="none" opacity=".55"/>
    <path d="M700 -20 C 820 50 980 40 1120 -10" stroke="#3a1270" stroke-width="70" fill="none" opacity=".55"/>
    <path d="M560 118 Q770 34 1000 108" stroke="#2a0a4a" stroke-width="12" fill="none" opacity=".7" stroke-linecap="round"/>
    <path d="M560 212 Q760 66 990 188 Q780 302 560 212Z" fill="url(#${p}w)"/>
    <g clip-path="url(#${p}c)">
      <circle cx="770" cy="195" r="94" fill="url(#${p}i)"/>
      ${irisLines}
      <circle cx="770" cy="195" r="94" fill="none" stroke="#1c0640" stroke-width="7"/>
      <ellipse cx="770" cy="200" rx="24" ry="40" fill="#10021f"/>
      <ellipse cx="732" cy="150" rx="26" ry="18" fill="#fff"/>
      <circle cx="808" cy="232" r="9" fill="#fff" opacity=".95"/>
      <circle cx="790" cy="150" r="5" fill="#fff" opacity=".8"/>
      <path d="M540 100 Q770 40 1010 140 L1010 190 Q770 104 540 214Z" fill="#3a0f6e" opacity=".45"/>
    </g>
    <path d="M552 216 Q760 58 1000 188" stroke="#14031f" stroke-width="15" fill="none" stroke-linecap="round"/>
    ${lash}
    <path d="M610 226 Q780 292 960 200" stroke="#14031f" stroke-width="4" fill="none" opacity=".75" stroke-linecap="round"/>
    <ellipse cx="910" cy="312" rx="100" ry="26" fill="#ff5fa8" opacity=".35" filter="url(#${p}b)"/>
    ${sparkles(r, 16, '#fff')}
    <text x="1170" y="380" text-anchor="end" font-family="Noto Sans JP" font-weight="700" font-size="58" fill="#fff" opacity=".12">ユーユー</text>
    </svg>`;
  }

  /* ================= магазин: товары ================= */
  const SHOP = [
    { id: 'frame-neon', cat: 'frame', name: 'Неон', price: 0, d: 'Фиолетовое неоновое кольцо' },
    { id: 'frame-fire', cat: 'frame', name: 'Огонь', price: 300, d: 'Горит, пока ты на серии' },
    { id: 'frame-sakura', cat: 'frame', name: 'Сакура', price: 450, d: 'Лепестки кружат вокруг аватара' },
    { id: 'frame-glitch', cat: 'frame', name: 'Глитч', price: 700, d: 'Сбой матрицы, двойной контур' },
    { id: 'frame-gold', cat: 'frame', name: 'Золото', price: 1200, d: 'Для тех, кто выигрывает ставки' },
    { id: 'banner-eye', cat: 'banner', name: 'Взгляд', price: 0, d: 'Аниме-глаз на неоне' },
    { id: 'banner-city', cat: 'banner', name: 'Неон-сити', price: 400, d: 'Ретровейв-закат над городом' },
    { id: 'banner-sakura', cat: 'banner', name: 'Сакура', price: 400, d: 'Луна, ветка и лепестки' },
    { id: 'banner-space', cat: 'banner', name: 'Космос', price: 600, d: 'Туманность и планета с кольцом' },
    { id: 'fx-plain', cat: 'fx', name: 'Без эффекта', price: 0, d: 'Чистый жирный ник' },
    { id: 'fx-glitch', cat: 'fx', name: 'Глитч', price: 0, d: 'Ник дёргается и двоится' },
    { id: 'fx-fire', cat: 'fx', name: 'Пламя', price: 350, d: 'Градиент от красного к жёлтому' },
    { id: 'fx-rainbow', cat: 'fx', name: 'Радуга', price: 500, d: 'Переливается по кругу' }
  ];
  const CATS = { frame: ['Рамки аватара', 'フレーム'], banner: ['Баннеры профиля', 'バナー'], fx: ['Эффекты ника', 'エフェクト'] };

  /* ================= шапка ================= */
  function renderTop() {
    document.getElementById('coins').textContent = fmt(S.coins);
    document.getElementById('me-btn').innerHTML = myAva('');
    const cnt = k => DB.filter(t => t.type === k).length;
    document.getElementById('menu-all').innerHTML =
      `<a href="#/all"><span><b>Всё</b><small>ぜんぶ</small></span><span class="n">${DB.length}</span></a>` +
      Object.entries(TYPES).map(([k, v]) => `<a href="#/all/${k}"><span><b>${v.ru}</b><small>${v.jp}</small></span><span class="n">${cnt(k)}</span></a>`).join('');
    const sc = k => Object.values(S.status).filter(s => s === k).length;
    document.getElementById('menu-my').innerHTML =
      Object.entries(STATUS).map(([k, v]) => `<a href="#/my/${k}"><span><b>${v.ru}</b><small>${v.jp}</small></span><span class="n">${sc(k)}</span></a>`).join('') +
      `<a href="#/my/rated"><span><b>Оценено</b><small>ひょうか</small></span><span class="n">${rated().length}</span></a>`;
  }

  /* ================= каталог ================= */
  const UI = { q: '', sort: 'imdb', betMode: 'friends', sel: null, onlyRated: false, poolQ: '', editing: false };

  function viewCatalog(type, status) {
    let base, title, kicker, desc;
    if (status) {
      base = status === 'rated' ? rated().map(byId) : DB.filter(t => S.status[t.id] === status);
      title = status === 'rated' ? 'Оценено' : STATUS[status].ru;
      kicker = 'UWU · МОЁ · ' + (status === 'rated' ? 'ひょうか' : STATUS[status].jp);
      desc = base.length
        ? `${base.length} ${plural(base.length, ['тайтл', 'тайтла', 'тайтлов'])} в этой полке. Нажми на постер, чтобы поменять оценку или статус.`
        : 'Пока пусто. Открой любой тайтл из каталога и поставь оценку или статус — он появится здесь.';
    } else {
      base = type === 'all' ? DB : DB.filter(t => t.type === type);
      title = type === 'all' ? 'Всё' : TYPES[type].ru;
      kicker = 'UWU · IMDB × МОИ ОЦЕНКИ';
      const c = k => DB.filter(t => t.type === k).length;
      desc = type === 'all'
        ? `${DB.length} ${plural(DB.length, ['тайтл', 'тайтла', 'тайтлов'])} в одном списке: ${c('anime')} аниме, ${c('series')} сериалов, ${c('film')} фильмов и ${c('game')} игр — всё с оценками IMDb. Ставь свои, собирай тир-листы и сравнивай с друзьями.`
        : `${base.length} ${plural(base.length, ['тайтл', 'тайтла', 'тайтлов'])} — ${TYPES[type].ru.toLowerCase()} с оценками IMDb. Ставь свои и смотри, кто из друзей с тобой согласен.`;
    }
    const tens = Object.values(S.ratings).filter(v => v === 10).length;
    const wall = (base.length >= 10 ? base : DB).slice().sort((a, b) => b.imdb - a.imdb).slice(0, 15).map(t => poster(t)).join('');
    const seg = status
      ? [['rated', 'Оценено'], ...Object.entries(STATUS).map(([k, v]) => [k, v.ru])].map(([k, v]) => `<button class="${k === status ? 'on' : ''}" data-go="#/my/${k}">${v}</button>`).join('')
      : [['all', 'Всё'], ...Object.entries(TYPES).map(([k, v]) => [k, v.ru])].map(([k, v]) => `<button class="${k === type ? 'on' : ''}" data-go="#/all${k === 'all' ? '' : '/' + k}">${v}</button>`).join('');

    app.innerHTML = `
      <section class="hero"><div class="hero-wall">${wall}</div>
        <div class="wrap">
          <div class="kicker">${kicker}</div>
          <h1 class="h-giant">${esc(title)}</h1>
          <p class="sub">${desc}</p>
          <div class="chips">
            <span class="chip"><b>${rated().length}</b> оценено мной</span>
            <a class="chip" href="#/friends"><b>${S.friends.length}</b> ${plural(S.friends.length, ['друг', 'друга', 'друзей'])}</a>
            <span class="chip"><b>${tens}</b> <span class="hot">ТОП</span> моя десятка</span>
          </div>
        </div>
      </section>
      <div class="wrap">
        <div class="toolbar">
          <label class="search"><span aria-hidden="true">⌕</span><input id="q" type="search" placeholder="Атака титанов, Во все тяжкие, Interstellar…" value="${esc(UI.q)}" aria-label="Поиск"></label>
          <div class="seg">${seg}</div>
          <select class="select" id="sort" aria-label="Сортировка">
            ${[['imdb', 'По рейтингу IMDb'], ['mine', 'По моей оценке'], ['year', 'Сначала новые'], ['old', 'Сначала старые'], ['abc', 'По алфавиту']].map(([k, v]) => `<option value="${k}" ${UI.sort === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
        <p class="meta-line" id="meta"></p>
        <div class="grid" id="grid"></div>
      </div>`;

    const draw = () => {
      const q = UI.q.trim().toLowerCase();
      let list = base.filter(t => !q || t.title.toLowerCase().includes(q) || t.orig.toLowerCase().includes(q) || t.genre.includes(q));
      const sorters = {
        imdb: (a, b) => b.imdb - a.imdb, year: (a, b) => b.year - a.year, old: (a, b) => a.year - b.year,
        abc: (a, b) => a.title.localeCompare(b.title, 'ru'), mine: (a, b) => (S.ratings[b.id] || 0) - (S.ratings[a.id] || 0) || b.imdb - a.imdb
      };
      list = list.slice().sort(sorters[UI.sort]);
      document.getElementById('meta').textContent = `${list.length} ${plural(list.length, ['тайтл', 'тайтла', 'тайтлов'])} · оценки IMDb на ноябрь 2026 г.`;
      document.getElementById('grid').innerHTML = list.length
        ? list.map(card).join('')
        : `<div class="empty" style="grid-column:1/-1"><b>Ничего не нашлось</b>${status ? 'Загляни в <a class="link" href="#/all">каталог</a> и добавь что-нибудь.' : 'Попробуй другое название.'}</div>`;
    };
    draw();
    document.getElementById('q').addEventListener('input', e => { UI.q = e.target.value; draw(); });
    document.getElementById('sort').addEventListener('change', e => { UI.sort = e.target.value; draw(); });
  }
  const card = t => `<div class="card" data-open="${t.id}" role="button" tabindex="0" aria-label="${esc(t.title)}">${poster(t, true)}<h3>${esc(t.title)}</h3><div class="m">${t.year} · ${TYPES[t.type].one} · ${t.genre}${S.status[t.id] ? ' · <span style="color:var(--acc)">' + STATUS[S.status[t.id]].ru.toLowerCase() + '</span>' : ''}</div></div>`;

  /* ================= карточка тайтла ================= */
  function openTitle(id) {
    const t = byId(id); if (!t) return;
    const mine = S.ratings[id];
    const fa = friendsAvg(t);
    const inTier = Object.keys(TIERS).find(k => S.tiers[k].includes(id));
    box.innerHTML = `<button class="x" data-close aria-label="Закрыть">×</button>
      <div class="title-modal">${poster(t, true)}
        <div>
          <div class="jp">${TYPES[t.type].jp}<em>${t.year} · ${t.genre}</em></div>
          <h2>${esc(t.title)}</h2>
          <p class="orig">${esc(t.orig)}</p>
          <div class="cmp">
            <span class="chip">IMDb <b style="color:var(--star)">${t.imdb.toFixed(1)}</b></span>
            <span class="chip">Моя <b>${mine || '—'}</b></span>
            <span class="chip">Друзья <b>${fa != null ? fa.toFixed(1) : '—'}</b></span>
          </div>
          <div class="lbl">Твоя оценка${S.rewarded[id] ? '' : ' · +5 ◈ за первую'}</div>
          <div class="rate">${Array.from({ length: 10 }, (_, i) => `<button data-rate="${i + 1}" class="${mine === i + 1 ? 'on' : mine > i ? 'lit' : ''}">${i + 1}</button>`).join('')}</div>
          <div class="lbl">Статус</div>
          <div class="stat-btns">${Object.entries(STATUS).map(([k, v]) => `<button data-status="${k}" class="${S.status[id] === k ? 'on' : ''}">${v.ru}</button>`).join('')}</div>
          <div class="lbl">В тир-лист</div>
          <div class="stat-btns">${Object.keys(TIERS).map(k => `<button data-tier="${k}" class="${inTier === k ? 'on' : ''}" style="${inTier === k ? `background:${TIERS[k]};border-color:${TIERS[k]}` : `color:${TIERS[k]}`}">${k}</button>`).join('')}${inTier ? '<button data-tier="pool">Убрать</button>' : ''}</div>
        </div>
      </div>`;
    box.dataset.kind = 'title'; box.dataset.id = id;
    showModal();
  }
  function titleModalClick(e) {
    const id = +box.dataset.id;
    const r = e.target.closest('[data-rate]'), s = e.target.closest('[data-status]'), tr = e.target.closest('[data-tier]');
    if (r) {
      const v = +r.dataset.rate;
      if (S.ratings[id] === v) delete S.ratings[id];
      else {
        S.ratings[id] = v;
        if (!S.status[id] || S.status[id] === 'plan') S.status[id] = 'done';
        if (!S.rewarded[id]) { S.rewarded[id] = 1; S.coins += 5; toast('+5 ◈ за оценку'); }
      }
    } else if (s) {
      const k = s.dataset.status;
      if (S.status[id] === k) delete S.status[id]; else S.status[id] = k;
    } else if (tr) {
      moveTier(id, tr.dataset.tier);
    } else return;
    save(); openTitle(id); refresh();
  }

  /* ================= тир-листы ================= */
  function moveTier(id, tier) {
    Object.keys(S.tiers).forEach(k => { S.tiers[k] = S.tiers[k].filter(x => x !== id); });
    if (tier !== 'pool' && S.tiers[tier]) S.tiers[tier].push(id);
  }
  const chipp = id => `<div class="chipp${UI.sel === id ? ' sel' : ''}" draggable="true" data-chip="${id}" title="${esc(byId(id).title)}">${poster(byId(id))}</div>`;
  function viewTiers() {
    const placed = new Set(Object.values(S.tiers).flat());
    const q = UI.poolQ.trim().toLowerCase();
    const pool = DB.filter(t => !placed.has(t.id) && (!UI.onlyRated || S.ratings[t.id]) && (!q || t.title.toLowerCase().includes(q) || t.orig.toLowerCase().includes(q)));
    app.innerHTML = `<div class="wrap" style="padding-top:48px">
      <div class="kicker">UWU · ТИР-ЛИСТ · ティア</div>
      <h1 class="h-big">Тир-листы</h1>
      <p class="sub">Перетаскивай постеры по рядам. На телефоне — нажми на постер, потом на ряд. Двойной клик открывает тайтл. Тир-лист можно закрепить на витрине профиля.</p>
      <div class="tier-tools">
        <button class="btn sm" data-act="tier-auto">Разложить по моим оценкам</button>
        <button class="btn sm ghost" data-act="tier-reset">Очистить</button>
        <a class="btn sm ghost" href="#/profile">На витрину →</a>
      </div>
      <div class="tiers">${Object.entries(TIERS).map(([k, c]) => `<div class="tier${UI.sel != null ? ' pick' : ''}"><div class="tier-l" style="background:${c}" data-drop="${k}">${k}</div><div class="tier-row" data-drop="${k}">${S.tiers[k].map(chipp).join('')}</div></div>`).join('')}</div>
      <div class="panel pool">
        <div class="tier-tools">
          <label class="search" style="flex:1 1 220px;height:38px"><span aria-hidden="true">⌕</span><input id="pq" type="search" placeholder="Найти тайтл" value="${esc(UI.poolQ)}"></label>
          <div class="seg"><button class="${UI.onlyRated ? '' : 'on'}" data-act="pool-all">Все</button><button class="${UI.onlyRated ? 'on' : ''}" data-act="pool-rated">Оценённые</button></div>
          <span class="meta-line" style="margin:0">${pool.length} не разложено</span>
        </div>
        <div class="tier-row" data-drop="pool">${pool.map(t => chipp(t.id)).join('') || '<span class="sub" style="margin:8px">Пусто — всё разложено.</span>'}</div>
      </div></div>`;
    const pq = document.getElementById('pq');
    pq.addEventListener('input', e => { UI.poolQ = e.target.value; viewTiers(); const n = document.getElementById('pq'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });

    app.querySelectorAll('[data-chip]').forEach(el => {
      el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', el.dataset.chip); e.dataTransfer.effectAllowed = 'move'; });
      el.addEventListener('dblclick', () => openTitle(+el.dataset.chip));
    });
    app.querySelectorAll('[data-drop]').forEach(el => {
      el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
      el.addEventListener('dragleave', () => el.classList.remove('over'));
      el.addEventListener('drop', e => {
        e.preventDefault(); el.classList.remove('over');
        const id = +e.dataTransfer.getData('text/plain');
        if (Number.isNaN(id)) return;
        UI.sel = null; moveTier(id, el.dataset.drop); save(); viewTiers();
      });
    });
  }
  function tiersClick(e) {
    const c = e.target.closest('[data-chip]');
    if (c) { const id = +c.dataset.chip; UI.sel = UI.sel === id ? null : id; viewTiers(); return true; }
    const d = e.target.closest('[data-drop]');
    if (d && UI.sel != null) { moveTier(UI.sel, d.dataset.drop); UI.sel = null; save(); viewTiers(); return true; }
    return false;
  }
  function autoTiers() {
    const m = { 10: 'S', 9: 'A', 8: 'B', 7: 'C' };
    const ids = rated();
    if (!ids.length) { toast('Сначала оцени пару тайтлов'); return; }
    S.tiers = { S: [], A: [], B: [], C: [], D: [] };
    ids.sort((a, b) => S.ratings[b] - S.ratings[a]).forEach(id => S.tiers[m[S.ratings[id]] || 'D'].push(id));
    save(); viewTiers(); toast('Разложено по твоим оценкам');
  }

  /* ================= Я и IMDb ================= */
  function viewImdb() {
    const ids = rated();
    const head = `<div class="wrap" style="padding-top:48px">
      <div class="kicker">UWU · Я × IMDB</div>
      <h1 class="h-big">Я и IMDb</h1>
      <p class="sub">Насколько твой вкус совпадает с миром. Чем больше оценок — тем точнее картина.</p>`;
    if (!ids.length) {
      app.innerHTML = head + `<div class="empty"><b>Ещё нечего сравнивать</b>Поставь хотя бы одну оценку в <a class="link" href="#/all" style="color:var(--acc)">каталоге</a>.</div></div>`;
      return;
    }
    const rows = ids.map(id => ({ t: byId(id), m: S.ratings[id], d: S.ratings[id] - byId(id).imdb }));
    const myAvg = avg(rows.map(r => r.m)), imAvg = avg(rows.map(r => r.t.imdb));
    const ad = avg(rows.map(r => Math.abs(r.d)));
    const sim = clamp(Math.round(100 - ad * 14), 0, 100);
    const bias = myAvg - imAvg;
    const over = rows.slice().sort((a, b) => b.d - a.d)[0], under = rows.slice().sort((a, b) => a.d - b.d)[0];
    rows.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const bar = (lbl, v, c) => `<div class="bar"><span>${lbl}</span><i style="--w:${v * 10}%;--c:${c}"></i><span>${Number.isInteger(v) ? v : v.toFixed(1)}</span></div>`;
    app.innerHTML = head + `
      <div class="stats">
        <div class="panel stat"><div class="lbl">Совпадение</div><b style="color:var(--acc)">${sim}%</b><small>со средним IMDb</small></div>
        <div class="panel stat"><div class="lbl">Мой средний</div><b>${myAvg.toFixed(2)}</b><small>IMDb по тем же — ${imAvg.toFixed(2)}</small></div>
        <div class="panel stat"><div class="lbl">Характер</div><b>${Math.abs(bias) < 0.3 ? 'Ровно' : bias > 0 ? 'Щедрый' : 'Строгий'}</b><small>${Math.abs(bias) < 0.3 ? 'почти как IMDb' : (bias > 0 ? 'выше' : 'ниже') + ' IMDb на ' + Math.abs(bias).toFixed(1)}</small></div>
        <div class="panel stat"><div class="lbl">Оценено</div><b>${ids.length}</b><small>из ${DB.length} в каталоге</small></div>
      </div>
      <div class="sec" style="margin-top:28px">
        <div class="chips">
          ${over.d > 0 ? `<span class="chip" data-open="${over.t.id}" style="cursor:pointer">Больше всех любишь: <b>${esc(over.t.title)}</b> <span style="color:var(--good)">+${over.d.toFixed(1)}</span></span>` : ''}
          ${under.d < 0 ? `<span class="chip" data-open="${under.t.id}" style="cursor:pointer">Не зашло: <b>${esc(under.t.title)}</b> <span style="color:var(--acc)">${under.d.toFixed(1)}</span></span>` : ''}
        </div>
      </div>
      <div class="sec" style="margin-top:28px">
        <div class="jp">ひかく<em>самые большие расхождения сверху</em></div>
        <h2 class="h-sec" style="margin-bottom:16px">Сравнение</h2>
        <div class="vs">${rows.map(r => `<div class="panel vs-row" data-open="${r.t.id}" role="button" tabindex="0">${poster(r.t)}<div><h4>${esc(r.t.title)}</h4><div class="m">${r.t.year} · ${TYPES[r.t.type].one}</div></div><div class="bars">${bar('Я', r.m, 'var(--acc)')}${bar('IMDb', r.t.imdb, 'var(--star)')}</div><div class="diff ${r.d > 0.05 ? 'up' : r.d < -0.05 ? 'down' : ''}">${r.d > 0 ? '+' : ''}${r.d.toFixed(1)}</div></div>`).join('')}</div>
      </div></div>`;
  }

  /* ================= друзья ================= */
  function lastSeen(p) { return p.seen < 24 ? `был(а) ${p.seen} ${plural(p.seen, ['час', 'часа', 'часов'])} назад` : `был(а) ${Math.round(p.seen / 24)} дн. назад`; }
  function fcard(p, isFriend, hl) {
    const m = match(p.name);
    return `<div class="panel fcard${hl ? ' hl' : ''}" data-go="#/u/${encodeURIComponent(p.name)}" style="cursor:pointer">
      ${personAva(p, 'ava-sm')}
      <div><h4>${esc(p.name)}</h4>
        <div class="m">${frRated(p.name).length} оценок · ${m ? `<span class="match">совпадение ${m.pct}%</span>` : 'нет общих оценок'}</div>
        <div class="m">${lastSeen(p)}</div>
        <div class="acts">${isFriend
          ? `<button class="btn sm" data-act="unfriend" data-name="${esc(p.name)}">Убрать из друзей</button><button class="btn sm" data-act="guess" data-name="${esc(p.name)}">Угадать оценки</button>`
          : `<button class="btn sm acc" data-act="befriend" data-name="${esc(p.name)}">Добавить в друзья</button>`}</div>
      </div></div>`;
  }
  function viewFriends() {
    const fr = S.friends.map(person).filter(Boolean);
    const others = PEOPLE.filter(p => !S.friends.includes(p.name));
    let best = null, bp = -1;
    fr.forEach(p => { const m = match(p.name); if (m && m.pct > bp) { bp = m.pct; best = p.name; } });
    app.innerHTML = `<div class="wrap" style="padding-top:48px">
      <div class="kicker">UWU · ВСЕ В UWU</div>
      <h1 class="h-big">Друзья</h1>
      <p class="sub">Совпадение считается по тайтлам, которые оценили вы оба. Самый похожий по вкусу друг подсвечен.</p>
      <div class="sec" style="margin-top:28px">
        <div class="jp">ともだち<em>${fr.length}</em></div>
        <h2 class="h-sec" style="margin-bottom:16px">Мои друзья</h2>
        ${fr.length ? `<div class="fgrid">${fr.map(p => fcard(p, true, p.name === best)).join('')}</div>` : '<div class="empty"><b>Пока никого</b>Добавь кого-нибудь ниже.</div>'}
      </div>
      <div class="sec">
        <div class="jp">みんな<em>${others.length}</em></div>
        <h2 class="h-sec" style="margin-bottom:16px">Все в UWU</h2>
        ${others.length ? `<div class="fgrid">${others.map(p => fcard(p, false)).join('')}</div>` : '<div class="empty"><b>Все уже в друзьях</b>Вот это компания.</div>'}
      </div></div>`;
  }

  /* ================= ставки ================= */
  function leaderboard() {
    const all = PEOPLE.map(p => ({ name: p.name, coins: p.coins, hue: p.hue, you: false }))
      .concat({ name: S.profile.nick, coins: S.coins, hue: myHue(), you: true })
      .sort((a, b) => b.coins - a.coins);
    return `<div class="leader">${all.map((x, i) => `<div class="lead${x.you ? ' you' : ''}"><span class="pos">${i + 1}</span>${x.you ? myAva('ava-xs') : ava(x.name, '', x.hue, 'ava-xs')}<div><b>${esc(x.name)}${x.you ? ' (ты)' : ''}</b><small>${fmt(x.coins)} ◈</small></div><span class="pts" style="background:${PILLS[i % PILLS.length]}">${i < 3 ? ['ЛИДЕР', 'ТОП-2', 'ТОП-3'][i] : fmt(x.coins)}</span></div>`).join('')}</div>`;
  }
  function viewBets() {
    const f = UI.betMode === 'friends';
    app.innerHTML = `<div class="wrap" style="padding-top:48px">
      <div class="kicker">UWU · ИГРАЙ С ДРУЗЬЯМИ</div>
      <h1 class="h-big">Ставки</h1>
      <p class="sub">Ставь монеты ◈ на свои знания рейтингов. Выигрыш тратится в магазине на рамки, баннеры и эффекты ника.</p>
      <div class="bet-top">
        <div class="panel mode${f ? ' on' : ''}" data-act="mode-friends"><span class="ic">👥</span><div><h4>С друзьями</h4><p>Онлайн за одним столом, от 2 игроков — кто ближе, забирает банк</p></div></div>
        <div class="panel mode${f ? '' : ' on'}" data-act="mode-solo"><span class="ic">🎯</span><div><h4>Соло</h4><p>Против сайта, когда друзей нет рядом</p></div></div>
      </div>
      <div class="games">
        <div class="glow-panel game">
          <div class="scale"><div class="track"></div><span class="pin" style="left:62%">7.4</span><span class="dot" style="left:38%"></span><span class="dot y" style="left:58%"></span><span class="dot r" style="left:71%"></span></div>
          <h3>Кто лучше знает рейтинги?</h3>
          <p>Угадай рейтинг IMDb точнее ${f ? 'друзей — и забери их ставки' : 'и умножь ставку до ×3'}.</p>
          <div class="tiny">${f ? 'от 2 игроков · ставки на очки · 5 раундов' : 'соло · ±0.2 = ×3 · ±0.5 = ×2 · ±1 = возврат'}</div>
          <div class="acts"><button class="btn acc" data-act="play-rate">Открыть стол</button><button class="btn ghost" data-act="howto">Как играть →</button></div>
        </div>
        <div class="panel mini-game">
          <div class="slots"><i style="--w:60%"></i><i class="g" style="--w:40%"></i><i style="--w:70%"></i></div>
          <h3>Кто лучше знает тайтлы?</h3>
          <p>Два тайтла — выбери тот, у кого рейтинг IMDb выше. Верно — ставка ×2.</p>
          <div class="acts"><button class="btn acc sm" data-act="play-duel">Открыть стол</button><button class="btn ghost sm" data-act="howto">Как играть →</button></div>
        </div>
      </div>
      <div class="sec">
        <div class="jp">ランキング<em>по монетам</em></div>
        <h2 class="h-sec" style="margin-bottom:16px">Топ UWU</h2>
        ${leaderboard()}
        <p class="meta-line" style="margin-top:10px">Сыграно столов: ${S.stats.games} · побед: ${S.stats.wins} · выиграно всего: ${fmt(S.stats.earned)} ◈</p>
      </div></div>`;
  }

  let G = null;
  const STAKES = [10, 25, 50, 100];
  function ensureCoins() { if (S.coins < 10) { S.coins += 100; save(); toast('Держи 100 ◈ — на новый старт'); } }
  function fitStake(s) { return S.coins >= s ? s : STAKES.filter(x => x <= S.coins).pop() || STAKES[0]; }

  function startRate(friend) {
    ensureCoins();
    const pool = friend ? frRated(friend) : DB;
    let bots = [];
    if (!friend && UI.betMode === 'friends') {
      bots = (S.friends.length ? S.friends : PEOPLE.map(p => p.name)).map(person).filter(Boolean);
      bots = shuffle(bots).slice(0, 3);
    }
    G = { kind: 'rate', friend, rounds: shuffle(pool).slice(0, 5), i: 0, stake: fitStake(25), guess: friend ? 7 : 7.5, res: null, total: 0, bots, done: false };
    renderGame(); showModal();
  }
  function startDuel() {
    ensureCoins();
    const s = shuffle(DB), pairs = [];
    for (let i = 0; i + 1 < s.length && pairs.length < 5; i += 2) if (s[i].imdb !== s[i + 1].imdb) pairs.push([s[i], s[i + 1]]);
    G = { kind: 'duel', rounds: pairs, i: 0, stake: fitStake(25), res: null, total: 0, done: false };
    renderGame(); showModal();
  }
  const stakesHtml = locked => `<div class="stakes">${STAKES.map(s => `<button data-stake="${s}" class="${G.stake === s ? 'on' : ''}" ${locked || s > S.coins ? 'disabled' : ''}>${s} ◈</button>`).join('')}</div>`;
  function settle(net) {
    S.coins = Math.max(0, S.coins + net);
    G.total += net;
    save();
  }
  function finishTable() {
    G.done = true;
    S.stats.games++;
    if (G.total > 0) { S.stats.wins++; S.stats.earned += G.total; }
    save();
  }

  function renderGame() {
    box.dataset.kind = 'game';
    const n = G.rounds.length;
    if (G.done) {
      const win = G.total > 0;
      box.innerHTML = `<button class="x" data-close aria-label="Закрыть">×</button>
        <div class="round">СТОЛ ЗАКРЫТ · ${n} ${plural(n, ['РАУНД', 'РАУНДА', 'РАУНДОВ'])}</div>
        <h2 class="h-big" style="font-size:clamp(36px,6vw,60px)">${win ? 'Победа' : G.total === 0 ? 'Ничья' : 'Не повезло'}</h2>
        <div class="result ${win || G.total === 0 ? 'win' : 'lose'}"><b>${G.total > 0 ? '+' : ''}${G.total} ◈</b><div class="sub" style="margin:4px 0 0">Сейчас на счету: ${fmt(S.coins)} ◈</div></div>
        <div class="acts" style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn acc" data-g="again">Сыграть ещё</button><a class="btn" href="#/shop" data-close>В магазин</a><button class="btn ghost" data-close>Закрыть</button></div>`;
      return;
    }
    const head = `<button class="x" data-close aria-label="Закрыть">×</button><div class="round">РАУНД ${G.i + 1} ИЗ ${n} · ${G.kind === 'duel' ? 'КТО ЛУЧШЕ ЗНАЕТ ТАЙТЛЫ' : G.friend ? 'УГАДАЙ ОЦЕНКИ ' + esc(G.friend).toUpperCase() : G.bots.length ? 'СТОЛ С ДРУЗЬЯМИ' : 'СОЛО'} · ИТОГ ${G.total > 0 ? '+' : ''}${G.total} ◈</div>`;
    const next = `<div class="acts" style="display:flex;gap:10px;margin-top:16px"><button class="btn acc" data-g="next">${G.i + 1 < n ? 'Следующий раунд →' : 'Закрыть стол'}</button></div>`;

    if (G.kind === 'duel') {
      const [a, b] = G.rounds[G.i];
      const r = G.res;
      const side = t => {
        if (!r) return '';
        const hi = a.imdb > b.imdb ? a : b;
        return t === hi ? 'right' : (t.id === r.pick ? 'wrong' : '');
      };
      box.innerHTML = head + `<h2 class="h-sec" style="margin-top:12px">У кого рейтинг IMDb выше?</h2>
        <div class="lbl">Ставка</div>${stakesHtml(!!r)}
        <div class="duel">
          <button class="pick ${side(a)}" data-pick="${a.id}" ${r ? 'disabled' : ''}>${r ? poster(a, true) : poster(a)}<h4>${esc(a.title)}</h4></button>
          <span class="vsx">VS</span>
          <button class="pick ${side(b)}" data-pick="${b.id}" ${r ? 'disabled' : ''}>${r ? poster(b, true) : poster(b)}<h4>${esc(b.title)}</h4></button>
        </div>
        ${r ? `<div class="result ${r.net > 0 ? 'win' : 'lose'}"><b>${r.net > 0 ? 'Верно! +' + r.net : 'Мимо. ' + r.net} ◈</b><div class="sub" style="margin:4px 0 0">${esc(a.title)} — ${a.imdb.toFixed(1)}, ${esc(b.title)} — ${b.imdb.toFixed(1)}</div></div>${next}` : ''}`;
      return;
    }

    const t = G.rounds[G.i];
    const r = G.res;
    const step = G.friend ? 1 : 0.1;
    const shown = G.friend ? String(G.guess) : G.guess.toFixed(1);
    box.innerHTML = head + `<div class="table" style="margin-top:14px">${poster(t)}
      <div>
        <div class="jp">${TYPES[t.type].jp}<em>${t.year} · ${t.genre}</em></div>
        <h2>${esc(t.title)}</h2>
        <p class="sub" style="margin:0">${G.friend ? `Какую оценку поставил(а) ${esc(G.friend)}? Точно — ×3, ±1 — возврат.` : G.bots.length ? `Какой рейтинг на IMDb? За столом: ${G.bots.map(b => esc(b.name)).join(', ')}. Кто ближе — забирает банк.` : 'Какой рейтинг на IMDb? ±0.2 — ×3, ±0.5 — ×2, ±1 — возврат.'}</p>
        <div class="guess"><output id="gout">${shown}</output>
          <input class="rg" id="grange" type="range" min="1" max="10" step="${step}" value="${G.guess}" ${r ? 'disabled' : ''} aria-label="Твоя догадка">
          <div class="scale-n"><span>1</span><span>5.5</span><span>10</span></div>
        </div>
        <div class="lbl">Ставка</div>${stakesHtml(!!r)}
        ${r ? `<div class="result ${r.net > 0 ? 'win' : 'lose'}"><b>${r.net > 0 ? '+' + r.net : r.net === 0 ? '±0' : r.net} ◈</b>
            <div class="sub" style="margin:4px 0 0">${G.friend ? 'Оценка ' + esc(G.friend) : 'IMDb'}: <b style="font-size:16px;color:var(--star)">${G.friend ? r.actual : r.actual.toFixed(1)}</b> · ты: ${shown} · промах ${r.diff.toFixed(1)}</div>
            ${r.bots ? `<div class="bots">${r.bots.map(b => `<div class="${b.best ? 'best' : ''}">${b.you ? myAva('ava-xs') : personAva(person(b.name), 'ava-xs')}${esc(b.name)}${b.you ? ' (ты)' : ''}<span>${b.g.toFixed(1)}${b.best ? ' · банк' : ''}</span></div>`).join('')}</div>` : ''}
          </div>${next}`
        : `<div class="acts" style="display:flex;gap:10px;margin-top:18px"><button class="btn acc" data-g="bet">Поставить ${G.stake} ◈</button></div>`}
      </div></div>`;
    const range = document.getElementById('grange');
    range.addEventListener('input', () => { G.guess = +range.value; document.getElementById('gout').textContent = G.friend ? range.value : (+range.value).toFixed(1); });
  }
  function gameClick(e) {
    const st = e.target.closest('[data-stake]');
    if (st && !G.res) { G.stake = +st.dataset.stake; renderGame(); return; }
    const g = e.target.closest('[data-g]');
    const pk = e.target.closest('[data-pick]');
    if (pk && G.kind === 'duel' && !G.res) {
      const [a, b] = G.rounds[G.i];
      const pick = +pk.dataset.pick;
      const hi = a.imdb > b.imdb ? a : b;
      const net = pick === hi.id ? G.stake : -G.stake;
      G.res = { pick, net }; settle(net); renderGame(); return;
    }
    if (!g) return;
    const act = g.dataset.g;
    if (act === 'bet') {
      const t = G.rounds[G.i];
      const actual = G.friend ? frRating(G.friend, t) : t.imdb;
      const diff = Math.abs(G.guess - actual);
      let net, bots = null;
      if (G.bots.length) {
        bots = G.bots.map(p => ({ name: p.name, g: clamp(Math.round((t.imdb + p.bias * 0.5 + (Math.random() - 0.5) * 2 * p.spread * 0.7) * 10) / 10, 1, 10) }));
        bots.push({ name: S.profile.nick, g: G.guess, you: true });
        bots.forEach(b => { b.d = Math.abs(b.g - actual); });
        const min = Math.min(...bots.map(b => b.d));
        const winners = bots.filter(b => b.d === min);
        winners.forEach(b => { b.best = true; });
        const youWin = winners.some(b => b.you);
        net = youWin ? Math.floor(G.stake * bots.length / winners.length) - G.stake : -G.stake;
        bots.sort((a, b) => a.d - b.d);
      } else if (G.friend) {
        net = diff === 0 ? G.stake * 2 : diff <= 1 ? 0 : -G.stake;
      } else {
        const d = Math.round(diff * 10) / 10;
        net = d <= 0.2 ? G.stake * 2 : d <= 0.5 ? G.stake : d <= 1 ? 0 : -G.stake;
      }
      G.res = { actual, diff, net, bots };
      settle(net); renderGame();
    } else if (act === 'next') {
      G.res = null;
      if (G.i + 1 < G.rounds.length) { G.i++; G.stake = fitStake(G.stake); if (!G.friend) G.guess = 7.5; }
      else finishTable();
      renderGame(); refresh();
    } else if (act === 'again') {
      if (G.kind === 'duel') startDuel(); else startRate(G.friend);
    }
  }
  function howTo() {
    box.dataset.kind = 'info';
    box.innerHTML = `<button class="x" data-close aria-label="Закрыть">×</button>
      <div class="jp">ルール</div><h2 class="h-sec" style="margin-bottom:14px">Как играть</h2>
      <div class="pick-list" style="pointer-events:none">
        <button><b>Кто лучше знает рейтинги?</b><small>Двигай ползунок — какой рейтинг у тайтла на IMDb. С друзьями: каждый ставит одинаково, ближайший забирает весь банк. Соло: ±0.2 — ставка ×3, ±0.5 — ×2, ±1 — ставка возвращается.</small></button>
        <button><b>Кто лучше знает тайтлы?</b><small>Два постера — нажми на тот, у которого рейтинг IMDb выше. Угадал — ставка ×2.</small></button>
        <button><b>Угадать оценки друга</b><small>В профиле друга: угадай, какую оценку от 1 до 10 он поставил. Точно — ×3, ±1 — возврат.</small></button>
        <button><b>Где брать монеты</b><small>+5 ◈ за каждую новую оценку, плюс выигрыши. Если монеты кончились — стол даст 100 ◈ на старт.</small></button>
      </div>`;
    showModal();
  }

  /* ================= магазин ================= */
  function itemPreview(it) {
    if (it.cat === 'banner') return bannerSvg(it.id);
    if (it.cat === 'frame') return `<div class="ring ring-demo" style="width:86px;height:86px">${myAva('')}${ringSvg(it.id)}</div>`;
    return `<span class="nick ${it.id}" data-t="${esc(S.profile.nick)}" style="font-size:26px;margin:0">${esc(S.profile.nick)}</span>`;
  }
  function viewShop() {
    app.innerHTML = `<div class="wrap" style="padding-top:48px">
      <div class="kicker">UWU · МАГАЗИН · ショップ</div>
      <h1 class="h-big">Магазин</h1>
      <p class="sub">Тратишь монеты ◈ — прокачиваешь профиль. Сейчас у тебя <b style="color:var(--star)">${fmt(S.coins)} ◈</b>. Монеты дают за оценки и выигрыши в <a class="link" href="#/bets" style="color:var(--acc)">ставках</a>.</p>
      ${Object.entries(CATS).map(([cat, [ru, jp]]) => `<div class="sec" style="margin-top:36px">
        <div class="jp">${jp}</div><h2 class="h-sec" style="margin-bottom:16px">${ru}</h2>
        <div class="shop-grid">${SHOP.filter(i => i.cat === cat).map(it => {
          const own = S.owned.includes(it.id), on = S.eq[cat] === it.id;
          return `<div class="panel item"${on ? ' style="border-color:rgba(var(--acc-rgb),.7);box-shadow:0 0 24px rgba(var(--acc-rgb),.25)"' : ''}>
            <div class="pv">${itemPreview(it)}</div>
            <div><h4>${it.name}</h4><div class="m">${it.d}</div></div>
            <div class="row">${own ? '<span class="tag">твоё</span>' : `<span class="price">${fmt(it.price)}</span>`}
              ${on ? '<span class="tag acc">надето</span>' : own ? `<button class="btn sm" data-act="equip" data-item="${it.id}">Надеть</button>` : `<button class="btn sm acc" data-act="buy" data-item="${it.id}" ${S.coins < it.price ? 'disabled' : ''}>Купить</button>`}
            </div></div>`;
        }).join('')}</div></div>`).join('')}
    </div>`;
  }

  /* ================= профиль ================= */
  function slotHtml(s, idx, own) {
    const rm = own ? `<button class="rm" data-act="slot-rm" data-i="${idx}" aria-label="Убрать">×</button>` : '';
    if (s.k === 'tier') {
      const tiers = s.tiers || S.tiers;
      return `<div class="glow-panel slot"><div class="sh"><span class="tag">Тир-лист</span>${rm}</div>
        <div class="mini-tier">${Object.entries(TIERS).map(([k, c]) => `<div><b style="background:${c}">${k}</b><span>${(tiers[k] || []).slice(0, 9).map(id => poster(byId(id))).join('')}</span></div>`).join('')}</div></div>`;
    }
    if (s.k === 'fav') {
      const t = byId(s.id); if (!t) return '';
      return `<div class="glow-panel slot"><div class="sh"><span class="tag">Любимое</span>${rm}</div>
        <div class="fav" data-open="${t.id}" style="cursor:pointer">${poster(t, true)}<div><div class="jp" style="font-size:10px">${TYPES[t.type].jp}</div><h4 style="margin-top:8px">${esc(t.title)}</h4><div class="sub" style="font-size:13px;margin:0">${t.year} · ${t.genre}</div>${s.score ? `<div class="chip" style="margin-top:10px">оценка <b>${s.score}</b></div>` : ''}</div></div></div>`;
    }
    if (s.k === 'top') {
      const list = s.list || rated().map(id => [id, S.ratings[id]]).sort((a, b) => b[1] - a[1] || byId(b[0]).imdb - byId(a[0]).imdb);
      return `<div class="glow-panel slot"><div class="sh"><span class="tag">${own ? 'Моя' : 'Их'} десятка</span>${rm}</div>
        ${list.length ? `<div class="top10">${list.slice(0, 7).map(([id, v]) => `<div data-open="${id}" style="cursor:pointer">${esc(byId(id).title)}<b>${v}</b></div>`).join('')}</div>` : '<p class="sub">Пока нет оценок.</p>'}</div>`;
    }
    return '';
  }
  function viewProfile(name) {
    const own = !name;
    const p = own ? null : person(name);
    if (!own && !p) { app.innerHTML = '<div class="wrap" style="padding-top:60px"><div class="empty"><b>Профиль не найден</b><a class="link" href="#/friends">← к друзьям</a></div></div>'; return; }
    const isFriend = !own && S.friends.includes(name);
    const banner = own ? S.eq.banner : ['banner-eye', 'banner-city', 'banner-sakura', 'banner-space'][hash(name) % 4];
    const frame = own ? S.eq.frame : ['frame-neon', 'frame-fire', 'frame-sakura', 'frame-glitch', 'frame-gold'][hash(name + 'f') % 5];
    const fx = own ? S.eq.fx : ['fx-glitch', 'fx-rainbow', 'fx-fire', 'fx-glitch'][hash(name + 'x') % 4];
    const nick = own ? S.profile.nick : name;
    const ids = own ? rated() : frRated(name).map(t => t.id);
    const scoreOf = id => own ? S.ratings[id] : frRating(name, byId(id));
    const avgScore = ids.length ? avg(ids.map(scoreOf)) : 0;
    const m = own ? null : match(name);

    let slots;
    if (own) slots = S.showcase.filter(s => s.k !== 'fav' || byId(s.id));
    else {
      const list = ids.map(id => [id, scoreOf(id)]).sort((a, b) => b[1] - a[1] || byId(b[0]).imdb - byId(a[0]).imdb);
      const tiers = { S: [], A: [], B: [], C: [], D: [] };
      list.forEach(([id, v]) => tiers[{ 10: 'S', 9: 'A', 8: 'B', 7: 'C' }[v] || 'D'].push(id));
      slots = list.length ? [{ k: 'tier', tiers }, { k: 'fav', id: list[0][0], score: list[0][1] }, { k: 'top', list }] : [];
    }

    app.innerHTML = `<div class="wrap prof-wrap">
      <a class="back" href="${own ? '#/all' : '#/friends'}">← ${own ? 'Каталог' : 'Друзья'}</a>
      <section class="prof">
        <div class="banner">${bannerSvg(banner)}</div>
        <div class="prof-in">
          <div class="ring">${own ? myAva('') : personAva(p, '')}${ringSvg(frame)}${own ? '<label class="edit-ava" title="Сменить аватар">✎<input type="file" id="ava-in" accept="image/*" hidden></label>' : ''}</div>
          <div class="prof-info">
            <div class="tags"><span class="jp">プロフィール</span>${own ? '<span class="tag acc">это ты</span>' : `<span class="tag ${isFriend ? 'acc' : ''}">${isFriend ? 'друг' : 'не в друзьях'}</span>`}<span class="tag">${ids.length} оценок${m ? ' · совпадение ' + m.pct + '%' : ''}</span></div>
            <div class="nick ${fx}" data-t="${esc(nick)}">${esc(nick)}</div>
            <p class="bio">${esc(own ? (S.profile.bio || 'Расскажи о себе пару слов — их увидят друзья.') : p.bio)}</p>
            <div class="seen">${own ? 'сохранено · профиль видят все, у кого есть ссылка' : lastSeen(p)}</div>
            <div class="prof-acts">${own
              ? `<button class="btn acc" data-act="edit">${UI.editing ? 'Скрыть' : 'Редактировать профиль'}</button><a class="btn" href="#/shop">Сменить баннер</a><button class="btn" data-act="share">Поделиться</button>`
              : `${isFriend ? `<button class="btn" data-act="unfriend" data-name="${esc(name)}">Убрать из друзей</button>` : `<button class="btn acc" data-act="befriend" data-name="${esc(name)}">Добавить в друзья</button>`}<button class="btn acc" data-act="guess" data-name="${esc(name)}">Угадать оценки</button><button class="btn" data-act="advise" data-name="${esc(name)}">Посоветовать аниме</button>`}
            </div>
            ${own && UI.editing ? `<form class="edit-form" id="edit-form">
              <input name="nick" maxlength="20" placeholder="Ник" value="${esc(S.profile.nick)}" required>
              <textarea name="bio" maxlength="140" rows="2" placeholder="Пара слов о себе">${esc(S.profile.bio)}</textarea>
              <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn acc sm" type="submit">Сохранить</button>${S.profile.avatar ? '<button class="btn sm ghost" type="button" data-act="ava-rm">Убрать фото</button>' : ''}</div>
            </form>` : ''}
          </div>
        </div>
      </section>
      <div class="stats" style="margin-top:14px">
        <div class="panel stat"><div class="lbl">Средний балл</div><b>${ids.length ? avgScore.toFixed(1) : '—'}</b><small>по ${ids.length} ${plural(ids.length, ['оценке', 'оценкам', 'оценкам'])}</small></div>
        <div class="panel stat"><div class="lbl">${own ? 'Просмотрено' : 'Аниме'}</div><b>${own ? Object.values(S.status).filter(s => s === 'done').length : ids.filter(id => byId(id).type === 'anime').length}</b><small>${own ? 'тайтлов' : 'в оценках'}</small></div>
        <div class="panel stat"><div class="lbl">Монеты</div><b style="color:var(--star)">${fmt(own ? S.coins : p.coins)}</b><small>◈ на счету</small></div>
        <div class="panel stat"><div class="lbl">${own ? 'Друзей' : 'Совпадение'}</div><b>${own ? S.friends.length : m ? m.pct + '%' : '—'}</b><small>${own ? 'в UWU' : m ? 'по ' + m.n + ' общим' : 'оцени общие тайтлы'}</small></div>
      </div>
      <div class="sec">
        <div class="jp">ショーケース<em>${slots.length} из 3</em></div>
        <h2 class="h-sec">Витрина</h2>
        <p class="sub">${own ? 'Закрепи тут до трёх штук: тир-лист, любимый тайтл или свою десятку. Их первыми увидят те, кто откроет профиль.' : 'То, что ' + esc(name) + ' закрепил(а) на витрине.'}</p>
        <div class="showcase">${slots.map((s, i) => slotHtml(s, i, own)).join('')}${own ? Array.from({ length: 3 - slots.length }, () => '<div class="panel slot free" data-act="slot-add" role="button" tabindex="0"><div><div class="plus">+</div>Закрепить</div></div>').join('') : ''}</div>
      </div></div>`;

    if (own) {
      const ai = document.getElementById('ava-in');
      ai.addEventListener('change', () => { if (ai.files[0]) loadAvatar(ai.files[0]); });
      const f = document.getElementById('edit-form');
      if (f) f.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(f);
        S.profile.nick = String(fd.get('nick')).trim().slice(0, 20) || 'UWU-kun';
        S.profile.bio = String(fd.get('bio')).trim().slice(0, 140);
        UI.editing = false; save(); viewProfile(null); toast('Профиль сохранён');
      });
    }
  }
  function loadAvatar(file) {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas'); c.width = c.height = 256;
        const s = Math.min(img.width, img.height);
        c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
        S.profile.avatar = c.toDataURL('image/jpeg', 0.85);
        save(); viewProfile(null); toast('Аватар обновлён');
      };
      img.onerror = () => toast('Не получилось открыть картинку');
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }
  function slotAdd() {
    const has = k => S.showcase.some(s => s.k === k);
    box.dataset.kind = 'slot';
    box.innerHTML = `<button class="x" data-close aria-label="Закрыть">×</button>
      <div class="jp">ショーケース</div><h2 class="h-sec" style="margin-bottom:14px">Что закрепить?</h2>
      <div class="pick-list">
        ${has('tier') ? '' : '<button data-slot="tier"><b>Тир-лист</b><small>Твои ряды S–D из раздела «Тир-листы»</small></button>'}
        <button data-slot="fav"><b>Любимый тайтл</b><small>Один постер крупно — с твоей оценкой</small></button>
        ${has('top') ? '' : '<button data-slot="top"><b>Моя десятка</b><small>Лучшее по твоим оценкам</small></button>'}
      </div>`;
    showModal();
  }
  function slotPickTitle() {
    const list = (rated().length ? rated().map(byId) : DB).slice().sort((a, b) => (S.ratings[b.id] || 0) - (S.ratings[a.id] || 0) || b.imdb - a.imdb);
    box.innerHTML = `<button class="x" data-close aria-label="Закрыть">×</button>
      <div class="jp">おきにいり</div><h2 class="h-sec" style="margin-bottom:14px">Любимый тайтл</h2>
      <div class="title-pick">${list.map(t => `<button data-fav="${t.id}">${poster(t, true)}</button>`).join('')}</div>`;
  }

  /* ================= модалка, тосты ================= */
  let lastFocus = null;
  function showModal() {
    if (modal.hidden) { lastFocus = document.activeElement; modal.hidden = false; document.body.style.overflow = 'hidden'; }
    const x = box.querySelector('.x'); if (x) x.focus({ preventScroll: true });
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true; document.body.style.overflow = ''; box.innerHTML = ''; G = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  let tt;
  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ================= роутер ================= */
  function current() {
    const [p = 'all', a] = location.hash.replace(/^#\/?/, '').split('/');
    return { p, a: a ? decodeURIComponent(a) : a };
  }
  function refresh() {
    const { p, a } = current();
    let theme = 'red', nav = p;
    switch (p) {
      case 'my': viewCatalog(null, STATUS[a] || a === 'rated' ? a : 'rated'); break;
      case 'tiers': viewTiers(); break;
      case 'imdb': viewImdb(); break;
      case 'friends': viewFriends(); break;
      case 'bets': viewBets(); break;
      case 'shop': viewShop(); break;
      case 'profile': theme = 'purple'; viewProfile(null); break;
      case 'u': theme = 'purple'; nav = 'friends'; viewProfile(a); break;
      default: nav = 'all'; viewCatalog(TYPES[a] ? a : 'all');
    }
    document.body.dataset.theme = theme;
    document.querySelectorAll('[data-nav]').forEach(el => el.classList.toggle('on', el.dataset.nav === nav));
    document.querySelectorAll('.menu a').forEach(el => el.classList.toggle('on', el.getAttribute('href') === location.hash));
  }
  window.addEventListener('hashchange', () => {
    closeModal(); UI.sel = null; UI.editing = false;
    document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open'));
    refresh(); window.scrollTo(0, 0);
  });

  /* ================= события ================= */
  const touch = matchMedia('(hover: none)');
  document.addEventListener('click', e => {
    const t = e.target;

    // выпадающие меню на тач-экранах
    const pill = t.closest('.dd > .pill');
    if (pill && touch.matches) {
      const dd = pill.parentElement;
      if (!dd.classList.contains('open')) {
        e.preventDefault();
        document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open'));
        dd.classList.add('open'); return;
      }
    }
    if (!t.closest('.dd')) document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open'));

    if (t.closest('[data-close]')) { closeModal(); return; }

    if (!modal.hidden && box.contains(t)) {
      const k = box.dataset.kind;
      if (k === 'title') return titleModalClick(e);
      if (k === 'game' && G) return gameClick(e);
      if (k === 'slot') {
        const s = t.closest('[data-slot]'), f = t.closest('[data-fav]');
        if (s) {
          if (s.dataset.slot === 'fav') return slotPickTitle();
          S.showcase.push({ k: s.dataset.slot }); save(); closeModal(); refresh();
        } else if (f) {
          S.showcase.push({ k: 'fav', id: +f.dataset.fav }); save(); closeModal(); refresh();
        }
        return;
      }
    }

    const btn = t.closest('[data-act]');
    if (btn) {
      e.stopPropagation();
      const name = btn.dataset.name;
      switch (btn.dataset.act) {
        case 'tier-auto': return autoTiers();
        case 'tier-reset': S.tiers = { S: [], A: [], B: [], C: [], D: [] }; save(); return viewTiers();
        case 'pool-all': UI.onlyRated = false; return viewTiers();
        case 'pool-rated': UI.onlyRated = true; return viewTiers();
        case 'mode-friends': UI.betMode = 'friends'; return viewBets();
        case 'mode-solo': UI.betMode = 'solo'; return viewBets();
        case 'play-rate': return startRate(null);
        case 'play-duel': return startDuel();
        case 'howto': return howTo();
        case 'guess':
          return startRate(name);
        case 'unfriend':
          S.friends = S.friends.filter(n => n !== name); save(); toast(name + ' больше не в друзьях'); return refresh();
        case 'befriend':
          if (!S.friends.includes(name)) S.friends.push(name); save(); toast(name + ' теперь в друзьях'); return refresh();
        case 'advise': {
          const seen = new Set(frRated(name).map(x => x.id));
          const mine = rated().map(byId).filter(x => x.type === 'anime').sort((a, b) => S.ratings[b.id] - S.ratings[a.id]);
          const pick = mine.find(x => !seen.has(x.id)) || DB.filter(x => x.type === 'anime' && !seen.has(x.id))[0] || DB[0];
          return toast(`Отправлено ${name}: «${pick.title}»`);
        }
        case 'buy': {
          const it = SHOP.find(i => i.id === btn.dataset.item);
          if (!it || S.owned.includes(it.id) || S.coins < it.price) return;
          S.coins -= it.price; S.owned.push(it.id); S.eq[it.cat] = it.id; save(); toast(`Куплено и надето: ${it.name}`); return viewShop();
        }
        case 'equip': {
          const it = SHOP.find(i => i.id === btn.dataset.item);
          if (!it || !S.owned.includes(it.id)) return;
          S.eq[it.cat] = it.id; save(); toast(`Надето: ${it.name}`); return viewShop();
        }
        case 'edit': UI.editing = !UI.editing; return viewProfile(null);
        case 'ava-rm': S.profile.avatar = ''; save(); return viewProfile(null);
        case 'share': {
          const url = location.href;
          if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Ссылка скопирована'), () => toast(url));
          else toast(url);
          return;
        }
        case 'slot-add': return slotAdd();
        case 'slot-rm': S.showcase.splice(+btn.dataset.i, 1); save(); return viewProfile(null);
      }
      return;
    }

    if (current().p === 'tiers' && tiersClick(e)) return;

    const op = t.closest('[data-open]');
    if (op) { openTitle(+op.dataset.open); return; }
    const go = t.closest('[data-go]');
    if (go) { location.hash = go.dataset.go; }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); document.querySelectorAll('.dd.open').forEach(d => d.classList.remove('open')); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-open],[data-act][role="button"]')) { e.preventDefault(); e.target.click(); }
  });

  renderTop();
  refresh();
})();

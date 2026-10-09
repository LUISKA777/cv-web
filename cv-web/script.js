(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Barra de progreso + nav ---------- */
  const progress = $('#progress'), nav = $('#nav');
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progress.style.width = (p * 100) + '%';
    nav.classList.toggle('scrolled', h.scrollTop > 30);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Link activo en el menú ---------- */
  const links = $$('.nav nav a');
  const secObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secObs.observe(s));

  /* ---------- Texto que se escribe (hero) ---------- */
  const roles = ['Ingeniería en Sistemas', 'Desarrollo de Software', 'Ciberseguridad', 'Soporte TI e Infraestructura'];
  const typed = $('#typed');
  async function typeLoop() {
    if (reduce) { typed.textContent = roles.join(' · '); return; }
    let i = 0;
    while (true) {
      const word = roles[i % roles.length];
      for (let c = 1; c <= word.length; c++) { typed.textContent = word.slice(0, c); await sleep(65); }
      await sleep(1500);
      for (let c = word.length; c >= 0; c--) { typed.textContent = word.slice(0, c); await sleep(32); }
      await sleep(250);
      i++;
    }
  }
  typeLoop();

  /* ---------- Reveal al hacer scroll ---------- */
  const revObs = new IntersectionObserver(es => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
  }, { threshold: .15 });
  $$('.reveal').forEach(el => revObs.observe(el));

  /* ---------- Contadores ---------- */
  const countObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (!e.isIntersecting) return;
      countObs.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = end + suf; return; }
      const t0 = performance.now(), dur = 1200;
      const tick = t => {
        const k = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(el => countObs.observe(el));

  /* ---------- Terminal ---------- */
  const termBody = $('#termBody');
  const lines = JSON.parse(termBody.dataset.lines);
  const addLine = text => {
    const span = document.createElement('span');
    if (text.startsWith('$ ')) span.className = 'cmd';
    if (text.startsWith('[OK]')) span.className = 'ok';
    termBody.appendChild(span);
    termBody.appendChild(document.createTextNode('\n'));
    return span;
  };
  async function runTerm() {
    for (const line of lines) {
      const span = addLine(line);
      if (reduce) { span.textContent = line; continue; }
      const fast = !line.startsWith('$ ');
      for (let c = 1; c <= line.length; c++) { span.textContent = line.slice(0, c); await sleep(fast ? 12 : 45); }
      await sleep(fast ? 120 : 380);
    }
  }
  const termObs = new IntersectionObserver(es => {
    if (es[0].isIntersecting) { termObs.disconnect(); runTerm(); }
  }, { threshold: .35 });
  termObs.observe($('#term'));

  /* ---------- Luz que sigue al mouse en las tarjetas ---------- */
  $$('.card').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Descargar PDF (imprimir) ---------- */
  $('#printBtn').addEventListener('click', () => {
    $$('.reveal').forEach(el => el.classList.add('in'));
    const lead = $('#typed'); const prev = lead.textContent;
    lead.textContent = roles.join(' · ');
    setTimeout(() => { print(); lead.textContent = prev; }, 60);
  });

  /* ---------- Fondo: red de nodos ---------- */
  const cv = $('#net'), ctx = cv.getContext('2d');
  let W, H, nodes = [], mouse = { x: -999, y: -999 }, running = true;
  const DPR = Math.min(devicePixelRatio || 1, 2);

  function resize() {
    W = cv.width = innerWidth * DPR; H = cv.height = innerHeight * DPR;
    cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
    const n = Math.min(Math.floor(innerWidth * innerHeight / 17000), 90);
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .35 * DPR, vy: (Math.random() - .5) * .35 * DPR,
      r: (Math.random() * 1.4 + .8) * DPR
    }));
  }
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    const max = 150 * DPR;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 170 * DPR) { a.x += (a.x - mouse.x) * .004; a.y += (a.y - mouse.y) * .004; }
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283);
      ctx.fillStyle = dm < 170 * DPR ? 'rgba(52,211,153,.95)' : 'rgba(34,211,238,.7)'; ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < max) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - d / max) * .22})`;
          ctx.lineWidth = DPR * .8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mouse.x = e.clientX * DPR; mouse.y = e.clientY * DPR; }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running && !reduce) requestAnimationFrame(draw);
  });
  if (reduce) { running = false; ctx.clearRect(0, 0, W, H); } else draw();
})();

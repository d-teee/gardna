/* ============================================================
   GARDNA — interaction layer (vanilla)
   Parallax · scroll reveals · drag/scroll carousel · hero variants
   ============================================================ */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- shared tweak state, read by effects ---------- */
  const G = window.__gardna = window.__gardna || {};
  G.motion = 1;          // 0..1.6 motion intensity multiplier
  G.parallax = !reduce;  // parallax on/off

  /* ============================================================
     1. SCROLL REVEALS
     ============================================================ */
  let revealEls = [];
  function checkReveals() {
    const trigger = window.innerHeight * 0.9;
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('in');
        revealEls.splice(i, 1);
      }
    }
  }
  function wireReveals(root) {
    revealEls = [...(root || document).querySelectorAll('[data-reveal]')];
    checkReveals();
    // IntersectionObserver as the primary path; scroll check is the safety net
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          const k = revealEls.indexOf(e.target);
          if (k > -1) revealEls.splice(k, 1);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ============================================================
     2. PARALLAX  (scroll + pointer)
     ============================================================ */
  const layers = [];
  function collectLayers() {
    layers.length = 0;
    document.querySelectorAll('[data-px]').forEach((el) => {
      layers.push({
        el,
        depth: parseFloat(el.dataset.px) || 0,      // scroll factor
        mx: parseFloat(el.dataset.mx || '0'),       // mouse factor x
        my: parseFloat(el.dataset.my || '0'),       // mouse factor y
      });
    });
  }

  let pointerX = 0, pointerY = 0, targetPX = 0, targetPY = 0;
  window.addEventListener('pointermove', (e) => {
    targetPX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetPY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let ticking = false;
  function onScroll() {
    checkReveals();
    if (!ticking) { requestAnimationFrame(applyParallax); ticking = true; }
  }
  function applyParallax() {
    ticking = false;
    const m = G.parallax ? G.motion : 0;
    pointerX += (targetPX - pointerX) * 0.06;
    pointerY += (targetPY - pointerY) * 0.06;
    const scy = window.scrollY;
    for (const L of layers) {
      const rect = L.el.parentElement.getBoundingClientRect();
      const within = rect.top + scy; // section top in doc
      const rel = scy - within + window.innerHeight * 0.5;
      const ty = -rel * L.depth * m * 0.12;
      const tmx = pointerX * L.mx * m;
      const tmy = pointerY * L.my * m;
      L.el.style.transform = `translate3d(${tmx}px, ${ty + tmy}px, 0)`;
    }
  }
  function rafLoop() {
    // continuous easing for pointer parallax
    applyParallax();
    requestAnimationFrame(rafLoop);
  }

  /* ============================================================
     3. HERO VARIANTS
     ============================================================ */
  G.setHero = function (name) {
    const hero = document.querySelector('.hero');
    if (hero) hero.setAttribute('data-hero', name);
    collectLayers();
  };

  /* ============================================================
     4. CAROUSEL — drag / wheel / arrows, snap, momentum
     ============================================================ */
  function initCarousel() {
    const car = document.querySelector('.carousel');
    if (!car) return;
    const track = car.querySelector('.carousel-track');
    const panels = [...track.querySelectorAll('.panel')];
    const bar = document.querySelector('.car-progress-bar');
    const count = document.querySelector('.car-count');
    const prev = document.querySelector('.car-prev');
    const next = document.querySelector('.car-next');

    let x = 0;            // current translate
    let target = 0;       // eased target
    let min = 0;          // max negative
    let dragging = false;
    let startX = 0, startTranslate = 0, lastX = 0, vel = 0, lastT = 0;
    let active = 0;

    function measure() {
      const trackW = track.scrollWidth;
      const viewW = car.clientWidth - parseFloat(getComputedStyle(car).paddingLeft) * 2;
      min = Math.min(0, -(trackW - viewW));
    }
    function clamp(v) { return Math.max(min, Math.min(0, v)); }

    function panelOffset(i) {
      const p = panels[i];
      // align panel left to carousel content-left
      return -(p.offsetLeft - track.offsetLeft);
    }
    function nearestIndex() {
      let best = 0, bd = Infinity;
      panels.forEach((p, i) => {
        const d = Math.abs(panelOffset(i) - x);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function snapTo(i) {
      i = Math.max(0, Math.min(panels.length - 1, i));
      active = i;
      target = clamp(panelOffset(i));
    }
    function updateUI() {
      const i = nearestIndex();
      active = i;
      const pct = (i) / (panels.length - 1) * 100;
      if (bar) {
        bar.style.width = (100 / panels.length) + '%';
        bar.style.left = (i / panels.length * 100) + '%';
      }
      if (count) count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(panels.length).padStart(2, '0');
      panels.forEach((p, j) => { p.style.opacity = j === i ? '1' : '0.55'; });
    }

    function render() {
      x += (target - x) * 0.12;
      if (Math.abs(target - x) < 0.4) x = target;
      track.style.transform = `translate3d(${x}px,0,0)`;
      updateUI();
      requestAnimationFrame(render);
    }

    // pointer drag
    car.addEventListener('pointerdown', (e) => {
      dragging = true; car.classList.add('dragging');
      car.setPointerCapture(e.pointerId);
      startX = e.clientX; startTranslate = x; lastX = e.clientX; lastT = performance.now(); vel = 0;
    });
    car.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      x = clamp(startTranslate + dx); target = x;
      const now = performance.now();
      vel = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX; lastT = now;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false; car.classList.remove('dragging');
      // momentum → snap
      const proj = x + vel * 120;
      let best = 0, bd = Infinity;
      panels.forEach((p, i) => { const d = Math.abs(panelOffset(i) - proj); if (d < bd) { bd = d; best = i; } });
      snapTo(best);
    }
    car.addEventListener('pointerup', endDrag);
    car.addEventListener('pointercancel', endDrag);
    car.addEventListener('lostpointercapture', endDrag);

    // wheel (horizontal & vertical-intent)
    car.addEventListener('wheel', (e) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        e.preventDefault();
        target = clamp(target - d * 1.1);
        clearTimeout(car._wt);
        car._wt = setTimeout(() => snapTo(nearestIndex()), 140);
      }
    }, { passive: false });

    if (prev) prev.addEventListener('click', () => snapTo(active - 1));
    if (next) next.addEventListener('click', () => snapTo(active + 1));

    // keyboard when carousel in view
    window.addEventListener('keydown', (e) => {
      const r = car.getBoundingClientRect();
      const visible = r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4;
      if (!visible) return;
      if (e.key === 'ArrowRight') snapTo(active + 1);
      if (e.key === 'ArrowLeft') snapTo(active - 1);
    });

    window.addEventListener('resize', () => { measure(); snapTo(active); });

    measure(); updateUI(); render();
  }

  /* ============================================================
     5. WAITLIST
     ============================================================ */
  function initWaitlist() {
    const form = document.querySelector('.waitlist');
    if (!form) return;
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button');
    const label = btn.querySelector('.wl-label');
    let submitting = false;

    function succeed() {
      form.classList.remove('error');
      form.classList.add('done');
      label.textContent = 'You\u2019re on the list';
      input.value = '';
      input.placeholder = 'See you soon \u2014 we\u2019ll be in touch';
      input.blur();
    }
    function fail(msg) {
      form.classList.add('error');
      label.textContent = msg || 'Try again';
      setTimeout(() => { if (!form.classList.contains('done')) { label.textContent = 'Join'; form.classList.remove('error'); } }, 3000);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitting || form.classList.contains('done')) return;
      const email = input.value.trim();
      if (!email || !input.checkValidity()) { input.focus(); fail('Enter a valid email'); return; }

      const endpoint = form.getAttribute('action') || '';
      // Not connected yet — show success visually but warn loudly so signups aren't silently lost.
      if (!endpoint || endpoint.indexOf('YOUR_FORM_ID') !== -1) {
        console.warn('[Gardna] Waitlist is NOT connected yet — set the Formspree endpoint in the form\u2019s action attribute. Emails are not being saved.');
        succeed();
        return;
      }

      submitting = true;
      btn.disabled = true;
      label.textContent = 'Joining\u2026';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form),
        });
        if (res.ok) {
          succeed();
        } else if (res.status === 429) {
          fail('Too many tries \u2014 wait a moment');
        } else {
          fail('Something went wrong');
        }
      } catch (err) {
        fail('Check your connection');
      } finally {
        submitting = false;
        btn.disabled = false;
      }
    });
  }

  /* ============================================================
     BOOT
     ============================================================ */
  function boot() {
    const params = new URLSearchParams(location.search);
    if (params.get('embed') === '1') {
      document.body.classList.add('embed');
      G.embed = true;
    }
    const h = params.get('hero');
    collectLayers();
    wireReveals();
    initCarousel();
    initWaitlist();
    window.addEventListener('scroll', onScroll, { passive: true });
    if (!reduce) rafLoop(); else applyParallax();
    if (h) { G.setHero(h); G.lockedHero = h; }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

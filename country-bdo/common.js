/* ============================================================
   COUNTRY Guild — common.js
   Shared logic: navbar scroll, mobile menu, mini-particles,
   modal, toast, scroll-reveal, counter animation
   ============================================================ */
(function () {
  'use strict';

  /* ── Nav scroll & hamburger (sub-pages) ────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    const navbar    = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMobile = document.getElementById('nav-mobile');

    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });
    }
    if (navToggle && navMobile) {
      navToggle.addEventListener('click', () => navMobile.classList.toggle('open'));
      navMobile.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navMobile.classList.remove('open'));
      });
    }

    /* ── Smooth anchor scroll ────────────────────────────── */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
      });
    });
  });

  /* ── Mini particle canvas for sub-page heroes ──────────── */
  window.initMiniParticles = function (canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    function make() {
      const n = Math.floor((W * H) / 16000);
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.22 + 0.04),
        a: Math.random() * 0.8 + 0.2,
        flicker: Math.random() * Math.PI * 2,
        fs: Math.random() * 0.03 + 0.015,
        pink: Math.random() > 0.38,
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.flicker += p.fs;
        const a = p.a * (0.65 + 0.35 * Math.sin(p.flicker));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.pink
          ? `rgba(227,145,177,${a})`
          : `rgba(130,160,220,${a})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) p.y = H + 4;
        if (p.x < -4) p.x = W + 4;
        if (p.x > W + 4) p.x = -4;
      });
      requestAnimationFrame(tick);
    }
    resize(); make(); tick();
    let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { resize(); make(); }, 200); }, { passive: true });
  };

  /* ── Scroll reveal (IntersectionObserver) ──────────────── */
  window.initReveal = function (selector, cls = 'revealed', delay = 120) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (!e.isIntersecting) return;
        setTimeout(() => e.target.classList.add(cls), i * delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(selector).forEach(el => io.observe(el));
  };

  /* ── Counter animation ─────────────────────────────────── */
  window.initCounters = function (selector = '.stat-number[data-target]') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const dur = 1400;
        const start = performance.now();
        const run = now => {
          const p = Math.min((now - start) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(e * target);
          if (p < 1) requestAnimationFrame(run); else el.textContent = target;
        };
        requestAnimationFrame(run);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll(selector).forEach(el => io.observe(el));
  };

  /* ── Modal ─────────────────────────────────────────────── */
  window.openModal = function (src, caption) {
    let overlay = document.getElementById('img-modal');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'img-modal';
      overlay.className = 'modal-overlay';
      overlay.innerHTML = `
        <div class="modal-box">
          <button class="modal-close" id="modal-close-btn">✕</button>
          <canvas id="modal-canvas" style="width:100%;display:block;max-height:68vh;"></canvas>
          <div class="modal-caption" id="modal-caption"></div>
        </div>`;
      document.body.appendChild(overlay);
      document.getElementById('modal-close-btn').addEventListener('click', window.closeModal);
      overlay.addEventListener('click', e => { if (e.target === overlay) window.closeModal(); });
    }
    // draw the canvas scene into the modal
    const mc = document.getElementById('modal-canvas');
    mc.width = 900; mc.height = 500;
    // src is a function that draws on a canvas
    if (typeof src === 'function') src(mc);
    document.getElementById('modal-caption').textContent = caption || '';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeModal = function () {
    const overlay = document.getElementById('img-modal');
    if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
  };
  document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeModal(); });

  /* ── Toast ─────────────────────────────────────────────── */
  window.showToast = function (msg) {
    let t = document.getElementById('site-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'site-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  };

  /* ── Auto-init on DOMContentLoaded ────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    // page-hero mini particles (sub-pages)
    initMiniParticles('page-hero-canvas');
    // generic reveal
    initReveal('.reveal-item');
    initReveal('.feature-item', 'revealed', 160);
    initReveal('.activity-card', 'visible', 110);
    // counters
    initCounters();
  });

})();

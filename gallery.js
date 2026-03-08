/* ============================================================
   COUNTRY Guild — gallery.js
   Gallery: canvas rendering, filter, modal
   ============================================================ */
(function () {
  'use strict';

  /* ── Render all gallery canvases ────────────────────────── */
  function renderGalleryCanvases() {
    document.querySelectorAll('.gallery-canvas').forEach(canvas => {
      const scene = canvas.dataset.scene;
      if (scene && BDOImages.scenes[scene]) {
        BDOImages.scenes[scene](canvas);
      }
    });
  }

  /* ── Filter tabs ────────────────────────────────────────── */
  function initFilter() {
    const tabs = document.querySelectorAll('.filter-tab');
    const items = document.querySelectorAll('.gallery-item');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;

        items.forEach((item, i) => {
          const tag = item.dataset.filterTag || 'all';
          const show = filter === 'all' || tag === filter;
          if (show) {
            item.classList.remove('hidden');
            setTimeout(() => item.classList.add('revealed'), i * 60);
          } else {
            item.classList.remove('revealed');
            item.classList.add('hidden');
          }
        });
      });
    });
  }

  /* ── Expand / Modal ─────────────────────────────────────── */
  function initExpandButtons() {
    // Canvas scene expand
    document.querySelectorAll('.gallery-expand').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const scene = btn.dataset.scene;
        const caption = btn.dataset.caption || '';
        if (!scene || !BDOImages.scenes[scene]) return;
        window.openModal(canvas => {
          BDOImages.scenes[scene](canvas);
        }, caption);
      });
    });

    // Real image expand
    document.querySelectorAll('.gallery-expand-img').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const src = btn.dataset.src;
        const caption = btn.dataset.caption || '';
        if (!src) return;
        openImgModal(src, caption);
      });
    });

    // Also click on the featured item
    const featured = document.querySelector('.gallery-featured');
    if (featured) {
      featured.addEventListener('click', () => {
        const btn = featured.querySelector('.gallery-expand');
        if (btn) btn.click();
      });
    }

    // Click on gallery items (not the expand button)
    document.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', () => {
        const btn = item.querySelector('.gallery-expand, .gallery-expand-img');
        if (btn) btn.click();
      });
    });
  }

  /* ── Real image modal ────────────────────────────────────── */
  function openImgModal(src, caption) {
    let overlay = document.getElementById('img-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'img-modal-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:9999;
        background:rgba(0,0,0,0.88);
        display:flex;flex-direction:column;
        align-items:center;justify-content:center;
        cursor:pointer;padding:1.5rem;
      `;
      overlay.innerHTML = `
        <img id="img-modal-img" style="max-width:90vw;max-height:78vh;object-fit:contain;border-radius:8px;box-shadow:0 0 40px rgba(227,145,177,0.3);">
        <p id="img-modal-caption" style="color:rgba(255,255,255,0.7);font-family:var(--font-jp);margin-top:1rem;font-size:0.9rem;text-align:center;max-width:600px;"></p>
        <button id="img-modal-close" style="position:absolute;top:1.5rem;right:2rem;background:none;border:none;color:rgba(255,255,255,0.6);font-size:2rem;cursor:pointer;">×</button>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener('click', e => {
        if (e.target === overlay || e.target.id === 'img-modal-close') {
          overlay.style.display = 'none';
        }
      });
    }
    overlay.querySelector('#img-modal-img').src = src;
    overlay.querySelector('#img-modal-caption').textContent = caption;
    overlay.style.display = 'flex';
  }

  /* ── Scroll reveal for gallery items ───────────────────── */
  function initGalleryReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        setTimeout(() => entry.target.classList.add('revealed'), i * 80);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.gallery-item, .gallery-featured').forEach(el => io.observe(el));
  }

  /* ── Load more (simulate) ───────────────────────────────── */
  function initLoadMore() {
    const btn = document.getElementById('load-more-btn');
    if (!btn) return;
    let clicked = false;
    btn.addEventListener('click', () => {
      if (clicked) { window.showToast('すべてのギャラリーを表示中だよ！🌸'); return; }
      clicked = true;
      window.showToast('新しい写真を読み込んでるよ… 🌸');
      setTimeout(() => {
        btn.textContent = '全て表示済み ✦';
        btn.disabled = true;
        btn.style.opacity = '0.5';
      }, 1200);
    });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    renderGalleryCanvases();
    initFilter();
    initExpandButtons();
    initGalleryReveal();
    initLoadMore();
  });
})();

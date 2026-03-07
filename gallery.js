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
        const btn = item.querySelector('.gallery-expand');
        if (btn) btn.click();
      });
    });
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

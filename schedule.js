/* ============================================================
   COUNTRY Guild — schedule.js
   ============================================================ */
(function () {
  'use strict';

  function renderEdcCanvases() {
    document.querySelectorAll('.edc-canvas').forEach(canvas => {
      const scene = canvas.dataset.scene;
      if (scene && BDOImages.scenes[scene]) BDOImages.scenes[scene](canvas);
    });
  }

  // Highlight today's column
  function highlightToday() {
    const days = ['sun','mon','tue','wed','thu','fri','sat'];
    const today = days[new Date().getDay()];
    const cols = document.querySelectorAll('.day-col');
    const dayOrder = ['mon','tue','wed','thu','fri','sat','sun'];
    const idx = dayOrder.indexOf(today);
    if (idx >= 0 && cols[idx]) {
      cols[idx].classList.add('day-today');
      const header = cols[idx].querySelector('.day-header');
      if (header) header.style.background = 'rgba(227,145,177,0.22)';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderEdcCanvases();
    initReveal('.reveal-item', 'revealed', 80);
    initReveal('.week-calendar', 'revealed', 0);
    highlightToday();
  });
})();

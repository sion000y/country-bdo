/* ============================================================
   COUNTRY Guild — rules.js
   ============================================================ */
(function () {
  'use strict';

  function renderRulesCanvases() {
    const banner = document.getElementById('rules-banner-canvas');
    if (banner) BDOImages.scenes.blossom(banner);

    const cta = document.getElementById('rules-cta-canvas');
    if (cta) BDOImages.scenes.partyScene(cta);
  }

  function initFAQ() {
    document.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        // Close all
        document.querySelectorAll('.faq-q').forEach(b => {
          b.setAttribute('aria-expanded', 'false');
          const a = b.nextElementSibling;
          if (a) a.classList.remove('open');
        });
        // Open this one if was closed
        if (!expanded) {
          btn.setAttribute('aria-expanded', 'true');
          const answer = btn.nextElementSibling;
          if (answer) answer.classList.add('open');
        }
      });
    });
  }

  function _bootRules() {
    renderRulesCanvases();
    initReveal('.reveal-item', 'revealed', 100);
    initFAQ();
  }
  window.initRules = _bootRules;
  if (!window.__SPA__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _bootRules);
    } else {
      _bootRules();
    }
  }
})();

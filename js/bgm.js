/* ============================================================
   COUNTRY Guild — bgm.js
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'country_bgm_muted';
  let audio = null;
  let unlocked = false;

  function unlock() {
    if (unlocked) return;
    unlocked = true;

    /* passiveなしの同期コンテキストでAudio作成＆再生 */
    audio = new Audio('audio/bgm.mp3');
    audio.loop   = true;
    audio.volume = 0.12;
    audio.muted  = localStorage.getItem(STORAGE_KEY) === 'true';

    if (!audio.muted) {
      audio.play().catch(() => {});
    }

    updateBtn();

    /* リスナー解除 */
    ['touchstart', 'touchend', 'pointerdown', 'click'].forEach(ev =>
      document.removeEventListener(ev, unlock)
    );
  }

  /* ── ボタン更新 ── */
  function updateBtn() {
    const btn = document.getElementById('bgm-toggle');
    if (!btn) return;
    const muted = audio ? audio.muted : (localStorage.getItem(STORAGE_KEY) === 'true');
    btn.innerHTML = muted ? '🔇' : '🎵';
  }

  /* ── ボタン生成 ── */
  function createButton() {
    const btn = document.createElement('button');
    btn.id = 'bgm-toggle';
    btn.innerHTML = localStorage.getItem(STORAGE_KEY) === 'true' ? '🔇' : '🎵';

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!audio) {
        unlock(); /* 初回タップがボタンの場合もここで初期化 */
        return;
      }
      audio.muted = !audio.muted;
      localStorage.setItem(STORAGE_KEY, String(audio.muted));
      btn.innerHTML = audio.muted ? '🔇' : '🎵';
      if (!audio.muted) audio.play().catch(() => {});
    });

    document.body.appendChild(btn);
  }

  /* ── 初期化 ── */
  function init() {
    createButton();

    /* PCは即時再生を試みる */
    audio = new Audio('audio/bgm.mp3');
    audio.loop   = true;
    audio.volume = 0.12;
    audio.muted  = localStorage.getItem(STORAGE_KEY) === 'true';
    audio.play().then(() => {
      unlocked = true;
      updateBtn();
    }).catch(() => {
      /* スマホ等でブロックされた場合はタッチを待つ */
      audio = null;
      unlocked = false;
      /* passive:false で同期的に呼ぶ */
      ['touchstart', 'touchend', 'pointerdown', 'click'].forEach(ev =>
        document.addEventListener(ev, unlock, { passive: false })
      );
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();

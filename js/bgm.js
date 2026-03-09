/* ============================================================
   COUNTRY Guild — bgm.js
   BGM自動再生 + ON/OFFトグルボタン
   ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'country_bgm_muted';

  const audio   = new Audio('audio/bgm.mp3');
  audio.loop    = true;
  audio.volume  = 0.12;
  audio.preload = 'auto';
  audio.muted   = localStorage.getItem(STORAGE_KEY) === 'true';

  /* ── 再生 ── */
  function play() {
    if (audio.muted) return;
    audio.play().catch(() => {});
  }

  /* ── ユーザー操作で再生（再生済みなら解除） ── */
  function onInteraction() {
    if (!audio.paused) {
      removeListeners();
      return;
    }
    play();
    /* 再生成功したらリスナー解除（少し待って確認） */
    setTimeout(() => { if (!audio.paused) removeListeners(); }, 300);
  }

  const EVENTS = ['pointerdown', 'scroll', 'keydown', 'touchstart'];
  function addListeners()    { EVENTS.forEach(ev => document.addEventListener(ev,    onInteraction, { passive: true })); }
  function removeListeners() { EVENTS.forEach(ev => document.removeEventListener(ev, onInteraction)); }

  /* ── ボタン ── */
  function createButton() {
    const btn = document.createElement('button');
    btn.id = 'bgm-toggle';

    function update() {
      btn.innerHTML = audio.muted ? '🔇' : '🎵';
      btn.title     = audio.muted ? 'BGM OFF → クリックでON' : 'BGM ON → クリックでOFF';
    }
    update();
    document.body.appendChild(btn);

    btn.addEventListener('click', e => {
      e.stopPropagation(); /* onInteractionの二重発火防止 */
      audio.muted = !audio.muted;
      localStorage.setItem(STORAGE_KEY, String(audio.muted));
      update();
      if (!audio.muted) play();
    });
  }

  /* ── 初期化 ── */
  function init() {
    createButton();
    addListeners();
    play(); /* 自動再生を試みる（ブロックされても問題なし） */
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();

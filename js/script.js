/* ============================================================
   COUNTRY Guild Homepage — script.js
   Canvas-driven visuals + scroll animations + interactions
   ============================================================ */

(function () {
  'use strict';

  /* ── Palette ─────────────────────────────────────────────── */
  const C = {
    blue:     '#345DB0',
    blueDark: '#1e3a72',
    blueMid:  '#2a4d96',
    blueLight:'#4d7dce',
    pink:     '#E391B1',
    rose:     '#E8D7DD',
    white:    '#FFFFFF',
    gold:     '#c9a84c',
    goldLight:'#e8c97a',
  };

  /* ── Utility ─────────────────────────────────────────────── */
  function hex(c, a = 1) {
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  /* ── Navigation & smooth scroll → common.js が担当 ──────── */

  /* ── Hero Particle Canvas ────────────────────────────────── */
  (function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      const count = Math.floor((W * H) / 14000);
      particles = Array.from({ length: count }, () => ({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(0.5, 2.2),
        vx: rand(-0.12, 0.12),
        vy: rand(-0.25, -0.05),
        alpha: rand(0.2, 0.9),
        color: Math.random() > 0.4 ? C.pink : C.blueLight,
        flicker: rand(0, Math.PI * 2),
        flickerSpeed: rand(0.015, 0.04),
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.flicker += p.flickerSpeed;
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.flicker));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = hex(p.color, a);
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -5) p.y = H + 5;
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
      });
      requestAnimationFrame(tick);
    }

    resize();
    createParticles();
    tick();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); createParticles(); }, 200);
    }, { passive: true });
  })();

  /* ── Guild Crest Canvas ──────────────────────────────────── */
  function drawCrest() {
    const canvas = document.getElementById('crest-canvas');
    if (!canvas) return;
    /* 前回のアニメーションループをキャンセル */
    if (canvas._rafId) cancelAnimationFrame(canvas._rafId);
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    let t = 0;

    /* ── 角丸ポリゴン描画ヘルパー ──
         points: [{x,y}] の配列、r: 角丸半径 ── */
    function roundedPoly(points, r) {
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        const prev = points[(i - 1 + points.length) % points.length];
        const curr = points[i];
        const next = points[(i + 1) % points.length];
        const d1x = curr.x - prev.x, d1y = curr.y - prev.y;
        const d2x = next.x - curr.x, d2y = next.y - curr.y;
        const len1 = Math.hypot(d1x, d1y), len2 = Math.hypot(d2x, d2y);
        const rc = Math.min(r, len1 / 2, len2 / 2);
        const t1x = curr.x - (d1x / len1) * rc, t1y = curr.y - (d1y / len1) * rc;
        const t2x = curr.x + (d2x / len2) * rc, t2y = curr.y + (d2y / len2) * rc;
        if (i === 0) ctx.moveTo(t1x, t1y); else ctx.lineTo(t1x, t1y);
        ctx.quadraticCurveTo(curr.x, curr.y, t2x, t2y);
      }
      ctx.closePath();
    }

    /* ── 幾何学的な花びら1枚（角丸版） ── */
    function geoPetal(x, y, w, h, rot, alpha, c1, c2) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      const g = ctx.createLinearGradient(0, -h, 0, h);
      g.addColorStop(0,   c1);
      g.addColorStop(0.5, c2);
      g.addColorStop(1,   c1);
      ctx.fillStyle   = g;
      ctx.shadowColor = 'rgba(220,100,150,0.6)';
      ctx.shadowBlur  = 14;
      const pts = [
        { x:  0,         y: -h        },
        { x:  w * 0.28,  y: -h * 0.28 },
        { x:  w,         y:  0        },
        { x:  w * 0.28,  y:  h * 0.28 },
        { x:  0,         y:  h        },
        { x: -w * 0.28,  y:  h * 0.28 },
        { x: -w,         y:  0        },
        { x: -w * 0.28,  y: -h * 0.28 },
      ];
      roundedPoly(pts, w * 0.55);
      ctx.fill();
      /* 中心筋 */
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth   = 0.8;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.85); ctx.lineTo(0,  h * 0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w * 0.75, 0);  ctx.lineTo(w * 0.75, 0);  ctx.stroke();
      ctx.restore();
    }

    /* ── 幾何学的な花芯：角丸六角形 ── */
    function geoCentral(x, y, r, rot, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y);
      ctx.rotate(rot);
      /* 外側角丸六角形 */
      const hexPts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
      roundedPoly(hexPts, r * 0.3);
      const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      hg.addColorStop(0,   '#fff8e0');
      hg.addColorStop(0.5, '#f8d060');
      hg.addColorStop(1,   'rgba(240,160,40,0)');
      ctx.fillStyle   = hg;
      ctx.shadowColor = 'rgba(255,200,60,0.9)';
      ctx.shadowBlur  = 24;
      ctx.fill();
      /* 内側角丸六角形（アウトライン） */
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(255,230,100,0.6)';
      ctx.lineWidth   = 1;
      const hexPts2 = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return { x: Math.cos(a) * r * 0.55, y: Math.sin(a) * r * 0.55 };
      });
      roundedPoly(hexPts2, r * 0.18);
      ctx.stroke();
      ctx.restore();
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      /* ── 背景 ── */
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.52);
      bg.addColorStop(0,   '#3b1040');
      bg.addColorStop(0.6, '#210830');
      bg.addColorStop(1,   '#0f0418');
      ctx.fillStyle = bg;
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.52, 0, Math.PI * 2); ctx.fill();

      /* ── 外周：二重の幾何学リング ── */
      const pulse = 0.5 + 0.2 * Math.sin(t * 1.2);
      /* 外側点線 */
      ctx.save();
      ctx.strokeStyle = 'rgba(227,145,177,0.18)';
      ctx.lineWidth   = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.49, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      /* 内側実線 */
      ctx.save();
      ctx.strokeStyle = `rgba(227,145,177,${pulse})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, W * 0.45, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      /* ── 外周に12本の放射線（幾何学装飾） ── */
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.08);
      for (let i = 0; i < 12; i++) {
        const a   = (Math.PI * 2 / 12) * i;
        const alp = 0.12 + 0.06 * Math.sin(t * 1.5 + i);
        ctx.strokeStyle = `rgba(227,145,177,${alp})`;
        ctx.lineWidth   = 0.8;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 78, Math.sin(a) * 78);
        ctx.lineTo(Math.cos(a) * W * 0.44, Math.sin(a) * W * 0.44);
        ctx.stroke();
      }
      ctx.restore();

      /* ── 内側グロー ── */
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 88);
      glow.addColorStop(0, `rgba(247,180,210,${0.2 + 0.08 * Math.sin(t)})`);
      glow.addColorStop(1, 'rgba(200,80,140,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.fill();

      /* ── メイン：幾何学桜 5枚花びら ── */
      const petalDist = 46;
      const pw = 22, ph = 44;
      const baseRot = t * 0.15;
      for (let i = 0; i < 5; i++) {
        const a  = baseRot + (Math.PI * 2 / 5) * i - Math.PI / 2;
        const px = cx + Math.cos(a) * petalDist;
        const py = cy + Math.sin(a) * petalDist;
        geoPetal(px, py, pw, ph, a + Math.PI / 2,
                 0.93, '#fde0ee', '#d95090');
      }

      /* ── 花びらの間に小さなダイヤ形 ── */
      for (let i = 0; i < 5; i++) {
        const a  = baseRot + (Math.PI * 2 / 5) * i - Math.PI / 2 + Math.PI / 5;
        const px = cx + Math.cos(a) * 72;
        const py = cy + Math.sin(a) * 72;
        ctx.save();
        ctx.globalAlpha = 0.45 + 0.15 * Math.sin(t * 2 + i);
        ctx.translate(px, py); ctx.rotate(a + Math.PI / 4);
        ctx.fillStyle = '#f5a8c8';
        ctx.shadowColor = 'rgba(220,100,150,0.5)';
        ctx.shadowBlur  = 8;
        const dpts = [{x:0,y:-7},{x:5,y:0},{x:0,y:7},{x:-5,y:0}];
        roundedPoly(dpts, 2.5);
        ctx.fill();
        ctx.restore();
      }

      /* ── 花芯：幾何学的六角形 ── */
      geoCentral(cx, cy, 17, t * 0.25, 1);

      /* ── COUNTRY テキスト ── */
      ctx.save();
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.font         = `bold 21px 'Cinzel Decorative', serif`;
      /* 影 */
      ctx.fillStyle = 'rgba(80,10,50,0.75)';
      ctx.fillText('COUNTRY', cx + 1.5, cy + 108 + 1.5);
      /* 本文 */
      ctx.fillStyle   = '#ffffff';
      ctx.shadowColor = 'rgba(247,145,177,1)';
      ctx.shadowBlur  = 16;
      ctx.fillText('COUNTRY', cx, cy + 108);
      /* アンダーライン */
      ctx.shadowBlur  = 0;
      const ulW  = 84;
      const ulGr = ctx.createLinearGradient(cx - ulW, 0, cx + ulW, 0);
      ulGr.addColorStop(0,   'rgba(227,145,177,0)');
      ulGr.addColorStop(0.5, 'rgba(227,145,177,0.85)');
      ulGr.addColorStop(1,   'rgba(227,145,177,0)');
      ctx.strokeStyle = ulGr; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - ulW, cy + 118); ctx.lineTo(cx + ulW, cy + 118);
      ctx.stroke();
      ctx.restore();

      t += 0.022;
      canvas._rafId = requestAnimationFrame(frame);
    }

    canvas._rafId = requestAnimationFrame(frame);
  }

  /* ── Activity Card Canvases ──────────────────────────────── */
  function drawActivityCanvas(canvas, type) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.offsetWidth || 400;
    const H = canvas.offsetHeight || 170;
    canvas.width = W;
    canvas.height = H;

    let t = 0;

    const drawers = {
      party: function () {
        // Dungeon-like scene: glowing arches, adventurers
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0d1a3a');
        bg.addColorStop(1, '#0a1228');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Stone floor grid
        ctx.strokeStyle = hex(C.blueMid, 0.15);
        ctx.lineWidth = 0.5;
        for (let x = 0; x < W; x += 30) {
          ctx.beginPath(); ctx.moveTo(x, H * 0.55); ctx.lineTo(x + 20, H); ctx.stroke();
        }
        for (let y = H * 0.55; y < H; y += 18) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // Arch portal glow
        const archX = W / 2, archY = H * 0.48;
        const glow = ctx.createRadialGradient(archX, archY, 0, archX, archY, 60);
        glow.addColorStop(0, hex(C.blue, 0.35 + 0.1 * Math.sin(t)));
        glow.addColorStop(0.4, hex(C.pink, 0.1 + 0.05 * Math.sin(t * 0.7)));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        // Arch shape
        ctx.beginPath();
        ctx.arc(archX, archY, 45, Math.PI, 0);
        ctx.lineTo(archX + 45, archY + 55);
        ctx.lineTo(archX - 45, archY + 55);
        ctx.closePath();
        ctx.fillStyle = hex(C.blueDark, 0.6);
        ctx.fill();
        ctx.strokeStyle = hex(C.blue, 0.7);
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner arch glow
        const innerGlow = ctx.createRadialGradient(archX, archY, 0, archX, archY, 40);
        innerGlow.addColorStop(0, hex(C.blue, 0.5 + 0.15 * Math.sin(t)));
        innerGlow.addColorStop(1, hex(C.blue, 0));
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(archX, archY, 40, Math.PI, 0);
        ctx.lineTo(archX + 40, archY + 50);
        ctx.lineTo(archX - 40, archY + 50);
        ctx.closePath();
        ctx.fill();

        // Silhouette characters
        const chars = [
          { x: W * 0.2, h: 32, w: 10 },
          { x: W * 0.35, h: 28, w: 9 },
          { x: W * 0.65, h: 30, w: 9 },
          { x: W * 0.8, h: 34, w: 11 },
        ];
        chars.forEach(c => {
          const fy = H * 0.72;
          ctx.fillStyle = hex(C.blueDark, 0.85);
          ctx.fillRect(c.x - c.w / 2, fy - c.h, c.w, c.h);
          ctx.beginPath();
          ctx.arc(c.x, fy - c.h - 8, 7, 0, Math.PI * 2);
          ctx.fill();
        });

        // Floating runes
        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ'];
        runes.forEach((r, i) => {
          const rx = 30 + i * (W - 60) / (runes.length - 1);
          const ry = 15 + 8 * Math.sin(t * 0.8 + i * 1.2);
          ctx.font = '13px serif';
          ctx.fillStyle = hex(C.pink, 0.35 + 0.15 * Math.sin(t + i));
          ctx.textAlign = 'center';
          ctx.fillText(r, rx, ry);
        });
      },

      raid: function () {
        // Dragon/boss silhouette scene
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#1a0808');
        bg.addColorStop(0.5, '#200d0d');
        bg.addColorStop(1, '#0d0808');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Ground cracks (lava glow)
        const cracks = [[0.1, 0.3], [0.4, 0.2], [0.7, 0.35], [0.9, 0.15]];
        cracks.forEach(([px, pw]) => {
          const x = px * W, gw = pw * W;
          const lava = ctx.createRadialGradient(x, H, 0, x, H, gw * 1.5);
          lava.addColorStop(0, hex('#ff4400', 0.4 + 0.15 * Math.sin(t + px * 5)));
          lava.addColorStop(0.5, hex('#ff2200', 0.1));
          lava.addColorStop(1, 'transparent');
          ctx.fillStyle = lava;
          ctx.fillRect(0, 0, W, H);
        });

        // Dragon wing (abstract shape)
        ctx.save();
        ctx.translate(W * 0.65, H * 0.28 + 4 * Math.sin(t * 0.7));
        ctx.strokeStyle = hex('#cc2200', 0.7);
        ctx.lineWidth = 2;
        ctx.fillStyle = hex('#3a0a0a', 0.8);
        // Body
        ctx.beginPath();
        ctx.ellipse(0, 0, 55, 30, -0.3, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.ellipse(52, -18, 22, 14, 0.4, 0, Math.PI * 2);
        ctx.fillStyle = hex('#4a0f0f', 0.9);
        ctx.fill(); ctx.stroke();
        // Horn
        ctx.beginPath();
        ctx.moveTo(60, -28);
        ctx.lineTo(68, -46);
        ctx.lineTo(72, -30);
        ctx.fillStyle = hex('#661100', 0.8);
        ctx.fill();
        // Wing
        ctx.beginPath();
        ctx.moveTo(-20, -10);
        ctx.quadraticCurveTo(-70, -50, -100 + 5 * Math.sin(t), -10);
        ctx.quadraticCurveTo(-60, 20, -20, 10);
        ctx.closePath();
        ctx.fillStyle = hex('#2a0505', 0.75);
        ctx.fill();
        ctx.strokeStyle = hex('#991100', 0.5);
        ctx.stroke();
        ctx.restore();

        // Fire breath
        for (let i = 0; i < 8; i++) {
          const fx = W * 0.6 + i * 7;
          const fy = H * 0.22 + i * 4;
          const fr = 3 + i * 1.5 + Math.sin(t + i) * 2;
          const fa = 0.6 - i * 0.07;
          const fc = i < 3 ? hex('#ff8800', fa) : hex('#ff3300', fa * 0.7);
          ctx.beginPath();
          ctx.arc(fx, fy, fr, 0, Math.PI * 2);
          ctx.fillStyle = fc;
          ctx.fill();
        }

        // Tiny warriors silhouette
        for (let i = 0; i < 5; i++) {
          const wx = W * 0.1 + i * W * 0.13;
          const wh = 20 + Math.random() * 4;
          ctx.fillStyle = hex('#1a0a0a', 0.9);
          ctx.fillRect(wx - 4, H * 0.78 - wh, 8, wh);
          ctx.beginPath();
          ctx.arc(wx, H * 0.78 - wh - 7, 6, 0, Math.PI * 2);
          ctx.fill();
          // Weapon glint
          ctx.strokeStyle = hex(C.gold, 0.7);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(wx + 4, H * 0.78 - wh + 4);
          ctx.lineTo(wx + 14, H * 0.78 - wh - 10);
          ctx.stroke();
        }

        // HP bar aesthetic
        ctx.fillStyle = hex('#111', 0.7);
        ctx.fillRect(W / 2 - 70, 10, 140, 12);
        const hpFill = 0.45 + 0.1 * Math.sin(t * 0.3);
        const hpGrad = ctx.createLinearGradient(W / 2 - 68, 0, W / 2 + 68, 0);
        hpGrad.addColorStop(0, hex('#ff2200', 0.9));
        hpGrad.addColorStop(1, hex('#ff6600', 0.9));
        ctx.fillStyle = hpGrad;
        ctx.fillRect(W / 2 - 68, 12, 136 * hpFill, 8);
      },

      nodwar: function () {
        // Castle siege scene
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0d1520');
        bg.addColorStop(0.6, '#10233a');
        bg.addColorStop(1, '#081018');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Moon
        const moonGlow = ctx.createRadialGradient(W * 0.82, 25, 0, W * 0.82, 25, 50);
        moonGlow.addColorStop(0, hex(C.rose, 0.4));
        moonGlow.addColorStop(0.3, hex(C.rose, 0.1));
        moonGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = moonGlow;
        ctx.fillRect(0, 0, W, H);
        ctx.beginPath();
        ctx.arc(W * 0.82, 25, 18, 0, Math.PI * 2);
        ctx.fillStyle = hex(C.rose, 0.85);
        ctx.fill();

        // Castle silhouette
        const drawTower = (x, w, h) => {
          ctx.fillStyle = hex('#0d1830', 0.95);
          ctx.fillRect(x, H - h, w, h);
          // Battlements
          const bw = Math.floor(w / 8);
          for (let i = 0; i < Math.floor(w / 8); i++) {
            const bx = x + i * 8;
            ctx.fillRect(bx, H - h - 8, 4, 8);
          }
          // Window glow
          ctx.fillStyle = hex(C.gold, 0.5 + 0.2 * Math.sin(t * 0.4 + x * 0.01));
          ctx.fillRect(x + w / 2 - 4, H - h + 15, 8, 12);
        };

        drawTower(W * 0.15, 28, 80);
        drawTower(W * 0.28, 20, 65);
        drawTower(W * 0.42, 36, 95);  // main castle
        drawTower(W * 0.56, 22, 68);
        drawTower(W * 0.70, 26, 75);

        // Gate
        ctx.fillStyle = hex('#08101a', 1);
        ctx.beginPath();
        ctx.arc(W * 0.42 + 18, H - 95 + 20, 12, Math.PI, 0);
        ctx.rect(W * 0.42 + 6, H - 75, 24, 30);
        ctx.fill();

        // Guild banner/flags
        const flagColors = [C.blue, C.pink];
        [W * 0.15 + 14, W * 0.42 + 18, W * 0.70 + 13].forEach((fx, i) => {
          ctx.strokeStyle = hex(C.gold, 0.5);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(fx, H - (i === 1 ? 95 : 80) - 2);
          ctx.lineTo(fx, H - (i === 1 ? 95 : 80) - 22);
          ctx.stroke();
          ctx.fillStyle = hex(flagColors[i % 2], 0.7);
          ctx.fillRect(fx, H - (i === 1 ? 95 : 80) - 22, 16, 10);
        });

        // Army dots approaching
        for (let i = 0; i < 20; i++) {
          const ax = 10 + (i % 10) * (W * 0.1);
          const ay = H - 15 - Math.floor(i / 10) * 12;
          ctx.beginPath();
          ctx.arc(ax, ay, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = hex(i < 10 ? C.blue : C.pink, 0.7);
          ctx.fill();
        }

        // Catapult (right side)
        ctx.save();
        ctx.translate(W * 0.88, H - 18);
        ctx.strokeStyle = hex(C.gold, 0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, 0); ctx.lineTo(12, 0);
        ctx.moveTo(0, 0); ctx.lineTo(-5, -18);
        ctx.stroke();
        ctx.restore();
      },

      pvp: function () {
        // Duel scene with lightning effect
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#08101e');
        bg.addColorStop(0.5, '#0c1a35');
        bg.addColorStop(1, '#08101e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Ground reflection
        const gRefl = ctx.createLinearGradient(0, H * 0.65, 0, H);
        gRefl.addColorStop(0, hex(C.blue, 0.06));
        gRefl.addColorStop(1, hex(C.blue, 0));
        ctx.fillStyle = gRefl;
        ctx.fillRect(0, H * 0.65, W, H);

        // Energy clash in center
        const clashX = W / 2;
        const clashY = H * 0.45;
        const clashSize = 25 + 8 * Math.sin(t * 2);
        const clashGlow = ctx.createRadialGradient(clashX, clashY, 0, clashX, clashY, clashSize);
        clashGlow.addColorStop(0, hex(C.white, 0.9));
        clashGlow.addColorStop(0.2, hex(C.pink, 0.7 + 0.2 * Math.sin(t * 3)));
        clashGlow.addColorStop(0.6, hex(C.blue, 0.3));
        clashGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = clashGlow;
        ctx.fillRect(0, 0, W, H);

        // Lightning bolts from clash
        const lightningCount = 6;
        for (let i = 0; i < lightningCount; i++) {
          const angle = (Math.PI * 2 / lightningCount) * i + t * 0.4;
          const len = 20 + rand(5, 20);
          ctx.save();
          ctx.translate(clashX, clashY);
          ctx.rotate(angle);
          ctx.strokeStyle = hex(i % 2 === 0 ? C.blue : C.pink, 0.6 + 0.3 * Math.sin(t * 2 + i));
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          let lx = 0, ly = 0;
          for (let s = 0; s < 3; s++) {
            lx += rand(3, 8);
            ly += rand(-5, 5);
            ctx.lineTo(lx, ly);
          }
          ctx.lineTo(len, 0);
          ctx.stroke();
          ctx.restore();
        }

        // Fighter L (blue)
        const drawFighter = (x, flip, color) => {
          ctx.save();
          ctx.translate(x, H * 0.55);
          if (flip) ctx.scale(-1, 1);
          // Body
          ctx.fillStyle = hex(color, 0.85);
          ctx.fillRect(-5, -40, 10, 35);
          // Head
          ctx.beginPath();
          ctx.arc(0, -48, 9, 0, Math.PI * 2);
          ctx.fill();
          // Legs
          ctx.fillRect(-8, -5, 6, 22);
          ctx.fillRect(2, -5, 6, 22);
          // Sword arm
          ctx.strokeStyle = hex(C.goldLight, 0.9);
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(10, -30);
          ctx.lineTo(30 + 5 * Math.sin(t * 1.5 + x), -15 + 5 * Math.cos(t * 1.5 + x));
          ctx.stroke();
          // Sword glow
          const sx = 30 + 5 * Math.sin(t * 1.5 + x);
          const sy = -15 + 5 * Math.cos(t * 1.5 + x);
          const sGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, 15);
          sGlow.addColorStop(0, hex(color, 0.5));
          sGlow.addColorStop(1, 'transparent');
          ctx.fillStyle = sGlow;
          ctx.beginPath();
          ctx.arc(sx, sy, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        };

        drawFighter(W * 0.28, false, C.blue);
        drawFighter(W * 0.72, true, C.pink);

        // Speed lines
        for (let i = 0; i < 8; i++) {
          const ly = H * 0.3 + i * (H * 0.4 / 8);
          const progress = ((t * 0.3 + i * 0.15) % 1);
          const lx = progress * W;
          ctx.beginPath();
          ctx.moveTo(lx - 30, ly);
          ctx.lineTo(lx, ly);
          ctx.strokeStyle = hex(i % 2 === 0 ? C.blue : C.pink, 0.15);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      },

      solaer: function () {
        // Practice arena / training ground
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0a1428');
        bg.addColorStop(1, '#0d1c3a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Arena circle ground
        const arenaR = Math.min(W, H) * 0.38;
        ctx.strokeStyle = hex(C.blue, 0.15);
        ctx.lineWidth = 1;
        for (let r = arenaR * 0.4; r <= arenaR; r += arenaR * 0.2) {
          ctx.beginPath();
          ctx.arc(W / 2, H * 0.72, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Arena ellipse
        ctx.beginPath();
        ctx.ellipse(W / 2, H * 0.72, arenaR, arenaR * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = hex(C.pink, 0.25 + 0.08 * Math.sin(t));
        ctx.lineWidth = 2;
        ctx.stroke();

        // Central glow
        const cGlow = ctx.createRadialGradient(W / 2, H * 0.5, 0, W / 2, H * 0.5, 90);
        cGlow.addColorStop(0, hex(C.pink, 0.12 + 0.05 * Math.sin(t)));
        cGlow.addColorStop(0.5, hex(C.blue, 0.06));
        cGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = cGlow;
        ctx.fillRect(0, 0, W, H);

        // Sparring fighters (4 positions)
        const positions = [
          { x: W * 0.28, y: H * 0.58, color: C.blue },
          { x: W * 0.38, y: H * 0.63, color: C.pink },
          { x: W * 0.62, y: H * 0.61, color: C.blue },
          { x: W * 0.72, y: H * 0.57, color: C.pink },
        ];
        positions.forEach(({ x, y, color }) => {
          ctx.fillStyle = hex(color, 0.8);
          ctx.beginPath();
          ctx.arc(x, y - 20, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(x - 4, y - 14, 8, 22);
          ctx.fillRect(x - 6, y + 8, 5, 14);
          ctx.fillRect(x + 1, y + 8, 5, 14);
          // Skill effect
          const eff = ctx.createRadialGradient(x, y - 20, 0, x, y - 20, 12);
          eff.addColorStop(0, hex(color, 0.3 * (0.5 + 0.5 * Math.sin(t * 2 + x))));
          eff.addColorStop(1, 'transparent');
          ctx.fillStyle = eff;
          ctx.beginPath();
          ctx.arc(x, y - 20, 12, 0, Math.PI * 2);
          ctx.fill();
        });

        // Instructor at top
        ctx.fillStyle = hex(C.gold, 0.85);
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.28, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(W / 2 - 6, H * 0.37, 12, 32);
        // Aura
        const iaura = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 35);
        iaura.addColorStop(0, hex(C.gold, 0.18 + 0.08 * Math.sin(t)));
        iaura.addColorStop(1, 'transparent');
        ctx.fillStyle = iaura;
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.35, 35, 0, Math.PI * 2);
        ctx.fill();

        // Floating hint text
        ctx.font = '10px "Cinzel", serif';
        ctx.fillStyle = hex(C.white, 0.3);
        ctx.textAlign = 'center';
        ctx.fillText('TRAINING ARENA', W / 2, 16);

        // Lines connecting instructor to fighters
        positions.slice(0, 2).forEach(({ x, y }) => {
          ctx.beginPath();
          ctx.moveTo(W / 2, H * 0.37 + 16);
          ctx.lineTo(x, y - 14);
          ctx.strokeStyle = hex(C.gold, 0.08);
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        });
      },
    };

    function loop() {
      ctx.clearRect(0, 0, W, H);
      if (drawers[type]) drawers[type]();
      t += 0.04;
      requestAnimationFrame(loop);
    }

    loop();
  }

  /* ── Feature Mini Canvases ───────────────────────────────── */
  function drawFeatureCanvas(canvas, type) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let t = 0;

    const drawers = {
      comm: function () {
        // Communication bubbles
        const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
        bg.addColorStop(0, hex(C.rose, 0.5));
        bg.addColorStop(1, hex(C.rose, 0.1));
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        const bubbles = [
          { x: W * 0.3, y: H * 0.35, r: 18, color: C.blue },
          { x: W * 0.68, y: H * 0.3, r: 15, color: C.pink },
          { x: W * 0.5, y: H * 0.62, r: 20, color: C.blue },
        ];
        bubbles.forEach(({ x, y, r, color }, i) => {
          const by = y + 3 * Math.sin(t * 0.8 + i * 1.5);
          ctx.fillStyle = hex(color, 0.85);
          ctx.beginPath();
          ctx.roundRect(x - r, by - r * 0.65, r * 2, r * 1.3, 8);
          ctx.fill();
          ctx.fillStyle = hex(C.white, 0.5);
          for (let j = 0; j < 3; j++) {
            ctx.beginPath();
            ctx.arc(x - 8 + j * 8, by, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Center icon
        ctx.font = '22px serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💬', W / 2, H / 2);
      },

      lesson: function () {
        // Book + sword
        const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
        bg.addColorStop(0, hex(C.blue, 0.15));
        bg.addColorStop(1, hex(C.blue, 0.03));
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Book
        ctx.fillStyle = hex(C.blue, 0.8);
        ctx.beginPath();
        ctx.roundRect(W * 0.22, H * 0.25, 34, 50, 3);
        ctx.fill();
        ctx.fillStyle = hex(C.blueLight, 0.6);
        ctx.beginPath();
        ctx.roundRect(W * 0.54, H * 0.22, 34, 50, 3);
        ctx.fill();
        // Spine
        ctx.fillStyle = hex(C.blueDark, 0.9);
        ctx.fillRect(W * 0.47, H * 0.22, 8, 50);

        // Sword diagonal
        const sx = 25, ex = W - 25, sy = H - 25, ey = 22;
        const swGrad = ctx.createLinearGradient(sx, sy, ex, ey);
        swGrad.addColorStop(0, hex(C.gold, 0.9));
        swGrad.addColorStop(1, hex(C.goldLight, 0.9));
        ctx.strokeStyle = swGrad;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        // Cross guard
        const mx = (sx + ex) / 2, my = (sy + ey) / 2;
        const perp = { x: -(ey - sy), y: (ex - sx) };
        const pl = Math.sqrt(perp.x ** 2 + perp.y ** 2);
        ctx.strokeStyle = hex(C.gold, 0.7);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(mx - (perp.x / pl) * 12, my - (perp.y / pl) * 12);
        ctx.lineTo(mx + (perp.x / pl) * 12, my + (perp.y / pl) * 12);
        ctx.stroke();

        // Glow pulse
        const sg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 40);
        sg.addColorStop(0, hex(C.gold, 0.15 + 0.08 * Math.sin(t)));
        sg.addColorStop(1, 'transparent');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
      },

      warm: function () {
        // Warm campfire / heart
        const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W/2);
        bg.addColorStop(0, hex(C.pink, 0.2));
        bg.addColorStop(1, hex(C.rose, 0.05));
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Heart shape
        const hx = W / 2, hy = H / 2 + 5;
        const hs = 28 + 2 * Math.sin(t * 1.5);
        ctx.save();
        ctx.translate(hx, hy);
        ctx.fillStyle = hex(C.pink, 0.85);
        ctx.beginPath();
        ctx.moveTo(0, hs * 0.25);
        ctx.bezierCurveTo(0, -hs * 0.1, -hs, -hs * 0.1, -hs, hs * 0.35);
        ctx.bezierCurveTo(-hs, hs * 0.7, 0, hs, 0, hs);
        ctx.bezierCurveTo(0, hs, hs, hs * 0.7, hs, hs * 0.35);
        ctx.bezierCurveTo(hs, -hs * 0.1, 0, -hs * 0.1, 0, hs * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Aura
        const ha = ctx.createRadialGradient(hx, hy + 14, 0, hx, hy + 14, 50 + 5 * Math.sin(t));
        ha.addColorStop(0, hex(C.pink, 0.2 + 0.1 * Math.sin(t * 2)));
        ha.addColorStop(1, 'transparent');
        ctx.fillStyle = ha;
        ctx.beginPath();
        ctx.arc(hx, hy + 14, 50, 0, Math.PI * 2);
        ctx.fill();

        // Sparkles
        for (let i = 0; i < 5; i++) {
          const a = (Math.PI * 2 / 5) * i + t * 0.5;
          const sr = 42;
          const sx = hx + Math.cos(a) * sr;
          const sy = hy + 10 + Math.sin(a) * sr * 0.6;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = hex(C.pink, 0.5 + 0.3 * Math.sin(t * 2 + i));
          ctx.fill();
        }
      },
    };

    function loop() {
      ctx.clearRect(0, 0, W, H);
      if (drawers[type]) drawers[type]();
      t += 0.04;
      requestAnimationFrame(loop);
    }

    loop();
  }

  /* ── Join Section Canvas ─────────────────────────────────── */
  (function initJoinCanvas() {
    const canvas = document.getElementById('join-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, t = 0;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);

      // Constellation-like stars connected by lines
      const starCount = 25;
      const stars = Array.from({ length: starCount }, (_, i) => ({
        x: ((i * 137.5) % 100) / 100 * W,
        y: ((i * 97.3 + 30) % 100) / 100 * H,
        r: 1 + (i % 3) * 0.5,
      }));

      // Draw connections
      stars.forEach((s, i) => {
        stars.forEach((s2, j) => {
          if (j <= i) return;
          const dx = s.x - s2.x, dy = s.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < W * 0.22) {
            ctx.strokeStyle = hex(C.blue, (1 - dist / (W * 0.22)) * 0.15);
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        });
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = hex(i % 3 === 0 ? C.pink : C.blueLight, 0.35 + 0.15 * Math.sin(t + i));
        ctx.fill();
      });

      t += 0.02;
      requestAnimationFrame(frame);
    }

    resize();
    frame();
    window.addEventListener('resize', () => {
      resize();
    }, { passive: true });
  })();

  /* ── Scroll Animations ───────────────────────────────────── */
  function initScrollAnimations() {
    // Activity cards
    const activityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const index = parseInt(card.dataset.index, 10) || 0;
          setTimeout(() => card.classList.add('visible'), index * 120);
          activityObserver.unobserve(card);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.activity-card').forEach(card => {
      activityObserver.observe(card);
    });

    // Feature items
    const featureObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('revealed'), i * 180);
          featureObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.feature-item').forEach(item => {
      featureObserver.observe(item);
    });
  }

  /* ── Stat Counter Animation ──────────────────────────────── */
  function initStatCounters() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1400;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
      observer.observe(el);
    });
  }

  /* ── Initialize All Canvases ─────────────────────────────── */
  function initActivityCanvases() {
    document.querySelectorAll('.activity-canvas').forEach(canvas => {
      const type = canvas.dataset.type;
      const ro = new ResizeObserver(() => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      });
      ro.observe(canvas.parentElement);
      drawActivityCanvas(canvas, type);
    });
  }

  function initFeatureCanvases() {
    document.querySelectorAll('.feature-canvas').forEach(canvas => {
      const type = canvas.dataset.type;
      drawFeatureCanvas(canvas, type);
    });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  function _bootHome() {
    drawCrest();
    initScrollAnimations();
    initStatCounters();
    initActivityCanvases();
    initFeatureCanvases();
    _initGalleryPreview();
    _initScheduleTeaser();
    _initHeroScrollLock();
  }
  // SPA: ルーターから呼ばれる
  window.initHome = _bootHome;
  // 通常ロード時（SPA以外）の互換
  if (!window.__SPA__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', _bootHome);
    } else {
      _bootHome();
    }
  }

})();

/* ── Gallery Preview Canvases (index.html) ──────────────── */
function _initGalleryPreview() {
  document.querySelectorAll('.gp-item').forEach(item => {
    const img = item.querySelector('.gp-img');
    const canvas = item.querySelector('.gp-canvas.gp-fallback');
    if (!canvas) return;

    function showFallback() {
      if (img) img.style.display = 'none';
      canvas.style.display = 'block';
      const scene = canvas.dataset.scene;
      if (scene && window.BDOImages && BDOImages.scenes[scene]) {
        BDOImages.scenes[scene](canvas);
      }
    }

    if (!img || !img.src || img.src === window.location.href || img.getAttribute('src') === '') {
      showFallback();
    } else {
      img.addEventListener('error', showFallback);
      img.addEventListener('load', () => {
        canvas.style.display = 'none';
        img.style.display = 'block';
      });
    }
  });
}

/* ── Schedule Teaser reveal ─────────────────────────────── */
function _initScheduleTeaser() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add('revealed'), i * 120);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.st-card').forEach(el => io.observe(el));
}

/* ── Hero Scroll Lock ───────────────────────────────────── */
function _initHeroScrollLock() {
  const btn = document.getElementById('hero-scroll-btn');
  if (!btn) return;

  /* 初回アクセス時のみロック（別ページから戻った場合はロックしない） */
  if (sessionStorage.getItem('hero_unlocked')) return;
  document.body.classList.add('hero-locked');

  /* ボタンを押したら解除してaboutへスクロール */
  btn.addEventListener('click', _unlockHeroScroll);

  /* タッチ操作（スワイプ上）でも解除 */
  let touchStartY = 0;
  document.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true, once: false });
  document.addEventListener('touchmove', function onTouchMove(e) {
    const dy = touchStartY - e.touches[0].clientY;
    if (dy > 40) { /* 40px以上上スワイプで解除 */
      _unlockHeroScroll();
      document.removeEventListener('touchmove', onTouchMove);
    }
  }, { passive: true });
}

function _unlockHeroScroll() {
  if (!document.body.classList.contains('hero-locked')) return;
  document.body.classList.remove('hero-locked');
  sessionStorage.setItem('hero_unlocked', '1');
  const about = document.getElementById('about');
  if (about) about.scrollIntoView({ behavior: 'smooth' });
}

/* ── Scroll Button Canvas（幾何学桜＋下矢印） ─────────────── */
function _initScrollBtnCanvas() {
  const canvas = document.getElementById('scroll-btn-canvas');
  if (!canvas) return;
  if (canvas._rafId) cancelAnimationFrame(canvas._rafId);

  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2;
  let t = 0;

  /* 角丸ポリゴン */
  function roundedPoly(pts, r) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const prev = pts[(i - 1 + pts.length) % pts.length];
      const curr = pts[i];
      const next = pts[(i + 1) % pts.length];
      const d1x = curr.x - prev.x, d1y = curr.y - prev.y;
      const d2x = next.x - curr.x, d2y = next.y - curr.y;
      const l1 = Math.hypot(d1x, d1y), l2 = Math.hypot(d2x, d2y);
      const rc = Math.min(r, l1 / 2, l2 / 2);
      const t1x = curr.x - (d1x / l1) * rc, t1y = curr.y - (d1y / l1) * rc;
      const t2x = curr.x + (d2x / l2) * rc, t2y = curr.y + (d2y / l2) * rc;
      i === 0 ? ctx.moveTo(t1x, t1y) : ctx.lineTo(t1x, t1y);
      ctx.quadraticCurveTo(curr.x, curr.y, t2x, t2y);
    }
    ctx.closePath();
  }

  /* 幾何学花びら1枚 */
  function geoPetal(x, y, w, h, rot, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y); ctx.rotate(rot);
    const g = ctx.createLinearGradient(0, -h, 0, h);
    g.addColorStop(0,   '#fde0ee');
    g.addColorStop(0.5, '#e8609a');
    g.addColorStop(1,   '#fde0ee');
    ctx.fillStyle = g;
    const pts = [
      { x:  0,        y: -h        },
      { x:  w * 0.28, y: -h * 0.28 },
      { x:  w,        y:  0        },
      { x:  w * 0.28, y:  h * 0.28 },
      { x:  0,        y:  h        },
      { x: -w * 0.28, y:  h * 0.28 },
      { x: -w,        y:  0        },
      { x: -w * 0.28, y: -h * 0.28 },
    ];
    roundedPoly(pts, w * 0.55);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth   = 0.6;
    ctx.beginPath(); ctx.moveTo(0, -h * 0.8); ctx.lineTo(0, h * 0.8); ctx.stroke();
    ctx.restore();
  }

  /* 幾何学花芯（角丸六角形） */
  function geoCentral(x, y, r, rot) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r };
    });
    roundedPoly(pts, r * 0.3);
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    cg.addColorStop(0, '#fff8e0'); cg.addColorStop(0.6, '#f8d060'); cg.addColorStop(1, 'rgba(240,160,40,0)');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.restore();
  }

  /* 幾何学下矢印（ダイヤ型を2段） */
  function drawArrow(x, y, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    /* 上のダイヤ */
    const pts1 = [
      { x: 0,      y: -size * 0.3 },
      { x:  size,  y:  size * 0.5 },
      { x: 0,      y:  size       },
      { x: -size,  y:  size * 0.5 },
    ];
    roundedPoly(pts1, size * 0.28);
    const g1 = ctx.createLinearGradient(0, -size * 0.3, 0, size);
    g1.addColorStop(0, 'rgba(247,180,210,0.9)');
    g1.addColorStop(1, 'rgba(227,100,154,0.3)');
    ctx.fillStyle = g1;
    ctx.fill();
    /* 下の小ダイヤ */
    ctx.globalAlpha = alpha * 0.5;
    const s2 = size * 0.55;
    const pts2 = [
      { x: 0,   y: size * 1.1 - s2 * 0.3 },
      { x:  s2, y: size * 1.1 + s2 * 0.5  },
      { x: 0,   y: size * 1.1 + s2        },
      { x: -s2, y: size * 1.1 + s2 * 0.5  },
    ];
    roundedPoly(pts2, s2 * 0.28);
    ctx.fillStyle = 'rgba(247,180,210,0.6)';
    ctx.fill();
    ctx.restore();
  }

  const textY   = 16;  /* 「詳しく見る」テキストY */
  const sakuraCY = 88;  /* 桜の中心Y（十分下げて収める） */
  const arrowCY  = 128; /* 矢印Y */

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    ctx.clip();

    const pulse = 0.7 + 0.3 * Math.sin(t * 1.5);

    /* ── テキスト「詳しく見る」（大きく・上に） ── */
    ctx.save();
    ctx.font         = `600 15px 'Noto Serif JP', serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = `rgba(249,200,222,${0.85 + 0.15 * Math.sin(t)})`;
    ctx.shadowColor  = 'rgba(227,145,177,1)';
    ctx.shadowBlur   = 8;
    ctx.fillText('詳しく見る', cx, textY);
    ctx.restore();

    /* ── 桜1輪（小さめ・中央） ── */
    const pd = 12, pw = 5, ph = 10;
    const br = t * 0.2 - Math.PI / 2;
    for (let i = 0; i < 5; i++) {
      const a = br + (Math.PI * 2 / 5) * i;
      geoPetal(
        cx + Math.cos(a) * pd,
        sakuraCY + Math.sin(a) * pd,
        pw, ph, a + Math.PI / 2, 0.88
      );
    }
    /* 花びら間の小ダイヤ削除済み */
    geoCentral(cx, sakuraCY, 5, t * 0.3);

    /* ── 下矢印（バウンス・下） ── */
    const bounce = 3 * Math.sin(t * 1.8);
    drawArrow(cx, arrowCY + bounce, 8, pulse);

    t += 0.035;
    ctx.restore();
    canvas._rafId = requestAnimationFrame(frame);
  }
  canvas._rafId = requestAnimationFrame(frame);
}

/* ============================================================
   COUNTRY Guild — images.js
   Shared Canvas drawing library.
   All "images" are generated programmatically in the BDO
   art-style: dark fantasy + pink warmth palette.
   ============================================================ */

window.BDOImages = (function () {
  'use strict';

  /* palette */
  const P = {
    blue:    '#345DB0', blueDark:'#1e3a72', blueLight:'#4d7dce',
    pink:    '#E391B1', pinkDark:'#c0437a', rose:'#E8D7DD',
    white:   '#FFFFFF', gold:'#c9a84c',     goldL:'#e8c97a',
    dark:    '#0d0818', darkPurple:'#1a0828',
  };
  const hex = (c, a = 1) => {
    const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  };
  const rand = (a, b) => Math.random() * (b - a) + a;

  /* ── Generic scene factory ────────────────────────────── */
  function makeScene(drawFn) {
    return function (canvas) {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const W = canvas.width  || canvas.offsetWidth  || 800;
      const H = canvas.height || canvas.offsetHeight || 450;
      canvas.width = W; canvas.height = H;
      let t = 0, rafId;
      function frame() {
        ctx.clearRect(0,0,W,H);
        drawFn(ctx, W, H, t);
        t += 0.04;
        rafId = requestAnimationFrame(frame);
      }
      frame();
      return () => cancelAnimationFrame(rafId);
    };
  }

  /* ── Shared helpers ───────────────────────────────────── */
  function skyGrad(ctx, W, H, top, bot) {
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  }

  function stars(ctx, W, H, count, t) {
    for (let i = 0; i < count; i++) {
      const sx = ((i*137.5)%100)/100*W;
      const sy = ((i*73.1+10)%60)/100*H;
      const a  = 0.2 + 0.4*Math.sin(t*0.5+i);
      ctx.beginPath(); ctx.arc(sx,sy,0.8,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
    }
  }

  function moon(ctx, x, y, r, t) {
    const g = ctx.createRadialGradient(x,y,0,x,y,r*3);
    g.addColorStop(0, hex(P.rose, 0.25+0.05*Math.sin(t)));
    g.addColorStop(1,'transparent');
    ctx.fillStyle = g; ctx.fillRect(x-r*3,y-r*3,r*6,r*6);
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = hex(P.rose,0.88); ctx.fill();
  }

  function treeLine(ctx, W, H, y, color, count) {
    for (let i = 0; i < count; i++) {
      const tx = (i/(count-1))*W;
      const th = rand(30,65);
      const tw = rand(8,18);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(tx, y);
      ctx.lineTo(tx-tw/2, y-th*0.4);
      ctx.lineTo(tx-tw/4, y-th*0.4);
      ctx.lineTo(tx-tw/3, y-th*0.7);
      ctx.lineTo(tx-tw/5, y-th*0.7);
      ctx.lineTo(tx, y-th);
      ctx.lineTo(tx+tw/5, y-th*0.7);
      ctx.lineTo(tx+tw/3, y-th*0.7);
      ctx.lineTo(tx+tw/4, y-th*0.4);
      ctx.lineTo(tx+tw/2, y-th*0.4);
      ctx.closePath(); ctx.fill();
    }
  }

  function groundFog(ctx, W, H, y, color, a) {
    const g = ctx.createLinearGradient(0, y-40, 0, H);
    g.addColorStop(0,'transparent');
    g.addColorStop(0.3, hex(color, a));
    g.addColorStop(1, hex(color, a*0.6));
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  }

  /* ─────────────────────────────────────────────────────── */
  /*  SCENE DEFINITIONS                                       */
  /* ─────────────────────────────────────────────────────── */

  /* 1. LANDSCAPE — Heidel Outskirts at dusk */
  const heidel = makeScene((ctx, W, H, t) => {
    // Sky
    const sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#140820');
    sky.addColorStop(0.45,'#2d1040');
    sky.addColorStop(0.75,'#4a2060');
    sky.addColorStop(1,'#2a0a30');
    ctx.fillStyle = sky; ctx.fillRect(0,0,W,H);
    stars(ctx,W,H,80,t);
    moon(ctx, W*0.75, H*0.18, 26, t);

    // Distant mountains
    ctx.fillStyle = hex('#1e0a28', 0.85);
    ctx.beginPath();
    ctx.moveTo(0, H*0.52);
    [0,0.1,0.18,0.28,0.38,0.5,0.6,0.72,0.82,0.9,1].forEach((x,i,arr) => {
      const peak = (i%2===0) ? H*0.3 : H*0.42;
      ctx.lineTo(x*W, peak);
    });
    ctx.lineTo(W, H*0.52); ctx.lineTo(0, H*0.52); ctx.closePath(); ctx.fill();

    // Middle trees
    treeLine(ctx, W, H, H*0.62, hex('#15082a',0.9), 18);
    treeLine(ctx, W, H, H*0.68, hex('#1c0d34',0.9), 24);

    // Ground
    const ground = ctx.createLinearGradient(0, H*0.68, 0, H);
    ground.addColorStop(0,'#1a0828'); ground.addColorStop(1,'#120618');
    ctx.fillStyle = ground; ctx.fillRect(0, H*0.68, W, H);

    // Pink fog
    groundFog(ctx, W, H, H*0.72, P.pink, 0.08 + 0.03*Math.sin(t*0.5));

    // Fireflies
    for (let i = 0; i < 18; i++) {
      const fx = ((i*73.9 + t*8)%W);
      const fy = H*0.58 + (i%5)*14 + 4*Math.sin(t+i);
      const fa = 0.3 + 0.5*Math.sin(t*1.5+i);
      ctx.beginPath(); ctx.arc(fx,fy,1.5,0,Math.PI*2);
      ctx.fillStyle = `rgba(227,200,150,${fa})`; ctx.fill();
    }

    // Silhouette: two adventurers
    [[W*0.38, H*0.72, 28],[W*0.44, H*0.74, 24]].forEach(([x,y,h]) => {
      ctx.fillStyle = hex('#0d0618', 0.92);
      ctx.fillRect(x-4, y-h, 8, h);
      ctx.beginPath(); ctx.arc(x, y-h-8, 6, 0, Math.PI*2); ctx.fill();
    });

    // Vignette
    const vig = ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
    vig.addColorStop(0,'transparent'); vig.addColorStop(1,'rgba(10,2,18,0.55)');
    ctx.fillStyle = vig; ctx.fillRect(0,0,W,H);

    // Title watermark
    ctx.font = `${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle = `rgba(227,145,177,0.18)`;
    ctx.textAlign = 'right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 2. GUILD MEMBERS — party gathering scene */
  const partyScene = makeScene((ctx, W, H, t) => {
    skyGrad(ctx, W, H, '#120820','#1e1040');
    stars(ctx,W,H,50,t);

    // Bonfire center
    const bx = W/2, by = H*0.72;
    // Glow
    const glow = ctx.createRadialGradient(bx,by,0,bx,by,120);
    glow.addColorStop(0,`rgba(255,140,40,${0.35+0.1*Math.sin(t*2)})`);
    glow.addColorStop(0.4,`rgba(200,80,20,0.1)`);
    glow.addColorStop(1,'transparent');
    ctx.fillStyle = glow; ctx.fillRect(0,0,W,H);
    // Logs
    ctx.strokeStyle = hex('#5c3010',0.9); ctx.lineWidth=5;
    ctx.beginPath(); ctx.moveTo(bx-20,by); ctx.lineTo(bx+20,by-18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx+20,by); ctx.lineTo(bx-20,by-18); ctx.stroke();
    // Flames
    for (let f = 0; f < 6; f++) {
      const fa = (f/6)*Math.PI*2 + t;
      const fr = 10 + 4*Math.sin(t*3+f);
      const fx = bx + Math.cos(fa)*fr*0.4;
      const fy = by - 20 - fr - 5*Math.sin(t*2+f);
      const fc = ctx.createRadialGradient(fx,fy,0,fx,fy,fr);
      fc.addColorStop(0,`rgba(255,220,80,${0.9-f*0.1})`);
      fc.addColorStop(0.5,`rgba(255,80,20,0.5)`);
      fc.addColorStop(1,'transparent');
      ctx.fillStyle = fc;
      ctx.beginPath(); ctx.arc(fx,fy,fr,0,Math.PI*2); ctx.fill();
    }

    // Six adventurer silhouettes around fire
    const positions = [
      {x:W*0.25,r:0}, {x:W*0.35,r:0.1}, {x:W*0.45,r:-0.05},
      {x:W*0.55,r:0.08}, {x:W*0.65,r:0}, {x:W*0.75,r:-0.1},
    ];
    positions.forEach(({x,r},i) => {
      const gy = H*0.73 + 3*Math.sin(t*0.6+i);
      const gh = 28 + (i%2)*6;
      ctx.save(); ctx.translate(x, gy);
      ctx.fillStyle = hex('#0d0618', 0.9);
      ctx.fillRect(-5,-gh,10,gh);
      ctx.beginPath(); ctx.arc(0,-gh-8,7,0,Math.PI*2); ctx.fill();
      // weapon glint
      ctx.strokeStyle = hex(P.goldL, 0.6+0.3*Math.sin(t+i));
      ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(6,-gh+4); ctx.lineTo(18,-gh-10); ctx.stroke();
      ctx.restore();
    });

    // Ground
    const gr = ctx.createLinearGradient(0,H*0.73,0,H);
    gr.addColorStop(0,'#1a0828'); gr.addColorStop(1,'#0d0414');
    ctx.fillStyle = gr; ctx.fillRect(0,H*0.73,W,H);
    groundFog(ctx,W,H,H*0.75,P.pink,0.05+0.02*Math.sin(t));

    ctx.font = `${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle = `rgba(227,145,177,0.18)`;
    ctx.textAlign = 'right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 3. MEDIEVAL TOWN — Calpheon night */
  const calpheon = makeScene((ctx, W, H, t) => {
    skyGrad(ctx,W,H,'#0a0618','#1e0a35');
    stars(ctx,W,H,90,t);
    moon(ctx, W*0.2, H*0.14, 20, t);

    // Building silhouettes
    const buildings = [
      {x:0,    w:80,  h:180, win:[[20,60],[50,60],[20,100],[50,100]]},
      {x:70,   w:60,  h:140, win:[[15,50],[35,50]]},
      {x:120,  w:100, h:220, win:[[20,60],[60,60],[20,110],[60,110],[20,160],[60,160]], spire:true},
      {x:210,  w:70,  h:160, win:[[15,55],[40,55],[15,95]]},
      {x:270,  w:90,  h:190, win:[[18,65],[50,65],[18,105],[50,105]]},
      {x:350,  w:65,  h:145},
      {x:405,  w:110, h:200, win:[[20,70],[60,70],[20,120],[60,120],[20,170]], spire:true},
      {x:505,  w:70,  h:155, win:[[15,55],[40,55],[15,95],[40,95]]},
      {x:565,  w:85,  h:175, win:[[15,60],[48,60],[15,100]]},
    ];
    const bScale = W / 650;
    buildings.forEach(b => {
      const bx = b.x*bScale, bw = b.w*bScale, bh = b.h*(H/450)*0.55;
      const by = H - bh;
      ctx.fillStyle = hex('#120820',0.95);
      ctx.fillRect(bx, by, bw, bh);
      if (b.spire) {
        ctx.fillStyle = hex('#0d0618',0.95);
        ctx.beginPath();
        ctx.moveTo(bx+bw/2, by-bh*0.22);
        ctx.lineTo(bx+bw*0.15, by);
        ctx.lineTo(bx+bw*0.85, by);
        ctx.closePath(); ctx.fill();
      }
      // Windows
      (b.win || []).forEach(([wx,wy]) => {
        const wwx = bx + wx*bScale, wwy = by + wy*(H/450)*0.55;
        const a = 0.5 + 0.3*Math.sin(t*0.4 + wx*0.1 + wy*0.07);
        ctx.fillStyle = `rgba(200,160,60,${a})`;
        ctx.fillRect(wwx, wwy, 7*bScale, 9*(H/450)*0.55);
      });
    });

    // Street lamps
    [0.15,0.35,0.55,0.75,0.9].forEach((lx, i) => {
      const lampX = lx*W, lampY = H - H*0.22;
      const la = 0.6 + 0.2*Math.sin(t*0.7+i);
      const lg = ctx.createRadialGradient(lampX, lampY-10, 0, lampX, lampY-10, 50);
      lg.addColorStop(0, `rgba(220,180,80,${la*0.45})`);
      lg.addColorStop(1,'transparent');
      ctx.fillStyle = lg; ctx.fillRect(lampX-50,lampY-60,100,80);
      ctx.strokeStyle = hex('#4a3010',0.8); ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(lampX, lampY); ctx.lineTo(lampX, lampY-40); ctx.stroke();
      ctx.beginPath(); ctx.arc(lampX, lampY-42, 5, 0, Math.PI*2);
      ctx.fillStyle = `rgba(220,180,80,${la})`; ctx.fill();
    });

    // Ground
    const gr = ctx.createLinearGradient(0, H*0.78, 0, H);
    gr.addColorStop(0,'#150a22'); gr.addColorStop(1,'#0a0614');
    ctx.fillStyle = gr; ctx.fillRect(0, H*0.78, W, H);
    groundFog(ctx,W,H,H*0.8,P.pink,0.06);

    // Passerby silhouettes
    [[0.3,0],[0.6,0.5],[0.8,0.3]].forEach(([px,po]) => {
      const sx = ((px + t*0.008)%1)*W, sy = H - H*0.18;
      const sh = H*0.11;
      ctx.fillStyle = hex('#0d0618',0.85);
      ctx.fillRect(sx-4, sy-sh, 8, sh);
      ctx.beginPath(); ctx.arc(sx, sy-sh-7, 6, 0, Math.PI*2); ctx.fill();
    });

    ctx.font = `${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle = 'rgba(227,145,177,0.18)';
    ctx.textAlign = 'right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 4. BATTLE — Node war excitement */
  const nodwar = makeScene((ctx, W, H, t) => {
    skyGrad(ctx,W,H,'#1a0808','#2a0a0a');
    // Embers/sparks rain
    for (let i = 0; i < 30; i++) {
      const ex = ((i*89.3+t*18)%W);
      const ey = ((i*61.7 + t*12)%H);
      const ea = 0.4 + 0.4*Math.sin(t*2+i);
      ctx.beginPath(); ctx.arc(ex,ey,1.2,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,${120+i*3},40,${ea})`; ctx.fill();
    }
    // Castle silhouette
    const castleX = W*0.35, castleW = W*0.3, castleH = H*0.55;
    const cy = H - castleH;
    ctx.fillStyle = hex('#1a0808',0.95);
    ctx.fillRect(castleX, cy, castleW, castleH);
    // Towers
    [[0,1.1],[0.42,1.25],[0.87,1.1]].forEach(([tx,th]) => {
      const twx = castleX+tx*castleW;
      ctx.fillStyle = hex('#150606',0.95);
      ctx.fillRect(twx-14, cy-castleH*th*0.18, 28, castleH*th*0.18);
      for (let b = 0; b < 4; b++)
        ctx.fillRect(twx-12+b*7, cy-castleH*th*0.18-8, 5, 8);
    });
    // Gate arch
    ctx.fillStyle = hex('#0a0408',1);
    ctx.beginPath();
    ctx.arc(castleX+castleW/2, cy+castleH*0.25, 22, Math.PI, 0);
    ctx.rect(castleX+castleW/2-22, cy+castleH*0.25, 44, 35);
    ctx.fill();
    // Siege explosion
    const ex2 = W*0.65 + 20*Math.sin(t*0.3);
    const explR = 35 + 15*Math.abs(Math.sin(t*1.5));
    const expl = ctx.createRadialGradient(ex2, H*0.45, 0, ex2, H*0.45, explR);
    expl.addColorStop(0,`rgba(255,220,80,${0.9})`);
    expl.addColorStop(0.3,`rgba(255,80,20,0.6)`);
    expl.addColorStop(1,'transparent');
    ctx.fillStyle = expl; ctx.fillRect(0,0,W,H);
    // Armies
    for (let i = 0; i < 12; i++) {
      const ax = W*0.05 + i*(W*0.18/12), ay = H*0.78;
      ctx.fillStyle = hex(P.blue,0.85);
      ctx.fillRect(ax-3, ay-20, 6, 20);
      ctx.beginPath(); ctx.arc(ax, ay-26, 5,0,Math.PI*2); ctx.fill();
    }
    for (let i = 0; i < 10; i++) {
      const ax = W*0.75 + i*(W*0.2/10), ay = H*0.78;
      ctx.fillStyle = hex(P.pink,0.85);
      ctx.fillRect(ax-3,ay-18,6,18);
      ctx.beginPath(); ctx.arc(ax,ay-24,5,0,Math.PI*2); ctx.fill();
    }
    // Ground
    const gr = ctx.createLinearGradient(0,H*0.78,0,H);
    gr.addColorStop(0,'#200a08'); gr.addColorStop(1,'#100504');
    ctx.fillStyle = gr; ctx.fillRect(0,H*0.78,W,H);
    groundFog(ctx,W,H,H*0.8,'#ff4400',0.05);

    ctx.font = `${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle='rgba(227,145,177,0.18)'; ctx.textAlign='right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 5. CHERRY BLOSSOM — guild chill scene (spring) */
  const blossom = makeScene((ctx, W, H, t) => {
    // Twilight sky
    const sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#1a1030');
    sky.addColorStop(0.5,'#3a1850');
    sky.addColorStop(1,'#5a2060');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    stars(ctx,W,H,60,t);
    moon(ctx, W*0.8, H*0.15, 22, t);

    // Big cherry blossom tree silhouette
    ctx.fillStyle=hex('#0d0618',0.92);
    ctx.fillRect(W*0.18-8, H*0.3, 16, H*0.7); // trunk
    // Branches
    const branches = [[W*0.18,H*0.3,-0.8],[W*0.18,H*0.38,0.6],[W*0.18,H*0.45,-0.5]];
    branches.forEach(([bx,by,ang]) => {
      ctx.save(); ctx.translate(bx,by); ctx.rotate(ang);
      ctx.strokeStyle=hex('#0d0618',0.9); ctx.lineWidth=8;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(80,0); ctx.stroke();
      ctx.restore();
    });

    // Pink blossom clouds
    for (let i = 0; i < 120; i++) {
      const bx = W*0.08 + (i%12)*W*0.12 + rand(-20,20);
      const by = H*0.18 + (i%10)*H*0.05 + rand(-15,15) + 4*Math.sin(t*0.3+i);
      const ba = 0.25 + 0.15*Math.sin(t*0.5+i*0.3);
      const br = rand(5,14);
      ctx.beginPath(); ctx.arc(bx,by,br,0,Math.PI*2);
      ctx.fillStyle = `rgba(227,145,177,${ba})`; ctx.fill();
    }

    // Falling petals
    for (let i = 0; i < 40; i++) {
      const px = ((i*97.3+t*15)%W);
      const py = ((i*61.3+t*(5+i%3))%H);
      const pa = 0.4 + 0.3*Math.sin(t+i);
      ctx.save(); ctx.translate(px,py); ctx.rotate(t+i);
      ctx.beginPath();
      ctx.ellipse(0,0,4,2.5,0,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,180,210,${pa})`; ctx.fill();
      ctx.restore();
    }

    // Lake reflection
    const lake = ctx.createLinearGradient(0,H*0.65,0,H);
    lake.addColorStop(0,'#200a30'); lake.addColorStop(1,'#150620');
    ctx.fillStyle=lake; ctx.fillRect(0,H*0.65,W,H);
    // Shimmer
    for (let i = 0; i < 8; i++) {
      const sx = W*0.2 + i*(W*0.08);
      const sy = H*0.78 + 4*Math.sin(t*0.8+i);
      ctx.strokeStyle=`rgba(240,180,210,${0.1+0.08*Math.sin(t+i)})`;
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+30,sy+2); ctx.stroke();
    }

    groundFog(ctx,W,H,H*0.67,P.pink,0.1+0.04*Math.sin(t*0.4));

    // Seated figures
    [[W*0.42,H*0.7],[W*0.52,H*0.71]].forEach(([fx,fy]) => {
      ctx.fillStyle=hex('#0d0618',0.85);
      ctx.beginPath(); ctx.arc(fx,fy-8,7,0,Math.PI*2); ctx.fill();
      ctx.fillRect(fx-5,fy-8,10,14);
    });

    ctx.font=`${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle='rgba(227,145,177,0.18)'; ctx.textAlign='right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 6. DUNGEON — dark cave with glowing crystals */
  const dungeon = makeScene((ctx, W, H, t) => {
    skyGrad(ctx,W,H,'#080410','#0d0820');

    // Cave walls
    ctx.fillStyle = hex('#080412',0.95);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(0,H*0.6);
    ctx.quadraticCurveTo(W*0.1,H*0.25,W*0.22,H*0.3);
    ctx.lineTo(W*0.3,H*0.15);
    ctx.lineTo(W*0.4,H*0.28);
    ctx.lineTo(W*0.5,H*0.1);
    ctx.lineTo(W*0.6,H*0.25);
    ctx.lineTo(W*0.7,H*0.12);
    ctx.lineTo(W*0.82,H*0.3);
    ctx.quadraticCurveTo(W*0.92,H*0.22,W,H*0.55);
    ctx.lineTo(W,0); ctx.closePath(); ctx.fill();

    // Crystal clusters
    const crystals = [
      {x:W*0.15,y:H*0.52,c:P.pink},  {x:W*0.25,y:H*0.58,c:P.blue},
      {x:W*0.7, y:H*0.5, c:P.pink},  {x:W*0.82,y:H*0.56,c:P.blueLight},
      {x:W*0.5, y:H*0.62,c:P.pink},
    ];
    crystals.forEach(({x,y,c},i) => {
      const ca = 0.6 + 0.3*Math.sin(t*0.8+i*1.2);
      const cg = ctx.createRadialGradient(x,y,0,x,y,35);
      cg.addColorStop(0,hex(c,ca*0.5)); cg.addColorStop(1,'transparent');
      ctx.fillStyle=cg; ctx.fillRect(x-35,y-35,70,70);
      // Crystal shape
      for (let j = 0; j < 3; j++) {
        ctx.save(); ctx.translate(x+j*12-12, y);
        ctx.rotate(Math.sin(t*0.2+j)*0.08);
        ctx.fillStyle=hex(c,ca);
        ctx.beginPath();
        ctx.moveTo(0,-22); ctx.lineTo(6,0); ctx.lineTo(0,10); ctx.lineTo(-6,0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    });

    // Floor
    const fl = ctx.createLinearGradient(0,H*0.62,0,H);
    fl.addColorStop(0,'#100820'); fl.addColorStop(1,'#080412');
    ctx.fillStyle=fl; ctx.fillRect(0,H*0.62,W,H);

    // Torches on walls
    [[W*0.35,H*0.35],[W*0.65,H*0.32]].forEach(([tx,ty],i) => {
      const ta = 0.7+0.2*Math.sin(t*3+i);
      const tg = ctx.createRadialGradient(tx,ty,0,tx,ty,45);
      tg.addColorStop(0,`rgba(255,160,40,${ta*0.5})`); tg.addColorStop(1,'transparent');
      ctx.fillStyle=tg; ctx.fillRect(tx-45,ty-45,90,90);
      ctx.fillStyle=hex('#4a3010',0.9); ctx.fillRect(tx-3,ty,6,18);
      ctx.fillStyle=`rgba(255,180,60,${ta})`;
      ctx.beginPath(); ctx.arc(tx,ty-4,5,0,Math.PI*2); ctx.fill();
    });

    // Adventurer party ahead
    for (let i=0;i<4;i++) {
      const ax=W*0.38+i*W*0.07, ay=H*0.73;
      const ah=20+i%2*4;
      ctx.fillStyle=hex('#0d0618',0.88);
      ctx.fillRect(ax-4,ay-ah,8,ah);
      ctx.beginPath(); ctx.arc(ax,ay-ah-6,5,0,Math.PI*2); ctx.fill();
      if (i===0||i===3) {
        ctx.strokeStyle=hex(P.goldL,0.7+0.2*Math.sin(t+i));
        ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.moveTo(ax+4,ay-ah+3); ctx.lineTo(ax+14,ay-ah-8); ctx.stroke();
      }
    }

    ctx.font=`${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle='rgba(227,145,177,0.18)'; ctx.textAlign='right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 7. PVP DUEL ARENA */
  const arena = makeScene((ctx, W, H, t) => {
    skyGrad(ctx,W,H,'#0a1020','#0e1840');
    stars(ctx,W,H,50,t);
    // Arena floor
    const fl = ctx.createLinearGradient(0,H*0.6,0,H);
    fl.addColorStop(0,'#141830'); fl.addColorStop(1,'#080c18');
    ctx.fillStyle=fl; ctx.fillRect(0,H*0.6,W,H);
    // Arena circle
    ctx.beginPath();
    ctx.ellipse(W/2,H*0.75,W*0.38,W*0.08,0,0,Math.PI*2);
    ctx.strokeStyle=hex(P.pink,0.2+0.1*Math.sin(t)); ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(W/2,H*0.75,W*0.26,W*0.055,0,0,Math.PI*2);
    ctx.strokeStyle=hex(P.blue,0.15); ctx.lineWidth=1; ctx.stroke();

    // Center clash
    const clash = ctx.createRadialGradient(W/2,H*0.55,0,W/2,H*0.55,60+20*Math.sin(t*2));
    clash.addColorStop(0,`rgba(255,255,255,${0.7+0.2*Math.sin(t*3)})`);
    clash.addColorStop(0.2,hex(P.pink,0.5+0.2*Math.sin(t*2.5)));
    clash.addColorStop(0.6,hex(P.blue,0.2));
    clash.addColorStop(1,'transparent');
    ctx.fillStyle=clash; ctx.fillRect(0,0,W,H);

    // Fighters
    [
      {x:W*0.3, col:P.blue, flip:false},
      {x:W*0.7, col:P.pink, flip:true},
    ].forEach(({x,col,flip}) => {
      ctx.save(); ctx.translate(x, H*0.7);
      if (flip) ctx.scale(-1,1);
      ctx.fillStyle=hex(col,0.85);
      ctx.fillRect(-5,-38,10,32); // body
      ctx.beginPath(); ctx.arc(0,-45,8,0,Math.PI*2); ctx.fill(); // head
      ctx.fillRect(-7,-6,5,20); ctx.fillRect(2,-6,5,20); // legs
      // sword
      ctx.strokeStyle=hex(P.goldL,0.9+0.1*Math.sin(t+x));
      ctx.lineWidth=2.5; ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(8,-28);
      ctx.lineTo(30+8*Math.sin(t*1.5+x),-10+8*Math.cos(t*1.5+x));
      ctx.stroke();
      ctx.restore();
    });

    // Lightning sparks
    for (let i=0;i<8;i++) {
      const la=(Math.PI*2/8)*i+t*0.5;
      const ll=20+rand(5,15);
      ctx.save(); ctx.translate(W/2,H*0.55); ctx.rotate(la);
      ctx.strokeStyle=hex(i%2?P.pink:P.blue,0.5+0.3*Math.sin(t*2+i));
      ctx.lineWidth=1.5;
      ctx.beginPath();
      let lx=0,ly=0;
      for(let s=0;s<3;s++){lx+=rand(2,7);ly+=rand(-4,4);ctx.lineTo(lx,ly);}
      ctx.lineTo(ll,0); ctx.stroke();
      ctx.restore();
    }

    ctx.font=`${W*0.022}px 'Cinzel Decorative',serif`;
    ctx.fillStyle='rgba(227,145,177,0.18)'; ctx.textAlign='right';
    ctx.fillText('COUNTRY Guild', W-16, H-14);
  });

  /* 8. GUILD BANNER — emblematic scene */
  const banner = makeScene((ctx, W, H, t) => {
    const cx = W / 2, cy = H / 2;

    /* ── 背景 ── */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,   '#1a0520');
    bg.addColorStop(0.5, '#2e0d35');
    bg.addColorStop(1,   '#160318');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    /* 背景グロー */
    const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.75);
    bgGlow.addColorStop(0, `rgba(200,80,140,${0.1 + 0.04 * Math.sin(t)})`);
    bgGlow.addColorStop(1, 'rgba(100,20,80,0)');
    ctx.fillStyle = bgGlow; ctx.fillRect(0, 0, W, H);

    /* ── 角丸ポリゴンヘルパー ── */
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

    /* ── 幾何学花びら関数（角丸版） ── */
    function geoPetal(x, y, w, h, rot, alpha, c1, c2) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y); ctx.rotate(rot);
      const g = ctx.createLinearGradient(0, -h, 0, h);
      g.addColorStop(0,   c1);
      g.addColorStop(0.5, c2);
      g.addColorStop(1,   c1);
      ctx.fillStyle   = g;
      ctx.shadowColor = 'rgba(220,100,150,0.5)';
      ctx.shadowBlur  = 20;
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
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth   = 1.2;
      ctx.beginPath(); ctx.moveTo(0, -h * 0.85); ctx.lineTo(0,  h * 0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-w * 0.75, 0);  ctx.lineTo(w * 0.75, 0);  ctx.stroke();
      ctx.restore();
    }

    /* ── 幾何学花芯（角丸六角形） ── */
    function geoCentral(x, y, r, rot, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x, y); ctx.rotate(rot);
      const hexPts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return { x: Math.cos(a) * r, y: Math.sin(a) * r };
      });
      roundedPoly(hexPts, r * 0.3);
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
      cg.addColorStop(0, '#fff8e0'); cg.addColorStop(0.5, '#f8d060'); cg.addColorStop(1, 'rgba(240,160,40,0)');
      ctx.fillStyle   = cg;
      ctx.shadowColor = 'rgba(255,210,60,1)';
      ctx.shadowBlur  = 36;
      ctx.fill();
      ctx.shadowBlur  = 0;
      ctx.strokeStyle = 'rgba(255,230,100,0.55)';
      ctx.lineWidth   = 1.2;
      const hexPts2 = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        return { x: Math.cos(a) * r * 0.54, y: Math.sin(a) * r * 0.54 };
      });
      roundedPoly(hexPts2, r * 0.18);
      ctx.stroke();
      ctx.restore();
    }

    /* ── 外周リング（呼吸） ── */
    const pulse = 0.45 + 0.2 * Math.sin(t * 1.2);
    [H * 0.44, H * 0.47].forEach((r, i) => {
      ctx.save();
      ctx.strokeStyle = i === 0 ? `rgba(227,145,177,${pulse})` : 'rgba(227,145,177,0.15)';
      ctx.lineWidth   = i === 0 ? 2 : 0.8;
      if (i === 1) ctx.setLineDash([5, 8]);
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });

    /* ── 放射線（幾何学装飾） ── */
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.06);
    for (let i = 0; i < 12; i++) {
      const a   = (Math.PI * 2 / 12) * i;
      const alp = 0.08 + 0.05 * Math.sin(t * 1.5 + i);
      ctx.strokeStyle = `rgba(227,145,177,${alp})`;
      ctx.lineWidth   = 0.8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * H * 0.12, Math.sin(a) * H * 0.12);
      ctx.lineTo(Math.cos(a) * H * 0.43, Math.sin(a) * H * 0.43);
      ctx.stroke();
    }
    ctx.restore();

    /* ── 内側グロー ── */
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, H * 0.28);
    glow.addColorStop(0, `rgba(255,200,225,${0.24 + 0.08 * Math.sin(t * 1.5)})`);
    glow.addColorStop(1, 'rgba(200,80,140,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, H * 0.28, 0, Math.PI * 2); ctx.fill();

    /* ── メイン幾何学桜1輪 ── */
    const pd = H * 0.155, pw = H * 0.065, ph = H * 0.135;
    const br = t * 0.12 - Math.PI / 2;
    for (let i = 0; i < 5; i++) {
      const a  = br + (Math.PI * 2 / 5) * i;
      geoPetal(cx + Math.cos(a) * pd, cy + Math.sin(a) * pd,
               pw, ph, a + Math.PI / 2, 0.94, '#fde0ee', '#d95090');
    }
    /* 花びらの間のダイヤ */
    for (let i = 0; i < 5; i++) {
      const a  = br + (Math.PI * 2 / 5) * i + Math.PI / 5;
      const alp = 0.4 + 0.15 * Math.sin(t * 2 + i);
      const dx = cx + Math.cos(a) * (pd + ph * 0.55);
      const dy = cy + Math.sin(a) * (pd + ph * 0.55);
      ctx.save();
      ctx.globalAlpha = alp;
      ctx.translate(dx, dy); ctx.rotate(a + Math.PI / 4);
      ctx.fillStyle   = '#f5a8c8';
      ctx.shadowColor = 'rgba(220,100,150,0.5)';
      ctx.shadowBlur  = 10;
      const ds = H * 0.018;
      const dpts = [{x:0,y:-ds},{x:ds,y:0},{x:0,y:ds},{x:-ds,y:0}];
      roundedPoly(dpts, ds * 0.4);
      ctx.fill();
      ctx.restore();
    }

    /* ── 花芯 ── */
    geoCentral(cx, cy, H * 0.055, t * 0.22, 1);

    /* ── テキスト ── */
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fs = Math.round(H * 0.13);
    ctx.font      = `bold ${fs}px 'Cinzel Decorative', serif`;
    ctx.fillStyle = 'rgba(80,10,50,0.8)';
    ctx.fillText('COUNTRY', cx + 2, cy + H * 0.3 + 2);
    ctx.fillStyle   = '#ffffff';
    ctx.shadowColor = 'rgba(247,145,177,1)';
    ctx.shadowBlur  = 22;
    ctx.fillText('COUNTRY', cx, cy + H * 0.3);
    ctx.font        = `${Math.round(H * 0.055)}px 'Cinzel', serif`;
    ctx.fillStyle   = 'rgba(247,194,216,0.85)';
    ctx.shadowBlur  = 10;
    ctx.fillText('Since 2021.03.22', cx, cy + H * 0.41);
    ctx.shadowBlur  = 0;
    const lw = W * 0.18;
    const lg = ctx.createLinearGradient(cx - lw, 0, cx + lw, 0);
    lg.addColorStop(0, 'rgba(227,145,177,0)');
    lg.addColorStop(0.5, 'rgba(227,145,177,0.85)');
    lg.addColorStop(1, 'rgba(227,145,177,0)');
    ctx.strokeStyle = lg; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - lw, cy + H * 0.355); ctx.lineTo(cx + lw, cy + H * 0.355);
    ctx.stroke();
    ctx.restore();
  });

  /* ── Public API ─────────────────────────────────────────── */
  return {
    scenes: { heidel, partyScene, calpheon, nodwar, blossom, dungeon, arena, banner },
    renderStatic(canvas, sceneName) {
      const fn = this.scenes[sceneName];
      if (fn) fn(canvas);
    },
    hex, rand, P,
  };
})();

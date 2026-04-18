/**
 * scene.js
 * Shared cinematic environment renderer for Snow Quest Grade 7
 * Draws: sky, aurora, glacier walls, cryo-village, ice floor, snowfall, HUD
 */
const SnowQuestScene = (() => {
  let GW, GH, GROUND_Y;

  function sz(id) {
    const c = document.getElementById(id);
    c.width = GW; c.height = GH;
    return c;
  }

  /* ── SKY + STARS + MOON ── */
  function drawSky() {
    const c = sz('cBg'), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, GH);
    g.addColorStop(0,   '#010812');
    g.addColorStop(.38, '#030f20');
    g.addColorStop(.7,  '#051828');
    g.addColorStop(1,   '#061e2e');
    x.fillStyle = g; x.fillRect(0, 0, GW, GH);

    const mx = GW * .78, my = 52;
    for (let i = 4; i >= 1; i--) {
      const mg = x.createRadialGradient(mx, my, i * 6, mx, my, i * 34);
      mg.addColorStop(0, `rgba(180,240,255,${.075/i})`); mg.addColorStop(1, 'transparent');
      x.fillStyle = mg; x.beginPath(); x.arc(mx, my, i * 34, 0, Math.PI * 2); x.fill();
    }
    const mc = x.createRadialGradient(mx, my, 0, mx, my, 24);
    mc.addColorStop(0, 'rgba(248,255,252,1)'); mc.addColorStop(.62, 'rgba(210,245,242,.9)'); mc.addColorStop(1, 'transparent');
    x.fillStyle = mc; x.beginPath(); x.arc(mx, my, 24, 0, Math.PI * 2); x.fill();

    let sd = 17;
    const rr = () => { sd = (sd * 1664525 + 1013904223) >>> 0; return sd / 4294967296; };
    for (let i = 0; i < 220; i++) {
      const sx = rr() * GW, sy = rr() * GH * .55, sr = rr() * 1.7 + .2, sa = rr() * .75 + .18;
      x.fillStyle = `rgba(215,238,255,${sa})`; x.beginPath(); x.arc(sx, sy, sr, 0, Math.PI * 2); x.fill();
      if (sr > 1.1) {
        const sg = x.createRadialGradient(sx, sy, 0, sx, sy, sr * 4.5);
        sg.addColorStop(0, `rgba(180,220,255,${sa*.28})`); sg.addColorStop(1, 'transparent');
        x.fillStyle = sg; x.beginPath(); x.arc(sx, sy, sr * 4.5, 0, Math.PI * 2); x.fill();
      }
    }
  }

  /* ── AURORA ── */
  let at = 0, aCtx;
  function initAurora() {
    const c = sz('cAurora');
    aCtx = c.getContext('2d');
    tickAurora();
  }
  function tickAurora() {
    aCtx.clearRect(0, 0, GW, GH);
    const bands = [
      { yo: .16, amp: 20, fr: .007, sp: .009, col: 'rgba(0,200,140,',  a: .11 },
      { yo: .23, amp: 16, fr: .010, sp: .013, col: 'rgba(0,170,210,',  a: .09 },
      { yo: .29, amp: 12, fr: .012, sp: .008, col: 'rgba(100,20,200,', a: .08 },
      { yo: .20, amp: 14, fr: .006, sp: .016, col: 'rgba(0,210,180,',  a: .07 },
    ];
    bands.forEach(b => {
      aCtx.beginPath();
      for (let px = 0; px <= GW; px += 3) {
        const y = GH * b.yo + Math.sin(px * b.fr + at * b.sp) * b.amp + Math.sin(px * b.fr * .6 + at * b.sp * 1.4) * b.amp * .4;
        px === 0 ? aCtx.moveTo(px, y) : aCtx.lineTo(px, y);
      }
      aCtx.lineTo(GW, 0); aCtx.lineTo(0, 0); aCtx.closePath();
      aCtx.fillStyle = b.col + b.a + ')'; aCtx.fill();
    });
    at += .32;
    requestAnimationFrame(tickAurora);
  }

  /* ── GLACIER CAVE WALLS ── */
  function drawGlacier() {
    const c = sz('cGlacier'), x = c.getContext('2d'), gY = GROUND_Y;
    function wall(pts, a, b, s) {
      const g = x.createLinearGradient(0, 0, 0, GH);
      g.addColorStop(0, a); g.addColorStop(1, b);
      x.fillStyle = g; x.beginPath();
      pts.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py));
      x.closePath(); x.fill();
      x.strokeStyle = s; x.lineWidth = 1.8; x.stroke();
      const eg = x.createLinearGradient(0, 0, 0, GH * .65);
      eg.addColorStop(0, 'rgba(0,225,255,.22)'); eg.addColorStop(1, 'transparent');
      x.strokeStyle = eg; x.lineWidth = 5; x.stroke();
    }
    wall([[0,0],[GW*.37,0],[GW*.21,gY*.44],[GW*.07,gY*.71],[0,gY],[0,0]], 'rgba(8,55,95,.74)', 'rgba(4,28,58,.92)', 'rgba(0,200,255,.58)');
    wall([[GW,0],[GW*.63,0],[GW*.79,gY*.44],[GW*.93,gY*.71],[GW,gY],[GW,0]], 'rgba(8,55,95,.74)', 'rgba(4,28,58,.92)', 'rgba(0,200,255,.58)');

    x.beginPath(); x.moveTo(0, 0); x.bezierCurveTo(GW*.25,-44,GW*.75,-44,GW,0); x.lineTo(GW,GH*.13); x.bezierCurveTo(GW*.75,GH*.022,GW*.25,GH*.022,0,GH*.13); x.closePath();
    const tg = x.createLinearGradient(0,0,0,GH*.13); tg.addColorStop(0,'rgba(6,36,75,.88)'); tg.addColorStop(1,'transparent'); x.fillStyle=tg; x.fill();

    x.save(); x.globalAlpha=.16; x.strokeStyle='rgba(0,225,255,1)'; x.lineWidth=.85;
    [[GW*.05,0,GW*.17,gY*.5],[GW*.11,0,GW*.06,gY*.62],[GW*.19,0,GW*.13,gY*.4],[GW*.81,0,GW*.94,gY*.5],[GW*.89,0,GW*.96,gY*.62],[GW*.95,0,GW*.87,gY*.4]].forEach(([x1,y1,x2,y2])=>{x.beginPath();x.moveTo(x1,y1);x.lineTo(x2,y2);x.stroke();});
    x.restore();

    x.save(); x.globalAlpha=.3;
    [[GW*.04,gY*.28,GW*.13,gY*.14,GW*.06,gY*.54],[GW*.09,gY*.6,GW*.02,gY*.74,GW*.15,gY*.71],[GW*.87,gY*.22,GW*.95,gY*.38,GW*.81,gY*.41],[GW*.93,gY*.6,GW*.87,gY*.74,GW*.97,gY*.7]].forEach(([x1,y1,x2,y2,x3,y3])=>{
      const fg=x.createLinearGradient(x1,y1,x3,y3); fg.addColorStop(0,'rgba(110,225,255,.52)'); fg.addColorStop(1,'rgba(0,100,200,.14)');
      x.fillStyle=fg; x.beginPath(); x.moveTo(x1,y1); x.lineTo(x2,y2); x.lineTo(x3,y3); x.closePath(); x.fill();
    });
    x.restore();
  }

  /* ── CRYO-VILLAGE ── */
  function drawVillage() {
    const c = sz('cVillage'), x = c.getContext('2d'), gY = GROUND_Y;

    function house(hx, bot, bw, bh, rh, ac) {
      const top = bot - bh, sw = bw * .14, sd = bh * .08;
      const wg = x.createLinearGradient(hx,top,hx+bw,bot);
      wg.addColorStop(0,'rgba(9,32,66,.93)'); wg.addColorStop(.5,'rgba(7,26,54,.89)'); wg.addColorStop(1,'rgba(5,18,42,.96)');
      x.fillStyle=wg; x.fillRect(hx,top,bw,bh);
      const sf=x.createLinearGradient(hx+bw,top,hx+bw+sw,top); sf.addColorStop(0,'rgba(4,20,48,.96)'); sf.addColorStop(1,'rgba(2,11,28,.99)');
      x.fillStyle=sf; x.beginPath(); x.moveTo(hx+bw,top); x.lineTo(hx+bw+sw,top-sd); x.lineTo(hx+bw+sw,bot-sd*.5); x.lineTo(hx+bw,bot); x.closePath(); x.fill();
      x.fillStyle='rgba(5,18,48,.97)'; x.beginPath(); x.moveTo(hx-4,top); x.lineTo(hx+bw/2,top-rh); x.lineTo(hx+bw+4,top); x.closePath(); x.fill();
      x.fillStyle='rgba(220,244,255,.84)'; x.beginPath(); x.moveTo(hx-2,top-1); x.lineTo(hx+bw/2,top-rh+5); x.lineTo(hx+bw+2,top-1); x.closePath(); x.fill();
      x.strokeStyle=ac; x.lineWidth=.8; x.globalAlpha=.62; x.strokeRect(hx,top,bw,bh);
      x.globalAlpha=.32; x.strokeStyle='rgba(0,180,255,.5)'; x.lineWidth=.5; x.strokeRect(hx+3,top+3,bw-6,bh-6); x.globalAlpha=1;
      [[.17,.28],[.54,.28],[.17,.60],[.54,.60]].slice(0,bw>65?4:2).forEach(([rx,ry])=>{
        const wx=hx+bw*rx, wy=top+bh*ry, ww=bw*.22, wh=bh*.2, fl=.72+.28*Math.random();
        const wg2=x.createRadialGradient(wx+ww*.5,wy+wh*.5,0,wx+ww*.5,wy+wh*.5,ww*2.4);
        wg2.addColorStop(0,`rgba(255,198,76,${.88*fl})`); wg2.addColorStop(.5,`rgba(255,158,44,${.42*fl})`); wg2.addColorStop(1,'rgba(255,118,26,0)');
        x.fillStyle=wg2; x.fillRect(wx-ww*.4,wy-wh*.3,ww*1.8,wh*1.9);
        x.fillStyle=`rgba(255,208,86,${.92*fl})`; x.fillRect(wx,wy,ww,wh);
        x.strokeStyle=`rgba(0,200,255,${.38*fl})`; x.lineWidth=.6; x.strokeRect(wx-.5,wy-.5,ww+1,wh+1);
      });
      x.strokeStyle='rgba(0,205,255,.62)'; x.lineWidth=1;
      x.beginPath(); x.moveTo(hx+bw*.72,top-rh); x.lineTo(hx+bw*.72,top-rh-15); x.stroke();
      x.fillStyle='rgba(0,225,255,.92)'; x.beginPath(); x.arc(hx+bw*.72,top-rh-15,2.8,0,Math.PI*2); x.fill();
      x.save(); x.globalAlpha=.16; x.strokeStyle='rgba(200,222,255,1)'; x.lineWidth=2.8; x.lineCap='round';
      x.beginPath(); x.moveTo(hx+bw*.68,top-rh); x.bezierCurveTo(hx+bw*.68+5,top-rh-9,hx+bw*.68-4,top-rh-18,hx+bw*.68+3,top-rh-27); x.stroke(); x.restore();
    }

    function pine(px, bot, h) {
      for (let l = 0; l < 3; l++) {
        const ly=bot-h*(l*.28+.18), lw=h*(.33-l*.04);
        const pg=x.createLinearGradient(px-lw,ly,px+lw,ly); pg.addColorStop(0,'rgba(4,28,16,.97)'); pg.addColorStop(.5,'rgba(9,48,26,.99)'); pg.addColorStop(1,'rgba(3,22,12,.97)');
        x.fillStyle=pg; x.beginPath(); x.moveTo(px,ly-h*.27); x.lineTo(px+lw,ly+h*.09); x.lineTo(px-lw,ly+h*.09); x.closePath(); x.fill();
        x.fillStyle='rgba(212,240,255,.76)'; x.beginPath(); x.moveTo(px,ly-h*.23); x.lineTo(px+lw*.54,ly+h*.05); x.lineTo(px-lw*.54,ly+h*.05); x.closePath(); x.fill();
      }
      x.fillStyle='rgba(18,9,4,.82)'; x.fillRect(px-3,bot-h*.1,6,h*.11);
    }

    function lamp(lx, bot) {
      x.strokeStyle='rgba(7,26,58,.92)'; x.lineWidth=2.2;
      x.beginPath(); x.moveTo(lx,bot); x.lineTo(lx,bot-50); x.lineTo(lx+16,bot-50); x.stroke();
      const lg=x.createRadialGradient(lx+16,bot-50,1,lx+16,bot-50,30); lg.addColorStop(0,'rgba(255,232,146,.56)'); lg.addColorStop(.5,'rgba(255,198,76,.18)'); lg.addColorStop(1,'transparent');
      x.fillStyle=lg; x.beginPath(); x.arc(lx+16,bot-50,30,0,Math.PI*2); x.fill();
      x.fillStyle='rgba(255,238,168,.94)'; x.beginPath(); x.arc(lx+16,bot-50,4.5,0,Math.PI*2); x.fill();
      x.strokeStyle='rgba(0,200,255,.42)'; x.lineWidth=.8; x.beginPath(); x.arc(lx+16,bot-50,7.5,0,Math.PI*2); x.stroke();
    }

    house(GW*.03,gY,66,58,34,'rgba(0,180,255,.52)'); house(GW*.17,gY,90,76,44,'rgba(0,202,255,.62)');
    house(GW*.31,gY,60,52,31,'rgba(0,162,222,.42)'); house(GW*.63,gY,76,67,39,'rgba(0,202,255,.57)');
    house(GW*.79,gY,68,59,35,'rgba(0,182,255,.47)'); house(GW*.90,gY,56,51,29,'rgba(0,162,222,.42)');
    pine(GW*.12,gY,61); pine(GW*.27,gY,53); pine(GW*.44,gY,69); pine(GW*.51,gY,57);
    pine(GW*.58,gY,64); pine(GW*.73,gY,59); pine(GW*.87,gY,55); pine(GW*.97,gY,47);
    lamp(GW*.425,gY); lamp(GW*.565,gY);
  }

  /* ── ICE FLOOR ── */
  function drawIce() {
    const c = sz('cIce'), x = c.getContext('2d'), gY = GROUND_Y;
    const sg=x.createLinearGradient(0,gY-24,0,GH); sg.addColorStop(0,'#7ecee8'); sg.addColorStop(.2,'#aae2f6'); sg.addColorStop(.52,'#d2f2fe'); sg.addColorStop(1,'#eef9ff');
    x.fillStyle=sg; x.beginPath(); x.moveTo(0,gY);
    for (let px=0; px<=GW; px+=10) x.lineTo(px, gY+Math.sin(px*.018)*6+Math.cos(px*.007)*4);
    x.lineTo(GW,GH); x.lineTo(0,GH); x.closePath(); x.fill();
    const ir=x.createLinearGradient(0,gY,0,gY+40); ir.addColorStop(0,'rgba(0,180,255,.14)'); ir.addColorStop(1,'rgba(0,180,255,0)');
    x.fillStyle=ir; x.fillRect(0,gY,GW,40);
    x.save(); x.globalAlpha=.18; x.strokeStyle='rgba(160,220,240,1)'; x.lineWidth=.6;
    for (let i=0; i<8; i++) { const lx=GW*(.08+i*.12),ly=gY+5; x.beginPath(); x.moveTo(lx,ly); x.bezierCurveTo(lx+12,ly+8,lx+22,ly+4,lx+30,ly+12); x.stroke(); }
    x.restore();
    for (let s=0; s<100; s++) {
      const sx=Math.random()*GW, sy=gY+4+Math.random()*46, sa=Math.random()*.7+.22, sr=Math.random()*2.2+.4;
      x.fillStyle=`rgba(255,255,255,${sa})`; x.beginPath(); x.arc(sx,sy,sr,0,Math.PI*2); x.fill();
      if (sr>1.4) { x.strokeStyle=`rgba(200,240,255,${sa*.55})`; x.lineWidth=.7; x.beginPath(); x.moveTo(sx-sr*1.8,sy); x.lineTo(sx+sr*1.8,sy); x.stroke(); x.beginPath(); x.moveTo(sx,sy-sr*1.8); x.lineTo(sx,sy+sr*1.8); x.stroke(); }
    }
  }

  /* ── SNOWFALL ── */
  let flakes = [], snCtx;
  function initSnow() {
    const c = sz('cSnow'); snCtx = c.getContext('2d');
    flakes = Array.from({length:155}, () => ({
      x: Math.random()*GW, y: Math.random()*GH,
      r: Math.random()*2.8+.28, sp: Math.random()+.2,
      dx: Math.random()*.58-.29, a: Math.random()*.5+.12,
      blr: Math.random() > .55
    }));
    tickSnow();
  }
  function tickSnow() {
    snCtx.clearRect(0,0,GW,GH);
    flakes.forEach(f => {
      if (f.blr) { const bg=snCtx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r*2.6); bg.addColorStop(0,`rgba(200,235,255,${f.a})`); bg.addColorStop(1,'transparent'); snCtx.fillStyle=bg; snCtx.beginPath(); snCtx.arc(f.x,f.y,f.r*2.6,0,Math.PI*2); snCtx.fill(); }
      else { snCtx.fillStyle=`rgba(225,245,255,${f.a})`; snCtx.beginPath(); snCtx.arc(f.x,f.y,f.r,0,Math.PI*2); snCtx.fill(); }
      f.y+=f.sp; f.x+=f.dx+Math.sin(f.y*.025)*.28;
      if (f.y>GH) { f.y=-3; f.x=Math.random()*GW; } if (f.x<0) f.x=GW; if (f.x>GW) f.x=0;
    });
    requestAnimationFrame(tickSnow);
  }

  /* ── HUD ── */
  let hudCtx, ht=0, scanY=0;
  const hudNodes = [
    {x:.24,y:.55,l:'PHY-01',c:'rgba(0,200,255,1)'}, {x:.5,y:.55,l:'CHM-02',c:'rgba(0,255,180,1)'},
    {x:.76,y:.55,l:'BIO-03',c:'rgba(180,80,255,1)'}, {x:.12,y:.3,l:'CRYO-A',c:'rgba(0,180,255,.7)'},
    {x:.88,y:.3,l:'CRYO-B',c:'rgba(0,180,255,.7)'}
  ];
  function initHUD() { const c=sz('cHud'); hudCtx=c.getContext('2d'); tickHUD(); }
  function tickHUD() {
    hudCtx.clearRect(0,0,GW,GH);
    hudCtx.save(); hudCtx.globalAlpha=.12; hudCtx.strokeStyle='rgba(0,220,255,1)'; hudCtx.lineWidth=.6;
    const gY=GROUND_Y, hor=gY-10, vp={x:GW*.5,y:hor};
    for(let i=-12;i<=12;i++){hudCtx.beginPath();hudCtx.moveTo(vp.x,vp.y);hudCtx.lineTo(vp.x+i*(GW*.055),GH);hudCtx.stroke();}
    for(let d=1;d<=6;d++){const t=d/6,gy=hor+(GH-hor)*t*t;hudCtx.beginPath();hudCtx.moveTo(0,gy);hudCtx.lineTo(GW,gy);hudCtx.stroke();}
    hudCtx.restore();
    scanY=(scanY+1.1)%(GH*.72);
    hudCtx.save(); hudCtx.globalAlpha=.065;
    const sl=hudCtx.createLinearGradient(0,scanY,0,scanY+30); sl.addColorStop(0,'transparent'); sl.addColorStop(.5,'rgba(0,220,255,1)'); sl.addColorStop(1,'transparent');
    hudCtx.fillStyle=sl; hudCtx.fillRect(0,scanY,GW,30); hudCtx.restore();
    hudCtx.save(); hudCtx.globalAlpha=.46; hudCtx.strokeStyle='rgba(0,222,255,1)'; hudCtx.lineWidth=1.6;
    [[16,16,1,1],[GW-16,16,-1,1],[16,GH-16,1,-1],[GW-16,GH-16,-1,-1]].forEach(([x,y,dx,dy])=>{hudCtx.beginPath();hudCtx.moveTo(x,y+dy*22);hudCtx.lineTo(x,y);hudCtx.lineTo(x+dx*22,y);hudCtx.stroke();});
    hudCtx.restore();
    hudCtx.save(); hudCtx.globalAlpha=.55; hudCtx.fillStyle='rgba(0,222,255,1)'; hudCtx.font='9px "Share Tech Mono",monospace';
    ['SYS: ONLINE','TEMP: -42°C','SIGNAL: 98%','NODE: 3/3'].forEach((t,i)=>hudCtx.fillText(t,24,36+i*14));
    ['VER: 7.0.0','LAT: 82°N','CRYO-LVL: MAX','STATUS: OK'].forEach((t,i)=>{hudCtx.fillText(t,GW-hudCtx.measureText(t).width-24,36+i*14);});
    hudCtx.restore();
    const ps=.7+.3*Math.sin(ht*.06);
    hudNodes.forEach(n=>{
      const nx=n.x*GW, ny=n.y*GH;
      hudCtx.save();
      [.34,.17,.07].forEach((a,ri)=>{const r=11+(ri+1)*9*ps; hudCtx.globalAlpha=a; hudCtx.strokeStyle=n.c; hudCtx.lineWidth=.8; hudCtx.beginPath(); hudCtx.arc(nx,ny,r,0,Math.PI*2); hudCtx.stroke();});
      hudCtx.globalAlpha=.9; hudCtx.fillStyle=n.c; hudCtx.beginPath(); hudCtx.arc(nx,ny,4,0,Math.PI*2); hudCtx.fill();
      hudCtx.globalAlpha=.68; hudCtx.fillStyle=n.c; hudCtx.font='bold 8px "Share Tech Mono",monospace'; hudCtx.textAlign='center'; hudCtx.fillText(n.l,nx,ny-18);
      hudCtx.restore();
    });
    ht++; requestAnimationFrame(tickHUD);
  }

  /* ── PUBLIC INIT ── */
  function init(appId) {
    const app = document.getElementById(appId);
    GW = app.offsetWidth || window.innerWidth;
    GH = app.offsetHeight || window.innerHeight;
    GROUND_Y = GH - Math.round(GH * 0.088); // ~8.8% from bottom

    drawSky();
    initAurora();
    drawGlacier();
    drawVillage();
    drawIce();
    initSnow();
    initHUD();
  }

  return { init, get GROUND_Y() { return GROUND_Y; } };
})();

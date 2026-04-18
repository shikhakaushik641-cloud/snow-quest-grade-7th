/**
 * penguin-engine.js
 * Cinematic penguin renderer + autonomous walking/sliding state machine
 * Shared between index.html and dashboard.html
 */
const PenguinEngine = (() => {
  let trCanvas, trCtx, GW, GH, GROUND_Y;
  const trails = [], particles = [];
  const pSt = [];
  const hitDivs = [];
  const S = 36; // penguin scale unit

  /* ══════════════════════════════════════
     CINEMATIC PENGUIN DRAW
     Origin = (worldX, GROUND_Y) — feet on ice
     ══════════════════════════════════════ */
  function drawPenguin(ctx, worldX, gY, phase, sliding, wobAng) {
    ctx.save();
    ctx.translate(worldX, gY);
    if (wobAng !== 0) ctx.rotate(wobAng * Math.PI / 180);

    const bob = sliding ? 0 : Math.sin(phase * 2) * S * .015;

    // AO ground shadow
    const aog = ctx.createRadialGradient(0,2,2,0,2,S*1.05);
    aog.addColorStop(0,'rgba(0,12,30,.7)'); aog.addColorStop(.5,'rgba(0,8,22,.32)'); aog.addColorStop(1,'transparent');
    ctx.fillStyle=aog; ctx.beginPath(); ctx.ellipse(0,2,S*1.05,S*.18,0,0,Math.PI*2); ctx.fill();

    if (sliding) { ctx.rotate(Math.PI*.46); ctx.translate(0,-S*.18); ctx.scale(1,.54); }

    // Feet
    if (!sliding) {
      [[-S*.25,0],[S*.25,0]].forEach(([fx],fi) => {
        const kick = Math.sin(phase + (fi ? Math.PI : 0)) * S * .045;
        ctx.save(); ctx.translate(fx, -kick*.2);
        const faog=ctx.createRadialGradient(0,4,0,0,4,S*.2); faog.addColorStop(0,'rgba(0,12,30,.48)'); faog.addColorStop(1,'transparent');
        ctx.fillStyle=faog; ctx.beginPath(); ctx.ellipse(0,3,S*.2,S*.07,0,0,Math.PI*2); ctx.fill();
        const fg=ctx.createLinearGradient(0,-S*.09,0,S*.05); fg.addColorStop(0,'#ffd700'); fg.addColorStop(.32,'#ff9900'); fg.addColorStop(.72,'#e06000'); fg.addColorStop(1,'#a03500');
        ctx.fillStyle=fg; ctx.beginPath(); ctx.ellipse(0,0,S*.23,S*.09,(fi?.22:-.22),0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='rgba(140,55,0,.5)'; ctx.lineWidth=S*.018;
        [-S*.085,0,S*.085].forEach(tx=>{ctx.beginPath();ctx.moveTo(tx,0);ctx.lineTo(tx+(fi?S*.03:-S*.03),-S*.12);ctx.stroke();});
        ctx.strokeStyle='rgba(255,225,100,.46)'; ctx.lineWidth=S*.014; ctx.beginPath(); ctx.ellipse(0,-S*.016,S*.19,S*.062,(fi?.22:-.22),Math.PI,Math.PI*2); ctx.stroke();
        ctx.restore();
      });
    } else {
      [[-S*.28,0],[S*.28,0]].forEach(([fx],fi)=>{
        ctx.save(); ctx.translate(fx,S*.06); ctx.rotate(fi?.38:-.38);
        const fg=ctx.createLinearGradient(0,-S*.08,0,S*.06); fg.addColorStop(0,'#ffd700'); fg.addColorStop(.4,'#ff9900'); fg.addColorStop(1,'#a03500');
        ctx.fillStyle=fg; ctx.beginPath(); ctx.ellipse(0,0,S*.25,S*.1,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      });
      const groove=ctx.createLinearGradient(-S*.38,0,S*.38,0); groove.addColorStop(0,'transparent'); groove.addColorStop(.3,'rgba(0,180,230,.26)'); groove.addColorStop(.7,'rgba(0,180,230,.26)'); groove.addColorStop(1,'transparent');
      ctx.fillStyle=groove; ctx.beginPath(); ctx.ellipse(0,S*.2,S*.36,S*.05,0,0,Math.PI*2); ctx.fill();
    }

    ctx.save(); ctx.translate(0,bob);
    const BC = -S*.58;

    // Body
    const bodyG=ctx.createRadialGradient(-S*.18,BC+S*.12,S*.04,S*.04,BC+S*.2,S*.72);
    bodyG.addColorStop(0,'#3a4e62'); bodyG.addColorStop(.18,'#1e2e3c'); bodyG.addColorStop(.48,'#0e1824'); bodyG.addColorStop(1,'#050e18');
    ctx.fillStyle=bodyG; ctx.beginPath(); ctx.ellipse(0,BC,S*.44,S*.58,0,0,Math.PI*2); ctx.fill();

    // Feather texture
    ctx.save(); ctx.beginPath(); ctx.ellipse(0,BC,S*.44,S*.58,0,0,Math.PI*2); ctx.clip();
    for (let r=0;r<10;r++){const fy=BC-S*.52+r*S*.12,fw=S*(.14+r*.034);for(let fx=-fw;fx<=fw;fx+=S*.085){ctx.fillStyle=`rgba(255,255,255,${.028-r*.0022})`;ctx.beginPath();ctx.ellipse(fx,fy,S*.03,S*.055,0,0,Math.PI*2);ctx.fill();}}
    ctx.restore();

    // Cyan rim
    const rimC=ctx.createLinearGradient(-S*.46,BC-S*.58,-S*.05,BC+S*.3);
    rimC.addColorStop(0,'rgba(0,235,255,1.0)'); rimC.addColorStop(.25,'rgba(0,200,255,.78)'); rimC.addColorStop(.55,'rgba(0,150,230,.36)'); rimC.addColorStop(1,'rgba(0,80,180,0)');
    ctx.strokeStyle=rimC; ctx.lineWidth=S*.072; ctx.beginPath(); ctx.ellipse(0,BC,S*.44,S*.58,0,Math.PI*.50,Math.PI*1.60); ctx.stroke();
    const rimCore=ctx.createLinearGradient(-S*.44,BC-S*.55,-S*.07,BC+S*.25);
    rimCore.addColorStop(0,'rgba(160,248,255,.62)'); rimCore.addColorStop(.4,'rgba(80,220,255,.28)'); rimCore.addColorStop(1,'rgba(0,0,0,0)');
    ctx.strokeStyle=rimCore; ctx.lineWidth=S*.026; ctx.beginPath(); ctx.ellipse(0,BC,S*.44,S*.58,0,Math.PI*.52,Math.PI*1.55); ctx.stroke();

    // Amber rim
    const rimA=ctx.createLinearGradient(S*.34,BC-S*.45,S*.5,BC+S*.2);
    rimA.addColorStop(0,'rgba(255,195,72,.52)'); rimA.addColorStop(.5,'rgba(255,148,36,.22)'); rimA.addColorStop(1,'rgba(255,100,0,0)');
    ctx.strokeStyle=rimA; ctx.lineWidth=S*.04; ctx.beginPath(); ctx.ellipse(0,BC,S*.44,S*.58,0,-Math.PI*.32,Math.PI*.28); ctx.stroke();

    // Crown spec
    const crownS=ctx.createRadialGradient(-S*.14,BC-S*.54,0,-S*.14,BC-S*.54,S*.18);
    crownS.addColorStop(0,'rgba(160,238,255,.36)'); crownS.addColorStop(1,'transparent');
    ctx.fillStyle=crownS; ctx.beginPath(); ctx.ellipse(-S*.14,BC-S*.54,S*.18,S*.1,-.48,0,Math.PI*2); ctx.fill();

    // Wings
    [-1,1].forEach(side=>{
      ctx.save(); ctx.translate(side*S*.38,BC+S*.02); ctx.rotate(side*(sliding?Math.PI*.55:Math.sin(phase)*.42));
      const wg=ctx.createLinearGradient(0,0,side*S*.12,S*.34); wg.addColorStop(0,'#1c2c3c'); wg.addColorStop(.6,'#0c1820'); wg.addColorStop(1,'#060e18');
      ctx.fillStyle=wg; ctx.beginPath(); ctx.ellipse(side*S*.08,S*.18,S*.13,S*.34,side*.25,0,Math.PI*2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.ellipse(side*S*.08,S*.18,S*.13,S*.34,side*.25,0,Math.PI*2); ctx.clip();
      for(let wf=0;wf<6;wf++){ctx.strokeStyle=`rgba(255,255,255,${.034-wf*.005})`;ctx.lineWidth=S*.011;ctx.beginPath();ctx.moveTo(-S*.09,wf*S*.054);ctx.lineTo(S*.09+side*S*.038,wf*S*.054+S*.038);ctx.stroke();}
      ctx.restore();
      const wr=ctx.createLinearGradient(-S*.13,0,S*.04,S*.36); wr.addColorStop(0,'rgba(0,228,255,.65)'); wr.addColorStop(1,'rgba(0,100,200,0)');
      ctx.strokeStyle=wr; ctx.lineWidth=S*.038; ctx.beginPath(); ctx.ellipse(side*S*.08,S*.18,S*.13,S*.34,side*.25,Math.PI*.58,Math.PI*1.52); ctx.stroke();
      ctx.restore();
    });

    // Belly
    const belG=ctx.createRadialGradient(S*.055,BC+S*.04,0,0,BC+S*.02,S*.32);
    belG.addColorStop(0,'#ffffff'); belG.addColorStop(.32,'#edf6ff'); belG.addColorStop(.65,'#cce6f8'); belG.addColorStop(1,'rgba(180,220,245,0)');
    ctx.fillStyle=belG; ctx.beginPath(); ctx.ellipse(S*.03,BC+S*.04,S*.28,S*.42,.065,0,Math.PI*2); ctx.fill();
    for(let bf=0;bf<7;bf++){const bfy=BC-S*.28+bf*S*.11; ctx.strokeStyle=`rgba(162,206,230,${.19-bf*.022})`; ctx.lineWidth=S*.014; ctx.beginPath(); ctx.ellipse(S*.03,bfy,S*(.085+bf*.023),S*.028,0,0,Math.PI); ctx.stroke();}
    const bSp=ctx.createLinearGradient(S*.2,BC-S*.32,S*.3,BC+S*.26); bSp.addColorStop(0,'rgba(255,255,255,.73)'); bSp.addColorStop(1,'rgba(255,255,255,0)');
    ctx.strokeStyle=bSp; ctx.lineWidth=S*.022; ctx.beginPath(); ctx.ellipse(S*.03,BC+S*.04,S*.28,S*.42,.065,-Math.PI*.38,Math.PI*.13); ctx.stroke();

    // Head
    const HC = BC - S*.58;
    const hdg=ctx.createRadialGradient(-S*.11,HC-S*.05,S*.02,0,HC,S*.28);
    hdg.addColorStop(0,'#2e3e52'); hdg.addColorStop(.44,'#131d2c'); hdg.addColorStop(1,'#07101a');
    ctx.fillStyle=hdg; ctx.beginPath(); ctx.ellipse(0,HC,S*.27,S*.295,0,0,Math.PI*2); ctx.fill();
    for(let hf=0;hf<5;hf++){const hfy=HC-S*.22+hf*S*.088,hfw=S*(.088+hf*.036);ctx.strokeStyle=`rgba(255,255,255,${.032-hf*.006})`;ctx.lineWidth=S*.012;ctx.beginPath();ctx.arc(0,hfy,hfw,Math.PI*1.08,Math.PI*1.92);ctx.stroke();}
    const hdRim=ctx.createLinearGradient(-S*.28,HC-S*.3,-S*.04,HC+S*.1);
    hdRim.addColorStop(0,'rgba(0,240,255,1.0)'); hdRim.addColorStop(.42,'rgba(0,200,255,.6)'); hdRim.addColorStop(1,'rgba(0,100,200,0)');
    ctx.strokeStyle=hdRim; ctx.lineWidth=S*.062; ctx.beginPath(); ctx.ellipse(0,HC,S*.27,S*.295,0,Math.PI*.47,Math.PI*1.62); ctx.stroke();
    const hdRim2=ctx.createLinearGradient(-S*.26,HC-S*.27,-S*.05,HC+S*.07);
    hdRim2.addColorStop(0,'rgba(180,248,255,.52)'); hdRim2.addColorStop(1,'rgba(0,0,0,0)');
    ctx.strokeStyle=hdRim2; ctx.lineWidth=S*.023; ctx.beginPath(); ctx.ellipse(0,HC,S*.27,S*.295,0,Math.PI*.5,Math.PI*1.58); ctx.stroke();
    const hSp=ctx.createRadialGradient(-S*.09,HC-S*.21,0,-S*.09,HC-S*.21,S*.12);
    hSp.addColorStop(0,'rgba(130,215,255,.32)'); hSp.addColorStop(1,'transparent');
    ctx.fillStyle=hSp; ctx.beginPath(); ctx.ellipse(-S*.09,HC-S*.21,S*.12,S*.088,-.36,0,Math.PI*2); ctx.fill();

    // Eyes
    [-1,1].forEach(side=>{
      const ex=side*S*.12, ey=HC-S*.04;
      const eg=ctx.createRadialGradient(ex-S*.01,ey-S*.015,0,ex,ey,S*.094);
      eg.addColorStop(0,'#ffffff'); eg.addColorStop(.6,'#ddeeff'); eg.addColorStop(1,'rgba(200,230,255,0)');
      ctx.fillStyle=eg; ctx.beginPath(); ctx.ellipse(ex,ey,S*.092,S*.098,0,0,Math.PI*2); ctx.fill();
      const ig=ctx.createRadialGradient(ex,ey,0,ex,ey,S*.053);
      ig.addColorStop(0,'#1a0800'); ig.addColorStop(.5,'#080402'); ig.addColorStop(1,'#000');
      ctx.fillStyle=ig; ctx.beginPath(); ctx.arc(ex,ey,S*.053,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.96)'; ctx.beginPath(); ctx.arc(ex+S*.023,ey-S*.025,S*.021,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(180,240,255,.5)'; ctx.beginPath(); ctx.arc(ex-S*.017,ey+S*.016,S*.011,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.62)'; ctx.lineWidth=S*.016; ctx.beginPath(); ctx.ellipse(ex,ey,S*.092,S*.098,0,0,Math.PI*2); ctx.stroke();
    });

    // Beak
    const bky=HC+S*.1;
    const bkG=ctx.createLinearGradient(0,bky-S*.038,0,bky+S*.18);
    bkG.addColorStop(0,'#ffdd00'); bkG.addColorStop(.25,'#ff9900'); bkG.addColorStop(.65,'#e06000'); bkG.addColorStop(1,'#a03500');
    ctx.fillStyle=bkG; ctx.beginPath(); ctx.moveTo(-S*.12,bky-S*.018); ctx.quadraticCurveTo(0,bky-S*.088,S*.12,bky-S*.018); ctx.quadraticCurveTo(S*.036,bky+S*.19,-S*.036,bky+S*.19); ctx.quadraticCurveTo(-S*.12,bky+S*.088,-S*.12,bky-S*.018); ctx.closePath(); ctx.fill();
    const bkSSS=ctx.createRadialGradient(0,bky+S*.15,0,0,bky+S*.15,S*.055); bkSSS.addColorStop(0,'rgba(255,210,120,.45)'); bkSSS.addColorStop(1,'rgba(255,160,0,0)');
    ctx.fillStyle=bkSSS; ctx.beginPath(); ctx.ellipse(0,bky+S*.16,S*.038,S*.028,0,0,Math.PI*2); ctx.fill();
    const bkSp=ctx.createLinearGradient(-S*.055,bky-S*.055,S*.055,bky+S*.055); bkSp.addColorStop(0,'rgba(255,248,158,.8)'); bkSp.addColorStop(1,'rgba(255,190,0,0)');
    ctx.fillStyle=bkSp; ctx.beginPath(); ctx.ellipse(-S*.018,bky+S*.018,S*.052,S*.036,-.27,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(178,56,0,.48)'; ctx.lineWidth=S*.017; ctx.beginPath(); ctx.moveTo(-S*.105,bky); ctx.quadraticCurveTo(0,bky-S*.03,S*.105,bky); ctx.stroke();
    ctx.strokeStyle='rgba(255,230,80,.42)'; ctx.lineWidth=S*.013; ctx.beginPath(); ctx.moveTo(-S*.12,bky-S*.018); ctx.quadraticCurveTo(0,bky-S*.096,S*.12,bky-S*.018); ctx.stroke();

    // Tech collar
    ctx.strokeStyle='rgba(0,212,255,.36)'; ctx.lineWidth=S*.022; ctx.beginPath(); ctx.ellipse(0,BC-S*.5,S*.22,S*.058,0,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(80,232,255,.15)'; ctx.lineWidth=S*.011; ctx.beginPath(); ctx.ellipse(0,BC-S*.5,S*.26,S*.068,0,0,Math.PI*2); ctx.stroke();

    ctx.restore(); // bob
    ctx.restore(); // main
  }

  /* ── SPRAY PARTICLES ── */
  function sprayParticle(x, y, dir) {
    for (let n=0; n<6; n++) particles.push({ x, y, vx:-dir*(Math.random()*2.8+.4)+Math.random()*1.1, vy:-Math.random()*2.4-.5, life:1, r:Math.random()*3+.8 });
  }

  /* ── TRIGGER SLIDE ── */
  function triggerSlide(i) {
    const s = pSt[i];
    if (s.state === 'SLIDE') return;
    s.state = 'SLIDE'; s.stimer = 100; s.slideVx = s.dir * 9;
  }

  /* ── MAIN ANIMATION LOOP ── */
  const t0 = Date.now();
  function tick() {
    trCtx.clearRect(0, 0, GW, GH);
    const now = Date.now();

    // Draw trails
    for (let t = trails.length-1; t >= 0; t--) {
      const tr = trails[t], age = (now - tr.time) / 2900;
      if (age >= 1) { trails.splice(t,1); continue; }
      const a = .42*(1-age)*(1-age);
      trCtx.strokeStyle=`rgba(100,215,255,${a})`; trCtx.lineWidth=(5.5-age*4.5)+.7; trCtx.lineCap='round';
      trCtx.beginPath(); trCtx.moveTo(tr.x1,tr.y1); trCtx.lineTo(tr.x2,tr.y2); trCtx.stroke();
      trCtx.strokeStyle=`rgba(0,180,255,${a*.3})`; trCtx.lineWidth=(10-age*8)+1;
      trCtx.beginPath(); trCtx.moveTo(tr.x1,tr.y1); trCtx.lineTo(tr.x2,tr.y2); trCtx.stroke();
    }

    // Draw spray
    for (let p = particles.length-1; p >= 0; p--) {
      const pt = particles[p]; pt.life-=.04; if (pt.life<=0) { particles.splice(p,1); continue; }
      pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=.13;
      const a=pt.life*.9; trCtx.fillStyle=`rgba(215,248,255,${a})`; trCtx.beginPath(); trCtx.arc(pt.x,pt.y,pt.r*pt.life,0,Math.PI*2); trCtx.fill();
      if (pt.r>1.8) { trCtx.strokeStyle=`rgba(255,255,255,${a*.6})`; trCtx.lineWidth=.85; trCtx.beginPath(); trCtx.moveTo(pt.x-pt.r,pt.y); trCtx.lineTo(pt.x+pt.r,pt.y); trCtx.stroke(); trCtx.beginPath(); trCtx.moveTo(pt.x,pt.y-pt.r); trCtx.lineTo(pt.x,pt.y+pt.r); trCtx.stroke(); }
    }

    // Move & draw each penguin
    pSt.forEach((s, i) => {
      if (s.state === 'SLIDE') {
        s.stimer--; if (s.stimer<=0) { s.state='WOBBLE'; s.wobT=50; s.wobAng=0; }
        const px=s.x; s.slideVx*=.983; s.x+=s.slideVx; s.x=Math.max(44,Math.min(GW-44,s.x));
        if (Math.abs(s.slideVx)>.35) {
          trails.push({x1:px,y1:GROUND_Y,x2:s.x,y2:GROUND_Y,time:now});
          if (Math.random()>.52) sprayParticle(s.x+(s.dir>0?-34:34),GROUND_Y-2,s.dir);
        }
        trCtx.save(); if(s.dir<0){trCtx.scale(-1,1);trCtx.translate(-GW,0);}
        drawPenguin(trCtx, s.dir>0?s.x:GW-s.x, GROUND_Y, s.phase, true, 0);
        trCtx.restore();

      } else if (s.state === 'WOBBLE') {
        s.wobT--; if (s.wobT<=0) s.state='WALK';
        s.wobAng = Math.sin(s.wobT*.44)*14*(s.wobT/50);
        drawPenguin(trCtx, s.x, GROUND_Y, 0, false, s.wobAng);

      } else {
        const dx=s.tx-s.x, dist=Math.abs(dx);
        if (dist<22) { s.tx=Math.random()*GW*.8+GW*.05; }
        s.vx += (dx/(dist||1))*.13; s.vx*=.88;
        const vm=Math.abs(s.vx); if(vm>s.spd) s.vx=s.vx/vm*s.spd;
        const px=s.x; s.x+=s.vx; s.x=Math.max(44,Math.min(GW-44,s.x));
        if (vm>.13) trails.push({x1:px,y1:GROUND_Y,x2:s.x,y2:GROUND_Y,time:now});
        s.dir=s.vx>=0?1:-1; s.phase+=.072;
        trCtx.save(); if(s.dir<0){trCtx.scale(-1,1);trCtx.translate(-GW,0);}
        drawPenguin(trCtx, s.dir>0?s.x:GW-s.x, GROUND_Y, s.phase, false, 0);
        trCtx.restore();
      }

      // Update hit div
      if (hitDivs[i]) {
        hitDivs[i].style.left = (s.x - 40) + 'px';
        hitDivs[i].style.top  = (GROUND_Y - 95) + 'px';
      }
    });

    requestAnimationFrame(tick);
  }

  /* ── PUBLIC INIT ── */
  function init(canvasId, appId, groundY) {
    trCanvas = document.getElementById(canvasId);
    const app = document.getElementById(appId);
    GW = trCanvas.width  = app.offsetWidth  || window.innerWidth;
    GH = trCanvas.height = app.offsetHeight || window.innerHeight;
    GROUND_Y = groundY;

    // Create 3 penguins
    for (let i = 0; i < 3; i++) {
      pSt.push({
        x: GW * (.18 + i * .28),
        vx: (Math.random() - .5) * 1.0,
        tx: Math.random() * GW * .75 + GW * .08,
        spd: .68 + Math.random() * .5,
        dir: 1, state: 'WALK',
        stimer: 0, slideVx: 0,
        phase: i * 2.1, wobT: 0, wobAng: 0
      });

      // Invisible hit div for click/hover
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;width:80px;height:100px;cursor:pointer;z-index:9;';
      app.appendChild(d);
      hitDivs.push(d);
      d.addEventListener('mouseenter', () => triggerSlide(i));
      d.addEventListener('click',      () => triggerSlide(i));
    }

    trCtx = trCanvas.getContext('2d');
    tick();
  }

  return { init, triggerSlide };
})();

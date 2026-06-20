/* Salta Salchicha — runner de un solo botón (saltar), pensado para móvil.
   Enemigos flotantes; multiplicador por largo, power-ups, combos,
   partículas, ciclo día/noche y sonido.
   El gag del perro largo es la mecánica: comer alarga (más puntos, más hitbox);
   la zanahoria encoge. */
(function () {
  const canvas = document.getElementById("game-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  const GROUND = 244;          // línea de las patas
  const GRASS = GROUND + 8;    // superficie del suelo

  const el = (id) => document.getElementById(id);
  const scoreEl = el("gameScore"), multEl = el("gameMult"), comboEl = el("gameCombo"),
        lenEl = el("gameLength"), bestEl = el("gameBest"), muteBtn = el("gameMute");

  let best = parseInt(localStorage.getItem("salchichaBest") || "0", 10);
  bestEl.textContent = best;

  // ---------- Audio ----------
  let muted = localStorage.getItem("salchichaMute") === "1";
  let actx;
  muteBtn.textContent = muted ? "🔇" : "🔊";
  function beep(freq, dur, type = "square", vol = 0.05) {
    if (muted) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
      o.connect(g); g.connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur);
    } catch (e) {}
  }
  const sJump = () => beep(520, 0.12, "square", 0.04);
  const sCollect = () => { beep(720, 0.08, "triangle", 0.05); setTimeout(() => beep(960, 0.08, "triangle", 0.05), 60); };
  const sShrink = () => beep(300, 0.16, "sawtooth", 0.04);
  const sShield = () => { beep(660, 0.1, "sine", 0.06); setTimeout(() => beep(880, 0.12, "sine", 0.06), 90); };
  const sHit = () => { beep(160, 0.3, "sawtooth", 0.07); };
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem("salchichaMute", muted ? "1" : "0");
    muteBtn.textContent = muted ? "🔇" : "🔊";
  });

  // ---------- Estado ----------
  const dog = { x: 96, y: GROUND, vy: 0, len: 1, jumping: false, shield: 0 };
  const GRAVITY = 0.72, JUMP = -13.2, DOG_H = 40;

  let obstacles = [], particles = [], hills = [];
  let state = "ready";        // ready | playing | paused | over
  let score = 0, speed = 5, spawnTimer = 0, frame = 0, combo = 0, shake = 0, dayT = 0;

  function reset() {
    dog.y = GROUND; dog.vy = 0; dog.len = 1; dog.jumping = false; dog.shield = 0;
    obstacles = []; particles = [];
    score = 0; speed = 5; spawnTimer = 30; frame = 0; combo = 0; shake = 0; dayT = 0;
    state = "playing";
  }

  function startOrJump() {
    if (state === "ready" || state === "over") { reset(); return; }
    if (state === "paused") { state = "playing"; return; }
    if (!dog.jumping) { dog.vy = JUMP; dog.jumping = true; sJump(); spawnDust(dog.x + 14, GROUND + 6, 6); }
  }

  function bodyLen() { return 56 * dog.len; }
  function dogBox() {
    return { l: dog.x + 4, r: dog.x + bodyLen() + 30, t: dog.y - DOG_H, b: dog.y };
  }

  // ---------- Spawning ----------
  const TYPES = [
    { t: "spike",  w: 0.36 },
    { t: "bee",    w: 0.22 },
    { t: "treat",  w: 0.20 },
    { t: "carrot", w: 0.12 },
    { t: "shield", w: 0.10 },
  ];
  function pickType() {
    let r = Math.random(), acc = 0;
    for (const x of TYPES) { acc += x.w; if (r <= acc) return x.t; }
    return "spike";
  }
  function spawn() {
    const t = pickType();
    let o = { type: t, x: W + 30, vy: 0, bob: Math.random() * Math.PI * 2, float: true };
    // todos los enemigos flotan a una altura que se libra con un solo salto
    if (t === "spike") { o.w = 30; o.h = 30; o.baseY = GROUND - 48; o.amp = 7; }
    else if (t === "bee") { o.w = 30; o.h = 24; o.baseY = GROUND - 52; o.amp = 8; }
    else if (t === "treat") { o.w = 28; o.h = 18; o.baseY = GROUND - 62 - Math.random() * 22; o.amp = 6; }
    else if (t === "carrot") { o.w = 22; o.h = 30; o.baseY = GROUND - 66 - Math.random() * 20; o.amp = 6; }
    else if (t === "shield") { o.w = 26; o.h = 26; o.baseY = GROUND - 82 - Math.random() * 16; o.amp = 7; }
    o.y = o.baseY;
    obstacles.push(o);
    const gap = 230 + Math.random() * 180;
    spawnTimer = Math.max(28, gap / speed);
  }

  // ---------- Partículas ----------
  function burst(x, y, color, n, spread) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = Math.random() * spread;
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, life: 1, color, size: 2 + Math.random() * 3, g: 0.12 });
    }
  }
  function spawnDust(x, y, n) {
    for (let i = 0; i < n; i++) particles.push({ x, y, vx: -Math.random() * 2 - speed * 0.2, vy: -Math.random() * 1.5, life: 1, color: "#d8c4a4", size: 2 + Math.random() * 2, g: 0.05 });
  }

  // ---------- Colisiones / lógica ----------
  function collect(o, i) {
    if (o.type === "treat") {
      combo++;
      score += 6 * dog.len + combo * 2;
      dog.len = Math.min(dog.len + 0.07, 2.6);
      burst(o.x + o.w / 2, o.y + o.h / 2, "#f2c14e", 12, 4);
      sCollect();
    } else if (o.type === "carrot") {
      dog.len = Math.max(dog.len - 0.3, 1);
      burst(o.x + o.w / 2, o.y + o.h / 2, "#ff8a3d", 12, 4);
      sShrink();
    } else if (o.type === "shield") {
      dog.shield = 360; // ~6s
      burst(o.x + o.w / 2, o.y + o.h / 2, "#7fd1ff", 16, 5);
      sShield();
    }
    obstacles.splice(i, 1);
  }

  function hit() {
    if (dog.shield > 0) {
      dog.shield = 0; combo = 0; shake = 12;
      burst(dog.x + bodyLen(), dog.y - 20, "#7fd1ff", 18, 6);
      beep(420, 0.18, "sine", 0.05);
      return;
    }
    state = "over"; shake = 16; sHit();
    burst(dog.x + bodyLen(), dog.y - 20, "#e4572e", 22, 6);
    const s = Math.floor(score);
    if (s > best) { best = s; localStorage.setItem("salchichaBest", String(best)); bestEl.textContent = best; }
  }

  function update() {
    frame++;
    score += speed * 0.025 * dog.len;       // distancia × multiplicador(largo)
    speed = Math.min(5 + score * 0.012, 13);
    dayT = Math.min(score / 1400, 1);
    if (dog.shield > 0) dog.shield--;
    if (shake > 0) shake--;

    // física
    dog.vy += GRAVITY;
    dog.y += dog.vy;
    if (dog.y >= GROUND) {
      if (dog.jumping) spawnDust(dog.x + 14, GROUND + 6, 5);
      dog.y = GROUND; dog.vy = 0; dog.jumping = false;
    }

    spawnTimer--;
    if (spawnTimer <= 0) spawn();

    const box = dogBox();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      o.x -= speed;
      if (o.float) o.y = o.baseY + Math.sin(frame * 0.12 + o.bob) * o.amp;
      const oy = o.y, oh = o.h;
      const overlap = box.l < o.x + o.w && box.r > o.x && box.t < oy + oh && box.b > oy;
      if (overlap) {
        if (o.type === "treat" || o.type === "carrot" || o.type === "shield") { collect(o, i); continue; }
        else { hit(); return; }
      }
      if (o.x + o.w < -40) obstacles.splice(i, 1);
    }

    // partículas
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.life -= 0.025;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // HUD
    scoreEl.textContent = Math.floor(score);
    multEl.textContent = "x" + dog.len.toFixed(1);
    comboEl.textContent = combo;
    lenEl.textContent = dog.len.toFixed(1) + "×";
  }

  // ---------- Dibujo del perro (modelo mejorado) ----------
  const COL = { main: "#b0743f", light: "#c6905a", dark: "#8a5329", ear: "#7d4a25", paw: "#9c5f33", nose: "#34251c" };

  function fillCircle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function roundRect(x, y, w, h, r, c) {
    ctx.fillStyle = c; ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath(); ctx.fill();
  }

  function drawLeg(hipX, hipY, swing, tuck) {
    const footY = hipY + (tuck ? 8 : 20);
    const footX = hipX + swing + (tuck ? 6 : 0);
    ctx.strokeStyle = COL.paw; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(hipX, hipY); ctx.lineTo(footX, footY); ctx.stroke();
    fillCircle(footX, footY + 1, 5, COL.dark); // patita
  }

  function drawDog() {
    const x = dog.x, feet = dog.y, bl = bodyLen();
    const inAir = dog.jumping;
    const backTop = feet - 40;
    const torsoH = 26;
    const hipY = feet - 14;
    const phase = frame * 0.35;
    const amp = inAir ? 0 : 7;

    ctx.save();

    // sombra
    ctx.fillStyle = "rgba(0,0,0,.12)";
    ctx.beginPath(); ctx.ellipse(x + bl / 2 + 8, GRASS + 4, bl / 2 + 22, 7, 0, 0, Math.PI * 2); ctx.fill();

    // patas traseras (detrás del cuerpo)
    drawLeg(x + 16, hipY, Math.sin(phase) * amp, inAir);
    // patas delanteras
    drawLeg(x + bl + 6, hipY, Math.sin(phase + Math.PI) * amp, inAir);

    // cola (atrás, se menea)
    const wag = Math.sin(frame * 0.4) * 7;
    ctx.strokeStyle = COL.main; ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x + 6, backTop + 10);
    ctx.quadraticCurveTo(x - 12, backTop - 4, x - 10 + wag, backTop - 18); ctx.stroke();

    // cuerpo: anca + torso + pecho (silueta de salchicha)
    fillCircle(x + 18, feet - 22, 19, COL.main);                       // anca
    roundRect(x + 12, backTop, bl - 18, torsoH, torsoH / 2, COL.main); // lomo largo
    fillCircle(x + bl, feet - 22, 18, COL.main);                       // pecho/hombro
    // panza más clara
    roundRect(x + 14, backTop + 3, bl - 22, torsoH * 0.45, 6, COL.light);

    // collar
    ctx.fillStyle = "#e4572e";
    ctx.fillRect(x + bl + 2, backTop - 2, 7, torsoH + 8);
    fillCircle(x + bl + 5, feet - 14, 4, "#f2a900");

    // cabeza
    const hx = x + bl + 20, hy = feet - 44;
    fillCircle(hx, hy, 17, COL.main);
    // oreja caída
    ctx.fillStyle = COL.ear;
    ctx.save(); ctx.translate(hx - 8, hy - 2);
    ctx.rotate(inAir ? -0.5 : 0.25 + Math.sin(phase) * 0.06);
    ctx.beginPath(); ctx.ellipse(0, 8, 7, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // hocico
    roundRect(hx + 8, hy - 3, 22, 13, 6, COL.light);
    fillCircle(hx + 30, hy + 3, 4.5, COL.nose);     // nariz
    // ojo
    fillCircle(hx + 5, hy - 3, 3.2, "#241913");
    fillCircle(hx + 6, hy - 4, 1.1, "#fff");
    // boca
    ctx.strokeStyle = COL.nose; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(hx + 20, hy + 8); ctx.lineTo(hx + 26, hy + 9); ctx.stroke();

    // escudo activo
    if (dog.shield > 0 && (dog.shield > 60 || frame % 10 < 6)) {
      ctx.strokeStyle = "rgba(110,200,255,.85)"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x + bl / 2 + 8, feet - 22, bl / 2 + 30, 36, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- Dibujo del mundo ----------
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) {
    return `rgb(${Math.round(lerp(c1[0], c2[0], t))},${Math.round(lerp(c1[1], c2[1], t))},${Math.round(lerp(c1[2], c2[2], t))})`;
  }
  const DAY = [[191, 227, 255], [234, 247, 255]];
  const SUN = [[255, 200, 150], [255, 226, 196]];
  const NIGHT = [[40, 44, 86], [70, 70, 110]];

  function skyColor(idx) {
    if (dayT < 0.5) return mix(DAY[idx], SUN[idx], dayT / 0.5);
    return mix(SUN[idx], NIGHT[idx], (dayT - 0.5) / 0.5);
  }

  function drawWorld() {
    // cielo
    const g = ctx.createLinearGradient(0, 0, 0, GRASS);
    g.addColorStop(0, skyColor(0)); g.addColorStop(1, skyColor(1));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, GRASS);

    // estrellas de noche
    if (dayT > 0.55) {
      ctx.fillStyle = `rgba(255,255,255,${(dayT - 0.55) / 0.45})`;
      for (let i = 0; i < 30; i++) {
        const sx = (i * 53 + 20) % W, sy = (i * 31 % 120) + 10;
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
    // sol / luna
    const cx = 90 + dayT * (W - 180), cy = 70 - Math.sin(dayT * Math.PI) * 30;
    ctx.fillStyle = dayT < 0.6 ? "rgba(255,221,120,.95)" : "rgba(240,240,220,.95)";
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();

    // colinas parallax
    ctx.fillStyle = dayT > 0.6 ? "#3a5a4a" : "#bfe0a8";
    drawHills((frame * 0.5) % 200, GRASS, 70);
    ctx.fillStyle = dayT > 0.6 ? "#2f4a3c" : "#a6d28e";
    drawHills((frame * 1.0) % 160, GRASS, 40);

    // suelo
    ctx.fillStyle = dayT > 0.6 ? "#5b7a4d" : "#8fc46f";
    ctx.fillRect(0, GRASS, W, H - GRASS);
    ctx.fillStyle = dayT > 0.6 ? "#4d6b41" : "#7db35e";
    ctx.fillRect(0, GRASS, W, 6);
    // textura de pasto
    ctx.strokeStyle = dayT > 0.6 ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.18)";
    ctx.lineWidth = 2;
    for (let i = 0; i < W; i += 26) {
      const gx = (i - (frame * speed) % 26);
      ctx.beginPath(); ctx.moveTo(gx, GRASS + 12); ctx.lineTo(gx + 4, GRASS + 4); ctx.stroke();
    }
  }
  function drawHills(off, baseY, height) {
    ctx.beginPath(); ctx.moveTo(-off, baseY);
    for (let x = -off; x < W + 200; x += 200) {
      ctx.quadraticCurveTo(x + 50, baseY - height, x + 100, baseY);
      ctx.quadraticCurveTo(x + 150, baseY - height, x + 200, baseY);
    }
    ctx.lineTo(W + 200, baseY); ctx.lineTo(-off, baseY); ctx.closePath(); ctx.fill();
  }

  function drawObstacle(o) {
    // sombra en el suelo para vender el "flotando"
    if (o.float) {
      ctx.fillStyle = "rgba(0,0,0,.10)";
      ctx.beginPath(); ctx.ellipse(o.x + o.w / 2, GRASS + 2, o.w * 0.45, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
    if (o.type === "spike") {
      // erizo-pincho gruñón flotante
      const r = o.h / 2;
      ctx.fillStyle = "#7d54c9";
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a - 0.26) * r, cy + Math.sin(a - 0.26) * r);
        ctx.lineTo(cx + Math.cos(a) * (r + 7), cy + Math.sin(a) * (r + 7));
        ctx.lineTo(cx + Math.cos(a + 0.26) * r, cy + Math.sin(a + 0.26) * r);
        ctx.closePath(); ctx.fill();
      }
      fillCircle(cx, cy, r, "#9b73e0");
      fillCircle(cx - 5, cy - 2, 2.6, "#2a1d3a"); fillCircle(cx + 5, cy - 2, 2.6, "#2a1d3a");
      ctx.strokeStyle = "#2a1d3a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy + 9, 5, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
    } else if (o.type === "bee") {
      // abeja flotante con alas que aletean
      const wf = Math.sin(frame * 0.6) * 3;
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.beginPath(); ctx.ellipse(cx - 6, cy - 9 - wf, 7, 5, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 6, cy - 9 - wf, 7, 5, 0.4, 0, Math.PI * 2); ctx.fill();
      fillCircle(cx, cy, 10, "#f4b740");
      ctx.fillStyle = "#3a2a20"; ctx.fillRect(cx - 9, cy - 5, 18, 3); ctx.fillRect(cx - 9, cy + 2, 18, 3);
      ctx.beginPath(); ctx.moveTo(cx + 10, cy - 1); ctx.lineTo(cx + 16, cy); ctx.lineTo(cx + 10, cy + 3); ctx.closePath(); ctx.fill();
      fillCircle(cx - 3, cy - 2, 1.6, "#2a1d20"); fillCircle(cx + 3, cy - 2, 1.6, "#2a1d20");
    } else if (o.type === "treat") {
      roundRect(o.x, o.y, o.w, o.h, 8, "#fbe6b0");
      ctx.fillStyle = "#e4a93b";
      [[6, 4], [6, o.h - 4], [o.w - 6, 4], [o.w - 6, o.h - 4]].forEach(([dx, dy]) => fillCircle(o.x + dx, o.y + dy, 5, "#e4a93b"));
    } else if (o.type === "carrot") {
      ctx.fillStyle = "#ff8a3d"; ctx.beginPath();
      ctx.moveTo(o.x + o.w / 2, o.y + o.h); ctx.lineTo(o.x + o.w, o.y + 6); ctx.lineTo(o.x, o.y + 6); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#5fa343"; ctx.fillRect(o.x + o.w / 2 - 5, o.y - 4, 4, 10); ctx.fillRect(o.x + o.w / 2 + 1, o.y - 6, 4, 12);
    } else if (o.type === "shield") {
      ctx.fillStyle = "#7fd1ff"; ctx.strokeStyle = "#3aa0e0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(o.x + o.w / 2, o.y);
      ctx.lineTo(o.x + o.w, o.y + 6); ctx.lineTo(o.x + o.w, o.y + o.h * 0.55);
      ctx.quadraticCurveTo(o.x + o.w, o.y + o.h, o.x + o.w / 2, o.y + o.h);
      ctx.quadraticCurveTo(o.x, o.y + o.h, o.x, o.y + o.h * 0.55);
      ctx.lineTo(o.x, o.y + 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
      ctx.fillText("✚", o.x + o.w / 2, o.y + o.h * 0.7); ctx.textAlign = "left";
    }
  }

  function drawParticles() {
    particles.forEach((p) => {
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function overlay(lines) {
    ctx.fillStyle = "rgba(40,28,20,.58)"; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center"; ctx.fillStyle = "#fff";
    ctx.font = "700 30px 'Chewy', sans-serif"; ctx.fillText(lines[0], W / 2, H / 2 - 18);
    ctx.font = "600 17px 'Hanken Grotesk', sans-serif";
    for (let i = 1; i < lines.length; i++) ctx.fillText(lines[i], W / 2, H / 2 + 12 + (i - 1) * 24);
    ctx.textAlign = "left";
  }

  function render() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    drawWorld();
    obstacles.forEach(drawObstacle);
    drawDog();
    drawParticles();
    ctx.restore();

    if (state === "ready") overlay(["🌭 Salta Salchicha", "Toca para saltar a los enemigos flotantes y comer premios", "Toca o pulsa espacio para empezar"]);
    else if (state === "paused") overlay(["⏸ Pausa", "Espacio para continuar"]);
    else if (state === "over") overlay(["¡Game Over! " + Math.floor(score) + " pts", "Tu salchicha llegó a " + dog.len.toFixed(1) + "× · combo máx " + combo, "Espacio / toca para reintentar"]);
  }

  function loop() {
    if (state === "playing") update();
    render();
    requestAnimationFrame(loop);
  }

  // ---------- Controles ----------
  function inView() { const r = canvas.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }
  addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "KeyW"].includes(e.code)) { if (inView()) { e.preventDefault(); startOrJump(); } }
    else if (e.code === "KeyP") { if (state === "playing") state = "paused"; else if (state === "paused") state = "playing"; }
  });

  // Un solo botón: tocar/hacer clic en cualquier parte del canvas = saltar (ideal para móvil)
  canvas.addEventListener("touchstart", (e) => { e.preventDefault(); startOrJump(); }, { passive: false });
  canvas.addEventListener("mousedown", (e) => { e.preventDefault(); startOrJump(); });

  document.addEventListener("visibilitychange", () => { if (document.hidden && state === "playing") state = "paused"; });

  // colinas iniciales no necesarias (se dibujan proceduralmente)
  loop();
})();

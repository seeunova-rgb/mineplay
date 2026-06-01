// ═══════════════════════════════════════════════
//  MINEPLAY — main.js  (FPV Edition)
//  Game loop + renderer init
// ═══════════════════════════════════════════════

const Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  const { VW, VH, COLOR_BG } = CFG;

  let CW, CH, scale = 1, OX = 0, OY = 0;
  let running = false;

  function getHudHeight() {
    const hud = document.getElementById('ui-top');
    return hud ? hud.getBoundingClientRect().height : 0;
  }

  function resize() {
    CW = canvas.width  = window.innerWidth;
    CH = canvas.height = window.innerHeight;
    canvas.style.top  = '0';
    canvas.style.left = '0';
    scale = 1;
    OX = 0;
    OY = 0;
  }

  let lastT = 0;
  function update(ts) {
    const dt = Math.min((ts - lastT) / 16.67, 3);
    lastT = ts;
    Player.update(dt);
    Camera.follow(Player.state, dt);
    Player.updateHUD();

    const count = Object.keys(Online.getOthers()).length + 1;
    const el = document.getElementById('online-count');
    if (el) el.textContent = count;
    Online.updateOnlineHUD();
  }

  function draw() {
    ctx.fillStyle = COLOR_BG;
    ctx.fillRect(0, 0, CW, CH);

    ctx.save();
    ctx.translate(OX, OY);
    ctx.scale(scale, scale);
    ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();

    // ── FPV Render ──
    Raycaster.render(ctx, Player.state, VW, VH);

    // Particles (ฝุ่น) วาดบนพื้น
    Particles.update(ctx);

    // Online players (2D sprites บน minimap / ตำแหน่งโลก)
    Online.drawOthers(ctx);

    // HUD overlay (HP bar, crosshair ถูกวาดใน Raycaster แล้ว)
    Player.draw(ctx);

    ctx.restore();
  }

  function loop(ts) {
    if (!running) return;
    update(ts);
    draw();
    requestAnimationFrame(loop);
  }

  function init() {
    running = true;
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', () => setTimeout(resize, 200));
    Input.init();
    lastT = performance.now();
    requestAnimationFrame(loop);
  }

  function stop() { running = false; }

  return { init, stop };
})();

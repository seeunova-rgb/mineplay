const Game = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');
  const { VW, VH, COLOR_BG } = CFG;

  let CW, CH;
  let running = false;

  function resize() {
    CW = canvas.width  = window.innerWidth;
    CH = canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top  = '0';
    canvas.style.left = '0';
    canvas.style.width  = '100vw';
    canvas.style.height = '100vh';
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
    ctx.scale(CW / VW, CH / VH);

    Raycaster.render(ctx, Player.state, VW, VH);
    Particles.update(ctx);
    Online.drawOthers(ctx);
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

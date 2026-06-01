// ═══════════════════════════════════════════════
//  MINEPLAY — particles.js
//  Dust particles + visual effects
// ═══════════════════════════════════════════════

const Particles = (() => {
  const pool = [];

  function spawn(wx, wy, opts = {}) {
    pool.push({
      wx: wx + (Math.random() - .5) * (opts.spread || 10),
      wy: wy,
      vx: (Math.random() - .5) * (opts.vx || 1.5),
      vy: -Math.random() * (opts.vy || 1),
      life: 1,
      size: (opts.size || 3) + Math.random() * 3,
      color: opts.color || '180,160,100',
    });
  }

  function spawnDust(wx, wy) {
    for (let i = 0; i < 2; i++) spawn(wx, wy + 12);
  }

  function update(ctx) {
    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.wx += p.vx; p.wy += p.vy;
      p.life -= 0.05;
      if (p.life <= 0) { pool.splice(i, 1); continue; }
      const s = Camera.toScreen(p.wx, p.wy);
      ctx.fillStyle = `rgba(${p.color},${p.life * .5})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return { spawn, spawnDust, update };
})();

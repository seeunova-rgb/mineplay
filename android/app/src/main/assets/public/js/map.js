// ═══════════════════════════════════════════════
//  MINEPLAY — map.js
//  Map generation + rendering
// ═══════════════════════════════════════════════

const GameMap = (() => {
  const { TILE, MAP_W: MW, MAP_H: MH, TILE_COLORS,
          TILE_GRASS, TILE_DARK_GRASS, TILE_WATER, TILE_DIRT, TILE_WALL } = CFG;

  // ── Seeded random ──
  function sRand(x, y) {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
  }

  // ── Generate map data ──
  const data = [];
  for (let r = 0; r < MH; r++) {
    data[r] = [];
    for (let c = 0; c < MW; c++) {
      const v = sRand(c, r);
      if (r === 0 || r === MH-1 || c === 0 || c === MW-1) data[r][c] = TILE_WALL;
      else if (v < 0.08) data[r][c] = TILE_WATER;
      else if (v < 0.18) data[r][c] = TILE_DIRT;
      else if (v < 0.28) data[r][c] = TILE_DARK_GRASS;
      else               data[r][c] = TILE_GRASS;
    }
  }
  // Place trees
  for (let r = 1; r < MH-1; r++)
    for (let c = 1; c < MW-1; c++)
      if (sRand(c+100, r+100) < 0.07 && data[r][c] === TILE_GRASS)
        data[r][c] = TILE_WALL;

  // ── Solid check ──
  function isSolid(type) {
    return type === TILE_WATER || type === TILE_WALL;
  }

  // ── Draw map ──
  function draw(ctx, cam) {
    const { VW, VH } = CFG;
    const sc = Math.floor(cam.x / TILE), sr = Math.floor(cam.y / TILE);
    const ec = sc + Math.ceil(VW / TILE) + 2;
    const er = sr + Math.ceil(VH / TILE) + 2;

    for (let r = sr-1; r <= er; r++) {
      for (let c = sc-1; c <= ec; c++) {
        if (r < 0 || r >= MH || c < 0 || c >= MW) continue;
        const sx = c * TILE - cam.x;
        const sy = r * TILE - cam.y;
        const tp = data[r][c];

        // Base tile
        ctx.fillStyle = TILE_COLORS[tp] || '#4a8c3f';
        ctx.fillRect(sx, sy, TILE, TILE);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(sx, sy, TILE, TILE);

        // Water animation
        if (tp === TILE_WATER) {
          const wave = Math.sin(Date.now() * 0.002 + c + r) * 3;
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(sx+4, sy+10+wave, TILE-8, 4);
          ctx.fillRect(sx+8, sy+22+wave*.5, TILE-16, 3);
        }

        // Interior tree
        if (tp === TILE_WALL && r > 0 && r < MH-1 && c > 0 && c < MW-1) {
          ctx.fillStyle = '#7a4f2a';
          ctx.fillRect(sx+TILE/2-4, sy+TILE/2, 8, TILE/2);
          ctx.fillStyle = '#2d8a2d';
          ctx.beginPath(); ctx.arc(sx+TILE/2, sy+TILE/2, 15, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#3daa3d';
          ctx.beginPath(); ctx.arc(sx+TILE/2-4, sy+TILE/2-4, 10, 0, Math.PI*2); ctx.fill();
        }

        // Dirt texture
        if (tp === TILE_DIRT) {
          ctx.fillStyle = 'rgba(139,90,43,0.3)';
          for (let i = 0; i < 3; i++)
            ctx.fillRect(sx + sRand(c*10+i, r*7)*(TILE-6), sy + sRand(c*7+i, r*11)*(TILE-6), 3, 2);
        }

        // Boundary wall bricks
        if (tp === TILE_WALL && (r===0||r===MH-1||c===0||c===MW-1)) {
          ctx.fillStyle = '#3d2010'; ctx.fillRect(sx, sy, TILE, TILE);
          ctx.fillStyle = '#5c3d1e'; ctx.fillRect(sx+2, sy+2, TILE-4, TILE-4);
          for (let bi = 0; bi < 4; bi++) {
            ctx.strokeStyle = '#3d2010'; ctx.lineWidth = 1;
            ctx.strokeRect(sx+(bi%2===0?2:TILE/2), sy+bi*10+2, TILE/2-2, 9);
          }
        }
      }
    }
  }

  return { data, isSolid, draw, W: MW, H: MH, sRand };
})();

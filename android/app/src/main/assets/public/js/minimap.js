// ═══════════════════════════════════════════════
//  MINEPLAY — minimap.js
//  Minimap overlay
// ═══════════════════════════════════════════════

const Minimap = (() => {
  const MW = 100, MH = 72;
  const MX = CFG.VW - MW - 10;
  const MY = 46;

  function draw(ctx, player) {
    const { MAP_W, MAP_H, TILE, VW, VH, TILE_WATER, TILE_DIRT, TILE_WALL } = CFG;
    const cam = Camera.cam;
    const sx = MW / MAP_W, sy = MH / MAP_H;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(MX-2, MY-2, MW+4, MH+4);
    ctx.strokeStyle = CFG.COLOR_PRIMARY;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(MX-2, MY-2, MW+4, MH+4);

    // Tiles
    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const t = GameMap.data[r][c];
        ctx.fillStyle = t === TILE_WATER ? '#2e86ab'
                      : t === TILE_WALL  ? '#3d2010'
                      : t === TILE_DIRT  ? '#c8a96e'
                      : '#4a8c3f';
        ctx.fillRect(MX + c*sx, MY + r*sy, sx+.5, sy+.5);
      }
    }

    // Player dot
    const px = MX + (player.wx / TILE) * sx;
    const py = MY + (player.wy / TILE) * sy;
    ctx.fillStyle = CFG.COLOR_PRIMARY;
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI*2);
    ctx.fill();

    // Camera viewport rect
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(MX + cam.x/TILE*sx, MY + cam.y/TILE*sy, VW/TILE*sx, VH/TILE*sy);

    // Label
    ctx.fillStyle = '#aaa';
    ctx.font = '9px Nunito';
    ctx.textAlign = 'left';
    ctx.fillText('MAP', MX, MY-5);
  }

  return { draw };
})();

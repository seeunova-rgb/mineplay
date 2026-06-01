// ═══════════════════════════════════════════════
//  MINEPLAY — raycaster.js
//  First-Person View (Wolfenstein-style raycaster)
// ═══════════════════════════════════════════════

const Raycaster = (() => {
  const FOV        = Math.PI / 3;   // 60°
  const HALF_FOV   = FOV / 2;
  const NUM_RAYS   = 350;           // ความละเอียด (เพิ่มได้ถ้า PC แรง)
  const MAX_DEPTH  = 20;            // จำนวน tile สูงสุดที่ ray จะไป
  const WALL_H_SCALE = 1.0;

  // สี tile แต่ละประเภท
  const TILE_WALL_COLOR  = { r: 92,  g: 61,  b: 30  };  // #5c3d1e
  const TILE_WATER_COLOR = { r: 46,  g: 134, b: 171 };  // #2e86ab
  const TILE_DIRT_COLOR  = { r: 200, g: 169, b: 110 };  // #c8a96e
  const TREE_COLOR       = { r: 45,  g: 138, b: 45  };  // #2d8a2d
  const BOUND_COLOR      = { r: 61,  g: 32,  b: 16  };  // #3d2010

  // sky gradient cache
  let skyCache = null;

  function getTileColor(tileType, col, row, side) {
    const { MAP_W, MAP_H, TILE_WATER, TILE_DIRT, TILE_WALL } = CFG;
    let c;
    if (tileType === TILE_WATER)  c = { ...TILE_WATER_COLOR };
    else if (tileType === TILE_DIRT) c = { ...TILE_DIRT_COLOR };
    else if (tileType === TILE_WALL) {
      const isBound = row <= 0 || row >= MAP_H - 1 || col <= 0 || col >= MAP_W - 1;
      c = isBound ? { ...BOUND_COLOR } : { ...TREE_COLOR };
    } else {
      c = { ...TILE_WALL_COLOR };
    }
    // ด้าน EW มืดลงนิด (เพื่อให้รู้สึก 3D)
    if (side === 1) { c.r = Math.floor(c.r * 0.7); c.g = Math.floor(c.g * 0.7); c.b = Math.floor(c.b * 0.7); }
    return `rgb(${c.r},${c.g},${c.b})`;
  }

  // วาด sky + floor
  function drawBackground(ctx, vw, vh) {
    // Sky
    if (!skyCache || skyCache.w !== vw) {
      const off = document.createElement('canvas');
      off.width = vw; off.height = vh;
      const oc = off.getContext('2d');
      const g = oc.createLinearGradient(0, 0, 0, vh / 2);
      g.addColorStop(0,   '#0a0520');
      g.addColorStop(0.5, '#1a0a3e');
      g.addColorStop(1,   '#2a1060');
      oc.fillStyle = g;
      oc.fillRect(0, 0, vw, vh / 2);
      skyCache = { canvas: off, w: vw };
    }
    ctx.drawImage(skyCache.canvas, 0, 0);

    // Floor
    const fg = ctx.createLinearGradient(0, vh / 2, 0, vh);
    fg.addColorStop(0,   '#2d5a27');
    fg.addColorStop(0.4, '#3d7a34');
    fg.addColorStop(1,   '#1a3a14');
    ctx.fillStyle = fg;
    ctx.fillRect(0, vh / 2, vw, vh / 2);
  }

  // Raycast หลัก
  function cast(ctx, player, vw, vh) {
    const { TILE, MAP_W, MAP_H } = CFG;
    const px = (player.wx + player.w / 2) / TILE;
    const py = (player.wy + player.h / 2) / TILE;
    const pa = player.dir;   // มุมที่ผู้เล่นหัน (radian)

    const sliceW = vw / NUM_RAYS;

    for (let i = 0; i < NUM_RAYS; i++) {
      const rayAngle = pa - HALF_FOV + (i / NUM_RAYS) * FOV;
      const cosA = Math.cos(rayAngle);
      const sinA = Math.sin(rayAngle);

      // DDA algorithm
      let mapX = Math.floor(px);
      let mapY = Math.floor(py);

      const deltaDistX = Math.abs(1 / cosA);
      const deltaDistY = Math.abs(1 / sinA);

      let stepX, stepY;
      let sideDistX, sideDistY;

      if (cosA < 0) { stepX = -1; sideDistX = (px - mapX) * deltaDistX; }
      else          { stepX =  1; sideDistX = (mapX + 1 - px) * deltaDistX; }
      if (sinA < 0) { stepY = -1; sideDistY = (py - mapY) * deltaDistY; }
      else          { stepY =  1; sideDistY = (mapY + 1 - py) * deltaDistY; }

      let hit = false, side = 0;
      let dist = 0;
      let hitCol = mapX, hitRow = mapY;
      let hitTile = 0;

      for (let d = 0; d < MAX_DEPTH; d++) {
        if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
        else                        { sideDistY += deltaDistY; mapY += stepY; side = 1; }

        if (mapX < 0 || mapX >= MAP_W || mapY < 0 || mapY >= MAP_H) {
          dist = MAX_DEPTH; hit = true; break;
        }
        const t = GameMap.data[mapY][mapX];
        if (GameMap.isSolid(t)) {
          hitTile = t; hitCol = mapX; hitRow = mapY; hit = true;
          dist = side === 0
            ? (mapX - px + (1 - stepX) / 2) / cosA
            : (mapY - py + (1 - stepY) / 2) / sinA;
          break;
        }
      }

      if (!hit) dist = MAX_DEPTH;

      // Fix fisheye
      dist = Math.abs(dist * Math.cos(rayAngle - pa));
      if (dist < 0.01) dist = 0.01;

      const wallH = Math.min(vh * WALL_H_SCALE / dist, vh);
      const wallTop = (vh - wallH) / 2;

      // Fog effect
      const fog = Math.min(1, dist / MAX_DEPTH);
      const alpha = 1 - fog * 0.85;

      const color = dist >= MAX_DEPTH ? '#111' : getTileColor(hitTile, hitCol, hitRow, side);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(i * sliceW), Math.floor(wallTop), Math.ceil(sliceW) + 1, Math.ceil(wallH));
    }
    ctx.globalAlpha = 1;
  }

  // วาด crosshair กลางจอ
  function drawCrosshair(ctx, vw, vh) {
    const cx = vw / 2, cy = vh / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10); ctx.stroke();
    // dot
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
  }

  // วาด minimap FPV (top-down เล็กๆ มุมขวาบน)
  function drawFPVMinimap(ctx, player, vw) {
    const { TILE, MAP_W, MAP_H, TILE_WATER, TILE_DIRT, TILE_WALL } = CFG;
    const MW = 120, MH = 90;
    const MX = vw - MW - 8;
    const MY = 50;
    const sx = MW / MAP_W, sy = MH / MAP_H;

    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(MX - 2, MY - 2, MW + 4, MH + 4);
    ctx.strokeStyle = CFG.COLOR_PRIMARY;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(MX - 2, MY - 2, MW + 4, MH + 4);

    for (let r = 0; r < MAP_H; r++) {
      for (let c = 0; c < MAP_W; c++) {
        const t = GameMap.data[r][c];
        ctx.fillStyle = t === TILE_WATER ? '#2e86ab'
                      : t === TILE_WALL  ? '#3d2010'
                      : t === TILE_DIRT  ? '#c8a96e'
                      : '#4a8c3f';
        ctx.fillRect(MX + c * sx, MY + r * sy, sx + 0.5, sy + 0.5);
      }
    }

    // ตำแหน่งผู้เล่น + ทิศทาง
    const px = MX + (player.wx / TILE) * sx;
    const py = MY + (player.wy / TILE) * sy;

    // FOV cone
    ctx.strokeStyle = 'rgba(255,107,53,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(player.dir - HALF_FOV) * 20, py + Math.sin(player.dir - HALF_FOV) * 20);
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(player.dir + HALF_FOV) * 20, py + Math.sin(player.dir + HALF_FOV) * 20);
    ctx.stroke();

    // dot
    ctx.fillStyle = CFG.COLOR_PRIMARY;
    ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#aaa';
    ctx.font = '9px Nunito';
    ctx.textAlign = 'left';
    ctx.fillText('MAP', MX, MY - 5);
  }

  // เรนเดอร์ทั้งหมด (เรียกแทน GameMap.draw + Player.draw + Minimap.draw)
  function render(ctx, player, vw, vh) {
    drawBackground(ctx, vw, vh);
    cast(ctx, player, vw, vh);
    drawCrosshair(ctx, vw, vh);
    drawFPVMinimap(ctx, player, vw);
  }

  return { render };
})();

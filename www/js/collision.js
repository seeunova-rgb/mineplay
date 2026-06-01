// ═══════════════════════════════════════════════
//  MINEPLAY — collision.js
//  Tile-based collision detection
// ═══════════════════════════════════════════════

const Collision = (() => {
  function hitMap(wx, wy, w, h) {
    const { TILE } = CFG;
    const margin = 4;
    const l = Math.floor((wx + margin) / TILE);
    const r = Math.floor((wx + w - margin) / TILE);
    const t = Math.floor((wy + margin) / TILE);
    const b = Math.floor((wy + h - margin) / TILE);

    for (let row = t; row <= b; row++) {
      for (let col = l; col <= r; col++) {
        if (row < 0 || row >= GameMap.H || col < 0 || col >= GameMap.W) return true;
        if (GameMap.isSolid(GameMap.data[row][col])) return true;
      }
    }
    return false;
  }

  // Move entity with axis-separated collision
  function move(entity, dx, dy) {
    const nx = entity.wx + dx;
    if (!hitMap(nx, entity.wy, entity.w, entity.h)) entity.wx = nx;

    const ny = entity.wy + dy;
    if (!hitMap(entity.wx, ny, entity.w, entity.h)) entity.wy = ny;
  }

  return { hitMap, move };
})();

// ═══════════════════════════════════════════════
//  MINEPLAY — camera.js
//  FPV mode: camera ไม่ scroll แบบ top-down
//  คงไว้เพื่อ compatibility กับ Online / Minimap
// ═══════════════════════════════════════════════

const Camera = (() => {
  const cam = { x: 0, y: 0 };

  function follow(target, dt) {
    // FPV: ไม่ต้องทำ camera follow แบบ 2D
    // cam.x/y ใช้แค่ใน minimap ของ Online module
    cam.x = target.wx - CFG.VW / 2 + target.w / 2;
    cam.y = target.wy - CFG.VH / 2 + target.h / 2;
    cam.x = Math.max(0, Math.min(CFG.MAP_W * CFG.TILE - CFG.VW, cam.x));
    cam.y = Math.max(0, Math.min(CFG.MAP_H * CFG.TILE - CFG.VH, cam.y));
  }

  function toScreen(wx, wy) {
    return { x: wx - cam.x, y: wy - cam.y };
  }

  return { cam, follow, toScreen };
})();

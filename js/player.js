// ═══════════════════════════════════════════════
//  MINEPLAY — player.js  (FPV Edition)
//  ใช้ dir (radian) เป็นทิศ + strafe ซ้าย/ขวา
//  draw() แสดง HP/name ไว้บน canvas แทน 3D sprite
// ═══════════════════════════════════════════════

const Player = (() => {
  const { MAP_W, MAP_H, TILE, PLAYER_W, PLAYER_H,
          PLAYER_SPEED, PLAYER_RUN, PLAYER_HP,
          COLOR_HP_HIGH, COLOR_HP_MID, COLOR_HP_LOW,
          DUST_INTERVAL } = CFG;

  // ── State ──
  const state = {
    wx:       (MAP_W / 2) * TILE,
    wy:       (MAP_H / 2) * TILE,
    w:        PLAYER_W,
    h:        PLAYER_H,
    speed:    PLAYER_SPEED,
    runSpeed: PLAYER_RUN,
    hp:       PLAYER_HP,
    maxHp:    PLAYER_HP,
    dir:      0,          // มุมที่หัน (radian)
    moving:   false,
    frame:    0,
    frameTimer: 0,
    color:    '#ff6b35',
    hatColor: '#ff0055',
    name:     'Player 1',
  };

  // ── Update ──
  function update(dt) {
    // หมุนซ้าย/ขวา
    const turn = Input.consumeTurnDelta();
    state.dir += turn;

    const { dx: strafe, dy: fwd } = Input.getMove();
    const moving = Math.abs(fwd) > 0.05 || Math.abs(strafe) > 0.05;
    state.moving = moving;

    if (moving) {
      const run = Input.isRun();
      const spd = (run ? state.runSpeed : state.speed) * dt;

      // forward/back ตามทิศที่หัน
      const mx = (Math.cos(state.dir) * (-fwd) + Math.cos(state.dir + Math.PI / 2) * strafe) * spd;
      const my = (Math.sin(state.dir) * (-fwd) + Math.sin(state.dir + Math.PI / 2) * strafe) * spd;

      Collision.move(state, mx, my);

      state.frameTimer += dt;
      if (state.frameTimer > DUST_INTERVAL) {
        Particles.spawnDust(state.wx + state.w / 2, state.wy + state.h);
        state.frameTimer = 0;
      }
      state.frame += dt;
    }
  }

  // ── Draw (FPV: แสดงแค่ HUD overlay เล็กน้อย — raycaster วาดโลกแล้ว) ──
  function draw(ctx) {
    // แสดง HP bar ล่างจอ
    const { VW, VH } = CFG;
    const bw  = 200;
    const bh  = 14;
    const bx  = (VW - bw) / 2;
    const by  = VH - 40;
    const hpPct = state.hp / state.maxHp;
    const hc = hpPct > 0.6 ? COLOR_HP_HIGH : hpPct > 0.3 ? COLOR_HP_MID : COLOR_HP_LOW;

    // background bar
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath(); ctx.roundRect(bx - 4, by - 4, bw + 8, bh + 8, 6); ctx.fill();
    ctx.fillStyle = '#333';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = hc;
    ctx.fillRect(bx, by, bw * hpPct, bh);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);

    // ❤️ HP text
    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(`❤ ${state.hp} / ${state.maxHp}`, VW / 2, by + bh + 14);

    // ชื่อผู้เล่น มุมขวาล่าง (เล็กๆ)
    ctx.font = '11px Nunito';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText(state.name, VW - 12, VH - 12);
  }

  // ── HUD update ──
  function updateHUD() {
    document.getElementById('hp').textContent  = state.hp;
    document.getElementById('pos').textContent =
      `${Math.floor(state.wx / TILE)},${Math.floor(state.wy / TILE)}`;
  }

  return { state, update, draw, updateHUD };
})();

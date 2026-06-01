// ═══════════════════════════════════════════════
//  MINEPLAY — config.js
//  แก้ค่าเกมทั้งหมดที่นี่ที่เดียว
// ═══════════════════════════════════════════════

const CFG = {
  // MAP
  TILE:    40,
  MAP_W:   40,
  MAP_H:   30,

  // VIRTUAL RESOLUTION (internal canvas size)
  VW: 700,
  VH: 500,

  // PLAYER
  PLAYER_W:      28,
  PLAYER_H:      28,
  PLAYER_SPEED:  2.5,
  PLAYER_RUN:    4.5,
  PLAYER_HP:     100,

  // TILE TYPES
  TILE_GRASS:      0,
  TILE_DARK_GRASS: 1,
  TILE_WATER:      2,
  TILE_DIRT:       3,
  TILE_WALL:       4,

  // TILE COLORS
  TILE_COLORS: {
    0: '#4a8c3f',
    1: '#3d7a34',
    2: '#2e86ab',
    3: '#c8a96e',
    4: '#5c3d1e',
  },

  // CAMERA
  CAM_LERP: 0.12,

  // JOYSTICK
  JOY_RADIUS:    52,
  JOY_DEADZONE:  0.08,

  // PARTICLES
  DUST_INTERVAL: 4,

  // COLORS / THEME
  COLOR_PRIMARY:   '#ff6b35',
  COLOR_ACCENT:    '#ff0055',
  COLOR_HP_HIGH:   '#4cff72',
  COLOR_HP_MID:    '#ffcc00',
  COLOR_HP_LOW:    '#ff3333',
  COLOR_BG:        '#1a0a2e',
};

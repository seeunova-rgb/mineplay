// ═══════════════════════════════════════════════
//  MINEPLAY — online.js
//  Real-time multiplayer via Firebase Realtime DB
// ═══════════════════════════════════════════════

const Online = (() => {
  const TICK    = 200;
  const TIMEOUT = 5000; // ถ้าไม่ส่งสัญญาณ 5 วิ = ออกจากเกม

  const firebaseConfig = {
    apiKey: "AIzaSyBT_6j1Sg7cqFJRxQneKXVwU_5pOU_RluQ",
    authDomain: "mineplay-online.firebaseapp.com",
    databaseURL: "https://mineplay-online-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mineplay-online",
    storageBucket: "mineplay-online.firebasestorage.app",
    messagingSenderId: "240664126634",
    appId: "1:240664126634:web:7410f6b5416728590b1cd3",
  };

  let db         = null;
  let myId       = null;
  let myRef      = null;
  let intervalId = null;
  const others   = {};

  // ── Debug box (ซ่อนตั้งแต่ต้น) ──────────────────
  function showDebug(msg) {
    let el = document.getElementById('debug-box');
    if (!el) {
      el = document.createElement('div');
      el.id = 'debug-box';
      el.style.cssText = 'display:none;position:fixed;top:50px;left:0;right:0;background:rgba(0,0,0,0.85);color:#0f0;font-size:11px;padding:8px;z-index:99999;max-height:200px;overflow-y:auto;font-family:monospace';
      document.body.appendChild(el);
    }
    el.innerHTML += msg + '<br>';
    // auto-scroll ลงล่างสุด
    el.scrollTop = el.scrollHeight;
    console.log('[MINEPLAY]', msg);
  }

  function genId() {
    return Math.random().toString(36).slice(2, 10);
  }

  // ── ล้าง ghost players ที่ค้างใน DB ──────────────
  async function cleanGhosts(db) {
    try {
      const snap = await db.ref('players').get();
      if (!snap.exists()) return;
      const all = snap.val();
      const now = Date.now();
      const removes = [];
      for (const id in all) {
        if (now - (all[id].ts || 0) > TIMEOUT) {
          removes.push(db.ref('players/' + id).remove());
        }
      }
      if (removes.length) {
        await Promise.all(removes);
        showDebug('🧹 Cleaned ' + removes.length + ' ghost(s)');
      }
    } catch(e) {
      showDebug('⚠️ Ghost clean error: ' + e.message);
    }
  }

  // ── Start ─────────────────────────────────────────
  async function start(user) {
    showDebug('▶ Online.start()');

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        showDebug('✅ Firebase initialized');
      } else {
        showDebug('✅ Firebase already initialized');
      }

      db    = firebase.database();
      myId  = genId();
      myRef = db.ref('players/' + myId);
      showDebug('✅ My ID: ' + myId);

      myRef.onDisconnect().remove();

      // ล้าง ghost ก่อนเริ่ม
      await cleanGhosts(db);

      // เขียน state ครั้งแรก
      await pushState(user);
      showDebug('✅ Initial write OK');

      // push ทุก TICK
      intervalId = setInterval(() => pushState(user), TICK);

      // ฟัง players คนอื่น (ไม่รวมตัวเอง)
      db.ref('players').on('child_added', snap => {
        if (snap.key === myId) return;
        const p = snap.val();
        if (Date.now() - (p.ts || 0) < TIMEOUT) {
          others[snap.key] = p;
          showDebug('➕ Player joined: ' + (p.username || snap.key));
          showDebug('👥 Online now: ' + (Object.keys(others).length + 1));
        }
      });

      db.ref('players').on('child_changed', snap => {
        if (snap.key === myId) return;
        const p = snap.val();
        if (Date.now() - (p.ts || 0) < TIMEOUT) {
          others[snap.key] = p;
        } else {
          delete others[snap.key];
        }
      });

      db.ref('players').on('child_removed', snap => {
        if (snap.key === myId) return;
        const name = (others[snap.key] || {}).username || snap.key;
        delete others[snap.key];
        showDebug('➖ Player left: ' + name);
        showDebug('👥 Online now: ' + (Object.keys(others).length + 1));
      });

    } catch(e) {
      showDebug('❌ Exception: ' + e.message);
    }
  }

  // ── Push state ────────────────────────────────────
  function pushState(user) {
    if (!myRef) return Promise.resolve();
    const s = Player.state;
    return myRef.set({
      username: user.username,
      color:    s.color,
      hatColor: s.hatColor,
      wx: s.wx, wy: s.wy,
      dir: s.dir,
      moving: s.moving,
      frame:  s.frame,
      hp: s.hp, maxHp: s.maxHp,
      ts: Date.now(),
    }).catch(e => showDebug('❌ Push error: ' + e.message));
  }

  // ── Stop ──────────────────────────────────────────
  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    if (db) db.ref('players').off();
    if (myRef) { myRef.remove(); myRef = null; }
    for (const k in others) delete others[k];
    myId = null;
    db   = null;
  }

  function getOthers() { return others; }
  function getMyId()   { return myId; }

  // ── Draw other players (FPV: แสดงบน minimap เท่านั้น) ────────────────────────────
  function drawOthers(ctx) {
    for (const id in others) drawRemotePlayerMinimap(ctx, others[id]);
  }

  // วาด dot ผู้เล่นอื่นบน minimap (ใช้ค่าเดียวกับ raycaster minimap)
  function drawRemotePlayerMinimap(ctx, p) {
    const { TILE, MAP_W, MAP_H, VW } = CFG;
    const MW = 120, MH = 90;
    const MX = VW - MW - 8;
    const MY = 50;
    const sx = MW / MAP_W, sy = MH / MAP_H;
    const px = MX + (p.wx / TILE) * sx;
    const py = MY + (p.wy / TILE) * sy;
    ctx.fillStyle = p.color || '#35c5ff';
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
  }

  // ── (LEGACY 2D — ไม่ใช้ใน FPV mode) ──
  function drawRemotePlayer(ctx, p) {
    const s = Camera.toScreen(p.wx, p.wy);
    const x = s.x + 14;
    const y = s.y + 14;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.beginPath();
    ctx.ellipse(0, 14, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = p.moving ? Math.sin((p.frame || 0) * .5) * 2 : 0;

    ctx.fillStyle = p.color || '#35c5ff';
    ctx.beginPath(); ctx.roundRect(-9, -8+bob, 18, 20, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.stroke();

    ctx.fillStyle = '#ffe0b2';
    ctx.beginPath(); ctx.arc(0, -14+bob, 10, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

    const ex = Math.cos(p.dir || 0) * 3;
    const ey = Math.sin(p.dir || 0) * 3;
    ctx.fillStyle = '#222';
    ctx.beginPath(); ctx.arc(ex-3, -14+ey+bob, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ex+3, -14+ey+bob, 2, 0, Math.PI*2); ctx.fill();

    ctx.fillStyle = p.hatColor || '#0055ff';
    ctx.beginPath(); ctx.ellipse(0, -23+bob, 10, 5, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-6, -30+bob, 12, 8);

    const ls = p.moving ? Math.sin((p.frame || 0) * .5) * 5 : 0;
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-7, 12+bob, 6, 10+ls);
    ctx.fillRect( 1, 12+bob, 6, 10-ls);

    ctx.restore();

    ctx.font = 'bold 11px Nunito';
    ctx.textAlign = 'center';
    const tw = ctx.measureText(p.username).width + 10;
    ctx.fillStyle = 'rgba(0,0,150,0.6)';
    ctx.beginPath(); ctx.roundRect(x-tw/2, s.y-38, tw, 18, 4); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText(p.username, x, s.y-25);

    const bw = 40;
    const hpPct = (p.hp || 100) / (p.maxHp || 100);
    ctx.fillStyle = '#333'; ctx.fillRect(x-bw/2, s.y-14, bw, 6);
    ctx.fillStyle = hpPct > 0.6 ? '#4cff72' : hpPct > 0.3 ? '#ffcc00' : '#ff3333';
    ctx.fillRect(x-bw/2, s.y-14, bw*hpPct, 6);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
    ctx.strokeRect(x-bw/2, s.y-14, bw, 6);
  }

  // ── Update HUD list ───────────────────────────────
  function updateOnlineHUD() {
    const el = document.getElementById('online-list');
    if (!el) return;
    const user = Auth.getUser();
    const all  = [
      { username: user ? user.username : 'You', self: true },
      ...Object.values(others),
    ];
    el.innerHTML = all.map(p =>
      `<div class="online-dot ${p.self ? 'self' : ''}">
        <span class="dot"></span>${p.username}${p.self ? ' (คุณ)' : ''}
      </div>`
    ).join('');
  }

  return { start, stop, drawOthers, updateOnlineHUD, getOthers, getMyId };
})();

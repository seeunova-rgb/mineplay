// ═══════════════════════════════════════════════
//  MINEPLAY — input.js  (FPV Edition)
//  WASD เดิน + Mouse / Touch-swipe หมุน
//  Pointer Lock บน Desktop, Swipe บน Mobile
// ═══════════════════════════════════════════════

const Input = (() => {
  // ── Keyboard ──
  const keys = {};
  window.addEventListener('keydown', e => { keys[e.key] = true;  e.preventDefault && ['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code) && e.preventDefault(); });
  window.addEventListener('keyup',   e => { keys[e.key] = false; });

  function isUp()    { return keys['w'] || keys['W'] || keys['ArrowUp']; }
  function isDown()  { return keys['s'] || keys['S'] || keys['ArrowDown']; }
  function isLeft()  { return keys['a'] || keys['A']; }
  function isRight() { return keys['d'] || keys['D']; }
  function isTurnLeft()  { return keys['ArrowLeft'] || keys['q'] || keys['Q']; }
  function isTurnRight() { return keys['ArrowRight'] || keys['e'] || keys['E']; }
  function isRun()   { return keys['Shift'] || touchRun; }

  // ── Mouse look (Pointer Lock) ──
  let mouseDeltaX = 0;
  let pointerLocked = false;

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = !!document.pointerLockElement;
  });

  document.addEventListener('mousemove', e => {
    if (pointerLocked) {
      mouseDeltaX += e.movementX * 0.003;
    }
  });

  // Click canvas เพื่อ lock pointer
  function tryLockPointer() {
    const canvas = document.getElementById('gameCanvas');
    if (canvas && canvas.requestPointerLock) {
      canvas.requestPointerLock();
    }
  }

  // ── Touch look (swipe บนจอ) ──
  let touchLookActive  = false;
  let touchLookId      = null;
  let touchLookStartX  = 0;
  let touchLookLastX   = 0;
  let touchTurnDelta   = 0;
  let touchRun         = false;

  function initTouchLook() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        // ถ้ายังไม่มี look touch ให้จับ
        if (!touchLookActive) {
          touchLookActive = true;
          touchLookId     = t.identifier;
          touchLookStartX = t.clientX;
          touchLookLastX  = t.clientX;
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === touchLookId) {
          const dx = t.clientX - touchLookLastX;
          touchTurnDelta  += dx * 0.004;
          touchLookLastX   = t.clientX;
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchLookId) {
          touchLookActive = false;
          touchLookId     = null;
        }
      }
    }, { passive: true });

    window.addEventListener('touchcancel', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchLookId) {
          touchLookActive = false;
          touchLookId     = null;
        }
      }
    }, { passive: true });

    // click canvas เพื่อ lock pointer บน desktop
    canvas.addEventListener('click', tryLockPointer);
  }

  // ── Virtual Joystick ──
  const joy = { active: false, id: null, dx: 0, dy: 0, baseX: 0, baseY: 0 };

  function initJoystick() {
    const joyEl   = document.getElementById('joystick-zone');
    const joyKnob = document.getElementById('joystick-knob');
    if (!joyEl) return;
    const JR = CFG.JOY_RADIUS;

    function joyMove(cx, cy) {
      let dx = cx - joy.baseX, dy = cy - joy.baseY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist > JR) { dx = dx/dist*JR; dy = dy/dist*JR; }
      joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      joy.dx = dx / JR; joy.dy = dy / JR;
    }

    function joyStart(id, cx, cy) {
      const r = joyEl.getBoundingClientRect();
      joy.active = true; joy.id = id;
      joy.baseX  = r.left + r.width  / 2;
      joy.baseY  = r.top  + r.height / 2;
      joyMove(cx, cy);
    }

    function joyEnd() {
      joy.active = false; joy.id = null; joy.dx = 0; joy.dy = 0;
      joyKnob.style.transform = 'translate(-50%,-50%)';
    }

    joyEl.addEventListener('touchstart', e => {
      e.preventDefault();
      const t = e.changedTouches[0];
      joyStart(t.identifier, t.clientX, t.clientY);
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      e.preventDefault();
      for (const t of e.changedTouches)
        if (t.identifier === joy.id) { joyMove(t.clientX, t.clientY); break; }
    }, { passive: false });

    window.addEventListener('touchend', e => {
      for (const t of e.changedTouches)
        if (t.identifier === joy.id) { joyEnd(); break; }
    }, { passive: true });

    window.addEventListener('touchcancel', e => {
      for (const t of e.changedTouches)
        if (t.identifier === joy.id) { joyEnd(); break; }
    }, { passive: true });

    // Mouse fallback
    let mouseJoy = false;
    joyEl.addEventListener('mousedown', e => {
      mouseJoy = true;
      const r = joyEl.getBoundingClientRect();
      joy.active = true;
      joy.baseX  = r.left + r.width  / 2;
      joy.baseY  = r.top  + r.height / 2;
      joyMove(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => { if (mouseJoy) joyMove(e.clientX, e.clientY); });
    window.addEventListener('mouseup',   () => { if (mouseJoy) { mouseJoy = false; joyEnd(); } });
  }

  // ── Action buttons ──
  function initButtons() {
    const btnRun = document.getElementById('btn-run');
    if (!btnRun) return;
    btnRun.addEventListener('touchstart', e => { e.preventDefault(); touchRun = true;  btnRun.classList.add('pressed'); }, { passive: false });
    btnRun.addEventListener('touchend',   e => { e.preventDefault(); touchRun = false; btnRun.classList.remove('pressed'); }, { passive: false });
    btnRun.addEventListener('touchcancel', () => { touchRun = false; btnRun.classList.remove('pressed'); });
    btnRun.addEventListener('mousedown', () => { touchRun = true;  btnRun.classList.add('pressed'); });
    btnRun.addEventListener('mouseup',   () => { touchRun = false; btnRun.classList.remove('pressed'); });
  }

  // ── Show/hide touch UI ──
  function initTouchUI() {
    const show = () => {
      const jz = document.getElementById('joystick-zone');
      const az = document.getElementById('action-zone');
      const ph = document.getElementById('pc-hint');
      if (jz) jz.style.display = 'block';
      if (az) az.style.display = 'flex';
      if (ph) ph.style.display = 'none';
    };
    const hasTouchScreen = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );
    if (hasTouchScreen) show();
    window.addEventListener('touchstart', show, { once: true, passive: true });
  }

  // ── Get movement vector (forward/back แยกจาก strafe) ──
  function getMove() {
    const dz = CFG.JOY_DEADZONE;
    // dy = เดินหน้า/หลัง, dx = strafe ซ้าย/ขวา
    let fwd = 0, strafe = 0;
    if (isUp())    fwd    -= 1;
    if (isDown())  fwd    += 1;
    if (isLeft())  strafe -= 1;
    if (isRight()) strafe += 1;

    if (joy.active) {
      if (Math.abs(joy.dy) > dz) fwd    += joy.dy;
      if (Math.abs(joy.dx) > dz) strafe += joy.dx;
    }
    return { dx: strafe, dy: fwd };
  }

  // คืนค่า turn delta และ reset
  function consumeTurnDelta() {
    let d = mouseDeltaX + touchTurnDelta;
    // keyboard turn
    if (isTurnLeft())  d -= 0.05;
    if (isTurnRight()) d += 0.05;
    mouseDeltaX   = 0;
    touchTurnDelta = 0;
    return d;
  }

  function init() {
    initTouchUI();
    initJoystick();
    initButtons();
    initTouchLook();
  }

  return { init, getMove, consumeTurnDelta, isRun, keys };
})();

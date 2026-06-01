// ═══════════════════════════════════════════════
//  MINEPLAY — auth.js
//  v0.1.9 — Single-session + Remember login
//           + 1 device = 1 account lock
// ═══════════════════════════════════════════════

const Auth = (() => {
  const firebaseConfig = {
    apiKey: "AIzaSyBT_6j1Sg7cqFJRxQneKXVwU_5pOU_RluQ",
    authDomain: "mineplay-online.firebaseapp.com",
    databaseURL: "https://mineplay-online-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mineplay-online",
    storageBucket: "mineplay-online.firebasestorage.app",
    messagingSenderId: "240664126634",
    appId: "1:240664126634:web:7410f6b5416728590b1cd3",
  };

  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

  let currentUser = null;

  // ── Storage keys ───────────────────────────────
  const SESSION_KEY = 'mineplay_session';   // { username, password }
  const DEVICE_KEY  = 'mineplay_loggedin';  // username ที่ล็อคอินอยู่บนเครื่องนี้

  function saveSession(username, password) {
    try { localStorage.setItem(SESSION_KEY, JSON.stringify({ username, password })); } catch(e) {}
  }
  function loadSession() {
    try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch(e) { return null; }
  }
  function clearSession() {
    try { localStorage.removeItem(SESSION_KEY); } catch(e) {}
  }

  // เครื่องนี้กำลังล็อคอินเป็นใครอยู่
  function getDeviceUser() {
    try { return localStorage.getItem(DEVICE_KEY) || null; } catch(e) { return null; }
  }
  function setDeviceUser(username) {
    try { localStorage.setItem(DEVICE_KEY, username ? username.toLowerCase() : ''); } catch(e) {}
  }
  function clearDeviceUser() {
    try { localStorage.removeItem(DEVICE_KEY); } catch(e) {}
  }

  // ── Helpers ────────────────────────────────────
  function genToken() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function hashPass(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++)
      hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    return (hash >>> 0).toString(36);
  }

  const COLORS = ['#ff6b35','#35c5ff','#ff35a2','#a2ff35','#ffcc00','#c535ff'];
  const HATS   = ['#ff0055','#0055ff','#ff00aa','#00aa55','#ff9900','#9900ff'];
  function db() { return firebase.database(); }

  // ── Login ──────────────────────────────────────
  async function login(username, password, remember = true) {
    if (!username || !password) return { ok: false, msg: 'กรุณากรอกข้อมูลให้ครบ' };

    const key = username.toLowerCase();

    // ── ตรวจสอบ: เครื่องนี้ล็อคอินบัญชีอื่นอยู่หรือเปล่า ──
    const deviceUser = getDeviceUser();
    if (deviceUser && deviceUser !== key) {
      return {
        ok: false,
        msg: `เครื่องนี้ล็อคอินเป็น "${deviceUser}" อยู่แล้ว กรุณาออกจากระบบก่อน`,
      };
    }

    try {
      const snap = await db().ref('accounts/' + key).get();
      if (!snap.exists()) return { ok: false, msg: 'ไม่พบชื่อผู้ใช้นี้' };
      const data = snap.val();
      if (data.pass !== hashPass(password)) return { ok: false, msg: 'รหัสผ่านไม่ถูกต้อง' };

      // สร้าง session token ใหม่ → เครื่องอื่นที่ใช้ account นี้จะถูกเตะออก
      const token = genToken();
      await db().ref('accounts/' + key + '/sessionToken').set(token);

      currentUser = {
        username: data.displayName,
        color:    data.color,
        hatColor: data.hatColor,
        key, token,
      };

      setDeviceUser(key);
      if (remember) saveSession(username, password);

      return { ok: true };
    } catch(e) {
      return { ok: false, msg: 'เกิดข้อผิดพลาด: ' + e.message };
    }
  }

  // ── Register ───────────────────────────────────
  async function register(username, password) {
    if (!username || !password) return { ok: false, msg: 'กรุณากรอกข้อมูลให้ครบ' };
    if (username.length < 3)    return { ok: false, msg: 'ชื่อต้องมีอย่างน้อย 3 ตัวอักษร' };
    if (password.length < 4)    return { ok: false, msg: 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร' };
    if (!/^[a-zA-Z0-9_ก-๙]+$/.test(username)) return { ok: false, msg: 'ชื่อมีอักขระที่ไม่รองรับ' };

    // ── ตรวจสอบ: เครื่องนี้ล็อคอินอยู่แล้วหรือเปล่า ──
    const deviceUser = getDeviceUser();
    if (deviceUser) {
      return {
        ok: false,
        msg: `เครื่องนี้ล็อคอินเป็น "${deviceUser}" อยู่แล้ว กรุณาออกจากระบบก่อน`,
      };
    }

    const key = username.toLowerCase();
    try {
      const snap = await db().ref('accounts/' + key).get();
      if (snap.exists()) return { ok: false, msg: 'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว' };
      const allSnap = await db().ref('accounts').get();
      const count = allSnap.exists() ? Object.keys(allSnap.val()).length : 0;
      const idx = count % COLORS.length;
      const token = genToken();
      await db().ref('accounts/' + key).set({
        displayName: username,
        pass: hashPass(password),
        color: COLORS[idx],
        hatColor: HATS[idx],
        createdAt: Date.now(),
        sessionToken: token,
      });
      currentUser = { username, color: COLORS[idx], hatColor: HATS[idx], key, token };
      setDeviceUser(key);
      saveSession(username, password);
      return { ok: true };
    } catch(e) {
      return { ok: false, msg: 'เกิดข้อผิดพลาด: ' + e.message };
    }
  }

  // ── Watch session (ถูกเตะจากเครื่องอื่น) ────────
  function watchSession(onKicked) {
    if (!currentUser) return;
    const { key, token } = currentUser;
    db().ref('accounts/' + key + '/sessionToken').on('value', snap => {
      if (!snap.exists()) return;
      if (snap.val() !== token) {
        db().ref('accounts/' + key + '/sessionToken').off();
        onKicked();
      }
    });
  }

  function stopWatchSession() {
    if (!currentUser) return;
    db().ref('accounts/' + currentUser.key + '/sessionToken').off();
  }

  // ── Auto-login ────────────────────────────────
  async function tryAutoLogin() {
    const saved = loadSession();
    if (!saved) return { ok: false };
    return await login(saved.username, saved.password, false);
  }

  // ── Logout ────────────────────────────────────
  function logout() {
    stopWatchSession();
    clearSession();
    clearDeviceUser();
    currentUser = null;
  }

  function getUser() { return currentUser; }

  return { login, register, logout, getUser, watchSession, tryAutoLogin, clearSession };
})();

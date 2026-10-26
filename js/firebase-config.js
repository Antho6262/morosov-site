// ============================================================
// MOROSOV — Config Firebase
// Remplace le bloc ci-dessous par celui de TON projet Firebase :
// Console Firebase → Paramètres du projet → Général → Tes applications → Web (</>)
// ============================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCRrO6RryLv7qPGlbV4JbnUsaHgVVTN6Js",
  authDomain: "nemezis-2aa1f.firebaseapp.com",
  databaseURL: "https://nemezis-2aa1f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nemezis-2aa1f",
  storageBucket: "nemezis-2aa1f.firebasestorage.app",
  messagingSenderId: "830745761363",
  appId: "1:830745761363:web:44b5af8162f8940f0a98a6"
};

// Toutes les données de Morosov sont rangées dans le dossier "morosov/" de la base :
// aucun mélange avec les autres sites qui utilisent le même projet Firebase.
const DB_RACINE = 'morosov';
firebase.initializeApp(FIREBASE_CONFIG);
const _firebaseDb = firebase.database();
const db = { ref: (chemin) => _firebaseDb.ref(DB_RACINE + '/' + (chemin || '')) };

// Grades fixes du groupe (créés automatiquement à l'initialisation)
const GRADES_DEFAUT = [
  { id: 'fondateur', nom: 'Fondateur',  emoji: '🧭', ordre: 0 },
  { id: 'lead',      nom: 'Lead',       emoji: '👑', ordre: 1 },
  { id: 'colead',    nom: 'Co Lead',    emoji: '☠️', ordre: 2 },
  { id: 'brasdroit', nom: 'Bras Droit', emoji: '⚔️', ordre: 3 },
  { id: 'amiral',    nom: 'Amiral',     emoji: '⚓', ordre: 4 },
  { id: 'sergent',   nom: 'Sergent',    emoji: '🎖️', ordre: 5 },
  { id: 'membre',    nom: 'Membre',     emoji: '🗡️', ordre: 6 },
  { id: 'recrue',    nom: 'Recrue',     emoji: '🔹', ordre: 7 },
];

function gradeInfo(id) {
  return GRADES_DEFAUT.find(g => g.id === id) || GRADES_DEFAUT[GRADES_DEFAUT.length - 1];
}

// Neige qui tombe en fond (canvas léger, coupée si l'utilisateur réduit les animations)
function startSnow() {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.getElementById('snow')) return;
    const cv = document.createElement('canvas');
    cv.id = 'snow';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    let W = 0, H = 0;
    const resize = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const N = Math.min(110, Math.round(window.innerWidth / 14));
    const flakes = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: 0.8 + Math.random() * 2.2, v: 0.35 + Math.random() * 1.1, d: Math.random() * Math.PI * 2, o: 0.35 + Math.random() * 0.55
    }));
    (function tick() {
      ctx.clearRect(0, 0, W, H);
      flakes.forEach(f => {
        f.d += 0.012; f.y += f.v; f.x += Math.sin(f.d) * 0.45 + 0.15;
        if (f.y > H + 5) { f.y = -5; f.x = Math.random() * W; }
        if (f.x > W + 5) f.x = -5;
        ctx.beginPath(); ctx.fillStyle = 'rgba(225,240,255,' + f.o + ')';
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      });
      requestAnimationFrame(tick);
    })();
  } catch (e) { console.error('startSnow', e); }
}

// ---- Session (stockée dans l'onglet du navigateur) ----
function getSession() {
  try { return JSON.parse(sessionStorage.getItem('morosov_session') || 'null'); }
  catch (e) { return null; }
}
function setSession(membre) {
  sessionStorage.setItem('morosov_session', JSON.stringify(membre));
}
function clearSession() {
  sessionStorage.removeItem('morosov_session');
}
function requireSession() {
  const s = getSession();
  if (!s) {
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? '../index.html' : 'index.html';
    return null;
  }
  return s;
}
function isAdmin(membre) {
  return !!(membre && membre.role === 'admin');
}

// ---- Utilitaire : Object -> [[id, val], ...] (jamais orderByChild) ----
function entries(obj) {
  return Object.entries(obj || {});
}

function fmtMoney(n) {
  return '$' + Math.round(Number(n) || 0).toLocaleString('fr-FR');
}

function fmtDateHeure(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

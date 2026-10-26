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

// Grades du groupe : valeurs par défaut, modifiables ensuite dans Admin → Grades (stockées dans la base, mises en cache localement)
const GRADES_INIT = [
  { id: 'fondateur', nom: 'Fondateur',  emoji: '🧭', ordre: 0, gestion: true },
  { id: 'lead',      nom: 'Lead',       emoji: '👑', ordre: 1, gestion: true },
  { id: 'colead',    nom: 'Co Lead',    emoji: '☠️', ordre: 2, gestion: true },
  { id: 'brasdroit', nom: 'Bras Droit', emoji: '⚔️', ordre: 3, gestion: true },
  { id: 'amiral',    nom: 'Amiral',     emoji: '⚓', ordre: 4, gestion: true },
  { id: 'sergent',   nom: 'Sergent',    emoji: '🎖️', ordre: 5, gestion: true },
  { id: 'membre',    nom: 'Membre',     emoji: '🗡️', ordre: 6, gestion: false },
  { id: 'recrue',    nom: 'Recrue',     emoji: '🔹', ordre: 7, gestion: false },
];
const GRADES_DEFAUT = (function () {
  try {
    const c = JSON.parse(localStorage.getItem('morosov_grades'));
    if (Array.isArray(c) && c.length) return c;
  } catch (e) {}
  return GRADES_INIT.slice();
})();

// Synchronise la liste avec la base ; recharge la page une seule fois si elle a changé
db.ref('grades').on('value', snap => {
  const v = snap.val();
  if (!v) return;
  const liste = Object.entries(v).map(([id, g]) => ({ id, nom: g.nom || id, emoji: g.emoji || '🔹', ordre: g.ordre || 0, gestion: !!g.gestion }))
    .sort((x, y) => x.ordre - y.ordre);
  if (!liste.length) return;
  if (JSON.stringify(liste) === JSON.stringify(GRADES_DEFAUT)) return;
  try { localStorage.setItem('morosov_grades', JSON.stringify(liste)); } catch (e) {}
  GRADES_DEFAUT.splice(0, GRADES_DEFAUT.length, ...liste);
  location.reload();
});

function gradeInfo(id) {
  return GRADES_DEFAUT.find(g => g.id === id) || GRADES_DEFAUT[GRADES_DEFAUT.length - 1];
}

// Limites de braquages d'une Organisation (règlement du serveur), par semaine glissante de 7 jours
const LIMITES_BRAQUAGES = [
  { node: 'fleecas',     label: '🏦 Banque (Fleeca)', max: 12 },
  { node: 'bijouteries', label: '💎 Bijouterie',       max: 4 },
  { node: 'armureries',  label: '🔫 Armurerie',        max: 12 },
  { node: 'pacifics',    label: '🏛️ Pacific Bank',     max: 2 },
  { node: 'humanlabs',   label: '🧬 Human Labs',       max: 1 },
];

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
    const N = Math.min(55, Math.round(window.innerWidth / 30));
    const flakes = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      r: 0.8 + Math.random() * 2.2, v: 0.35 + Math.random() * 1.1, d: Math.random() * Math.PI * 2, o: 0.25 + Math.random() * 0.4
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

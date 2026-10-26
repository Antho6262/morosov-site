// ============================================================
// MOROSOV — Config Firebase
// Même projet Firebase que ton ancien site (gratuit, rien à créer),
// mais toutes les données de Morosov sont rangées dans un dossier à part
// ("morosov/") : aucun mélange avec les autres groupes.
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
const DB_RACINE = 'morosov';

firebase.initializeApp(FIREBASE_CONFIG);
const _firebaseDb = firebase.database();
// Toutes les lectures / écritures passent par ce dossier
const db = { ref: (chemin) => _firebaseDb.ref(DB_RACINE + '/' + (chemin || '')) };

// Hiérarchie : Fondateur (créateur du site) › Organisation (Morosov) › Lead (Daria) › Co Lead (Alex, Dimitri) › Membre › Recrue
const GRADES_DEFAUT = [
  { id: 'fondateur', nom: 'Fondateur',    emoji: '🧊', ordre: 0 },
  { id: 'orga',      nom: 'Organisation', emoji: '🏛️', ordre: 1 },
  { id: 'lead',      nom: 'Lead',         emoji: '👑', ordre: 2 },
  { id: 'colead',    nom: 'Co Lead',      emoji: '❄️', ordre: 3 },
  { id: 'membre',    nom: 'Membre',       emoji: '🔹', ordre: 4 },
  { id: 'recrue',    nom: 'Recrue',       emoji: '▫️', ordre: 5 },
];

// Objectifs hebdomadaires (modifiables dans Admin → Quotas)
//  - par membre : cotisation, labos, récoltes
//  - pour le groupe entier : bijouteries, banques, armureries
const QUOTAS_DEFAUT = { cotisation: 28000, labo: 15, recolte: 5000, bijouterie: 4, banque: 12, armurerie: 12 };
// Rémunération : à renseigner dans Admin → Taux quand le lead aura donné les montants
const CONFIG_DEFAUT = { taux_action_pct: 0, taux_labo: 0, taux_recolte: 0, taux_pochon: 0, blanchiment_taux: 20 };
function getConfig(raw) {
  const c = Object.assign({}, CONFIG_DEFAUT, raw || {});
  c.quotas = Object.assign({}, QUOTAS_DEFAUT, (raw && raw.quotas) || {});
  return c;
}

// Types d'action (revenus du groupe) — modifiables dans Admin → Types d'action
const TYPES_ACTION_DEFAUT = [
  { emoji: '🏧', nom: 'ATM' }, { emoji: '🏠', nom: 'Cambu' }, { emoji: '📦', nom: 'Conteneur' },
  { emoji: '🏪', nom: 'Supérette' }, { emoji: '⛽', nom: 'LTD' }, { emoji: '🚗', nom: 'Go Fast' }
];

// Produits des labos : 1 labo max par heure = 150 pochons ; ingrédients = 150 + 150 par labo
const LABOS_PRODUITS = {
  'Meth':    { emoji: '🍄', pochons: 150, ingredients: [['champignon vert', 150], ['champignon rouge', 150]] },
  'Cocaïne': { emoji: '🌿', pochons: 150, ingredients: [['feuille', 150], ['acide', 150]] },
};
const RECOLTE_PRODUITS = [
  { nom: 'Champignon vert', emoji: '🍄', match: 'champignon vert' },
  { nom: 'Champignon rouge', emoji: '🍄', match: 'champignon rouge' },
  { nom: 'Feuille de cocaïne', emoji: '🌿', match: 'feuille' },
  { nom: 'Acide', emoji: '🧪', match: 'acide' },
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

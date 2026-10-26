# ❄️ MOROSOV — Site

Même fonctionnement que le site Mugiwara (Dashboard, Planning, Tracker, Stock, Armes, Transactions, Blanchiment, Stats & Quotas, Paye, Taxes, Admin, Profil, Mode TV).

## Firebase
Le site utilise le projet Firebase existant (config dans `js/firebase-config.js`). Les données de Morosov sont rangées dans le dossier `morosov/` de la base, séparées des autres groupes.

## Premier lancement
Ouvre `index.html` → **Initialiser le site** → crée ton compte Fondateur (accès admin). Ajoute ensuite les membres dans **Admin → Membres**, puis règle taux, quotas et types d'action dans Admin.

## Déployer (GitHub Pages)
```bash
git add -A
git commit -m "Morosov"
git push
```
GitHub → Settings → Pages → branche `main`, dossier `/ (root)`.

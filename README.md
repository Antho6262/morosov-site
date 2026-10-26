# ❄️ МОРОЗОВ — Site de l'organisation

## 1. Firebase
Le site utilise le projet Firebase existant (config déjà dans `js/firebase-config.js`). Les données de Morosov sont rangées dans le dossier `morosov/` de la base, séparées des autres groupes. Pour changer de projet, remplace le bloc `FIREBASE_CONFIG`.
Les règles de la base doivent autoriser la lecture/écriture : `{ "rules": { ".read": true, ".write": true } }`

## 2. Initialiser
Ouvre `index.html` → **Initialiser le site** → crée ton compte Fondateur (accès admin). Ajoute ensuite les membres dans **Admin → Membres**.

## 3. Ce que le site gère
- **Hiérarchie** : Fondateur (toi) › Organisation (Morosov) › Lead (Daria) › Co Lead (Alex, Dimitri) › Membre › Recrue.
- **Cotisation** : 28 000 $ par membre et par semaine, calculée sur les actions ATM, Cambu, Conteneur, Supérette, LTD, Go Fast.
- **Quotas par membre** : 15 labos, 5 000 récoltes (tous produits confondus).
- **Objectifs du groupe** : 4 bijouteries, 12 banques, 12 armureries par semaine.
- **Labos** : Meth (150 champignons verts + 150 rouges) et Cocaïne (150 feuilles + 150 acide) = 150 pochons par labo, 1 labo max par heure. Les ingrédients sont retirés du Stock, les récoltes y sont ajoutées (si le produit existe, avec "champignon vert", "champignon rouge", "feuille", "acide" dans son nom).
- **Tenue** : haut blanc, bas bleu, accessoire blanc (facultatif).
- **Paye** : taux à 0 par défaut. À renseigner dans **Admin → Taux** quand le lead donne les montants.
- Tous les objectifs se modifient dans **Admin → Quotas**.

## Déployer (GitHub Pages)
```bash
cd morosov-site
git init
git add .
git commit -m "Init Morosov"
git branch -M main
git remote add origin https://github.com/TON_COMPTE/morosov-site.git
git push -u origin main
```
Puis GitHub → Settings → Pages → branche `main`, dossier `/ (root)`.

# 📚 INDEX - Médicorp Documentation

## 🎯 Démarrage Rapide

### Pour Utilisateurs Finaux

1. **Démarrer l'application:** `npm start`
2. **Accéder:** `http://localhost:3000`
3. **Fiche Matériaux:** `http://localhost:3000/materials.html`

### Premiers Pas

- 📖 Lire: [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)
- 💡 Exemples: [EXAMPLES_MATERIAUX.md](EXAMPLES_MATERIAUX.md)

---

## 📋 Documentation Par Sujet

### 🛍️ Utilisation Quotidienne

| Document                                       | Contenu               | Audience  |
| ---------------------------------------------- | --------------------- | --------- |
| [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)   | Cas d'usage pratiques | Tous      |
| [EXAMPLES_MATERIAUX.md](EXAMPLES_MATERIAUX.md) | Exemples matériaux    | Acheteurs |
| [README.md](README.md)                         | Présentation générale | Tous      |

### 🔧 Technique & Développement

| Document                                           | Contenu                   | Audience     |
| -------------------------------------------------- | ------------------------- | ------------ |
| [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)             | Structure données JSON    | Développeurs |
| [MATERIAUX_COMPOSITES.md](MATERIAUX_COMPOSITES.md) | Spécifications matériaux  | Tech/Achat   |
| [CHANGELOG.md](CHANGELOG.md)                       | Historique v1→v2          | Développeurs |
| [UPDATES_v2.1.md](UPDATES_v2.1.md)                 | Nouvelles fonctionnalités | Tous         |

---

## 🗂️ Structure Fichiers

```
Médicorp/
├── 📄 Documentation
│   ├── README.md                      # Présentation générale
│   ├── GUIDE_UTILISATION.md           # Guide pratique
│   ├── TECHNICAL_DOCS.md              # Spécifications techniques
│   ├── MATERIAUX_COMPOSITES.md        # Système matériaux
│   ├── EXAMPLES_MATERIAUX.md          # Cas d'usage pratiques
│   ├── CHANGELOG.md                   # Historique versions
│   ├── UPDATES_v2.1.md                # Dernières mises à jour
│   └── INDEX.md                       # Ce fichier
│
├── 🖥️ Backend
│   ├── server.js                      # Serveur Express
│   ├── data.json                      # Base de données
│   ├── package.json                   # Dépendances
│   └── package-lock.json              # Lock fichier
│
├── 🎨 Frontend
│   └── public/
│       ├── index.html                 # Page principale
│       ├── materials.html             # Fiche matériaux
│       ├── app.js                     # Logique JS
│       └── style.css                  # Styles
│
└── 📦 Dépendances
    └── node_modules/
```

---

## 🔌 API REST disponibles

### Routes Principales

| Méthode | Route                | Description               |
| ------- | -------------------- | ------------------------- |
| GET     | `/api/products`      | Tous produits + matériaux |
| GET     | `/api/subscriptions` | Abonnements               |
| POST    | `/api/calculate`     | Calcul prix               |
| **GET** | **`/api/materials`** | **Matériaux avec coûts**  |

### Exemples Requêtes

```bash
# Récupérer matériaux avec coûts
curl http://localhost:3000/api/materials

# Récupérer tous produits
curl http://localhost:3000/api/products

# Récupérer abonnements
curl http://localhost:3000/api/subscriptions

# Calculer prix
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"productId": "implant_t1_hyperdermique", "quantity": 2}
    ],
    "subscriptionId": "sub_premium"
  }'
```

---

## 📊 Données Disponibles

### Produits (25 total)

- **Implants:** 9 produits (T1, T2, T2MK2 × 3 types)
- **Éléments:** 4 produits (Kits, Grenades, Botas)
- **Stims:** 12 produits (T1-T3 × 4 types)

### Matériaux (16 total)

- **Simples:** 12 (métaux, fibres, chimiques, etc.)
- **Composites:** 4 (Duracier T1/T2, Transparacier T1/T2)

### Abonnements (4)

- Sans Abonnement (0%)
- Standard (10%)
- Premium (20%)
- Elite (30%)

---

## 🚀 Installation & Lancement

### Prérequis

- Node.js v14+
- npm v6+

### Installer

```bash
cd "a:\projet perso\Médicorp"
npm install
```

### Lancer

```bash
npm start
```

### Accéder

- **Interface principale:** http://localhost:3000
- **Fiche matériaux:** http://localhost:3000/materials.html

---

## 🎯 Fonctionnalités Principales

### ✅ Système de Prix

- Calcul automatique avec réductions
- Support abonnements multiples
- Produits réductibles/non-réductibles
- Marges bénéficiaires affichées

### ✅ Gestion Matériaux

- 12 matériaux simples
- 4 matériaux composites avec composition
- Calcul coûts automatique
- Fiche dédiée pour employés

### ✅ Interface

- Onglets pour navigation
- Sélection par tier (Implants/Stims)
- Grille responsive
- Panier en temps réel
- Résumé détaillé

### ✅ API REST

- Endpoints structurés
- JSON standardisé
- Calculs côté serveur
- Extensible

---

## 📱 Pages Disponibles

| URL               | Titre                | Fonction            |
| ----------------- | -------------------- | ------------------- |
| `/`               | Interface principale | Saisie commandes    |
| `/materials.html` | Fiche matériaux      | Consultation tarifs |

---

## 🔄 Workflow Typique

### Pour Acheteur

1. Ouvrir http://localhost:3000/materials.html
2. Consulter tarifs matériaux simples/composites
3. Analyser compositions et coûts
4. Valider budget d'approvisionnement

### Pour Vendeur

1. Ouvrir http://localhost:3000
2. Sélectionner abonnement client
3. Ajouter produits au panier
4. Vérifier prix et marges
5. Générer devis

---

## 💾 Données Clés

### Fichier Principal: `data.json`

```json
{
  "materials": {
    "simple": [...],      // 12 matériaux de base
    "composite": [...]    // 4 matériaux composés
  },
  "products": {
    "implants": { "T1": [...], "T2": [...], "T2MK2": [...] },
    "basicElements": [...],
    "stims": { "T1": [...], "T2": [...], "T3": [...] }
  },
  "subscriptions": [...]
}
```

---

## 🎓 Apprentissage

### Niveau 1: Utilisateur

📖 Lire [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)

### Niveau 2: Acheteur

📖 Lire [EXAMPLES_MATERIAUX.md](EXAMPLES_MATERIAUX.md)

### Niveau 3: Développeur

📖 Lire [TECHNICAL_DOCS.md](TECHNICAL_DOCS.md)

### Niveau 4: Expert

📖 Lire tous les fichiers + examiner `data.json`

---

## ⚡ Raccourcis Utiles

### Terminal

```bash
# Démarrer
npm start

# Installer dépendances
npm install

# Visiter
http://localhost:3000
http://localhost:3000/materials.html
```

### Fichiers Clés

- **Configuration:** `package.json`
- **Données:** `data.json`
- **Serveur:** `server.js`
- **HTML:** `public/index.html`, `public/materials.html`
- **JS:** `public/app.js`
- **Styles:** `public/style.css`

---

## ❓ FAQ Rapide

**Q: Où modifier les prix?**  
R: `data.json` → `materials` → `pricePerUnit`

**Q: Ajouter un nouveau produit?**  
R: Éditer `data.json` → `products` → catégorie appropriée

**Q: Créer un nouveau matériau composite?**  
R: Ajouter à `data.json` → `materials.composite`

**Q: Modifier abonnements?**  
R: Éditer `data.json` → `subscriptions`

---

## 📞 Support

- 📧 Questions techniques → Examiner `TECHNICAL_DOCS.md`
- 📧 Questions d'usage → Examiner `GUIDE_UTILISATION.md`
- 📧 Questions matériaux → Examiner `MATERIAUX_COMPOSITES.md`
- 📧 Exemples → Examiner `EXAMPLES_MATERIAUX.md`

---

## 📈 Versions

| Version | Date   | Focus                         |
| ------- | ------ | ----------------------------- |
| v1.0    | 19 fév | Calculateur prix initial      |
| v2.0    | 19 fév | Refonte interface + matériaux |
| v2.1    | 19 fév | Matériaux composites + Fiche  |

---

## ✅ Checklist Démarrage

- [ ] Node.js installé
- [ ] `npm install` exécuté
- [ ] `npm start` lancé
- [ ] http://localhost:3000 accessible
- [ ] http://localhost:3000/materials.html accessible
- [ ] Documentation lue
- [ ] Cas d'usage compris

---

_Index Documentation Complète - Médicorp_  
_Mise à jour: 19 février 2026_  
_Version: 2.1_

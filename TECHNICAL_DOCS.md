# Documentation Technique - Structure des Données

## 🗂️ Architecture data.json

### Section 1 : Matériaux

```json
"materials": [
  {
    "id": "mat_chromium",
    "name": "Chromium",
    "pricePerUnit": 10,
    "category": "metal"
  }
]
```

**Catégories disponibles :**

- `metal` : Chromium, Platinum, Titanium, Durasteel
- `fiber` : Fibre Synthétique
- `chemical` : Kolto, Bacta
- `electronics` : Composants Électroniques
- `biological` : Matrice Protéinée

---

### Section 2 : Produits

#### 2.1 Implants (Hiérarchie par Tier)

```json
"implants": {
  "T1": [
    {
      "id": "implant_t1_hyperdermique",
      "name": "Hyperdermique",
      "tier": "T1",
      "type": "Hyperdermique",
      "category": "implants",
      "basePrice": 450,
      "fabricationCost": 150,
      "discountable": true,
      "materials": {
        "mat_chromium": 5,
        "mat_synthetic_fiber": 3,
        "mat_electronics": 2
      }
    }
  ],
  "T2": [...],
  "T2MK2": [...]
}
```

**Caractéristiques Implants :**

- ✅ Tous réductibles
- 📦 Chacun demande 2-4 matériaux différents
- 💰 Prix de base : 450€ (T1) à 1050€ (T2 MK2)
- 🔧 3 types par tier (Hyperdermique, Servomoteur, Biomoniteur)

---

#### 2.2 Éléments Basiques (Tableau Plat)

```json
"basicElements": [
  {
    "id": "kit_soins_t2",
    "name": "Kit de Soins T2",
    "category": "basicElements",
    "basePrice": 120,
    "fabricationCost": 40,
    "discountable": true,
    "materials": {
      "mat_kolto": 3,
      "mat_synthetic_fiber": 2
    }
  },
  {
    "id": "grenade_kolto",
    "name": "Grenade Kolto",
    "category": "basicElements",
    "basePrice": 80,
    "fabricationCost": 25,
    "discountable": false,
    "materials": {}  // Aucun matériau
  }
]
```

**Caractéristiques :**

- 2 produits réductibles (Kits)
- 2 produits NON réductibles (Grenade, Bota)
- Grenade et Bota n'ont PAS de matériaux (`materials: {}`)
- Prix bas, marge faible

---

#### 2.3 Stims (Hiérarchie par Tier)

```json
"stims": {
  "T1": [
    {
      "id": "stim_t1_bota",
      "name": "Bota",
      "tier": "T1",
      "type": "Bota",
      "category": "stims",
      "basePrice": 60,
      "fabricationCost": 20,
      "discountable": true,
      "materials": {
        "mat_kolto": 2
      }
    }
  ],
  "T2": [...],
  "T3": [...]
}
```

**Caractéristiques Stims :**

- ✅ Tous réductibles
- 4 types par tier (Bota, Adrénaline, Endurol, Stéroide)
- 📦 Chacun demande 1-3 matériaux
- 💰 Prix T1: 60-75€, T3: 180-225€
- 12 produits au total (3 tiers × 4 types)

---

### Section 3 : Abonnements

```json
"subscriptions": [
  {
    "id": "sub_none",
    "name": "Sans Abonnement",
    "discountPercentage": 0
  },
  {
    "id": "sub_standard",
    "name": "Abonnement Standard",
    "discountPercentage": 10
  },
  {
    "id": "sub_premium",
    "name": "Abonnement Premium",
    "discountPercentage": 20
  },
  {
    "id": "sub_elite",
    "name": "Abonnement Elite",
    "discountPercentage": 30
  }
]
```

**Règle :** La réduction s'applique sur `basePrice` seulement si `discountable: true`

---

## 📐 Formules de Calcul

### Par Article

```
Prix base = basePrice × quantity
Réduction = Prix base × (discountPercentage / 100) si discountable, sinon 0
Prix final article = Prix base - Réduction
Coût fab article = fabricationCost × quantity
```

### Global

```
Prix base total = Σ(Prix base par article)
Réduction total = Σ(Réduction par article)
Prix total = Prix base total - Réduction total
Coût fab total = Σ(Coût fab par article)
Marge = Prix total - Coût fab total
```

---

## 🔍 Requêtes API

### GET /api/products

Retourne :

```json
{
  "products": {
    "implants": { "T1": [...], "T2": [...], "T2MK2": [...] },
    "basicElements": [...],
    "stims": { "T1": [...], "T2": [...], "T3": [...] }
  },
  "materials": [...]
}
```

### GET /api/subscriptions

Retourne :

```json
[
  { "id": "sub_none", "name": "Sans Abonnement", "discountPercentage": 0 },
  ...
]
```

### POST /api/calculate

**Entrée :**

```json
{
  "items": [
    { "productId": "implant_t1_hyperdermique", "quantity": 2 },
    { "productId": "kit_soins_t2", "quantity": 5 }
  ],
  "subscriptionId": "sub_premium"
}
```

**Sortie :**

```json
{
  "subscription": "Abonnement Premium",
  "subscriptionDiscount": 20,
  "items": [
    {
      "product": "Implant T1 - Hyperdermique",
      "quantity": 2,
      "basePrice": 900,
      "discount": 180,
      "finalPrice": 720,
      "fabricationCost": 300,
      "discountable": true
    },
    ...
  ],
  "totalBasePrice": 1500,
  "totalDiscount": 300,
  "totalPrice": 1200,
  "totalFabricationCost": 600,
  "margin": 600
}
```

---

## 📊 Statistiques des Données

| Catégorie | Compte | Réductibles | Total Stocks |
| --------- | ------ | ----------- | ------------ |
| Implants  | 9      | 9           | 9            |
| Éléments  | 4      | 2           | 4            |
| Stims     | 12     | 12          | 12           |
| **Total** | **25** | **23**      | **25**       |

| Matériau                 | Catégorie   | Prix/Unité |
| ------------------------ | ----------- | ---------- |
| Chromium                 | Metal       | 10€        |
| Platinum                 | Metal       | 50€        |
| Titanium                 | Metal       | 30€        |
| Durasteel                | Metal       | 25€        |
| Fibre Synthétique        | Fiber       | 15€        |
| Kolto                    | Chemical    | 40€        |
| Bacta                    | Chemical    | 60€        |
| Composants Électroniques | Electronics | 20€        |
| Matrice Protéinée        | Biological  | 35€        |

---

## 🔄 Hiérarchie de Données

```
data.json
├── materials[] (9)
│   ├── metal (4)
│   ├── fiber (1)
│   ├── chemical (2)
│   ├── electronics (1)
│   └── biological (1)
│
├── products
│   ├── implants (structure par tier)
│   │   ├── T1 (3 produits)
│   │   ├── T2 (3 produits)
│   │   └── T2MK2 (3 produits)
│   │
│   ├── basicElements[] (4 produits)
│   │   ├── Kit Soins T2 (réductible)
│   │   ├── Kit Soins T3 (réductible)
│   │   ├── Grenade Kolto (non-réductible)
│   │   └── Bota Cryo (non-réductible)
│   │
│   └── stims (structure par tier)
│       ├── T1 (4 types)
│       ├── T2 (4 types)
│       └── T3 (4 types)
│
└── subscriptions[] (4)
    ├── Sans Abonnement (0%)
    ├── Standard (10%)
    ├── Premium (20%)
    └── Elite (30%)
```

---

## ✏️ Ajouter de Nouveaux Éléments

### Ajouter un Matériau

```json
{
  "id": "mat_exotic_metal",
  "name": "Métal Exotique",
  "pricePerUnit": 100,
  "category": "metal"
}
```

### Ajouter un Implant T2

```json
{
  "id": "implant_t2_special",
  "name": "Special",
  "tier": "T2",
  "type": "Special",
  "category": "implants",
  "basePrice": 900,
  "fabricationCost": 300,
  "discountable": true,
  "materials": {
    "mat_platinum": 3,
    "mat_electronics": 4
  }
}
```

Ajouter à `data.json` → `products.implants.T2[]`

### Ajouter un Stim T3

```json
{
  "id": "stim_t3_potion",
  "name": "Potion",
  "tier": "T3",
  "type": "Potion",
  "category": "stims",
  "basePrice": 250,
  "fabricationCost": 90,
  "discountable": true,
  "materials": {
    "mat_bacta": 2,
    "mat_kolto": 1
  }
}
```

Ajouter à `data.json` → `products.stims.T3[]`

---

_Dernière mise à jour : 19 février 2026_

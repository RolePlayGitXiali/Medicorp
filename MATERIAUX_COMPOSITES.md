# Guide des Matériaux Composites - Médicorp

## 📋 Nouveaux Matériaux Ajoutés

### Matériaux Simples (Nouvellement Ajoutés)

#### 🔷 Métaux Exotiques

1. **Hfredium T1**
   - Prix: 50€/unité
   - Catégorie: exotic_metal
   - Composition: Aucune
   - Utilité: Matériau de base exotique

2. **Chanlon**
   - Prix: 10,000€/unité
   - Catégorie: exotic_metal
   - Composition: Aucune
   - Utilité: Matériau rare premium

3. **Cortosis**
   - Prix: 12,500€/unité
   - Catégorie: exotic_metal
   - Composition: Aucune
   - Utilité: Matériau rare premium

---

### Matériaux Composites (Fabriqués)

#### 🔧 Duracier

**Duracier T1**

- Prix d'achat: 3,000€/unité
- Coût de fabrication: 0€
- Composition: Aucune (matériau de base)
- Rendement: 1 unité
- **Coût total: 3,000€/unité**
- Description: Matériau composite de base - peut être raffiné pour Duracier T2

**Duracier T2**

- Prix d'achat: 15,000€/unité
- Coût de fabrication: 500€
- Composition: 5 × Duracier T1
  - 5 × 3,000€ = 15,000€
- Rendement: 1 unité
- **Coût total: 15,000€ + 500€ + 15,000€ = 30,500€/unité**
- Description: Matériau composite amélioré - version supérieure du T1

---

#### 🔷 Transparacier

**Transparacier T1**

- Prix d'achat: 1,250€/unité
- Coût de fabrication: 0€
- Composition: Aucune (matériau de base)
- Rendement: 1 unité
- **Coût total: 1,250€/unité**
- Description: Matériau transparent renforcé - matériau optique de base

**Transparacier T2**

- Prix d'achat: 2,500€/unité
- Coût de fabrication: 250€
- Composition: 8 × Transparacier T1
  - 8 × 1,250€ = 10,000€
- Rendement: 4 unités (ratio 2:1 - 2 T1 pour 1 T2)
- **Coût total: 2,500€ + 250€ + (10,000€ ÷ 4) = 5,000€/unité**
- Description: Transparacier de haut niveau - optimisé avec rendement

---

## 📊 Tableau Récapitulatif

| Matériau             | Type      | Prix/Unité | Composition | Coût Total  | Rendement |
| -------------------- | --------- | ---------- | ----------- | ----------- | --------- |
| **Duracier T1**      | Composite | 3,000€     | Aucune      | **3,000€**  | 1x        |
| **Duracier T2**      | Composite | 15,000€    | 5×T1        | **30,500€** | 1x        |
| **Transparacier T1** | Composite | 1,250€     | Aucune      | **1,250€**  | 1x        |
| **Transparacier T2** | Composite | 2,500€     | 8×T1 (÷4)   | **5,000€**  | 4x        |
| **Hfredium T1**      | Simple    | 50€        | -           | **50€**     | 1x        |
| **Chanlon**          | Simple    | 10,000€    | -           | **10,000€** | 1x        |
| **Cortosis**         | Simple    | 12,500€    | -           | **12,500€** | 1x        |

---

## 🔄 Calcul du Coût de Composition

### Formule Générale

```
Coût Total = Prix Achat + Coût Fabrication + (Coût Composition ÷ Rendement)
```

### Exemple: Duracier T2

```
Composition: 5 × Duracier T1
Coût Composition = 5 × 3,000€ = 15,000€
Coût Total = 15,000€ + 500€ + 15,000€ = 30,500€
```

### Exemple: Transparacier T2

```
Composition: 8 × Transparacier T1
Coût Composition = 8 × 1,250€ = 10,000€
Coût par unité = 10,000€ ÷ 4 rendements = 2,500€
Coût Total = 2,500€ + 250€ + 2,500€ = 5,250€
```

---

## 📱 Accès à la Fiche Matériaux

Une nouvelle page **"Fiche Matériaux"** est disponible à `http://localhost:3000/materials.html`

### Fonctionnalités:

- ✅ Affichage détaillé de tous les matériaux
- ✅ Calcul automatique des coûts composites
- ✅ Filtrage par type (Simple/Composite)
- ✅ Recherche rapide par nom
- ✅ Statistiques globales
- ✅ Breakdown des coûts pour chaque matériau
- ✅ Composition détaillée

---

## 🔌 API REST

### GET /api/materials

Retourne tous les matériaux avec calcul des coûts:

**Réponse:**

```json
{
  "simple": [
    {
      "id": "mat_hfredium_t1",
      "name": "Hfredium T1",
      "pricePerUnit": 50,
      "category": "exotic_metal",
      "type": "simple",
      "totalCost": 50
    }
  ],
  "composite": [
    {
      "id": "mat_duracier_t2",
      "name": "Duracier T2",
      "pricePerUnit": 15000,
      "fabricationCost": 500,
      "category": "exotic_metal",
      "type": "composite",
      "composition": { "mat_duracier_t1": 5 },
      "yield": 1,
      "totalCost": 30500,
      "breakdownCost": {
        "materialCost": 15000,
        "fabricationCost": 500,
        "compositionCost": 15000
      }
    }
  ]
}
```

---

## 💼 Pour les Employés

### Racheter des Matériaux

Consultez la **Fiche Matériaux** pour:

1. Voir le coût exact de chaque matériau
2. Comprendre la composition des matériaux complexes
3. Évaluer les prix pour l'approvisionnement
4. Comparer les coûts simples vs composites

### Points Importants

- Les matériaux **composites** sont plus onéreux que la somme de leurs composants
- Le rendement peut réduire le coût par unité (ex: Transparacier T2)
- Les coûts de fabrication s'ajoutent au coût de composition

---

_Dernière mise à jour: 19 février 2026_

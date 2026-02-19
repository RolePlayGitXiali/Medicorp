const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Charger les données
const dataPath = path.join(__dirname, "data.json");
let data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

// Routes API

// Récupérer tous les produits
app.get("/api/products", (req, res) => {
  res.json({
    products: data.products,
    materials: data.materials,
  });
});

// Récupérer les matériaux avec calcul des coûts
app.get("/api/materials", (req, res) => {
  try {
    const materialsWithCost = {
      simple: data.materials.simple.map((mat) => ({
        ...mat,
        totalCost: mat.pricePerUnit,
      })),
      composite: data.materials.composite.map((mat) => {
        const compositionCost = calculateCompositionCost(mat.composition);
        return {
          ...mat,
          totalCost: mat.pricePerUnit + mat.fabricationCost + compositionCost,
          breakdownCost: {
            materialCost: mat.pricePerUnit,
            fabricationCost: mat.fabricationCost,
            compositionCost: compositionCost,
          },
        };
      }),
    };
    res.json(materialsWithCost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Calculer le prix d'un produit basé sur ses matériaux
function calculateProductCost(product) {
  let materialsCost = 0;

  if (product.materials && typeof product.materials === "object") {
    for (const [materialId, quantity] of Object.entries(product.materials)) {
      let material = null;

      // Chercher dans les matériaux simples
      if (data.materials.simple) {
        material = data.materials.simple.find((m) => m.id === materialId);
      }

      // Chercher dans les matériaux composites
      if (!material && data.materials.composite) {
        material = data.materials.composite.find((m) => m.id === materialId);
      }

      if (material) {
        // Utiliser le totalCost si disponible (pour les matériaux composites)
        const cost = material.totalCost || material.pricePerUnit;
        materialsCost += cost * quantity;
      }
    }
  }

  // Prix total = (coût des matériaux + coût de fabrication) × 1.30 (30% de bénéfice)
  const baseCost = materialsCost + (product.fabricationCost || 0);
  return baseCost * 1.35;
}

// Calculer le coût d'une composition de matériaux
function calculateCompositionCost(composition) {
  let cost = 0;

  for (const [materialId, quantity] of Object.entries(composition)) {
    let material = null;

    // Chercher dans les matériaux simples
    if (data.materials.simple) {
      material = data.materials.simple.find((m) => m.id === materialId);
    }

    // Chercher dans les matériaux composites
    if (!material && data.materials.composite) {
      material = data.materials.composite.find((m) => m.id === materialId);
    }

    if (material) {
      // Utiliser le totalCost si disponible (pour les matériaux composites)
      const unitCost = material.totalCost || material.pricePerUnit;
      cost += unitCost * quantity;
    }
  }

  return cost;
}

// Calculer le coût des matériaux de base (T1) en remontant la composition
function calculateBaseMaterialsCost(composition) {
  let cost = 0;

  for (const [materialId, quantity] of Object.entries(composition)) {
    let material = null;

    // Chercher dans les matériaux simples
    if (data.materials.simple) {
      material = data.materials.simple.find((m) => m.id === materialId);
    }

    // Chercher dans les matériaux composites
    if (!material && data.materials.composite) {
      material = data.materials.composite.find((m) => m.id === materialId);
    }

    if (material) {
      // Si c'est un matériau simple, utiliser son pricePerUnit (coût de base)
      if (material.type === "simple") {
        cost += material.pricePerUnit * quantity;
      } else if (
        material.composition &&
        Object.keys(material.composition).length > 0
      ) {
        // Si c'est un composite avec une composition, remonter récursivement
        const baseCost = calculateBaseMaterialsCost(material.composition);
        cost += baseCost * quantity;
      } else {
        // Sinon utiliser son pricePerUnit (c'est déjà un T1)
        cost += material.pricePerUnit * quantity;
      }
    }
  }

  return cost;
}

// Récupérer les abonnements
app.get("/api/subscriptions", (req, res) => {
  res.json(data.subscriptions);
});

// Calculer le prix total
app.post("/api/calculate", (req, res) => {
  try {
    const { items, subscriptionId } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Items doit être un tableau" });
    }

    // Trouver l'abonnement
    const subscription =
      data.subscriptions.find((s) => s.id === subscriptionId) ||
      data.subscriptions[0];

    let totalPrice = 0;
    let totalFabricationCost = 0;
    let totalDiscount = 0;
    let totalMarginBeforeDiscount = 0;
    let totalBaseMaterialsCost = 0;
    const calculations = [];

    // Calculer pour chaque produit
    items.forEach((item) => {
      const product = findProductById(item.productId);
      if (!product) {
        return;
      }

      const quantity = item.quantity || 1;

      // Calculer les coûts des matériaux (avec composition)
      let materialsDisplayCost = 0; // Coût affiché au client (prix de vente des matériaux)
      let baseMaterialsCost = 0; // Coût réel des matériaux T1 de base

      if (product.materials && typeof product.materials === "object") {
        for (const [materialId, matQty] of Object.entries(product.materials)) {
          let material = null;
          if (data.materials.simple) {
            material = data.materials.simple.find((m) => m.id === materialId);
          }
          if (!material && data.materials.composite) {
            material = data.materials.composite.find(
              (m) => m.id === materialId,
            );
          }
          if (material) {
            // Coût d'achat (prix d'achat du matériau)
            const materialCost = (material.pricePerUnit || 0) * matQty;
            materialsDisplayCost += materialCost;
            baseMaterialsCost += materialCost;
          }
        }
      }

      const fabricationCostPerUnit = product.fabricationCost || 0;
      const baseCost = materialsDisplayCost + fabricationCostPerUnit;
      const pricePerUnit = baseCost * 1.35; // Prix avec 30% de bénéfice
      const basePrice = pricePerUnit * quantity;
      const fabricationCost = fabricationCostPerUnit * quantity;
      const marginBeforeDiscount =
        basePrice - (fabricationCost + materialsDisplayCost * quantity);
      const totalBaseMaterialsCostForItem = baseMaterialsCost * quantity;

      // Réduction sur le prix total par item si produit réductible
      let discount = 0;
      if (product.discountable) {
        discount = (basePrice * subscription.discountPercentage) / 100;
      }

      const finalPrice = basePrice - discount;

      totalPrice += finalPrice;
      totalFabricationCost += fabricationCost;
      totalDiscount += discount;
      totalMarginBeforeDiscount += marginBeforeDiscount;
      totalBaseMaterialsCost += totalBaseMaterialsCostForItem;

      calculations.push({
        product: product.name,
        tier: product.tier || "N/A",
        quantity,
        basePrice,
        discount,
        finalPrice,
        fabricationCost,
        discountable: product.discountable,
      });
    });

    // Calcul de la marge totale (après réductions appliquées)
    // Marge = Prix final - (Coût matériaux + Coût fabrication)
    const totalDisplayCost =
      calculations.reduce((sum, c) => sum + c.basePrice, 0) / 1.35;
    const totalCost = totalBaseMaterialsCost + totalFabricationCost;
    const totalMargin = totalPrice - totalCost;

    // Répartition : 60% employé, 40% entreprise
    const marginEmployee = totalMargin * 0.6;
    const marginCompany = totalMargin * 0.4;

    // Dépôt entreprise = 35% de la marge + 100% du coût des matériaux
    // Les matériaux ne sont PAS partagés avec l'employé
    const depositCompany = marginCompany + totalBaseMaterialsCost;

    res.json({
      subscription: subscription.name,
      subscriptionDiscount: subscription.discountPercentage,
      items: calculations,
      totalBasePrice: calculations.reduce((sum, c) => sum + c.basePrice, 0),
      totalDiscount,
      totalPrice,
      totalCost,
      totalFabricationCost,
      margin: totalMargin,
      // Répartition marge: 60% employé / 40% entreprise
      // Dépôt entreprise = 40% de la marge + 100% du coût des matériaux
      benefitEmployee: marginEmployee,
      benefitCompany: marginCompany,
      depositCompany: depositCompany,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fonction utilitaire pour trouver un produit par ID
function findProductById(productId) {
  for (const category in data.products) {
    const categoryData = data.products[category];

    // Si c'est un tableau (basicElements, stims, etc.)
    if (Array.isArray(categoryData)) {
      const product = categoryData.find((p) => p.id === productId);
      if (product) return product;
    }

    // Si c'est un objet avec des tiers (implants)
    if (typeof categoryData === "object" && !Array.isArray(categoryData)) {
      for (const tier in categoryData) {
        const tierProducts = categoryData[tier];
        if (Array.isArray(tierProducts)) {
          const product = tierProducts.find((p) => p.id === productId);
          if (product) return product;
        }
      }
    }
  }
  return null;
}

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log("Appuyez sur Ctrl+C pour arrêter");
});

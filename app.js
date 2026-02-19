// ===== ÉTAT GLOBAL =====
const state = {
  mode: "vente", // 'vente' ou 'achat'

  // Mode Vente
  cartVente: [],
  products: {},
  subscriptions: [],
  selectedSubscription: null,
  selectedImplantTier: "T1",
  selectedStimTier: "T1",
  lastOrderData: null, // Données de la dernière commande pour copie

  // Mode Achat
  cartAchat: [],
  materials: { simple: [], composite: [] },
  selectedSupplier: "supplier_standard",
};

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadMaterials();
  loadSubscriptions();
  setupEventListeners();
});

// ===== GESTION DES MODES =====
function switchMode(newMode) {
  state.mode = newMode;

  // Mettre à jour l'interface
  document.querySelectorAll(".main-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === newMode);
  });

  document.querySelectorAll(".mode-container").forEach((container) => {
    container.classList.toggle("active", container.id === `${newMode}-mode`);
  });

  // Mettre à jour le sous-titre
  const subtitle = document.getElementById("page-subtitle");
  subtitle.textContent =
    newMode === "vente" ? "Calculateur de prix" : "Achat de matériaux";
}

// ===== CHARGEMENT DES DONNÉES =====
async function loadProducts() {
  try {
    const response = await fetch("/api/products");
    const data = await response.json();
    state.products = data.products;
    renderProductsVente();
  } catch (error) {
    console.error("Erreur lors du chargement des produits:", error);
  }
}

async function loadMaterials() {
  try {
    const response = await fetch("/api/materials");
    state.materials = await response.json();
    renderMaterialsAchat();
  } catch (error) {
    console.error("Erreur lors du chargement des matériaux:", error);
  }
}

async function loadSubscriptions() {
  try {
    const response = await fetch("/api/subscriptions");
    state.subscriptions = await response.json();
    state.selectedSubscription = state.subscriptions[0].id;
    renderSubscriptions();
  } catch (error) {
    console.error("Erreur lors du chargement des abonnements:", error);
  }
}

// ===== RENDU MODE VENTE =====
function renderProductsVente() {
  renderImplants();
  renderBasicElements();
  renderStims();
}

function renderImplants() {
  const tierData = state.products.implants || {};
  const container = document.getElementById("implants-list");
  const tier = state.selectedImplantTier;
  const products = tierData[tier] || [];

  let html = "";

  // Ajouter le bouton Full Set si des produits existent
  if (products.length > 0) {
    html += `
      <div class="product-item full-set-btn">
        <div class="product-info">
          <div class="product-name">🎯 Full Set ${tier}</div>
          <div class="product-type">Tous les implants de ce tier</div>
        </div>
        <div class="product-actions">
          <button class="btn btn-success full-set-action" onclick="addFullSetToCart('${tier}')">
            Full Set
          </button>
        </div>
      </div>
    `;
  }

  // Ajouter tous les implants
  html += products
    .map((product) => createProductHTML(product, "vente"))
    .join("");

  container.innerHTML = html;
}

function renderBasicElements() {
  const container = document.getElementById("basic-elements-list");
  const products = state.products.basicElements || [];

  container.innerHTML = products
    .map((product) => createProductHTML(product, "vente"))
    .join("");
}

function renderStims() {
  const tierData = state.products.stims || {};
  const container = document.getElementById("stims-list");
  const tier = state.selectedStimTier;
  const products = tierData[tier] || [];

  container.innerHTML = products
    .map((product) => createProductHTML(product, "vente"))
    .join("");
}

// ===== RENDU MODE ACHAT =====
function renderMaterialsAchat() {
  const simpleContainer = document.getElementById("simple-materials-list");
  const compositeContainer = document.getElementById(
    "composite-materials-list",
  );

  simpleContainer.innerHTML = (state.materials.simple || [])
    .map((material) => createMaterialHTML(material, "achat"))
    .join("");

  compositeContainer.innerHTML = (state.materials.composite || [])
    .map((material) => createMaterialHTML(material, "achat"))
    .join("");
}

// ===== CRÉATION HTML =====
function createProductHTML(product, mode) {
  // Calculer le prix basé sur les matériaux
  let materialsCost = 0;
  if (product.materials && typeof product.materials === "object") {
    for (const [materialId, quantity] of Object.entries(product.materials)) {
      let material =
        state.materials.simple?.find((m) => m.id === materialId) ||
        state.materials.composite?.find((m) => m.id === materialId);
      if (material) {
        // Utiliser pricePerUnit (prix affiché du matériau, pas totalCost)
        materialsCost += (material.pricePerUnit || 0) * quantity;
      }
    }
  }
  const baseCost = materialsCost + (product.fabricationCost || 0);
  const clientPrice = baseCost * 1.35; // Prix avec 30% de bénéfice

  return `
        <div class="product-item" data-product-id="${product.id}" data-mode="${mode}" data-tier="${product.tier || "N/A"}">
            <div class="product-info">
                <div class="product-header">
                    <div class="product-name">${product.name}</div>
                    ${product.tier ? `<span class="product-tier-badge">${product.tier}</span>` : ""}
                </div>
                <div class="product-type">${product.type || ""}</div>
                <div class="product-prices">
                    <div class="price-row">
                        <span class="price-label">Coût:</span>
                        <span class="cost-price">${baseCost.toFixed(2)} Crédit</span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">Client:</span>
                        <span class="client-price">${clientPrice.toFixed(2)} Crédit</span>
                    </div>
                </div>
                ${!product.discountable ? '<div class="product-badge">Non réductible</div>' : ""}
            </div>
            <div class="product-actions">
                <input type="number" class="quantity-input" value="1" min="1">
                <button class="btn btn-primary" onclick="addToCartVente('${product.id}', this)">Ajouter</button>
            </div>
        </div>
    `;
}

function createMaterialHTML(material, mode) {
  const totalCost = material.totalCost || material.pricePerUnit;
  const materialType =
    material.type === "composite" ? "🔗 Composé" : "⚛️ Simple";
  return `
        <div class="product-item" data-material-id="${material.id}" data-mode="${mode}">
            <div class="product-info">
                <div class="product-header">
                    <div class="product-name">${material.name}</div>
                    <span class="product-tier-badge">${materialType}</span>
                </div>
                <div class="product-type">${material.category || ""}</div>
                <div class="product-prices">
                    <div class="price-row">
                        <span class="price-label">Prix:</span>
                        <span class="client-price">${totalCost.toFixed(2)} Crédit</span>
                    </div>
                </div>
            </div>
            <div class="product-actions">
                <input type="number" class="quantity-input" value="1" min="1">
                <button class="btn btn-primary" onclick="addToCartAchat('${material.id}', this)">Ajouter</button>
            </div>
        </div>
    `;
}

function renderSubscriptions() {
  const select = document.getElementById("subscription");
  select.innerHTML = state.subscriptions
    .map(
      (sub) => `
        <option value="${sub.id}">${sub.name} (${sub.discountPercentage}%)</option>
    `,
    )
    .join("");
  select.value = state.selectedSubscription;
}

// ===== GESTION PANIER VENTE =====
function addFullSetToCart(tier) {
  const tierData = state.products.implants?.[tier];
  if (!tierData || tierData.length === 0) return;

  // Ajouter tous les implants du tier
  tierData.forEach((product) => {
    const existingItem = state.cartVente.find(
      (item) => item.product.id === product.id,
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      state.cartVente.push({ product, quantity: 1 });
    }
  });

  updateCartVente();
}

function addToCartVente(productId, button) {
  const productItem = button.closest(".product-item");
  const quantityInput = productItem.querySelector(".quantity-input");
  const quantity = parseInt(quantityInput.value) || 1;

  let product = null;

  if (state.products.basicElements) {
    product = state.products.basicElements.find((p) => p.id === productId);
  }

  if (!product) {
    for (const tierData of Object.values(state.products.implants || {})) {
      product = tierData.find((p) => p.id === productId);
      if (product) break;
    }
  }

  if (!product) {
    for (const tierData of Object.values(state.products.stims || {})) {
      product = tierData.find((p) => p.id === productId);
      if (product) break;
    }
  }

  if (!product) return;

  const existingItem = state.cartVente.find(
    (item) => item.product.id === productId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cartVente.push({ product, quantity });
  }

  quantityInput.value = 1;
  updateCartVente();
}

function renderCartItemsVente() {
  const container = document.getElementById("cart-items");

  if (state.cartVente.length === 0) {
    container.innerHTML = '<p class="empty-cart">Vide</p>';
    return;
  }

  container.innerHTML = state.cartVente
    .map((item, index) => {
      let materialsCost = 0;
      if (
        item.product.materials &&
        typeof item.product.materials === "object"
      ) {
        for (const [materialId, quantity] of Object.entries(
          item.product.materials,
        )) {
          let material =
            state.materials.simple?.find((m) => m.id === materialId) ||
            state.materials.composite?.find((m) => m.id === materialId);
          if (material) {
            // Utiliser pricePerUnit (prix affiché du matériau, pas totalCost)
            materialsCost += (material.pricePerUnit || 0) * quantity;
          }
        }
      }
      const baseCost = materialsCost + (item.product.fabricationCost || 0);
      const clientPricePerUnit = baseCost * 1.35; // Prix avec 30% de bénéfice
      const tierDisplay = item.product.tier ? ` [${item.product.tier}]` : "";
      return `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.product.name}${tierDisplay}</div>
                <div class="cart-item-details">
                    <span>${item.quantity}x</span>
                    <span class="cost-detail">Coût: ${baseCost.toFixed(2)}</span>
                    <span class="client-detail">Client: ${clientPricePerUnit.toFixed(2)}</span>
                </div>
            </div>
            <div class="cart-item-actions">
                <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" 
                    onchange="updateQuantityVente(${index}, this.value)">
                <button class="remove-btn" onclick="removeFromCartVente(${index})">✕</button>
            </div>
        </div>
    `;
    })
    .join("");
}

function updateQuantityVente(index, newQuantity) {
  const quantity = parseInt(newQuantity) || 1;
  if (quantity > 0) {
    state.cartVente[index].quantity = quantity;
  } else {
    removeFromCartVente(index);
  }
  updateCartVente();
}

function removeFromCartVente(index) {
  state.cartVente.splice(index, 1);
  updateCartVente();
}

function updateCartVente() {
  renderCartItemsVente();
  calculateTotalVente();
}

async function calculateTotalVente() {
  if (state.cartVente.length === 0) {
    resetSummaryVente();
    return;
  }

  try {
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.cartVente.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        subscriptionId: state.selectedSubscription,
      }),
    });

    const result = await response.json();
    updateSummaryVente(result);
  } catch (error) {
    console.error("Erreur lors du calcul:", error);
  }
}

function updateSummaryVente(data) {
  // Décomposition des coûts
  document.getElementById("materials-cost-detail").textContent =
    (data.totalCost - data.totalFabricationCost).toFixed(2) + " Crédit";
  document.getElementById("fabrication-cost").textContent =
    data.totalFabricationCost.toFixed(2) + " Crédit";
  document.getElementById("total-cost-detail").textContent =
    data.totalCost.toFixed(2) + " Crédit";

  // Marge brute (avant réduction)
  const marginBeforeDiscount = data.totalBasePrice - data.totalCost;
  document.getElementById("margin-detail").textContent =
    marginBeforeDiscount.toFixed(2) + " Crédit";

  // Réduction
  document.getElementById("discount").textContent =
    data.totalDiscount.toFixed(2) + " Crédit";

  // Prix final client
  document.getElementById("total-price").textContent =
    data.totalPrice.toFixed(2) + " Crédit";

  // Marge réelle (après réduction)
  document.getElementById("real-margin").textContent =
    data.margin.toFixed(2) + " Crédit";

  // Répartition
  document.getElementById("benefit-employee").textContent =
    data.benefitEmployee.toFixed(2) + " Crédit";
  document.getElementById("benefit-company").textContent =
    data.depositCompany.toFixed(2) + " Crédit";

  // Stocker les données pour le bouton Copier
  state.lastOrderData = data;
}

function resetSummaryVente() {
  document.getElementById("materials-cost-detail").textContent = "0.00 Crédit";
  document.getElementById("fabrication-cost").textContent = "0.00 Crédit";
  document.getElementById("total-cost-detail").textContent = "0.00 Crédit";
  document.getElementById("margin-detail").textContent = "0.00 Crédit";
  document.getElementById("discount").textContent = "0.00 Crédit";
  document.getElementById("total-price").textContent = "0.00 Crédit";
  document.getElementById("real-margin").textContent = "0.00 Crédit";
  document.getElementById("benefit-employee").textContent = "0.00 Crédit";
  document.getElementById("benefit-company").textContent = "0.00 Crédit";
  state.lastOrderData = null;
}

// ===== GESTION PANIER ACHAT =====
function addToCartAchat(materialId, button) {
  const materialItem = button.closest(".product-item");
  const quantityInput = materialItem.querySelector(".quantity-input");
  const quantity = parseInt(quantityInput.value) || 1;

  let material =
    state.materials.simple?.find((m) => m.id === materialId) ||
    state.materials.composite?.find((m) => m.id === materialId);

  if (!material) return;

  const existingItem = state.cartAchat.find(
    (item) => item.material.id === materialId,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    state.cartAchat.push({ material, quantity });
  }

  quantityInput.value = 1;
  updateCartAchat();
}

function renderCartItemsAchat() {
  const container = document.getElementById("cart-materials");

  if (state.cartAchat.length === 0) {
    container.innerHTML = '<p class="empty-cart">Vide</p>';
    return;
  }

  container.innerHTML = state.cartAchat
    .map((item, index) => {
      const totalCost = item.material.totalCost || item.material.pricePerUnit;
      return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.material.name}</div>
                    <div class="cart-item-details">${item.quantity} x ${totalCost.toFixed(2)} Crédit</div>
                </div>
                <div class="cart-item-actions">
                    <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" 
                        onchange="updateQuantityAchat(${index}, this.value)">
                    <button class="remove-btn" onclick="removeFromCartAchat(${index})">✕</button>
                </div>
            </div>
        `;
    })
    .join("");
}

function updateQuantityAchat(index, newQuantity) {
  const quantity = parseInt(newQuantity) || 1;
  if (quantity > 0) {
    state.cartAchat[index].quantity = quantity;
  } else {
    removeFromCartAchat(index);
  }
  updateCartAchat();
}

function removeFromCartAchat(index) {
  state.cartAchat.splice(index, 1);
  updateCartAchat();
}

function updateCartAchat() {
  renderCartItemsAchat();
  calculateTotalAchat();
}

function calculateTotalAchat() {
  if (state.cartAchat.length === 0) {
    resetSummaryAchat();
    return;
  }

  let total = 0;
  state.cartAchat.forEach((item) => {
    const unitCost = item.material.totalCost || item.material.pricePerUnit;
    total += unitCost * item.quantity;
  });

  document.getElementById("materials-total").textContent =
    total.toFixed(2) + " Crédit";
  document.getElementById("materials-final-price").textContent =
    total.toFixed(2) + " Crédit";
}

function resetSummaryAchat() {
  document.getElementById("materials-total").textContent = "0.00 Crédit";
  document.getElementById("materials-final-price").textContent = "0.00 Crédit";
}

// ===== COPIE COMMANDE =====
function copyOrderToClipboard() {
  try {
    if (!state.lastOrderData || state.cartVente.length === 0) {
      alert("Aucune commande à copier");
      return;
    }

    console.log("lastOrderData complet:", state.lastOrderData);

    // Construire la liste des articles
    let items = "";
    if (state.lastOrderData.items && Array.isArray(state.lastOrderData.items)) {
      items = state.lastOrderData.items
        .map((item) => {
          const tierStr =
            item.tier && item.tier !== "N/A" ? ` (${item.tier})` : "";
          return `${item.quantity}x ${item.product}${tierStr}`;
        })
        .join(" + ");
    } else {
      console.warn("Pas d'items dans lastOrderData");
      items = "Articles: (erreur lors du calcul)";
    }

    const deposit =
      state.lastOrderData.depositCompany ||
      state.lastOrderData.benefitCompany ||
      0;
    const totalPrice = state.lastOrderData.totalPrice || 0;

    // Construire le texte simple
    const markdown = `COMMANDE MEDICORP
=================
Articles: ${items}
Prix total: ${Math.round(totalPrice)} credits
Depot entreprise: ${Math.round(deposit)} credits`;

    console.log("Texte final à afficher:", markdown);

    // Supprimer l'ancien container s'il existe
    const oldContainer = document.getElementById("copy-textarea-container");
    if (oldContainer) {
      oldContainer.remove();
    }

    // Créer un nouveau container
    const textareaContainer = document.createElement("div");
    textareaContainer.id = "copy-textarea-container";
    textareaContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(10, 25, 41, 0.95);
      border: 2px solid #00d4ff;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
    `;

    textareaContainer.innerHTML = `
      <div style="color: #00d4ff; margin-bottom: 10px; font-weight: bold; text-align: center;">
        📋 COMMANDE À COPIER
      </div>
      <textarea id="copy-text-area" style="
        width: 400px;
        height: 150px;
        background: rgba(26, 95, 122, 0.3);
        color: #00ff88;
        border: 1px solid #00d4ff;
        padding: 10px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.9em;
        resize: none;
      " readonly>${markdown}</textarea>
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
        <button onclick="const ta = document.getElementById('copy-text-area'); ta.select(); document.execCommand('copy'); this.closest('#copy-textarea-container').remove(); alert('Copié dans le presse-papiers!');" style="
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
          border: 1px solid #00ff88;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        ">Copier et Fermer</button>
        <button onclick="this.closest('#copy-textarea-container').remove();" style="
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
          border: 1px solid #ff4444;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        ">Fermer</button>
      </div>
    `;

    document.body.appendChild(textareaContainer);

    // Auto-select le texte pour faciliter la copie
    setTimeout(() => {
      const textarea = document.getElementById("copy-text-area");
      if (textarea) {
        textarea.select();
      }
    }, 100);
  } catch (error) {
    console.error("Erreur dans copyOrderToClipboard:", error);
    alert("Erreur: " + error.message);
  }
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Onglets principaux (Vente/Achat)
  document.querySelectorAll(".main-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
  });

  // Onglets produits (Vente)
  document.querySelectorAll("#vente-mode .tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const parent = e.target.closest(".tabs-container");
      parent
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      parent
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      e.target.classList.add("active");
      const tabId = e.target.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Onglets matériaux (Achat)
  document.querySelectorAll("#achat-mode .tab-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const parent = e.target.closest(".tabs-container");
      parent
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      parent
        .querySelectorAll(".tab-content")
        .forEach((c) => c.classList.remove("active"));

      e.target.classList.add("active");
      const tabId = e.target.dataset.tab;
      document.getElementById(tabId).classList.add("active");
    });
  });

  // Tiers Implants
  document.querySelectorAll("#implants-tiers .tier-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll("#implants-tiers .tier-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      state.selectedImplantTier = e.target.dataset.tier;
      renderImplants();
    });
  });

  // Tiers Stims
  document.querySelectorAll("#stims-tiers .tier-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll("#stims-tiers .tier-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      state.selectedStimTier = e.target.dataset.tier;
      renderStims();
    });
  });

  // Changement abonnement (Vente)
  document.getElementById("subscription").addEventListener("change", (e) => {
    state.selectedSubscription = e.target.value;
    calculateTotalVente();
  });

  // Changement fournisseur (Achat)
  document
    .getElementById("materials-supplier")
    .addEventListener("change", (e) => {
      state.selectedSupplier = e.target.value;
      // Logique future pour appliquer des réductions de fournisseur
    });

  // Vider panier (Vente)
  document.getElementById("clear-cart").addEventListener("click", () => {
    if (state.cartVente.length === 0) return;
    if (confirm("Vider le panier ?")) {
      state.cartVente = [];
      updateCartVente();
    }
  });

  // Vider panier (Achat)
  document
    .getElementById("clear-cart-materials")
    .addEventListener("click", () => {
      if (state.cartAchat.length === 0) return;
      if (confirm("Vider la commande ?")) {
        state.cartAchat = [];
        updateCartAchat();
      }
    });

  // Copier commande (Vente)
  const copyOrderBtn = document.getElementById("copy-order");
  if (copyOrderBtn) {
    copyOrderBtn.addEventListener("click", copyOrderToClipboard);
  }
}

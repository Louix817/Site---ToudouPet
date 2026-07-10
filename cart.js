/* ================================================================
   CART.JS — Panier ToudouPet (démo front-end)
   Persistance via localStorage, partagée entre toutes les pages.
   ⚠️ À l'intégration Shopify : ce fichier sera remplacé par le
   panier natif Shopify (AJAX Cart API) — voir notes en bas de fichier.
   ================================================================ */
(function () {
  const CART_KEY = 'toudoupet_cart';

  // --- Lecture / écriture du panier ---
  function getCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  // --- Opérations sur le panier ---
  function addToCart(item) {
    const cart = getCart();
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    saveCart(cart);
    renderCartDrawer();
    openCartDrawer();
  }

  function removeFromCart(id) {
    const cart = getCart().filter((i) => i.id !== id);
    saveCart(cart);
    renderCartDrawer();
  }

  function updateQty(id, qty) {
    const cart = getCart();
    const item = cart.find((i) => i.id === id);
    if (item) {
      item.qty = Math.max(1, qty);
    }
    saveCart(cart);
    renderCartDrawer();
  }

  // --- Calculs ---
  function cartCount(cart) {
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  function cartTotal(cart) {
    return cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  }

  function formatPrice(value) {
    return value.toFixed(2).replace('.', ',') + ' €';
  }

  // --- Rendu visuel ---
  function updateCartBadge() {
    const count = cartCount(getCart());
    document.querySelectorAll('.site-header__cart-count').forEach((el) => {
      el.textContent = count;
    });
  }

  function renderCartDrawer() {
    const itemsContainer = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('cartEmpty');
    const subtotalEl = document.getElementById('cartSubtotal');
    if (!itemsContainer || !emptyMsg || !subtotalEl) return;

    const cart = getCart();

    if (cart.length === 0) {
      itemsContainer.innerHTML = '';
      emptyMsg.hidden = false;
    } else {
      emptyMsg.hidden = true;
      itemsContainer.innerHTML = cart.map((item) => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item__thumb" aria-hidden="true">📦</div>
          <div class="cart-item__info">
            <p class="cart-item__name">${item.name}</p>
            <p class="cart-item__price">${formatPrice(item.price)}</p>
            <div class="cart-item__qty">
              <button class="cart-item__qty-btn" type="button" data-action="minus" data-id="${item.id}" aria-label="Diminuer la quantité">−</button>
              <span class="cart-item__qty-value">${item.qty}</span>
              <button class="cart-item__qty-btn" type="button" data-action="plus" data-id="${item.id}" aria-label="Augmenter la quantité">+</button>
            </div>
          </div>
          <button class="cart-item__remove" type="button" data-action="remove" data-id="${item.id}" aria-label="Retirer du panier">×</button>
        </div>
      `).join('');
    }

    subtotalEl.textContent = formatPrice(cartTotal(cart));
    updateCartBadge();
  }

  function openCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.classList.add('is-open');
      document.body.classList.add('cart-drawer-open');
    }
  }

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) {
      drawer.classList.remove('is-open');
      document.body.classList.remove('cart-drawer-open');
    }
  }

  // Expose l'API du panier pour les scripts de chaque page
  // (ex. bouton "Ajouter au panier" d'une fiche produit)
  window.ToudouCart = {
    addToCart,
    removeFromCart,
    getCart,
    openCartDrawer,
    closeCartDrawer,
    formatPrice,
  };

  // --- Initialisation, identique sur chaque page ---
  document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCartDrawer();

    const cartIconBtn = document.getElementById('cartIconBtn');
    const cartCloseBtn = document.getElementById('cartCloseBtn');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartIconBtn) {
      cartIconBtn.addEventListener('click', () => {
        renderCartDrawer();
        openCartDrawer();
      });
    }
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);

    const itemsContainer = document.getElementById('cartItems');
    if (itemsContainer) {
      itemsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (!item) return;

        if (action === 'plus') updateQty(id, item.qty + 1);
        if (action === 'minus') updateQty(id, item.qty - 1);
        if (action === 'remove') removeFromCart(id);
      });
    }

    const checkoutBtn = document.getElementById('cartCheckoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        alert('Ceci est une démo locale. Une fois le site intégré à Shopify, ce bouton mènera au vrai checkout sécurisé.');
      });
    }
  });
})();

/* ================================================================
   NOTE INTÉGRATION SHOPIFY
   Ce panier localStorage est un prototype pour la démo statique.
   Sur Shopify, il sera remplacé par l'AJAX Cart API native
   (/cart/add.js, /cart/change.js, /cart/update.js) qui gère déjà
   la persistance, les taxes, les codes promo et le checkout réel.
   La structure visuelle (cart-drawer, cart-item...) reste réutilisable.
   ================================================================ */

/**
 * Cute Craft Gifts - Main Script
 * Handles product rendering, cart, WhatsApp order modal, filters,
 * mobile navigation, scroll animations, and notifications.
 */

/* -----------------------------------------------
   CONFIGURATION
----------------------------------------------- */

/**
 * WhatsApp business number (country code + number, no spaces or +).
 * Update this to the actual business number before going live.
 */
const WHATSAPP_NUMBER = '919999999999';

/** Number of columns in the product grid (used for stagger animation). */
const GRID_COLUMNS = 3;

/** Delay in milliseconds between staggered grid item animations. */
const STAGGER_DELAY_MS = 100;

/* -----------------------------------------------
   PRODUCT DATA
----------------------------------------------- */

/** @type {Array<{id: number, name: string, category: string, emoji: string, description: string, price: number, featured: boolean}>} */
const products = [
    {
        id: 1,
        name: 'Sparkle Keychain',
        category: 'keychains',
        emoji: '✨',
        description: 'Handcrafted resin keychain with glitter and charm details. Perfect everyday carry.',
        price: 149,
        featured: true
    },
    {
        id: 2,
        name: 'Heart Charm Keychain',
        category: 'keychains',
        emoji: '💖',
        description: 'Cute heart-shaped keychain with pastel beads and custom initial options.',
        price: 179,
        featured: true
    },
    {
        id: 3,
        name: 'Birthday Greeting Card',
        category: 'cards',
        emoji: '🎂',
        description: 'Handmade pop-up birthday card with personalised message and floral design.',
        price: 99,
        featured: true
    },
    {
        id: 4,
        name: 'Love Letter Card',
        category: 'cards',
        emoji: '💌',
        description: 'Handwritten-style love letter card with pressed flower accents.',
        price: 119,
        featured: false
    },
    {
        id: 5,
        name: 'Star Garland Decor',
        category: 'decor',
        emoji: '🌟',
        description: 'Fairy-light star garland for room decoration. 2 metres, 20 stars.',
        price: 249,
        featured: true
    },
    {
        id: 6,
        name: 'Dreamy Cloud Mobile',
        category: 'decor',
        emoji: '☁️',
        description: 'Soft felt cloud mobile for nursery or bedroom. Pastel rainbow palette.',
        price: 299,
        featured: false
    },
    {
        id: 7,
        name: 'Boho Tassel Keychain',
        category: 'keychains',
        emoji: '🌸',
        description: 'Bohemian tassel keychain with macramé and wooden bead accents.',
        price: 129,
        featured: false
    },
    {
        id: 8,
        name: 'Thank You Card Set',
        category: 'cards',
        emoji: '🙏',
        description: 'Pack of 5 handmade thank-you cards with envelope liners. Assorted designs.',
        price: 199,
        featured: false
    },
    {
        id: 9,
        name: 'Pom-Pom Photo Frames',
        category: 'decor',
        emoji: '🖼️',
        description: 'Colourful pom-pom bordered photo frame. Fits 4×6 inch prints.',
        price: 199,
        featured: false
    }
];

/* -----------------------------------------------
   CART STATE  (persisted in localStorage)
----------------------------------------------- */

/** Load cart from localStorage or initialise empty. */
function loadCart() {
    try {
        return JSON.parse(localStorage.getItem('ccg_cart')) || [];
    } catch {
        return [];
    }
}

/** Save cart to localStorage. */
function saveCart(cart) {
    localStorage.setItem('ccg_cart', JSON.stringify(cart));
}

let cart = loadCart();

/* -----------------------------------------------
   NOTIFICATION HELPER
----------------------------------------------- */

let notificationTimer = null;

/**
 * Show a temporary toast notification.
 * @param {string} message - Text to display.
 * @param {'success'|'error'} [type='success'] - Visual type.
 */
function showNotification(message, type = 'success') {
    const el = document.getElementById('notification');
    if (!el) return;
    el.textContent = message;
    el.className = `notification show ${type}`;
    clearTimeout(notificationTimer);
    notificationTimer = setTimeout(() => {
        el.classList.remove('show');
    }, 3000);
}

/* -----------------------------------------------
   CART BADGE
----------------------------------------------- */

/** Update the cart count badge in the nav. */
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = total;
    badge.classList.toggle('has-items', total > 0);
}

/* -----------------------------------------------
   ADD TO CART
----------------------------------------------- */

/**
 * Add a product to the cart or increment its quantity.
 * @param {number} productId
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: productId, name: product.name, price: product.price, qty: 1 });
    }

    saveCart(cart);
    updateCartBadge();
    showNotification(`🛒 "${product.name}" added to cart!`);
}

/* -----------------------------------------------
   PRODUCT CARD RENDERER
----------------------------------------------- */

/**
 * Build and return a product card DOM element.
 * @param {object} product
 * @returns {HTMLElement}
 */
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card fade-in';
    card.dataset.category = product.category;

    card.innerHTML = `
        <div class="product-image">${product.emoji}</div>
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">₹${product.price}</div>
        <div class="product-buttons">
            <button class="whatsapp-btn" data-id="${product.id}" aria-label="Order ${product.name} via WhatsApp">
                <i class="fab fa-whatsapp"></i> Order
            </button>
            <button class="add-to-cart" data-id="${product.id}" aria-label="Add ${product.name} to cart">
                <i class="fas fa-cart-plus"></i> Cart
            </button>
        </div>
    `;

    card.querySelector('.whatsapp-btn').addEventListener('click', () => openOrderModal(product.id));
    card.querySelector('.add-to-cart').addEventListener('click', () => addToCart(product.id));

    return card;
}

/* -----------------------------------------------
   RENDER PRODUCTS
----------------------------------------------- */

/** Render featured products grid. */
function renderFeatured() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;
    container.innerHTML = '';
    products
        .filter(p => p.featured)
        .forEach(p => container.appendChild(createProductCard(p)));
}

/**
 * Render shop products, optionally filtered by category.
 * @param {string} [filter='all']
 */
function renderShop(filter = 'all') {
    const container = document.getElementById('shopProducts');
    if (!container) return;
    container.innerHTML = '';
    const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
    filtered.forEach(p => container.appendChild(createProductCard(p)));
}

/* -----------------------------------------------
   ORDER MODAL
----------------------------------------------- */

/** Currently selected product for the order modal. */
let activeProduct = null;

/** Open the order modal for a given product. */
function openOrderModal(productId) {
    activeProduct = products.find(p => p.id === productId);
    if (!activeProduct) return;

    const modal = document.getElementById('orderModal');
    const info = document.getElementById('modalProductInfo');
    const form = document.getElementById('orderForm');
    const errEl = document.getElementById('formError');

    // Populate product info
    info.innerHTML = `
        <div class="modal-product-emoji">${activeProduct.emoji}</div>
        <div>
            <strong>${activeProduct.name}</strong>
            <div class="modal-product-price">₹${activeProduct.price} / item</div>
        </div>
    `;

    // Reset form
    form.reset();
    document.getElementById('orderQuantity').value = 1;
    errEl.textContent = '';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus the first field for accessibility
    setTimeout(() => document.getElementById('orderName').focus(), 100);
}

/** Close the order modal. */
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    activeProduct = null;
}

/**
 * Validate order form fields.
 * @returns {{ valid: boolean, message?: string }}
 */
function validateOrderForm() {
    const name = document.getElementById('orderName').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const payment = document.getElementById('orderPayment').value;
    const qty = parseInt(document.getElementById('orderQuantity').value, 10);

    if (!name) return { valid: false, message: 'Please enter your name.' };
    if (!address) return { valid: false, message: 'Please enter your delivery address.' };
    if (!payment) return { valid: false, message: 'Please select a payment mode.' };
    if (!qty || qty < 1 || qty > 99) return { valid: false, message: 'Please enter a valid quantity (1–99).' };

    return { valid: true };
}

/** Handle order form submission – build WhatsApp message and open chat. */
function submitOrder(event) {
    event.preventDefault();

    const errEl = document.getElementById('formError');
    const validation = validateOrderForm();

    if (!validation.valid) {
        errEl.textContent = validation.message;
        return;
    }

    errEl.textContent = '';

    const name = document.getElementById('orderName').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const payment = document.getElementById('orderPayment').value;
    const qty = parseInt(document.getElementById('orderQuantity').value, 10);
    const total = activeProduct.price * qty;

    const message =
        `🛍️ *New Order – Cute Craft Gifts*\n\n` +
        `📦 *Product:* ${activeProduct.name}\n` +
        `💰 *Price:* ₹${activeProduct.price} / item\n` +
        `🔢 *Quantity:* ${qty}\n` +
        `💵 *Total:* ₹${total}\n\n` +
        `👤 *Customer Name:* ${name}\n` +
        `🏠 *Delivery Address:* ${address}\n` +
        `💳 *Payment Mode:* ${payment}\n\n` +
        `Please confirm my order. Thank you! 🙏`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    closeOrderModal();
    showNotification('✅ Redirecting to WhatsApp to complete your order!');
}

/* -----------------------------------------------
   FILTER BUTTONS
----------------------------------------------- */

/** Initialise category filter buttons. */
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderShop(btn.dataset.filter);
            // Re-observe new cards
            observeFadeElements();
        });
    });
}

/* -----------------------------------------------
   MOBILE HAMBURGER MENU
----------------------------------------------- */

/** Initialise hamburger toggle for mobile nav. */
function initHamburger() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen.toString());
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });
}

/* -----------------------------------------------
   INTERSECTION OBSERVER – SCROLL ANIMATIONS
----------------------------------------------- */

let fadeObserver = null;

/** Set up or refresh the Intersection Observer on .fade-in elements. */
function observeFadeElements() {
    if (fadeObserver) fadeObserver.disconnect();

    fadeObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger delay for grid items
                    const delay = (index % GRID_COLUMNS) * STAGGER_DELAY_MS;
                    entry.target.style.transitionDelay = `${delay}ms`;
                    entry.target.classList.add('visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => fadeObserver.observe(el));
}

/** Observe static fade-in elements (about, contact, features). */
function observeStaticSections() {
    const sectionObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    sectionObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.feature, .info-item, .about-text').forEach(el => {
        el.classList.add('fade-in');
        sectionObserver.observe(el);
    });
}

/* -----------------------------------------------
   MODAL EVENT LISTENERS
----------------------------------------------- */

function initModal() {
    const overlay = document.getElementById('orderModal');
    const closeBtn = document.getElementById('modalClose');
    const form = document.getElementById('orderForm');

    closeBtn.addEventListener('click', closeOrderModal);

    // Close on overlay backdrop click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOrderModal();
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeOrderModal();
        }
    });

    form.addEventListener('submit', submitOrder);
}

/* -----------------------------------------------
   CART ICON CLICK – SIMPLE SUMMARY TOAST
----------------------------------------------- */

function initCartIcon() {
    const btn = document.getElementById('cartIcon');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('🛒 Your cart is empty.', 'error');
            return;
        }
        const lines = cart.map(item => `${item.name} ×${item.qty}`).join(', ');
        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        showNotification(`🛒 ${lines} — Total: ₹${totalPrice}`);
    });
}

/* -----------------------------------------------
   BOOTSTRAP
----------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    // Render products
    renderFeatured();
    renderShop();

    // UI interactions
    initFilters();
    initHamburger();
    initModal();
    initCartIcon();

    // Scroll animations
    observeStaticSections();
    observeFadeElements();

    // Update cart badge from any persisted data
    updateCartBadge();
});
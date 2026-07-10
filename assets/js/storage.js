// ============================================
// STORAGE - LocalStorage utilities
// ============================================

// Generic storage functions
function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Storage set error:', error);
    return false;
  }
}

function storageGet(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Storage get error:', error);
    return defaultValue;
  }
}

function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Storage remove error:', error);
    return false;
  }
}

function storageClear() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}

// ============================================
// RECENTLY VIEWED
// ============================================
const RECENTLY_VIEWED_KEY = 'recently_viewed';
const MAX_RECENTLY_VIEWED = 10;

function loadRecentlyViewed() {
  app.recentlyViewed = storageGet(RECENTLY_VIEWED_KEY, []);
}

function saveRecentlyViewed() {
  storageSet(RECENTLY_VIEWED_KEY, app.recentlyViewed);
}

function addToRecentlyViewed(productId) {
  // Remove if exists
  app.recentlyViewed = app.recentlyViewed.filter(id => id !== productId);
  // Add to front
  app.recentlyViewed.unshift(productId);
  // Limit
  if (app.recentlyViewed.length > MAX_RECENTLY_VIEWED) {
    app.recentlyViewed = app.recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);
  }
  saveRecentlyViewed();
}

function getRecentlyViewedProducts() {
  return app.recentlyViewed
    .map(id => getProductById(id))
    .filter(p => p !== undefined);
}

// ============================================
// CART (Simple implementation)
// ============================================
const CART_KEY = 'cart_items';

function getCart() {
  return storageGet(CART_KEY, []);
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }
  storageSet(CART_KEY, cart);
  return cart;
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  storageSet(CART_KEY, cart);
  return cart;
}

function clearCart() {
  storageRemove(CART_KEY);
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

// ============================================
// USER PREFERENCES
// ============================================
function saveUserPreference(key, value) {
  storageSet(`pref_${key}`, value);
}

function getUserPreference(key, defaultValue = null) {
  return storageGet(`pref_${key}`, defaultValue);
}
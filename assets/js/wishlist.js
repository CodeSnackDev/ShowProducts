// ============================================
// WISHLIST - LocalStorage wishlist management
// ============================================

// Wishlist key
const WISHLIST_KEY = 'wishlist_items';

// Load wishlist from localStorage
function loadWishlist() {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    app.wishlist = data ? JSON.parse(data) : [];
  } catch (error) {
    app.wishlist = [];
  }
  updateWishlistBadge();
}

// Save wishlist to localStorage
function saveWishlist() {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(app.wishlist));
  updateWishlistBadge();
}

// Toggle wishlist item
function toggleWishlist(productId) {
  const index = app.wishlist.indexOf(productId);
  if (index > -1) {
    app.wishlist.splice(index, 1);
  } else {
    app.wishlist.push(productId);
  }
  saveWishlist();
  renderAll(); // Re-render to update heart icons
}

// Check if product is in wishlist
function isInWishlist(productId) {
  return app.wishlist.includes(productId);
}

// Get wishlist products
function getWishlistProducts() {
  return app.products.filter(p => app.wishlist.includes(p.id));
}

// Update wishlist badge
function updateWishlistBadge() {
  const badge = document.getElementById('wishlistCount');
  if (badge) {
    badge.textContent = app.wishlist.length;
  }
}

// Render wishlist page
function renderWishlistPage() {
  const container = document.getElementById('wishlistContainer');
  if (!container) return;
  
  const products = getWishlistProducts();
  
  if (products.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <div class="icon">💔</div>
        <h2>Your wishlist is empty</h2>
        <p style="color:var(--gray);">Start adding products you love!</p>
        <a href="products.html" class="btn btn-primary" style="margin-top:20px;">Browse Products</a>
      </div>
    `;
    return;
  }
  
  container.innerHTML = `
    <h2 style="margin-bottom:20px;">My Wishlist (${products.length})</h2>
    <div class="product-grid">
      ${products.map(p => createProductCardHTML(p)).join('')}
    </div>
  `;
}

// Clear wishlist
function clearWishlist() {
  app.wishlist = [];
  saveWishlist();
  renderWishlistPage();
}

// Initialize wishlist on page load
document.addEventListener('DOMContentLoaded', () => {
  loadWishlist();
  
  // Render wishlist page if on wishlist page
  if (window.location.pathname.includes('wishlist.html')) {
    renderWishlistPage();
  }
});
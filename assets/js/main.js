// ============================================
// MAIN - Application Entry Point (COMPLETE FIX)
// ============================================

// Global state
window.app = {
  products: [],
  categories: [],
  wishlist: [],
  recentlyViewed: [],
  currentLang: 'en',
  currentTheme: 'light',
};

// ============================================
// DOM READY - Main initialization
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 App initializing...');
  
  try {
    // Initialize theme first
    initTheme();
    
    // Initialize language (loads translations first)
    initLanguage();
    
    // Load wishlist
    loadWishlist();
    
    // Load recently viewed
    loadRecentlyViewed();
    
    // Back to top button
    initBackToTop();
    
    // Load products and categories
    await loadProductsAndCategories();
    
    // Render all components (only if on home page)
    if (document.getElementById('featuredGrid')) {
      await renderAll();
    }
    
    // Update wishlist badge
    updateWishlistBadge();
    
    // Force language update after everything is loaded
    setTimeout(() => {
      const currentLang = getCurrentLanguage();
      updateTexts(currentLang);
      console.log(`🔄 Final language update: ${currentLang}`);
    }, 500);
    
    console.log('✅ App initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing app:', error);
  }
});

// ============================================
// BACK TO TOP
// ============================================
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================
// RENDER ALL COMPONENTS (Home page)
// ============================================
async function renderAll() {
  renderFeatured();
  renderNewest();
  renderCategoryGridHome();
  updateStats();
  updateWishlistBadge();
  
  // Update language for all elements
  if (typeof updateTexts === 'function') {
    const lang = getCurrentLanguage();
    await updateTexts(lang);
  }
}

// ============================================
// LOAD PRODUCTS & CATEGORIES
// ============================================
async function loadProductsAndCategories() {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch('assets/json/products.json'),
      fetch('assets/json/categories.json')
    ]);
    
    if (!productsRes.ok || !categoriesRes.ok) {
      throw new Error('Failed to load data');
    }
    
    app.products = await productsRes.json();
    app.categories = await categoriesRes.json();
    
    console.log(`✅ Loaded ${app.products.length} products and ${app.categories.length} categories`);
  } catch (error) {
    console.error('❌ Error loading data:', error);
    // Fallback sample data
    app.products = getFallbackProducts();
    app.categories = getFallbackCategories();
    console.log('⚠️ Using fallback data');
  }
}

// ============================================
// RENDER FUNCTIONS (Home page)
// ============================================
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  
  const featured = app.products.filter(p => p.featured).slice(0, 4);
  
  if (featured.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray);">No featured products</p>';
    return;
  }
  
  grid.innerHTML = featured.map(p => createProductCardHTML(p)).join('');
}

function renderNewest() {
  const grid = document.getElementById('newestGrid');
  if (!grid) return;
  
  const newest = app.products.filter(p => p.new).slice(0, 4);
  
  if (newest.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray);">No new products</p>';
    return;
  }
  
  grid.innerHTML = newest.map(p => createProductCardHTML(p)).join('');
}

function renderCategoryGridHome() {
  const grid = document.getElementById('categoryGridHome');
  if (!grid) return;
  
  const categoriesWithCounts = getCategoriesWithCounts();
  const categories = categoriesWithCounts.slice(0, 6);
  
  if (categories.length === 0) {
    grid.innerHTML = '<p style="color:var(--gray);">No categories available</p>';
    return;
  }
  
  const lang = app.currentLang || 'en';
  
  grid.innerHTML = categories.map(c => {
    const name = getTranslation(c, 'name');
    const count = c.count || 0;
    const icon = c.icon || '📁';
    
    return `
      <div class="category-card" onclick="window.location.href='products.html?category=${encodeURIComponent(c.name_en || c.name)}'">
        <div class="icon">${icon}</div>
        <div class="name">${name}</div>
        <div class="count">${count} ${count === 1 ? 'product' : 'products'}</div>
      </div>
    `;
  }).join('');
}

function updateStats() {
  const productsEl = document.getElementById('statProducts');
  const categoriesEl = document.getElementById('statCategories');
  const brandsEl = document.getElementById('statBrands');
  
  if (productsEl) productsEl.textContent = app.products.length;
  
  if (categoriesEl) {
    const categoriesWithCounts = getCategoriesWithCounts();
    const totalCategories = categoriesWithCounts.filter(c => c.count > 0).length;
    categoriesEl.textContent = totalCategories || app.categories.length;
  }
  
  if (brandsEl) {
    const brands = new Set(app.products.map(p => p.brand).filter(Boolean));
    brandsEl.textContent = brands.size;
  }
}

// ============================================
// FALLBACK DATA
// ============================================
function getFallbackProducts() {
  return [
    { id: 1, name_en: 'Premium Headphones', name_mm: 'နားကြပ်', category: 'Electronics', brand: 'Sony', price: 299, discount: 10, rating: 4.8, stock: true, image: 'https://picsum.photos/400/400?random=1', featured: true, new: true },
    { id: 2, name_en: 'Smart Watch', name_mm: 'စမတ်နာရီ', category: 'Wearables', brand: 'Apple', price: 399, discount: 0, rating: 4.9, stock: true, image: 'https://picsum.photos/400/400?random=2', featured: true },
    { id: 3, name_en: 'Wireless Speaker', name_mm: 'စပီကာ', category: 'Audio', brand: 'JBL', price: 149, discount: 20, rating: 4.6, stock: true, image: 'https://picsum.photos/400/400?random=3', new: true },
    { id: 4, name_en: 'Laptop Backpack', name_mm: 'အိတ်', category: 'Accessories', brand: 'North Face', price: 89, discount: 0, rating: 4.4, stock: true, image: 'https://picsum.photos/400/400?random=4' },
    { id: 5, name_en: 'Mechanical Keyboard', name_mm: 'ကီးဘုတ်', category: 'Computers', brand: 'Logitech', price: 159, discount: 15, rating: 4.7, stock: false, image: 'https://picsum.photos/400/400?random=5', featured: true },
    { id: 6, name_en: 'Gaming Mouse', name_mm: 'မောက်', category: 'Computers', brand: 'Razer', price: 79, discount: 0, rating: 4.5, stock: true, image: 'https://picsum.photos/400/400?random=6', new: true },
  ];
}

function getFallbackCategories() {
  return [
    { id: 1, name_en: 'Electronics', name_mm: 'အီလက်ထရွန်း', icon: '📱' },
    { id: 2, name_en: 'Wearables', name_mm: 'ဝတ်ဆင်နိုင်သော', icon: '⌚' },
    { id: 3, name_en: 'Audio', name_mm: 'အသံ', icon: '🎵' },
    { id: 4, name_en: 'Accessories', name_mm: 'ဆက်စပ်ပစ္စည်း', icon: '🎒' },
    { id: 5, name_en: 'Computers', name_mm: 'ကွန်ပျူတာများ', icon: '💻' },
    { id: 6, name_en: 'Cameras', name_mm: 'ကင်မရာများ', icon: '📷' },
  ];
}

// ============================================
// TRANSLATION HELPER
// ============================================
function getTranslation(obj, field) {
  const lang = app.currentLang || 'en';
  const key = `${field}_${lang}`;
  return obj[key] || obj[`${field}_en`] || obj[field] || '';
}

// ============================================
// QUICK VIEW
// ============================================
function quickView(id) {
  const product = app.products.find(p => p.id === id);
  if (!product) return;
  const lang = app.currentLang || 'en';
  const name = getTranslation(product, 'name');
  const desc = getTranslation(product, 'description') || 'No description available.';
  alert(`🛍️ ${name}\n\n${desc}\n\n💰 $${product.price}`);
}

// ============================================
// EXPOSE GLOBALLY
// ============================================
window.toggleWishlist = toggleWishlist;
window.quickView = quickView;
window.getTranslation = getTranslation;
window.getCategoriesWithCounts = getCategoriesWithCounts;
window.loadProductsAndCategories = loadProductsAndCategories;
window.renderAll = renderAll;
window.renderFeatured = renderFeatured;
window.renderNewest = renderNewest;
window.renderCategoryGridHome = renderCategoryGridHome;
window.updateStats = updateStats;
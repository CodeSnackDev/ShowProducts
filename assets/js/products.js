// ============================================
// PRODUCTS - Product-related functions (FIXED)
// ============================================

// Get all products
function getAllProducts() {
  return app.products || [];
}

// ============================================
// GET PRODUCT BY ID - Make sure this exists
// ============================================
function getProductById(id) {
  if (!app.products || app.products.length === 0) {
    console.warn('⚠️ Products not loaded yet');
    return null;
  }
  const product = app.products.find(p => p.id === id);
  if (!product) {
    console.warn(`⚠️ Product with ID ${id} not found`);
  }
  return product || null;
}

// Get products by category
function getProductsByCategory(category) {
  return app.products.filter(p => p.category === category);
}

// Get products by brand
function getProductsByBrand(brand) {
  return app.products.filter(p => p.brand === brand);
}

// Get featured products
function getFeaturedProducts(limit = 8) {
  return app.products.filter(p => p.featured).slice(0, limit);
}

// Get new products
function getNewProducts(limit = 8) {
  return app.products.filter(p => p.new).slice(0, limit);
}

// Get best sellers
function getBestSellers(limit = 8) {
  return app.products.filter(p => p.bestSeller).slice(0, limit);
}

// Get trending products
function getTrendingProducts(limit = 8) {
  return app.products.filter(p => p.trending).slice(0, limit);
}

// Search products
function searchProducts(query) {
  if (!query || query.trim() === '') return app.products;
  const q = query.toLowerCase().trim();
  const lang = app.currentLang || 'en';
  
  return app.products.filter(p => {
    const name = (p[`name_${lang}`] || p.name_en || '').toLowerCase();
    const desc = (p[`description_${lang}`] || p.description_en || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const tags = (p.tags || []).join(' ').toLowerCase();
    
    return name.includes(q) || desc.includes(q) || category.includes(q) || 
           brand.includes(q) || tags.includes(q);
  });
}

// Get related products
function getRelatedProducts(productId, limit = 4) {
  const product = getProductById(productId);
  if (!product) return [];
  
  return app.products
    .filter(p => p.id !== productId && (p.category === product.category || p.brand === product.brand))
    .slice(0, limit);
}

// Get all categories with counts (FIXED)
function getCategoriesWithCounts() {
  const counts = {};
  
  // Count products by category
  app.products.forEach(p => {
    const category = p.category;
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
  });
  
  // Map categories with counts
  return app.categories.map(c => {
    const nameEn = c.name_en || c.name || '';
    return {
      ...c,
      count: counts[nameEn] || 0
    };
  });
}

// Get all brands with counts
function getBrandsWithCounts() {
  const counts = {};
  app.products.forEach(p => {
    counts[p.brand] = (counts[p.brand] || 0) + 1;
  });
  return Object.entries(counts).map(([brand, count]) => ({ brand, count }));
}

// Price range
function getPriceRange() {
  const prices = app.products.map(p => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// Filter products
function filterProducts(filters) {
  let products = [...app.products];
  
  if (filters.category) {
    products = products.filter(p => p.category === filters.category);
  }
  
  if (filters.brand) {
    products = products.filter(p => p.brand === filters.brand);
  }
  
  if (filters.minPrice !== undefined) {
    products = products.filter(p => p.price >= filters.minPrice);
  }
  
  if (filters.maxPrice !== undefined) {
    products = products.filter(p => p.price <= filters.maxPrice);
  }
  
  if (filters.minRating) {
    products = products.filter(p => (p.rating || 0) >= filters.minRating);
  }
  
  if (filters.availability === 'in-stock') {
    products = products.filter(p => p.stock);
  } else if (filters.availability === 'out-of-stock') {
    products = products.filter(p => !p.stock);
  }
  
  // Sort
  if (filters.sort) {
    switch(filters.sort) {
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'az':
        products.sort((a, b) => a.name_en.localeCompare(b.name_en));
        break;
      case 'za':
        products.sort((a, b) => b.name_en.localeCompare(a.name_en));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
  }
  
  return products;
}

// ============================================
// CREATE PRODUCT CARD HTML (FIXED)
// ============================================
function createProductCardHTML(product) {
  const lang = app.currentLang || 'en';
  const name = product[`name_${lang}`] || product.name_en || 'Product';
  const price = product.price || 0;
  const discount = product.discount || 0;
  const finalPrice = discount > 0 ? (price * (1 - discount/100)).toFixed(2) : price;
  const isWishlisted = app.wishlist && app.wishlist.includes(product.id);
  
  // Fixed image URL - use product.image or fallback
  const imageUrl = product.image || `https://picsum.photos/400/400?random=${product.id}`;
  
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="image-wrap">
        <img src="${imageUrl}" alt="${name}" loading="lazy" onerror="this.src='https://picsum.photos/400/400?random=${product.id}'">
        ${product.discount > 0 ? `<span class="badge-tag">-${product.discount}%</span>` : ''}
        ${product.new ? `<span class="badge-tag" style="background:var(--secondary);left:auto;right:12px;">NEW</span>` : ''}
        <div class="card-actions">
          <button onclick="toggleWishlist(${product.id}); event.stopPropagation();" aria-label="Add to wishlist">
            ${isWishlisted ? '❤️' : '🤍'}
          </button>
          <button onclick="quickView(${product.id}); event.stopPropagation();" aria-label="Quick view">👁️</button>
        </div>
      </div>
      <div class="info">
        <div class="name">${name}</div>
        <div class="category">${product.category || 'Uncategorized'} • ${product.brand || 'Unknown'}</div>
        <div class="price">
          $${finalPrice}
          ${discount > 0 ? `<span class="original">$${price}</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap;">
          <span>⭐ ${product.rating || 4.5}</span>
          <span style="color:${product.stock ? 'var(--secondary)' : 'var(--accent)'};font-size:0.8rem;">
            ${product.stock ? '🟢 In stock' : '🔴 Out of stock'}
          </span>
        </div>
        <a href="product.html?id=${product.id}" class="btn btn-primary" style="margin-top:12px;width:100%;justify-content:center;font-size:0.9rem;padding:10px;">View Details</a>
      </div>
    </div>
  `;
}
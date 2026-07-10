// ============================================
// ROUTER - Client-side navigation (COMPLETE)
// ============================================

// Simple router for SPA-like navigation
function navigateTo(path) {
  window.location.href = path;
}

// Handle product page routing
function handleProductRouting() {
  console.log('🔍 Checking product routing...');
  
  // Get product ID from URL
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  console.log(`📦 Product ID from URL: ${id}`);
  
  // Check if we're on product page
  const isProductPage = window.location.pathname.includes('product.html');
  console.log(`📍 Is product page: ${isProductPage}`);
  
  if (isProductPage && id) {
    console.log(`🔄 Rendering product with ID: ${id}`);
    renderProductDetail(parseInt(id));
  } else if (isProductPage && !id) {
    console.warn('⚠️ No product ID found in URL');
    // Redirect to products page if no ID
    window.location.href = 'products.html';
  }
}

// Render product detail page
function renderProductDetail(id) {
  console.log(`🔄 Rendering product detail for ID: ${id}`);
  
  // Get product from data
  const product = getProductById(id);
  
  if (!product) {
    console.error(`❌ Product with ID ${id} not found`);
    // Redirect to 404 page
    window.location.href = '404.html';
    return;
  }
  
  console.log(`✅ Product found: ${product.name_en}`);
  
  // Save to recently viewed
  addToRecentlyViewed(id);
  
  const container = document.getElementById('productDetail');
  if (!container) {
    console.error('❌ Product detail container not found');
    return;
  }
  
  const lang = app.currentLang || 'en';
  const name = getTranslation(product, 'name') || product.name_en || 'Product';
  const desc = getTranslation(product, 'description') || product.description_en || 'No description available.';
  const finalPrice = product.discount > 0 ? 
    (product.price * (1 - product.discount/100)).toFixed(2) : 
    product.price;
  
  // Build gallery thumbnails
  const galleryImages = product.gallery || [product.image];
  const thumbnailsHtml = galleryImages.slice(0, 4).map(img => 
    `<img src="${img || 'https://picsum.photos/80/80?random=' + product.id}" alt="${name}" onclick="document.getElementById('mainImage').src='${img || 'https://picsum.photos/600/600?random=' + product.id}'">`
  ).join('');
  
  // Build tags
  const tagsHtml = (product.tags || []).map(tag => 
    `<span style="display:inline-block;background:var(--gray-light);padding:4px 12px;border-radius:20px;font-size:0.85rem;margin:2px;">${tag}</span>`
  ).join('');
  
  container.innerHTML = `
    <div class="product-detail">
      <div class="gallery">
        <img id="mainImage" src="${product.image || 'https://picsum.photos/600/600?random=' + product.id}" alt="${name}" class="main-img" onerror="this.src='https://picsum.photos/600/600?random=${product.id}'">
        <div class="thumbnails">
          ${thumbnailsHtml || '<p style="color:var(--gray);font-size:0.9rem;">No additional images</p>'}
        </div>
      </div>
      <div class="info">
        <h1>${name}</h1>
        <div class="meta">${product.category || 'Uncategorized'} • ${product.brand || 'Unknown'}</div>
        <div class="price-large">
          $${finalPrice}
          ${product.discount > 0 ? `<span class="original" style="font-size:1.2rem;text-decoration:line-through;color:var(--gray);margin-left:10px;">$${product.price}</span>` : ''}
        </div>
        <div style="display:flex;gap:15px;margin-bottom:15px;flex-wrap:wrap;">
          <span>⭐ ${product.rating || 4.5} (120 reviews)</span>
          <span style="color:${product.stock ? 'var(--secondary)' : 'var(--accent)'};">
            ${product.stock ? '✅ In Stock' : '❌ Out of Stock'}
          </span>
        </div>
        <div class="description">${desc}</div>
        <div class="specs" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0;padding:20px;background:var(--gray-light);border-radius:var(--radius-sm);">
          <dt style="font-weight:600;">Category</dt><dd>${product.category || 'N/A'}</dd>
          <dt style="font-weight:600;">Brand</dt><dd>${product.brand || 'N/A'}</dd>
          <dt style="font-weight:600;">SKU</dt><dd>#${product.id}</dd>
          <dt style="font-weight:600;">Tags</dt><dd>${tagsHtml || 'N/A'}</dd>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px;">
          <button class="btn btn-primary" onclick="toggleWishlist(${product.id}); location.reload();">
            ${isInWishlist(product.id) ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist'}
          </button>
          <a href="products.html" class="btn btn-outline">← Back to Products</a>
        </div>
      </div>
    </div>
    <div class="related-products" style="margin-top:40px;">
      <h3 data-i18n="product.related" style="margin-bottom:20px;">Related Products</h3>
      <div class="product-grid" id="relatedGrid"></div>
    </div>
  `;
  
  // Render related products
  const related = getRelatedProducts(id);
  const relatedGrid = document.getElementById('relatedGrid');
  if (relatedGrid) {
    if (related.length === 0) {
      relatedGrid.innerHTML = '<p style="color:var(--gray);">No related products found.</p>';
    } else {
      relatedGrid.innerHTML = related.map(p => createProductCardHTML(p)).join('');
    }
  }
  
  // Update language for the new content
  if (typeof updateTexts === 'function') {
    setTimeout(() => {
      updateTexts(app.currentLang || 'en');
    }, 100);
  }
  
  console.log('✅ Product detail rendered successfully');
}

// Initialize router - called from product.html
function initRouter() {
  console.log('🔄 Router initializing...');
  handleProductRouting();
}

// Make sure router is available globally
window.initRouter = initRouter;
window.handleProductRouting = handleProductRouting;
window.renderProductDetail = renderProductDetail;
// ============================================
// SEARCH - Real-time search functionality (FIXED)
// ============================================

let searchTimeout = null;

// Initialize search on products page
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput) {
    console.warn('⚠️ Search input not found');
    return;
  }
  
  console.log('🔍 Search initialized');
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      if (searchResults) searchResults.innerHTML = '';
      // Reset product results if on products page
      if (typeof applyFilters === 'function') {
        applyFilters();
      }
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });
}

// Perform search
function performSearch(query) {
  const results = searchProducts(query);
  const resultsContainer = document.getElementById('searchResults');
  
  // If we're on products page, use the product grid
  const productGrid = document.getElementById('productResults');
  
  if (productGrid) {
    // On products page - show results in grid
    if (results.length === 0) {
      productGrid.innerHTML = `
        <div class="no-results" style="text-align:center;padding:60px 0;grid-column:1/-1;">
          <p style="font-size:3rem;">🔍</p>
          <h3>No products found for "${query}"</h3>
          <p style="color:var(--gray);">Try different keywords</p>
        </div>
      `;
    } else {
      productGrid.innerHTML = results.map(p => createProductCardHTML(p)).join('');
    }
    
    // Update result count
    const countEl = document.getElementById('resultCount');
    if (countEl) {
      countEl.textContent = `(${results.length} results)`;
    }
    
    return;
  }
  
  // For search results dropdown (if exists)
  if (resultsContainer) {
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="no-results" style="padding:20px;text-align:center;">
          <p>🔍 No products found for "${query}"</p>
          <p style="color:var(--gray);font-size:0.9rem;">Try different keywords</p>
        </div>
      `;
      return;
    }
    
    const lang = app.currentLang || 'en';
    resultsContainer.innerHTML = results.slice(0, 5).map(p => {
      const name = getTranslation(p, 'name');
      const highlighted = highlightMatch(name, query);
      return `
        <a href="product.html?id=${p.id}" class="search-result-item" style="display:flex;gap:12px;padding:10px;border-bottom:1px solid var(--gray-light);text-decoration:none;color:inherit;align-items:center;">
          <img src="${p.image || 'https://picsum.photos/50/50?random=' + p.id}" alt="${name}" loading="lazy" style="width:50px;height:50px;object-fit:cover;border-radius:var(--radius-sm);">
          <div>
            <div>${highlighted}</div>
            <div style="font-size:0.85rem;color:var(--gray);">${p.category} • $${p.price}</div>
          </div>
        </a>
      `;
    }).join('');
  }
}

// Highlight matching text
function highlightMatch(text, query) {
  if (!query || !text) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark style="background:var(--accent);color:white;padding:0 4px;border-radius:3px;">$1</mark>');
}

// Search suggestions
function getSearchSuggestions(query) {
  const results = searchProducts(query);
  const suggestions = [];
  const seen = new Set();
  
  results.forEach(p => {
    const name = p.name_en;
    if (name && name.toLowerCase().includes(query.toLowerCase()) && !seen.has(name)) {
      seen.add(name);
      suggestions.push(name);
    }
  });
  
  return suggestions.slice(0, 5);
}

// Global search from hero
function globalSearch(query) {
  if (!query || query.trim() === '') return;
  window.location.href = `products.html?search=${encodeURIComponent(query.trim())}`;
}

// Search from URL params
function handleSearchFromURL() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('search');
  if (query) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = query;
      // Trigger search after a small delay
      setTimeout(() => {
        performSearch(query);
      }, 100);
    }
  }
}

// Search from hero search on home page
function initHeroSearch() {
  const searchInput = document.getElementById('heroSearch');
  const searchBtn = document.getElementById('heroSearchBtn');
  
  if (!searchInput || !searchBtn) {
    console.warn('⚠️ Hero search not found');
    return;
  }
  
  console.log('🔍 Hero search initialized');
  
  searchBtn.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) {
      window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    }
  });
  
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchBtn.click();
    }
  });
}

// Initialize search on page load
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on products page
  if (window.location.pathname.includes('products.html')) {
    initSearch();
    handleSearchFromURL();
  }
  
  // Check if we're on home page
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
    initHeroSearch();
  }
});

// Expose functions globally
window.initSearch = initSearch;
window.performSearch = performSearch;
window.handleSearchFromURL = handleSearchFromURL;
window.initHeroSearch = initHeroSearch;
window.globalSearch = globalSearch;
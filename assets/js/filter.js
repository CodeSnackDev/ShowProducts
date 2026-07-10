// ============================================
// FILTER - Product filtering and sorting
// ============================================

// Filter state
let filterState = {
  category: '',
  brand: '',
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0,
  availability: '',
  sort: 'newest',
  page: 1,
  perPage: 12
};

// Initialize filters on products page
function initFilters() {
  const filterForm = document.getElementById('filterForm');
  if (!filterForm) return;
  
  // Populate filter options
  populateFilterOptions();
  
  // Event listeners
  filterForm.addEventListener('change', (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      filterState[name] = checked ? value : '';
    } else if (name === 'priceRange') {
      const [min, max] = value.split('-').map(Number);
      filterState.minPrice = min || 0;
      filterState.maxPrice = max || 1000;
    } else {
      filterState[name] = value;
    }
    
    filterState.page = 1;
    applyFilters();
  });
  
  // Reset filters
  document.getElementById('resetFilters')?.addEventListener('click', () => {
    filterState = {
      category: '',
      brand: '',
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
      availability: '',
      sort: 'newest',
      page: 1,
      perPage: 12
    };
    filterForm.reset();
    applyFilters();
  });
  
  // Initial load
  applyFilters();
}

// Populate filter options
function populateFilterOptions() {
  // Categories
  const categorySelect = document.getElementById('filterCategory');
  if (categorySelect) {
    const categories = getCategoriesWithCounts();
    categorySelect.innerHTML = `
      <option value="">All Categories</option>
      ${categories.map(c => 
        `<option value="${c.name_en}">${c.name_en} (${c.count})</option>`
      ).join('')}
    `;
  }
  
  // Brands
  const brandSelect = document.getElementById('filterBrand');
  if (brandSelect) {
    const brands = getBrandsWithCounts();
    brandSelect.innerHTML = `
      <option value="">All Brands</option>
      ${brands.map(b => 
        `<option value="${b.brand}">${b.brand} (${b.count})</option>`
      ).join('')}
    `;
  }
  
  // Price range
  const priceSelect = document.getElementById('filterPrice');
  if (priceSelect) {
    const range = getPriceRange();
    priceSelect.innerHTML = `
      <option value="0-1000">All Prices</option>
      <option value="0-50">Under $50</option>
      <option value="50-100">$50 - $100</option>
      <option value="100-200">$100 - $200</option>
      <option value="200-500">$200 - $500</option>
      <option value="500-1000">$500+</option>
    `;
  }
}

// Apply filters
function applyFilters() {
  const filtered = filterProducts(filterState);
  
  // Paginate
  const start = (filterState.page - 1) * filterState.perPage;
  const end = start + filterState.perPage;
  const paginated = filtered.slice(start, end);
  
  // Render results
  const container = document.getElementById('productResults');
  if (!container) return;
  
  if (paginated.length === 0) {
    container.innerHTML = `
      <div class="no-results" style="text-align:center;padding:60px 0;">
        <p style="font-size:3rem;">🔍</p>
        <h3>No products found</h3>
        <p style="color:var(--gray);">Try adjusting your filters</p>
      </div>
    `;
  } else {
    container.innerHTML = paginated.map(p => createProductCardHTML(p)).join('');
  }
  
  // Update pagination
  renderPagination(filtered.length);
}

// Render pagination
function renderPagination(total) {
  const container = document.getElementById('pagination');
  if (!container) return;
  
  const totalPages = Math.ceil(total / filterState.perPage);
  const currentPage = filterState.page;
  
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = `<div class="pagination">`;
  
  // Previous
  html += `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      html += `<button class="active">${i}</button>`;
    } else if (i <= 3 || i > totalPages - 3 || Math.abs(i - currentPage) <= 1) {
      html += `<button onclick="changePage(${i})">${i}</button>`;
    } else if (i === 4 && currentPage > 5) {
      html += `<span>…</span>`;
    } else if (i === totalPages - 3 && currentPage < totalPages - 4) {
      html += `<span>…</span>`;
    }
  }
  
  // Next
  html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;
  html += `</div>`;
  
  container.innerHTML = html;
}

// Change page
function changePage(page) {
  const total = filterProducts(filterState).length;
  const totalPages = Math.ceil(total / filterState.perPage);
  
  if (page < 1 || page > totalPages) return;
  
  filterState.page = page;
  applyFilters();
  
  // Scroll to top of results
  const results = document.getElementById('productResults');
  if (results) {
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Update results count
function updateResultCount(count) {
  const el = document.getElementById('resultCount');
  if (el) {
    el.textContent = `Showing ${count} products`;
  }
}

// Initialize filters on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('products.html')) {
    initFilters();
  }
});
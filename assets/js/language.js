// ============================================
// LANGUAGE - Multi-language support (HEADER FIX)
// ============================================

// Language configuration
const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧' },
  mm: { label: 'မြန်မာ', flag: '🇲🇲' }
};

// Default language
const DEFAULT_LANG = 'en';

// Translation cache
let translations = { en: {}, mm: {} };
let isTranslationsLoaded = false;

// Initialize language
function initLanguage() {
  console.log('🌐 Initializing language...');
  
  const savedLang = localStorage.getItem('preferred_lang') || DEFAULT_LANG;
  console.log(`📌 Saved language: ${savedLang}`);
  
  // Load translations first, then set language
  loadLanguageFiles().then(() => {
    setLanguage(savedLang);
  }).catch((error) => {
    console.error('❌ Error loading language files:', error);
    setLanguage(savedLang);
  });
  
  // Setup language toggle button
  setupLanguageToggle();
}

// Setup language toggle button
function setupLanguageToggle() {
  const toggleBtn = document.getElementById('langToggle');
  if (!toggleBtn) {
    console.warn('⚠️ Language toggle button not found');
    return;
  }
  
  console.log('🔘 Setting up language toggle button');
  
  // Remove existing event listeners by cloning
  const newBtn = toggleBtn.cloneNode(true);
  toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
  
  // Add click event
  newBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const current = app.currentLang || DEFAULT_LANG;
    const next = current === 'en' ? 'mm' : 'en';
    console.log(`🔄 Switching language from ${current} to ${next}`);
    setLanguage(next);
  });
  
  // Update button text based on current language
  const currentLang = app.currentLang || DEFAULT_LANG;
  newBtn.textContent = currentLang === 'en' ? '🇲🇲' : '🇬🇧';
}

// Set language
function setLanguage(lang) {
  console.log(`🌐 Setting language to: ${lang}`);
  
  if (!LANGUAGES[lang]) {
    console.warn(`⚠️ Language ${lang} not supported, falling back to ${DEFAULT_LANG}`);
    lang = DEFAULT_LANG;
  }
  
  app.currentLang = lang;
  localStorage.setItem('preferred_lang', lang);
  
  // Update toggle button
  const toggleBtn = document.getElementById('langToggle');
  if (toggleBtn) {
    toggleBtn.textContent = lang === 'en' ? '🇲🇲' : 'EN';
    toggleBtn.setAttribute('aria-label', `Switch to ${lang === 'en' ? 'Myanmar' : 'English'}`);
  }
  
  // CRITICAL: Update header navigation first
  updateHeaderNavigation(lang);
  
  // Update all text elements
  updateTexts(lang);
  
  // Re-render product cards if on home page
  if (typeof renderFeatured === 'function' && document.getElementById('featuredGrid')) {
    renderFeatured();
    renderNewest();
    renderCategoryGridHome();
  }
  
  // Re-render if on products page
  if (typeof applyFilters === 'function' && document.getElementById('productResults')) {
    applyFilters();
  }
  
  // Dispatch custom event for other components
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  
  console.log(`✅ Language set to: ${lang}`);
}

// CRITICAL: Update header navigation specifically
function updateHeaderNavigation(lang) {
  console.log(`📝 Updating header navigation for language: ${lang}`);
  
  const t = translations[lang] || translations['en'] || {};
  
  // Find all navigation links with data-i18n
  const navLinks = document.querySelectorAll('.nav a[data-i18n]');
  console.log(`📍 Found ${navLinks.length} navigation links`);
  
  navLinks.forEach(link => {
    const key = link.getAttribute('data-i18n');
    const value = getNestedValue(t, key);
    if (value) {
      link.textContent = value;
      console.log(`✅ Updated ${key} to: ${value}`);
    } else {
      console.warn(`⚠️ No translation found for: ${key}`);
    }
  });
  
  // Also update any other header elements with data-i18n
  const headerElements = document.querySelectorAll('.header [data-i18n]');
  headerElements.forEach(el => {
    if (!el.closest('.nav')) { // Skip nav links (already handled)
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(t, key);
      if (value) {
        el.textContent = value;
      }
    }
  });
}

// Update all text elements
function updateTexts(lang) {
  console.log(`📝 Updating all texts for language: ${lang}`);
  
  const t = translations[lang] || translations['en'] || {};
  
  // Update all elements with data-i18n attribute
  const elements = document.querySelectorAll('[data-i18n]');
  console.log(`📍 Found ${elements.length} elements with data-i18n`);
  
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(t, key);
    if (value) {
      el.textContent = value;
    } else {
      // If translation not found, try English
      const fallback = getNestedValue(translations['en'], key);
      if (fallback) {
        el.textContent = fallback;
      }
    }
  });
  
  // Update placeholder texts
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = getNestedValue(t, key);
    if (value) {
      el.placeholder = value;
    }
  });
  
  // Update select options with data-i18n
  document.querySelectorAll('select [data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = getNestedValue(t, key);
    if (value) {
      el.textContent = value;
    }
  });
}

// Get nested value from translations
function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

// Load language files
async function loadLanguageFiles() {
  console.log('📂 Loading language files...');
  
  try {
    const [enRes, mmRes] = await Promise.all([
      fetch('assets/languages/en.json'),
      fetch('assets/languages/mm.json')
    ]);
    
    if (!enRes.ok) {
      throw new Error(`Failed to load en.json: ${enRes.status}`);
    }
    if (!mmRes.ok) {
      throw new Error(`Failed to load mm.json: ${mmRes.status}`);
    }
    
    translations.en = await enRes.json();
    translations.mm = await mmRes.json();
    isTranslationsLoaded = true;
    
    console.log('✅ Language files loaded successfully');
    console.log(`📖 English: ${Object.keys(translations.en).length} keys`);
    console.log(`📖 Myanmar: ${Object.keys(translations.mm).length} keys`);
  } catch (error) {
    console.error('❌ Error loading language files:', error);
    // Fallback - use empty translations with default values
    translations.en = {
      "nav": {
        "home": "Home",
        "products": "Products",
        "categories": "Categories",
        "about": "About",
        "contact": "Contact"
      }
    };
    translations.mm = {
      "nav": {
        "home": "ပင်မစာမျက်နှာ",
        "products": "ပစ္စည်းများ",
        "categories": "အမျိုးအစားများ",
        "about": "အကြောင်း",
        "contact": "ဆက်သွယ်ရန်"
      }
    };
    isTranslationsLoaded = true;
  }
}

// Get translation for a key
function getTranslation(key) {
  const lang = app.currentLang || DEFAULT_LANG;
  const t = translations[lang] || translations['en'] || {};
  return getNestedValue(t, key) || key;
}

// Get current language
function getCurrentLanguage() {
  return app.currentLang || DEFAULT_LANG;
}

// Export for use in other files
window.initLanguage = initLanguage;
window.setLanguage = setLanguage;
window.updateTexts = updateTexts;
window.getTranslation = getTranslation;
window.getCurrentLanguage = getCurrentLanguage;
window.loadLanguageFiles = loadLanguageFiles;
window.setupLanguageToggle = setupLanguageToggle;
window.updateHeaderNavigation = updateHeaderNavigation;
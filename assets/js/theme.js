// ============================================
// THEME - Dark/Light mode
// ============================================

// Theme constants
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

// Initialize theme
function initTheme() {
  const savedTheme = localStorage.getItem('preferred_theme') || THEMES.LIGHT;
  setTheme(savedTheme);
  
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }
}

// Set theme
function setTheme(theme) {
  if (!Object.values(THEMES).includes(theme)) {
    theme = THEMES.LIGHT;
  }
  
  app.currentTheme = theme;
  localStorage.setItem('preferred_theme', theme);
  
  if (theme === THEMES.DARK) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  
  // Update toggle button
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.textContent = theme === THEMES.DARK ? '☀️' : '🌙';
    toggleBtn.setAttribute('aria-label', `Switch to ${theme === THEMES.DARK ? 'Light' : 'Dark'} mode`);
  }
}

// Toggle theme
function toggleTheme() {
  const current = app.currentTheme || THEMES.LIGHT;
  const next = current === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  setTheme(next);
}

// Get current theme
function getCurrentTheme() {
  return app.currentTheme || THEMES.LIGHT;
}

// Check if dark mode is active
function isDarkMode() {
  return document.body.classList.contains('dark');
}
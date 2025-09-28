/**
 * Unified Language Switcher Component (desktop dropdown + mobile inline)
 * - Desktop: replaces .desktop-lang-selector with dropdown
 * - Mobile: preserves/ensures .mobile-lang-selector anchors inside #mobile-menu
 * - Robust events: preventDefault on [data-lang], explicit binding inside mobile menu
 */

class LanguageSwitcher {
  constructor() {
    this.isInitialized = false;
    this.dropdown = null;
    this.button = null;
  }

  initialize() {
    if (this.isInitialized) return;

    if (!window.i18n) {
      setTimeout(() => this.initialize(), 100);
      return;
    }

    this.createLanguageSwitcher();
    this.bindEvents();
    this.bindGlobalLanguageLinks();
    this.ensureMobileSelector();
    this.isInitialized = true;
  }

  createLanguageSwitcher() {
    // Replace only the desktop inline selector, if present
    const desktopSelector = document.querySelector('.desktop-lang-selector');
    if (desktopSelector) {
      const parent = desktopSelector.parentElement;
      const newSwitcher = this.createSwitcherHTML();
      parent.replaceChild(newSwitcher, desktopSelector);
      return;
    }

    // Otherwise, inject at start of desktop nav
    const headerNav = document.querySelector('header nav[aria-label="Main"]') || document.querySelector('header nav');
    if (headerNav) {
      const newSwitcher = this.createSwitcherHTML();
      headerNav.insertBefore(newSwitcher, headerNav.firstChild);
    }
  }

  createSwitcherHTML() {
    const container = document.createElement('div');
    container.className = 'language-switcher';

    const button = document.createElement('button');
    button.className = 'language-btn';
    button.id = 'language-btn';
    button.innerHTML = `
      <span id="current-lang">EN</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    `;

    const dropdown = document.createElement('div');
    dropdown.className = 'language-dropdown';
    dropdown.id = 'language-dropdown';

    const languages = window.i18n.getSupportedLanguages();
    const languageNames = window.i18n.getLanguageNames();
    languages.forEach((lang) => {
      const option = document.createElement('button');
      option.className = 'language-option';
      option.setAttribute('data-lang', lang);
      option.textContent = languageNames[lang];
      dropdown.appendChild(option);
    });

    container.appendChild(button);
    container.appendChild(dropdown);
    return container;
  }

  bindEvents() {
    this.button = document.getElementById('language-btn');
    this.dropdown = document.getElementById('language-dropdown');
    if (!this.button || !this.dropdown) return;

    // Toggle dropdown
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdown.classList.toggle('show');
    });

    // Close on outside click
    document.addEventListener('click', () => {
      this.dropdown.classList.remove('show');
    });

    // Keep open when interacting inside
    this.dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Language option clicks
    this.dropdown.addEventListener('click', (e) => {
      const btn = e.target.closest('.language-option');
      if (!btn) return;
      const lang = btn.getAttribute('data-lang');
      this.changeLanguage(lang);
      this.dropdown.classList.remove('show');
    });

    // Escape closes
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.dropdown.classList.remove('show');
    });
  }

  bindGlobalLanguageLinks() {
    // Global delegated handler, including mobile anchors
    document.addEventListener('click', (e) => {
      // Skip if clicked inside the dropdown; that has its own handler
      if (e.target.closest('.language-dropdown')) return;
      const target = e.target.closest('[data-lang]');
      if (!target) return;
      const lang = target.getAttribute('data-lang');
      if (!lang) return;
      e.preventDefault();
      this.changeLanguage(lang);

      // If it came from inside mobile menu, close it and sync ARIA
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && mobileMenu.contains(target)) {
        mobileMenu.classList.add('hidden');
        document.getElementById('menu-btn')?.setAttribute('aria-expanded', 'false');
      }
    });

    // Explicit local binding inside #mobile-menu to avoid bubbling edge cases
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
      mobileMenu.addEventListener('click', (e) => {
        const target = e.target.closest('[data-lang]');
        if (!target) return;
        const lang = target.getAttribute('data-lang');
        if (!lang) return;
        e.preventDefault();
        this.changeLanguage(lang);
        mobileMenu.classList.add('hidden');
        document.getElementById('menu-btn')?.setAttribute('aria-expanded', 'false');
      });
    }
  }

  ensureMobileSelector() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (!mobileMenu) return;
    let selector = mobileMenu.querySelector('.mobile-lang-selector');
    if (!selector) {
      const divider = document.createElement('div');
      divider.className = 'border-t border-slate-700 my-2';

      selector = document.createElement('div');
      selector.className = 'flex justify-center space-x-4 py-2 text-slate-400 mobile-lang-selector';
      ['en', 'pt', 'fr', 'es'].forEach((l) => {
        const a = document.createElement('a');
        a.href = '#';
        a.setAttribute('data-lang', l);
        a.textContent = l.toUpperCase();
        a.className = 'hover:text-white transition-colors';
        selector.appendChild(a);
      });

      mobileMenu.appendChild(divider);
      mobileMenu.appendChild(selector);
    }

    // Sync active state
    const current = window.i18n?.getCurrentLanguage?.() || 'en';
    selector.querySelectorAll('[data-lang]').forEach((el) => {
      el.classList.toggle('active', el.getAttribute('data-lang') === current);
    });
  }

  async changeLanguage(lang) {
    if (window.i18n) await window.i18n.setLanguage(lang);
  }

  updateDisplay() {
    const current = window.i18n?.getCurrentLanguage() || 'en';
    const currentSpan = document.getElementById('current-lang');
    if (currentSpan) currentSpan.textContent = current.toUpperCase();

    const dropdown = document.getElementById('language-dropdown');
    dropdown?.querySelectorAll('.language-option').forEach((opt) => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === current);
    });

    document.querySelectorAll('.mobile-lang-selector [data-lang]').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('data-lang') === current);
    });
  }
}

window.languageSwitcher = new LanguageSwitcher();

document.addEventListener('DOMContentLoaded', () => {
  window.languageSwitcher.initialize();
});

document.addEventListener('languageChanged', () => {
  window.languageSwitcher.updateDisplay();
});


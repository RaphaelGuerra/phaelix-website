/**
 * Unified Internationalization (i18n) System for Phaelix
 * - Uses data-key attributes for translations
 * - Loads translations from /locales/<lang>.json
 * - Updates URL ?lang=xx and dispatches languageChanged
 */

class I18nManager {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.supportedLanguages = ['en', 'pt', 'fr', 'es'];
    this.languageNames = {
      en: '🇺🇸 English',
      pt: '🇧🇷 Português',
      fr: '🇫🇷 Français',
      es: '🇪🇸 Español',
    };
  }

  async initialize() {
    // URL param > saved > browser
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    const savedLang = localStorage.getItem('preferred-language');
    const browserLang = this.detectBrowserLanguage();
    const initialLang =
      urlLang && this.supportedLanguages.includes(urlLang) ? urlLang : savedLang || browserLang;

    await this.setLanguage(initialLang);
    this.updateURL();
    this.addHreflangTags();
  }

  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = (browserLang || 'en').split('-')[0].toLowerCase();
    return this.supportedLanguages.includes(langCode) ? langCode : 'en';
  }

  async loadTranslations(lang) {
    try {
      const res = await fetch(`locales/${lang}.json`);
      if (!res.ok) throw new Error(`Failed to fetch locales/${lang}.json`);
      this.translations[lang] = await res.json();
    } catch (err) {
      console.warn(`[i18n] ${err.message}`);
      // Graceful fallback: keep an empty map so we don't re-fetch endlessly
      if (!this.translations[lang]) this.translations[lang] = {};
    }
  }

  async setLanguage(lang) {
    if (!this.supportedLanguages.includes(lang)) return;

    if (!this.translations[lang]) {
      await this.loadTranslations(lang);
    }

    this.currentLanguage = lang;

    // HTML lang attribute
    document.documentElement.lang = lang;

    // Update page title & meta
    this.updateHeadTranslations();

    // Translate visible content (only update when translation exists)
    this.translatePage();

    // Update any UI switchers/indicators
    this.updateLanguageSwitcher();

    // Persist preference
    localStorage.setItem('preferred-language', lang);

    // Reflect in URL without reload
    this.updateURL();

    // Notify listeners
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  updateHeadTranslations() {
    const dict = this.translations[this.currentLanguage] || {};

    // <title data-key="pageTitle">...
    const titleEl = document.querySelector('title[data-key]');
    if (titleEl) {
      const key = titleEl.getAttribute('data-key');
      const t = dict[key];
      if (typeof t === 'string') {
        document.title = t;
        titleEl.textContent = t;
      }
    }

    // <meta name="description" data-key="metaDescription" content="...">
    const metaDesc = document.querySelector('meta[name="description"][data-key]');
    if (metaDesc) {
      const key = metaDesc.getAttribute('data-key');
      const t = dict[key];
      if (typeof t === 'string') metaDesc.setAttribute('content', t);
    }
  }

  translatePage() {
    const dict = this.translations[this.currentLanguage] || {};
    const nodes = document.querySelectorAll('[data-key]');
    nodes.forEach((el) => {
      const key = el.getAttribute('data-key');
      const t = dict[key];
      if (typeof t !== 'string') return; // Non-destructive: leave as-is if missing

      // Generic text replacement; skip <meta> handled in updateHeadTranslations
      if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
        el.setAttribute('placeholder', t);
      } else if (el.tagName !== 'META') {
        el.textContent = t;
      }
    });
  }

  updateLanguageSwitcher() {
    // Update dropdown current text
    const currentSpan = document.getElementById('current-lang');
    if (currentSpan) currentSpan.textContent = this.currentLanguage.toUpperCase();

    // Active state in dropdown
    document.querySelectorAll('.language-option').forEach((opt) => {
      const lang = opt.getAttribute('data-lang');
      if (lang === this.currentLanguage) opt.classList.add('active');
      else opt.classList.remove('active');
    });

    // Active state in mobile inline selector
    document.querySelectorAll('.mobile-lang-selector [data-lang]').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('data-lang') === this.currentLanguage);
    });
  }

  updateURL() {
    const url = new URL(window.location.href);
    if (this.currentLanguage === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', this.currentLanguage);
    window.history.replaceState({}, '', url);
  }

  addHreflangTags() {
    const head = document.head;
    const base = window.location.origin + window.location.pathname;
    head.querySelectorAll('link[hreflang]').forEach((n) => n.remove());

    this.supportedLanguages.forEach((lang) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = lang === 'en' ? base : `${base}?lang=${lang}`;
      head.appendChild(link);
    });

    const def = document.createElement('link');
    def.rel = 'alternate';
    def.hreflang = 'x-default';
    def.href = base;
    head.appendChild(def);
  }

  t(key) {
    return (this.translations[this.currentLanguage] || {})[key] || key;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  getLanguageNames() {
    return this.languageNames;
  }
}

window.i18n = new I18nManager();

document.addEventListener('DOMContentLoaded', () => {
  window.i18n.initialize();
});

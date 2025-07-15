/**
 * Unified Internationalization (i18n) System for Phaelix AI
 * Loads translations from JSON files and manages language switching
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
            es: '🇪🇸 Español'
        };
    }

    /**
     * Initialize the i18n system
     */
    async initialize() {
        // Get saved language preference or detect browser language
        const savedLang = localStorage.getItem('preferredLanguage');
        const browserLang = this.detectBrowserLanguage();
        const initialLang = savedLang || browserLang;

        // Load initial language
        await this.setLanguage(initialLang);
        
        // Update URL with language parameter
        this.updateURL();
        
        // Add hreflang tags for SEO
        this.addHreflangTags();
    }

    /**
     * Detect browser language
     */
    detectBrowserLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0].toLowerCase();
        
        return this.supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    /**
     * Load translations for a specific language
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`locales/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            // Fallback to English if translation file fails to load
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
        }
    }

    /**
     * Set the current language and update the page
     */
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        // Load translations if not already loaded
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLanguage = lang;
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
        
        // Update page title
        this.updatePageTitle();
        
        // Translate all elements
        this.translatePage();
        
        // Update language switcher
        this.updateLanguageSwitcher();
        
        // Save preference
        localStorage.setItem('preferredLanguage', lang);
        
        // Update URL
        this.updateURL();
        
        // Dispatch custom event for other components
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }

    /**
     * Update page title
     */
    updatePageTitle() {
        const title = this.translations[this.currentLanguage]?.pageTitle;
        if (title) {
            document.title = title;
        }
    }

    /**
     * Translate all elements with data-key attribute (Phaelix uses data-key instead of data-translate)
     */
    translatePage() {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            const translation = this.translations[this.currentLanguage]?.[key];
            
            if (translation) {
                // Handle different element types
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = translation;
                } else if (element.tagName === 'META' && element.name === 'description') {
                    element.content = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
    }

    /**
     * Update language switcher UI
     */
    updateLanguageSwitcher() {
        // Update dropdown button text
        const currentLangBtn = document.getElementById('current-lang');
        if (currentLangBtn) {
            currentLangBtn.textContent = this.currentLanguage.toUpperCase();
        }

        // Update active state in dropdown
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Update existing button styles (for backward compatibility)
        const buttons = document.querySelectorAll('.lang-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            const btnLang = btn.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (btnLang === this.currentLanguage) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Update URL with language parameter
     */
    updateURL() {
        const url = new URL(window.location);
        if (this.currentLanguage === 'en') {
            url.searchParams.delete('lang');
        } else {
            url.searchParams.set('lang', this.currentLanguage);
        }
        
        // Update URL without reloading the page
        window.history.replaceState({}, '', url);
    }

    /**
     * Add hreflang tags for SEO
     */
    addHreflangTags() {
        const head = document.head;
        const baseUrl = window.location.origin + window.location.pathname;
        
        // Remove existing hreflang tags
        const existingHreflangs = head.querySelectorAll('link[hreflang]');
        existingHreflangs.forEach(tag => tag.remove());
        
        // Add hreflang tags for each supported language
        this.supportedLanguages.forEach(lang => {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = lang === 'en' ? baseUrl : `${baseUrl}?lang=${lang}`;
            head.appendChild(link);
        });
        
        // Add x-default hreflang
        const defaultLink = document.createElement('link');
        defaultLink.rel = 'alternate';
        defaultLink.hreflang = 'x-default';
        defaultLink.href = baseUrl;
        head.appendChild(defaultLink);
    }

    /**
     * Get translation for a specific key
     */
    t(key) {
        return this.translations[this.currentLanguage]?.[key] || key;
    }

    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.supportedLanguages;
    }

    /**
     * Get language names
     */
    getLanguageNames() {
        return this.languageNames;
    }
}

// Create global instance
window.i18n = new I18nManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.initialize();
}); 
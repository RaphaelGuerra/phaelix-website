/**
 * Unified Language Switcher Component for Phaelix AI
 * Provides a consistent dropdown language switcher
 */

class LanguageSwitcher {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize the language switcher
     */
    initialize() {
        if (this.isInitialized) return;

        // Wait for i18n to be ready
        if (!window.i18n) {
            setTimeout(() => this.initialize(), 100);
            return;
        }

        this.createLanguageSwitchers();
        this.bindEvents();
        this.isInitialized = true;
        this.updateDisplay();
    }

    /**
     * Create the language switcher HTML
     */
    createLanguageSwitchers() {
        const placeholders = document.querySelectorAll('.desktop-lang-selector, .mobile-lang-selector, .language-switcher');

        // Hydrate placeholders: if empty (no .language-btn), create markup; otherwise leave as-is
        placeholders.forEach(ph => {
            if (!ph.querySelector('.language-btn')) {
                const instance = this.createSwitcherHTML();
                // Replace placeholder with built instance to avoid nested containers
                ph.replaceWith(instance);
            }
        });

        // If none found, insert one into header nav as a convenience
        if (placeholders.length === 0) {
            const headerNav = document.querySelector('header nav');
            if (headerNav) {
                const instance = this.createSwitcherHTML();
                headerNav.insertBefore(instance, headerNav.firstChild);
            }
        }
    }

    /**
     * Create the language switcher HTML structure
     */
    createSwitcherHTML() {
        const container = document.createElement('div');
        container.className = 'language-switcher';
        
        const button = document.createElement('button');
        button.className = 'language-btn';
        button.innerHTML = `
            <span class="current-lang">EN</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        `;

        const dropdown = document.createElement('div');
        dropdown.className = 'language-dropdown';

        // Add language options
        const languages = window.i18n.getSupportedLanguages();
        const languageNames = window.i18n.getLanguageNames();

        languages.forEach(lang => {
            const option = document.createElement('button');
            option.className = 'language-option';
            option.setAttribute('data-lang', lang);
            // Use textContent to avoid HTML injection risk
            option.textContent = languageNames[lang];
            dropdown.appendChild(option);
        });

        container.appendChild(button);
        container.appendChild(dropdown);

        return container;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Toggle specific dropdown
        document.querySelectorAll('.language-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const container = btn.closest('.language-switcher');
                const dd = container?.querySelector('.language-dropdown');
                if (!dd) return;
                // Close others first
                document.querySelectorAll('.language-dropdown.show').forEach(other => {
                    if (other !== dd) other.classList.remove('show');
                });
                dd.classList.toggle('show');
            });
        });

        // Prevent dropdown from closing when clicking inside it
        document.querySelectorAll('.language-dropdown').forEach(dd => {
            dd.addEventListener('click', (e) => e.stopPropagation());
        });

        // Handle language selection (event delegation)
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.classList && target.classList.contains('language-option')) {
                const selectedLang = target.getAttribute('data-lang');
                this.changeLanguage(selectedLang);
                // Close all dropdowns
                document.querySelectorAll('.language-dropdown.show').forEach(dd => dd.classList.remove('show'));
            } else {
                // Close all if clicking outside
                document.querySelectorAll('.language-dropdown.show').forEach(dd => dd.classList.remove('show'));
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.language-dropdown.show').forEach(dd => dd.classList.remove('show'));
            }
        });
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        this.dropdown.classList.toggle('show');
    }

    /**
     * Close dropdown
     */
    closeDropdown() {
        this.dropdown.classList.remove('show');
    }

    /**
     * Change language
     */
    async changeLanguage(lang) {
        if (window.i18n) {
            await window.i18n.setLanguage(lang);
        }
    }

    /**
     * Update the switcher display
     */
    updateDisplay() {
        const currentLang = window.i18n?.getCurrentLanguage() || 'en';
        document.querySelectorAll('.language-switcher').forEach(container => {
            const currentSpan = container.querySelector('.current-lang');
            if (currentSpan) currentSpan.textContent = currentLang.toUpperCase();
            container.querySelectorAll('.language-option').forEach(option => {
                const lang = option.getAttribute('data-lang');
                if (lang === currentLang) option.classList.add('active');
                else option.classList.remove('active');
            });
        });
    }
}

// Create global instance
window.languageSwitcher = new LanguageSwitcher();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.languageSwitcher.initialize();
});

// Update display when i18n changes
document.addEventListener('languageChanged', () => {
    window.languageSwitcher.updateDisplay();
}); 

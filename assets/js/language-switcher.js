/**
 * Unified Language Switcher Component for Phaelix AI
 * Provides a consistent dropdown language switcher
 */

class LanguageSwitcher {
    constructor() {
        this.isInitialized = false;
        this.dropdown = null;
        this.button = null;
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

        this.createLanguageSwitcher();
        this.bindEvents();
        this.isInitialized = true;
    }

    /**
     * Create the language switcher HTML
     */
    createLanguageSwitcher() {
        // Find existing language selector elements to replace
        const existingSelectors = document.querySelectorAll('.language-switcher');
        
        existingSelectors.forEach(selector => {
            const parent = selector.parentElement;
            const newSwitcher = this.createSwitcherHTML();
            
            // Replace the old selector with the new one
            parent.replaceChild(newSwitcher, selector);
        });

        // If no existing selectors found, add to header
        if (existingSelectors.length === 0) {
            const header = document.querySelector('header nav');
            if (header) {
                const newSwitcher = this.createSwitcherHTML();
                header.insertBefore(newSwitcher, header.firstChild);
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
        button.id = 'language-btn';
        button.innerHTML = `
            <span id="current-lang">EN</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        `;

        const dropdown = document.createElement('div');
        dropdown.className = 'language-dropdown';
        dropdown.id = 'language-dropdown';

        // Add language options
        const languages = window.i18n.getSupportedLanguages();
        const languageNames = window.i18n.getLanguageNames();

        languages.forEach(lang => {
            const option = document.createElement('button');
            option.className = 'language-option';
            option.setAttribute('data-lang', lang);
            option.innerHTML = languageNames[lang];
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
        this.button = document.getElementById('language-btn');
        this.dropdown = document.getElementById('language-dropdown');

        if (!this.button || !this.dropdown) return;

        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            this.closeDropdown();
        });

        // Prevent dropdown from closing when clicking inside it
        this.dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Handle language selection
        this.dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('language-option')) {
                const selectedLang = e.target.getAttribute('data-lang');
                this.changeLanguage(selectedLang);
                this.closeDropdown();
            }
        });

        // Close dropdown with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
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
        if (!this.button) return;

        const currentLang = window.i18n?.getCurrentLanguage() || 'en';
        const currentLangSpan = this.button.querySelector('#current-lang');
        
        if (currentLangSpan) {
            currentLangSpan.textContent = currentLang.toUpperCase();
        }

        // Update active state
        const options = this.dropdown?.querySelectorAll('.language-option');
        options?.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === currentLang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
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
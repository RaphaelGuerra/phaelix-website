/**
 * Main JavaScript functionality for Phaelix AI website
 * Handles video modal, chatbot shell stabilization, and interactive features
 */

class MainApp {
  constructor() {
    this.isInitialized = false;
    this.chatbotSectionId = 'ai-bot';
    this.chatbotShell = null;
    this.chatbotEmbed = null;
    this.chatbotLoaded = false;
    this.chatbotReady = false;
    this.chatbotReadyObserver = null;
    this.chatbotReadyTimer = null;
    this.chatbotLoadObserver = null;
  }

  /**
   * Initialize the main application
   */
  initialize() {
    if (this.isInitialized) return;

    this.initializeVideoModal();
    this.initializeScrollEffects();
    this.initializeContactForm();
    this.initializeChatbotShell();
    this.initializeMobileMenu();

    this.isInitialized = true;
  }

  /**
   * Initialize video modal functionality
   */
  initializeVideoModal() {
    // Global functions for video modal (for backward compatibility)
    window.openVideoModal = () => {
      const modal = document.getElementById('videoModal');
      const iframe = document.getElementById('videoIframe');

      if (modal && iframe) {
        // Set the YouTube embed URL
        iframe.src = 'https://www.youtube.com/embed/xxtkCPIoyWU?autoplay=1&rel=0';

        // Show modal
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    };

    window.closeVideoModal = () => {
      const modal = document.getElementById('videoModal');
      const iframe = document.getElementById('videoIframe');

      if (modal && iframe) {
        // Hide modal
        modal.classList.add('hidden');

        // Stop video by clearing src
        iframe.src = '';

        document.body.style.overflow = ''; // Restore scrolling
      }
    };

    // Close modal with Escape key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        window.closeVideoModal();
      }
    });

    // Close modal when clicking on backdrop
    const modal = document.getElementById('videoModal');
    if (modal) {
      const backdrop = modal.querySelector('.absolute.inset-0');
      if (backdrop) {
        backdrop.addEventListener('click', window.closeVideoModal);
      }
    }
  }

  /**
   * Initialize scroll effects
   */
  initializeScrollEffects() {
    // Add scroll-based animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  /**
   * Initialize contact form functionality
   */
  initializeContactForm() {
    const contactForm = document.querySelector('#contact form');

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactForm(contactForm);
      });
    }
  }

  /**
   * Handle contact form submission
   */
  async handleContactForm(form) {
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn?.textContent;

    try {
      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // Simulate form submission (replace with actual endpoint)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Show success message
      this.showNotification('Message sent successfully!', 'success');
      form.reset();
    } catch (error) {
      console.error('Form submission error:', error);
      this.showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      // Reset button state
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  }

  /**
   * Show notification message
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success'
        ? 'bg-green-500 text-white'
        : type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-blue-500 text-white'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);

    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  /**
   * Handle URL parameters on page load
   */
  handleURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');

    if (langParam && window.i18n) {
      window.i18n.setLanguage(langParam);
    }
  }

  /**
   * Initialize particle effects
   */
  initializeParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;

    // Create particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = Math.random() * 10 + 10 + 's';
      particlesContainer.appendChild(particle);
    }
  }

  /**
   * Initialize floating shapes
   */
  initializeFloatingShapes() {
    const shapesContainer = document.querySelector('.floating-shapes');
    if (!shapesContainer) return;

    // Create floating shapes
    for (let i = 0; i < 3; i++) {
      const shape = document.createElement('div');
      shape.className = 'shape';
      shapesContainer.appendChild(shape);
    }
  }

  /**
   * Initialize chatbot shell and lazy-load triggers
   */
  initializeChatbotShell() {
    this.chatbotShell = document.querySelector('[data-chatbot-shell]');
    this.chatbotEmbed = this.chatbotShell?.querySelector('gradio-app');
    if (!this.chatbotShell || !this.chatbotEmbed) return;

    this.initializeChatbotLazyLoad();
  }

  initializeChatbotLazyLoad() {
    const initialHash = window.location.hash;
    const shouldDeferVisibilityObserver = Boolean(initialHash) && !this.isChatbotHash(initialHash);

    const loadFromChatbotHash = () => {
      if (this.isChatbotHash(window.location.hash)) {
        this.loadChatbot();
      }
    };

    document.addEventListener(
      'click',
      (event) => {
        const selector = `a[href="#${this.chatbotSectionId}"]`;
        const link = event.target.closest(selector);
        if (!link) return;
        this.loadChatbot();
      },
      true,
    );

    window.addEventListener('hashchange', loadFromChatbotHash);
    loadFromChatbotHash();

    if (shouldDeferVisibilityObserver) {
      window.setTimeout(() => this.startChatbotVisibilityObserver(), 1500);
      return;
    }

    this.startChatbotVisibilityObserver();
  }

  startChatbotVisibilityObserver() {
    if (this.chatbotLoaded || this.chatbotLoadObserver) return;

    if (!('IntersectionObserver' in window)) {
      this.loadChatbot();
      return;
    }

    this.chatbotLoadObserver = new IntersectionObserver(
      (entries) => {
        const shouldLoad = entries.some((entry) => entry.isIntersecting);
        if (!shouldLoad) return;
        this.loadChatbot();
        this.chatbotLoadObserver?.disconnect();
        this.chatbotLoadObserver = null;
      },
      { rootMargin: '600px 0px', threshold: 0 },
    );

    this.chatbotLoadObserver.observe(this.chatbotShell);
  }

  isChatbotHash(rawHash) {
    if (typeof rawHash !== 'string' || !rawHash.startsWith('#')) return false;

    try {
      return decodeURIComponent(rawHash.slice(1)).trim() === this.chatbotSectionId;
    } catch (error) {
      return rawHash.slice(1).trim() === this.chatbotSectionId;
    }
  }

  loadChatbot() {
    if (this.chatbotLoaded || !this.chatbotEmbed) return;

    const source = this.chatbotEmbed.getAttribute('data-src');
    if (!source) return;

    this.chatbotLoaded = true;
    this.chatbotEmbed.setAttribute('src', source);
    this.activateChatbotReadyMonitoring();
  }

  activateChatbotReadyMonitoring() {
    if (this.chatbotReady || !this.chatbotEmbed || !this.chatbotShell) return;

    const markReady = () => {
      if (this.chatbotReady) return;
      this.chatbotReady = true;
      this.chatbotShell.classList.add('is-ready');
      this.chatbotEmbed.setAttribute('aria-busy', 'false');
      this.chatbotReadyObserver?.disconnect();
      this.chatbotReadyObserver = null;
      if (this.chatbotReadyTimer) {
        clearTimeout(this.chatbotReadyTimer);
        this.chatbotReadyTimer = null;
      }
    };

    const detectEmbed = () => {
      if (
        this.chatbotEmbed.querySelector('iframe') ||
        this.chatbotEmbed.shadowRoot?.querySelector('iframe')
      ) {
        markReady();
      }
    };

    this.chatbotEmbed.setAttribute('aria-busy', 'true');
    this.chatbotReadyObserver = new MutationObserver(detectEmbed);
    this.chatbotReadyObserver.observe(this.chatbotEmbed, { childList: true, subtree: true });

    ['load', 'ready', 'gradio-ready', 'gradio-loaded'].forEach((eventName) => {
      this.chatbotEmbed.addEventListener(eventName, markReady, { once: true });
    });

    this.chatbotReadyTimer = window.setTimeout(markReady, 6000);
    detectEmbed();
  }

  /**
   * Initialize mobile menu toggle and close behaviors
   */
  initializeMobileMenu() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeEventName = 'phaelix:close-mobile-menu';

    if (!menuBtn || !mobileMenu) return;

    const openMenu = () => {
      mobileMenu.classList.remove('hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
    };

    const closeMenu = () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
    };

    const toggleMenu = () => {
      if (mobileMenu.classList.contains('hidden')) {
        openMenu();
      } else {
        closeMenu();
      }
    };

    // Toggle on button click
    menuBtn.addEventListener('click', toggleMenu);

    // Expose one close path so other components can close the menu safely.
    document.addEventListener(closeEventName, closeMenu);
    window.closeMobileMenu = closeMenu;

    // Close on section navigation link click only
    mobileMenu.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    // Keep outside-click logic isolated from menu interactions.
    mobileMenu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      const within = mobileMenu.contains(e.target) || menuBtn.contains(e.target);
      if (!within) closeMenu();
    });
  }
}

// Create global instance
window.mainApp = new MainApp();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.mainApp.initialize();
  window.mainApp.handleURLParameters();
  window.mainApp.initializeParticles();
  window.mainApp.initializeFloatingShapes();
});

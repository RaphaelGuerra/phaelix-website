/**
 * Main JavaScript functionality for Phaelix AI website
 * Handles video modal, chatbot shell stabilization, and interactive features
 */

class MainApp {
  constructor() {
    this.isInitialized = false;
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
   * Stabilize chatbot area while external embed initializes
   */
  initializeChatbotShell() {
    const chatbotShell = document.querySelector('[data-chatbot-shell]');
    const chatbotEmbed = chatbotShell?.querySelector('gradio-app');
    if (!chatbotShell || !chatbotEmbed) return;

    let ready = false;
    let fallbackTimer = null;
    const observer = new MutationObserver(() => {
      if (
        chatbotEmbed.querySelector('iframe') ||
        chatbotEmbed.shadowRoot?.querySelector('iframe')
      ) {
        markReady();
      }
    });

    const markReady = () => {
      if (ready) return;
      ready = true;
      chatbotShell.classList.add('is-ready');
      chatbotEmbed.setAttribute('aria-busy', 'false');
      observer.disconnect();
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
        fallbackTimer = null;
      }
    };

    chatbotEmbed.setAttribute('aria-busy', 'true');
    observer.observe(chatbotEmbed, { childList: true, subtree: true });

    ['load', 'ready', 'gradio-ready', 'gradio-loaded'].forEach((eventName) => {
      chatbotEmbed.addEventListener(eventName, markReady, { once: true });
    });

    fallbackTimer = window.setTimeout(markReady, 6000);
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
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
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

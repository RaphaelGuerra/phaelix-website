/**
 * Main JavaScript functionality for Phaelix AI website
 * Handles video modal, smooth scrolling, and other interactive features
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
        this.initializeSmoothScrolling();
        this.initializeScrollEffects();
        this.initializeContactForm();
        this.initializeLazyGradio();
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
        document.addEventListener('keydown', function(event) {
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
     * Initialize smooth scrolling for anchor links
     */
    initializeSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize scroll effects
     */
    initializeScrollEffects() {
        // Add scroll-based animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe sections for animation
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
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
            await new Promise(resolve => setTimeout(resolve, 2000));

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
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
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
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
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
     * Lazy-load Gradio app when in viewport
     */
    initializeLazyGradio() {
        const gradioApp = document.querySelector('gradio-app[data-src]');
        if (!gradioApp) return;

        const load = () => {
            if (!gradioApp.getAttribute('src')) {
                gradioApp.setAttribute('src', gradioApp.getAttribute('data-src'));
            }
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        load();
                        observer.disconnect();
                    }
                });
            }, { rootMargin: '200px' });
            observer.observe(gradioApp);
        } else {
            // Fallback: load after DOM ready
            setTimeout(load, 1000);
        }
    }

    /**
     * Initialize mobile menu toggle and close behaviors
     */
    initializeMobileMenu() {
        const menuBtn = document.getElementById('menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');

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

        // Close on navigation link click
        mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
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

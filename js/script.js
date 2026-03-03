// ===== MAIN SCRIPT FOR PORTFOLIO WEBSITE =====

class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        // Use throttled/debounced handlers for better performance
        const throttledScroll = this.throttle(this.handleScroll.bind(this), 16); // ~60fps
        const debouncedResize = this.debounce(this.handleResize.bind(this), 250);
        
        this.setupEventListeners(throttledScroll, debouncedResize);
        this.initScrollReveal();
        this.initTypingEffect();
        this.initNavigation();
        this.initMobileMenu();
        this.initSmoothScrolling();
        this.initLazyLoading();
        this.initContactForm();
    }

    setupEventListeners(throttledScroll, debouncedResize) {
        window.addEventListener('scroll', throttledScroll, { passive: true });
        window.addEventListener('resize', debouncedResize, { passive: true });
        window.addEventListener('load', this.handleLoad.bind(this));
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ===== SCROLL HANDLING =====
    handleScroll() {
        this.updateNavbar();
        this.revealElements();
    }

    updateNavbar() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ===== SCROLL REVEAL ANIMATION =====
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        this.observeElements(revealElements);
    }

    observeElements(elements) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(element => {
            observer.observe(element);
        });
    }

    revealElements() {
        const elements = document.querySelectorAll('.reveal:not(.active)');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('active');
            }
        });
    }

    // ===== TYPING EFFECT =====
    initTypingEffect() {
        const typingElement = document.querySelector('.typing-text');
        if (!typingElement) return;

        const texts = [
            'Cloud Technologies',
            'Intelligent Web Applications',
            'AI/ML Fundamentals', 
            'Clean UI And Intuitive UX',
            'Real-World Problem Solving',
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        const type = () => {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                setTimeout(() => isDeleting = true, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
            }

            setTimeout(type, typingSpeed);
        };

        type();
    }

    // ===== NAVIGATION =====
    initNavigation() {
        this.updateActiveNavLink();
    }

    handleNavClick(e) {
        // No longer needed for hash navigation; kept for future use
    }

    updateActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPath = window.location.pathname;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto')) return;

            const linkUrl = new URL(href, window.location.href);
            const linkPath = linkUrl.pathname;

            const isExact = linkPath === currentPath;
            const isDirectory = linkPath !== '/' && currentPath.startsWith(linkPath) && linkPath.endsWith('/');
            const isHome = (linkPath === '/' || linkPath === '/index.html') &&
                           (currentPath === '/' || currentPath === '/index.html');

            if (isExact || isDirectory || isHome) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ===== MOBILE MENU =====
    initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            // Set initial ARIA state
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            
            // Clean mobile navigation URLs (remove hashes and .html)
            this.cleanMobileNavUrls(mobileMenu);
            
            // Create overlay for mobile menu
            const overlay = document.createElement('div');
            overlay.className = 'mobile-menu-overlay';
            document.body.appendChild(overlay);
            
            const toggleMenu = (isOpen) => {
                mobileMenu.classList.toggle('active', isOpen);
                mobileMenuBtn.classList.toggle('active', isOpen);
                overlay.classList.toggle('active', isOpen);
                mobileMenuBtn.setAttribute('aria-expanded', isOpen);
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isOpen ? 'hidden' : '';
                
                // Focus management
                if (isOpen) {
                    const firstLink = mobileMenu.querySelector('a');
                    if (firstLink) {
                        setTimeout(() => firstLink.focus(), 100);
                    }
                } else {
                    mobileMenuBtn.focus();
                }
            };
            
            mobileMenuBtn.addEventListener('click', () => {
                const isExpanded = mobileMenu.classList.contains('active');
                toggleMenu(!isExpanded);
            });

            // Close mobile menu when clicking on a link
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Handle mobile navigation with clean URLs
                    this.handleMobileNavClick(e, link);
                    toggleMenu(false);
                });
            });

            // Close mobile menu when clicking overlay
            overlay.addEventListener('click', () => toggleMenu(false));

            // Close mobile menu on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                    toggleMenu(false);
                }
            });
        }
    }

    // ===== MOBILE URL CLEANING (removes hashes and .html for mobile navigation) =====
    cleanMobileNavUrls(mobileMenu) {
        // Only process on mobile viewport
        if (window.innerWidth > 768) return;
        
        const links = mobileMenu.querySelectorAll('a');
        links.forEach(link => {
            let href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
            
            // Clean the URL
            href = this.cleanUrl(href);
            link.setAttribute('href', href);
        });
    }

    cleanUrl(url) {
        // Remove hash-based navigation (e.g., #about -> /about or about/)
        if (url.startsWith('#') && url.length > 1) {
            const section = url.substring(1);
            // Convert hash to path (e.g., #about -> /about/)
            return '/' + section + '/';
        }
        
        // Remove .html extension
        if (url.includes('.html')) {
            url = url.replace(/\.html$/, '/').replace(/\.html#/, '/#').replace(/\.html\?/, '/?');
            // Ensure trailing slash for directory-style URLs
            if (!url.includes('?') && !url.includes('#') && !url.endsWith('/')) {
                url += '/';
            }
        }
        
        // Remove hash portion if it matches page sections (e.g., about/#section -> about/)
        // Keep functional hashes like #main-content
        const hashMatch = url.match(/#([a-z]+)$/i);
        if (hashMatch && ['about', 'contact', 'skills', 'projects', 'experience', 'certificates', 'home'].includes(hashMatch[1].toLowerCase())) {
            url = url.replace(/#[a-z]+$/i, '');
        }
        
        return url;
    }

    handleMobileNavClick(e, link) {
        // Only intercept on mobile
        if (window.innerWidth > 768) return;
        
        let href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel')) return;
        
        // Clean and navigate to the URL
        const cleanedUrl = this.cleanUrl(href);
        
        // If URL was modified, prevent default and navigate
        if (cleanedUrl !== href) {
            e.preventDefault();
            window.location.href = cleanedUrl;
        }
    }

    // ===== SMOOTH SCROLLING =====
    initSmoothScrolling() {
        // Already handled in CSS with scroll-behavior: smooth
        // This is a fallback for browsers that don't support it (skip link only)
        if (!CSS.supports('scroll-behavior', 'smooth')) {
            const skipLink = document.querySelector('a.skip-link[href^="#"]');
            if (skipLink) {
                skipLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = skipLink.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        this.smoothScrollTo(targetElement.offsetTop - 80, 800);
                    }
                });
            }
        }
    }

    smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // ===== LAZY LOADING =====
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    // ===== UTILITY FUNCTIONS =====
    handleResize() {
        // Handle any resize-specific logic
        this.updateActiveNavLink();
        
        // Re-clean mobile URLs when entering mobile viewport
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            this.cleanMobileNavUrls(mobileMenu);
        }
    }

    handleLoad() {
        // Handle page load
        document.body.classList.add('loaded');
        
        // Initialize any load-dependent features
        this.initParticles();
    }

    handleKeydown(e) {
        // Handle keyboard navigation
        if (e.key === 'Escape') {
            const mobileMenu = document.querySelector('.mobile-menu');
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.focus();
            }
        }
    }

    // ===== PARTICLE ANIMATION (Optional) =====
    initParticles() {
        // Simple particle animation for hero section
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(139, 92, 246, 0.3);
                border-radius: 50%;
                animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            particlesContainer.appendChild(particle);
        }

        hero.appendChild(particlesContainer);
    }

    // ===== CONTACT FORM HANDLING =====
    initContactForm() {
        const contactForm = document.querySelector('#contact-form');
        if (!contactForm) return;

        // Form is handled by Google Forms integration in contact page
        // This is a fallback for any other contact forms
        contactForm.addEventListener('submit', this.handleContactSubmit.bind(this));
    }

    handleContactSubmit(e) {
        // This is handled by the Google Forms integration
        // Just ensure proper loading states are applied
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.setAttribute('aria-busy', 'true');
            submitBtn.disabled = true;
        }
    }

    // ===== NOTIFICATION SYSTEM =====
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid var(--border-primary);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }

    // ===== PERFORMANCE OPTIMIZATION =====
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

}


// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// ===== UTILITY FUNCTIONS FOR EXTERNAL USE =====
window.PortfolioUtils = {
    // Smooth scroll to element
    scrollToElement: (selector, offset = 80) => {
        const element = document.querySelector(selector);
        if (element) {
            const targetPosition = element.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    },

    // Add reveal animation to elements
    addRevealAnimation: (selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.classList.add('reveal');
        });
    },

    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }
};
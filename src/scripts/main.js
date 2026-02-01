/**
 * The Joneses - Main JavaScript
 * UK Smiths Tribute Band Website
 */

// ============================================
// Navigation
// ============================================

/**
 * Initialize navigation scroll effect
 * Adds 'scrolled' class when page is scrolled past threshold
 */
export function initNavScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    const SCROLL_THRESHOLD = 100;

    const handleScroll = () => {
        if (window.scrollY > SCROLL_THRESHOLD) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
}

/**
 * Initialize mobile navigation toggle
 */
export function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!navToggle || !navLinks) return;

    const toggleNav = () => {
        const isOpen = navLinks.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', isOpen.toString());
        navToggle.querySelector('.nav-toggle-icon').innerHTML = isOpen ? '&#10005;' : '&#9776;';
    };

    const closeNav = () => {
        navLinks.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelector('.nav-toggle-icon').innerHTML = '&#9776;';
    };

    navToggle.addEventListener('click', toggleNav);

    // Close nav when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeNav);
    });

    // Close nav on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeNav();
            navToggle.focus();
        }
    });

    // Close nav when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
            closeNav();
        }
    });
}

// ============================================
// Hero Parallax & Quote Highlight
// ============================================

/**
 * Initialize hero parallax effect and quote highlight on scroll
 */
export function initHeroEffects() {
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroScroll = document.querySelector('.hero-scroll');
    const heroQuote = document.querySelector('.hero-quote');
    const heroQuoteBlockquote = document.querySelector('.hero-quote blockquote');

    if (!hero || !heroContent) return;

    // Setup quote words for highlight effect
    let quoteWords = [];
    if (heroQuoteBlockquote) {
        const text = heroQuoteBlockquote.textContent.trim();
        // Split into words and wrap each, with special handling for phrases
        const words = text.split(/\s+/);
        const wrappedWords = [];

        // Helper to check if a sequence of words matches a phrase (ignoring punctuation)
        const matchesPhrase = (startIndex, phrase) => {
            const phraseWords = phrase.split(' ');
            if (startIndex + phraseWords.length > words.length) return false;
            for (let j = 0; j < phraseWords.length; j++) {
                if (words[startIndex + j].replace(/[^a-zA-Z]/g, '').toLowerCase() !== phraseWords[j].toLowerCase()) {
                    return false;
                }
            }
            return true;
        };

        // Track which word indices are part of special phrases
        const dramaticIndices = new Set();
        const bandNameIndices = new Set();

        // Find "burn down a disco"
        for (let i = 0; i < words.length; i++) {
            if (matchesPhrase(i, 'burn down a disco')) {
                for (let j = 0; j < 4; j++) dramaticIndices.add(i + j);
            }
            if (matchesPhrase(i, 'assassinate the queen')) {
                for (let j = 0; j < 3; j++) dramaticIndices.add(i + j);
            }
            if (matchesPhrase(i, 'The Joneses')) {
                for (let j = 0; j < 2; j++) bandNameIndices.add(i + j);
            }
        }

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (bandNameIndices.has(i)) {
                wrappedWords.push(`<span class="quote-word quote-band-name" data-index="${i}">${word}</span>`);
            } else if (dramaticIndices.has(i)) {
                wrappedWords.push(`<span class="quote-word quote-dramatic" data-index="${i}">${word}</span>`);
            } else {
                wrappedWords.push(`<span class="quote-word" data-index="${i}">${word}</span>`);
            }
        }
        heroQuoteBlockquote.innerHTML = wrappedWords.join(' ');
        quoteWords = heroQuoteBlockquote.querySelectorAll('.quote-word');
    }

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;

        // Phase 1: Logo fades out (0 to 20% of hero height)
        const logoFadeEnd = heroHeight * 0.2;
        const logoFadeProgress = Math.min(scrollY / logoFadeEnd, 1);
        heroContent.style.opacity = 1 - logoFadeProgress;
        heroContent.style.transform = `translateY(${logoFadeProgress * -30}px)`;

        // Fade out scroll indicator
        if (heroScroll) {
            heroScroll.style.opacity = Math.max(0.7 - logoFadeProgress, 0);
        }

        // Timeline (percentages of hero height):
        // 15-25%: Quote fades in (with citation visible)
        // 25-55%: Words highlight progressively
        // 55-75%: Buffer - everything visible
        // 75-90%: Quote fades out
        // 90%+: Story section appears

        if (heroQuote) {
            const quoteFadeInStart = heroHeight * 0.15;
            const quoteFadeInEnd = heroHeight * 0.25;
            const highlightStart = heroHeight * 0.25;
            const highlightEnd = heroHeight * 0.55;
            const quoteFadeOutStart = heroHeight * 0.75;
            const quoteFadeOutEnd = heroHeight * 0.90;

            // Quote container fade in/out
            if (scrollY < quoteFadeInStart) {
                heroQuote.style.opacity = 0;
            } else if (scrollY < quoteFadeInEnd) {
                const progress = (scrollY - quoteFadeInStart) / (quoteFadeInEnd - quoteFadeInStart);
                heroQuote.style.opacity = progress;
            } else if (scrollY < quoteFadeOutStart) {
                heroQuote.style.opacity = 1;
            } else if (scrollY < quoteFadeOutEnd) {
                const progress = (scrollY - quoteFadeOutStart) / (quoteFadeOutEnd - quoteFadeOutStart);
                heroQuote.style.opacity = 1 - progress;
            } else {
                heroQuote.style.opacity = 0;
            }

            // Quote word highlighting
            if (quoteWords.length > 0) {
                if (scrollY < highlightStart) {
                    quoteWords.forEach(word => word.classList.remove('highlighted'));
                } else if (scrollY >= highlightEnd) {
                    quoteWords.forEach(word => word.classList.add('highlighted'));
                } else {
                    const progress = (scrollY - highlightStart) / (highlightEnd - highlightStart);
                    const wordsToHighlight = Math.floor(progress * quoteWords.length);
                    quoteWords.forEach((word, index) => {
                        if (index < wordsToHighlight) {
                            word.classList.add('highlighted');
                        } else {
                            word.classList.remove('highlighted');
                        }
                    });
                }
            }

        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
}

// ============================================
// Scroll Animations
// ============================================

/**
 * Initialize intersection observer for scroll-triggered animations
 */
export function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add animation classes to elements dynamically
    const animationConfig = [
        // Story section
        { selector: '.story-image', class: 'animate-from-left' },
        { selector: '.story-content', class: 'animate-from-right' },
        { selector: '.story-label', class: 'animate-on-scroll' },
        { selector: '.story-title', class: 'animate-on-scroll' },
        { selector: '.story-text', class: 'animate-on-scroll' },
        { selector: '.story-quote', class: 'animate-on-scroll' },

        // Section titles
        { selector: '.section-title', class: 'animate-on-scroll' },
        { selector: '.section-subtitle', class: 'animate-on-scroll' },

        // Band members
        { selector: '.band-member', class: 'animate-on-scroll animate-stagger' },

        // Gigs
        { selector: '.gig-item', class: 'animate-on-scroll animate-stagger' },

        // Testimonials
        { selector: '.testimonial', class: 'animate-on-scroll animate-stagger' },

        // Contact section
        { selector: '.contact-info', class: 'animate-from-left' },
        { selector: '.contact-form', class: 'animate-from-right' },

        // Footer
        { selector: '.footer-logo', class: 'animate-scale' },
        { selector: '.footer-links', class: 'animate-on-scroll' },
    ];

    // Apply animation classes and observe
    animationConfig.forEach(({ selector, class: className }) => {
        document.querySelectorAll(selector).forEach(el => {
            className.split(' ').forEach(cls => el.classList.add(cls));
            observer.observe(el);
        });
    });

    return observer;
}

// ============================================
// Form Validation & Handling
// ============================================

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - Whether email is valid
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone format (optional, allows empty)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone is valid or empty
 */
export function isValidPhone(phone) {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Show error message for a form field
 * @param {HTMLElement} input - Input element
 * @param {string} message - Error message to display
 */
export function showFieldError(input, message) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
    input.classList.add('error');
}

/**
 * Clear error message for a form field
 * @param {HTMLElement} input - Input element
 */
export function clearFieldError(input) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    if (errorSpan) {
        errorSpan.textContent = '';
    }
    input.classList.remove('error');
}

/**
 * Validate contact form
 * @param {HTMLFormElement} form - Form element to validate
 * @returns {boolean} - Whether form is valid
 */
export function validateForm(form) {
    let isValid = true;
    const formData = new FormData(form);

    // Clear all previous errors
    form.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Validate name
    const nameInput = form.querySelector('#name');
    const name = formData.get('name')?.trim();
    if (!name) {
        showFieldError(nameInput, 'Please enter your name');
        isValid = false;
    }

    // Validate email
    const emailInput = form.querySelector('#email');
    const email = formData.get('email')?.trim();
    if (!email) {
        showFieldError(emailInput, 'Please enter your email');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(emailInput, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate phone (optional but must be valid if provided)
    const phoneInput = form.querySelector('#phone');
    const phone = formData.get('phone')?.trim();
    if (phone && !isValidPhone(phone)) {
        showFieldError(phoneInput, 'Please enter a valid phone number');
        isValid = false;
    }

    // Validate message
    const messageInput = form.querySelector('#message');
    const message = formData.get('message')?.trim();
    if (!message) {
        showFieldError(messageInput, 'Please enter a message');
        isValid = false;
    }

    return isValid;
}

/**
 * Handle form submission
 * @param {Event} e - Submit event
 */
export function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');
    const formStatus = form.querySelector('#formStatus');

    if (!validateForm(form)) {
        return;
    }

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Simulate form submission (in production, this would be an API call)
    setTimeout(() => {
        // Show success message
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you for your message! We\'ll be in touch soon.';

        // Reset form
        form.reset();

        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';

        // Hide success message after 5 seconds
        setTimeout(() => {
            formStatus.className = 'form-status';
            formStatus.textContent = '';
        }, 5000);
    }, 1000);
}

/**
 * Initialize contact form
 */
export function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);

    // Clear errors on input
    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => clearFieldError(input));
    });
}

// ============================================
// Mailing List Form
// ============================================

/**
 * Initialize mailing list form
 */
export function initMailingListForm() {
    const form = document.getElementById('mailingListForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailInput = form.querySelector('#mailingEmail');
        const status = form.querySelector('#mailingStatus');
        const submitBtn = form.querySelector('.mailing-list-btn');
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
            status.textContent = 'Please enter a valid email address';
            status.className = 'mailing-list-status error';
            return;
        }

        // Disable button during submission
        submitBtn.disabled = true;
        submitBtn.textContent = 'Subscribing...';

        // Simulate form submission
        setTimeout(() => {
            status.textContent = 'Thanks for subscribing! We\'ll be in touch.';
            status.className = 'mailing-list-status success';
            emailInput.value = '';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Subscribe';

            // Clear success message after 5 seconds
            setTimeout(() => {
                status.textContent = '';
                status.className = 'mailing-list-status';
            }, 5000);
        }, 1000);
    });
}

// ============================================
// Smooth Scroll
// ============================================

/**
 * Initialize smooth scroll for anchor links
 */
export function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update URL without jumping
                history.pushState(null, '', targetId);
            }
        });
    });
}

// ============================================
// Initialization
// ============================================

/**
 * Initialize all functionality when DOM is ready
 */
export function init() {
    initNavScroll();
    initMobileNav();
    initHeroEffects();
    initScrollAnimations();
    initContactForm();
    initMailingListForm();
    initSmoothScroll();
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

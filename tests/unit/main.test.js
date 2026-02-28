import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    isValidEmail,
    isValidPhone,
    showFieldError,
    clearFieldError,
    validateForm,
    initNavScroll,
    initMobileNav,
    initScrollAnimations,
} from '../../src/scripts/main.js';

// ============================================
// Email Validation Tests
// ============================================
describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
        expect(isValidEmail('test@example.com')).toBe(true);
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        expect(isValidEmail('user+tag@example.org')).toBe(true);
        expect(isValidEmail('a@b.io')).toBe(true);
    });

    it('should return false for invalid email addresses', () => {
        expect(isValidEmail('')).toBe(false);
        expect(isValidEmail('notanemail')).toBe(false);
        expect(isValidEmail('missing@domain')).toBe(false);
        expect(isValidEmail('@nodomain.com')).toBe(false);
        expect(isValidEmail('spaces in@email.com')).toBe(false);
        expect(isValidEmail('two@@signs.com')).toBe(false);
    });
});

// ============================================
// Phone Validation Tests
// ============================================
describe('isValidPhone', () => {
    it('should return true for empty phone (optional field)', () => {
        expect(isValidPhone('')).toBe(true);
        expect(isValidPhone(null)).toBe(true);
        expect(isValidPhone(undefined)).toBe(true);
    });

    it('should return true for valid phone numbers', () => {
        expect(isValidPhone('07700900123')).toBe(true);
        expect(isValidPhone('+44 7700 900123')).toBe(true);
        expect(isValidPhone('020 7946 0958')).toBe(true);
        expect(isValidPhone('(020) 7946-0958')).toBe(true);
        expect(isValidPhone('+1-555-123-4567')).toBe(true);
    });

    it('should return false for invalid phone numbers', () => {
        expect(isValidPhone('123')).toBe(false); // Too short
        expect(isValidPhone('abc')).toBe(false); // Letters only
        expect(isValidPhone('12345678901234567890123')).toBe(false); // Too long
    });
});

// ============================================
// Form Field Error Tests
// ============================================
describe('showFieldError and clearFieldError', () => {
    let input;
    let errorSpan;
    let container;

    beforeEach(() => {
        container = document.createElement('div');
        input = document.createElement('input');
        errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        container.appendChild(input);
        container.appendChild(errorSpan);
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
    });

    it('should show error message and add error class', () => {
        showFieldError(input, 'This field is required');

        expect(errorSpan.textContent).toBe('This field is required');
        expect(input.classList.contains('error')).toBe(true);
    });

    it('should clear error message and remove error class', () => {
        showFieldError(input, 'Error');
        clearFieldError(input);

        expect(errorSpan.textContent).toBe('');
        expect(input.classList.contains('error')).toBe(false);
    });
});

// ============================================
// Form Validation Tests
// ============================================
describe('validateForm', () => {
    let form;

    beforeEach(() => {
        form = document.createElement('form');
        form.innerHTML = `
            <div class="form-group">
                <input type="text" id="name" name="name">
                <span class="error-message"></span>
            </div>
            <div class="form-group">
                <input type="email" id="email" name="email">
                <span class="error-message"></span>
            </div>
            <div class="form-group">
                <input type="tel" id="phone" name="phone">
                <span class="error-message"></span>
            </div>
            <div class="form-group">
                <textarea id="message" name="message"></textarea>
                <span class="error-message"></span>
            </div>
        `;
        document.body.appendChild(form);
    });

    afterEach(() => {
        document.body.removeChild(form);
    });

    it('should return false when name is empty', () => {
        form.querySelector('#email').value = 'test@example.com';
        form.querySelector('#message').value = 'Hello';

        expect(validateForm(form)).toBe(false);
        expect(form.querySelector('#name').classList.contains('error')).toBe(true);
    });

    it('should return false when email is empty', () => {
        form.querySelector('#name').value = 'John';
        form.querySelector('#message').value = 'Hello';

        expect(validateForm(form)).toBe(false);
        expect(form.querySelector('#email').classList.contains('error')).toBe(true);
    });

    it('should return false when email is invalid', () => {
        form.querySelector('#name').value = 'John';
        form.querySelector('#email').value = 'invalid-email';
        form.querySelector('#message').value = 'Hello';

        expect(validateForm(form)).toBe(false);
    });

    it('should return false when message is empty', () => {
        form.querySelector('#name').value = 'John';
        form.querySelector('#email').value = 'test@example.com';

        expect(validateForm(form)).toBe(false);
        expect(form.querySelector('#message').classList.contains('error')).toBe(true);
    });

    it('should return false when phone is invalid format', () => {
        form.querySelector('#name').value = 'John';
        form.querySelector('#email').value = 'test@example.com';
        form.querySelector('#phone').value = '12';
        form.querySelector('#message').value = 'Hello';

        expect(validateForm(form)).toBe(false);
    });

    it('should return true when all required fields are valid', () => {
        form.querySelector('#name').value = 'John Doe';
        form.querySelector('#email').value = 'john@example.com';
        form.querySelector('#message').value = 'I would like to book you for an event.';

        expect(validateForm(form)).toBe(true);
    });

    it('should return true when phone is empty (optional)', () => {
        form.querySelector('#name').value = 'John Doe';
        form.querySelector('#email').value = 'john@example.com';
        form.querySelector('#phone').value = '';
        form.querySelector('#message').value = 'Hello there';

        expect(validateForm(form)).toBe(true);
    });

    it('should return true when phone has valid format', () => {
        form.querySelector('#name').value = 'John Doe';
        form.querySelector('#email').value = 'john@example.com';
        form.querySelector('#phone').value = '+44 7700 900123';
        form.querySelector('#message').value = 'Hello there';

        expect(validateForm(form)).toBe(true);
    });
});

// ============================================
// Navigation Scroll Tests
// ============================================
describe('initNavScroll', () => {
    let navbar;

    beforeEach(() => {
        navbar = document.createElement('nav');
        navbar.id = 'navbar';
        document.body.appendChild(navbar);
    });

    afterEach(() => {
        document.body.removeChild(navbar);
    });

    it('should add scrolled class when scrollY > 100', () => {
        initNavScroll();

        // Mock scrollY
        Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
        window.dispatchEvent(new Event('scroll'));

        expect(navbar.classList.contains('scrolled')).toBe(true);
    });

    it('should not add scrolled class when scrollY <= 100', () => {
        initNavScroll();

        Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
        window.dispatchEvent(new Event('scroll'));

        expect(navbar.classList.contains('scrolled')).toBe(false);
    });

    it('should remove scrolled class when scrolling back up', () => {
        initNavScroll();

        // First scroll down
        Object.defineProperty(window, 'scrollY', { value: 150, writable: true });
        window.dispatchEvent(new Event('scroll'));
        expect(navbar.classList.contains('scrolled')).toBe(true);

        // Then scroll back up
        Object.defineProperty(window, 'scrollY', { value: 50, writable: true });
        window.dispatchEvent(new Event('scroll'));
        expect(navbar.classList.contains('scrolled')).toBe(false);
    });
});

// ============================================
// Mobile Navigation Tests
// ============================================
describe('initMobileNav', () => {
    let navToggle;
    let navLinks;

    beforeEach(() => {
        navToggle = document.createElement('button');
        navToggle.id = 'navToggle';
        navToggle.innerHTML = '<span class="nav-toggle-icon">&#9776;</span>';
        navToggle.setAttribute('aria-expanded', 'false');

        navLinks = document.createElement('ul');
        navLinks.id = 'navLinks';
        navLinks.innerHTML = `
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
        `;

        document.body.appendChild(navToggle);
        document.body.appendChild(navLinks);
    });

    afterEach(() => {
        document.body.removeChild(navToggle);
        document.body.removeChild(navLinks);
    });

    it('should toggle nav open on click', () => {
        initMobileNav();

        navToggle.click();

        expect(navLinks.classList.contains('active')).toBe(true);
        expect(navToggle.getAttribute('aria-expanded')).toBe('true');
    });

    it('should toggle nav closed on second click', () => {
        initMobileNav();

        navToggle.click();
        navToggle.click();

        expect(navLinks.classList.contains('active')).toBe(false);
        expect(navToggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close nav when link is clicked', () => {
        initMobileNav();

        navToggle.click();
        expect(navLinks.classList.contains('active')).toBe(true);

        navLinks.querySelector('a').click();
        expect(navLinks.classList.contains('active')).toBe(false);
    });

    it('should close nav on Escape key', () => {
        initMobileNav();

        navToggle.click();
        expect(navLinks.classList.contains('active')).toBe(true);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(navLinks.classList.contains('active')).toBe(false);
    });
});

// ============================================
// Scroll Animation Tests
// ============================================
describe('initScrollAnimations', () => {
    let mockObserve;
    let mockUnobserve;
    let mockDisconnect;

    beforeEach(() => {
        mockObserve = vi.fn();
        mockUnobserve = vi.fn();
        mockDisconnect = vi.fn();

        global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
            observe: mockObserve,
            unobserve: mockUnobserve,
            disconnect: mockDisconnect,
        }));
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should create IntersectionObserver with correct options', () => {
        initScrollAnimations();

        expect(IntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                threshold: 0.15,
                rootMargin: '0px 0px -80px 0px'
            })
        );
    });

    // gig-item observation is now handled dynamically by gigs.js

    it('should observe band-member elements', () => {
        const bandMember = document.createElement('div');
        bandMember.className = 'band-member';
        document.body.appendChild(bandMember);

        initScrollAnimations();

        expect(mockObserve).toHaveBeenCalledWith(bandMember);

        document.body.removeChild(bandMember);
    });

});

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
import {
    safeUrl,
    renderGigItem,
    generateGigStructuredData,
} from '../../build/gig-utils.js';
import { normalizeBandsintownEvent } from '../../build/bandsintown.js';

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

// ============================================
// Ticket URL Validation Tests
// ============================================
describe('safeUrl', () => {
    it('should allow http and https URLs', () => {
        expect(safeUrl('https://tickets.example.com/gig')).toBe('https://tickets.example.com/gig');
        expect(safeUrl('http://tickets.example.com')).toBe('http://tickets.example.com');
        expect(safeUrl('  HTTPS://tickets.example.com  ')).toBe('HTTPS://tickets.example.com');
    });

    it('should reject non-http(s) URLs and empty values', () => {
        expect(safeUrl('javascript:alert(1)')).toBe('');
        expect(safeUrl('  JaVaScRiPt:alert(1)')).toBe('');
        expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
        expect(safeUrl('')).toBe('');
        expect(safeUrl(undefined)).toBe('');
    });
});

describe('renderGigItem ticket links', () => {
    const gig = (ticketUrl) => ({
        'Date': '01/01/2099',
        'Venue': 'The Ritz',
        'Location': 'Manchester',
        'Ticket URL': ticketUrl,
    });

    it('should render a ticket link for a valid URL', () => {
        const html = renderGigItem(gig('https://tickets.example.com/gig'), false);

        expect(html).toContain('href="https://tickets.example.com/gig"');
        expect(html).toContain('Tickets');
    });

    it('should fall back to "Not yet on sale" for a javascript: URL', () => {
        const html = renderGigItem(gig('javascript:alert(1)'), false);

        expect(html).not.toContain('javascript:');
        expect(html).toContain('Not yet on sale');
    });
});

describe('generateGigStructuredData offers', () => {
    it('should omit offers when the ticket URL is unsafe', () => {
        const [event] = generateGigStructuredData([{
            'Date': '01/01/2099',
            'Venue': 'The Ritz',
            'Ticket URL': 'javascript:alert(1)',
        }]);

        expect(event.offers).toBeUndefined();
    });

    it('should include offers when the ticket URL is safe', () => {
        const [event] = generateGigStructuredData([{
            'Date': '01/01/2099',
            'Venue': 'The Ritz',
            'Ticket URL': 'https://tickets.example.com/gig',
        }]);

        expect(event.offers.url).toBe('https://tickets.example.com/gig');
    });
});

// ============================================
// Bandsintown Normalization Tests
// ============================================
describe('normalizeBandsintownEvent', () => {
    const baseEvent = (overrides = {}) => ({
        datetime: '2026-11-14T20:00:00',
        url: 'https://www.bandsintown.com/e/1004',
        venue: {
            name: 'Concorde 2',
            city: 'Brighton',
            region: 'East Sussex',
            country: 'United Kingdom',
        },
        offers: [{ type: 'Tickets', url: 'https://tickets.example.com/1004' }],
        ...overrides,
    });

    it('maps the shared gig shape from a Bandsintown event', () => {
        const gig = normalizeBandsintownEvent(baseEvent());

        expect(gig).toEqual({
            'Date': '14/11/2026',
            'Venue': 'Concorde 2',
            'Location': 'Brighton',
            'Ticket URL': 'https://tickets.example.com/1004',
        });
    });

    it('converts the venue-local datetime to dd/mm/yyyy without timezone shift', () => {
        const gig = normalizeBandsintownEvent(baseEvent({ datetime: '2026-01-05T23:30:00' }));
        expect(gig['Date']).toBe('05/01/2026');
    });

    it('uses only the city for UK venues', () => {
        const gig = normalizeBandsintownEvent(baseEvent({
            venue: { name: 'The 100 Club', city: 'London', region: 'Greater London', country: 'United Kingdom' },
        }));
        expect(gig['Location']).toBe('London');
    });

    it('treats other UK country spellings as UK too', () => {
        const gig = normalizeBandsintownEvent(baseEvent({
            venue: { name: 'King Tut\'s', city: 'Glasgow', region: 'Scotland', country: 'Scotland' },
        }));
        expect(gig['Location']).toBe('Glasgow');
    });

    it('appends region/country for non-UK venues', () => {
        const gig = normalizeBandsintownEvent(baseEvent({
            venue: { name: 'Paradiso', city: 'Amsterdam', region: 'Noord-Holland', country: 'Netherlands' },
        }));
        expect(gig['Location']).toBe('Amsterdam, Noord-Holland');
    });

    it('falls back to country when a non-UK venue has no region', () => {
        const gig = normalizeBandsintownEvent(baseEvent({
            venue: { name: 'Le Trabendo', city: 'Paris', region: '', country: 'France' },
        }));
        expect(gig['Location']).toBe('Paris, France');
    });

    it('falls back to the event url when there are no offers', () => {
        const gig = normalizeBandsintownEvent(baseEvent({ offers: [] }));
        expect(gig['Ticket URL']).toBe('https://www.bandsintown.com/e/1004');
    });

    it('falls back to the event url when offers is missing entirely', () => {
        const event = baseEvent();
        delete event.offers;
        const gig = normalizeBandsintownEvent(event);
        expect(gig['Ticket URL']).toBe('https://www.bandsintown.com/e/1004');
    });

    it('produces a gig that flows through generateGigStructuredData', () => {
        const gig = normalizeBandsintownEvent(baseEvent({ datetime: '2099-05-01T20:00:00' }));
        const [event] = generateGigStructuredData([gig]);

        expect(event['@type']).toBe('MusicEvent');
        expect(event.location.name).toBe('Concorde 2');
        expect(event.offers.url).toBe('https://tickets.example.com/1004');
    });
});

describe('generateGigStructuredData location', () => {
    it('should emit a PostalAddress when a location is given', () => {
        const [event] = generateGigStructuredData([{
            'Date': '01/01/2099',
            'Venue': 'The Ritz',
            'Location': 'Manchester',
        }]);

        expect(event.eventAttendanceMode).toBe('https://schema.org/OfflineEventAttendanceMode');
        expect(event.location.address).toEqual({
            '@type': 'PostalAddress',
            'addressLocality': 'Manchester',
            'addressCountry': 'GB',
        });
    });

    it('should omit the address when no location is given', () => {
        const [event] = generateGigStructuredData([{
            'Date': '01/01/2099',
            'Venue': 'The Ritz',
        }]);

        expect(event.location.address).toBeUndefined();
    });
});

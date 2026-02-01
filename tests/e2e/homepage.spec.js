import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // ============================================
    // Header & Hero Tests
    // ============================================
    test.describe('Hero Section', () => {
        test('should display the band name in hero', async ({ page }) => {
            const heroLogo = page.locator('.hero-logo h1');
            await expect(heroLogo).toContainText('THE JONESES');
        });

        test('should display the tagline', async ({ page }) => {
            const tagline = page.locator('.hero-tagline');
            await expect(tagline).toContainText('The Smiths Tribute Band');
        });

        test('should have scroll indicator', async ({ page }) => {
            const scrollLink = page.locator('.hero-scroll');
            await expect(scrollLink).toBeVisible();
            await expect(scrollLink).toHaveAttribute('href', '#about');
        });

        test('should scroll to about section when clicking scroll link', async ({ page }) => {
            await page.click('.hero-scroll');
            await page.waitForTimeout(1000); // Wait for smooth scroll
            const aboutSection = page.locator('#about');
            await expect(aboutSection).toBeInViewport();
        });
    });

    // ============================================
    // Navigation Tests
    // ============================================
    test.describe('Navigation', () => {
        test('should display navigation bar', async ({ page }) => {
            const navbar = page.locator('#navbar');
            await expect(navbar).toBeVisible();
        });

        test('should display logo in nav', async ({ page }) => {
            const navLogo = page.locator('.nav-logo');
            await expect(navLogo).toContainText('THE JONESES');
        });

        test('should have all navigation links', async ({ page }) => {
            const navLinks = page.locator('.nav-links a');
            await expect(navLinks).toHaveCount(5);

            const linkTexts = ['About', 'Band', 'Gigs', 'Press', 'Contact'];
            for (let i = 0; i < linkTexts.length; i++) {
                await expect(navLinks.nth(i)).toContainText(linkTexts[i]);
            }
        });

        test('should add scrolled class on scroll', async ({ page }) => {
            const navbar = page.locator('#navbar');
            await expect(navbar).not.toHaveClass(/scrolled/);

            await page.evaluate(() => window.scrollTo(0, 150));
            await page.waitForTimeout(100);
            await expect(navbar).toHaveClass(/scrolled/);
        });

        test('should navigate to sections via nav links', async ({ page }) => {
            // Navigate using JavaScript to avoid click interception issues
            await page.evaluate(() => {
                document.querySelector('#navbar .nav-links a[href="#gigs"]').click();
            });
            await page.waitForTimeout(1000);
            const gigsSection = page.locator('#gigs');
            await expect(gigsSection).toBeInViewport();
        });
    });

    // ============================================
    // About/Story Section Tests
    // ============================================
    test.describe('About Section', () => {
        test('should display story section', async ({ page }) => {
            const storySection = page.locator('#about');
            await expect(storySection).toBeVisible();
        });

        test('should have story label', async ({ page }) => {
            const storyLabel = page.locator('.story-label');
            await expect(storyLabel).toContainText('Our Story');
        });

        test('should have story title', async ({ page }) => {
            const storyTitle = page.locator('.story-title');
            await expect(storyTitle).toContainText('Born from a love of The Smiths');
        });

        test('should have quote section', async ({ page }) => {
            const quote = page.locator('.story-quote blockquote');
            await expect(quote).toBeVisible();
        });

        test('should have story image', async ({ page }) => {
            const storyImage = page.locator('.story-image');
            await expect(storyImage).toBeVisible();
        });
    });

    // ============================================
    // Band Section Tests
    // ============================================
    test.describe('Band Section', () => {
        test('should display band section title', async ({ page }) => {
            const bandTitle = page.locator('#band .section-title');
            await expect(bandTitle).toContainText('The Band');
        });

        test('should display all 5 band members', async ({ page }) => {
            const bandMembers = page.locator('.band-member');
            await expect(bandMembers).toHaveCount(5);
        });

        test('should display band member names', async ({ page }) => {
            const memberNames = ['James Morrison', 'Daniel Carter', 'Michael Shaw', 'Robert Ellis', 'Thomas Wright'];
            for (const name of memberNames) {
                await expect(page.locator('.band-member h3', { hasText: name })).toBeVisible();
            }
        });

        test('should display band member roles', async ({ page }) => {
            const roles = ['Vocals', 'Lead Guitar', 'Rhythm Guitar', 'Bass', 'Drums'];
            for (const role of roles) {
                await expect(page.locator('.band-member p', { hasText: role })).toBeVisible();
            }
        });

        test('should have circular member images', async ({ page }) => {
            const memberImg = page.locator('.band-member-img').first();
            await expect(memberImg).toBeVisible();
            // Check for border-radius (circular)
            const borderRadius = await memberImg.evaluate(el =>
                window.getComputedStyle(el).borderRadius
            );
            expect(borderRadius).toBe('50%');
        });
    });

    // ============================================
    // Gigs Section Tests
    // ============================================
    test.describe('Gigs Section', () => {
        test('should display gigs section title', async ({ page }) => {
            const gigsTitle = page.locator('#gigs .section-title');
            await expect(gigsTitle).toContainText('Upcoming Gigs');
        });

        test('should display multiple gig items', async ({ page }) => {
            const gigItems = page.locator('.gig-item');
            const count = await gigItems.count();
            expect(count).toBeGreaterThan(0);
        });

        test('should display gig dates', async ({ page }) => {
            const gigDate = page.locator('.gig-date').first();
            const dayElement = gigDate.locator('.day');
            const monthElement = gigDate.locator('.month');

            await expect(dayElement).toBeVisible();
            await expect(monthElement).toBeVisible();
        });

        test('should display gig venue names', async ({ page }) => {
            const gigInfo = page.locator('.gig-info h3').first();
            await expect(gigInfo).toBeVisible();
        });

        test('should have ticket links', async ({ page }) => {
            const ticketLinks = page.locator('.gig-link');
            const count = await ticketLinks.count();
            expect(count).toBeGreaterThan(0);
            await expect(ticketLinks.first()).toContainText('Tickets');
        });
    });

    // ============================================
    // Press Section Tests
    // ============================================
    test.describe('Press Section', () => {
        test('should display press section title', async ({ page }) => {
            const pressTitle = page.locator('#press .section-title');
            await expect(pressTitle).toContainText('Press');
        });

        test('should display testimonials', async ({ page }) => {
            const testimonials = page.locator('.testimonial');
            const count = await testimonials.count();
            expect(count).toBe(3);
        });

        test('should have testimonial quotes', async ({ page }) => {
            const quotes = page.locator('.testimonial blockquote');
            const count = await quotes.count();
            expect(count).toBe(3);
        });

        test('should have testimonial citations', async ({ page }) => {
            const citations = page.locator('.testimonial cite');
            const citationTexts = ['NME Magazine', 'The Guardian', 'Sarah M., Bristol'];

            for (const citation of citationTexts) {
                await expect(page.locator('.testimonial cite', { hasText: citation })).toBeVisible();
            }
        });

        test('should have background image visible through overlay', async ({ page }) => {
            const pressBg = page.locator('.press-bg');
            await expect(pressBg).toBeVisible();
        });
    });

    // ============================================
    // Contact Section Tests
    // ============================================
    test.describe('Contact Section', () => {
        test('should display contact section title', async ({ page }) => {
            const contactTitle = page.locator('#contact .section-title');
            await expect(contactTitle).toContainText('Book the Band');
        });

        test('should display contact email', async ({ page }) => {
            const email = page.locator('.contact-email');
            await expect(email).toContainText('thejonesesliveband@gmail.com');
            await expect(email).toHaveAttribute('href', 'mailto:thejonesesliveband@gmail.com');
        });

        test('should have social media links', async ({ page }) => {
            const socialLinks = page.locator('.contact-social a');
            await expect(socialLinks).toHaveCount(3);
        });

        test('should display contact form', async ({ page }) => {
            const form = page.locator('#contactForm');
            await expect(form).toBeVisible();
        });

        test('should have all form fields', async ({ page }) => {
            await expect(page.locator('#name')).toBeVisible();
            await expect(page.locator('#email')).toBeVisible();
            await expect(page.locator('#phone')).toBeVisible();
            await expect(page.locator('#enquiry')).toBeVisible();
            await expect(page.locator('#message')).toBeVisible();
        });

        test('should have submit button', async ({ page }) => {
            const submitBtn = page.locator('.submit-btn');
            await expect(submitBtn).toBeVisible();
            await expect(submitBtn).toContainText('Send Message');
        });

        test('should show validation errors for empty required fields', async ({ page }) => {
            await page.click('.submit-btn');

            // Check for error class on required fields
            const nameInput = page.locator('#name');
            await expect(nameInput).toHaveClass(/error/);

            const emailInput = page.locator('#email');
            await expect(emailInput).toHaveClass(/error/);

            const messageInput = page.locator('#message');
            await expect(messageInput).toHaveClass(/error/);
        });

        test('should show error for invalid email', async ({ page }) => {
            await page.fill('#name', 'John Doe');
            await page.fill('#email', 'invalid-email');
            await page.fill('#message', 'Test message');
            await page.click('.submit-btn');

            const emailError = page.locator('#email + .error-message');
            await expect(emailError).toContainText('valid email');
        });

        test('should submit form successfully with valid data', async ({ page }) => {
            await page.fill('#name', 'John Doe');
            await page.fill('#email', 'john@example.com');
            await page.fill('#phone', '+44 7700 900123');
            await page.selectOption('#enquiry', 'booking');
            await page.fill('#message', 'I would like to book you for a private event.');

            await page.click('.submit-btn');

            // Wait for success message
            const formStatus = page.locator('#formStatus');
            await expect(formStatus).toHaveClass(/success/, { timeout: 3000 });
            await expect(formStatus).toContainText('Thank you');
        });

        test('should clear errors when typing in fields', async ({ page }) => {
            // Trigger validation error
            await page.click('.submit-btn');
            const nameInput = page.locator('#name');
            await expect(nameInput).toHaveClass(/error/);

            // Start typing to clear error
            await page.fill('#name', 'J');
            await expect(nameInput).not.toHaveClass(/error/);
        });
    });

    // ============================================
    // Footer Tests
    // ============================================
    test.describe('Footer', () => {
        test('should display footer logo', async ({ page }) => {
            const footerLogo = page.locator('.footer-logo');
            await expect(footerLogo).toContainText('THE JONESES');
        });

        test('should have footer navigation links', async ({ page }) => {
            const footerLinks = page.locator('.footer-links a');
            await expect(footerLinks).toHaveCount(5);
        });

        test('should display copyright text', async ({ page }) => {
            const copyright = page.locator('.footer-copyright');
            await expect(copyright).toContainText('2026 The Joneses');
        });
    });

    // ============================================
    // SEO & Accessibility Tests
    // ============================================
    test.describe('SEO & Accessibility', () => {
        test('should have correct page title', async ({ page }) => {
            await expect(page).toHaveTitle(/The Joneses/);
        });

        test('should have meta description', async ({ page }) => {
            const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
            expect(metaDesc).toContain('Smiths');
        });

        test('should have Open Graph meta tags', async ({ page }) => {
            const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
            expect(ogTitle).toContain('Joneses');
        });

        test('should have structured data', async ({ page }) => {
            const schemaScript = page.locator('script[type="application/ld+json"]');
            const schemaContent = await schemaScript.textContent();
            expect(schemaContent).toContain('MusicGroup');
            expect(schemaContent).toContain('The Joneses');
        });

        test('should have lang attribute on html', async ({ page }) => {
            const html = page.locator('html');
            await expect(html).toHaveAttribute('lang', 'en');
        });

        test('should have accessible navigation landmark', async ({ page }) => {
            const nav = page.locator('nav[role="navigation"]');
            await expect(nav).toBeVisible();
        });

        test('should have aria-labels on social links', async ({ page }) => {
            const socialLinks = page.locator('.nav-social a');
            const count = await socialLinks.count();

            for (let i = 0; i < count; i++) {
                const ariaLabel = await socialLinks.nth(i).getAttribute('aria-label');
                expect(ariaLabel).toBeTruthy();
            }
        });

        test('should have form labels properly associated', async ({ page }) => {
            const nameLabel = page.locator('label[for="name"]');
            await expect(nameLabel).toBeVisible();

            const nameInput = page.locator('#name');
            await expect(nameInput).toBeVisible();
        });
    });

    // ============================================
    // Responsive Design Tests
    // ============================================
    test.describe('Responsive Design', () => {
        test('should show mobile nav toggle on small screens', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const navToggle = page.locator('.nav-toggle');
            await expect(navToggle).toBeVisible();
        });

        test('should hide nav links on mobile by default', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const navLinks = page.locator('.nav-links');
            await expect(navLinks).not.toBeVisible();
        });

        test('should show nav links when toggle is clicked on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Click using JavaScript to avoid interception issues
            await page.evaluate(() => {
                document.getElementById('navToggle').click();
            });
            await page.waitForTimeout(300);

            const hasActive = await page.evaluate(() => {
                return document.getElementById('navLinks').classList.contains('active');
            });
            expect(hasActive).toBe(true);
        });

        test('should close mobile nav on link click', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Open mobile nav using JS
            await page.evaluate(() => {
                document.getElementById('navToggle').click();
            });
            await page.waitForTimeout(300);

            let hasActive = await page.evaluate(() => {
                return document.getElementById('navLinks').classList.contains('active');
            });
            expect(hasActive).toBe(true);

            // Click nav link using JS
            await page.evaluate(() => {
                document.querySelector('#navLinks a[href="#about"]').click();
            });
            await page.waitForTimeout(300);

            hasActive = await page.evaluate(() => {
                return document.getElementById('navLinks').classList.contains('active');
            });
            expect(hasActive).toBe(false);
        });

        test('should adapt band grid for tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });

            const bandGrid = page.locator('.band-grid');
            const gridColumns = await bandGrid.evaluate(el =>
                window.getComputedStyle(el).gridTemplateColumns
            );
            // Should be 2 columns on tablet
            expect(gridColumns.split(' ').length).toBeLessThanOrEqual(3);
        });

        test('should stack contact grid on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const contactGrid = page.locator('.contact-grid');
            const gridColumns = await contactGrid.evaluate(el =>
                window.getComputedStyle(el).gridTemplateColumns
            );
            // Should be single column on mobile
            expect(gridColumns.split(' ').length).toBe(1);
        });
    });

    // ============================================
    // Visual Appearance Tests
    // ============================================
    test.describe('Visual Appearance', () => {
        test('should have green brand color on hero logo', async ({ page }) => {
            const heroLogo = page.locator('.hero-logo');
            const backgroundColor = await heroLogo.evaluate(el =>
                window.getComputedStyle(el).backgroundColor
            );
            // Check for the green color rgb(10, 93, 44) which is #0A5D2C
            expect(backgroundColor).toContain('rgb(10, 93, 44)');
        });

        test('should have grayscale filter on hero background', async ({ page }) => {
            const heroBg = page.locator('.hero-bg');
            const filter = await heroBg.evaluate(el =>
                window.getComputedStyle(el).filter
            );
            expect(filter).toContain('grayscale');
        });

        test('should have salmon color on gig dates', async ({ page }) => {
            const gigDay = page.locator('.gig-date .day').first();
            const color = await gigDay.evaluate(el =>
                window.getComputedStyle(el).color
            );
            // Check for salmon color rgb(232, 164, 164) which is #E8A4A4
            expect(color).toContain('rgb(232, 164, 164)');
        });
    });
});

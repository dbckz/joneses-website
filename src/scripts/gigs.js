/**
 * The Joneses - Gigs Module
 * Fetches gig data from a published Google Sheet CSV and renders it,
 * or hydrates pre-rendered content from the build plugin.
 */

import {
    SHEET_CSV_URL,
    parseCSV,
    sortAndRenderGigs,
} from '../../build/gig-utils.js';

function handlePastGigsToggleClick(pastGigsContainer, pastGigsToggle) {
    const isOpen = pastGigsContainer.classList.toggle('active');
    pastGigsToggle.textContent = isOpen ? 'Hide Past Gigs' : 'Past Gigs';
}

function hydratePastGigs(pastGigsContainer, pastGigsToggle) {
    pastGigsContainer.querySelectorAll('.past-gigs-year-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const list = btn.nextElementSibling;
            const isOpen = list.classList.toggle('active');
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', isOpen);
        });
    });

    // Replace rather than add listener to avoid duplicates on re-hydration
    pastGigsToggle.onclick = () => handlePastGigsToggleClick(pastGigsContainer, pastGigsToggle);
}

function observeGigItems() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.gig-item').forEach(el => {
        el.classList.add('animate-on-scroll', 'animate-stagger');
        observer.observe(el);
    });
}

function renderFreshGigs(gigsContainer, pastGigsContainer, pastGigsToggle, { upcomingHtml, pastHtml, hasPast }) {
    gigsContainer.innerHTML = upcomingHtml;

    if (hasPast && pastGigsContainer && pastGigsToggle) {
        pastGigsToggle.style.display = 'block';
        pastGigsContainer.innerHTML = pastHtml;
        hydratePastGigs(pastGigsContainer, pastGigsToggle);
    }

    observeGigItems();
}

export async function initGigs() {
    const gigsContainer = document.getElementById('gigsList');
    const pastGigsContainer = document.getElementById('pastGigsList');
    const pastGigsToggle = document.getElementById('pastGigsToggle');

    if (!gigsContainer) return;

    const isPrerendered = gigsContainer.dataset.prerendered === 'true';

    // If pre-rendered, hydrate interactivity immediately while keeping visible content
    if (isPrerendered) {
        if (pastGigsContainer && pastGigsToggle && pastGigsContainer.children.length > 0) {
            hydratePastGigs(pastGigsContainer, pastGigsToggle);
        }
        observeGigItems();
    }

    // Show loading state only when there is no pre-rendered content
    if (!isPrerendered) {
        gigsContainer.innerHTML = '<p class="gigs-message">Loading gigs...</p>';
    }

    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch');

        const csv = await response.text();
        const result = sortAndRenderGigs(parseCSV(csv));
        renderFreshGigs(gigsContainer, pastGigsContainer, pastGigsToggle, result);
    } catch {
        // If pre-rendered content is already showing, leave it in place
        if (!isPrerendered) {
            gigsContainer.innerHTML = '<p class="gigs-message">Check back soon for upcoming gigs.</p>';
        }
    }
}

/**
 * The Joneses - Gigs Module
 * Hydrates pre-rendered gig content from the build plugin, then (when
 * Bandsintown credentials are configured) refreshes it from the live
 * Bandsintown API so the listing stays current between builds.
 */

import { sortAndRenderGigs } from '../../build/gig-utils.js';
import { fetchBandsintownEvents } from '../../build/bandsintown.js';

// Injected at build time via Vite `define` (VITE_-prefixed). Undefined when no
// credentials are configured, in which case the pre-rendered content is kept.
const ARTIST_ID = import.meta.env.VITE_BANDSINTOWN_ARTIST_ID;
const APP_ID = import.meta.env.VITE_BANDSINTOWN_APP_ID;

const LOADING_MESSAGE = '<p class="gigs-message">Loading gigs...</p>';
const NO_GIGS_MESSAGE = '<p class="gigs-message">Check back soon for upcoming gigs.</p>';

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

    // Without credentials there is no live source to refresh from — keep the
    // pre-rendered content as-is (no fetch, no error state).
    if (!ARTIST_ID || !APP_ID) {
        if (!isPrerendered) gigsContainer.innerHTML = NO_GIGS_MESSAGE;
        return;
    }

    // Show loading state only when there is no pre-rendered content
    if (!isPrerendered) gigsContainer.innerHTML = LOADING_MESSAGE;

    try {
        const allGigs = await fetchBandsintownEvents({
            artistId: ARTIST_ID,
            appId: APP_ID,
            includePast: true,
        });
        const result = sortAndRenderGigs(allGigs);
        renderFreshGigs(gigsContainer, pastGigsContainer, pastGigsToggle, result);
    } catch {
        // If pre-rendered content is already showing, leave it in place
        if (!isPrerendered) gigsContainer.innerHTML = NO_GIGS_MESSAGE;
    }
}

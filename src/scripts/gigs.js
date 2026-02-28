/**
 * The Joneses - Gigs Module
 * Fetches gig data from a published Google Sheet CSV
 */

// Published Google Sheet CSV URL
// To set up: Create a Google Sheet with columns Date, Venue, Location, Ticket URL
// Then: File > Share > Publish to web > Select sheet > CSV > Publish
// Paste the URL below
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_oB0L7A_wxTEFgXJ43mSMWsjxMTekfnBU8H_IHVQxNGT0x84hZMI67jSRhUXT05KtdqxYpl-szZJH/pub?gid=0&single=true&output=csv';

/**
 * Parse CSV text into an array of objects
 * Handles quoted fields containing commas
 */
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = parseCsvLine(lines[0]).map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const row = {};
        headers.forEach((header, index) => {
            row[header] = (values[index] || '').trim();
        });
        rows.push(row);
    }

    return rows;
}

/**
 * Parse a single CSV line, respecting quoted fields
 */
function parseCsvLine(line) {
    const fields = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            fields.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    fields.push(current);
    return fields;
}

/**
 * Parse a DD-MM-YYYY date string into a Date object
 */
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
}

/**
 * Convert DD/MM/YYYY to a sortable YYYY-MM-DD string
 */
function toSortable(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

/**
 * Format a DD-MM-YYYY date string into day and month parts for display
 */
function formatGigDate(dateStr) {
    const date = parseDate(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    return { day, month };
}

/**
 * Check if a date is in the past (before today)
 */
function isPastGig(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parseDate(dateStr) < today;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Render a single gig item as HTML
 */
function renderGigItem(gig, isPast) {
    const { day, month } = formatGigDate(gig['Date']);
    const venue = escapeHtml(gig['Venue'] || '');
    const location = escapeHtml(gig['Location'] || '');
    const ticketUrl = gig['Ticket URL'] || '';

    let linkHtml;
    if (isPast) {
        linkHtml = '<span class="gig-link gig-link-past">Past</span>';
    } else if (ticketUrl) {
        linkHtml = `<a href="${escapeHtml(ticketUrl)}" class="gig-link" target="_blank" rel="noopener">Tickets</a>`;
    } else {
        linkHtml = '<span class="gig-link gig-link-unavailable">Not yet on sale</span>';
    }

    return `<article class="gig-item">
    <div class="gig-date">
        <span class="day">${day}</span>
        <span class="month">${month}</span>
    </div>
    <div class="gig-info">
        <h3>${venue}</h3>
        <p>${location}</p>
    </div>
    ${linkHtml}
</article>`;
}

/**
 * Fetch and render gigs from Google Sheet
 */
export async function initGigs() {
    const gigsContainer = document.getElementById('gigsList');
    const pastGigsContainer = document.getElementById('pastGigsList');
    const pastGigsToggle = document.getElementById('pastGigsToggle');

    if (!gigsContainer) return;

    if (!SHEET_CSV_URL) {
        gigsContainer.innerHTML = '<p class="gigs-message">Check back soon for upcoming gigs.</p>';
        return;
    }

    gigsContainer.innerHTML = '<p class="gigs-message">Loading gigs...</p>';

    try {
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch');

        const csv = await response.text();
        const allGigs = parseCSV(csv).filter(g => g['Date'] && g['Venue']);

        const upcoming = allGigs
            .filter(g => !isPastGig(g['Date']))
            .sort((a, b) => toSortable(a['Date']).localeCompare(toSortable(b['Date'])));

        const past = allGigs
            .filter(g => isPastGig(g['Date']))
            .sort((a, b) => toSortable(b['Date']).localeCompare(toSortable(a['Date'])));

        if (upcoming.length > 0) {
            gigsContainer.innerHTML = upcoming.map(g => renderGigItem(g, false)).join('');
        } else {
            gigsContainer.innerHTML = '<p class="gigs-message">No upcoming gigs — check back soon!</p>';
        }

        if (past.length > 0 && pastGigsContainer && pastGigsToggle) {
            pastGigsToggle.style.display = 'block';
            pastGigsContainer.innerHTML = past.map(g => renderGigItem(g, true)).join('');

            pastGigsToggle.addEventListener('click', () => {
                const isOpen = pastGigsContainer.classList.toggle('active');
                pastGigsToggle.textContent = isOpen ? 'Hide Past Gigs' : 'Past Gigs';
            });
        }

        // Re-observe new gig items for scroll animations
        observeGigItems();

    } catch {
        gigsContainer.innerHTML = '<p class="gigs-message">Check back soon for upcoming gigs.</p>';
    }
}

/**
 * Observe dynamically rendered gig items for scroll animations
 */
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

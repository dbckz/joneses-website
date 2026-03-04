/**
 * Shared gig utilities used by both the Vite pre-render plugin (Node)
 * and the client-side hydration/rendering (browser).
 *
 * All functions here must be environment-agnostic (no DOM APIs).
 */

export const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS_oB0L7A_wxTEFgXJ43mSMWsjxMTekfnBU8H_IHVQxNGT0x84hZMI67jSRhUXT05KtdqxYpl-szZJH/pub?gid=0&single=true&output=csv';

export function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

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

export function parseCSV(text) {
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

export function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00`);
}

function toSortable(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
}

function formatGigDate(dateStr) {
    const date = parseDate(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    return { day, month };
}

export function isPastGig(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parseDate(dateStr) < today;
}

export function renderGigItem(gig, isPast) {
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

export function renderPastGigs(past) {
    const currentYear = new Date().getFullYear();
    const byYear = {};
    past.forEach(g => {
        const year = parseDate(g['Date']).getFullYear();
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(g);
    });

    const years = Object.keys(byYear).sort((a, b) => b - a);
    return years.map(year => {
        const isCurrentYear = parseInt(year) === currentYear;
        return `<div class="past-gigs-year">
                    <button class="past-gigs-year-toggle${isCurrentYear ? ' active' : ''}" aria-expanded="${isCurrentYear}">
                        <span class="past-gigs-year-arrow">&#9656;</span>
                        <span>${year}</span>
                    </button>
                    <div class="past-gigs-year-list${isCurrentYear ? ' active' : ''}">
                        ${byYear[year].map(g => renderGigItem(g, true)).join('')}
                    </div>
                </div>`;
    }).join('');
}

/**
 * Generate JSON-LD MusicEvent structured data for upcoming gigs.
 */
export function generateGigStructuredData(allGigs) {
    const valid = allGigs.filter(g => g['Date'] && g['Venue']);
    const upcoming = valid.filter(g => !isPastGig(g['Date']));

    return upcoming.map(gig => {
        const date = parseDate(gig['Date']);
        const isoDate = date.toISOString().split('T')[0];

        const event = {
            '@context': 'https://schema.org',
            '@type': 'MusicEvent',
            'name': `The Joneses live at ${gig['Venue']}`,
            'startDate': isoDate,
            'performer': {
                '@type': 'MusicGroup',
                'name': 'The Joneses',
            },
            'location': {
                '@type': 'Place',
                'name': gig['Venue'],
                'address': gig['Location'] || undefined,
            },
        };

        if (gig['Ticket URL']) {
            event.offers = {
                '@type': 'Offer',
                'url': gig['Ticket URL'],
                'availability': 'https://schema.org/InStock',
            };
        }

        return event;
    });
}

/**
 * Sort and split gigs into upcoming and past, returning rendered HTML for each.
 */
export function sortAndRenderGigs(allGigs) {
    const valid = allGigs.filter(g => g['Date'] && g['Venue']);

    const upcoming = valid
        .filter(g => !isPastGig(g['Date']))
        .sort((a, b) => toSortable(a['Date']).localeCompare(toSortable(b['Date'])));

    const past = valid
        .filter(g => isPastGig(g['Date']))
        .sort((a, b) => toSortable(b['Date']).localeCompare(toSortable(a['Date'])));

    const upcomingHtml = upcoming.length > 0
        ? upcoming.map(g => renderGigItem(g, false)).join('')
        : '<p class="gigs-message">No upcoming gigs — check back soon!</p>';

    const pastHtml = past.length > 0 ? renderPastGigs(past) : '';

    return { upcomingHtml, pastHtml, hasPast: past.length > 0 };
}

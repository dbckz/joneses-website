/**
 * Shared gig utilities used by both the Vite pre-render plugin (Node)
 * and the client-side hydration/rendering (browser).
 *
 * All functions here must be environment-agnostic (no DOM APIs).
 */

export function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/**
 * Only http(s) URLs are safe to render as links or emit in structured data.
 * Anything else (javascript:, data:, etc.) is rejected.
 */
export function safeUrl(url) {
    const trimmed = (url || '').trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : '';
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
    const ticketUrl = safeUrl(gig['Ticket URL']);

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
        // Reformat the date string directly: parseDate gives local midnight,
        // and toISOString would shift BST dates back a day.
        const isoDate = toSortable(gig['Date']);

        const event = {
            '@context': 'https://schema.org',
            '@type': 'MusicEvent',
            'name': `The Joneses live at ${gig['Venue']}`,
            'description': `The Joneses — the UK's best Smiths tribute band — performing live at ${gig['Venue']}${gig['Location'] ? `, ${gig['Location']}` : ''}.`,
            'startDate': isoDate,
            'endDate': isoDate,
            'eventStatus': 'https://schema.org/EventScheduled',
            'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
            'image': 'https://www.thejonesesband.co.uk/og-image.jpg',
            'performer': {
                '@type': 'MusicGroup',
                'name': 'The Joneses',
            },
            'organizer': {
                '@type': 'MusicGroup',
                'name': 'The Joneses',
                'url': 'https://www.thejonesesband.co.uk',
            },
            'location': {
                '@type': 'Place',
                'name': gig['Venue'],
                'address': gig['Location']
                    ? {
                        '@type': 'PostalAddress',
                        'addressLocality': gig['Location'],
                        'addressCountry': 'GB',
                    }
                    : undefined,
            },
        };

        const ticketUrl = safeUrl(gig['Ticket URL']);
        if (ticketUrl) {
            event.offers = {
                '@type': 'Offer',
                'url': ticketUrl,
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

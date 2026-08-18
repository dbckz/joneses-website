/**
 * Bandsintown public API client + normalization.
 *
 * Used by both the Vite pre-render plugin (Node) and the client-side
 * hydration/refresh (browser), so this module must be environment-agnostic:
 * it relies only on the platform `fetch` and no Node-only APIs.
 *
 * Events are normalized into the same gig object shape produced elsewhere
 * (keys: 'Date' dd/mm/yyyy, 'Venue', 'Location', 'Ticket URL') so that
 * sortAndRenderGigs / generateGigStructuredData work unchanged.
 */

// Country values that count as "the UK" — when a venue is in the UK we show
// just the city; otherwise we append the region/country for disambiguation.
const UK_COUNTRIES = new Set([
    'united kingdom',
    'uk',
    'gb',
    'gbr',
    'great britain',
    'england',
    'scotland',
    'wales',
    'northern ireland',
]);

function isUkCountry(country) {
    return UK_COUNTRIES.has(String(country || '').trim().toLowerCase());
}

/**
 * Convert a Bandsintown ISO datetime (venue-local, e.g. "2026-11-14T20:00:00")
 * into the dd/mm/yyyy string the gig utilities expect. The date part is read
 * directly from the string to avoid timezone shifts.
 */
function toGigDate(datetime) {
    const datePart = String(datetime || '').split('T')[0];
    const [year, month, day] = datePart.split('-');
    if (!year || !month || !day) return '';
    return `${day}/${month}/${year}`;
}

/**
 * Normalize a single Bandsintown event object into the shared gig shape.
 */
export function normalizeBandsintownEvent(event) {
    const venue = event.venue || {};
    const city = (venue.city || '').trim();

    let location = city;
    if (!isUkCountry(venue.country)) {
        const extra = (venue.region || venue.country || '').trim();
        if (extra) location = city ? `${city}, ${extra}` : extra;
    }

    const offers = Array.isArray(event.offers) ? event.offers : [];
    const ticketUrl = offers.find(o => o && o.url)?.url || event.url || '';

    return {
        'Date': toGigDate(event.datetime),
        'Venue': (venue.name || '').trim(),
        'Location': location,
        'Ticket URL': ticketUrl,
    };
}

/**
 * Fetch events for an artist from the Bandsintown public API and return them
 * normalized into the shared gig shape.
 *
 * @param {object} opts
 * @param {string} opts.artistId    Bandsintown numeric artist id
 * @param {string} opts.appId       Bandsintown app_id
 * @param {boolean} [opts.includePast=true]  include past dates (date=all vs date=upcoming)
 * @returns {Promise<Array<object>>}
 */
export async function fetchBandsintownEvents({ artistId, appId, includePast = true }) {
    const date = includePast ? 'all' : 'upcoming';
    const url = `https://rest.bandsintown.com/artists/id_${encodeURIComponent(artistId)}` +
        `/events?app_id=${encodeURIComponent(appId)}&date=${date}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Bandsintown API request failed: ${response.status}`);
    }

    const events = await response.json();
    if (!Array.isArray(events)) return [];

    return events.map(normalizeBandsintownEvent);
}

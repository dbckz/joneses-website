/**
 * Vite plugin to pre-render gig data from the Bandsintown public API at build
 * time. Injects static HTML (and MusicEvent JSON-LD) into the gig pages so
 * search engines can index gig content without executing JavaScript.
 *
 * When no Bandsintown credentials are configured, sample fixture data is used
 * instead so local previews still show a representative layout.
 */

import { readFileSync } from 'fs';
import { fetchBandsintownEvents, normalizeBandsintownEvent } from './bandsintown.js';
import { sortAndRenderGigs, generateGigStructuredData } from './gig-utils.js';

const FIXTURE_URL = new URL('fixtures/bandsintown-events.json', import.meta.url);

function loadFixtureGigs() {
    const events = JSON.parse(readFileSync(FIXTURE_URL, 'utf-8'));
    return events.map(normalizeBandsintownEvent);
}

async function fetchGigData({ artistId, appId }) {
    let allGigs;
    if (artistId && appId) {
        allGigs = await fetchBandsintownEvents({ artistId, appId, includePast: true });
    } else {
        console.warn('[bandsintown] no credentials — using fixture data');
        allGigs = loadFixtureGigs();
    }

    return {
        ...sortAndRenderGigs(allGigs),
        events: generateGigStructuredData(allGigs),
    };
}

export default function prerenderGigs({ artistId, appId } = {}) {
    // Cache the fetch across HTML entry points (index.html, upcoming-gigs/index.html)
    // so the API is only hit once per build, not once per page.
    let gigDataPromise;

    return {
        name: 'prerender-gigs',
        async transformIndexHtml(html, ctx) {
            // Only pages that render the gigs list (homepage, upcoming-gigs page) need this.
            if (!html.includes('id="gigsList"')) return html;

            // Point the follow button at the real artist when configured; in
            // fixture mode it stays a visible-but-inert placeholder ("#").
            if (artistId) {
                html = html.replace(
                    'id="bandsintownFollow" href="#"',
                    `id="bandsintownFollow" href="https://www.bandsintown.com/a/${artistId}"`
                );
            }

            try {
                if (!gigDataPromise) gigDataPromise = fetchGigData({ artistId, appId });
                const { upcomingHtml, pastHtml, hasPast, events } = await gigDataPromise;

                html = html.replace(
                    '<p class="gigs-message">Loading gigs...</p>',
                    upcomingHtml
                );

                if (hasPast) {
                    html = html.replace(
                        'id="pastGigsToggle" style="display: none"',
                        'id="pastGigsToggle"'
                    );
                    html = html.replace(
                        'id="pastGigsList"></div>',
                        `id="pastGigsList">${pastHtml}</div>`
                    );
                }

                html = html.replace(
                    'id="gigsList"',
                    'id="gigsList" data-prerendered="true"'
                );

                // Inject MusicEvent structured data for upcoming gigs
                if (events.length > 0) {
                    // Escape `<` as < so event content can't break out of the script tag
                    const json = JSON.stringify(events, null, 4).replace(/</g, '\\u003c');
                    const jsonLd = `<script type="application/ld+json">\n    ${json.split('\n').join('\n    ')}\n    </script>`;
                    html = html.replace('</head>', `${jsonLd}\n</head>`);
                }

                const status = upcomingHtml.includes('gig-item') ? 'gigs' : 'no-gigs message';
                console.log(`[prerender-gigs] Pre-rendered ${status} (${events.length} events) into ${ctx.path}`);
                return html;
            } catch (error) {
                console.warn(`[prerender-gigs] Failed to pre-render ${ctx.path}: ${error.message}`);
                console.warn('[prerender-gigs] Falling back to client-side rendering');
                return html;
            }
        },
    };
}

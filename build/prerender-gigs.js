/**
 * Vite plugin to pre-render gig data from Google Sheets at build time.
 * Injects static HTML into index.html so search engines can index gig content
 * without needing to execute JavaScript.
 */

import { SHEET_CSV_URL, parseCSV, sortAndRenderGigs, generateGigStructuredData } from './gig-utils.js';

async function fetchGigData() {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch gigs: ${response.status}`);

    const csv = await response.text();
    const allGigs = parseCSV(csv);
    return {
        ...sortAndRenderGigs(allGigs),
        events: generateGigStructuredData(allGigs),
    };
}

export default function prerenderGigs() {
    // Cache the fetch across HTML entry points (index.html, upcoming-gigs/index.html)
    // so the sheet is only fetched once per build, not once per page.
    let gigDataPromise;

    return {
        name: 'prerender-gigs',
        async transformIndexHtml(html, ctx) {
            // Only pages that render the gigs list (homepage, upcoming-gigs page) need this.
            if (!html.includes('id="gigsList"')) return html;

            try {
                if (!gigDataPromise) gigDataPromise = fetchGigData();
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
                    // Escape `<` as < so sheet content can't break out of the script tag
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

/**
 * Vite plugin to pre-render gig data from Google Sheets at build time.
 * Injects static HTML into index.html so search engines can index gig content
 * without needing to execute JavaScript.
 */

import { SHEET_CSV_URL, parseCSV, sortAndRenderGigs } from './gig-utils.js';

async function fetchAndRenderGigs() {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error(`Failed to fetch gigs: ${response.status}`);

    const csv = await response.text();
    return sortAndRenderGigs(parseCSV(csv));
}

export default function prerenderGigs() {
    return {
        name: 'prerender-gigs',
        async transformIndexHtml(html) {
            try {
                const { upcomingHtml, pastHtml, hasPast } = await fetchAndRenderGigs();

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

                const status = upcomingHtml.includes('gig-item') ? 'gigs' : 'no-gigs message';
                console.log(`[prerender-gigs] Pre-rendered ${status} successfully`);
                return html;
            } catch (error) {
                console.warn(`[prerender-gigs] Failed to pre-render: ${error.message}`);
                console.warn('[prerender-gigs] Falling back to client-side rendering');
                return html;
            }
        },
    };
}

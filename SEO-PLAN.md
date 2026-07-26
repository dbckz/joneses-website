# SEO Plan — ranking for generic "Smiths tribute band" searches

**Goal:** appear prominently (first page, and in Google AI Overviews) for generic
queries like "smiths tribute band", "smiths tribute act", "book a smiths tribute
band" — not just branded searches for "The Joneses".

**Diagnosis (July 2026):** branded search already performs well. Generic queries
are won on *authority*, not on-page markup. Competitors (The Smyths, These
Smiths, The Smiths Ltd) dominate because the wider web talks about them — press,
listings, reviews, roundup articles. Google's AI Overview cites facts it can
corroborate across many independent sites. The fix is a campaign of off-site
work plus supporting on-site content, sustained over months.

**Already done (July 2026):** meta/OG tags, MusicGroup + FAQPage + MusicEvent
structured data with `sameAs` and `PostalAddress`, canonical tag, `llms.txt`,
pre-rendered gig data, crawlable band photos, sitemap, workflow keepalive so
the daily rebuild can't silently die.

---

## Off-site (highest impact — this is where the battle is won)

### 1. Gig listing aggregators — do first
Get every gig onto:
- [ ] Bandsintown
- [ ] Songkick
- [ ] Ents24
- [ ] Skiddle

Each gig becomes a page on a high-authority domain saying "The Joneses — Smiths
tribute band" with a link back. Venues often syndicate from these. ~20 gigs a
year = 80+ authority pages a year. Add each new gig to these at the same time
as the Google Sheet.

### 2. Google Business Profile
- [ ] Create/claim a Business Profile for The Joneses
- [ ] Ask happy bookers and fans to leave reviews (count + recency matter)

UK searches for "smiths tribute band" get local-flavoured results; a profile
with reviews puts the band in the map pack and gives Google a verified entity.

### 3. Entity records
- [ ] Register the band on MusicBrainz (with site + social links)
- [ ] Create a Wikidata item

Free and self-serve. These are the databases AI systems use to decide whether
a band is a real, notable entity.

### 4. Get into roundup articles and directories
The AI Overview synthesises from "top Smiths tribute acts" listicles. Find the
pages ranking for target queries and pitch for inclusion:
- [ ] Entertainment agencies/directories: Alive Network, Encore, Last Minute
      Musicians, Warble Entertainment
- [ ] Tribute band directories
- [ ] Blogs/articles listing Smiths tribute acts (search the target queries,
      contact each author/site)

This is the most direct route into the AI Overview itself.

### 5. Press and citable facts
Competitors have quotable third-party claims ("endorsed by Stephen Street").
Build equivalents:
- [ ] Pitch local press to cover gigs
- [ ] Seek interviews on indie/Smiths fan sites and podcasts
- [ ] Make sure festival lineup announcements name the band
- The Morrissey Rolling Stone quote ("...I would definitely form a group —
  called The Joneses") is strong pitch material.

### 6. Band-owned YouTube channel
The site currently links a personal channel (`@aidansheridan4579`), which
Google can't connect to the band entity.
- [ ] Create "The Joneses — Smiths Tribute" channel
- [ ] Upload live footage with descriptive titles/descriptions and a site link
- [ ] Update the site's YouTube links and `sameAs` schema to the new channel

---

## On-site (supporting work in this repo)

### 7. Dedicated landing pages
`/book-the-joneses/` and `/upcoming-gigs/` are currently meta-refresh redirects
that rank for nothing. Replace with real pages:
- [ ] Booking page targeting "book a Smiths tribute band" (what's included,
      coverage area, enquiry form)
- [ ] Gigs page with the pre-rendered listing and MusicEvent markup
- [ ] Location-flavoured content ("Smiths tribute band London / Kent / Essex…")
- [ ] Add new pages to sitemap.xml

The homepage can't rank for the brand *and* every generic term at once.

### 8. Testimonials and press quotes with Review schema
The FAQ claims "widely regarded as one of the best" with nothing backing it.
- [ ] Collect quotes from venues, bookers, and fans (needed from the band)
- [ ] Add a visible testimonials section with Review/quote markup
- [ ] Add visible FAQ section matching the existing FAQPage JSON-LD (the
      markup currently has no visible on-page counterpart, so Google may
      ignore it)

### 9. Content depth
The whole site is ~500 words. Add:
- [ ] Setlist / "songs we play" section
- [ ] Embedded YouTube videos with descriptive text
- [ ] "Areas we cover" paragraph in prose (not just schema)

---

## Expectations
Movement on a competitive generic query takes months; authority accrues slowly
(The Smyths have a 20-year head start). Sequence: aggregators + Business
Profile + entity records first (self-serve, fast), then directory/roundup
outreach, with on-site pages built in parallel. Review progress quarterly via
Google Search Console impressions for the generic queries.



The above is all written by Ai, this is written by Dave. Like you need online reputation and people talking about you and all this kind of stuff. Could I orchestrate that? So like post things in reputable places and all this kind of stuff.

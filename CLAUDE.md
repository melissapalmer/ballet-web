# CLAUDE.md — Project rules for The Enchanted World of Oz site

A small static **logistics hub for the dance moms** preparing for Dandelion Studio of Dance's 2026 showcase (Saturday 16 May 2026). Hosted on GitHub Pages. This file captures rules that should be respected without being asked. Add to it whenever the user gives feedback that should stick across sessions.

> **Audience pivot (Apr 2026):** the site started as a public-facing show-promotion page (poster, synopsis, Buy Tickets CTA) and was deliberately re-scoped to be mom-facing only — schedule, volunteer signups, orders, contact. The studio's existing Playhouse / Webtickets pages handle public ticket sales. Don't reintroduce ticket CTAs or the synopsis tab without checking.

## Stack rules — non-negotiable

- **Plain HTML/CSS/JS only.** No frameworks, no bundlers, no npm. Three core files: `index.html`, `styles.css`, `app.js`.
- **No build step.** Files served directly by GitHub Pages.
- **No external runtime dependencies** beyond Google Fonts (Cormorant Garamond + Inter). Don't add icon libraries, UI kits, analytics, etc. unless asked.

## Design rules

- **Palette is locked: emerald + gold on cream.** Tokens live in `styles.css` as CSS variables. Don't introduce a new accent without asking.
  - `--bg: #faf6ec` (cream)  ·  `--accent: #1f8a4c` (emerald)  ·  `--gold: #c9a227`
- **Typography**: Cormorant Garamond (serif, italic for titles) for headings + the show name; Inter for body. The italic serif is the "ballet" voice — keep it for show name, countdown, quote, h2/h3.
- **Mobile-first, always.** Test 360px / 390px / 768px after any UI change.
- **Tap targets ≥ 44×44px.**
- **Use `clamp()` for type and padding.**
- **Use `100dvh`/`100dvw`** (not `vh`/`vw`) for full-screen overlays.
- **Layout is tab-based** — no scroll-to-anchor sections. Tabs are Home, Schedule, Info, Volunteers, Orders, Contact, Studio.
- **Hero is compact** — logo on the left, "Dance moms hub" + show title + tagline on the right. The hero stays consistent across tabs.

## Content rules

- **Site is mom-facing only.** Don't add public Buy Tickets CTAs, ticket prices, the show synopsis, or the show poster to any tab. The studio handles public promotion via Playhouse Company / Webtickets.
- **Show date is the source of truth.** Saturday 16 May 2026, two performances 12:00 and 15:00 at the Playhouse Drama Theatre, Durban. Show day arrival 09:30 stage door, collection ~17:30. The countdown in `app.js` aims at the 12:00 show (`SHOW_DATETIME`). Update both `index.html` and `app.js` if dates shift.
- **Rehearsals**: Fri 1 May (08:45–13:00 OLF school hall), Sat 9 May (08:45–13:30 OLF school hall), Fri 15 May (stage rehearsal at the Playhouse, sign in 13:00). 1 May and 9 May are at the school hall — only 15 May is on stage. Don't relabel 9 May as the "dress rehearsal"; the on-stage run is 15 May.
- **Backstage rule** (show day): only moms on the volunteer roster are allowed backstage. This warning lives in the Schedule and Volunteers tabs in `.backstage-note` blocks — keep both copies in sync if rewording.
- **All forms are closed.** Shirt, volunteer, and name-spelling forms have all closed. The site is now read-only for these — don't re-add submission buttons. Order shirts: closed (live list shows who's on / paid). Volunteers: closed (rosters shown by shift). Name-spelling: closed and handled internally — no card on the site.
- **Shirt orders list is live**. The Orders → Show shirt card pulls from a published Google Sheet CSV (`SHIRT_CSV_URL` in `app.js`) and renders dancer name, size, paid status (Grade column intentionally hidden). Source of truth is the studio's Google Sheet — when she ticks "Paid" or new responses arrive, the site updates within Google's ~5 min publish-cache window. Don't replace the live list with a static table.
- **Volunteer roster is live, multi-tab capable.** The studio's "Backstage Mums" sheet has one tab per shift; the Volunteers tab uses **sub-tabs** (same pattern as Orders) — one sub-tab per shift, each containing a `<div class="dynamic-roster" data-gid="…">`. `renderVolunteers()` finds every `.dynamic-roster[data-gid]` (regardless of which sub-tab is active) and fetches `VOLUNTEER_CSV_BASE&gid={gid}&single=true` on page load. Sub-tabs without data show "Roster being finalised". When the studio shares a new tab's gid, swap the `<!-- TODO -->` placeholder in that shift's `<article class="subtab-content shift-panel">` for a `data-gid` div.
- **Emojis are character-driven and locally hosted.** `CHARACTER_EMOJI_RULES` in `app.js` is an ordered regex list — first match wins. Add new rules at the most-specific position when the studio names new characters in the sheet (e.g. "Yellow Brick Road", "Wicked Witch"). `VOLUNTEER_GROUP_EMOJI` is the group-name fallback when the Character cell is empty / unmatched, and 🎭 is the final fallback. Each emoji renders as a Twemoji SVG `<img>` from `images/emoji/<codepoint>.svg` (no CDN — files are committed to the repo for resilience). When you add a new emoji to the rules, run `curl -sLf "https://cdn.jsdelivr.net/gh/jdecked/twemoji@v15.1.0/assets/svg/<codepoint>.svg" -o images/emoji/<codepoint>.svg` and add it to the `EMOJI_SVG` map in `app.js`.
- **Orders tab uses sub-tabs** (`.subtabs` + `.subtab-content`) — Show shirt / Show photos / Show video. Only the active sub-section shows; default is Shirt. The pattern is generic in `wireSubTabs()` in `app.js` and can be reused on other tabs if they outgrow a single screen.
- **Studio leotards** are an *ongoing* year-round offering, **not** a show-prep order — they live on the Studio tab, not Orders. Don't re-add a leotard order form to Orders.
- **Show photos** are sold by Tantalising Twins on Pixieset: <https://tantalisingtwins.pixieset.com/dandeliondancestudiophotoshoot/>. Linked from Orders → Show photos.
- **Show videos** are sold by AngelMedia (Mark Whitlock, 083 340 1390, angelmedia@telkomsa.net): R250 HD USB or R140 download link per show, **cash only** (envelope with order slip returned to Louise). No online order form — Orders → Show video describes the process inline.
- **Contact has two cards**: **Bron** (Bronwyn Goble) handles show outfit / shirt cost questions — WhatsApp `+27 82 558 0515` (`wa.me/27825580515`) and email `bron.palm@gmail.com`. **Louise** handles rehearsal questions — WhatsApp `+27 84 240 6284` (`wa.me/27842406284`); she has no email so her card has no email row. Don't add an email row back. Don't merge the cards — the studio explicitly wants the split. General studio queries / year-round leotards are signposted to the Studio tab and the studio's Facebook page (no dedicated Contact card for those).
- **Studio Facebook link is real** and confirmed: <https://web.facebook.com/p/Dandelion-Studio-of-Dance-61563399494901/>. Used on Contact and Studio tabs.
- **No Gallery tab** — the in-site gallery + lightbox were removed since the studio uses Tantalising Twins on Pixieset for show photos. Don't reintroduce a `<section id="gallery">` or a photo grid; link out to Pixieset from Orders → Show photos.
- **Footer is a random Oz quote only** (defined in `app.js`'s `QUOTES` array). Don't add credits, sponsor logos, or other footer content without asking.

## Logo handling

- The show logo (`images/logo.png`) is the multi-colour gold word-mark extracted from `ShirtLogo_BLACK.pdf` via `pdftocairo -png -r 200 -singlefile -transp`. It's displayed as a normal `<img>` — **no CSS mask**. The colour is part of the artwork.
- Favicons (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`) were generated from the logo onto a cream background so the gold wordmark reads on the browser tab. Regenerate from `images/logo.png` if it changes (Pillow recipe in commit history).

## Analytics

- **Google Analytics 4** wired up. Property: `G-GP77MVX97V`. Snippet is in `index.html` `<head>`. SPA pageviews are tracked manually — `send_page_view: false` in the config and `switchTab()` in `app.js` fires `gtag('event','page_view', …)` on every tab change (including initial load). Each tab shows up as its own row in **Reports → Engagement → Pages and screens** under `page_path` like `/ballet-web/#schedule`. Don't restore default auto-pageviews — it would double-count the initial load.

## Local preview

- **`python3 -m http.server 8765`** in the project root, then open `http://localhost:8765/`. The shirt-orders list uses `fetch()` to pull a published Google Sheet CSV, which browsers block on `file://`. Always run a server.

## Git & deploy

- **Personal `melissapalmer` GitHub identity only.** Never push under any MIT identity.
- **Repo lives at `github.com/melissapalmer/ballet-web`.** Site URL: `https://melissapalmer.github.io/ballet-web/` (case-sensitive).
- **Deploy is automatic** — every push to `main` redeploys via Pages with **Source: GitHub Actions**. The [.github/workflows/deploy.yml](.github/workflows/deploy.yml) workflow injects the short commit SHA into `index.html` so `styles.css?v=__VERSION__` and `app.js?v=__VERSION__` get fresh URLs each deploy. **Do not** remove the `__VERSION__` placeholders or hardcode a value.
- **First-time push** instructions are in [README.md](README.md).

## When the user gives feedback

If the user corrects something or expresses a preference that would apply to *future* changes (not just the current task), append a one-line rule to the relevant section above.

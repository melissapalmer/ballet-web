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
- **Layout is tab-based** — no scroll-to-anchor sections. Tabs are Home, Schedule, Volunteers, Orders, Contact, Studio, Gallery (hidden until photos exist).
- **Hero is compact** — logo on the left, "Dance moms hub" + show title + tagline on the right. The hero stays consistent across tabs.

## Content rules

- **Site is mom-facing only.** Don't add public Buy Tickets CTAs, ticket prices, the show synopsis, or the show poster to any tab. The studio handles public promotion via Playhouse Company / Webtickets.
- **Show date is the source of truth.** Saturday 16 May 2026, two performances 12:00 and 15:00 at the Playhouse Drama Theatre, Durban. Show day arrival 09:30 stage door, collection ~17:30. The countdown in `app.js` aims at the 12:00 show (`SHOW_DATETIME`). Update both `index.html` and `app.js` if dates shift.
- **Rehearsals**: Fri 1 May (08:45–13:00 OLF school hall), Sat 9 May (08:45–13:30 OLF school hall), Fri 15 May (stage rehearsal at the Playhouse, sign in 13:00). 1 May and 9 May are at the school hall — only 15 May is on stage. Don't relabel 9 May as the "dress rehearsal"; the on-stage run is 15 May.
- **Backstage rule** (show day): only moms on the volunteer roster are allowed backstage. This warning lives in the Schedule and Volunteers tabs in `.backstage-note` blocks — keep both copies in sync if rewording.
- **Google Form URLs are placeholders** (`#TODO-shirt-order-form`, `#TODO-name-spelling-form`, `#TODO-volunteer-form`). When the studio sends URLs, replace via Edit and commit. `grep -n '#TODO-' index.html` lists every outstanding placeholder.
- **Studio leotards** are an *ongoing* year-round offering, **not** a show-prep order — they live on the Studio tab, not Orders. Don't re-add a leotard order form to Orders.
- **Show photos** are sold by Tantalising Twins on Pixieset: <https://tantalisingtwins.pixieset.com/dandeliondancestudiophotoshoot/>. Linked from Orders → Show photos.
- **Show videos** are sold by AngelMedia (Mark Whitlock, 083 340 1390, angelmedia@telkomsa.net): R250 HD USB or R140 download link per show, **cash only** (envelope with order slip returned to Louise). No online order form — Orders → Show video describes the process inline.
- **Contact details are placeholders too** (`#TODO-contact-name`, `#TODO-whatsapp-number`, `#TODO-whatsapp-link`, `#TODO-email-address`, `#TODO-email-mailto`). Same `grep` lists them.
- **Studio Facebook link is real** and confirmed: <https://web.facebook.com/p/Dandelion-Studio-of-Dance-61563399494901/>. Used on Contact and Studio tabs.
- **Gallery photos** live in `data/photos.csv` (`filename,date,event,caption`) and `images/photos/`. Photos group by year, then by event. Newest first. The Gallery tab stays hidden when the CSV has only a header — do not "unhide" it without rows.
- **Footer is a random Oz quote only** (defined in `app.js`'s `QUOTES` array). Don't add credits, sponsor logos, or other footer content without asking.

## Logo handling

- The show logo (`images/logo.png`) is the multi-colour gold word-mark extracted from `ShirtLogo_BLACK.pdf` via `pdftocairo -png -r 200 -singlefile -transp`. It's displayed as a normal `<img>` — **no CSS mask**. The colour is part of the artwork.
- Favicons (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`) were generated from the logo onto a cream background so the gold wordmark reads on the browser tab. Regenerate from `images/logo.png` if it changes (Pillow recipe in commit history).

## Local preview

- **`python3 -m http.server 8765`** in the project root, then open `http://localhost:8765/`. The Gallery uses `fetch()` to load `data/photos.csv`, which browsers block on `file://`. Always run a server.

## Git & deploy

- **Personal `melissapalmer` GitHub identity only.** Never push under any MIT identity.
- **Repo lives at `github.com/melissapalmer/ballet-web`.** Site URL: `https://melissapalmer.github.io/ballet-web/` (case-sensitive).
- **Deploy is automatic** — every push to `main` redeploys via Pages with **Source: GitHub Actions**. The [.github/workflows/deploy.yml](.github/workflows/deploy.yml) workflow injects the short commit SHA into `index.html` so `styles.css?v=__VERSION__` and `app.js?v=__VERSION__` get fresh URLs each deploy. **Do not** remove the `__VERSION__` placeholders or hardcode a value.
- **First-time push** instructions are in [README.md](README.md).

## When the user gives feedback

If the user corrects something or expresses a preference that would apply to *future* changes (not just the current task), append a one-line rule to the relevant section above.

# CLAUDE.md — Project rules for The Enchanted World of Oz site

A small static site promoting a single ballet show performed once (Saturday 16 May 2026). Hosted on GitHub Pages. This file captures rules that should be respected without being asked. Add to it whenever the user gives feedback that should stick across sessions.

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
- **Layout is tab-based** — no scroll-to-anchor sections. Tabs are Home, The Show, Tickets, Studio, Gallery (hidden until photos exist).
- **Hero is compact** — logo on the left, "presents" + show title + tagline on the right.
- **Show poster is on the Home tab**, alongside the key-info card and Buy Tickets CTA. Don't stuff it into the hero — it belongs in the tab body.

## Content rules

- **Show data is the source of truth.** The show is on Saturday 16 May 2026, two showtimes 12:00 and 15:00, R190 per ticket, Playhouse Drama Theatre Durban, tickets at <https://www.webtickets.co.za/v2/event.aspx?itemid=1593575348> (also Pick n Pay). If any of these change, update both `index.html` and the countdown date in `app.js` (`SHOW_DATETIME`).
- **Synopsis is from the Playhouse article** (<https://playhousecompany.com/2026/04/22/the-enchanted-world-of-oz/>). Don't paraphrase further without checking the user.
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

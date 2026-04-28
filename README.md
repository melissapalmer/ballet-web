# The Enchanted World of Oz — Dance-Mom Logistics Hub

A small static site for the Dandelion Studio of Dance moms preparing for the 2026 ballet showcase, **The Enchanted World of Oz** (Saturday 16 May 2026, Playhouse Drama Theatre, Durban). One place for the schedule, volunteer signup, shirt &amp; leotard orders, and studio contact details. Single-page site with tab navigation, hosted on GitHub Pages — no build step, no frameworks.

## Site contents

- **Home** — welcome, countdown to curtain, and four shortcut tiles (Schedule, Volunteer, Orders, Contact).
- **Schedule** — four key dates: 1 May rehearsal (OLF), 9 May rehearsal (OLF), 15 May stage rehearsal (Playhouse), 16 May show day (12:00 + 15:00 performances) with venue, arrival/collection times and the backstage rule.
- **Volunteers** — same shifts, each showing the confirmed roster (signups are closed; rosters are added per shift as the studio shares them).
- **Orders** — show shirt (form + **live order list** from a published Google Sheet CSV), show photos (Tantalising Twins on Pixieset), show video (AngelMedia, cash + paper slip). Name-spelling is closed and handled internally by the studio — no card needed.
- **Contact** — two cards: Bron (show outfit / shirt costs) and Louise (rehearsals); plus a signpost to the Studio tab / Facebook for general queries.
- **Studio** — short About paragraph, Facebook link, and a note about year-round studio leotards.

## Filling in the Google Forms (and contact details)

Form URLs and contact details are stored as `#TODO-…` placeholders so it's clear at a glance what's still missing. To list every outstanding placeholder:

```bash
grep -n '#TODO-' index.html
```

Each match shows the line number and the placeholder name. Replace with the real URL / number / address via search-and-replace, then commit + push — the GitHub Pages workflow auto-deploys within ~60 s.

The placeholders currently in use:

All placeholders are currently filled in. If a new one is added later, `grep` will surface it.

### Adding a volunteer roster

When the studio shares a new shift's roster (e.g. for 9 May), open the corresponding `<li class="shift-item">` in `index.html` and replace the `<p class="muted roster-pending">…</p>` with the same `<dl class="roster-list">` structure used for 1 May. Class assignments go under a `<h4 class="roster-heading">Class roster</h4>`; backstage / general roles under a separate `<h4 class="roster-heading">General</h4>`. Preserve the studio's emoji and group names verbatim.

## Previewing locally

The shirt-orders list pulls a published Google Sheet CSV via `fetch()`, which browsers block on `file://`. Run a local server:

```bash
cd /home/melissa/work/mp/repository/BRONWYN/ballet-web
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

## First-time setup: push to GitHub & enable Pages

The site is intended for the personal `melissapalmer` GitHub account. Repo will live at `github.com/melissapalmer/ballet-web`.

```bash
cd /home/melissa/work/mp/repository/BRONWYN/ballet-web

# 1. Initialise git and make the first commit
git init
git add .
git commit -m "Initial site"
git branch -M main

# 2. Sign in to public github.com as melissapalmer (skip if already signed in)
unset GITHUB_TOKEN
gh auth login --hostname github.com --git-protocol ssh --web

# 3. Create the public repo and push
gh repo create melissapalmer/ballet-web --public --source=. --remote=origin --push

# 4. Enable GitHub Pages with the GitHub Actions workflow as the source
gh api -X POST repos/melissapalmer/ballet-web/pages -f build_type=workflow

# 5. Open the live site (give Pages 30–60 seconds for the first build)
xdg-open https://melissapalmer.github.io/ballet-web/
```

If you'd rather use the GitHub web UI: create a new public repo named `ballet-web` under `melissapalmer`, push, then **Settings → Pages → Source → GitHub Actions**.

## Day-to-day update flow

Every push to `main` redeploys automatically (~30 seconds) via [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

```bash
git add index.html
git commit -m "Update content"
git push
```

## File map

```
ballet-web/
├── index.html           # Page markup (hero, tab nav, six tab panels)
├── styles.css           # Emerald + gold on cream, mobile-first
├── app.js               # Tabs, sub-tabs, countdown, live shirt-orders CSV fetch
├── images/
│   ├── poster.jpg       # Show advert (kept on disk; not currently shown on the mom-facing site)
│   ├── logo.png         # Show logo (extracted from ShirtLogo_BLACK.pdf)
│   ├── favicon.ico
│   ├── favicon-32.png
│   └── apple-touch-icon.png
├── .github/workflows/
│   └── deploy.yml       # GitHub Pages workflow; injects commit SHA as cache-buster
├── .nojekyll            # Tells Pages to skip Jekyll processing
└── .gitignore
```

`index.html`, `styles.css`, and `app.js` only need editing if you want to change the site itself (colours, layout, new tab, new content).

## Custom domain (later)

When a domain is registered:

1. Add a `CNAME` file at the repo root containing the bare domain (e.g. `enchantedoz.co.za`).
2. At the registrar: point an `A` record (or `ALIAS`/`ANAME` for the apex) at GitHub Pages IPs and a `CNAME` record for `www` → `melissapalmer.github.io`.
3. **Settings → Pages → Custom domain** → enter the domain and tick **Enforce HTTPS** once the certificate is issued (usually within an hour).

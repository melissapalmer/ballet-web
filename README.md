# The Enchanted World of Oz — Dance-Mom Logistics Hub

A small static site for the Dandelion Studio of Dance moms preparing for the 2026 ballet showcase, **The Enchanted World of Oz** (Saturday 16 May 2026, Playhouse Drama Theatre, Durban). One place for the schedule, volunteer signup, shirt &amp; leotard orders, and studio contact details. Single-page site with tab navigation, hosted on GitHub Pages — no build step, no frameworks.

## Site contents

- **Home** — welcome, countdown to curtain, and four shortcut tiles (Schedule, Volunteer, Orders, Contact).
- **Schedule** — four key dates: 1 May rehearsal (OLF), 9 May rehearsal (OLF), 15 May stage rehearsal (Playhouse), 16 May show day (12:00 + 15:00 performances) with venue, arrival/collection times and the backstage rule.
- **Volunteers** — same shifts, each with a "Sign up" button linking to a Google Form.
- **Orders** — show shirt (form), show photos (Tantalising Twins on Pixieset), show video (AngelMedia, cash + paper slip), name-spelling check (form).
- **Contact** — studio name, contact name, WhatsApp, email, Facebook.
- **Studio** — short About paragraph, Facebook link, and a note about year-round studio leotards.
- **Gallery** — hidden until the first photo is added (see below).

## Filling in the Google Forms (and contact details)

Form URLs and contact details are stored as `#TODO-…` placeholders so it's clear at a glance what's still missing. To list every outstanding placeholder:

```bash
grep -n '#TODO-' index.html
```

Each match shows the line number and the placeholder name. Replace with the real URL / number / address via search-and-replace, then commit + push — the GitHub Pages workflow auto-deploys within ~60 s.

The placeholders currently in use:

| Placeholder | What goes there |
|---|---|
| `#TODO-volunteer-form` | Google Form URL for volunteer signup (one form covering all four shifts) |
| `#TODO-shirt-order-form` | Google Form URL for show-shirt orders |
| `#TODO-name-spelling-form` | Google Form URL for program name-spelling check |
| `#TODO-contact-name` | Studio contact person's name |
| `#TODO-whatsapp-link` | `https://wa.me/27...` link target |
| `#TODO-whatsapp-number` | Display version of the WhatsApp number |
| `#TODO-email-mailto` | `mailto:address@example.com` link target |
| `#TODO-email-address` | Display version of the email address |

## Adding photos after the show

The Gallery tab automatically appears once `data/photos.csv` has at least one row.

1. Drop JPGs into `images/photos/` (e.g. `2026-05-16-finale-1.jpg`).
2. Add rows to `data/photos.csv` with columns `filename,date,event,caption`:
   ```
   2026-05-16-finale-1.jpg,2026-05-16,Finale,Whole company in Emerald City
   ```
   `event` groups multiple shots from the same scene; `caption` is per-photo and optional.
3. Commit + push.

## Previewing locally

The site uses `fetch()` to load `data/photos.csv`, which browsers block on `file://`. Run a local server:

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
git add data/photos.csv images/photos/
git commit -m "Add show photos"
git push
```

## File map

```
ballet-web/
├── index.html           # Page markup (hero, tab nav, six panels + hidden gallery, lightbox)
├── styles.css           # Emerald + gold on cream, mobile-first
├── app.js               # Tabs, countdown, lightbox, photos CSV loader
├── data/
│   └── photos.csv       # Header-only at launch; rows un-hide the Gallery tab
├── images/
│   ├── poster.jpg       # Show advert (kept on disk; not currently shown on the mom-facing site)
│   ├── logo.png         # Show logo (extracted from ShirtLogo_BLACK.pdf)
│   ├── favicon.ico
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   └── photos/          # Photos referenced by data/photos.csv
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

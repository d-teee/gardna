# Claude Code Handoff — Deploy the Gardna landing page

## What this is

This folder is a **complete, production-ready static website** (the Gardna
waitlist landing page). It is **not** a design reference to be rebuilt — the HTML/CSS/JS
here is the real, finished site. Your job is to **deploy it as-is**, not to recreate it
in a framework.

Stack: plain HTML + CSS + vanilla JS. **No build step, no package.json, no dependencies.**

## The goal

Get this folder live on the internet at the custom domain **`gardna.co`** (already
purchased by the owner), hosted on **Vercel**, with auto-deploy from **GitHub**.

## Step-by-step

### 1. Initialise a git repo (run from inside this folder)
```bash
git init
git add .
git commit -m "Gardna landing page — initial commit"
```

### 2. Create a GitHub repo and push
Use the GitHub CLI if available:
```bash
gh repo create gardna-site --public --source=. --remote=origin --push
```
Or create an empty repo named `gardna-site` on github.com, then:
```bash
git remote add origin git@github.com:<USERNAME>/gardna-site.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel
- This is a **static site**: no framework, no build command, output directory is the
  repo root (where `index.html` lives).
- Easiest: vercel.com → **Add New → Project** → import the `gardna-site` repo →
  Framework Preset **Other** → leave build & output settings empty → **Deploy**.
- Or via CLI: `npm i -g vercel` then `vercel` (accept defaults; it auto-detects a
  static site) and `vercel --prod` to promote.
- A `*.vercel.app` URL appears in ~20s. Verify the page loads and fonts/images render.

### 4. Connect the domain `gardna.co`
- Vercel → Project → **Settings → Domains** → add both `gardna.co` and `www.gardna.co`.
- At the domain registrar where `gardna.co` was bought, set DNS:
  | Type  | Name (host) | Value                  |
  |-------|-------------|------------------------|
  | A     | `@` (apex)  | `76.76.21.21`          |
  | CNAME | `www`       | `cname.vercel-dns.com` |
- Alternatively, point the registrar's **nameservers** at Vercel and let Vercel manage DNS.
- SSL is provisioned automatically once DNS resolves (minutes, up to ~1h). Set
  `gardna.co` as the primary domain and redirect `www` → apex (Vercel offers this toggle).

### 5. Confirm auto-deploy
Every `git push` to `main` redeploys automatically. No further config needed.

## Important notes / gotchas

- **Waitlist:** `index.html`'s form posts to Formspree (`https://formspree.io/f/xdajrvlk`).
  It's vanilla `fetch` in `site.js` (`initWaitlist`) — no env vars or secrets. The first
  submission to a new Formspree form triggers a one-time confirmation email to the form
  owner; it must be clicked before submissions are stored. Tell the owner to do this once.
- **No build:** do not add a bundler, framework, or `npm run build`. Adding a build step
  will break Vercel's static detection. Serve the files verbatim.
- **Paths are relative** (`styles.css`, `assets/…`, `fonts/…`) — keep `index.html` at the
  repo root so they resolve.
- **Fonts:** `fonts.css` self-hosts Fraunces + Lufga from `fonts/` and imports Hanken
  Grotesk + Spline Sans Mono from Google Fonts. No action needed.
- **Social preview:** OG/Twitter meta in `index.html` reference
  `https://gardna.co/assets/insitu-wall.webp`. These absolute URLs only resolve once the
  domain is live — expected.
- **Single page:** only `index.html` ships. There is intentionally no other HTML page.

## Acceptance check

- [ ] `gardna.co` loads over HTTPS, no console errors.
- [ ] Hero photo, carousel images, and the planter photo in "The Modules" all render.
- [ ] Fonts load (headings in Fraunces serif, not a fallback).
- [ ] Submitting the waitlist shows "You're on the list" and the entry lands in Formspree.
- [ ] Page looks correct on a real phone.

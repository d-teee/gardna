# Gardna — Landing Page

Marketing / waitlist site for **Gardna**, a modular hydroponic living-wall system.
**Tagline:** Let's grow together.

This is a **static site** — plain HTML/CSS/JS, no build step, no dependencies.
Open `index.html` in a browser to run it locally; deploy by serving these files as-is.

## File structure

```
index.html      ← the site (responsive; this is the only HTML page that ships)
styles.css      ← all styles (@imports fonts.css)
fonts.css       ← @font-face + Google Fonts import
site.js         ← parallax, carousel, scroll reveals, waitlist submission
assets/         ← logo, icon, photographs (WebP)
fonts/          ← self-hosted Fraunces + Lufga (TTF)
.gitignore
CLAUDE_CODE_HANDOFF.md  ← deployment instructions
```

## Deploy (summary)

Static host, no build command. Push to GitHub → import to Vercel → add the
custom domain `gardna.co`. Full step-by-step is in **CLAUDE_CODE_HANDOFF.md**.

## Waitlist

The form posts to **Formspree** (`https://formspree.io/f/xdajrvlk`). Submissions
appear in the Formspree dashboard and notify the linked email.
⚠️ The first submission triggers a Formspree confirmation email — click it once to
activate the form before launch.

## Pre-launch checklist

- [ ] Activate the Formspree form (submit once, confirm via email).
- [ ] Test the live URL on a real phone.
- [ ] (Optional) Replace the social-preview image — the OG/Twitter tags in
      `index.html` point at `assets/insitu-wall.webp`; a dedicated 1200×630 image
      previews better when the link is shared.
- [ ] (Optional) Confirm the three stat sources are final (EPA · UN · Natural England).

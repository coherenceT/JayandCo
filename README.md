# JAY & CO Jewelers — Landing Page

A luxury, **light/warm-white** landing page for a local jeweler — champagne-gold accents,
crisp ink typography, cinematic whitespace. Pure static HTML/CSS/JS —
no build step, no runtime dependencies. Drop it on any static host and it works.

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Structure

```
index.html               All 9 sections (nav → hero → stats → collections → bespoke
                         → story → visit/enquiry → journal → footer)
privacy.html, terms.html Linked from the footer (no dead links)
assets/css/styles.css    Design tokens, components, animations, responsive rules
assets/js/main.js        Sticky nav, scroll progress, mobile menu, reveals,
                         stat counters, active-link highlight, form validation
assets/img/              Upscaled logo variants, favicon PNGs, social share card
assets/fonts/            Self-hosted Playfair Display + Inter (latin, woff2)
favicon.ico / .svg       Multi-size favicon set (also favicon-16/32/48.png)
site.webmanifest         PWA manifest with maskable icon
robots.txt, sitemap.xml  SEO crawl config
.well-known/security.txt Vulnerability disclosure contact
_headers                 Netlify / Cloudflare Pages security + cache headers
vercel.json              Vercel security + cache headers
tools/generate_assets.py Regenerates every image asset from the source Logo.jpg
```

## Design system (light theme)

| Role | Token | Hex |
|---|---|---|
| Main background | `--bg` | `#FCFBF8` (warm white) |
| Cards / surfaces | `--surface`, `--surface-2` | `#FFFFFF` / `#F8F6F1` |
| Alternate bands / footer | `--bg-alt` | `#F5F2EB` |
| Primary accent (fills) | `--gold` | `#D4AF37` |
| Hover / highlight | `--gold-soft` | `#E5C558` |
| Gold **text** (AA-safe) | `--gold-ink` | `#8A6D1F` |
| Gold linework / icons | `--gold-line` | `#B8912F` |
| Headings | `--ink` | `#17140F` |
| Body copy | `--muted` | `#6B665E` |
| Hairline borders | `--hairline` | `rgba(212,175,55,.35)` |

Typography: **Playfair Display** (headlines) + **Inter** (body), both self-hosted —
no third-party font requests, so the strict Content-Security-Policy holds.

## Security

- CSP enforced twice: `<meta http-equiv>` in every page **and** via HTTP headers
  (`_headers` / `vercel.json`) — `default-src 'self'`, no inline scripts, no frames.
- `X-Frame-Options: DENY`, `nosniff`, strict `Referrer-Policy`, HSTS preload,
  `Permissions-Policy` with every feature denied, `Cross-Origin-Opener-Policy`.
- Forms are validated client-side and carry `novalidate` + aria-live success states.
  Wire `handleSubmit()` in `assets/js/main.js` to your backend/CRM endpoint
  (a `fetch('/api/enquiry', …)` example is commented there).
- `.well-known/security.txt` published for vulnerability reports.

## Brand asset pipeline

`Logo.jpg` (150×150 source) is processed by `tools/generate_assets.py`:

- white matte un-mixed → transparent PNG, upscaled ×6.8 with LANCZOS + unsharp
- gold-tinted variants, monogram crop for favicons
- ivory favicon set (ico/png/svg), apple-touch + Android/maskable icons
- 1200×630 light social share card

```bash
python3 -m pip install --user pillow
python3 tools/generate_assets.py
```

## Going live

1. Live details are in: Jay & Co Jewellers · Office Nr 16B, Smokey Mountain N4
   Business Park, Emalahleni · +27 82 884 3113 · WhatsApp +27 82 698 6800
   (`wa.me/27826986800`) · info@stylejewellers.co.za · est. 1994. Canonical domain
   is set to `stylejewellers.co.za` in the meta tags, JSON-LD, sitemap and
   robots.txt — swap once the final domain is confirmed.
2. Optional: drop a real campaign photo into the hero (see the comment above
   `.hero__art` in `index.html`) — the gradient overlay already sits above it.
3. Deploy: drag the folder into Netlify, `vercel deploy`, `wrangler pages deploy`,
   or push to GitHub Pages. Headers ship with the repo for Netlify/CF/Vercel.
4. Submit `https://<domain>/sitemap.xml` to Google Search Console.

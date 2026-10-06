# Jay & Co Jewelers — Complete HTML Build Prompt

## How to use this file

Give the prompt below to an HTML/CSS/JavaScript coding agent. It is written to rebuild the existing Jay & Co Jewelers site from scratch while preserving the current visual language and interactions.

> **Critical preservation rule:** Do **not** change, redesign, rewrite, delete, or reorder the About page. In the current site, the About page is the **Our Story page at `/story`**. Treat `/story` as locked content. Only wire its navigation link and make it responsive if required; do not alter its copy, layout, imagery, colors, or section order.

---

# COPY-PASTE BUILD PROMPT

Build a polished, responsive luxury jewelry website for **Jay & Co Jewelers** using plain HTML, modern CSS, and vanilla JavaScript. Do not use React, a backend, a database, or external UI libraries. Create a clean multi-page static site with reusable header, marquee, footer, form, and section patterns.

## 1. Non-negotiable constraints

1. Match the existing Jay & Co visual identity: understated luxury, editorial typography, warm ivory paper, deep black, muted gold, generous whitespace, and premium jewelry photography.
2. Use the supplied asset URLs from the asset table below. Do not replace them with generic placeholders.
3. Use semantic HTML and accessible labels, focus states, keyboard navigation, alt text, and responsive layouts.
4. Implement all routes/pages listed below:
   - `/` — Home
   - `/collections` — Collections
   - `/bespoke` — Bespoke Services
   - `/story` — **Our Story / About — LOCKED; DO NOT CHANGE**
   - `/contact` — Contact
5. If using separate HTML files, create `index.html`, `collections.html`, `bespoke.html`, `story.html`, and `contact.html`. If using a static router, preserve the same paths.
6. The header and footer must appear consistently on every page.
7. Do not invent new sections on the locked `/story` page.
8. Do not use “Lifetime Care” in the ticker or the Bespoke Delivery copy. The approved Delivery copy is: **“Receive your bespoke creation, ready to become part of your story.”**
9. The approved Difference quote is: **“We create emotions that last a lifetime.”** It belongs inside the Difference section; do not add a separate standalone quote band.
10. Keep the contact and newsletter forms functional on the client side: validate fields, show an inline success/error state, and prevent empty submissions. No backend is required.

## 2. Design system

### Colors

Use CSS variables:

```css
:root {
  --ink: #171513;
  --ink-deep: #0d0c0b;
  --ivory: #f7f5ef;
  --paper: #fbfaf6;
  --parchment: #eeece4;
  --gold: #a7894d;
  --gold-bright: #c6af70;
  --ink-soft: #716d66;
  --rule: rgba(23, 21, 19, 0.14);
  --ease-out: cubic-bezier(.23, 1, .32, 1);
}
```

### Typography

Use an editorial serif for display text and a restrained sans-serif for body/UI labels. Good Google Fonts choices:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap" rel="stylesheet">
```

- Display headings: `Playfair Display`, weight 400.
- Italic gold accents: `Playfair Display`, italic.
- Body, labels, nav, buttons: `DM Sans`.
- Navigation labels: uppercase, letter spacing around `.28em`, small font size.
- Use fluid heading sizes with `clamp()`.

### Layout and motion

- Maximum content width: approximately 1120–1200px.
- Use large intentional vertical spacing.
- Use subtle reveal-on-scroll animation with `IntersectionObserver`.
- Animate only `transform` and `opacity`.
- Buttons should scale to `0.97` on active press.
- Dropdowns and mobile drawers should use 160–250ms transitions.
- Respect `prefers-reduced-motion: reduce`.
- Use a dark translucent gradient over hero images to guarantee readable text.

## 3. Shared header

Create a white/ivory header approximately 70px tall on desktop.

- Left: text logo `JAY & CO` with wide tracking.
- Center navigation:
  - COLLECTIONS → `/collections`
  - BESPOKE SERVICES → `/bespoke`
  - OUR STORY → `/story`
  - CONTACT → `/contact`
- Right: three-line hamburger button.
- On mobile, hide desktop navigation and show the hamburger.
- Hamburger opens an accessible slide-out menu containing:
  - Home
  - Collections
  - Bespoke Services
  - Our Story
  - Contact
- Close the menu when a link is clicked, Escape is pressed, or the close button is clicked.
- Keep the `/story` link intact and do not change the page it opens.

## 4. Shared gold marquee

Place a full-width gold ticker beneath the Home hero and beneath the Bespoke hero.

Use exactly these items, with small diamond/star separators and no empty entries:

1. Bespoke Design
2. Timeless craftmanship
3. Jewellery made to be treasured
4. Engagement Rings
5. Ethically sourced diamonds

Make the ticker loop continuously. Use tighter horizontal spacing rather than oversized blank gaps. Keep the spelling **“craftmanship”** if exact copy matching is required.

## 5. Home page `/`

### Hero

Full viewport-height or approximately 760px hero using `hero.jpg`.

- Deep black overlay/gradient.
- Left-aligned content within the main container.
- Eyebrow: `EST. IN YOUR COMMUNITY`
- Heading:
  - `Timeless Elegance,`
  - gold italic line: `Crafted for You.`
- Body: `Discover our collection of fine jewelry, handcrafted with precision and passion. From engagement rings to custom designs, we create pieces that tell your story — your trusted local jeweler. Every piece tells a story — let us help you write yours.`
- Primary outlined button: `EXPLORE COLLECTIONS` → `/collections`
- Secondary text link: `BESPOKE SERVICES →` → `/bespoke`
- Add a small bottom-centered `SCROLL` indicator.

### Stats band

Ivory horizontal band with four equal columns:

- `20+` — Years of Craftsmanship
- `5,000+` — Pieces Created
- `GIA` — Certified Diamonds
- `100%` — Satisfaction Guarantee

### Collections section

Centered section on ivory/paper background:

- Eyebrow: `OUR COLLECTIONS`
- Heading: `Curated with Intention`
- Short supporting copy about thoughtfully chosen jewelry.
- Three portrait cards:
  - Engagement Rings
  - Fine Watches
  - Custom Designs
- Use the corresponding collection assets.
- Add a subtle image zoom/overlay on hover.
- Button: `VIEW ALL COLLECTIONS` → `/collections`

### Bespoke split section

Two-column parchment section:

- Left: large `bespoke.jpg` image.
- Right:
  - Eyebrow: `BESPOKE SERVICES`
  - Heading: `A Piece as Unique`
  - Gold italic accent: `as Your Story`
  - Body describing collaboration with master jewellers from first sketch to final polish.
  - Four numbered points:
    1. Consultation
    2. Design & Sketch
    3. Handcrafted Creation
    4. Delivery — `Receive your bespoke creation, ready to become part of your story.`
  - Gold button: `BEGIN YOUR DESIGN` → `/contact`

### Difference section

Use a deep black background and ivory text. Do not create a separate quote section after this.

- Eyebrow: `OUR PROMISE`
- Heading: `The Jay & Co Difference`
- Supporting copy exactly: `“We create emotions that last a lifetime.”`
- Keep the section visually spacious and centered.

### Home contact section

Two-column ivory section:

Left:
- Eyebrow: `VISIT US`
- Heading: `We'd Love to` with gold italic `Meet You`
- Address and opening hours.
- Button: `SCHEDULE A CONSULTATION` → `/contact`

Right:
- Eyebrow: `SEND AN ENQUIRY`
- Heading: `Begin Your Journey`
- Fields: full name, email address, message.
- Black submit button: `SEND ENQUIRY`.
- Show inline validation and a success state after valid submission.

### Journal signup band

Dark image-backed band using `journal.jpg`.

- Eyebrow: `THE JAY & CO JOURNAL`
- Heading: `Stories of Craft & Beauty`
- Copy: `Subscribe for new collection announcements, jewelry care guides, and exclusive invitations to private events.`
- Email field and gold `SUBSCRIBE` button.
- Do **not** include the removed right-side badge/blockquote quote.

## 6. Collections page `/collections`

Keep the existing Collections page structure and visual treatment. It should include:

- Shared header.
- Simple editorial hero with `Collections` heading and short introduction.
- Three collection cards using:
  - `collection-engagement-rings.jpg`
  - `collection-watches.jpg`
  - `collection-custom-designs.jpg`
- Each card needs a title, description, hover treatment, and a usable link/button.
- Shared footer.

Do not alter the locked `/story` page while implementing this page.

## 7. Bespoke Services page `/bespoke`

- Shared header.
- Hero heading:
  - `A Piece as Unique`
  - gold italic: `as Your Story`
- Gold marquee directly under the hero.
- Do **not** render a separate four-card process strip beneath the marquee.
- Use a two-column bespoke detail section with `bespoke.jpg` and the four numbered process points listed above, including Delivery.
- Include the full enquiry form section:
  - Heading: `Begin Your Bespoke Journey`
  - Full name field
  - Email address field
  - Message field
  - Submit action: `SEND ENQUIRY`
- Keep the journal signup band and shared footer.
- Do not use lifetime-care or maintenance promises in the Delivery copy.

## 8. About / Our Story page `/story` — LOCKED

**Do not change this page.**

Preserve the current Our Story page exactly as it exists, including:

- Existing hero copy and section order.
- Existing `story-hero.jpg` and `story-craft.jpg` imagery.
- Existing craftsmanship and values sections.
- Existing typography, spacing, colors, and responsive behavior.
- Existing footer and navigation behavior.

Only ensure that the navigation link `/story` opens this page. If the source is being ported into separate HTML files, copy the current About/Our Story markup and styles without redesigning it.

## 9. Contact page `/contact`

Use the existing contact page visual language:

- Editorial hero with `Contact` heading.
- Address, phone, email, and opening hours.
- Full contact form with name, email, message, and submit action.
- Inline validation and success state.
- Shared footer.

Use placeholder contact details only if the current content has not been replaced with real business details:

- `123 Main Street, Suite 101`
- `Your City, State 00000`
- `Monday – Friday, 10:00 AM – 6:00 PM`
- `Saturday, 10:00 AM – 5:00 PM`
- `Sunday, By Appointment`
- `(555) 000-0000`
- `hello@jayandcojewelers.com`

## 10. Shared footer

Use a deep black footer with:

- Brand: `JAY & CO`
- Tagline: `Timeless elegance, crafted for you. Your trusted local jeweler since 2003.`
- Location column.
- Hours column.
- Navigation column.
- Social icon placeholders or simple text links.
- Bottom copyright, Privacy Policy, and Terms of Service links.

## 11. Responsive requirements

- Desktop: content width around 1120–1200px.
- Tablet: two-column sections may remain side-by-side when readable.
- Mobile: stack all split sections, keep buttons full-width or comfortably tappable, and prevent horizontal overflow.
- Hero copy must remain readable over images at all widths.
- Cards should become one column on narrow screens.
- The ticker must remain clipped to the viewport and never cause horizontal page scrolling.
- Forms must use large enough controls for touch input.

## 12. Quality checklist before delivery

- Verify all five routes load.
- Verify `/story` is unchanged from the existing About/Our Story page.
- Verify all image URLs resolve.
- Verify no `Lifetime Care` ticker item remains.
- Verify no standalone quote band remains.
- Verify the Difference section contains `“We create emotions that last a lifetime.”`.
- Verify the Bespoke process contains exactly four points, including Delivery.
- Verify forms show validation and success states.
- Test desktop and mobile widths.
- Run a production build with no TypeScript or bundler errors.
- Check keyboard focus, Escape behavior for the mobile menu, and reduced-motion behavior.

---

# Asset inventory

All current image assets are optimized JPGs. In the current Manus-hosted implementation, use the hashed storage URLs below. If moving to ordinary HTML hosting, download/copy the matching files into an `assets/` folder and use the local filenames instead.

| Asset | Current storage URL | Local filename | Dimensions | Intended use |
|---|---|---|---:|---|
| Hero ring | `/manus-storage/hero_896f03d0.jpg` | `hero.jpg` | 2400 × 1339 | Home page hero background |
| Engagement rings | `/manus-storage/collection-engagement-rings_355f5845.jpg` | `collection-engagement-rings.jpg` | 1100 × 1365 | Collections card |
| Fine watches | `/manus-storage/collection-watches_a0911730.jpg` | `collection-watches.jpg` | 1100 × 1365 | Collections card |
| Custom designs | `/manus-storage/collection-custom-designs_ba8b0676.jpg` | `collection-custom-designs.jpg` | 1100 × 1365 | Collections card |
| Bespoke atelier | `/manus-storage/bespoke_d23d35e8.jpg` | `bespoke.jpg` | 1800 × 1344 | Home and Bespoke process sections |
| Our Story hero | `/manus-storage/story-hero_e3200397.jpg` | `story-hero.jpg` | 2200 × 1227 | **Locked `/story` About/Our Story page** |
| Our Story craftsmanship | `/manus-storage/story-craft_cca21cdf.jpg` | `story-craft.jpg` | 1600 × 1194 | **Locked `/story` About/Our Story page** |
| Journal background | `/manus-storage/journal_a82dc168.jpg` | `journal.jpg` | 2000 × 1493 | Journal signup band |
| Brand badge | `/manus-storage/badge_6342468a.jpg` | `badge.jpg` | 400 × 400 | Existing asset; the current JournalBand quote/badge block was removed |

## Asset package locations

The optimized source files are currently available at:

- `/home/ubuntu/web-optimized/`
- `/home/ubuntu/webdev-static-assets/`

Both directories contain the same nine JPG assets listed above. When deploying outside Manus, copy them into your project as `assets/*.jpg` and replace the `/manus-storage/...` URLs with relative paths such as `assets/hero.jpg`.

## Final implementation note

Preserve all existing user-approved edits while porting:

- No separate JournalBand quote/badge block.
- No standalone Pull-quote section.
- No separate four-step Bespoke strip.
- Four process points remain inside the Bespoke section, including Delivery.
- The `/story` About/Our Story page is locked and must not be changed.

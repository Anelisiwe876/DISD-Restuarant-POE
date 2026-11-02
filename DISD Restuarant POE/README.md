# Blackwood & Bean

A multi-page website for **Blackwood & Bean**, a fictional Johannesburg restaurant and coffee shop. Built for the WEDE5020 Portfolio of Evidence at The Independent Institute of Education (IIE).

- **Student:** [your name and student number]
- **Live site:** [paste your deployed link here]
- **Repository:** [paste your GitHub repository link here]

---

## 1. About the project

Blackwood & Bean began as a weekend coffee stall and grew into a full-service restaurant. The website lets visitors read the story, browse the menu, book a table, get an event estimate, find the restaurant on a map and send a message.

The project was built in three parts:

| Part | Focus | What was added |
|------|-------|----------------|
| 1 | HTML | Five semantic HTML5 pages, content, forms (markup only) |
| 2 | CSS | External stylesheet, design tokens, Flexbox/Grid layout, responsive design |
| 3 | JavaScript and SEO | Interactivity, validated forms, map, search, SEO, deployment |

## 2. Pages

| Page | File | Purpose |
|------|------|---------|
| Home | `index.html` | Welcome, customer favourites (tabs), reasons to visit |
| About | `about.html` | Our story, mission, team |
| Menu | `menu.html` | Full menu with search, filter and sort |
| Enquiry | `enquiry.html` | Table reservation, event estimate, general enquiry, FAQ |
| Contact | `contact.html` | Address, hours, interactive map, contact form |

## 3. Project structure

```
index.html  about.html  menu.html  enquiry.html  contact.html
style.css            All styling (Part 2 + Part 3 components)
script.js            All JavaScript (Part 3)
favicon.svg          Site icon
robots.txt           Crawler instructions
sitemap.xml          Page list for search engines
_headers             Security/caching headers (Netlify)
images/              Photos (descriptive file names)
vendor/leaflet/      Leaflet 1.9.4 map library (BSD-2-Clause licence included)
```

## 4. Part 3 features

### 4.1 JavaScript interactivity (`script.js`)

| Feature | Where | How it works |
|---------|-------|--------------|
| **Tabs** | Home, "Customer Favourites" | Tab buttons and cards are built from a JavaScript data object (dynamic content). Follows the WAI-ARIA tabs pattern: arrow keys, Home and End move between tabs. |
| **Search, filter and sort** | Menu | Live search across item names and descriptions, category filter, sort by price (low/high) or name, item counter, "no results" message and a Clear button. The controls only appear when JavaScript is available. |
| **Gallery with lightbox** | Every page with photos | Click (or press Enter on) a photo to open it larger in a native `<dialog>`. Previous/next buttons, arrow keys, swipe on phones, Escape or backdrop click to close, and focus returns to the photo you opened. |
| **Accordion** | Enquiry, FAQ | One answer open at a time, `aria-expanded` state, arrow-key navigation. Answers stay visible if JavaScript is off. |
| **Modals** | Enquiry and Contact | Results of the forms appear in an accessible modal dialog. |
| **Interactive map** | Contact | Leaflet map with OpenStreetMap tiles, a marker and popup, zoom controls and a "Re-centre map" button. Scroll-wheel zoom switches on after a click so the page can still scroll. |
| **Animations** | All pages | Sections fade in on scroll (CSS transitions plus `IntersectionObserver`), cards animate in, accordion and modal transitions. All motion is switched off for visitors with "reduce motion" set. |
| **DOM manipulation** | Throughout | Elements are created with `createElement` and `textContent` (never `innerHTML`), so visitor input can never be injected as markup. |

### 4.2 Forms and validation

**Enquiry page** (`enquiry.html`): three forms for enquiring about the restaurant's services.

| Form | Validated input | Response shown to the visitor |
|------|-----------------|-------------------------------|
| Reserve a table | Name, email, South African phone number, date (today to 90 days ahead), time (inside opening hours for that weekday), guests (1 to 20), notes (max 300 characters) | Availability (confirmed, limited or waiting list with quieter times), a booking reference and the deposit due (R50 per guest for 8 or more guests) |
| Book an event | Name, email, phone, event type, date (3 days to 12 months ahead), guests (10 to 150), details (10 to 500 characters) | An itemised **cost estimate**: rate per person for the event type, weekend surcharge, group discount, total and 30% deposit |
| General enquiry | Name, email, enquiry type, details (10 to 1000 characters) | A reply that depends on the enquiry type (for example catering pricing) and a reference number |

**Contact page** (`contact.html`): a general message to the organisation. It collects name, email, optional phone, message type and a full message. Once validated, the details are **compiled into an email** addressed to `hello@blackwoodandbean.co.za` (the recipient is set in `script.js` as `CONTACT_RECIPIENT`). The visitor checks a preview, then sends it from their own email app through a `mailto:` link, or copies the text.

How validation works:

- Each field declares its rule in HTML with `data-validate="..."`, and `script.js` holds one rule function per type (name, email, phone, select, guests, dates, time, text).
- Messages are specific ("Enter a valid South African number, e.g. 082 123 4567") and appear under the field.
- Fields are checked when the visitor leaves them, then re-checked live while they fix them. Invalid fields get a red border, valid ones a green border, and `aria-invalid` / `aria-describedby` tell screen readers.
- On submit, the first invalid field gets focus and a summary says how many fields need fixing.
- Dates and times are cross-checked: changing the date re-validates the time because opening hours differ per day.

AJAX submission: validated data is sent with `fetch()` (no page reload) to the form's `action` URL, with a loading state, a timeout, and a friendly error message if the request fails.

> **Note on the back end.** This is a front-end project with no server. The enquiry forms therefore carry `data-simulate="true"`, which makes the request run locally (a short delay, nothing leaves the browser) and the responses are calculated in the browser. To send real submissions, replace `https://formspree.io/f/your-form-id` in each form's `action` with a real endpoint and delete `data-simulate="true"`. Prices, deposits and availability are example business rules for this assignment.

### 4.3 Search engine optimisation

| Area | Implementation |
|------|----------------|
| Title tags | A unique, descriptive title on every page (under about 60 characters, keyword first) |
| Meta descriptions | A unique description of under 160 characters on every page |
| Meta keywords | A relevant keyword list per page (restaurant, coffee shop, Johannesburg, breakfast, book a table...) |
| Keyword research | Local and intent keywords ("restaurant Johannesburg", "book a table", "locally roasted coffee") are used naturally in headings, body copy and alt text |
| Headings | One `<h1>` (site name), then `<h2>` sections and `<h3>` items in order |
| Images | Descriptive file names (`breakfast-dish-1.jpg`), meaningful `alt` text, `width`/`height` attributes and `loading="lazy"` |
| URLs | Short, lower-case page names (`menu.html`, `enquiry.html`) |
| Internal linking | Calls to action and in-text links between pages (home to menu, about to reservations, FAQ to contact...) |
| Mobile-friendliness | Responsive layout, viewport meta tag, no horizontal scrolling at phone width |
| Local SEO | Full address and phone on the contact page, and `Restaurant` structured data (JSON-LD) with address and opening hours |
| Social | Open Graph tags (title, description, type, locale) for link previews |
| `robots.txt` | Allows crawling of the site, blocks the `vendor/` folder, links to the sitemap |
| `sitemap.xml` | Lists all five pages with priority and last-modified date |
| Off-page SEO plan | Backlinks from local food blogs and the Johannesburg tourism listings, a Google Business Profile, and sharing the menu and events on the Facebook, Instagram and TikTok pages linked in the footer |

### 4.4 Page speed

- Fonts load with `preconnect` and a `<link>` instead of a render-blocking CSS `@import`.
- `script.js` loads with `defer`, so it never blocks the page.
- Images below the fold use `loading="lazy"` and `decoding="async"`, and have `width`/`height` to prevent layout shift.
- Leaflet is bundled locally (no extra third-party script) and only loaded on the contact page.
- The `_headers` file sets long cache lifetimes for images, CSS and JavaScript on Netlify.

### 4.5 Security

- A **Content Security Policy** (meta tag on every page) allows scripts only from the site itself, so inline scripts and plugins are blocked, and it limits where forms can send data.
- External links use `rel="noopener noreferrer"`.
- Visitor input is only ever written with `textContent`, never `innerHTML` (prevents cross-site scripting).
- `_headers` adds `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and HSTS on Netlify. (GitHub Pages ignores this file but still serves the site over HTTPS.)
- Leaflet is hosted in the repository rather than loaded from a third-party CDN, so a CDN problem cannot affect the site.

### 4.6 Accessibility

Labels on every field, visible focus outlines, keyboard support for tabs, accordion, lightbox and dialogs, `aria-live` regions for search results and form status, `aria-current="page"` in the navigation, colour contrast for error messages, and `prefers-reduced-motion` support.

## 5. Running the site locally

No build step is needed. Open `index.html` in a browser, or serve the folder (for example with the VS Code "Live Server" extension). The map needs an internet connection to download the map tiles.

## 6. Deployment

The site is static, so any free host works.

- **GitHub Pages:** repository **Settings > Pages > Deploy from a branch > `main` / root**.
- **Netlify:** drag the project folder onto the Netlify dashboard, or connect the GitHub repository (no build command, publish directory `.`).

After deploying, replace `https://YOUR-USERNAME.github.io/blackwood-and-bean/` in `sitemap.xml` and `robots.txt` with the real address.

## 7. Changelog

All notable changes, newest first. Dates are in `YYYY-MM-DD` format.

### Part 3: Enhancing Functionality and SEO (2026-10-28)

**Added: JavaScript features**

- `script.js` (new): one deferred script used by all pages. Each feature only runs when the elements it needs exist on the page.
- Home: "Customer Favourites" section with accessible tabs. The cards are rendered from a JavaScript data object, so the content is dynamic. `index.html` got the `#fav-tabs` and `#fav-grid` containers (in the previously empty `#highlights` section) and two call-to-action buttons in the hero.
- Menu: search box, category filter, sort control, item counter and "no results" message (`#menu-tools` in `menu.html`).
- All pages: lightbox gallery. Photos were given `data-lightbox` attributes; groups are formed per section.
- Enquiry: FAQ accordion (new `#faq` section) with five questions.
- Contact: new "Find Us on the Map" section with a Leaflet map, marker, popup and re-centre button. Leaflet 1.9.4 is stored in `vendor/leaflet/` instead of loading from a CDN.
- All pages: scroll-reveal animations, card and modal transitions (CSS plus `IntersectionObserver`), with `prefers-reduced-motion` support.

**Added: forms and validation**

- `enquiry.html`: all three forms now have `action`/`method` attributes, `required`, `min`/`max`/`minlength`/`maxlength`, `autocomplete`, `inputmode` and placeholders, and `data-validate` rules. Event-type and enquiry-type selects now start on a "Choose..." option so a deliberate choice is required. The event form's guest minimum is 10 and maximum 150, and its button now reads "Get Event Estimate".
- `contact.html`: the form was extended to request basic contact information (name, email, optional phone), the message type (new select) and a full message. IDs changed from `name`/`email`/`message` to `contactName`/`contactEmail`/`contactMessage`, and `contactPhone` and `contactType` were added. The button now reads "Prepare Email".
- `script.js`: client-side validation with clear per-field error messages, live re-validation, a summary status line and focus on the first error. Dates, times and guest counts are cross-checked against the opening hours and booking rules.
- `script.js`: AJAX submission with `fetch()` (loading state, timeout, error handling) and responses built from the visitor's input: availability and deposit for reservations, an itemised price estimate for events and a type-specific reply for general enquiries.
- `script.js`: contact form output compiled into an email (subject, body and signature details) addressed to `hello@blackwoodandbean.co.za`, with a preview, an "Open in my email app" link and a "Copy email text" button.

**Added: SEO**

- All pages: unique title tags, meta descriptions, meta keywords, author, robots and theme-colour tags, and Open Graph tags.
- `index.html`: `Restaurant` structured data (JSON-LD) with address and opening hours (local SEO).
- All images renamed with descriptive file names and given descriptive `alt` text, `width`/`height`, `loading="lazy"` and `decoding="async"` (rename list in section 8).
- New `robots.txt`, `sitemap.xml` and `favicon.svg`.
- Extra internal links between pages (hero buttons, About, Why Visit Us, Enquiry intro, FAQ).

**Added: security and performance**

- Content Security Policy meta tag on every page; `rel="noopener noreferrer"` on all external links; `_headers` file with security and caching headers.
- Google Fonts moved from a CSS `@import` to `<link>` tags with `preconnect` (faster first paint). `script.js` is loaded with `defer`.

**Changed: corrections to earlier work**

- `index.html`: fixed broken markup in the hero. The `<div class="hero-content">` was never closed and the image wrapper had a malformed `style` attribute (`flex-wrap:wrap" margin-top:20px;"`). The wrapper was removed because the CSS already lays the images out with Flexbox.
- `contact.html`: added the missing closing `</head>` tag. Replaced the invalid email address `hello@blackwood&bean.co.za` (an ampersand cannot appear in an email domain) with `hello@blackwoodandbean.co.za` and made the email address and phone number clickable links.
- All pages: `&` characters in text, titles and alt text written as `&amp;`; spacing in `style = "..."` attributes tidied; footer `target="_blank"` links given `rel="noopener noreferrer"`; navigation links given `aria-label` and `aria-current="page"`.
- `style.css`: the sticky header was about 240px tall (the navigation `<ul>` was stacked vertically and the logo was forced to 300 x 200px). The navigation list is now a flex row, the logo is 64px high (48px on phones), and on phones the header scrolls away instead of staying fixed. This also fixed 71px of horizontal scrolling on phones.
- `style.css`: removed the rule that hid `#highlights` (the section now holds the favourites tabs); scoped the Part 2 image rules so they do not resize Leaflet's map tiles and marker; added `[hidden] { display: none !important; }` and `scroll-margin-top` so menu anchor links do not hide under the header.

**Added: styling (`style.css`, new section 14)**

Buttons, tabs, favourite cards, menu tools, lightbox, accordion, validation states, result modal, map, responsive adjustments for phones and a reduced-motion rule.

### Corrections after Part 2 feedback

> **Add your lecturer's Part 2 feedback here.** Write one entry for each point of feedback, saying what the feedback was, which file(s) you changed and what you did. For example: "Feedback: ... / Change: ... in `style.css` (selector `...`)".

### Part 2: CSS styling and responsive design

> **Paste your existing Part 2 changelog entries here.**

### Part 1: HTML

> **Paste your existing Part 1 changelog entries here.**

## 8. Image file names

| Original file name | New file name |
|--------------------|---------------|
| images (10).jpg | blackwood-and-bean-logo.jpg |
| images (9).jpg | restaurant-hero-1.jpg |
| images (14).jpg | restaurant-hero-2.jpg |
| images (20).jpg | restaurant-hero-3.jpg |
| images (22).jpg | menu-banner.jpg |
| images (16).jpg | breakfast-dish-1.jpg |
| images (44).jpg | breakfast-dish-2.jpg |
| images (23).jpg | breakfast-dish-3.jpg |
| images (25).jpg | lunch-dish-1.jpg |
| images (26).jpg | lunch-dish-2.jpg |
| images (27).jpg | lunch-dish-3.jpg |
| images (28).jpg | dinner-dish-1.jpg |
| images (29).jpg | dinner-dish-2.jpg |
| images (45).jpg | dinner-dish-3.jpg |
| images (30).jpg | coffee-drink-1.jpg |
| images (31).jpg | coffee-drink-2.jpg |
| images (42).jpg | coffee-drink-3.jpg |
| images (32).jpg | cold-drink-1.jpg |
| images (33).jpg | cold-drink-2.jpg |
| images (34).jpg | cold-drink-3.jpg |
| images (8).jpg | restaurant-interior-1.jpg |
| images (37).jpg | restaurant-interior-2.jpg |
| images (38).jpg | restaurant-interior-3.jpg |
| images (2).jpg | table-setting-1.jpg |
| images (18).jpg | table-setting-2.jpg |
| images (17).jpg | table-setting-3.jpg |
| images (3).jpg | event-venue-1.jpg |
| images (35).jpg | event-venue-2.jpg |
| images (1).jpg | event-venue-3.jpg |
| images (12).jpg | our-story-photo.jpg |
| images (39).jpg | team-photo-1.jpg |
| images (40).jpg | team-photo-2.jpg |
| images (36).jpg | lerato-founder-head-chef.jpg |
| images (41).jpg | sam-head-barista.jpg |

## 9. References

Agafonkin, V. (2023) *Leaflet: an open-source JavaScript library for interactive maps* (Version 1.9.4). Available at: https://leafletjs.com (Accessed: 28 October 2026).

Formspree (n.d.) *Formspree help*. Available at: https://help.formspree.io (Accessed: 28 October 2026).

GitHub (n.d.) *GitHub Pages documentation*. Available at: https://docs.github.com/en/pages (Accessed: 28 October 2026).

Google (n.d.) *Build and submit a sitemap*. Google Search Central. Available at: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap (Accessed: 28 October 2026).

Google (n.d.) *Introduction to robots.txt*. Google Search Central. Available at: https://developers.google.com/search/docs/crawling-indexing/robots/intro (Accessed: 28 October 2026).

Google (n.d.) *SEO starter guide*. Google Search Central. Available at: https://developers.google.com/search/docs/fundamentals/seo-starter-guide (Accessed: 28 October 2026).

Google (n.d.) *Google Fonts: Fraunces and Karla*. Available at: https://fonts.google.com (Accessed: 28 October 2026).

Mozilla (n.d.) *Client-side form validation*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation (Accessed: 28 October 2026).

Mozilla (n.d.) *Content Security Policy (CSP)*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP (Accessed: 28 October 2026).

Mozilla (n.d.) *Intersection Observer API*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API (Accessed: 28 October 2026).

Mozilla (n.d.) *The Dialog element*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog (Accessed: 28 October 2026).

Mozilla (n.d.) *Using the Fetch API*. MDN Web Docs. Available at: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch (Accessed: 28 October 2026).

Netlify (n.d.) *Netlify docs*. Available at: https://docs.netlify.com (Accessed: 28 October 2026).

OpenStreetMap contributors (n.d.) *OpenStreetMap copyright and licence*. Available at: https://www.openstreetmap.org/copyright (Accessed: 28 October 2026).

Schema.org (n.d.) *Restaurant*. Available at: https://schema.org/Restaurant (Accessed: 28 October 2026).

Sitemaps.org (n.d.) *Sitemaps XML format*. Available at: https://www.sitemaps.org/protocol.html (Accessed: 28 October 2026).

World Wide Web Consortium (W3C) (n.d.) *Accordion pattern*. WAI-ARIA Authoring Practices Guide. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/accordion/ (Accessed: 28 October 2026).

World Wide Web Consortium (W3C) (n.d.) *Tabs pattern*. WAI-ARIA Authoring Practices Guide. Available at: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ (Accessed: 28 October 2026).

> Add the references from Parts 1 and 2 to this list and keep it in alphabetical order.

## 10. Licences

Leaflet is licensed under the BSD 2-Clause licence (see `vendor/leaflet/LICENSE`). Map data © OpenStreetMap contributors. Fonts: Fraunces and Karla (SIL Open Font Licence, via Google Fonts).

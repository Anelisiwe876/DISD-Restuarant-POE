# Setup steps for Part 3 (delete this file before you submit if you like)

Do these in order. Steps 1 to 3 take about 15 minutes.

## 1. Put your images in place and rename them

1. Copy your original `images` folder (the one with `images (10).jpg` and so on) into this project folder.
2. Open PowerShell in the project folder and preview, then run, the rename script:

   ```
   powershell -ExecutionPolicy Bypass -File .\rename-images.ps1 -WhatIf
   powershell -ExecutionPolicy Bypass -File .\rename-images.ps1
   ```

3. **Check every photo against its alt text.** I couldn't see your photos, so the file names and `alt` text describe what each section shows (for example "breakfast dish"). Open each page and check that each `alt` describes the real picture. Search for `alt="` in VS Code to edit them. The `alt` text is part of your SEO marks.

## 2. Fill in the placeholders

- `sitemap.xml` and `robots.txt`: replace `https://YOUR-USERNAME.github.io/blackwood-and-bean/` with your real site address once you know it. In PowerShell:

  ```
  (Get-Content sitemap.xml) -replace 'https://YOUR-USERNAME.github.io/blackwood-and-bean/','https://yourname.github.io/yourrepo/' | Set-Content sitemap.xml
  (Get-Content robots.txt)  -replace 'https://YOUR-USERNAME.github.io/blackwood-and-bean/','https://yourname.github.io/yourrepo/' | Set-Content robots.txt
  ```

- `README.md`: add your name, student number, live link and repository link. Paste your **Part 1 and Part 2 changelog entries** and your **Part 2 feedback corrections** into the marked places, and add your earlier references.
- Contact email: the recipient is `hello@blackwoodandbean.co.za` (`CONTACT_RECIPIENT` at the top of `script.js` and in `contact.html`). Change it to your own address if you want to test the email.

## 3. Check the content I couldn't confirm

- The About page says the founder is **Lerato Mokoena**, but the team card says **Lerato Smith**. I left both as they were. Pick one surname.
- Business rules on the Enquiry page (R50 per guest deposit for 8 or more, 3 days' notice for events, event prices per person, 90-day booking window) are examples I made up so the forms have something to calculate. Change them in `script.js` (`EVENT_RATES`, `reservationResult`, `eventResult`) and in the FAQ if you want different numbers.

## 4. Commit regularly with descriptive messages

The rubric gives marks for multiple, descriptive commits. A suggested order (commit as you go, ideally over more than one sitting):

| # | Files | Commit message |
|---|-------|----------------|
| 1 | `vendor/`, `favicon.svg` | Add Leaflet 1.9.4 map library and site favicon |
| 2 | `robots.txt`, `sitemap.xml`, `_headers` | Add robots.txt, sitemap.xml and security/caching headers for SEO |
| 3 | `style.css` | Add Part 3 styles (tabs, lightbox, modal, accordion, validation, map) and fix header and mobile layout |
| 4 | `script.js` | Add JavaScript: tabs, menu search/filter/sort, lightbox, accordion, map, form validation and AJAX |
| 5 | `index.html` | Fix broken hero markup, add Customer Favourites tabs, SEO tags and structured data |
| 6 | `menu.html` | Add menu search, filter and sort controls, descriptive image names and alt text |
| 7 | `enquiry.html` | Add validated reservation, event and enquiry forms plus FAQ accordion |
| 8 | `contact.html` | Add map, expanded contact form and compiled email; fix missing head tag and invalid email |
| 9 | `about.html` | Add SEO tags, alt text and internal links |
| 10 | `images/` | Rename images to descriptive file names |
| 11 | `README.md` | Update README with Part 3 changelog, feedback corrections and references |

Then push to GitHub (`git push origin main`).

## 5. Deploy and test

1. Deploy with GitHub Pages (Settings > Pages > Deploy from a branch > `main` / root) or Netlify (drag the folder onto the dashboard).
2. Put the live link in the README and submit your repository link on the LMS.
3. On the live site, check every page for errors. In particular:
   - the map shows tiles and the marker on the Contact page,
   - all images load (file names are case-sensitive online),
   - the forms show errors and results,
   - the menu search, lightbox, tabs and FAQ work,
   - the site works on your phone.
4. Optional: run Lighthouse in Chrome DevTools (Performance, Accessibility, SEO) and note the scores in the README.

## 6. Going further (optional)

To send real form submissions instead of the simulated response, create a free Formspree form, paste its URL into the `action` of each enquiry form and delete `data-simulate="true"`.

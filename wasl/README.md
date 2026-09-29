# Wasl website

The overview, Privacy Policy, and Terms of Use share `assets/wasl.css` and `assets/wasl.js`. They are static pages served by GitHub Pages; no server or dependency installation is required.

## Editing

- Edit legal wording in `content/en.txt`, `content/ar.txt`, and `content/de.txt`. Each file contains the Privacy Policy followed by the Terms of Use. Keep numbered headings and standalone bullet markers (`•`) in the existing format.
- Update all three languages together, including both last-updated dates.
- Overview copy and shared page markup are in `scripts/build-wasl.mjs` at the repository root.
- Run `node scripts/build-wasl.mjs` from the repository root and commit the generated HTML alongside source changes. GitHub Pages serves the committed HTML directly.

The full English text is included in the initial HTML for search engines and visitors without JavaScript. JavaScript enables Arabic/German switching, theme preferences, mobile contents behavior, and printing. Arabic uses right-to-left layout. Existing `preferredLang` and `preferredTheme` browser preferences remain compatible with the rest of the website.

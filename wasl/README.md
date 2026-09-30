# Wasl website

The overview, Privacy Policy, and Terms of Use share `assets/wasl.css` and `assets/wasl.js`. They are static pages served by GitHub Pages; no server or dependency installation is required.

The visual design follows the Wasl app references: amber accents, cream/white surfaces, dark navy text, rounded Material 3 Expressive containers, pastel icon tiles, and an Islamic-inspired green and gold overview hero with subtle geometry and a compact arch frame for the logo. Mobile uses a compact introduction and full-width feature cards. All text uses self-hosted Almarai (400, 700, 800), sourced from [Google Fonts](https://github.com/google/fonts/tree/main/ofl/almarai). Font files and the SIL Open Font License are bundled in `assets/fonts/`. No visitor request to a third-party font service is required. Shape transitions respect reduced-motion preferences.

## Editing

- Edit legal wording in `content/en.txt`, `content/ar.txt`, and `content/de.txt`. Each file contains the Privacy Policy followed by the Terms of Use. Keep numbered headings and standalone bullet markers (`•`) in the existing format.
- Update all three languages together, including both last-updated dates.
- Overview copy and shared page markup are in `scripts/build-wasl.mjs` at the repository root.
- Run `node scripts/build-wasl.mjs` from the repository root and commit the generated HTML alongside source changes. GitHub Pages serves the committed HTML directly.

The full English text is included in the initial HTML for search engines and visitors without JavaScript. JavaScript enables Arabic/German switching, theme preferences, mobile contents behavior, and printing. Arabic uses right-to-left layout. Existing `preferredLang` and `preferredTheme` browser preferences remain compatible with the rest of the website.

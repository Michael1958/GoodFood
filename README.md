# GoodFood v1.5, welcome-screen fix build 1.5.1

This package uses the previously published GoodFood application as its baseline and preserves:

- English and Greek interfaces
- barcode and QR scanning
- health-score analytics
- Nutri-Score, NOVA and additive analysis
- nutrition analytics and real-life quantities
- EU package-claim checks
- comparison table and price comparison
- healthier alternatives
- history and read-aloud
- manual scoring and local products
- IndexedDB offline product storage
- database import and export

## Welcome-screen correction

Every full application launch now explicitly starts with:

```javascript
const first = "welcome";
stack = ["welcome"];
history.replaceState({s:"welcome"}, "");
show("welcome");
```

The service worker also uses network-first navigation with `cache: no-store`. This prevents an older cached `index.html` from deciding that the initial screen should be the scanner.

## GitHub Pages deployment

1. Extract the ZIP.
2. Upload all six files to the repository root.
3. Replace the existing files when GitHub asks.
4. Commit with `Release GoodFood v1.5 welcome fix`.
5. In Settings, Pages, use `Deploy from a branch`, branch `main`, folder `/(root)`.
6. Open the normal GitHub Pages address in Chrome.
7. The first page must be the Welcome screen.

Files:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icon.svg`
- `.nojekyll`
- `README.md`

The public version remains v1.5. The internal cache build is `1.5.1-welcome-fix` so phones discard the older application cache.

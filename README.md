# Dewan Nafiul Islam Noor

## Visual update
- Default background is now white / soft pastel, not black.
- Display font: Bricolage Grotesque.
- Body font: Plus Jakarta Sans.
- Coding font: IBM Plex Mono.
- Homepage shows the full name: Dewan Nafiul Islam Noor.
- Stronger motion: boot intro, animated name reveal, moving grid and gradient blobs, live typing, floating portrait/code card, marquee, counters, scroll reveals, timeline pulse, canvas network and hover interactions.
- All existing multi-page navigation and connected project/publication detail pages are preserved.

# Dewan Noor — PORTFOLIO

A multi-page, GitHub Pages-ready portfolio for **Dewan Nafiul Islam Noor**.

## Design direction
- Creative developer + academic researcher
- Space Grotesk display typography
- JetBrains Mono coding micro-typography
- Manrope body text
- Default dark developer theme + light mode
- Animated startup terminal, live typing, neural canvas, counters, reveal/stagger effects, hover tilt and custom cursor
- Command palette: **Ctrl/Cmd + K**
- Interactive terminal on the homepage
- Connected project and publication detail pages
- Git-style academic/experience timeline

## Pages
- `index.html` — homepage
- `research.html` — research direction + thesis + connected publications
- `publications.html` — filterable publication index
- `projects.html` — filterable project index
- `project.html?id=...` — dynamic project case-study page
- `publication.html?id=...` — dynamic publication detail page
- `experience.html` — Git-style experience / education / skills
- `achievements.html` — achievements, leadership and gallery
- `404.html` — custom GitHub Pages fallback

## Content editing
Most personal/research/project content is centralized in `data.js`.

Main design/animation files:
- `styles.css`
- `app.js`

Profile image and gallery assets are inside `assets/images/`.
CV is at `assets/cv/Dewan_Nafiul_Islam_Noor_CV.pdf`.


## GitHub Pages deployment
1. Extract the ZIP.
2. Upload **all files and folders inside it** to the root of a GitHub repository.
3. Open repository **Settings → Pages**.
4. Under Build and deployment choose **Deploy from a branch**.
5. Select `main` and `/ (root)`.
6. Save.

For a root user site, name the repository `YOUR-USERNAME.github.io`.

No npm, build step, framework or server is required.

## Responsive / mobile support
This build includes dedicated breakpoints for desktop, tablet, mobile and very small phones. Navigation, command palette, terminal, cards, publications, gallery, detail pages and touch interactions are optimized for GitHub Pages hosting. Safe-area insets are supported for modern phones, and all local assets use relative paths so the site works on both `username.github.io` and repository-based GitHub Pages URLs.

Recommended quick checks after publishing:
- Desktop: 1440px / 1280px widths
- Tablet: 768px width
- Mobile: 390px and 360px widths
- Test both portrait and landscape orientation



- Fixed STACK.JSON / Technical range desktop overflow.
- Experience and Education are now separate routes (`experience.html`, `education.html`).
- Added stronger visible scroll/card/terminal motion while keeping reduced-motion support.
- Updated command palette and terminal commands to include Education.

- Social profiles now render with recognizable icons and animated hover/click feedback.
- Desktop homepage uses smart section-by-section wheel scrolling with an animated section rail.
- Tall sections remain naturally scrollable so content is never skipped.
- Mobile/tablet keep native touch scrolling for usability.
- Asset query version bumped to v8 to avoid stale GitHub Pages/browser cache.

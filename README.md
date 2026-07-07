# Rockhopper1776 Minimal GitHub Pages Site

This is a simple static website for GitHub Pages.

## Files

- `index.html` — homepage
- `azerothcore.html` — AzerothCore mods and addons page
- `historical-writings.html` — historical writings page
- `about.html` — About page
- `styles.css` — shared design styles
- `assets/hero-workshop.png` — homepage hero image

## Maintaining the site

1. Edit the HTML page for the section you want to update.
2. Keep shared visual changes in `styles.css`.
3. Add local images or downloads under `assets/`.
4. Commit and push the files. GitHub Pages should update the site automatically.

The Peloponnesian War Route Finder menu item currently links to:

`https://www.rockhopper1776.com/peloponnesian-war-route-finder/`

If you later move the route finder into the same repository, change that menu link to a relative path such as:

`peloponnesian-war-route-finder/index.html`

## Adding content

- Add new writing links by copying one of the `<article>` blocks in `historical-writings.html`.
- Add new project summaries by copying one of the `.project-card` blocks in `index.html`.
- Keep shared visual changes in `styles.css` so the pages stay consistent.

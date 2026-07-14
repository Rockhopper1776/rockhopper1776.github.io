# Rockhopper 1776

Rockhopper 1776 is a Jekyll-powered GitHub Pages site for historical writing, boardgame tools,
and hobbyist software projects.

## Site structure

- `index.html` — homepage and featured work
- `articles.html` — historical writing index at `/articles/`
- `boardgames.html` — boardgame tools and projects at `/boardgames/`
- `azerothcore.html` — AzerothCore modules and notes
- `about.html` — site and author introduction at `/about/`
- `the-battle-of-quiberon-bay.html` — long-form historical article
- `_layouts/default.html` — shared header, navigation, page shell, and footer
- `styles.css` — shared responsive styles
- `404.html` — useful fallback page for broken or outdated links

`historical-writings.html` is retained only as a redirect so old bookmarks and search results reach
the current `/articles/` page.

## Adding a project or article

1. Copy a `.content-list-item` block on the appropriate section page.
2. Add the new page with `layout: default` and a matching `section` value in its front matter.
3. Use root-relative Jekyll links, for example `{{ '/articles/' | relative_url }}`.
4. Keep site-wide presentation changes in `styles.css` and shared navigation in `_layouts/default.html`.

The accepted `section` values are `azerothcore`, `boardgames`, `writings`, and `about`. They control
the active state in the main navigation.

## Publishing

Changes are published by GitHub Pages only after they are committed and pushed to the configured
publishing branch. Review the local build and changed-file diff before pushing.

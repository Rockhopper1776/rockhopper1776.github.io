# Rockhopper 1776

Rockhopper 1776 is a Jekyll-powered GitHub Pages site for historical writing, boardgame tools,
and hobbyist software projects.

## Site structure

- `index.html` — homepage and featured work
- `articles.html` — historical writing index at `/articles/`
- `boardgames.html` — boardgame tools and projects at `/boardgames/`
- `azerothcore.html` — AzerothCore modules and notes
- `about.html` — site and author introduction at `/about/`
- `contact.html` — protected website contact form at `/contact/`
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

The accepted `section` values are `azerothcore`, `boardgames`, `writings`, `about`, and `contact`. They control
the active state in the main navigation.

## Contact form setup

The Contact page stays inactive until both public identifiers under `contact_form` in `_config.yml`
are populated. Create a Basin Free form that delivers to the dedicated site mailbox, then:

1. Send Basin notification emails to `contact@rockhopper1776.com` and verify that address.
2. Restrict the Basin form to `rockhopper1776.com`.
3. Create a Cloudflare Turnstile widget allowing `rockhopper1776.com` and `www.rockhopper1776.com`.
4. Store the Turnstile secret key only in Basin and enable Turnstile protection there.
5. Put the Basin endpoint URL and public Turnstile site key in `_config.yml`.
6. Leave autoresponses disabled and do not enable file uploads.
7. Limit Basin submission retention to 30 days.

Never commit a Turnstile secret key or Basin account credential.

## Publishing

Changes are published by GitHub Pages only after they are committed and pushed to the configured
publishing branch. Review the local build and changed-file diff before pushing.

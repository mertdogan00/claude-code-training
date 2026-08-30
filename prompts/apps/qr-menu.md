# Mega prompt · QR Menu (cafe / restaurant)

One shot, fully autonomous. The menu behind the QR code on the table: simple on the surface,
a real business with real customers underneath. Paste the block below AS-IS into a fresh
Claude Code session.

---

> Work as a full product team and drive this job from start to finish WITHOUT stopping to ask
> for my confirmation at any point. First print a short numbered plan (max 6 lines), then
> immediately execute it. Report as you go: product manager (scope), backend, frontend, data
> engineer, then QA walking the acceptance checklist item by item.
>
> THE JOB: a two-faced "QR Menü" application for a cafe.
>
> CUSTOMER FACE (`/`), phone-first:
> 1. Category tabs: coffee, dessert, snacks. Switching tabs filters instantly, no reload.
> 2. Product cards: name, one-line description, price with the ₺ symbol.
> 3. Sold-out products render faded with a "tükendi" badge and cannot be missed.
> 4. A slim header: cafe name and a wifi password line.
>
> BUSINESS FACE (`/panel`):
> 1. Single-password login (start with the constant "kahve123"; put it in ONE clearly marked
>    place in the code with a comment saying how to change it). Wrong password gets a
>    Turkish error; a successful login survives page refreshes via a session cookie.
> 2. Product management: add, edit, mark sold-out / back in stock, change price, delete.
> 3. Category management: add a new category; it appears as a tab on the customer face.
> 4. Every change is visible on the customer face on its next load, with no restart.
>
> TECHNICAL FRAME, non-negotiable:
> - Node built-in modules ONLY (`node:http`, `node:fs`, `node:sqlite`); no npm packages.
> - Files exactly: `server.js` · `lib/db.js` · `public/` (customer face) · `public/panel/`
>   (business face). JSON API under `/api/`; panel routes check the session server-side.
> - `package.json` with `"dev": "node --watch server.js"`; port 3000.
> - Seed 8 sample products across the three categories on first run.
>
> LOOK: customer face is phone-first (thumb-friendly cards, readable prices); dark theme
> (background #16150f, accent #d97757) on both faces. All user-facing UI text in TURKISH;
> code and comments in English.
>
> QUALITY BAR: price is a positive number (validated both sides); product names trimmed and
> required; the panel never leaks behind the login (check server-side, not just a hidden
> button); data survives a restart.
>
> ACCEPTANCE CHECKLIST, verify each yourself before declaring done:
> 1. `npm run dev` starts clean; `/` shows 8 seeded products in 3 tabs.
> 2. Marking a product sold-out in the panel makes it faded on the customer face on the next
>    load.
> 3. Adding a product through the panel takes under 15 seconds of human work and appears in
>    the right tab.
> 4. Opening `/panel` without logging in never shows management UI, and a direct curl to a
>    panel API without the session cookie is rejected.
> 5. Restarting the server keeps every product and category.
>
> DEFINITION OF DONE: checklist all green. Close by printing the start command and the
> sold-out demo sequence (panel click → customer refresh).

---

**Why this prompt works:** the two faces are specified separately, the auth rule says
"server-side, not a hidden button", and the demo moment (sold-out flip) is pre-scripted in
the acceptance list.

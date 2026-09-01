# Mega prompt · QR Menü (a phone-first restaurant menu, built by a team)

One shot, fully autonomous, and Claude Code does not build it alone: it forms a team of
sub-agents and runs them in parallel. Works in an empty folder, no data file needed. Paste the
block below AS-IS into a fresh Claude Code session.

---

> **You are the ORCHESTRATOR.** Drive this job from start to finish WITHOUT stopping for my
> confirmation at any point. First print a numbered plan (max 8 lines) so the room can follow
> on screen, then execute it. This runs live in front of an audience: narrate every step.
>
> STEP 1, PUBLISH THE CONTRACT before anyone writes a line: the file list, the port, the API
> routes with their JSON shapes, the item schema. Print it, then write it into `BUILD-LOG.md`.
>
> STEP 2, FORM THE TEAM, FOR REAL. Use your Agent tool to spawn three LEAD sub-agents and run
> them in parallel wherever their work is independent:
> - **Backend Lead**: `server.js`, schema and seed, public and admin endpoints, QR generation.
> - **Frontend Lead**: `public/`, both faces: the phone-first customer menu and the admin panel.
> - **QA Lead**: turns the checklist below into real checks, starts the server, verifies every
>   item in a browser or with curl, reports pass or fail per item and fixes what fails.
> A lead may spawn a worker or two. You do NOT write the app: you integrate and run QA last.
>
> THE JOB: build "QR Menü", the menu behind the QR code on a restaurant table, with two faces:
> a phone-first customer menu with photos, allergen tags, search and an order note the customer
> shows the waiter, and an admin panel behind one password where the owner edits the menu,
> flips items to sold out and prints a sheet of real QR table cards.
>
> THE STACK, non-negotiable, no build step and no framework:
> - ONE folder, created here, holding exactly: `package.json`, `server.js`, `public/`
>   (`index.html`, `admin.html`, `style.css`, `app.js`), `data.sqlite`, and the two .md files.
> - `package.json` carries `"type": "module"` and a `start` script running `node server.js`.
> - `server.js`: Node 24, Express from npm, and the BUILT-IN `node:sqlite` module
>   (`import { DatabaseSync } from 'node:sqlite'`). Nothing native compiles on this machine.
> - `public/` is plain HTML, CSS and JavaScript: no TypeScript, no bundler, no CSS framework.
> - Real QR codes come from the `qrcode` npm package, rendered server-side as data URLs.
> - `data.sqlite` is created on FIRST START and seeded with 4 categories and 16 items with
>   prices, descriptions and allergens; deleting it resets the app.
> - The only two commands anyone ever types: `npm install`, then `node server.js`, serving
>   http://localhost:3000. `PORT=3001 node server.js` must override the port.
> - Auth is ONE admin password and nothing more: a single clearly marked constant at the top of
>   `server.js` with a comment on how to change it, a signed session cookie, and EVERY admin
>   route checked on the server, never only in the UI.
> - All user-facing UI text in TURKISH; code, comments, `README.md` and `BUILD-LOG.md` in
>   English.
>
> FEATURES, all required:
> 1. Customer face at `/`, designed at 390px first: a sticky category rail, item cards with a
>    deterministic gradient placeholder image, price, description and preparation time.
> 2. Allergen and diet tags (vegan, vejetaryen, glutensiz, laktozsuz, acı) as icons, filter
>    chips that narrow the menu, an instant search over name and description.
> 3. Order note: items with a quantity in a panel the customer shows the waiter, with a table
>    number, a running total and a copy button; it survives a reload.
> 4. Admin at `/admin` behind the password login, with full create, edit and delete for
>    categories and items, and an availability toggle that instantly marks an item "tükendi".
> 5. Ordering: move a category or an item up and down, the order persisted and reflected on
>    the customer face.
> 6. Real QR codes with the `qrcode` package: one per table pointing at `/?masa=N`, plus a
>    printable A4 sheet of table cards at `/admin/qr` with cut lines.
> 7. Live refresh: the customer face picks up an admin change within 5 seconds, with a
>    discreet "menü güncellendi" toast.
> 8. A warm restaurant look, one accent color, ₺ prices with Turkish separators.
>
> ACCEPTANCE CHECKLIST, the QA Lead verifies each ON SCREEN or with curl and reports pass/fail:
> 1. `npm install` then `node server.js` start clean; http://localhost:3000 shows 4 categories
>    and 16 seeded items with no console errors.
> 2. `curl -s -X POST localhost:3000/api/admin/items` with no session cookie returns HTTP 401,
>    and `/admin` without a login shows only the login form.
> 3. Flipping an item to sold out in an admin tab shows the badge in a customer tab in 5 s.
> 4. `/admin/qr` renders table cards; the code for table 3 opens `/?masa=3`, note shows table 3.
> 5. Adding two items to the order note and reloading the page keeps them.
> 6. Restarting the server keeps every category, item and availability flag, and at 390px width
>    the customer face has no sideways overflow.
>
> DEFINITION OF DONE: every checklist item green; `README.md` with the product name, the two
> commands, the admin password location, the features and the team; `BUILD-LOG.md` with the
> plan, the team, the contract, the tests QA ran and every bug fixed. Close with a five-line
> summary of what each team member built.

---

**Stage note:** while the team works, ask the room: "one app, two completely different users,
so should this be one project or two?" When it finishes, run `npm install`, then
`node server.js`, open http://localhost:3000, put the admin panel on the projector and let the
room scan a table QR from their own phones, then flip an item to sold out in front of everyone.
Fallback if the build stalls: `cd showcase/qr-menu` and `node server.js`.

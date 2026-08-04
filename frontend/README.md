# EventOS — Frontend

A light-themed, glassmorphic event management UI: login → register → role
selection → an organizer dashboard built as a single-page app.

## Running it locally

The dashboard loads its sections with `fetch()`, which browsers block on a
plain double-clicked `file://` page (CORS). **Serve the folder over HTTP**
during development:

```bash
# any one of these works
npx serve .
python3 -m http.server 8080
# VS Code's "Live Server" extension also works
```

Then open `http://localhost:<port>/index.html`.

The login, register and role-selection pages don't use `fetch()`, so they
technically work even opened directly — but start from a server so the
whole flow (including the dashboard) works consistently.

## Flow

1. **`index.html`** — Login. Submitting (with valid input) goes to the dashboard.
2. **`register.html`** — Register. Validates the password confirmation, then
   continues to role selection.
3. **`role-selection.html`** — Pick a role. Choosing **Organizer** and
   continuing opens the dashboard. Volunteer/Attendee show a "coming soon"
   note, since only the organizer experience exists so far.
4. **`dashboard.html`** — The SPA shell (sidebar + header, fixed) with six
   sections loaded on demand from `sections/*.html`: Dashboard, Events,
   Volunteers, Attendance, Analytics, Settings.

There's no backend yet (by design, per the current request). Buttons that
would need one — Create Event, Assign Volunteer, Save Changes, etc. — show a
small toast explaining that, instead of doing nothing or throwing an error.
Login/Register/Logout do perform real client-side navigation so the flow is
reviewable end-to-end.

## What changed from the upload

**Preserved as-is:** all UI, colors, typography, spacing, animations and
responsiveness on the login, register and role-selection pages, and the
dashboard's existing color palette / glass values (now organized into CSS
custom properties in `dashboard.css` instead of repeated literals).

**Bugs fixed:**
- `script.js`, `register.js`, `js/role.js` and `dashboard.js` were referenced
  by the HTML but never uploaded, so the password-visibility toggle,
  register validation, and role-selection flow were all silently non-functional.
  All four now exist.
- `index.html` had three empty `<div class="gradient...">` elements with no
  matching CSS anywhere (dead markup left over from an earlier version) — removed.
- `assets/login/background.png` was referenced by `index.css` / `register.css`
  but wasn't part of the upload. Added a generated placeholder (abstract, in
  the same dark navy/blue tones already used elsewhere) at that exact path,
  plus a `background-color` fallback in both stylesheets in case an image
  ever fails to load. Swap in a real photo at the same path any time.
- Standardized on Font Awesome 6.7.2 everywhere (the old dashboard.html
  referenced 6.7.1 while every other page used 6.7.2).

**New (not previously part of the project):** everything under `sections/`,
`dashboard.js`, and the toast/mobile-nav/table/toggle/chart-placeholder
styles in `dashboard.css` needed for the five new sections.

## Structure

```
index.html / index.css / script.js              — Login
register.html / register.css / register.js       — Register
role-selection.html / role-selection.css          — Role selection
js/role.js
dashboard.html / dashboard.css / dashboard.js     — Dashboard SPA shell
sections/
  dashboard-section.html
  events-section.html
  volunteers-section.html
  attendance-section.html
  analytics-section.html
  settings-section.html
assets/login/background.png
```

## Backend-ready hooks

Per the brief, IDs/classes are in place for a future backend to populate
without restructuring markup — notably `#total-events`, `#registrations`,
`#checked-in`, `#volunteers`, `#events-container`, `#activity-list`,
`#upcoming-events-list`, `#completed-events-list`, `#volunteers-list`,
`#live-attendance-count`, `#attendance-percentage`, `#checkin-table-body`,
`#checkout-table-body`, and the four `#*-chart` containers in Analytics.

**No backend was built in this pass, per your last message** — `server.js`,
`routes/`, `controllers/`, `models/` are intentionally not included yet.
Happy to scaffold that as a follow-up whenever you're ready.

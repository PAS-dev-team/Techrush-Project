/* ==========================================================
   EVENTOS — ORGANIZER DASHBOARD (SPA)
   ----------------------------------------------------------
   Vanilla JS, no frameworks. Responsibilities:
     1. Load section partials into #content-area via fetch()
     2. Keep the sidebar's active state in sync
     3. Fade the content area between sections
     4. Handle logout
     5. Show a shared toast for actions that need a backend
   ----------------------------------------------------------
   NOTE: because this uses fetch() to load local HTML partials
   from /sections, the browser will block those requests with
   a CORS error if this file is opened directly (file://).
   Serve the project over HTTP during development, e.g.:
     npx serve .
     python3 -m http.server
   See README.md for details.
========================================================== */

const SECTION_PATH = (name) => `sections/${name}-section.html`;
const FADE_MS = 180;
const TOAST_MS = 2800;

const contentArea = document.getElementById('content-area');
const toastContainer = document.getElementById('toastContainer');

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLogout();
  initStubActions();
  loadSection('dashboard', { updateHistory: false });
});

/* ==========================================================
   SECTION LOADING
========================================================== */

/**
 * Fetches a section partial and swaps it into the content area
 * with a short fade transition.
 * @param {string} sectionName - matches a data-section value
 */
async function loadSection(sectionName) {
  if (!contentArea) return;

  contentArea.classList.add('is-fading');
  await wait(FADE_MS);

  try {
    const response = await fetch(SECTION_PATH(sectionName));
    if (!response.ok) {
      throw new Error(`Section "${sectionName}" responded with ${response.status}`);
    }
    contentArea.innerHTML = await response.text();
  } catch (error) {
    console.error('[dashboard] failed to load section:', error);
    contentArea.innerHTML = buildErrorState(sectionName);
  }

  contentArea.scrollTop = 0;
  contentArea.classList.remove('is-fading');
}

function buildErrorState(sectionName) {
  return `
    <div class="empty-state">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <h3>Couldn't load this section</h3>
      <p>Something went wrong loading "${escapeHtml(sectionName)}". Try selecting it again from the sidebar.</p>
    </div>
  `;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

/* ==========================================================
   SIDEBAR NAVIGATION
========================================================== */

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      if (item.classList.contains('active')) return;

      navItems.forEach((el) => el.classList.remove('active'));
      item.classList.add('active');

      loadSection(item.dataset.section);
    });
  });
}

/* ==========================================================
   LOGOUT
   Delegated on document, not bound directly, because a second
   logout button lives inside the dynamically-loaded Settings
   section and wouldn't exist yet at page-load time.
========================================================== */

function initLogout() {
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.js-logout')) return;
    window.location.href = 'index.html';
  });
}

/* ==========================================================
   STUB ACTIONS (buttons not wired to a backend yet)
   Any element with [data-stub="Label"] anywhere in the shell
   OR in a dynamically-loaded section will show a toast instead
   of doing nothing silently. Delegated on document so it keeps
   working after #content-area's innerHTML is replaced.
========================================================== */

function initStubActions() {
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-stub]');
    if (!trigger) return;

    event.preventDefault();
    const label = trigger.getAttribute('data-stub');
    showToast(`${label} will be available once the backend is connected.`);
  });
}

function showToast(message) {
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, TOAST_MS);
}

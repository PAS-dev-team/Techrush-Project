/* ==========================================================
   EVENTOS — ATTENDEE DASHBOARD (SPA)
   ----------------------------------------------------------
   Responsibilities:
     1. Verify JWT before allowing access
     2. Fetch authenticated user
     3. Load section partials
     4. Handle sidebar navigation
     5. Handle logout
     6. Show stub toasts
========================================================== */

const SECTION_PATH = (name) => `sections/attendee-${name}-section.html`;

const FADE_MS = 180;
const TOAST_MS = 2800;

const token = localStorage.getItem("token");

const contentArea = document.getElementById("content-area");
const toastContainer = document.getElementById("toastContainer");


document.addEventListener("DOMContentLoaded", async () => {

    const authenticated = await authenticate();

    if (!authenticated) return;

    initNavigation();
    initLogout();
    initStubActions();

    loadSection("dashboard");

});

/* ==========================================================
   AUTHENTICATION
========================================================== */

async function authenticate() {

    if (!token) {
        window.location.replace("index.html");
        return false;
    }

    try {

        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            logout();
            return false;
        }

        const result = await response.json();

        // Store latest user information
        localStorage.setItem("user", JSON.stringify(result.data));

        // Update username if element exists
        const userName = document.getElementById("profile-name");

        if (userName) {
            userName.textContent = result.data.name;
        }

        return true;

    } catch (error) {

        console.error(error);
        logout();
        return false;

    }

}

/* ==========================================================
   SECTION LOADING
========================================================== */

async function loadSection(sectionName) {

    if (!contentArea) return;

    contentArea.classList.add("is-fading");

    await wait(FADE_MS);

    try {

        const response = await fetch(SECTION_PATH(sectionName));

        if (!response.ok) {
            throw new Error(`Section "${sectionName}" responded with ${response.status}`);
        }

        contentArea.innerHTML = await response.text();
        if (sectionName === "events") {
    initializeRegistrationPortal();
}

    } catch (error) {

        console.error("[dashboard] Failed to load section:", error);

        contentArea.innerHTML = buildErrorState(sectionName);

    }

    contentArea.scrollTop = 0;

    contentArea.classList.remove("is-fading");

}

function buildErrorState(sectionName) {

    return `
        <div class="empty-state">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <h3>Couldn't load this section</h3>
            <p>
                Something went wrong loading
                "${escapeHtml(sectionName)}".
                Try selecting it again.
            </p>
        </div>
    `;

}

/* ==========================================================
   SIDEBAR NAVIGATION
========================================================== */

function initNavigation() {

    const navItems = document.querySelectorAll(".nav-item[data-section]");

    navItems.forEach((item) => {

        item.addEventListener("click", () => {

            if (item.classList.contains("active")) return;

            navItems.forEach((nav) => nav.classList.remove("active"));

            item.classList.add("active");

            loadSection(item.dataset.section);

        });

    });

}

/* ==========================================================
   LOGOUT
========================================================== */

function initLogout() {

    document.addEventListener("click", (event) => {

        if (!event.target.closest(".js-logout")) return;

        logout();

    });

}

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.replace("index.html");

}

/* ==========================================================
   STUB ACTIONS
========================================================== */

function initStubActions() {

    document.addEventListener("click", (event) => {

        const trigger = event.target.closest("[data-stub]");

        if (!trigger) return;

        event.preventDefault();

        const label = trigger.dataset.stub;

        showToast(`${label} will be available once the backend is connected.`);

    });

}

/* ==========================================================
   TOAST
========================================================== */

function showToast(message) {

    if (!toastContainer) return;

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.innerHTML = `
        <i class="fa-solid fa-circle-info"></i>
        <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {
            toast.remove();
        }, 300);

    }, TOAST_MS);

}

/* ==========================================================
   HELPERS
========================================================== */

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeHtml(value) {

    const div = document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}

async function loadRegistrationLink(){

}

async function saveRegistrationLink(){

}

async function editRegistrationLink(){

}

async function deleteRegistrationLink(){

}

function initializeRegistrationPortal() {

    const saveButton = document.getElementById("saveRegistrationLink");

    if (!saveButton) return;

    saveButton.addEventListener("click", saveRegistrationLink);

    // Later you can attach:
    // openRegistrationLink
    // editRegistrationLink
    // deleteRegistrationLink
}


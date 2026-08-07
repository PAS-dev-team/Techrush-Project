/* ==========================================================
   EVENTOS — ORGANIZER DASHBOARD (SPA)
   ----------------------------------------------------------
   Responsibilities:
     1. Verify JWT before allowing access
     2. Fetch authenticated user
     3. Load section partials
     4. Handle sidebar navigation
     5. Handle logout
     6. Show stub toasts
========================================================== */

const SECTION_PATH = (name) => `sections/${name}-section.html`;

const FADE_MS = 180;
const TOAST_MS = 2800;

const token = localStorage.getItem("token");

const contentArea = document.getElementById("content-area");
const toastContainer = document.getElementById("toastContainer");

let currentUser = null;


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
        currentUser = result.data;
        localStorage.setItem("user", JSON.stringify(result.data));

        // Update sidebar/header profile card if elements exist
        const userName = document.getElementById("profile-name");

        if (userName) {
            userName.textContent = result.data.name;
        }

        const avatar = document.querySelector(".profile-avatar");

        if (avatar) {
            avatar.textContent = getInitials(result.data.name);
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

        await personalizeSection(sectionName);

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
   SECTION PERSONALIZATION
   Sections are injected asynchronously from sections/*.html,
   so any element that needs the logged-in user's data has to
   be populated after each section loads, not just once at
   authenticate() time.
========================================================== */

function capitalize(value) {
    if (!value) return "";
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

async function personalizeSection(sectionName) {

    if (!currentUser) return;

    if (sectionName === "dashboard") {

        const welcomeText = document.getElementById("welcome-text");

        if (welcomeText) {
            welcomeText.textContent = `Welcome back, ${firstName(currentUser.name)} 👋`;
        }

    }

    if (sectionName === "settings") {

        const fullNameInput = document.getElementById("settings-fullname");
        const emailInput = document.getElementById("settings-email");
        const roleInput = document.getElementById("settings-role");
        const phoneInput = document.getElementById("settings-phone");

        if (fullNameInput) fullNameInput.value = currentUser.name;
        if (emailInput) emailInput.value = currentUser.email;
        if (roleInput) roleInput.value = capitalize(currentUser.role);
        if (phoneInput) phoneInput.value = currentUser.phone || "";

        initializeSettingsForms();

        if (currentUser.role === "ORGANIZER") {
            await loadOrganizationDetails();
        }

    }

}

/* ==========================================================
   HELPERS
========================================================== */

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function firstName(fullName) {
    return (fullName || "").trim().split(/\s+/)[0] || "there";
}

function getInitials(fullName) {

    const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "?";

    const initials = parts.length === 1
        ? parts[0].slice(0, 2)
        : parts[0][0] + parts[parts.length - 1][0];

    return initials.toUpperCase();
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

/* ==========================================================
   SETTINGS — PROFILE & ORGANIZATION
========================================================== */

function initializeSettingsForms() {

    // Sections are re-fetched (and their inner elements replaced) each
    // time they're navigated to, so it's correct to re-attach listeners
    // on the fresh elements every time — the old nodes (and their
    // listeners) are discarded along with the old innerHTML.
    const profileForm = document.getElementById("profile-form");

    if (profileForm) {
        profileForm.addEventListener("submit", handleProfileSubmit);
    }

    const orgForm = document.getElementById("org-details-form");

    if (orgForm) {
        orgForm.addEventListener("submit", handleOrganizationSubmit);
    }

}

async function handleProfileSubmit(event) {

    event.preventDefault();

    const name = document.getElementById("settings-fullname").value.trim();
    const phone = document.getElementById("settings-phone").value.trim();

    if (name.length < 2) {
        showToast("Name must be at least 2 characters.");
        return;
    }

    const submitBtn = event.target.querySelector("button[type=submit]");
    if (submitBtn) submitBtn.disabled = true;

    try {

        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, phone }),
        });

        const result = await response.json();

        if (!response.ok) {
            const message = Array.isArray(result.error) && result.error.length
                ? result.error[0].message
                : (result.message || "Could not save your profile.");
            showToast(message);
            return;
        }

        currentUser = { ...currentUser, ...result.data };
        localStorage.setItem("user", JSON.stringify(currentUser));

        const profileNameEl = document.getElementById("profile-name");
        if (profileNameEl) profileNameEl.textContent = currentUser.name;

        const avatarEl = document.querySelector(".profile-avatar");
        if (avatarEl) avatarEl.textContent = getInitials(currentUser.name);

        showToast("Profile updated.");

    } catch (error) {

        console.error(error);
        showToast("Unable to connect to the server.");

    } finally {

        if (submitBtn) submitBtn.disabled = false;

    }

}

async function loadOrganizationDetails() {

    try {

        const response = await fetch(`${API_URL}/api/organizations/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const result = await response.json();
        const org = result.data;

        if (!org) return;

        const nameInput = document.getElementById("org-name");
        const typeInput = document.getElementById("org-type");
        const emailInput = document.getElementById("org-contact-email");
        const addressInput = document.getElementById("org-address");

        if (nameInput) nameInput.value = org.name || "";
        if (typeInput) typeInput.value = org.type || "";
        if (emailInput) emailInput.value = org.contactEmail || "";
        if (addressInput) addressInput.value = org.address || "";

    } catch (error) {

        console.error("[dashboard] Failed to load organization details:", error);

    }

}

async function handleOrganizationSubmit(event) {

    event.preventDefault();

    const name = document.getElementById("org-name").value.trim();
    const type = document.getElementById("org-type").value;
    const contactEmail = document.getElementById("org-contact-email").value.trim();
    const address = document.getElementById("org-address").value.trim();

    if (name.length < 2) {
        showToast("Organization name must be at least 2 characters.");
        return;
    }

    const submitBtn = event.target.querySelector("button[type=submit]");
    if (submitBtn) submitBtn.disabled = true;

    try {

        const response = await fetch(`${API_URL}/api/organizations/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ name, type, contactEmail, address }),
        });

        const result = await response.json();

        if (!response.ok) {
            const message = Array.isArray(result.error) && result.error.length
                ? result.error[0].message
                : (result.message || "Could not save organization details.");
            showToast(message);
            return;
        }

        showToast("Organization details saved.");

    } catch (error) {

        console.error(error);
        showToast("Unable to connect to the server.");

    } finally {

        if (submitBtn) submitBtn.disabled = false;

    }

}
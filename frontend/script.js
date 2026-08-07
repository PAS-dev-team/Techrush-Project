/* ==========================================================
   EVENTOS — LOGIN PAGE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initLoginForm();
    initGoogleSignIn();
});

function initPasswordToggle() {
    const toggle = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");

    if (!toggle || !passwordInput) return;

    toggle.addEventListener("click", () => {
        const showing = passwordInput.type === "text";

        passwordInput.type = showing ? "password" : "text";

        toggle.classList.toggle("fa-eye", showing);
        toggle.classList.toggle("fa-eye-slash", !showing);
    });
}

function initLoginForm() {
    const form = document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener("submit", login);
}

async function login(event) {
    event.preventDefault();

    const form = event.target;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Login failed");
            return;
        }

        completeLogin(result.data);

    } catch (err) {
        console.error(err);
        alert("Unable to connect to server.");
    }
}

/* ==========================================================
   GOOGLE SIGN-IN
   Google Identity Services doesn't let us restyle its button,
   so its real button is rendered into an invisible container
   and our own "Continue with Google" button just forwards
   its click there — same official, policy-compliant flow,
   our own look.
========================================================== */

let googleSignInReady = false;

function initGoogleSignIn() {

    if (googleSignInReady) return;

    if (!window.google || !window.google.accounts || !window.google.accounts.id) return;

    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith("YOUR_")) {
        console.warn("[login] GOOGLE_CLIENT_ID isn't configured in config.js yet.");
        return;
    }

    const container = document.getElementById("googleButtonContainer");
    const trigger = document.getElementById("googleSignInBtn");

    if (!container || !trigger) return;

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
    });

    google.accounts.id.renderButton(container, { type: "standard" });

    trigger.addEventListener("click", () => {
        const realButton = container.querySelector('div[role="button"]');

        if (realButton) {
            realButton.click();
        } else {
            alert("Google sign-in isn't ready yet — please try again in a moment.");
        }
    });

    googleSignInReady = true;

}

// Fires as soon as the Google Identity Services script itself has
// loaded, which can happen before or after DOMContentLoaded since the
// script tag is async. Covers whichever order actually happens.
window.onGoogleLibraryLoad = initGoogleSignIn;

async function handleGoogleCredential(response) {

    try {

        const apiResponse = await fetch(`${API_URL}/api/auth/google`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                idToken: response.credential,
            }),
        });

        const result = await apiResponse.json();

        if (!apiResponse.ok) {
            alert(result.message || "Google sign-in failed.");
            return;
        }

        completeLogin(result.data);

    } catch (err) {
        console.error(err);
        alert("Unable to connect to server.");
    }

}

/* ==========================================================
   SHARED POST-LOGIN REDIRECT
   Used by both password login and Google sign-in.
========================================================== */

function completeLogin({ token, user }) {

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // A user who hasn't picked a role yet (brand-new sign-up, whether
    // by password or Google) always goes through role-selection first,
    // regardless of the ATTENDEE default their account starts with.
    if (!user.roleSelected) {
        window.location.href = "role-selection.html";
        return;
    }

    const role = (user.role || "").toLowerCase();

    if (role === "attendee") {
        window.location.href = "attendee-dashboard.html";
    } else if (role === "organizer") {
        window.location.href = "dashboard.html";
    } else {
        // Volunteer dashboard isn't built yet; send them to
        // role-selection so they see the "coming soon" state
        // instead of landing on the wrong dashboard.
        window.location.href = "role-selection.html";
    }

}
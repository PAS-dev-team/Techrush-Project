/* ==========================================================
   EVENTOS — LOGIN PAGE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggle();
    initLoginForm();
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

        // Save JWT
        localStorage.setItem("token", result.data.token);

        // Save user info (optional)
        localStorage.setItem("user", JSON.stringify(result.data.user));

        // Redirect based on the account's actual role, not a stale
        // localStorage flag (role-selection only sets this once, at
        // signup — returning users logging back in need the role
        // the backend has on file for them).
        const role = (result.data.user.role || "").toLowerCase();

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

    } catch (err) {
        console.error(err);
        alert("Unable to connect to server.");
    }
}
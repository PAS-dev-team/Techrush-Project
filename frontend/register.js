/* ==========================================================
        EVENTOS REGISTER PAGE
        API Integration
========================================================== */

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const name = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        const button = document.querySelector(".login-btn");

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        button.innerHTML = "Registering...";
        button.disabled = true;

        try {

            const response = await fetch(`${API_URL}/api/auth/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({ name, email, password }),

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(Array.isArray(data?.error) ? data.error.map(e => e.message).join(", ") : (data?.message || "Registration failed"));
            }

            localStorage.setItem("token", data?.data?.token || "");
            localStorage.setItem("user", JSON.stringify(data?.data?.user || {}));

            window.location.href = "role-selection.html";

        } catch (err) {

            alert(err.message || "Something went wrong.");

            button.innerHTML = "Register";
            button.disabled = false;

        }

    });

}
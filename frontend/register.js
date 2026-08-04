/* ==========================================================
   EVENTOS — REGISTER PAGE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initRegisterForm();
});

function initRegisterForm() {

    const form = document.getElementById("registerForm");

    if (!form) return;

    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");

    form.addEventListener("submit", register);

    confirmPassword.addEventListener("input", () => {
        clearFieldError(confirmPassword);
    });

}

async function register(event) {

    event.preventDefault();

    const form = event.target;

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {

        showFieldError(
            document.getElementById("confirmPassword"),
            "Passwords don't match."
        );

        return;

    }

    clearFieldError(document.getElementById("confirmPassword"));

    try {

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
          if (Array.isArray(result.error) && result.error.length > 0) {
              alert(result.error[0].message);
          } else {
              alert(result.message || "Registration failed.");
          }
          return;
        }

        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));

        window.location.href = "role-selection.html";

    } catch (error) {

        console.error(error);
        alert("Unable to connect to the server.");

    }

}

function showFieldError(input, message) {

    clearFieldError(input);

    const box = input.closest(".input-box");

    box.classList.add("input-error");

    const error = document.createElement("p");

    error.className = "field-error";
    error.textContent = message;

    box.insertAdjacentElement("afterend", error);

}

function clearFieldError(input) {

    const box = input.closest(".input-box");

    box.classList.remove("input-error");

    const group = box.parentElement;

    const error = group.querySelector(".field-error");

    if (error) {
        error.remove();
    }

}
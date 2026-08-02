/* ==========================================================
        EVENTOS ROLE SELECTION PAGE
        API Integration
========================================================== */

const roleCards = document.querySelectorAll(".role-card");
const continueBtn = document.getElementById("continueBtn");

let selectedRole = null;

roleCards.forEach((card) => {

    card.addEventListener("click", () => {

        roleCards.forEach((c) => c.classList.remove("selected"));

        card.classList.add("selected");

        selectedRole = card.dataset.role;

        continueBtn.disabled = false;

    });

});

continueBtn.addEventListener("click", async () => {

    if (!selectedRole) return;

    let user = JSON.parse(localStorage.getItem("user") || "null");

    continueBtn.disabled = true;
    continueBtn.innerHTML = "Saving...";

    try {

        const response = await fetch(`${API_URL}/api/role`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({ email: user ? user.email : "", role: selectedRole }),

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Failed to save role");
        }

        localStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "index.html";

    } catch (err) {

        alert(err.message || "Something went wrong.");

        continueBtn.disabled = false;
        continueBtn.innerHTML = 'Continue <i class="fa-solid fa-arrow-right"></i>';

    }

});
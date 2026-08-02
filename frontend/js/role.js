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

continueBtn.addEventListener("click", () => {

    if (!selectedRole) return;

    localStorage.setItem("role", selectedRole);

    continueBtn.disabled = true;
    continueBtn.innerHTML = "Saving...";

    setTimeout(() => {
        window.location.href = "index.html";
    }, 400);

});
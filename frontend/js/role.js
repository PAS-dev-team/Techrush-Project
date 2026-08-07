/* ==========================================================
   EVENTOS — ROLE SELECTION PAGE
   Lets the user pick a role card, enables Continue once a
   role is chosen, and routes onward. Only the organizer
   dashboard exists so far, so the other two roles surface a
   friendly "coming soon" note instead of a dead link.
========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRoleSelection();
});

function initRoleSelection() {
  const roleCards = document.querySelectorAll('.role-card');
  const continueBtn = document.getElementById('continueBtn');
  if (!roleCards.length || !continueBtn) return;

  let selectedRole = null;

  roleCards.forEach((card) => {
    card.addEventListener('click', () => {
      roleCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      selectedRole = card.dataset.role;
      continueBtn.disabled = false;
      hideComingSoonNote();
    });
  });

  continueBtn.addEventListener('click', () => {

    if (!selectedRole) return;

    // Save selected role
    localStorage.setItem("selectedRole", selectedRole);

    switch (selectedRole) {

        case "organizer":
            window.location.href = "dashboard.html";
            break;

        case "attendee":
            window.location.href = "attendee-dashboard.html";
            break;

        case "volunteer":
            window.location.href = "volunteer-dashboard.html";
            break;

        default:
            showComingSoonNote();

    }

});
}

function showComingSoonNote() {
  getOrCreateNote().classList.add('show');
}

function hideComingSoonNote() {
  const note = document.getElementById('comingSoonNote');
  if (note) note.classList.remove('show');
}

function getOrCreateNote() {
  let note = document.getElementById('comingSoonNote');
  if (!note) {
    note = document.createElement('p');
    note.id = 'comingSoonNote';
    note.className = 'coming-soon-note';
    note.textContent = 'Selected dashboard is not available.';
    document.getElementById('continueBtn').insertAdjacentElement('afterend', note);
  }
  return note;
}

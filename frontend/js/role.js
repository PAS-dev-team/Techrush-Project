/* ==========================================================
   EVENTOS — ROLE SELECTION PAGE
   Lets the user pick a role card, persists it to the backend
   (PATCH /api/auth/role) once Continue is pressed, and routes
   onward. Organizer and attendee dashboards are both built;
   only the volunteer dashboard surfaces a friendly "coming
   soon" note instead of a dead link — but their role is saved
   either way.
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

  continueBtn.addEventListener('click', async () => {
    if (!selectedRole || continueBtn.disabled) return;

    const token = localStorage.getItem('token');

    if (!token) {
      // No session to attach the role to — send them back to log in.
      window.location.replace('index.html');
      return;
    }

    continueBtn.disabled = true;

    try {
      const response = await fetch(`${API_URL}/api/auth/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || 'Could not save your role. Please try again.');
        continueBtn.disabled = false;
        return;
      }

      // Refresh the stored token/user so the role change takes effect
      // immediately elsewhere in the app.
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      if (selectedRole === 'organizer') {
        window.location.href = 'dashboard.html';
        return;
      }

      if (selectedRole === 'attendee') {
        window.location.href = 'attendee-dashboard.html';
        return;
      }

      // Volunteer dashboard isn't built yet, but the role is
      // already saved server-side.
      showComingSoonNote();
      continueBtn.disabled = false;

    } catch (error) {
      console.error(error);
      alert('Unable to connect to the server.');
      continueBtn.disabled = false;
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
    note.textContent = 'That dashboard is coming soon — organizer and attendee access are ready now.';
    document.getElementById('continueBtn').insertAdjacentElement('afterend', note);
  }
  return note;
}

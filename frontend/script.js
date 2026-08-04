/* ==========================================================
   EVENTOS — LOGIN PAGE
   Handles the password visibility toggle and the login form
   submission. No backend is connected yet, so a successful
   submit simply moves the user forward into the app so the
   rest of the product flow can be reviewed end-to-end.
========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initLoginForm();
});

/**
 * Toggles the password field between hidden and visible text,
 * swapping the eye / eye-slash icon to match.
 */
function initPasswordToggle() {
  const toggle = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('password');

  if (!toggle || !passwordInput) return;

  toggle.addEventListener('click', () => {
    const showing = passwordInput.type === 'text';
    passwordInput.type = showing ? 'password' : 'text';
    toggle.classList.toggle('fa-eye', showing);
    toggle.classList.toggle('fa-eye-slash', !showing);
  });
}

/**
 * Intercepts the login form submit. There is no backend yet,
 * so this only performs basic client-side checks and then
 * continues into the dashboard as a stand-in for a real
 * authentication response.
 */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // NOTE: replace with a real authentication request once the
    // backend is available. For now this simulates a successful
    // login so the rest of the flow can be reviewed.
    window.location.href = 'dashboard.html';
  });
}

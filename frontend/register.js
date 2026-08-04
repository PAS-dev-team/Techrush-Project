/* ==========================================================
   EVENTOS — REGISTER PAGE
   Validates that the password and confirmation match, then
   continues on to role selection. No backend is connected
   yet, so account creation is simulated client-side only.
========================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
});

function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (password.value !== confirmPassword.value) {
      showFieldError(confirmPassword, "Passwords don't match.");
      confirmPassword.focus();
      return;
    }
    clearFieldError(confirmPassword);

    // NOTE: replace with a real registration request once the
    // backend is available. For now this simulates a successful
    // sign-up and continues the onboarding flow.
    window.location.href = 'role-selection.html';
  });

  // Clear the error as soon as the user starts fixing it.
  confirmPassword.addEventListener('input', () => clearFieldError(confirmPassword));
}

function showFieldError(input, message) {
  clearFieldError(input);

  const box = input.closest('.input-box');
  box.classList.add('input-error');

  const errorEl = document.createElement('p');
  errorEl.className = 'field-error';
  errorEl.textContent = message;
  box.insertAdjacentElement('afterend', errorEl);
}

function clearFieldError(input) {
  const box = input.closest('.input-box');
  box.classList.remove('input-error');

  const group = box.parentElement;
  const existingError = group.querySelector('.field-error');
  if (existingError) existingError.remove();
}

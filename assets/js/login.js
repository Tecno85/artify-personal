// Toggle mostrar/ocultar contraseña
const togglePassword = document.querySelector('.toggle-password');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('eye-icon');

togglePassword.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;

  // Cambiar icono
  const iconSrc =
    type === 'password'
      ? '../assets/icons/eye.svg'
      : '../assets/icons/eye-slash.svg';
  eyeIcon.src = iconSrc;
});

// Validación del formulario
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Limpiar errores previos
  emailError.classList.remove('show');
  passwordError.classList.remove('show');
  emailInput.classList.remove('error');
  passwordInput.classList.remove('error');

  let isValid = true;

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    emailError.textContent = 'Por favor ingresa un correo válido';
    emailError.classList.add('show');
    emailInput.classList.add('error');
    isValid = false;
  }

  // Validar contraseña
  if (passwordInput.value.length < 8) {
    passwordError.textContent =
      'La contraseña debe tener al menos 8 caracteres';
    passwordError.classList.add('show');
    passwordInput.classList.add('error');
    isValid = false;
  }

  if (isValid) {
    // Aquí iría la lógica de autenticación
    console.log('Formulario válido');
    alert('Inicio de sesión exitoso (simulado)');
    // window.location.href = './editor.html';
  }
});

// Validación en tiempo real del email
emailInput.addEventListener('blur', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailInput.value && !emailRegex.test(emailInput.value)) {
    emailError.textContent = 'Formato de correo inválido';
    emailError.classList.add('show');
    emailInput.classList.add('error');
  } else {
    emailError.classList.remove('show');
    emailInput.classList.remove('error');
  }
});

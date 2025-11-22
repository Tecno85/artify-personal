// ========== CONFIGURACIÓN INICIAL ==========
const registroForm = document.getElementById('registroForm');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const strengthFill = document.getElementById('strength-fill');
const strengthText = document.getElementById('strength-text');
const fechaNacimientoInput = document.getElementById('fechaNacimiento');

// Establecer fecha máxima (18 años atrás desde hoy)
const today = new Date();
const maxDate = new Date(
  today.getFullYear() - 18,
  today.getMonth(),
  today.getDate()
);
fechaNacimientoInput.max = maxDate.toISOString().split('T')[0];

// ========== TOGGLE MOSTRAR/OCULTAR CONTRASEÑA ==========
const toggleButtons = document.querySelectorAll('.toggle-password');

toggleButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    const img = button.querySelector('img');

    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;

    const iconSrc =
      type === 'password'
        ? '../assets/icons/eye.svg'
        : '../assets/icons/eye-slash.svg';
    img.src = iconSrc;
  });
});

// ========== INDICADOR DE FORTALEZA DE CONTRASEÑA ==========
function evaluarFortaleza(password) {
  if (!password) {
    return { strength: 'none', text: 'Sin contraseña' };
  }

  let score = 0;

  // Criterios
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) {
    return { strength: 'weak', text: 'Débil' };
  } else if (score <= 4) {
    return { strength: 'medium', text: 'Media' };
  } else {
    return { strength: 'strong', text: 'Fuerte' };
  }
}

passwordInput.addEventListener('input', () => {
  const result = evaluarFortaleza(passwordInput.value);

  // Limpiar clases previas
  strengthFill.classList.remove('weak', 'medium', 'strong');
  strengthText.classList.remove('weak', 'medium', 'strong');

  // Aplicar nuevas clases
  if (result.strength !== 'none') {
    strengthFill.classList.add(result.strength);
    strengthText.classList.add(result.strength);
  }

  strengthText.textContent = result.text;
});

// ========== VALIDACIONES ==========
function mostrarError(inputId, mensaje) {
  const input = document.getElementById(inputId);
  const errorSpan = document.getElementById(`${inputId}-error`);

  input.classList.add('error');
  errorSpan.textContent = mensaje;
  errorSpan.classList.add('show');
}

function limpiarError(inputId) {
  const input = document.getElementById(inputId);
  const errorSpan = document.getElementById(`${inputId}-error`);

  input.classList.remove('error');
  errorSpan.classList.remove('show');
}

function limpiarTodosLosErrores() {
  const inputs = [
    'nombres',
    'apellidos',
    'cedula',
    'fechaNacimiento',
    'email',
    'password',
    'confirmPassword',
    'terminos',
  ];
  inputs.forEach((id) => limpiarError(id));
}

// Validación de solo letras
function validarSoloLetras(input) {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  return regex.test(input.value) && input.value.length >= 2;
}

// Validación de cédula
function validarCedula(input) {
  const regex = /^[0-9]{6,10}$/;
  return regex.test(input.value);
}

// Validación de edad
function validarEdad(input) {
  const fechaNac = new Date(input.value);
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return edad >= 18;
}

// Validación de email
function validarEmail(input) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(input.value);
}

// Validación de contraseña
function validarPassword(input) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return regex.test(input.value);
}

// ========== VALIDACIONES EN TIEMPO REAL ==========
document.getElementById('nombres').addEventListener('blur', function () {
  if (!validarSoloLetras(this)) {
    mostrarError('nombres', 'Solo letras, mínimo 2 caracteres');
  } else {
    limpiarError('nombres');
  }
});

document.getElementById('apellidos').addEventListener('blur', function () {
  if (!validarSoloLetras(this)) {
    mostrarError('apellidos', 'Solo letras, mínimo 2 caracteres');
  } else {
    limpiarError('apellidos');
  }
});

document.getElementById('cedula').addEventListener('blur', function () {
  if (!validarCedula(this)) {
    mostrarError('cedula', 'Cédula debe tener entre 6 y 10 dígitos');
  } else {
    limpiarError('cedula');
  }
});

document
  .getElementById('fechaNacimiento')
  .addEventListener('blur', function () {
    if (!this.value) {
      mostrarError('fechaNacimiento', 'Debes ingresar tu fecha de nacimiento');
    } else if (!validarEdad(this)) {
      mostrarError('fechaNacimiento', 'Debes ser mayor de 18 años');
    } else {
      limpiarError('fechaNacimiento');
    }
  });

document.getElementById('email').addEventListener('blur', function () {
  if (!validarEmail(this)) {
    mostrarError('email', 'Formato de correo inválido');
  } else {
    limpiarError('email');
  }
});

document.getElementById('password').addEventListener('blur', function () {
  if (!validarPassword(this)) {
    mostrarError(
      'password',
      'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número'
    );
  } else {
    limpiarError('password');
  }
});

confirmPasswordInput.addEventListener('blur', function () {
  if (this.value !== passwordInput.value) {
    mostrarError('confirmPassword', 'Las contraseñas no coinciden');
  } else {
    limpiarError('confirmPassword');
  }
});

// ========== SUBMIT DEL FORMULARIO ==========
registroForm.addEventListener('submit', (e) => {
  e.preventDefault();
  limpiarTodosLosErrores();

  let isValid = true;

  // Validar nombres
  const nombres = document.getElementById('nombres');
  if (!validarSoloLetras(nombres)) {
    mostrarError('nombres', 'Solo letras, mínimo 2 caracteres');
    isValid = false;
  }
  // Validar apellidos
  const apellidos = document.getElementById('apellidos');
  if (!validarSoloLetras(apellidos)) {
    mostrarError('apellidos', 'Solo letras, mínimo 2 caracteres');
    isValid = false;
  }

  // Validar cédula
  const cedula = document.getElementById('cedula');
  if (!validarCedula(cedula)) {
    mostrarError('cedula', 'Cédula debe tener entre 6 y 10 dígitos');
    isValid = false;
  }

  // Validar fecha de nacimiento
  const fechaNacimiento = document.getElementById('fechaNacimiento');
  if (!fechaNacimiento.value) {
    mostrarError('fechaNacimiento', 'Debes ingresar tu fecha de nacimiento');
    isValid = false;
  } else if (!validarEdad(fechaNacimiento)) {
    mostrarError('fechaNacimiento', 'Debes ser mayor de 18 años');
    isValid = false;
  }

  // Validar email
  const email = document.getElementById('email');
  if (!validarEmail(email)) {
    mostrarError('email', 'Por favor ingresa un correo válido');
    isValid = false;
  }

  // Validar contraseña
  const password = document.getElementById('password');
  if (!validarPassword(password)) {
    mostrarError(
      'password',
      'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 número'
    );
    isValid = false;
  }

  // Validar confirmación de contraseña
  const confirmPassword = document.getElementById('confirmPassword');
  if (confirmPassword.value !== password.value) {
    mostrarError('confirmPassword', 'Las contraseñas no coinciden');
    isValid = false;
  }

  // Validar términos
  const terminos = document.getElementById('terminos');
  if (!terminos.checked) {
    mostrarError('terminos', 'Debes aceptar los términos y condiciones');
    isValid = false;
  }

  // Si todo es válido
  if (isValid) {
    console.log('Formulario válido - Datos a enviar:', {
      nombres: nombres.value,
      apellidos: apellidos.value,
      cedula: cedula.value,
      fechaNacimiento: fechaNacimiento.value,
      email: email.value,
    });

    // Mostrar notificación de éxito (simulado)
    alert('¡Registro exitoso! Bienvenido a Artify');

    // Aquí iría la petición al servidor
    // fetch('/api/auth/register', { ... })

    // Redirigir al editor (simulado)
    // window.location.href = './editor.html';
  } else {
    // Hacer scroll al primer error
    const primerError = document.querySelector('.error-message.show');
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

// ========== BOTÓN CANCELAR ==========
document.getElementById('btnCancelar').addEventListener('click', () => {
  if (confirm('¿Estás seguro de que deseas cancelar el registro?')) {
    window.location.href = '../index.html';
  }
});

// ========== VALIDACIÓN DE CÉDULA ÚNICA (simulado) ==========
// En producción, esto haría una petición al servidor
document.getElementById('cedula').addEventListener('blur', async function () {
  if (validarCedula(this)) {
    // Simular verificación de cédula duplicada
    // const response = await fetch(`/api/verificar-cedula/${this.value}`);
    // const data = await response.json();

    // Simulación:
    const cedulasExistentes = ['1234567890', '9876543210']; // Ejemplo

    if (cedulasExistentes.includes(this.value)) {
      mostrarError('cedula', 'Esta cédula ya está registrada en el sistema');
    }
  }
});

// ========== VALIDACIÓN DE EMAIL ÚNICO (simulado) ==========
document.getElementById('email').addEventListener('blur', async function () {
  if (validarEmail(this)) {
    // Simular verificación de email duplicado
    // const response = await fetch(`/api/verificar-email/${this.value}`);
    // const data = await response.json();

    // Simulación:
    const emailsExistentes = ['test@imagina.com', 'admin@artify.com']; // Ejemplo

    if (emailsExistentes.includes(this.value)) {
      mostrarError('email', 'Este correo ya está registrado');
    }
  }
});

// ========== PREVENIR ESPACIOS EN CÉDULA ==========
document.getElementById('cedula').addEventListener('input', function () {
  this.value = this.value.replace(/\s/g, '');
});

// ========== FORMATO AUTOMÁTICO DE NOMBRES (Primera letra mayúscula) ==========
function capitalizarPalabras(input) {
  const palabras = input.value.split(' ');
  const capitalizadas = palabras.map((palabra) => {
    if (palabra.length > 0) {
      return palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase();
    }
    return palabra;
  });
  input.value = capitalizadas.join(' ');
}

document.getElementById('nombres').addEventListener('blur', function () {
  capitalizarPalabras(this);
});

document.getElementById('apellidos').addEventListener('blur', function () {
  capitalizarPalabras(this);
});

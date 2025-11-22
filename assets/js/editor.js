// ========== VARIABLES GLOBALES ==========
let currentImage = null;
let canvas = document.getElementById('mainCanvas');
let ctx = canvas.getContext('2d');
let operationsHistory = [];
let currentTool = null;
let zoomLevel = 100;
let currentFilter = null;

// ========== ELEMENTOS DEL DOM ==========
const fileInput = document.getElementById('fileInput');
const btnSubir = document.getElementById('btnSubir');
const btnDescargar = document.getElementById('btnDescargar');
const dropZone = document.getElementById('dropZone');
const canvasWrapper = document.getElementById('canvasWrapper');
const imageInfo = document.getElementById('imageInfo');
const btnTema = document.getElementById('btnTema');
const themeIcon = document.getElementById('themeIcon');

// Botones de herramientas
const btnRecortar = document.getElementById('btnRecortar');
const btnRedimensionar = document.getElementById('btnRedimensionar');
const btnRotar = document.getElementById('btnRotar');
const btnFiltros = document.getElementById('btnFiltros');
const submenuFiltros = document.getElementById('submenuFiltros');

// Botones de historial
const btnDeshacer = document.getElementById('btnDeshacer');
const btnRehacer = document.getElementById('btnRehacer');

// Zoom
const btnZoomIn = document.getElementById('btnZoomIn');
const btnZoomOut = document.getElementById('btnZoomOut');
const zoomLevelDisplay = document.getElementById('zoomLevel');

// Status bar
const operationsCount = document.getElementById('operationsCount');
const statusIndicator = document.getElementById('statusIndicator');

// ========== SUBIR IMAGEN ==========
btnSubir.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    cargarImagen(file);
  }
});

// ========== DRAG & DROP ==========
dropZone.addEventListener('click', () => {
  fileInput.click();
});

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');

  const file = e.dataTransfer.files[0];
  if (file) {
    cargarImagen(file);
  }
});

// ========== FUNCIÓN CARGAR IMAGEN ==========
function cargarImagen(file) {
  // Validar tipo de archivo
  const tiposValidos = ['image/jpeg', 'image/png'];
  if (!tiposValidos.includes(file.type)) {
    mostrarNotificacion('error', 'Formato no válido. Solo JPG y PNG');
    return;
  }

  // Validar tamaño (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB en bytes
  if (file.size > maxSize) {
    mostrarNotificacion('error', 'La imagen supera el límite de 10MB');
    return;
  }

  // Cambiar estado a procesando
  actualizarEstado('Cargando imagen...', 'processing');

  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      // Configurar canvas con dimensiones de la imagen
      canvas.width = img.width;
      canvas.height = img.height;

      // Dibujar imagen en canvas
      ctx.drawImage(img, 0, 0);

      // Guardar referencia
      currentImage = img;

      // Actualizar interfaz
      mostrarCanvas();
      habilitarHerramientas();
      actualizarPropiedades(file, img);
      actualizarEstado('Listo', 'success');

      // Notificación de éxito
      mostrarNotificacion('success', 'Imagen cargada correctamente');

      // Agregar al historial
      agregarOperacion('Imagen cargada');
    };

    img.onerror = () => {
      mostrarNotificacion('error', 'Error al cargar la imagen');
      actualizarEstado('Error', 'error');
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

// ========== MOSTRAR CANVAS ==========
function mostrarCanvas() {
  dropZone.style.display = 'none';
  canvasWrapper.style.display = 'flex';
  imageInfo.style.display = 'block';
}

// ========== HABILITAR HERRAMIENTAS ==========
function habilitarHerramientas() {
  btnDescargar.disabled = false;
  btnRecortar.disabled = false;
  btnRedimensionar.disabled = false;
  btnRotar.disabled = false;
  btnFiltros.disabled = false;
}

// ========== ACTUALIZAR PROPIEDADES ==========
function actualizarPropiedades(file, img) {
  document.getElementById('propNombre').textContent = file.name;
  document.getElementById('propTamano').textContent = formatearTamano(
    file.size
  );
  document.getElementById(
    'propDimensiones'
  ).textContent = `${img.width} x ${img.height} px`;
  document.getElementById('propFormato').textContent = file.type
    .split('/')[1]
    .toUpperCase();

  // Actualizar dimensiones en canvas
  document.getElementById(
    'imageDimensions'
  ).textContent = `${img.width} x ${img.height} px`;
}

// ========== FORMATEAR TAMAÑO DE ARCHIVO ==========
function formatearTamano(bytes) {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}

// ========== DESCARGAR IMAGEN ==========
btnDescargar.addEventListener('click', () => {
  if (!currentImage) return;

  actualizarEstado('Generando descarga...', 'processing');

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artify-editado-${Date.now()}.png`;
    a.click();

    URL.revokeObjectURL(url);

    mostrarNotificacion('success', 'Imagen descargada exitosamente');
    actualizarEstado('Listo', 'success');
    agregarOperacion('Imagen descargada');
  }, 'image/png');
});

// ========== CAMBIAR TEMA ==========
btnTema.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');

  const isLight = document.body.classList.contains('light-theme');
  themeIcon.src = isLight
    ? '../assets/icons/sun.svg'
    : '../assets/icons/moon.svg';
});

// ========== EXPANDIR/COLAPSAR FILTROS ==========
btnFiltros.addEventListener('click', () => {
  if (btnFiltros.disabled) return;

  const isExpanded = submenuFiltros.style.display === 'flex';
  submenuFiltros.style.display = isExpanded ? 'none' : 'flex';
  btnFiltros.classList.toggle('expanded');
});

// ========== SELECCIONAR FILTRO ==========
const filtrosButtons = document.querySelectorAll('.submenu-btn');
filtrosButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    currentFilter = filter;

    // Mostrar controles de filtro
    mostrarControlesFiltro(filter);

    // Highlight del botón activo
    filtrosButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// ========== MOSTRAR CONTROLES DE FILTRO ==========
function mostrarControlesFiltro(filter) {
  ocultarTodosLosControles();

  const filterControls = document.getElementById('filterControls');
  filterControls.style.display = 'block';

  // Mover al contenedor dinámico
  const dynamicControls = document.getElementById('dynamicControls');
  dynamicControls.innerHTML = '';
  dynamicControls.appendChild(filterControls);
}

// ========== APLICAR FILTRO ==========
document.getElementById('btnAplicarFiltro').addEventListener('click', () => {
  if (!currentImage || !currentFilter) return;

  actualizarEstado('Aplicando filtro...', 'processing');

  const intensity = document.getElementById('filterIntensity').value / 100;

  // Obtener datos de píxeles
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Aplicar filtro según tipo
  switch (currentFilter) {
    case 'grayscale':
      aplicarBlancoYNegro(data, intensity);
      break;
    case 'sepia':
      aplicarSepia(data, intensity);
      break;
    case 'brightness':
      aplicarBrillo(data, intensity);
      break;
    case 'contrast':
      aplicarContraste(data, intensity);
      break;
  }

  // Actualizar canvas
  ctx.putImageData(imageData, 0, 0);

  mostrarNotificacion('success', 'Filtro aplicado correctamente');
  actualizarEstado('Listo', 'success');
  agregarOperacion(`Filtro: ${currentFilter}`);
});

// ========== FILTROS ==========
function aplicarBlancoYNegro(data, intensity) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    data[i] = data[i] + (gray - data[i]) * intensity;
    data[i + 1] = data[i + 1] + (gray - data[i + 1]) * intensity;
    data[i + 2] = data[i + 2] + (gray - data[i + 2]) * intensity;
  }
}

function aplicarSepia(data, intensity) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const tr = 0.393 * r + 0.769 * g + 0.189 * b;
    const tg = 0.349 * r + 0.686 * g + 0.168 * b;
    const tb = 0.272 * r + 0.534 * g + 0.131 * b;

    data[i] = r + (tr - r) * intensity;
    data[i + 1] = g + (tg - g) * intensity;
    data[i + 2] = b + (tb - b) * intensity;
  }
}

function aplicarBrillo(data, intensity) {
  const adjustment = (intensity - 0.5) * 100;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, data[i] + adjustment));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + adjustment));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + adjustment));
  }
}

function aplicarContraste(data, intensity) {
  const factor =
    (259 * (intensity * 255 + 255)) / (255 * (259 - intensity * 255));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(
      255,
      Math.max(0, factor * (data[i + 1] - 128) + 128)
    );
    data[i + 2] = Math.min(
      255,
      Math.max(0, factor * (data[i + 2] - 128) + 128)
    );
  }
}

// ========== ACTUALIZAR INTENSIDAD DEL SLIDER ==========
document.getElementById('filterIntensity').addEventListener('input', (e) => {
  document.getElementById('filterIntensityValue').textContent =
    e.target.value + '%';
});

// ========== HERRAMIENTA REDIMENSIONAR ==========
btnRedimensionar.addEventListener('click', () => {
  if (btnRedimensionar.disabled) return;

  ocultarTodosLosControles();

  const resizeControls = document.getElementById('resizeControls');
  resizeControls.style.display = 'block';

  // Mover al contenedor dinámico
  const dynamicControls = document.getElementById('dynamicControls');
  dynamicControls.innerHTML = '';
  dynamicControls.appendChild(resizeControls);

  // Prellenar valores actuales
  document.getElementById('resizeWidth').value = canvas.width;
  document.getElementById('resizeHeight').value = canvas.height;

  // Marcar herramienta activa
  marcarHerramientaActiva(btnRedimensionar);
});

// ========== MANTENER PROPORCIÓN ==========
const resizeWidth = document.getElementById('resizeWidth');
const resizeHeight = document.getElementById('resizeHeight');
const mantenerProporcion = document.getElementById('mantenerProporcion');

let aspectRatio = 1;

resizeWidth.addEventListener('input', () => {
  if (mantenerProporcion.checked && currentImage) {
    aspectRatio = currentImage.width / currentImage.height;
    resizeHeight.value = Math.round(resizeWidth.value / aspectRatio);
  }
});

resizeHeight.addEventListener('input', () => {
  if (mantenerProporcion.checked && currentImage) {
    aspectRatio = currentImage.width / currentImage.height;
    resizeWidth.value = Math.round(resizeHeight.value * aspectRatio);
  }
});

// ========== APLICAR REDIMENSIONAR ==========
document
  .getElementById('btnAplicarRedimension')
  .addEventListener('click', () => {
    if (!currentImage) return;

    const newWidth = parseInt(resizeWidth.value);
    const newHeight = parseInt(resizeHeight.value);

    if (newWidth < 1 || newHeight < 1) {
      mostrarNotificacion('error', 'Las dimensiones deben ser mayores a 0');
      return;
    }

    actualizarEstado('Redimensionando...', 'processing');

    // Guardar estado original
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Redimensionar canvas
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Redibujar imagen redimensionada
    ctx.drawImage(currentImage, 0, 0, newWidth, newHeight);

    // Actualizar dimensiones mostradas
    document.getElementById(
      'imageDimensions'
    ).textContent = `${newWidth} x ${newHeight} px`;
    document.getElementById(
      'propDimensiones'
    ).textContent = `${newWidth} x ${newHeight} px`;

    mostrarNotificacion('success', 'Imagen redimensionada');
    actualizarEstado('Listo', 'success');
    agregarOperacion(`Redimensionar: ${newWidth}x${newHeight}`);
  });

// ========== HERRAMIENTA ROTAR ==========
btnRotar.addEventListener('click', () => {
  if (btnRotar.disabled) return;

  ocultarTodosLosControles();

  const rotateControls = document.getElementById('rotateControls');
  rotateControls.style.display = 'block';

  const dynamicControls = document.getElementById('dynamicControls');
  dynamicControls.innerHTML = '';
  dynamicControls.appendChild(rotateControls);

  marcarHerramientaActiva(btnRotar);
});

// ========== APLICAR ROTACIÓN ==========
const rotateButtons = document.querySelectorAll('.btn-rotate');
rotateButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const angle = parseInt(btn.dataset.angle);
    rotarImagen(angle);
  });
});

function rotarImagen(angle) {
  if (!currentImage) return;

  actualizarEstado('Rotando imagen...', 'processing');

  // Guardar datos actuales
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Crear canvas temporal
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  // Intercambiar dimensiones si es 90° o 270°
  if (angle === 90 || angle === 270) {
    tempCanvas.width = canvas.height;
    tempCanvas.height = canvas.width;
  } else {
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
  }

  // Rotar
  tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempCtx.rotate((angle * Math.PI) / 180);
  tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  // Actualizar canvas principal
  canvas.width = tempCanvas.width;
  canvas.height = tempCanvas.height;
  ctx.drawImage(tempCanvas, 0, 0);

  // Actualizar dimensiones
  document.getElementById(
    'imageDimensions'
  ).textContent = `${canvas.width} x ${canvas.height} px`;
  document.getElementById(
    'propDimensiones'
  ).textContent = `${canvas.width} x ${canvas.height} px`;

  mostrarNotificacion('success', `Imagen rotada ${angle}°`);
  actualizarEstado('Listo', 'success');
  agregarOperacion(`Rotar: ${angle}°`);
}

// ========== ZOOM ==========
btnZoomIn.addEventListener('click', () => {
  if (zoomLevel < 200) {
    zoomLevel += 10;
    aplicarZoom();
  }
});

btnZoomOut.addEventListener('click', () => {
  if (zoomLevel > 50) {
    zoomLevel -= 10;
    aplicarZoom();
  }
});

function aplicarZoom() {
  canvas.style.transform = `scale(${zoomLevel / 100})`;
  zoomLevelDisplay.textContent = `${zoomLevel}%`;
}

// ========== HISTORIAL DE OPERACIONES ==========
function agregarOperacion(operacion) {
  operationsHistory.push({
    timestamp: Date.now(),
    operacion: operacion,
  });

  operationsCount.textContent = `${operationsHistory.length} operaciones`;

  // Habilitar deshacer
  btnDeshacer.disabled = false;
}

// ========== DESHACER/REHACER (Simulado) ==========
btnDeshacer.addEventListener('click', () => {
  if (operationsHistory.length > 0) {
    mostrarNotificacion('info', 'Función deshacer en desarrollo');
    // Aquí iría la lógica de deshacer
  }
});

btnRehacer.addEventListener('click', () => {
  mostrarNotificacion('info', 'Función rehacer en desarrollo');
  // Aquí iría la lógica de rehacer
});

// ========== ATAJOS DE TECLADO ==========
document.addEventListener('keydown', (e) => {
  // Ctrl + Z: Deshacer
  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    btnDeshacer.click();
  }

  // Ctrl + Y: Rehacer
  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    btnRehacer.click();
  }

  // Ctrl + S: Descargar
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    if (!btnDescargar.disabled) {
      btnDescargar.click();
    }
  }
});

// ========== UTILIDADES ==========
function ocultarTodosLosControles() {
  document.getElementById('cropControls').style.display = 'none';
  document.getElementById('resizeControls').style.display = 'none';
  document.getElementById('rotateControls').style.display = 'none';
  document.getElementById('filterControls').style.display = 'none';

  // Restaurar mensaje por defecto
  document.getElementById('dynamicControls').innerHTML = `
    <p class="no-tool-selected">
      Selecciona una herramienta para ver sus opciones
    </p>
  `;
}

function marcarHerramientaActiva(boton) {
  // Remover active de todos
  document.querySelectorAll('.tool-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Agregar active al botón actual
  boton.classList.add('active');
}

function actualizarEstado(texto, tipo = 'success') {
  statusIndicator.textContent = texto;
  statusIndicator.className = 'status-indicator ' + tipo;
}

function mostrarNotificacion(tipo, mensaje) {
  // Aquí integrarías tu sistema de notificaciones transversal
  console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
  // alert(`${tipo}: ${mensaje}`); // Temporal
}

// ========== CONFIGURACIÓN ==========
document.getElementById('btnConfig').addEventListener('click', () => {
  mostrarNotificacion('info', 'Modal de configuración próximamente');
  // Aquí abrirías el modal de configuración
});

// ========== PERFIL ==========
document.getElementById('btnPerfil').addEventListener('click', () => {
  mostrarNotificacion('info', 'Opciones de perfil próximamente');
  // Aquí abrirías opciones de perfil
});

// ========== INICIALIZACIÓN ==========
console.log('✅ Editor Artify cargado correctamente');

// ========== HERRAMIENTA RECORTAR ==========
let cropMode = false;
let cropArea = { x: 0, y: 0, width: 0, height: 0 };
let isDragging = false;
let startX, startY;

btnRecortar.addEventListener('click', () => {
  if (btnRecortar.disabled) return;

  ocultarTodosLosControles();

  const cropControls = document.getElementById('cropControls');
  cropControls.style.display = 'block';

  const dynamicControls = document.getElementById('dynamicControls');
  dynamicControls.innerHTML = '';
  dynamicControls.appendChild(cropControls);

  marcarHerramientaActiva(btnRecortar);

  // Activar modo recorte
  activarModoRecorte();
});

function activarModoRecorte() {
  cropMode = true;
  canvas.style.cursor = 'crosshair';

  // Event listeners para dibujar área de recorte
  canvas.addEventListener('mousedown', iniciarRecorte);
  canvas.addEventListener('mousemove', dibujarRecorte);
  canvas.addEventListener('mouseup', finalizarRecorte);
}

function iniciarRecorte(e) {
  if (!cropMode) return;

  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
}

function dibujarRecorte(e) {
  if (!isDragging || !cropMode) return;

  const rect = canvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;

  cropArea.x = Math.min(startX, currentX);
  cropArea.y = Math.min(startY, currentY);
  cropArea.width = Math.abs(currentX - startX);
  cropArea.height = Math.abs(currentY - startY);

  // Redibujar canvas con área de recorte
  redibujarConRecorte();
}

function finalizarRecorte() {
  isDragging = false;
}

function redibujarConRecorte() {
  // Limpiar y redibujar imagen original
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(currentImage, 0, 0);

  // Dibujar overlay semi-transparente
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Limpiar área de recorte (mostrar original)
  ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
  ctx.drawImage(
    currentImage,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height
  );

  // Dibujar borde del área de recorte
  ctx.strokeStyle = '#28FFCE';
  ctx.lineWidth = 2;
  ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
}

// ========== APLICAR RECORTE ==========
document.getElementById('btnAplicarRecorte').addEventListener('click', () => {
  if (!currentImage || cropArea.width === 0 || cropArea.height === 0) {
    mostrarNotificacion('error', 'Debes seleccionar un área para recortar');
    return;
  }

  actualizarEstado('Recortando imagen...', 'processing');

  // Crear canvas temporal con el área recortada
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = cropArea.width;
  tempCanvas.height = cropArea.height;

  // Copiar área recortada
  tempCtx.drawImage(
    canvas,
    cropArea.x,
    cropArea.y,
    cropArea.width,
    cropArea.height,
    0,
    0,
    cropArea.width,
    cropArea.height
  );

  // Actualizar canvas principal
  canvas.width = cropArea.width;
  canvas.height = cropArea.height;
  ctx.drawImage(tempCanvas, 0, 0);

  // Desactivar modo recorte
  desactivarModoRecorte();

  // Actualizar dimensiones
  document.getElementById(
    'imageDimensions'
  ).textContent = `${cropArea.width} x ${cropArea.height} px`;
  document.getElementById(
    'propDimensiones'
  ).textContent = `${cropArea.width} x ${cropArea.height} px`;

  // Reset área de recorte
  cropArea = { x: 0, y: 0, width: 0, height: 0 };

  mostrarNotificacion('success', 'Imagen recortada correctamente');
  actualizarEstado('Listo', 'success');
  agregarOperacion('Recortar imagen');
});

function desactivarModoRecorte() {
  cropMode = false;
  canvas.style.cursor = 'default';

  // Remover event listeners
  canvas.removeEventListener('mousedown', iniciarRecorte);
  canvas.removeEventListener('mousemove', dibujarRecorte);
  canvas.removeEventListener('mouseup', finalizarRecorte);
}

// ========== RATIO DE RECORTE ==========
document.getElementById('cropRatio').addEventListener('change', (e) => {
  const ratio = e.target.value;
  mostrarNotificacion('info', `Proporción seleccionada: ${ratio}`);
  // Aquí implementarías la lógica para mantener la proporción al recortar
});

// ========== SISTEMA DE NOTIFICACIONES ==========
function mostrarNotificacion(tipo, mensaje, detalles = null) {
  // Crear elemento de notificación
  const notificacion = document.createElement('div');
  notificacion.className = `notification notification-${tipo}`;
  notificacion.setAttribute('role', 'alert');
  notificacion.setAttribute('aria-live', 'assertive');

  // Iconos según tipo
  const iconos = {
    error: '❌',
    warning: '⚠️',
    success: '✓',
    info: 'ℹ️',
  };

  // Títulos según tipo
  const titulos = {
    error: 'Error',
    warning: 'Advertencia',
    success: 'Éxito',
    info: 'Información',
  };

  // Estructura HTML
  notificacion.innerHTML = `
    <div class="notification-icon">${iconos[tipo]}</div>
    <div class="notification-content">
      <h4 class="notification-title">${titulos[tipo]}</h4>
      <p class="notification-message">${mensaje}</p>
      ${
        detalles
          ? `<ul class="notification-details">${detalles
              .map((d) => `<li>${d}</li>`)
              .join('')}</ul>`
          : ''
      }
    </div>
    <button class="notification-close" aria-label="Cerrar notificación">✕</button>
  `;

  // Agregar al DOM
  let container = document.getElementById('notificationsContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationsContainer';
    container.className = 'notifications-container';
    document.body.appendChild(container);
  }

  container.appendChild(notificacion);

  // Animar entrada
  setTimeout(() => {
    notificacion.classList.add('show');
  }, 10);

  // Botón cerrar
  const btnCerrar = notificacion.querySelector('.notification-close');
  btnCerrar.addEventListener('click', () => {
    cerrarNotificacion(notificacion);
  });

  // Auto-cerrar según tipo
  if (tipo === 'success') {
    setTimeout(() => cerrarNotificacion(notificacion), 3000);
  } else if (tipo === 'info') {
    setTimeout(() => cerrarNotificacion(notificacion), 2000);
  }
  // Error y warning NO se cierran automáticamente
}

function cerrarNotificacion(notificacion) {
  notificacion.classList.remove('show');
  notificacion.classList.add('hide');

  setTimeout(() => {
    notificacion.remove();
  }, 300);
}

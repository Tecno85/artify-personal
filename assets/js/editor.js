// ========== VARIABLES GLOBALES ==========
let currentImage = null;
let canvas;
let ctx;
let operationsHistory = [];
let currentTool = null;
let zoomLevel = 100;
let currentFilter = null;

// ========== ELEMENTOS DEL DOM ==========
let fileInput;
let btnSubir;
let btnDescargar;
let dropZone;
let canvasWrapper;
let imageInfo;
let btnTema;
let themeIcon;

// Botones de herramientas
let btnRecortar;
let btnRedimensionar;
let btnRotar;
let btnFiltros;
let submenuFiltros;

// Botones de historial
let btnDeshacer;
let btnRehacer;

// Zoom
let btnZoomIn;
let btnZoomOut;
let zoomLevelDisplay;

// Status bar
let operationsCount;
let statusIndicator;

// ========== CONSTANTES DE RESOLUCIÓN ==========
const RESOLUCION_MINIMA_ANCHO = 1024;
const RESOLUCION_MINIMA_ALTO = 768;
const LOCAL_STORAGE_KEY = 'artify_no_mostrar_modal_resolucion';

// ========== FUNCIONES DE RESOLUCIÓN ==========
function verificarResolucion() {
  const anchoVentana = window.innerWidth;
  const altoVentana = window.innerHeight;

  console.log(`📐 Resolución detectada: ${anchoVentana} x ${altoVentana}px`);

  // Verificar si el usuario pidió no volver a mostrar
  const noVolverAMostrarGuardado = sessionStorage.getItem(LOCAL_STORAGE_KEY);

  if (noVolverAMostrarGuardado === 'true') {
    console.log('ℹ️ Usuario optó por no volver a ver el modal');
    return;
  }

  // Si la resolución es menor a la mínima, mostrar modal
  if (
    anchoVentana < RESOLUCION_MINIMA_ANCHO ||
    altoVentana < RESOLUCION_MINIMA_ALTO
  ) {
    mostrarModalResolucion(anchoVentana, altoVentana);
  }
}

function mostrarModalResolucion(ancho, alto) {
  const modal = document.getElementById('modalResolucion');
  const resolucionActual = document.getElementById('resolucionActual');

  if (!modal || !resolucionActual) {
    console.error('❌ No se encontró el modal de resolución en el DOM');
    return;
  }

  // Actualizar resolución actual
  resolucionActual.textContent = `${ancho} x ${alto}px`;

  // Mostrar modal
  modal.style.display = 'flex';

  console.log('⚠️ Modal de resolución mostrado');
}

// Hacer las funciones globales para que puedan ser llamadas desde el HTML
window.cerrarModalResolucion = function () {
  const modal = document.getElementById('modalResolucion');
  if (modal) {
    modal.style.display = 'none';
    console.log('✅ Modal de resolución cerrado');
  }
};

window.noVolverAMostrar = function () {
  // Guardar preferencia en sessionStorage (en lugar de localStorage)
  sessionStorage.setItem(LOCAL_STORAGE_KEY, 'true');

  // Cerrar modal
  window.cerrarModalResolucion();

  console.log(
    '✅ Preferencia guardada: No volver a mostrar modal de resolución'
  );

  // Mostrar notificación de confirmación
  if (typeof mostrarNotificacion === 'function') {
    mostrarNotificacion(
      'info',
      'Preferencia guardada. No volveremos a mostrar este mensaje en esta sesión.'
    );
  }
};

// ========== CARGAR DATOS DEL USUARIO E INICIALIZAR ==========
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando Artify Editor...');

  // Verificar resolución al cargar
  verificarResolucion();

  // Verificar si hay usuario logueado
  const usuarioData = sessionStorage.getItem('artifyUser');
  const token = sessionStorage.getItem('artifyToken');

  if (usuarioData && token) {
    try {
      const usuario = JSON.parse(usuarioData);
      const userNameElement = document.getElementById('userName');
      if (userNameElement) {
        userNameElement.textContent = `${usuario.nombres} ${usuario.apellidos}`;
      }
      console.log('✅ Usuario autenticado:', usuario.nombres);
    } catch (error) {
      console.warn('⚠️ Error al parsear datos del usuario');
    }
  } else {
    console.log('ℹ️ Usuario invitado');
  }

  // Inicializar elementos del DOM
  canvas = document.getElementById('mainCanvas');
  if (canvas) ctx = canvas.getContext('2d');

  fileInput = document.getElementById('fileInput');
  btnSubir = document.getElementById('btnSubir');
  btnDescargar = document.getElementById('btnDescargar');
  dropZone = document.getElementById('dropZone');
  canvasWrapper = document.getElementById('canvasWrapper');
  imageInfo = document.getElementById('imageInfo');
  btnTema = document.getElementById('btnTema');
  themeIcon = document.getElementById('themeIcon');

  // Botones de herramientas
  btnRecortar = document.getElementById('btnRecortar');
  btnRedimensionar = document.getElementById('btnRedimensionar');
  btnRotar = document.getElementById('btnRotar');
  btnFiltros = document.getElementById('btnFiltros');
  submenuFiltros = document.getElementById('submenuFiltros');

  // Botones de historial
  btnDeshacer = document.getElementById('btnDeshacer');
  btnRehacer = document.getElementById('btnRehacer');

  // Zoom
  btnZoomIn = document.getElementById('btnZoomIn');
  btnZoomOut = document.getElementById('btnZoomOut');
  zoomLevelDisplay = document.getElementById('zoomLevel');

  // Status bar
  operationsCount = document.getElementById('operationsCount');
  statusIndicator = document.getElementById('statusIndicator');

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
    const tiposValidos = ['image/jpeg', 'image/png'];
    if (!tiposValidos.includes(file.type)) {
      mostrarNotificacion('error', 'Formato no válido. Solo JPG y PNG');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      mostrarNotificacion('error', 'La imagen supera el límite de 10MB');
      return;
    }

    actualizarEstado('Cargando imagen...', 'processing');

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        currentImage = img;

        mostrarCanvas();
        habilitarHerramientas();
        actualizarPropiedades(file, img);
        actualizarEstado('Listo', 'success');
        mostrarNotificacion('success', 'Imagen cargada correctamente');
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

  function mostrarCanvas() {
    dropZone.style.display = 'none';
    canvasWrapper.style.display = 'flex';
    imageInfo.style.display = 'block';
  }

  function habilitarHerramientas() {
    btnDescargar.disabled = false;
    btnRecortar.disabled = false;
    btnRedimensionar.disabled = false;
    btnRotar.disabled = false;
    btnFiltros.disabled = false;
  }

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
    document.getElementById(
      'imageDimensions'
    ).textContent = `${img.width} x ${img.height} px`;
  }

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
  if (btnTema) {
    btnTema.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      if (themeIcon) {
        themeIcon.src = isLight
          ? '../assets/icons/sun.svg'
          : '../assets/icons/moon.svg';
      }
    });
  }

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
      mostrarControlesFiltro(filter);
      filtrosButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function mostrarControlesFiltro(filter) {
    ocultarTodosLosControles();
    const filterControls = document.getElementById('filterControls');
    filterControls.style.display = 'block';
    const dynamicControls = document.getElementById('dynamicControls');
    dynamicControls.innerHTML = '';
    dynamicControls.appendChild(filterControls);
  }

  // ========== APLICAR FILTRO ==========
  document.getElementById('btnAplicarFiltro').addEventListener('click', () => {
    if (!currentImage || !currentFilter) return;

    actualizarEstado('Aplicando filtro...', 'processing');

    const intensity = document.getElementById('filterIntensity').value / 100;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

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

    const dynamicControls = document.getElementById('dynamicControls');
    dynamicControls.innerHTML = '';
    dynamicControls.appendChild(resizeControls);

    document.getElementById('resizeWidth').value = canvas.width;
    document.getElementById('resizeHeight').value = canvas.height;

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

      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(currentImage, 0, 0, newWidth, newHeight);

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

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    if (angle === 90 || angle === 270) {
      tempCanvas.width = canvas.height;
      tempCanvas.height = canvas.width;
    } else {
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
    }

    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tempCtx.rotate((angle * Math.PI) / 180);
    tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

    canvas.width = tempCanvas.width;
    canvas.height = tempCanvas.height;
    ctx.drawImage(tempCanvas, 0, 0);

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
    btnDeshacer.disabled = false;
  }

  // ========== DESHACER/REHACER ==========
  btnDeshacer.addEventListener('click', () => {
    if (operationsHistory.length > 0) {
      mostrarNotificacion('info', 'Función deshacer en desarrollo');
    }
  });

  btnRehacer.addEventListener('click', () => {
    mostrarNotificacion('info', 'Función rehacer en desarrollo');
  });

  // ========== ATAJOS DE TECLADO ==========
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      btnDeshacer.click();
    }

    if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      btnRehacer.click();
    }

    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (!btnDescargar.disabled) {
        btnDescargar.click();
      }
    }
  });

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
    activarModoRecorte();
  });

  function activarModoRecorte() {
    cropMode = true;
    canvas.style.cursor = 'crosshair';

    canvas.addEventListener('pointerdown', iniciarRecorte);
    canvas.addEventListener('pointermove', dibujarRecorte);
    canvas.addEventListener('pointerup', finalizarRecorte);
    canvas.addEventListener('pointercancel', finalizarRecorte);
  }

  function iniciarRecorte(e) {
    if (!cropMode) return;

    isDragging = true;
    if (e.pointerId && canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (err) {}
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;
  }

  function dibujarRecorte(e) {
    if (!isDragging || !cropMode) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const currentX = (e.clientX - rect.left) * scaleX;
    const currentY = (e.clientY - rect.top) * scaleY;

    cropArea.x = Math.min(startX, currentX);
    cropArea.y = Math.min(startY, currentY);
    cropArea.width = Math.abs(currentX - startX);
    cropArea.height = Math.abs(currentY - startY);

    redibujarConRecorte();
  }

  function finalizarRecorte(e) {
    isDragging = false;
    try {
      if (e && e.pointerId && canvas.releasePointerCapture) {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
  }

  function redibujarConRecorte() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentImage, 0, 0);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = cropArea.width;
    tempCanvas.height = cropArea.height;

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

    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    ctx.drawImage(tempCanvas, 0, 0);

    const newDataUrl = canvas.toDataURL();
    const newImg = new Image();
    newImg.onload = () => {
      currentImage = newImg;
    };
    newImg.src = newDataUrl;

    desactivarModoRecorte();

    document.getElementById(
      'imageDimensions'
    ).textContent = `${cropArea.width} x ${cropArea.height} px`;
    document.getElementById(
      'propDimensiones'
    ).textContent = `${cropArea.width} x ${cropArea.height} px`;

    cropArea = { x: 0, y: 0, width: 0, height: 0 };

    mostrarNotificacion('success', 'Imagen recortada correctamente');
    actualizarEstado('Listo', 'success');
    agregarOperacion('Recortar imagen');
  });

  function desactivarModoRecorte() {
    cropMode = false;
    canvas.style.cursor = 'default';

    canvas.removeEventListener('pointerdown', iniciarRecorte);
    canvas.removeEventListener('pointermove', dibujarRecorte);
    canvas.removeEventListener('pointerup', finalizarRecorte);
    canvas.removeEventListener('pointercancel', finalizarRecorte);
  }

  // ========== RATIO DE RECORTE ==========
  document.getElementById('cropRatio').addEventListener('change', (e) => {
    const ratio = e.target.value;
    mostrarNotificacion('info', `Proporción seleccionada: ${ratio}`);
  });

  // ========== UTILIDADES ==========
  function ocultarTodosLosControles() {
    document.getElementById('cropControls').style.display = 'none';
    document.getElementById('resizeControls').style.display = 'none';
    document.getElementById('rotateControls').style.display = 'none';
    document.getElementById('filterControls').style.display = 'none';

    document.getElementById('dynamicControls').innerHTML = `
      <p class="no-tool-selected">
        Selecciona una herramienta para ver sus opciones
      </p>
    `;
  }

  function marcarHerramientaActiva(boton) {
    document.querySelectorAll('.tool-btn').forEach((btn) => {
      btn.classList.remove('active');
    });
    boton.classList.add('active');
  }

  function actualizarEstado(texto, tipo = 'success') {
    statusIndicator.textContent = texto;
    statusIndicator.className = 'status-indicator ' + tipo;
  }

  // ========== SISTEMA DE NOTIFICACIONES ==========
  function mostrarNotificacion(tipo, mensaje, detalles = null) {
    const notificacion = document.createElement('div');
    notificacion.className = `notification notification-${tipo}`;
    notificacion.setAttribute('role', 'alert');
    notificacion.setAttribute('aria-live', 'assertive');

    const iconos = {
      error: '❌',
      warning: '⚠️',
      success: '✓',
      info: 'ℹ️',
    };

    const titulos = {
      error: 'Error',
      warning: 'Advertencia',
      success: 'Éxito',
      info: 'Información',
    };

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

    let container = document.getElementById('notificationsContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notificationsContainer';
      container.className = 'notifications-container';
      document.body.appendChild(container);
    }

    container.appendChild(notificacion);

    setTimeout(() => {
      notificacion.classList.add('show');
    }, 10);

    const btnCerrar = notificacion.querySelector('.notification-close');
    btnCerrar.addEventListener('click', () => {
      cerrarNotificacion(notificacion);
    });

    if (tipo === 'success') {
      setTimeout(() => cerrarNotificacion(notificacion), 3000);
    } else if (tipo === 'info') {
      setTimeout(() => cerrarNotificacion(notificacion), 2000);
    }
  }

  function cerrarNotificacion(notificacion) {
    notificacion.classList.remove('show');
    notificacion.classList.add('hide');

    setTimeout(() => {
      notificacion.remove();
    }, 300);
  }

  // ========== CONFIGURACIÓN Y PERFIL ==========
  document.getElementById('btnConfig').addEventListener('click', () => {
    mostrarNotificacion('info', 'Modal de configuración próximamente');
  });

  document.getElementById('btnPerfil').addEventListener('click', () => {
    mostrarNotificacion('info', 'Opciones de perfil próximamente');
  });

  console.log('✅ Editor Artify cargado correctamente');
});

// ========== VERIFICAR RESOLUCIÓN AL REDIMENSIONAR ==========
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    verificarResolucion();
  }, 500);
});

// ============================================================================
// ARTIFY - REQUERIMIENTOS FUNCIONALES RF-10 y RF-11
// ============================================================================
// Agregar este código al FINAL de tu archivo editor.js
// ============================================================================

// ========== CONSTANTES PARA PREFERENCIAS ==========
const PREFERENCIAS_KEY = 'artify_preferencias';
const PREFERENCIAS_DEFAULT = {
  notificacionesHabilitadas: true,
  calidadExportacion: 'alta',
  formatoDefecto: 'png',
  autoguardado: false,
};

// ========== RF-10: GESTIÓN DE PREFERENCIAS ==========

function cargarPreferencias() {
  try {
    const preferenciasGuardadas = localStorage.getItem(PREFERENCIAS_KEY);

    if (preferenciasGuardadas) {
      const preferencias = JSON.parse(preferenciasGuardadas);
      console.log('✅ Preferencias cargadas:', preferencias);
      return preferencias;
    }

    console.log('ℹ️ Usando preferencias por defecto');
    return { ...PREFERENCIAS_DEFAULT };
  } catch (error) {
    console.error('❌ Error al cargar preferencias:', error);
    return { ...PREFERENCIAS_DEFAULT };
  }
}

function guardarPreferencias(preferencias) {
  try {
    localStorage.setItem(PREFERENCIAS_KEY, JSON.stringify(preferencias));
    console.log('✅ Preferencias guardadas correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al guardar preferencias:', error);
    if (typeof mostrarNotificacion === 'function') {
      mostrarNotificacion('error', 'No se pudieron guardar las preferencias');
    }
    return false;
  }
}

function aplicarPreferencias(preferencias) {
  console.log('✅ Preferencias aplicadas al editor:', preferencias);
}

function abrirModalConfiguracion() {
  const modal = document.getElementById('modalConfiguracion');
  if (!modal) {
    console.error('❌ Modal de configuración no encontrado');
    return;
  }

  const preferencias = cargarPreferencias();

  const usuarioData = sessionStorage.getItem('artifyUser');
  if (usuarioData) {
    try {
      const usuario = JSON.parse(usuarioData);
      const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;

      const nombreElement = document.getElementById('configUserNombre');
      const emailElement = document.getElementById('configUserEmail');
      const sesionElement = document.getElementById('configUserUltimaSesion');

      if (nombreElement) nombreElement.textContent = nombreCompleto;
      if (emailElement) emailElement.textContent = usuario.correo;

      if (sesionElement) {
        const ahora = new Date();
        sesionElement.textContent = ahora.toLocaleString('es-CO', {
          dateStyle: 'short',
          timeStyle: 'short',
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de usuario:', error);
    }
  }

  const notificacionesCheckbox = document.getElementById(
    'configNotificaciones'
  );
  const calidadSelect = document.getElementById('configCalidadExportacion');
  const formatoSelect = document.getElementById('configFormatoDefecto');
  const autoguardadoCheckbox = document.getElementById('configAutoguardado');

  if (notificacionesCheckbox)
    notificacionesCheckbox.checked = preferencias.notificacionesHabilitadas;
  if (calidadSelect) calidadSelect.value = preferencias.calidadExportacion;
  if (formatoSelect) formatoSelect.value = preferencias.formatoDefecto;
  if (autoguardadoCheckbox)
    autoguardadoCheckbox.checked = preferencias.autoguardado;

  modal.style.display = 'flex';
  console.log('✅ Modal de configuración abierto');
}

function cerrarModalConfiguracion() {
  const modal = document.getElementById('modalConfiguracion');
  if (modal) {
    modal.style.display = 'none';
    console.log('✅ Modal de configuración cerrado');
  }
}

function guardarConfiguracion() {
  const notificacionesCheckbox = document.getElementById(
    'configNotificaciones'
  );
  const calidadSelect = document.getElementById('configCalidadExportacion');
  const formatoSelect = document.getElementById('configFormatoDefecto');
  const autoguardadoCheckbox = document.getElementById('configAutoguardado');

  const nuevasPreferencias = {
    notificacionesHabilitadas: notificacionesCheckbox
      ? notificacionesCheckbox.checked
      : true,
    calidadExportacion: calidadSelect ? calidadSelect.value : 'alta',
    formatoDefecto: formatoSelect ? formatoSelect.value : 'png',
    autoguardado: autoguardadoCheckbox ? autoguardadoCheckbox.checked : false,
  };

  const guardado = guardarPreferencias(nuevasPreferencias);

  if (guardado) {
    aplicarPreferencias(nuevasPreferencias);
    if (typeof mostrarNotificacion === 'function') {
      mostrarNotificacion('success', 'Configuración guardada correctamente');
    }
    cerrarModalConfiguracion();
  }
}

// ========== RF-11: CERRAR SESIÓN SEGURA ==========

function abrirModalPerfil() {
  const modal = document.getElementById('modalPerfil');
  if (!modal) {
    console.error('❌ Modal de perfil no encontrado');
    return;
  }

  const usuarioData = sessionStorage.getItem('artifyUser');
  if (usuarioData) {
    try {
      const usuario = JSON.parse(usuarioData);
      const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;

      const nombreElement = document.getElementById('perfilNombre');
      const emailElement = document.getElementById('perfilEmail');

      if (nombreElement) nombreElement.textContent = nombreCompleto;
      if (emailElement) emailElement.textContent = usuario.correo;

      if (typeof operationsHistory !== 'undefined') {
        const operacionesElement = document.getElementById('perfilOperaciones');
        if (operacionesElement) {
          operacionesElement.textContent = operationsHistory.length;
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de usuario:', error);
    }
  }

  modal.style.display = 'flex';
  console.log('✅ Modal de perfil abierto');
}

function cerrarModalPerfil() {
  const modal = document.getElementById('modalPerfil');
  if (modal) {
    modal.style.display = 'none';
    console.log('✅ Modal de perfil cerrado');
  }
}

function mostrarConfirmacionLogout() {
  const modal = document.getElementById('modalConfirmarLogout');
  if (!modal) {
    console.error('❌ Modal de confirmación no encontrado');
    return;
  }

  modal.style.display = 'flex';
  console.log('✅ Modal de confirmación de logout mostrado');
}

function cerrarConfirmacionLogout() {
  const modal = document.getElementById('modalConfirmarLogout');
  if (modal) {
    modal.style.display = 'none';
    console.log('✅ Modal de confirmación cerrado');
  }
}

function cerrarSesionSegura() {
  console.log('🔐 Iniciando cierre de sesión seguro...');

  sessionStorage.removeItem('artifyUser');
  sessionStorage.removeItem('artifyToken');
  sessionStorage.removeItem('artify_no_mostrar_modal_resolucion');

  console.log('✅ Datos de sesión eliminados');

  if (typeof mostrarNotificacion === 'function') {
    mostrarNotificacion('success', 'Sesión cerrada correctamente');
  }

  setTimeout(() => {
    console.log('🏠 Redirigiendo a la página de inicio...');
    window.location.href = '../index.html';
  }, 1000);
}

// ========== INICIALIZACIÓN DE EVENTOS ==========

function inicializarRF10yRF11() {
  console.log('🔧 Inicializando RF-10 y RF-11...');

  const preferencias = cargarPreferencias();
  aplicarPreferencias(preferencias);

  // MODAL DE CONFIGURACIÓN
  const btnConfig = document.getElementById('btnConfig');
  const btnCerrarConfig = document.getElementById('btnCerrarConfig');
  const btnCancelarConfig = document.getElementById('btnCancelarConfig');
  const btnGuardarConfig = document.getElementById('btnGuardarConfig');

  if (btnConfig) {
    btnConfig.addEventListener('click', abrirModalConfiguracion);
  }

  if (btnCerrarConfig) {
    btnCerrarConfig.addEventListener('click', cerrarModalConfiguracion);
  }

  if (btnCancelarConfig) {
    btnCancelarConfig.addEventListener('click', cerrarModalConfiguracion);
  }

  if (btnGuardarConfig) {
    btnGuardarConfig.addEventListener('click', guardarConfiguracion);
  }

  const modalConfig = document.getElementById('modalConfiguracion');
  if (modalConfig) {
    modalConfig.addEventListener('click', (e) => {
      if (e.target === modalConfig) {
        cerrarModalConfiguracion();
      }
    });
  }

  // MODAL DE PERFIL
  const btnPerfil = document.getElementById('btnPerfil');
  const btnCerrarPerfil = document.getElementById('btnCerrarPerfil');
  const btnAbrirConfigDesdePerfil = document.getElementById(
    'btnAbrirConfigDesdePerfil'
  );
  const btnCerrarSesion = document.getElementById('btnCerrarSesion');

  if (btnPerfil) {
    btnPerfil.addEventListener('click', abrirModalPerfil);
  }

  if (btnCerrarPerfil) {
    btnCerrarPerfil.addEventListener('click', cerrarModalPerfil);
  }

  if (btnAbrirConfigDesdePerfil) {
    btnAbrirConfigDesdePerfil.addEventListener('click', () => {
      cerrarModalPerfil();
      abrirModalConfiguracion();
    });
  }

  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', () => {
      cerrarModalPerfil();
      mostrarConfirmacionLogout();
    });
  }

  const modalPerfil = document.getElementById('modalPerfil');
  if (modalPerfil) {
    modalPerfil.addEventListener('click', (e) => {
      if (e.target === modalPerfil) {
        cerrarModalPerfil();
      }
    });
  }

  // MODAL DE CONFIRMACIÓN LOGOUT
  const btnCancelarLogout = document.getElementById('btnCancelarLogout');
  const btnConfirmarLogout = document.getElementById('btnConfirmarLogout');

  if (btnCancelarLogout) {
    btnCancelarLogout.addEventListener('click', cerrarConfirmacionLogout);
  }

  if (btnConfirmarLogout) {
    btnConfirmarLogout.addEventListener('click', cerrarSesionSegura);
  }

  const modalConfirmarLogout = document.getElementById('modalConfirmarLogout');
  if (modalConfirmarLogout) {
    modalConfirmarLogout.addEventListener('click', (e) => {
      if (e.target === modalConfirmarLogout) {
        cerrarConfirmacionLogout();
      }
    });
  }

  console.log('✅ RF-10 y RF-11 inicializados correctamente');
}

// ========== LLAMAR ESTA FUNCIÓN EN TU DOMContentLoaded EXISTENTE ==========
// Dentro de tu window.addEventListener('DOMContentLoaded', () => { ... })
// Agrega esta línea:
// inicializarRF10yRF11();

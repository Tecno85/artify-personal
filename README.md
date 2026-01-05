#  ![Logo del Proyecto](./assets/icons/modx.svg) Artify - Editor de Imágenes Web

**Artify** es un editor de imágenes web desarrollado 100% con tecnologías frontend (HTML, CSS, JavaScript vanilla). Permite a los usuarios editar imágenes de manera intuitiva directamente desde el navegador, sin necesidad de instalar software adicional.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Uso](#-instalación-y-uso)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Atajos de Teclado](#%EF%B8%8F-atajos-de-teclado)
- [Navegadores Soportados](#-navegadores-soportados)
- [Notas Importantes](#-notas-importantes)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Autor](#-autor)

---

## ✨ Características

- 🖼️ **Carga de imágenes** mediante drag & drop o selector de archivos
- ✂️ **Recortar** imágenes con proporciones personalizables (libre, 1:1, 16:9, 4:3, 3:2)
- 📏 **Redimensionar** con opción de mantener proporción
- 🔄 **Rotar** imágenes en ángulos de 90°, 180° y 270°
- 🎨 **Filtros artísticos**: Blanco y Negro, Sepia, Brillo, Contraste (con intensidad ajustable)
- 🔄 **Convertir formato**: PNG, JPEG, WebP con ajuste de calidad
- ⏪ **Deshacer/Rehacer** operaciones (historial de hasta 20 pasos)
- 🔍 **Zoom** in/out (50% - 200%)
- 💾 **Descarga** con configuración personalizable de formato y calidad
- 🎯 **Interfaz intuitiva** con 3 paneles (herramientas, canvas, propiedades)
- 🌙 **Tema oscuro** moderno y profesional
- 📱 **Advertencia de resolución** para dispositivos pequeños
- 👤 **Sistema de usuario** con login y registro (frontend)
- ⚙️ **Configuración persistente** de preferencias del editor

---

## 🛠️ Tecnologías

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno con variables CSS y grid/flexbox
- **JavaScript (Vanilla)** - Lógica del editor con Canvas API
- **Canvas API** - Manipulación de imágenes
- **LocalStorage** - Persistencia de preferencias y backup
- **SessionStorage** - Gestión de sesión de usuario

**Sin dependencias externas** - Todo el código es nativo del navegador.

---

## 📁 Estructura del Proyecto

```
artify/
├── index.html              # Página principal (landing/home)
├── README.md               # Este archivo
├── .gitignore             # Archivos ignorados por Git
│
├── pages/                  # Páginas HTML
│   ├── editor.html        # Editor principal
│   ├── login.html         # Inicio de sesión
│   └── registro.html      # Registro de usuario
│
└── assets/                # Recursos del proyecto
    ├── css/               # Hojas de estilo
    │   ├── editor.css
    │   ├── login.css
    │   ├── registro.css
    │   └── styles.css     # Estilos del index
    │
    ├── js/                # Scripts JavaScript
    │   ├── editor.js      # Lógica del editor
    │   ├── login.js
    │   └── registro.js
    │
    ├── fonts/             # Fuentes personalizadas
    │   ├── Paytone_One/
    │   └── Inconsolata/
    │
    ├── icons/             # Iconos SVG
    │   └── *.svg
    │
    └── images/            # Imágenes del proyecto
        └── *.svg/png
```

---

## 🚀 Cómo Usar

### 🌐 Prueba en línea (GitHub Pages)

**Simplemente abre este link y comienza a editar:**

👉 **[https://tecno85.github.io/Artify/](https://tecno85.github.io/Artify/)** 👈


---

### 💻 Uso Local (Desarrolladores)

Si quieres ejecutarlo localmente:

```bash
git clone https://tecno85.github.io/Artify/
cd artify
```

Luego abre `index.html` en tu navegador, o usa un servidor local:

```bash
# Con Python
python -m http.server 8000

# Con Node.js
npx http-server -p 8000
```

Accede en: `http://localhost:8000`

---

### 🎯 Acceso Rápido al Editor

Si solo quieres probar el editor sin registro/login:

👉 **[Ir directamente al editor](https://tecno85.github.io/Artify/)** 👈

---

## 🎯 Funcionalidades Principales

### 1. Cargar Imagen
- **Drag & Drop**: Arrastra una imagen al área punteada
- **Selector de archivos**: Haz clic en "Subir Imagen"
- **Formatos soportados**: JPG, PNG, WebP, AVIF
- **Tamaño máximo**: 10 MB

### 2. Herramientas de Edición

#### ✂️ Recortar
- Selecciona el área deseada arrastrando sobre la imagen
- Elige proporción: Libre, 1:1, 16:9, 4:3, 3:2
- Guías visuales de tercios incluidas
- Aplica el recorte con el botón "Aplicar Recorte"

#### 📏 Redimensionar
- Ingresa nuevas dimensiones en píxeles
- Opción de mantener proporción automáticamente
- Validación de valores mínimos

#### 🔄 Rotar
- Rotación rápida: 90°, 180°, 270°
- Ajuste automático de dimensiones del canvas

#### 🎨 Filtros
- **Blanco y Negro**: Convierte a escala de grises
- **Sepia**: Efecto vintage
- **Brillo**: Ajusta luminosidad
- **Contraste**: Intensifica diferencias tonales
- Todos con **intensidad ajustable** (0-100%)

#### 🔄 Convertir Formato
- Convierte entre PNG, JPEG y WebP
- Ajuste de calidad para JPEG/WebP (alta, media, baja)
- Previsualización del tamaño resultante

### 3. Controles Adicionales

- **Zoom**: 50% - 200% (botones +/-)
- **Deshacer/Rehacer**: Historial de hasta 20 operaciones
- **Propiedades**: Visualiza nombre, tamaño, dimensiones y formato
- **Descarga**: Exporta con el formato y calidad configurados

### 4. Configuración y Perfil

- **Preferencias del editor**:
  - Calidad de exportación por defecto
  - Formato por defecto para descargas
  - Activar/desactivar autoguardado

- **Información de usuario**:
  - Nombre completo
  - Correo electrónico
  - Última sesión

---

## 🌐 Navegadores Soportados

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome    | 90+            |
| Firefox   | 88+            |
| Edge      | 90+            |
| Safari    | 14+            |
| Opera     | 76+            |

> **Nota**: Se requiere soporte para Canvas API y FileReader API.

---

## 📌 Notas Importantes

### Resolución Recomendada
- **Mínima**: 1366 x 768 px
- **Óptima**: 1920 x 1080 px o superior
- El sistema mostrará una advertencia si la resolución es menor a la recomendada

### Limitaciones Actuales
- No hay backend, todo es procesado en el navegador
- Las sesiones de usuario no persisten entre cierres del navegador
- El historial de operaciones se limita a 20 pasos para optimizar memoria
- El autoguardado usa `localStorage` (puede fallar con imágenes muy grandes)

### Consideraciones de Rendimiento
- Imágenes muy grandes (>8000x8000 px) pueden causar lentitud
- El navegador puede limitar el uso de memoria para Canvas
- Se recomienda usar imágenes de resolución razonable (<5000x5000 px)

---

## 👨‍💻 Autor

**Tu Nombre**
- GitHub: [Tecno85](https://github.com/Tecno85)
- Email: tecno85@gmail.com

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 🔮 Roadmap Futuro

- [ ] Soporte para más formatos (AVIF optimizado, TIFF)
- [ ] Más filtros avanzados (blur, sharpen, pixelate)
- [ ] Herramienta de texto sobre imágenes
- [ ] Capas y máscaras
- [ ] Backend para persistencia real de usuarios
- [ ] Exportación a PDF
- [ ] Procesamiento por lotes
- [ ] Integración con servicios en la nube

---

**¿Preguntas o sugerencias?** Abre un [issue](https://github.com/tu-usuario/artify/issues) en GitHub.

Hecho con ❤️ usando HTML, CSS y JavaScript vanilla.
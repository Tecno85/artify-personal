#  ![Logo del Proyecto](./frontend/assets/icons/modx.svg) Artify — Editor de Imágenes Web

<div align="center">

![Version](https://img.shields.io/badge/versión-2.0.0-4ae3f4?style=for-the-badge)
![Status](https://img.shields.io/badge/estado-activo-28ffce?style=for-the-badge)
![License](https://img.shields.io/badge/licencia-MIT-blue?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql)

**Artify** es un editor de imágenes web full stack desarrollado con HTML, CSS, JavaScript vanilla en el frontend y Node.js + Express + MySQL en el backend. Permite a los usuarios editar imágenes de manera intuitiva directamente desde el navegador, con autenticación real, gestión de sesiones y panel de administración.

[🌐 Ver Demo](#-prueba-en-línea) · [🐛 Reportar Bug](https://github.com/Tecno85/Artify/issues) · [💡 Sugerir Feature](https://github.com/Tecno85/Artify/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso](#-uso)
- [Funcionalidades Principales](#-funcionalidades-principales)
- [Panel de Administración](#-panel-de-administración)
- [Base de Datos](#-base-de-datos)
- [Atajos de Teclado](#️-atajos-de-teclado)
- [Navegadores Soportados](#-navegadores-soportados)
- [Estándares de Codificación](#-estándares-de-codificación)
- [Notas Importantes](#-notas-importantes)
- [Autor](#-autor)

---

## ✨ Características

### Frontend
- 🖼️ **Carga de imágenes** mediante drag & drop o selector de archivos
- ✂️ **Recortar** con proporciones personalizables (libre, 1:1, 16:9, 4:3, 3:2)
- 📏 **Redimensionar** con opción de mantener proporción
- 🔄 **Rotar** en ángulos de 90°, 180° y 270°
- 🎨 **Filtros artísticos**: Blanco y Negro, Sepia, Brillo, Contraste
- 🔄 **Convertir formato**: PNG, JPEG, WebP con ajuste de calidad
- ⏪ **Deshacer/Rehacer** (historial de hasta 20 pasos)
- 🔍 **Zoom** in/out (50% - 200%)
- 💾 **Descarga** con configuración personalizable
- 🌙 **Tema oscuro** moderno y profesional

### Backend y Autenticación
- 🔐 **Autenticación real** con MySQL y encriptación bcrypt
- 👤 **Sistema de roles**: administrador y usuario
- 🔑 **Redirección automática** según el rol al iniciar sesión
- 📊 **Registro de operaciones** en base de datos
- 🕐 **Control de sesiones** con cierre automático por inactividad
- ⚙️ **Configuración personalizada** por usuario en MySQL

### Panel de Administración
- 📋 **CRUD completo** sobre la tabla USUARIO
- 🔍 **Búsqueda en tiempo real** de usuarios
- 📈 **Estadísticas** de usuarios activos e inactivos
- 🛡️ **Acceso protegido** con credenciales de administrador

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Uso |
|------------|-----|
| HTML5 | Estructura semántica |
| CSS3 | Diseño con variables CSS, Grid y Flexbox |
| JavaScript Vanilla | Lógica del editor con Canvas API |
| Canvas API | Manipulación de imágenes |
| SessionStorage | Gestión de sesión de usuario |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 18+ | Entorno de ejecución |
| Express | 4+ | Framework del servidor |
| MySQL | 8.0+ | Base de datos relacional |
| mysql2 | Latest | Conector MySQL para Node.js |
| bcryptjs | Latest | Encriptación de contraseñas |
| dotenv | Latest | Variables de entorno |
| cors | Latest | Control de acceso entre orígenes |

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  HTML + CSS + JavaScript (Canvas API)           │
│  Páginas: index, login, registro, editor, admin │
└────────────────────┬────────────────────────────┘
                     │ HTTP / REST API
┌────────────────────▼────────────────────────────┐
│                   BACKEND                        │
│         Node.js + Express (server.js)           │
│  Endpoints: /api/login, /api/registro,          │
│  /api/sesion, /api/operacion, /api/admin/*      │
└────────────────────┬────────────────────────────┘
                     │ mysql2
┌────────────────────▼────────────────────────────┐
│                 BASE DE DATOS                    │
│                MySQL — artify_db                │
│  Tablas: USUARIO, SESION_EDICION, OPERACION,    │
│  CONFIGURACION, IMAGEN                          │
└─────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
Artify/
├── README.md                   # Documentación del proyecto
├── .gitignore                  # Archivos ignorados por Git
│
├── frontend/                   # Aplicación frontend organizada
│   ├── index.html              # Página principal
│   ├── pages/                  # Páginas HTML
│   │   ├── editor.html         # Editor de imágenes
│   │   ├── login.html          # Inicio de sesión
│   │   ├── registro.html       # Registro de usuario
│   │   └── admin.html          # Panel de administración
│   │
│   └── assets/                 # Recursos del proyecto
│       ├── css/                # Hojas de estilo
│       │   ├── admin.css
│       │   ├── editor.css
│       │   ├── index.css
│       │   ├── login.css
│       │   └── registro.css
│       │
│       ├── js/                 # Scripts JavaScript
│       │   ├── admin.js        # Lógica del panel de administración
│       │   ├── editor.js       # Lógica del editor
│       │   ├── login.js        # Lógica del login
│       │   └── registro.js     # Lógica del registro
│       │
│       ├── fonts/              # Fuentes tipográficas
│       │   ├── Inconsolata/
│       │   └── Paytone_One/
│       │
│       ├── icons/              # Iconos SVG
│       └── images/             # Imágenes del proyecto
│
├── backend/                    # Servidor Node.js
│   ├── server.js               # Servidor Express con todos los endpoints
│   ├── .env                    # Variables de entorno (no se sube a GitHub)
│   ├── package.json            # Dependencias del proyecto
│   └── node_modules/           # Módulos instalados (ignorado por Git)
│
└── docs/                       # Documentación técnica
    └── CODING_STANDARDS.md     # Estándares de codificación
```

---

## ✅ Requisitos Previos

Antes de instalar el proyecto asegúrate de tener:

- [Node.js](https://nodejs.org/) v18 o superior
- [MySQL](https://dev.mysql.com/downloads/) v8.0 o superior
- [Git](https://git-scm.com/)
- Un servidor HTTP local (como `npx http-server`)

---

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/Tecno85/Artify.git
cd Artify
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` dentro de la carpeta `backend/` con este contenido:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=artify_db
ADMIN_USER=admin@artify.com
ADMIN_PASSWORD=tu_contraseña_admin
```

### 4. Crear la base de datos en MySQL

```sql
CREATE DATABASE artify_db;
USE artify_db;
```

Luego ejecuta el script SQL del proyecto para crear todas las tablas.

### 5. Iniciar el backend

```bash
node server.js
```

### 6. Abrir el frontend

El frontend quedó organizado completamente dentro de `frontend/`.

- Si lo abres en navegador manualmente, usa `frontend/index.html`.
- Si usas un servidor estático, apunta la raíz del sitio a la carpeta `frontend/`.

Debes ver:
```
✅ Conectado a MySQL correctamente
🚀 Servidor corriendo en http://localhost:3000
```

### 6. Iniciar el frontend

En una terminal separada desde la raíz del proyecto:

```bash
npx http-server -p 8080
```

### 7. Abrir en el navegador

```
http://127.0.0.1:8080
```

---

## 🎯 Uso

### Usuario normal
1. Abre `frontend/index.html`
2. Regístrate en `frontend/pages/registro.html`
3. Inicia sesión en `frontend/pages/login.html`
3. El sistema te redirige automáticamente al editor
4. Edita tus imágenes y descárgalas

### Administrador
1. Inicia sesión con las credenciales de administrador
2. El sistema detecta el rol `admin` y redirige al panel
3. Gestiona todos los usuarios desde el panel de administración

---

## 🎨 Funcionalidades Principales

### Cargar Imagen
- **Drag & Drop** — Arrastra una imagen al área punteada
- **Selector de archivos** — Haz clic en "Subir Imagen"
- **Formatos soportados** — JPG, PNG, WebP, AVIF
- **Tamaño máximo** — 10 MB

### Herramientas de Edición

#### ✂️ Recortar
- Selecciona el área arrastrando sobre la imagen
- Proporciones: Libre, 1:1, 16:9, 4:3, 3:2
- Guías visuales de tercios incluidas

#### 📏 Redimensionar
- Ingresa nuevas dimensiones en píxeles
- Opción de mantener proporción automáticamente

#### 🔄 Rotar
- Rotación rápida: 90°, 180°, 270°
- Ajuste automático de dimensiones del canvas

#### 🎨 Filtros
- **Blanco y Negro** — Convierte a escala de grises
- **Sepia** — Efecto vintage
- **Brillo** — Ajusta luminosidad
- **Contraste** — Intensifica diferencias tonales
- Todos con intensidad ajustable (0-100%)

#### 🔄 Convertir Formato
- Convierte entre PNG, JPEG y WebP
- Ajuste de calidad para JPEG/WebP

---

## 🛡️ Panel de Administración

El panel de administración implementa un **CRUD completo** sobre la tabla USUARIO que es la entidad fuerte no dependiente del modelo de datos.

| Operación | Descripción |
|-----------|-------------|
| **SELECT** | Lista todos los usuarios con búsqueda en tiempo real |
| **INSERT** | Agrega nuevos usuarios con validación de campos |
| **UPDATE** | Edita datos y estado de usuarios existentes |
| **DELETE** | Elimina usuarios con confirmación previa |

**Acceso:** Usuarios con rol `admin` son redirigidos automáticamente al panel al iniciar sesión.

---

## 🗄️ Base de Datos

### Tablas principales

```
artify_db
├── USUARIO           → Entidad fuerte — usuarios del sistema
├── SESION_EDICION    → Sesiones de edición por usuario
├── OPERACION         → Registro de operaciones realizadas
├── CONFIGURACION     → Configuración personalizada por usuario
└── IMAGEN            → Imágenes procesadas por usuario
```

### Vista disponible

```sql
-- Resumen de usuarios activos con estadísticas
SELECT * FROM v_usuarios_activos;
```

---


## 🌐 Navegadores Soportados

| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Edge | 90+ |
| Safari | 14+ |
| Opera | 76+ |

> Requiere soporte para Canvas API y FileReader API.

---

## 📐 Estándares de Codificación

Este proyecto sigue estándares de codificación documentados. Consulta el archivo [`docs/CODING_STANDARDS.md`](./docs/CODING_STANDARDS.md) para más detalles sobre:

- Nomenclatura de variables, constantes y parámetros
- Declaración de funciones y métodos
- Estándares para HTML, CSS, JavaScript y Node.js
- Convenciones para comentarios
- Estándares para consultas SQL
- Convenciones para commits de Git

---

## 📌 Notas Importantes

### Resolución Recomendada
- **Mínima:** 1366 x 768 px
- **Óptima:** 1920 x 1080 px o superior

### Consideraciones de Rendimiento
- Imágenes mayores a 8000x8000 px pueden causar lentitud
- Se recomienda usar imágenes de resolución razonable

### Seguridad
- Las contraseñas se encriptan con bcrypt antes de almacenarse
- Las credenciales de la base de datos se manejan con variables de entorno
- El archivo `.env` nunca se sube al repositorio

---

## 👨‍💻 Autor

**Ivan Dario Madrid Daza**
- GitHub: [@Tecno85](https://github.com/Tecno85)
- Email: tecno85@gmail.com
- Programa: Análisis y Desarrollo de Software — SENA

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 🔮 Roadmap Futuro

- [ ] Implementar JWT para protección de endpoints
- [ ] Paginación en el historial de operaciones
- [ ] Más filtros avanzados (blur, sharpen, pixelate)
- [ ] Herramienta de texto sobre imágenes
- [ ] Exportación a PDF
- [ ] Procesamiento por lotes
- [ ] Despliegue en producción (Railway + PlanetScale)
- [ ] Integración con servicios en la nube

---

<div align="center">

Hecho con ❤️ usando HTML, CSS, JavaScript, Node.js y MySQL

**[⬆ Volver arriba](#-artify--editor-de-imágenes-web)**

</div>

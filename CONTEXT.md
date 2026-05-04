# CONTEXT.md — Proyecto Artify

> Archivo de contexto para continuar el desarrollo.
> Última actualización: Abril 2026

---

## 1. ¿Qué es Artify?

Artify es un editor de imágenes web full stack desarrollado como proyecto académico del programa **Análisis y Desarrollo de Software del SENA (Colombia)**.

**Estudiante:** Ivan Dario Madrid Daza
**GitHub:** https://github.com/Tecno85/Artify

Permite a los usuarios editar imágenes directamente en el navegador con autenticación real, gestión de sesiones, panel de administración y **API REST para consumo de terceros**.

---

## 2. Stack Tecnológico

### Frontend
- HTML5, CSS3, JavaScript Vanilla
- Canvas API para manipulación de imágenes
- SessionStorage para manejo de sesión

### Backend
| Componente | Tecnología | Puerto | Estado            |
| ---------- | ---------- | ------ | ----------------- |
| Servidor   | Node.js    | 3000   | ✅ Oficial y único |
| Framework  | Express.js | 3000   | ✅ Oficial y único |
| BD         | MySQL 8.0+ | 3306   | ✅ Oficial y único |

### Control de versiones
- Git + GitHub
- Convención: Ramas feature + Pull Requests

---

## 3. Estructura del Proyecto

```
Artify/
├── README.md
├── LICENSE
├── CONTEXT.md              # Este archivo
├── .gitignore
├── .env.example            # Plantilla de variables de entorno
├── package.json            # Scripts globales del proyecto
│
├── frontend/
│   ├── index.html
│   ├── pages/
│   │   ├── editor.html     # Editor de imágenes
│   │   ├── login.html      # Inicio de sesión
│   │   ├── registro.html   # Registro de usuario
│   │   └── admin.html      # Panel de administración CRUD
│   └── assets/
│       ├── css/            # admin.css, editor.css, login.css, registro.css, index.css
│       └── js/             # admin.js, editor.js, login.js, registro.js
│
├── backend/                # Node.js + Express (puerto 3000)
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── node_modules/
│
├── database/
│   └── artify_db.sql       # Script SQL completo
│
├── config/                 # Configuración centralizada
│   └── constants.js        # Constantes y valores globales
│
├── tests/                  # Pruebas automatizadas (a desarrollar)
│   └── api.test.js         # Tests de endpoints
│
├── scripts/                # Automatización
│   └── setup.sh            # Script de configuración inicial
│
└── docs/
    ├── API_ANALYTICS.md           # Documentación API REST Analytics
    ├── CODING_STANDARDS.md        # Estándares Node.js + JavaScript
    └── SKILL_ARTIFY.md            # Buenas prácticas del proyecto
```

---

## 4. Base de Datos

### Tablas de `artify_db`

```sql
-- Entidad fuerte no dependiente
USUARIO (
  usr_id_usuario      INT PK AUTO_INCREMENT,
  usr_nombres         VARCHAR(100),
  usr_apellidos       VARCHAR(100),
  usr_cedula          VARCHAR(20) UNIQUE,
  usr_fecha_nacimiento DATE,
  usr_correo          VARCHAR(150) UNIQUE,
  usr_contrasena      VARCHAR(255),    -- encriptada con bcrypt
  usr_fecha_registro  DATETIME,
  usr_ultimo_acceso   DATETIME,
  usr_sesion_activa   TINYINT(1),
  usr_estado_usuario  ENUM('activo','inactivo','suspendido'),
  usr_rol             ENUM('usuario','admin')
)

-- Tablas dependientes de USUARIO
SESION_EDICION   → ses_usr_id_usuario FK → USUARIO
OPERACION        → opr_usr_id_usuario FK → USUARIO
IMAGEN           → img_usr_id_usuario FK → USUARIO
CONFIGURACION    → cfg_usr_id_usuario FK → USUARIO (UNIQUE)

-- Vista
v_usuarios_activos → resumen de USUARIO + IMAGEN + SESION_EDICION
```

### Convención de nombres en BD
- Tablas en MAYÚSCULAS: `USUARIO`, `SESION_EDICION`
- Columnas con prefijo de tabla: `usr_`, `ses_`, `opr_`, `img_`, `cfg_`

---

## 5. Endpoints Implementados

### Autenticación
| Método | Ruta            | Descripción                                |
| ------ | --------------- | ------------------------------------------ |
| POST   | `/api/login`    | Login con bcrypt. Devuelve rol del usuario |
| POST   | `/api/registro` | Registro con bcrypt                        |

### Panel de Administración (CRUD sobre USUARIO)
| Método | Ruta                     | Descripción               |
| ------ | ------------------------ | ------------------------- |
| GET    | `/api/admin/usuarios`    | Lista todos los usuarios  |
| POST   | `/api/admin/usuario`     | Agrega usuario nuevo      |
| PUT    | `/api/admin/usuario/:id` | Edita usuario por ID      |
| DELETE | `/api/admin/usuario/:id` | Elimina usuario (cascada) |
| POST   | `/api/admin/login`       | Login del panel admin     |

### Sesiones y Operaciones
| Método | Ruta                    | Descripción                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/sesion/iniciar`   | Inicia sesión de edición      |
| POST   | `/api/sesion/cerrar`    | Cierra sesión de edición      |
| POST   | `/api/operacion`        | Registra operación de edición |
| POST   | `/api/imagen`           | Registra imagen procesada     |
| GET    | `/api/estadisticas/:id` | Estadísticas del usuario      |

### API REST Analytics (Nuevos - v1.0)
| Método | Ruta                                    | Descripción                        |
| ------ | --------------------------------------- | ---------------------------------- |
| GET    | `/api/v1/analytics/filtros-populares`   | Top filtros más usados             |
| GET    | `/api/v1/analytics/horarios-edicion`    | Horas pico de edición              |
| GET    | `/api/v1/analytics/formatos-preferidos` | Formatos de imagen más descargados |
| GET    | `/api/v1/analytics/tasa-conversion`     | % sesiones con cambios guardados   |

---

## 6. Funcionalidades Implementadas

### Autenticación y roles
- ✅ Registro con bcrypt
- ✅ Login con validación bcrypt
- ✅ Redirección por rol: `admin` → `admin.html`, `usuario` → `editor.html`
- ✅ Control de sesión activa
- ✅ Cierre automático de sesiones inactivas (cron job, 8h límite)

### Editor de imágenes
- ✅ Drag & drop para subir imágenes
- ✅ Recortar con proporciones (libre, 1:1, 16:9, 4:3, 3:2)
- ✅ Redimensionar con bloqueo de proporción
- ✅ Rotar (90°, 180°, 270°)
- ✅ Filtros: Blanco y Negro, Sepia, Brillo, Contraste, Convertir
- ✅ Deshacer/Rehacer (hasta 20 pasos)
- ✅ Zoom 50%-200%
- ✅ Registro de operaciones en MySQL

### Panel de administración
- ✅ Login protegido con credenciales en `.env`
- ✅ CRUD completo sobre tabla USUARIO
- ✅ Búsqueda en tiempo real
- ✅ Estadísticas de usuarios activos/inactivos
- ✅ Columna de rol (admin/usuario)

### API REST Analytics
- ✅ 4 endpoints de analytics (filtros, horarios, formatos, conversión)
- ✅ Documentación completa en `docs/API_ANALYTICS.md`
- ✅ Respuestas en formato JSON estructurado
- ✅ Código completamente comentado
- ✅ Versión v1 (permite futuras versiones sin conflictos)

---

## 7. Lógica Funcional Principal

La lógica funcional del proyecto es la **redirección por rol después del login**:

```javascript
// frontend/assets/js/login.js
if (data.usuario.rol === 'admin') {
  window.location.href = './admin.html';  // Va a frontend/pages/admin.html
} else {
  window.location.href = './editor.html'; // Va a frontend/pages/editor.html
}
```

---

## 8. Convenciones de Código

### JavaScript / Node.js
- Variables y funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Archivos y carpetas: `kebab-case`
- Comentarios de sección: `// ========== NOMBRE ==========`
- Logs con emojis: `✅ ❌ 📨 🎉 📊`
- Idioma: español (excepto términos técnicos: API, JWT, SQL, ID, REST)

### Commits (Conventional Commits en español)
```bash
feat(scope): nueva funcionalidad
fix(scope): corrección de error
docs: cambio en documentación
style: cambio de estilos
chore: mantenimiento
refactor: mejora sin cambio funcional
```

### Formato de respuestas API
```javascript
{
  ok: boolean,           // true = éxito, false = error
  mensaje: string,       // Descripción legible
  data?: any,            // Opcional: datos de respuesta
  meta?: {               // Opcional: metadata
    timestamp: string,
    total: number
  },
  error?: string         // Opcional: solo en errores 500
}
```

---

## 9. Variables de Entorno

### Backend Node.js (`backend/.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=contraseña
DB_NAME=artify_db
ADMIN_USER=admin@artify.com
ADMIN_PASSWORD=contraseña_admin
PORT=3000
NODE_ENV=development
```

### Importante
- El archivo `.env` **NUNCA** se sube a GitHub
- Usar `.env.example` como plantilla
- Cada dev crea su propio `.env` local

---

## 10. Cómo Correr el Proyecto

### Automatizado (Recomendado)
```bash
# Desde raíz del proyecto
bash scripts/setup.sh
```

### Manual

**Backend Node.js:**
```bash
cd backend
npm install
node server.js
# Corre en http://localhost:3000
```

**Frontend HTML:**
```bash
# Desde la raíz del proyecto
npx http-server -p 8080
# Abrir http://127.0.0.1:8080
```

**Base de datos:**
```bash
mysql -u root -p < database/artify_db.sql
```

---

## 11. Pruebas

### Con Postman
1. Descargar Postman (postman.com)
2. Crear request GET a: `http://localhost:3000/api/v1/analytics/filtros-populares`
3. Hacer click "Send"
4. Ver respuesta JSON

### Con cURL
```bash
curl http://localhost:3000/api/v1/analytics/filtros-populares
```

---

## 12. Versionamiento con Git

### Flujo estándar
```bash
# 1. Crear rama de feature
git checkout -b feat/nombre-feature

# 2. Hacer cambios y commits
git add .
git commit -m "feat(scope): descripción"

# 3. Push a rama
git push origin feat/nombre-feature

# 4. Crear Pull Request en GitHub

# 5. Mergear a main cuando esté listo
git checkout main
git pull origin main
```

---

## 13. Notas Importantes

- Las contraseñas siempre se encriptan con **bcrypt**
- La eliminación de usuarios es en **cascada**: IMAGEN → OPERACION → SESION_EDICION → CONFIGURACION → USUARIO
- El backend oficial es **Node.js + Express**
- Las tablas usan MAYÚSCULAS por convención del instructor del SENA
- Todos los endpoints tienen comentarios detallados en el código
- La API REST Analytics es consumible por e-commerce externos

---

## 14. Historial de Cambios Recientes

- [2026-04-22] Reorganización de estructura del proyecto
- [2026-04-22] Creación de API REST Analytics (4 endpoints)
- [2026-04-22] Creación de scripts de automatización (setup.sh)
- [2026-04-22] Adición de carpeta config/ para constantes
- [2026-04-22] Adición de carpeta tests/ para pruebas
- [2026-04-21] Comentarización completa de server.js
- [2026-04-20] Creación de documentación API_ANALYTICS.md

---

*Proyecto Artify — Análisis y Desarrollo de Software — SENA 2026*
*Estudiante: Ivan Dario Madrid Daza*

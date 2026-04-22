# CONTEXT.md — Proyecto Artify

> Archivo de contexto para continuar el desarrollo con cualquier IA.
> Última actualización: Abril 2026

---

## 1. ¿Qué es Artify?

Artify es un editor de imágenes web full stack desarrollado como proyecto académico del programa **Análisis y Desarrollo de Software del SENA (Colombia)**.

**Estudiante:** Ivan Dario Madrid Daza
**GitHub:** https://github.com/Tecno85/Artify

Permite a los usuarios editar imágenes directamente en el navegador con autenticación real, gestión de sesiones y panel de administración.

---

## 2. Stack Tecnológico

### Frontend actual
- HTML5, CSS3, JavaScript Vanilla
- Canvas API para manipulación de imágenes
- SessionStorage para manejo de sesión

### Frontend futuro
- React (próxima actividad)

### Backend
| Backend           | Framework  | Puerto | Estado            |
| ----------------- | ---------- | ------ | ----------------- |
| Node.js + Express | Express.js | 3000   | ✅ Oficial y único |

### Base de datos
- MySQL 8.0+
- Base de datos: `artify_db`

### Control de versiones
- Git + GitHub

---

## 3. Estructura del Proyecto

```
Artify/
├── index.html
├── README.md
├── LICENSE
├── CLAUDE.md               # Skill Artify — contexto detallado
├── CONTEXT.md              # Este archivo
├── .gitignore
│
├── pages/
│   ├── editor.html         # Editor de imágenes
│   ├── login.html          # Inicio de sesión
│   ├── registro.html       # Registro de usuario
│   └── admin.html          # Panel de administración CRUD
│
├── assets/
│   ├── css/                # admin.css, editor.css, login.css, registro.css, index.css
│   └── js/                 # admin.js, editor.js, login.js, registro.js
│
├── backend/                # Node.js + Express (puerto 3000)
│   ├── server.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── database/
│   └── artify_db.sql       # Script SQL completo
│
└── docs/
    ├── SKILL_ARTIFY.md             # Buenas prácticas del proyecto
    ├── CODING_STANDARDS.md         # Estándares Node.js
    └── CODING_STANDARDS_PYTHON.md  # Estándares Python PEP 8
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

### Sesiones y operaciones
| Método | Ruta                    | Descripción                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/sesion/iniciar`   | Inicia sesión de edición      |
| POST   | `/api/sesion/cerrar`    | Cierra sesión de edición      |
| POST   | `/api/operacion`        | Registra operación de edición |
| POST   | `/api/imagen`           | Registra imagen procesada     |
| GET    | `/api/estadisticas/:id` | Estadísticas del usuario      |
| POST   | `/api/admin/login`      | Login del panel admin         |

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
- ✅ Filtros: Blanco y Negro, Sepia, Brillo, Contraste
- ✅ Convertir formato: PNG, JPEG, WebP
- ✅ Deshacer/Rehacer (hasta 20 pasos)
- ✅ Zoom 50%-200%
- ✅ Registro de operaciones en MySQL

### Panel de administración
- ✅ Login protegido con credenciales en `.env`
- ✅ CRUD completo sobre tabla USUARIO
- ✅ Búsqueda en tiempo real
- ✅ Estadísticas de usuarios activos/inactivos
- ✅ Columna de rol (admin/usuario)

---

## 7. Lógica Funcional Principal

La lógica funcional del proyecto es la **redirección por rol después del login**:

```javascript
// assets/js/login.js
if (data.usuario.rol === 'admin') {
  window.location.href = './admin.html';  // Va al panel admin
} else {
  window.location.href = './editor.html'; // Va al editor
}
```

Esta lógica debe mantenerse en la implementación con React.

---

## 8. Convenciones de Código

### JavaScript / Node.js
- Variables y funciones: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Clases React: `PascalCase`
- Archivos y carpetas: `kebab-case`
- Comentarios de sección: `// ========== NOMBRE ==========`
- Logs con emojis: `✅ ❌ 📨 🎉`
- Idioma: español (excepto términos técnicos: API, JWT, SQL, ID)

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
  ok: boolean,      // true = éxito, false = error
  mensaje: string,  // Descripción legible
  data?: any,       // Opcional: datos de respuesta
  error?: string    // Opcional: solo en errores 500
}
```

---

## 9. Variables de Entorno

### Node.js (`backend/.env`)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=contraseña
DB_NAME=artify_db
ADMIN_USER=admin@artify.com
ADMIN_PASSWORD=contraseña_admin
PORT=3000
NODE_ENV=development
JWT_SECRET=frase_secreta_larga
```

---

## 10. Próxima Actividad — React

### Lo que pide el instructor
1. Explicar diferencia entre React y JSX
2. ¿Qué son clases en React? Con ejemplo práctico
3. Principales eventos de React
4. Mapa conceptual de React
5. Código con comentarios y estándares
6. Versionamiento con Git y GitHub
7. **Misma lógica funcional:** Login con redirección por rol

### Lo que hay que construir
- Proyecto React con login
- Redirección según rol: `admin` → panel admin, `usuario` → editor
- Conectado al backend Node.js en puerto 3000
- Carpeta: `frontend/` (siguiendo el SKILL_ARTIFY.md)

### Crear proyecto React con Vite
```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom
npm run dev
# Corre en http://localhost:5173
```

---

## 11. Cómo Correr el Proyecto

### Backend Node.js
```bash
cd backend
node server.js
# Corre en http://localhost:3000
```

### Frontend HTML actual
```bash
# Desde la raíz del proyecto
npx http-server -p 8080
# Abrir http://127.0.0.1:8080
```

### Base de datos
```bash
mysql -u root -p < database/artify_db.sql
```

---

## 12. Notas Importantes

- Las contraseñas siempre se encriptan con **bcrypt**
- El archivo `.env` nunca se sube a GitHub
- La eliminación de usuarios es en **cascada**: IMAGEN → OPERACION → SESION_EDICION → CONFIGURACION → USUARIO
- El backend oficial es **Node.js + Express**
- Las tablas usan MAYÚSCULAS por convención del instructor del SENA
- `CLAUDE.md` se llama internamente **Skill Artify** y contiene el contexto detallado del proyecto

---

## 13. Últimos Cambios (para la IA)

- [2026-04-08] Eliminados backends de Python/Flask
- [2026-04-08] Agregado SKILL_ARTIFY.md
- [2026-04-07] Completada la migración de documentación

---

*Proyecto Artify — Análisis y Desarrollo de Software — SENA 2026*

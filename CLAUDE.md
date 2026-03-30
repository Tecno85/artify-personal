# CLAUDE.md — Artify Project Context

> This file provides full context for Claude Code to continue development of the Artify project.
> Last updated: March 2026

---

## 1. Project Overview

**Artify** is a full-stack web image editor built for an academic SENA (Colombia) software development program. It allows users to edit images directly in the browser with a complete authentication system, admin panel, and multiple backend implementations.

**Current status:** Active development. Flask backend is the next pending task.

---

## 2. Tech Stack

### Frontend
- HTML5 (semantic)
- CSS3 (CSS variables, Grid, Flexbox)
- JavaScript Vanilla (Canvas API)
- SessionStorage for session management

### Backends (multiple implementations for academic purposes)
| Backend | Framework | Port | Status |
|---------|-----------|------|--------|
| Node.js + Express | Express.js | 3000 | ✅ Main backend |
| Python pure | None (http.server) | 3001 | ✅ Complete |
| Python Flask | Flask | 3002 | 🔲 Pending |

### Database
- MySQL 8.0+
- Database name: `artify_db`

---

## 3. Project Structure

```
Artify/
├── index.html                  # Landing page
├── README.md                   # Project documentation
├── LICENSE                     # MIT License
├── .gitignore                  # Ignores .env, node_modules, __pycache__
│
├── pages/
│   ├── editor.html             # Image editor
│   ├── login.html              # User login
│   ├── registro.html           # User registration
│   └── admin.html              # Admin panel (CRUD)
│
├── assets/
│   ├── css/
│   │   ├── admin.css
│   │   ├── editor.css
│   │   ├── index.css
│   │   ├── login.css
│   │   └── registro.css
│   ├── js/
│   │   ├── admin.js            # Admin panel CRUD logic (API port: 3000)
│   │   ├── editor.js           # Image editor logic
│   │   ├── login.js            # Login logic (API port: 3000)
│   │   └── registro.js         # Registration logic (API port: 3000)
│   ├── fonts/
│   │   ├── Inconsolata/
│   │   └── Paytone_One/
│   ├── icons/
│   └── images/
│
├── backend/                    # Node.js + Express
│   ├── server.js               # Main server — port 3000
│   ├── .env                    # DB credentials + admin credentials
│   ├── package.json
│   └── node_modules/           # Ignored by Git
│
├── backend_python/             # Python without framework
│   ├── server.py               # Main server — port 3001
│   ├── README.md               # Installation docs
│   ├── .env.example            # Environment variable template
│   └── .env                    # DB credentials (ignored by Git)
│
├── database/
│   └── artify_db.sql           # SQL script to recreate the database
│
└── docs/
    ├── CODING_STANDARDS.md         # Node.js coding standards
    └── CODING_STANDARDS_PYTHON.md  # Python coding standards (PEP 8)
```

---

## 4. Database Schema

### Database: `artify_db`

```sql
-- Strong non-dependent entity (no foreign keys pointing outward)
USUARIO (
  usr_id_usuario      INT PK AUTO_INCREMENT,
  usr_nombres         VARCHAR(100),
  usr_apellidos       VARCHAR(100),
  usr_cedula          VARCHAR(20) UNIQUE,
  usr_fecha_nacimiento DATE,
  usr_correo          VARCHAR(150) UNIQUE,
  usr_contrasena      VARCHAR(255),       -- bcrypt hashed
  usr_fecha_registro  DATETIME,
  usr_ultimo_acceso   DATETIME,
  usr_sesion_activa   TINYINT(1),
  usr_estado_usuario  ENUM('activo','inactivo','suspendido'),
  usr_rol             ENUM('usuario','admin')
)

SESION_EDICION (
  ses_id_sesion           INT PK,
  ses_usr_id_usuario      INT FK → USUARIO,
  ses_img_id_imagen       INT FK → IMAGEN (nullable),
  ses_fecha_inicio        DATETIME,
  ses_fecha_fin           DATETIME,
  ses_duracion_minutos    INT,
  ses_estado_sesion       ENUM('activa','pausada','finalizada','cancelada'),
  ses_numero_operaciones  INT
)

OPERACION (
  opr_id_operacion        INT PK,
  opr_ses_id_sesion       INT FK → SESION_EDICION,
  opr_usr_id_usuario      INT FK → USUARIO,
  opr_tipo_operacion      VARCHAR(100),
  opr_parametros          JSON,
  opr_fecha_hora          DATETIME,
  opr_orden_secuencial    INT,
  opr_estado_operacion    ENUM('completada','revertida','error')
)

IMAGEN (
  img_id_imagen       INT PK,
  img_usr_id_usuario  INT FK → USUARIO,
  img_nombre_original VARCHAR(255),
  img_nombre_archivo  VARCHAR(255),
  img_formato         VARCHAR(50),
  img_ancho_original  INT,
  img_alto_original   INT,
  img_tamano_bytes    BIGINT,
  img_fecha_subida    DATETIME,
  img_estado_imagen   ENUM('activa','archivada','eliminada')
)

CONFIGURACION (
  cfg_id_configuracion      INT PK,
  cfg_usr_id_usuario        INT FK → USUARIO UNIQUE,
  cfg_tema                  ENUM('claro','oscuro','auto'),
  cfg_idioma                VARCHAR(10),
  cfg_calidad_exportacion   ENUM('baja','media','alta','maxima'),
  cfg_configuracion_avanzada JSON,       -- {notificaciones, formatoDefecto, autoguardado}
  cfg_fecha_actualizacion   DATETIME
)

-- View (not a table)
v_usuarios_activos → joins USUARIO + IMAGEN + SESION_EDICION
```

---

## 5. API Endpoints

### Node.js Backend (port 3000) — `backend/server.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login with bcrypt validation, updates `usr_ultimo_acceso` and `usr_sesion_activa` |
| POST | `/api/registro` | Register new user, auto-creates CONFIGURACION record |
| POST | `/api/sesion/iniciar` | Start edit session, creates SESION_EDICION record |
| POST | `/api/sesion/cerrar` | Close session, sets `ses_estado_sesion = 'finalizada'` |
| POST | `/api/operacion` | Log image operation, increments `ses_numero_operaciones` |
| POST | `/api/imagen` | Log image record in IMAGEN table |
| GET | `/api/estadisticas/:id` | Get user stats (total images, sessions, operations) |
| POST | `/api/admin/login` | Admin login (validated against .env credentials) |
| GET | `/api/admin/usuarios` | List all users ordered by `usr_fecha_registro DESC` |
| POST | `/api/admin/usuario` | Add user (admin panel) |
| PUT | `/api/admin/usuario/:id` | Edit user |
| DELETE | `/api/admin/usuario/:id` | Cascading delete: IMAGEN → OPERACION → SESION_EDICION → CONFIGURACION → USUARIO |

### Python Backend (port 3001) — `backend_python/server.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login with bcrypt |
| POST | `/api/registro` | Register new user |
| GET | `/api/admin/usuarios` | List all users |
| POST | `/api/admin/usuario` | Add user |
| PUT | `/api/admin/usuario/:id` | Edit user |
| DELETE | `/api/admin/usuario/:id` | Cascading delete |

### Flask Backend (port 3002) — PENDING
- Same endpoints as Python pure backend
- To be implemented in `backend_flask/app.py`

---

## 6. Implemented Features

### Authentication
- [x] User registration with bcrypt password hashing
- [x] Login with bcrypt validation
- [x] Role-based redirect: `admin` → `admin.html`, `usuario` → `editor.html`
- [x] Session tracking (`usr_sesion_activa`, `usr_ultimo_acceso`)
- [x] Auto session cleanup (cron job every hour, closes sessions inactive > 8h)

### Image Editor
- [x] Drag & drop image upload
- [x] Crop with proportions (free, 1:1, 16:9, 4:3, 3:2)
- [x] Resize with aspect ratio lock
- [x] Rotate (90°, 180°, 270°)
- [x] Filters: B&W, Sepia, Brightness, Contrast (with intensity slider)
- [x] Format conversion: PNG, JPEG, WebP
- [x] Undo/Redo (up to 20 steps)
- [x] Zoom in/out (50%-200%)
- [x] Download with format and quality settings
- [x] Operation logging to MySQL

### Admin Panel
- [x] Protected login (credentials in .env: ADMIN_USER, ADMIN_PASSWORD)
- [x] CRUD on USUARIO table
- [x] Real-time search
- [x] Active/inactive user stats
- [x] Role column (👑 Admin / 👤 Usuario)

---

## 7. Key Technical Decisions

### Why USUARIO is the strong non-dependent entity
USUARIO has no foreign keys pointing outward. All other tables (SESION_EDICION, OPERACION, IMAGEN, CONFIGURACION) depend on it. This is why the CRUD demo is built on USUARIO.

### Password encryption
All passwords use bcrypt with salt rounds of 10 (Node.js) or `bcrypt.gensalt()` default (Python). Never stored in plain text.

### Port assignments
- 3000: Node.js (primary backend)
- 3001: Python pure (academic exercise)
- 3002: Flask (pending — next task)

### Frontend always uses same HTML/CSS
The frontend pages are reused across all backend implementations. Only the API port changes in the JS files (`const API = 'http://localhost:PORT'`).

### .env files
Never committed to GitHub. `.env.example` is committed as a template. `.gitignore` includes `.env`, `node_modules/`, `__pycache__/`, `*.pyc`, `*.pyo`.

### Database cleanup
Tables `HISTORIAL` and `IMAGEN_OPERACION` were dropped — they were leftover from an earlier schema that was replaced.

---

## 8. Problems Solved

### Cascading delete
When deleting a user, must delete in order: IMAGEN → OPERACION → SESION_EDICION → CONFIGURACION → USUARIO (foreign key constraints).

### Python finally block bug
When MySQL connection fails, `cursor` is never created. Fixed with nested try/except in finally:
```python
finally:
    try:
        cursor.close()
        conn.close()
    except Exception:
        pass
```

### CORS in Python backend
Added `do_OPTIONS` handler and CORS headers in every response via `send_json_response`.

### Date serialization in Python
MySQL dates need `.isoformat()` conversion before JSON serialization:
```python
for key, value in u.items():
    if hasattr(value, 'isoformat'):
        u[key] = value.isoformat()
```

### Session field names
Instructor's model uses `ses_estado_sesion` (not `ses_estado`) and `ses_numero_operaciones` (not `ses_ultima_actividad`). All endpoints adapted accordingly.

---

## 9. Pending Tasks

### HIGH PRIORITY
- [ ] **Flask backend** — Create `backend_flask/` with Flask framework
  - Port: 3002
  - Same endpoints as Python pure backend
  - Must include: login, registro, CRUD completo
  - Must include: `README.md`, `.env.example`, `requirements.txt`
  - Must follow PEP 8 coding standards

### MEDIUM PRIORITY
- [ ] Decide final backend (Node.js vs Python) and update main README.md
- [ ] Update README.md project structure section

### LOW PRIORITY
- [ ] Add JWT for endpoint protection
- [ ] Add pagination to operation history
- [ ] Deploy to production (Railway + PlanetScale)

---

## 10. Coding Conventions

### JavaScript (Node.js + Frontend)
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Functions: descriptive Spanish verbs (`cargarUsuarios`, `renderizarTabla`)
- Async: `async/await` with try/catch
- Console logs: emoji prefixes (`✅`, `❌`, `📨`, `🎉`)
- Section separators: `// ========== SECTION NAME ==========`

### Python
- Classes: `PascalCase` (e.g., `ArtifyHandler`)
- Methods: `snake_case` (e.g., `handle_login`, `handle_get_usuarios`)
- Variables: `snake_case`
- Constants: `UPPER_SNAKE_CASE` (e.g., `PORT = 3001`)
- Imports: PEP 8 grouped (native first, then external)
- Follows PEP 8 style guide

### SQL
- Table names: `UPPERCASE` (e.g., `USUARIO`, `SESION_EDICION`)
- Column prefix pattern: `usr_`, `ses_`, `opr_`, `img_`, `cfg_`
- Always use parameterized queries (`%s` in Python, `?` in Node.js)

### Git commits (Conventional Commits)
```
feat(scope): add new feature
fix(scope): fix a bug
docs: update documentation
style: CSS or formatting changes
chore: maintenance tasks
refactor: code restructuring
```

---

## 11. Dependencies

### Node.js (`backend/package.json`)
```json
{
  "express": "^4.x",
  "mysql2": "latest",
  "bcryptjs": "latest",
  "dotenv": "latest",
  "cors": "latest",
  "node-cron": "latest"
}
```

### Python (`backend_python/`)
```
mysql-connector-python==9.6.0
bcrypt==5.0.0
python-dotenv==1.2.2
```

### Flask (`backend_flask/` — PENDING)
```
flask
flask-cors
mysql-connector-python
bcrypt
python-dotenv
```

---

## 12. How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.13+
- MySQL 8.0+
- Git

### Start Node.js backend
```bash
cd backend
node server.js
# Server runs on http://localhost:3000
```

### Start Python backend
```bash
cd backend_python
python3 server.py
# Server runs on http://localhost:3001
```

### Start frontend
```bash
# From project root
npx http-server -p 8080
# Open http://127.0.0.1:8080
```

### Set up database
```bash
mysql -u root -p < database/artify_db.sql
```

### Environment variables
Copy `.env.example` to `.env` in each backend folder and fill in credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=artify_db
# Only for Node.js backend:
ADMIN_USER=admin@artify.com
ADMIN_PASSWORD=ArtifyAdmin2026*
```

---

## 13. Admin Credentials

Admin login for the admin panel (`pages/admin.html`) uses credentials stored in `backend/.env`:
- `ADMIN_USER` — admin email
- `ADMIN_PASSWORD` — admin password

Users with `usr_rol = 'admin'` in the database are redirected to `admin.html` after login. To set a user as admin:
```sql
UPDATE USUARIO SET usr_rol = 'admin' WHERE usr_correo = 'email@example.com';
```

---

## 14. Academic Context

This project is built for **SENA (Colombia)** — Programa de Análisis y Desarrollo de Software.

**Student:** Ivan Dario Madrid Daza  
**Activities completed:**
- Frontend with HTML/CSS/JS
- Node.js + Express backend with MySQL
- Admin panel CRUD on USUARIO table
- Python backend without framework
- Git/GitHub versioning documentation
- Coding standards documentation

**Next activity:** Flask backend (same functionality as Python pure, but using Flask framework)

---

*Context file for Claude Code — Artify Project 2026*

# Skill: Artify - Buenas Prácticas del Proyecto

Este documento define las buenas prácticas, estándares y convenciones para el desarrollo del proyecto **Artify**. Todo el equipo (actual y futuro) debe seguirlas para mantener consistencia, calidad y facilidad de mantenimiento.

---

## 🎯 Alcance

Este skill aplica al **proyecto Artify completo**, incluyendo:
- Backend (Node.js + Express)
- Frontend (JavaScript Vanilla → React)
- Base de datos (MySQL)
- Documentación y control de versiones

---

## 🛠️ Tecnologías Oficiales

| Capa                  | Tecnología            | Estado                      |
| --------------------- | --------------------- | --------------------------- |
| **Backend**           | Node.js + Express     | ✅ Oficial                   |
| **Frontend**          | HTML, CSS, JS Vanilla | ✅ Actual (migrando a React) |
| **Frontend Futuro**   | React                 | 📋 Por implementar           |
| **Base de Datos**     | MySQL                 | ✅ Oficial                   |
| **Control Versiones** | Git + GitHub          | ✅ Oficial                   |

> **Nota:** El backend oficial del proyecto es Node.js + Express.
> Las implementaciones previas en Flask (Python) serán eliminadas para mantener una única base de código consistente.

---

## 📁 Estructura de Carpetas (Definitiva)

```
Artify/
├── backend/                # Node.js + Express
│   ├── server.js           # Punto de entrada
│   ├── routes/             # Endpoints por recurso
│   ├── controllers/        # Manejo de request/response
│   ├── services/           # Lógica de negocio (reglas del sistema)
│   ├── models/             # Consultas a BD
│   ├── middleware/         # Autenticación, validaciones
│   ├── config/             # Configuración (DB, JWT)
│   ├── .env                # Variables (no se sube)
│   ├── .env.example        # Plantilla
│   ├── package.json
│   └── README.md
│
├── frontend/               # React (futuro)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── database/               # Scripts SQL
│   ├── schema.sql          # Creación de tablas
│   ├── seeds.sql           # Datos de prueba
│   └── README.md
│
├── docs/                   # Documentación
│   ├── CODING_STANDARDS.md
│   ├── API_REFERENCE.md
│   └── DEPLOYMENT.md
│
├── .gitignore
├── LICENSE
└── README.md               # Documentación principal
```

> **Transición:** El frontend actual (`frontend/pages/`, `frontend/assets/js/`) se mantiene hasta migrar completamente a React.

---

## 🏷️ Convenciones de Nombramiento

### Variables y Funciones → `camelCase`
```javascript
// ✅ Correcto
let nombreUsuario = "Iván";
function obtenerUsuarioPorId(id) { }

// ❌ Incorrecto
let nombre_usuario = "Iván";
function ObtenerUsuarioPorId(id) { }
```

### Archivos y Carpetas → `kebab-case`

```javascript
✅ Correcto

mi-archivo.js
configuracion-base-datos.js
/componentes/ui/boton-enviar.js

❌ Incorrecto

mi_archivo.js
MiArchivo.js
```

### Componentes React → `PascalCase`

```javascript
// ✅ Correcto
function BotonEnviar() { }
function ListaUsuarios() { }

// ❌ Incorrecto
function botonEnviar() { }
function lista_usuarios() { }
```

### Constantes → `UPPER_SNAKE_CASE`

```javascript
// ✅ Correcto
const MAXIMO_INTENTOS = 3;
const URL_API = "http://localhost:3000";

// ❌ Incorrecto
const maximoIntentos = 3;
const urlApi = "http://localhost:3000";
```

### Base de Datos `(tablas y columnas)`

```javascript
-- ✅ Correcto (singular, snake_case)
CREATE TABLE usuario (
    id_usuario INT PRIMARY KEY,
    nombres VARCHAR(100),
    fecha_registro DATETIME
);

-- ❌ Incorrecto
CREATE TABLE Usuarios (  -- plural
    idUsuario INT,       -- camelCase
);
```

### Idioma del Código

Idioma principal: Español

Reglas:

- Variables, funciones y mensajes deben estar en español
- Se permite el uso de términos técnicos en inglés cuando sea estándar en la industria

Ejemplos permitidos:
- API, JSON, SQL, JWT, URL, ID
- Nombres de librerías y frameworks (React, Express, Node.js)

```javascript
// ✅ Correcto
let correoUsuario = "ivan@artify.com";
function obtenerListaUsuarios() { }
const mensajeError = "Credenciales inválidas";

// ❌ Incorrecto (inglés no necesario)
// ⚠️ Evitar cuando no aporta claridad
let userEmail = "ivan@artify.com";

// ✅ Preferido en este proyecto
let correoUsuario = "ivan@artify.com";

Excepciones permitidas: JSON, API, SQL, ID, URL, JWT, PDF, GET, POST
```

### Variables de Entorno `(Mínimo Necesario)`

```javascript
Archivo .env (no se sube a GitHub)

# Configuración Base de Datos
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=artify_db

# Configuración Servidor
PORT=3000
NODE_ENV=development

# Seguridad
JWT_SECRET=frase_secreta_larga_y_dificil
```

```javascript
Archivo .env.example (se sube a GitHub)

DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=artify_db
PORT=3000
NODE_ENV=development
JWT_SECRET=tu_frase_secreta_aqui
```

### Formato de Respuestas API

```javascript
Todas las respuestas siguen esta estructura única:

{
  ok: boolean,      // true = éxito, false = error
  mensaje: string,  // Descripción legible
  data?: any,       // Opcional: datos de respuesta
  error?: string    // Opcional: solo errores internos (500)
}
```

```javascript
Ejemplos prácticos:

// ✅ Éxito (Login)
res.status(200).json({
  ok: true,
  mensaje: "Login exitoso",
  data: { id: 1, nombres: "Iván", rol: "admin" }
});

// ✅ Éxito (Listar usuarios)
res.status(200).json({
  ok: true,
  mensaje: "Usuarios obtenidos correctamente",
  data: usuarios
});

// ❌ Error del cliente (401, 404, 400)
res.status(401).json({
  ok: false,
  mensaje: "Correo o contraseña incorrectos"
});

// ❌ Error del servidor (500)
res.status(500).json({
  ok: false,
  mensaje: "Error interno del servidor",
  error: error.message  // Solo en desarrollo
});
```

### Formato de Fechas

- Almacenamiento en BD: DATETIME (MySQL)
- Intercambio API → Frontend: ISO 8601

```javascript
// La BD guarda: 2026-04-07 15:30:00
// El backend envía: "2026-04-07T15:30:00.000Z"

// El frontend lo usa directamente:
const fecha = new Date("2026-04-07T15:30:00.000Z");
console.log(fecha.toLocaleDateString("es-ES")); // "7/4/2026"
```

### Autenticación (JWT)

- Estandar: JSON Web Tokens (JWT)
- Estado: Por implementar (próxima fase)

```
Flujo planeado:

1. Usuario login → backend genera token (expira en 24h)
2. Frontend guarda token en localStorage o cookie HttpOnly
3. Cada petición incluye: Authorization: Bearer <token>
4. Backend verifica token sin consultar BD
```

### Nivel de Comentarios

Nivel MEDIO (balance entre claridad y concisión):

```
Reglas:

1. Toda función pública tiene comentario de qué hace, parámetros y retorno
2. Lógica compleja (filtros, validaciones, transformaciones) se explica
3. Lógica obvia (sumas, asignaciones) NO necesita comentario
```

```
Ejemplo:

/**
 * Valida las credenciales del usuario y genera token JWT
 * @param {string} correo - Correo electrónico del usuario
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<Object>} { ok, mensaje, data: { token, usuario } }
 */
async function loginUsuario(correo, password) {
    // Buscar usuario en BD
    const usuario = await UsuarioModel.buscarPorCorreo(correo);
    
    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, usuario.contrasena);
    
    // Generar token si es válido
    if (passwordValida) {
        const token = jwt.sign(
        { id: usuario.id },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );
        return { ok: true, data: { token, usuario } };
    }
    
    return { ok: false, mensaje: "Contraseña incorrecta" };
}
```

### Pruebas `(Buenas Prácticas - Futuro)`

Estado: No implementadas aún, pero se definen las buenas prácticas.

### Estructura de pruebas (cuando se implementen):

```
backend/
├── tests/
│   ├── unit/           # Pruebas unitarias
│   │   └── usuarioController.test.js
│   ├── integration/    # Pruebas de integración
│   │   └── login.test.js
│   └── fixtures/       # Datos de prueba
│       └── usuarios.json
```

### Herramientas a usar:

```
- **Jest** o **Mocha** (backend)
- **Supertest** (para probar APIs)
- **React Testing Library** (frontend)
```

### Cobertura mínima futura:

```
- Pruebas de autenticación (login/registro)
- Pruebas de endpoints críticos (CRUD usuarios)
- Pruebas de utilidades complejas (filtros imágenes)
```

### Control de Versiones `(Git)`

### Formato de Commits: Conventional Commits

```md
<tipo>(<scope>): <descripción en español>
```

### Tipos permitidos:


|   Tipo   |                   Uso                    |                    Ejemplo                    |
| :------: | :--------------------------------------: | :-------------------------------------------: |
|   feat   |           Nueva funcionalidad            |      feat(editor): agregar filtro sepia       |
|   fix    |           Corrección de error            |       fix(login): validar correo vacío        |
|   docs   |              Documentación               |        docs: actualizar README con API        |
|  style   |       Formato, espacios, comillas        |      style: aplicar prettier a server.js      |
| refactor | Mejora de código sin cambios funcionales | refactor(usuarios): simplificar consultas SQL |
|   test   |        Agregar o corregir pruebas        |    test(login): agregar pruebas unitarias     |
|  chore   |         Tareas de mantenimiento          |        chore: actualizar dependencias         |


### Ejemplos correctos:

```Bash
feat(admin): agregar búsqueda de usuarios en tiempo real
fix(editor): corregir error al rotar imagen en 90 grados
docs(api): documentar endpoint de registro
refactor(bd): cambiar nombre columna usr_id a id_usuario
```

### Ejemplos incorrectos:

```Bash
cambios varios
Update
arreglo bug
```

### Ramas (branches):

```Bash
main / master → Código estable en producción
develop → Integración de nuevas features
feature/nombre-funcionalidad → Desarrollo específico
fix/descripcion-error → Correcciones urgentes
```

### Documentación Obligatoria

|       Archivo       |     Ubicación     |               Contenido Mínimo               |
| :-----------------: | :---------------: | :------------------------------------------: |
|      README.md      |       Raíz        | Descripción, tecnologías, instalación rápida |
|      README.md      |     /backend      | Variables de entorno, endpoints disponibles  |
|      README.md      | /frontend (React) |    Cómo correr, estructura de componentes    |
| CODING_STANDARDS.md |       /docs       |                Este documento                |
|  API_REFERENCE.md   |       /docs       |  Lista de todos los endpoints con ejemplos   |


### Opcionales (recomendados):

```Bash
- CONTRIBUTING.md → Cómo otros pueden ayudar
- CHANGELOG.md → Registro de cambios importantes
```

```md
### 🧩 Principios de Desarrollo

Se deben seguir los siguientes principios en todo el proyecto:

- DRY (Don't Repeat Yourself): Evitar duplicación de código
- KISS (Keep It Simple, Stupid): Mantener soluciones simples
- Separación de responsabilidades: Controllers, Services, Models bien definidos
- Validación siempre en backend
- No confiar en datos del frontend
- Código legible > código complejo
```

```
### 📌 Regla Backend: Controllers vs Services

❌ El controller NO debe:
- Acceder directamente a la base de datos
- Contener lógica de negocio

✅ El controller SOLO debe:
- Recibir el request
- Llamar al service correspondiente
- Retornar el response

### Seguridad (Buenas Prácticas)
```

```Bash
Obligatorio:

✅ .env en .gitignore (nunca subir credenciales)
✅ Contraseñas encriptadas con bcrypt
✅ Validar TODOS los inputs del usuario (evitar SQL injection)
✅ Usar consultas parametrizadas (no concatenar SQL)
```

### Próximas implementaciones:

```Bash
🔐 JWT para autenticación stateless
🛡️ Helmet.js para proteger cabeceras HTTP
⏱️ Rate limiting (evitar ataques de fuerza bruta)
🌍 CORS configurado correctamente
```

### Ejemplo consulta segura:

```JavaScript
// ✅ Correcto (parametrizado)
const [rows] = await pool.query(
    'SELECT * FROM usuario WHERE correo = ?',
    [correo]
);

// ❌ Incorrecto (vulnerable a SQL injection)
const query = `SELECT * FROM usuario WHERE correo = '${correo}'`;
```

### Próximos Pasos (Roadmap) 🚀

```
Inmediatos:

1. Eliminar backend_flask/ y backend_python/
2. Aplicar todas las convenciones al código actual
3. Crear archivos de documentación faltantes
```

```
Corto plazo:

4. Implementar JWT en backend
5. Migrar frontend a React
6. Agregar pruebas unitarias básicas
```

```
Largo plazo:

7. Desplegar en la nube (Railway o Render)
8. Agregar más filtros y herramientas al editor
9. Paginación en panel de administración
```

### Mantenimiento

```
Skill creado por: Iván Madrid (Tecno85)
Fecha: 7 de abril de 2026
Versión: 1.0.0

Para actualizar este documento: Crear un Pull Request con los cambios y etiquetar como docs: actualizar skill
```

# Backend Python — Artify

> Servidor HTTP desarrollado con Python sin framework, conectado a MySQL con encriptación bcrypt.

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Endpoints](#-endpoints)

---

## 📖 Descripción

Este backend implementa un servidor HTTP utilizando únicamente el módulo nativo `http.server` de Python, sin ningún framework externo como Django o Flask. Se conecta a una base de datos MySQL y expone endpoints RESTful para el login, registro y CRUD completo sobre la tabla USUARIO.

---

## 🛠️ Tecnologías

| Tecnología             | Versión | Uso                         |
| ---------------------- | ------- | --------------------------- |
| Python                 | 3.13+   | Lenguaje principal          |
| http.server            | Nativo  | Servidor HTTP sin framework |
| mysql-connector-python | 9.6+    | Conexión a MySQL            |
| bcrypt                 | 5.0+    | Encriptación de contraseñas |
| python-dotenv          | 1.2+    | Variables de entorno        |

---

## ✅ Requisitos Previos

Antes de instalar asegúrate de tener:

- [Python](https://www.python.org/) 3.13 o superior
- [MySQL](https://dev.mysql.com/downloads/) 8.0 o superior
- La base de datos `artify_db` creada con todas sus tablas

Verifica tu versión de Python:

```bash
python3 --version
```

---

## 🚀 Instalación

### 1. Navega a la carpeta del backend

```bash
cd backend_python
```

### 2. Instala las dependencias

```bash
pip3 install mysql-connector-python bcrypt python-dotenv --break-system-packages
```

---

## ⚙️ Configuración

### 1. Crea el archivo de variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### 2. Edita el archivo `.env` con tus credenciales

```env
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=artify_db
```
### 3. Crear la base de datos

Importa el script SQL incluido en la carpeta `database/`:
```bash
mysql -u root -p < ../database/artify_db.sql
```

O desde MySQL Workbench:
```
Server → Data Import → Import from Self-Contained File
Selecciona: database/artify_db.sql
Clic en: Start Import
```

> ⚠️ **Importante:** El script crea automáticamente la base de datos
> `artify_db` con todas sus tablas.

> ⚠️ **Importante:** El archivo `.env` nunca se sube a GitHub. Está incluido en el `.gitignore` del proyecto.

---

## ▶️ Uso

### Iniciar el servidor

```bash
python3 server.py
```

Debes ver:

```
✅ Servidor Python corriendo en http://localhost:3001
🚀 Endpoints disponibles:
   POST   http://localhost:3001/api/login
   POST   http://localhost:3001/api/registro
   GET    http://localhost:3001/api/admin/usuarios
   POST   http://localhost:3001/api/admin/usuario
   PUT    http://localhost:3001/api/admin/usuario/:id
   DELETE http://localhost:3001/api/admin/usuario/:id
```

### Detener el servidor

```bash
Ctrl + C
```

---

## 🔌 Endpoints

| Método   | Endpoint                 | Descripción                  |
| -------- | ------------------------ | ---------------------------- |
| `POST`   | `/api/login`             | Iniciar sesión con bcrypt    |
| `POST`   | `/api/registro`          | Registrar nuevo usuario      |
| `GET`    | `/api/admin/usuarios`    | Consultar todos los usuarios |
| `POST`   | `/api/admin/usuario`     | Insertar nuevo usuario       |
| `PUT`    | `/api/admin/usuario/:id` | Actualizar usuario por ID    |
| `DELETE` | `/api/admin/usuario/:id` | Eliminar usuario por ID      |

---

*Proyecto Artify — Análisis y Desarrollo de Software — SENA 2026*

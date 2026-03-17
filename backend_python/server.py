# ========== DEPENDENCIAS ==========
import json
import bcrypt
import mysql.connector
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
from dotenv import load_dotenv
import os
import re

# ========== CONFIGURACIÓN ==========
load_dotenv()

PORT = 3001

# ========== CONEXIÓN A MYSQL ==========


def get_connection():
    return mysql.connector.connect(
        host=os.getenv('DB_HOST'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        database=os.getenv('DB_NAME')
    )

# ========== SERVIDOR HTTP ==========


class ArtifyHandler(BaseHTTPRequestHandler):

    # ========== CORS Y HEADERS ==========
    def send_json_response(self, status, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods',
                         'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    # ========== MANEJO DE PREFLIGHT CORS ==========
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods',
                         'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    # ========== LEER CUERPO DE LA PETICIÓN ==========
    def read_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        try:
            return json.loads(body)
        except Exception:
            return {}

    # ========== ENDPOINT GET ==========
    def do_GET(self):
        path = urlparse(self.path).path

        # ========== LISTAR USUARIOS ==========
        if path == '/api/admin/usuarios':
            self.handle_get_usuarios()
        else:
            self.send_json_response(404, {'mensaje': 'Ruta no encontrada'})

    # ========== ENDPOINT POST ==========
    def do_POST(self):
        path = urlparse(self.path).path
        data = self.read_body()

        # ========== LOGIN ==========
        if path == '/api/login':
            self.handle_login(data)

        # ========== REGISTRO ==========
        elif path == '/api/registro':
            self.handle_registro(data)

        # ========== AGREGAR USUARIO (ADMIN) ==========
        elif path == '/api/admin/usuario':
            self.handle_agregar_usuario(data)

        else:
            self.send_json_response(404, {'mensaje': 'Ruta no encontrada'})

    # ========== ENDPOINT PUT ==========
    def do_PUT(self):
        path = urlparse(self.path).path
        data = self.read_body()

        # ========== EDITAR USUARIO ==========
        match = re.match(r'^/api/admin/usuario/(\d+)$', path)
        if match:
            usuario_id = int(match.group(1))
            self.handle_editar_usuario(usuario_id, data)
        else:
            self.send_json_response(404, {'mensaje': 'Ruta no encontrada'})

    # ========== ENDPOINT DELETE ==========
    def do_DELETE(self):
        path = urlparse(self.path).path

        # ========== ELIMINAR USUARIO ==========
        match = re.match(r'^/api/admin/usuario/(\d+)$', path)
        if match:
            usuario_id = int(match.group(1))
            self.handle_eliminar_usuario(usuario_id)
        else:
            self.send_json_response(404, {'mensaje': 'Ruta no encontrada'})

    # ========== LÓGICA DE LOGIN ==========
    def handle_login(self, data):
        correo = data.get('correo', '').strip()
        password = data.get('password', '')

        print(f'📨 Login recibido — Correo: {correo}')

        if not correo or not password:
            self.send_json_response(
                400, {'mensaje': 'Correo y contraseña son requeridos'})
            return

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                'SELECT * FROM USUARIO WHERE usr_correo = %s', (correo,))
            usuario = cursor.fetchone()

            if not usuario:
                print('❌ Usuario no encontrado')
                self.send_json_response(
                    401, {'mensaje': 'Usuario no encontrado'})
                return

            password_valida = bcrypt.checkpw(
                password.encode('utf-8'),
                usuario['usr_contrasena'].encode('utf-8')
            )

            if not password_valida:
                print('❌ Contraseña incorrecta')
                self.send_json_response(
                    401, {'mensaje': 'Contraseña incorrecta'})
                return

            print(
                f'✅ Login exitoso — {usuario["usr_nombres"]} {usuario["usr_apellidos"]}')

            self.send_json_response(200, {
                'mensaje': 'Login exitoso',
                'usuario': {
                    'id':        usuario['usr_id_usuario'],
                    'nombres':   usuario['usr_nombres'],
                    'apellidos': usuario['usr_apellidos'],
                    'correo':    usuario['usr_correo'],
                    'rol':       usuario['usr_rol'],
                }
            })

        except Exception as e:
            print(f'❌ Error en login: {e}')
            self.send_json_response(500, {'mensaje': 'Error en el servidor'})

        finally:
            try:
                cursor.close()
                conn.close()
            except Exception:
                pass

    # ========== LÓGICA DE REGISTRO ==========
    def handle_registro(self, data):
        nombres = data.get('nombres', '').strip()
        apellidos = data.get('apellidos', '').strip()
        cedula = data.get('cedula', '').strip()
        correo = data.get('correo', '').strip()
        password = data.get('password', '')
        fecha_nac = data.get('fechaNacimiento', None)

        print(f'📨 Registro recibido — Correo: {correo}')

        if not all([nombres, apellidos, cedula, correo, password]):
            self.send_json_response(
                400, {'mensaje': 'Todos los campos son requeridos'})
            return

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                'SELECT usr_id_usuario FROM USUARIO WHERE usr_correo = %s OR usr_cedula = %s',
                (correo, cedula)
            )
            existente = cursor.fetchone()

            if existente:
                print('❌ Correo o cédula ya registrada')
                self.send_json_response(
                    400, {'mensaje': 'El correo o cédula ya está registrado'})
                return

            hashed = bcrypt.hashpw(password.encode(
                'utf-8'), bcrypt.gensalt()).decode('utf-8')

            cursor.execute('''
                INSERT INTO USUARIO (
                    usr_nombres, usr_apellidos, usr_cedula,
                    usr_correo, usr_contrasena, usr_fecha_nacimiento,
                    usr_fecha_registro, usr_estado_usuario, usr_rol
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), 'activo', 'usuario')
            ''', (nombres, apellidos, cedula, correo, hashed, fecha_nac))

            conn.commit()
            nuevo_id = cursor.lastrowid

            print(f'✅ Usuario registrado correctamente — ID: {nuevo_id}')

            self.send_json_response(200, {
                'mensaje': 'Registro exitoso',
                'usuario': {
                    'id':        nuevo_id,
                    'nombres':   nombres,
                    'apellidos': apellidos,
                    'correo':    correo,
                }
            })

        except Exception as e:
            print(f'❌ Error en registro: {e}')
            self.send_json_response(500, {'mensaje': 'Error en el servidor'})

        finally:
            try:
                cursor.close()
                conn.close()
            except Exception:
                pass

    # ========== LÓGICA GET USUARIOS ==========
    def handle_get_usuarios(self):
        print('📋 Cargando lista de usuarios')

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                SELECT usr_id_usuario, usr_nombres, usr_apellidos,
                       usr_cedula, usr_correo, usr_fecha_nacimiento,
                       usr_fecha_registro, usr_estado_usuario, usr_rol
                FROM USUARIO
                ORDER BY usr_fecha_registro DESC
            ''')
            usuarios = cursor.fetchall()

            # Convertir fechas a string para JSON
            for u in usuarios:
                for key, value in u.items():
                    if hasattr(value, 'isoformat'):
                        u[key] = value.isoformat()

            print(f'✅ {len(usuarios)} usuarios encontrados')
            self.send_json_response(
                200, {'mensaje': 'ok', 'usuarios': usuarios})

        except Exception as e:
            print(f'❌ Error al obtener usuarios: {e}')
            self.send_json_response(500, {'mensaje': 'Error en el servidor'})

        finally:
            try:
                cursor.close()
                conn.close()
            except Exception:
                pass

    # ========== LÓGICA AGREGAR USUARIO ==========
    def handle_agregar_usuario(self, data):
        nombres = data.get('nombres', '').strip()
        apellidos = data.get('apellidos', '').strip()
        cedula = data.get('cedula', '').strip()
        correo = data.get('correo', '').strip()
        password = data.get('password', '')
        fecha_nac = data.get('fechaNacimiento', None)

        print(f'📨 Agregar usuario — Correo: {correo}')

        if not all([nombres, apellidos, cedula, correo, password]):
            self.send_json_response(
                400, {'mensaje': 'Todos los campos son requeridos'})
            return

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute(
                'SELECT usr_id_usuario FROM USUARIO WHERE usr_correo = %s OR usr_cedula = %s',
                (correo, cedula)
            )
            existente = cursor.fetchone()

            if existente:
                self.send_json_response(
                    400, {'mensaje': 'El correo o cédula ya está registrado'})
                return

            hashed = bcrypt.hashpw(password.encode(
                'utf-8'), bcrypt.gensalt()).decode('utf-8')

            cursor.execute('''
                INSERT INTO USUARIO (
                    usr_nombres, usr_apellidos, usr_cedula,
                    usr_correo, usr_contrasena, usr_fecha_nacimiento,
                    usr_fecha_registro, usr_estado_usuario, usr_rol
                ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), 'activo', 'usuario')
            ''', (nombres, apellidos, cedula, correo, hashed, fecha_nac))

            conn.commit()
            print(f'✅ Usuario agregado — ID: {cursor.lastrowid}')
            self.send_json_response(
                200, {'mensaje': 'Usuario agregado correctamente'})

        except Exception as e:
            print(f'❌ Error al agregar usuario: {e}')
            self.send_json_response(500, {'mensaje': 'Error en el servidor'})

        finally:
            try:
                cursor.close()
                conn.close()
            except Exception:
                pass

    # ========== LÓGICA EDITAR USUARIO ==========
    def handle_editar_usuario(self, usuario_id, data):
        nombres = data.get('nombres', '').strip()
        apellidos = data.get('apellidos', '').strip()
        cedula = data.get('cedula', '').strip()
        correo = data.get('correo', '').strip()
        estado = data.get('estado', 'activo')
        fecha_nac = data.get('fechaNacimiento', None)

        print(f'📨 Editar usuario — ID: {usuario_id}')

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            cursor.execute('''
                UPDATE USUARIO
                SET usr_nombres          = %s,
                    usr_apellidos        = %s,
                    usr_cedula           = %s,
                    usr_correo           = %s,
                    usr_fecha_nacimiento = %s,
                    usr_estado_usuario   = %s
                WHERE usr_id_usuario = %s
            ''', (nombres, apellidos, cedula, correo, fecha_nac, estado, usuario_id))

            conn.commit()
            print(f'✅ Usuario editado — ID: {usuario_id}')
            self.send_json_response(
                200, {'mensaje': 'Usuario editado correctamente'})

        except Exception as e:
            print(f'❌ Error al editar usuario: {e}')
            self.send_json_response(500, {'mensaje': 'Error en el servidor'})

        finally:
            try:
                cursor.close()
                conn.close()
            except Exception:
                pass

    # ========== LÓGICA ELIMINAR USUARIO ==========
    def handle_eliminar_usuario(self, usuario_id):
        print(f'📨 Eliminar usuario — ID: {usuario_id}')

        try:
            conn = get_connection()
            cursor = conn.cursor(dictionary=True)

            # Eliminar registros relacionados primero
            cursor.execute(
                'DELETE FROM IMAGEN WHERE img_usr_id_usuario = %s', (usuario_id,))
            cursor.execute(
                'DELETE FROM OPERACION WHERE opr_usr_id_usuario = %s', (usuario_id,))
            cursor.execute(
                'DELETE FROM SESION_EDICION WHERE ses_usr_id_usuario = %s', (usuario_id,))
            cursor.execute(
                'DELETE FROM CONFIGURACION WHERE cfg_usr_id_usuario = %s', (usuario_id,))
            cursor.execute(
                'DELETE FROM USUARIO WHERE usr_id_usuario = %s', (usuario_id,))

            conn.commit()
            print(f'✅ Usuario eliminado — ID: {usuario_id}')
            self.send_json_response(
                200, {'mensaje': 'Usuario eliminado correctamente'})

        except Exception as e:
            print(f'❌ Error al eliminar usuario: {e}')
            self.send_json_response(500, {'mensaje': 'Error en el servidor'})

        finally:
            try:
                cursor.close()
                conn.close()
            except Exception:
                pass


# ========== INICIAR SERVIDOR ==========
if __name__ == '__main__':
    servidor = HTTPServer(('localhost', PORT), ArtifyHandler)
    print(f'✅ Servidor Python corriendo en http://localhost:{PORT}')
    print('🚀 Endpoints disponibles:')
    print(f'   POST   http://localhost:{PORT}/api/login')
    print(f'   POST   http://localhost:{PORT}/api/registro')
    print(f'   GET    http://localhost:{PORT}/api/admin/usuarios')
    print(f'   POST   http://localhost:{PORT}/api/admin/usuario')
    print(f'   PUT    http://localhost:{PORT}/api/admin/usuario/:id')
    print(f'   DELETE http://localhost:{PORT}/api/admin/usuario/:id')
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        print('\n🛑 Servidor detenido')
        servidor.server_close()

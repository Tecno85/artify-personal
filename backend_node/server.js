// ========================================
// ARTIFY - SERVIDOR BACKEND PRINCIPAL
// Editor de imágenes web - SENA Colombia
// ========================================

// ========== DEPENDENCIAS ==========
// Importar librerías necesarias para el funcionamiento del servidor
const express = require('express'); // Framework para crear API REST
const mysql2 = require('mysql2'); // Conector a base de datos MySQL
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas
const dotenv = require('dotenv'); // Cargar variables de entorno desde .env
const cors = require('cors'); // Permitir solicitudes desde diferentes orígenes

// ========== CONFIGURACIÓN INICIAL ==========
// Cargar variables de entorno desde archivo .env
dotenv.config();

// Crear instancia de la aplicación Express
const app = express();

// Middleware para permitir solicitudes CORS (Cross-Origin Resource Sharing)
app.use(cors());

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Middleware para parsear texto plano en las solicitudes
app.use(express.text({ type: 'text/plain' }));

// ========== CONEXIÓN A MYSQL ==========
// Crear conexión a la base de datos MySQL con parámetros del .env
const db = mysql2.createConnection({
  host: process.env.DB_HOST, // Host del servidor MySQL (localhost)
  user: process.env.DB_USER, // Usuario de acceso a MySQL
  password: process.env.DB_PASSWORD, // Contraseña del usuario MySQL
  database: process.env.DB_NAME, // Nombre de la base de datos (artify_db)
});

// Verificar que la conexión a MySQL sea exitosa
db.connect((err) => {
  if (err) {
    // Si hay error, mostrar mensaje y detener
    console.error('❌ Error al conectar a MySQL:', err.message);
    return;
  }
  // Si conexión es exitosa, mostrar confirmación
  console.log('✅ Conectado a MySQL correctamente');
});

// ========================================
// AUTENTICACIÓN - ENDPOINTS DE LOGIN/REGISTRO
// ========================================

// ========== ENDPOINT DE LOGIN ==========
// POST /api/login
// Descripción: Autentica un usuario existente validando correo y contraseña
// Entrada: correo, password (en req.body)
// Salida: Datos del usuario autenticado o mensaje de error
app.post('/api/login', (req, res) => {
  // Extraer correo y contraseña del cuerpo de la solicitud
  const { correo, password } = req.body;

  // Log: mostrar datos recibidos (útil para debugging)
  console.log('🔍 req.body completo:', req.body);
  console.log('📨 Datos recibidos desde el formulario:');
  console.log('   Correo:', correo);
  console.log('   Contraseña:', password);

  // SQL: Buscar usuario en la base de datos por correo
  const query = 'SELECT * FROM USUARIO WHERE usr_correo = ?';

  // Ejecutar la consulta con el correo como parámetro
  db.query(query, [correo], (err, results) => {
    // Validar si hubo error en la consulta
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Validar si el usuario no existe
    if (results.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    // Obtener los datos del usuario encontrado
    const usuario = results[0];
    console.log(
      '✅ Usuario encontrado:',
      usuario.usr_nombres,
      usuario.usr_apellidos
    );

    // Validar la contraseña usando bcrypt (comparar con hash almacenado)
    const passwordValida = bcrypt.compareSync(password, usuario.usr_contrasena);

    // Si la contraseña es incorrecta, rechazar login
    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Si todo es válido, mostrar confirmación
    console.log('🎉 Login exitoso para:', usuario.usr_nombres);
    console.log('👤 Rol:', usuario.usr_rol);

    // Actualizar último acceso y marcar sesión como activa
    const queryAcceso = `
      UPDATE USUARIO 
      SET usr_ultimo_acceso = NOW(),
          usr_sesion_activa = 1
      WHERE usr_id_usuario = ?
    `;

    // Ejecutar actualización de último acceso
    db.query(queryAcceso, [usuario.usr_id_usuario], (errAcceso) => {
      if (errAcceso) {
        // Si falla la actualización, solo advertir (no es crítico)
        console.warn(
          '⚠️ No se pudo actualizar último acceso:',
          errAcceso.message
        );
      } else {
        console.log('✅ Último acceso actualizado');
      }
    });

    // Devolver respuesta exitosa con datos del usuario
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.usr_id_usuario,
        nombres: usuario.usr_nombres,
        apellidos: usuario.usr_apellidos,
        correo: usuario.usr_correo,
        rol: usuario.usr_rol,
      },
    });
  });
});

// ========== ENDPOINT DE REGISTRO ==========
// POST /api/registro
// Descripción: Registra un nuevo usuario en el sistema
// Entrada: nombres, apellidos, cedula, fechaNacimiento, correo, password
// Salida: Datos del nuevo usuario o mensaje de error
app.post('/api/registro', (req, res) => {
  // Extraer datos del formulario de registro
  const { nombres, apellidos, cedula, fechaNacimiento, correo, password } =
    req.body;

  // Log: mostrar datos de registro recibidos
  console.log('📨 Datos de registro recibidos:');
  console.log('   Nombres:', nombres);
  console.log('   Correo:', correo);

  // PASO 1: Verificar si el correo o cédula ya están registrados
  const queryBuscar =
    'SELECT * FROM USUARIO WHERE usr_correo = ? OR usr_cedula = ?';

  db.query(queryBuscar, [correo, cedula], (err, results) => {
    // Validar si hubo error en la consulta
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Si el correo o cédula ya existen, rechazar registro
    if (results.length > 0) {
      console.log('❌ El correo o cédula ya está registrado');
      return res
        .status(400)
        .json({ mensaje: 'El correo o cédula ya está registrado' });
    }

    // PASO 2: Encriptar la contraseña con bcrypt (10 rondas de hashing)
    const hash = bcrypt.hashSync(password, 10);
    console.log('🔐 Contraseña encriptada correctamente');

    // PASO 3: Insertar el nuevo usuario en la base de datos
    const queryInsertar = `
      INSERT INTO USUARIO 
        (usr_nombres, usr_apellidos, usr_cedula, usr_fecha_nacimiento, 
         usr_correo, usr_contrasena, usr_fecha_registro, usr_estado_usuario)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 'activo')
    `;

    // Ejecutar inserción con los parámetros del usuario
    db.query(
      queryInsertar,
      [nombres, apellidos, cedula, fechaNacimiento, correo, hash],
      (err, result) => {
        // Validar si hubo error al insertar
        if (err) {
          console.error('❌ Error al insertar usuario:', err.message);
          return res
            .status(500)
            .json({ mensaje: 'Error al registrar usuario' });
        }

        // Mostrar confirmación de registro exitoso
        console.log('✅ Usuario registrado exitosamente:', nombres, apellidos);
        console.log('   ID asignado por MySQL:', result.insertId);

        // PASO 4: Crear configuración por defecto automáticamente
        const queryConfig = `
        INSERT INTO CONFIGURACION 
          (cfg_usr_id_usuario, cfg_calidad_exportacion, cfg_configuracion_avanzada, cfg_fecha_actualizacion)
        VALUES (?, 'media', ?, NOW())
      `;

        // Definir configuración inicial del usuario
        const configDefecto = JSON.stringify({
          notificaciones: true,
          formatoDefecto: 'png',
          autoguardado: false,
        });

        // Insertar configuración
        db.query(queryConfig, [result.insertId, configDefecto], (errConfig) => {
          if (errConfig) {
            // Si falla la configuración, solo advertir
            console.warn(
              '⚠️ No se pudo crear configuración por defecto:',
              errConfig.message
            );
          } else {
            console.log('✅ Configuración por defecto creada para:', nombres);
          }

          // Devolver respuesta exitosa (independiente de la configuración)
          res.json({
            mensaje: 'Registro exitoso',
            usuario: {
              id: result.insertId,
              nombres,
              apellidos,
              correo,
            },
          });
        });
      }
    );
  });
});

// ========================================
// CONFIGURACIÓN DE USUARIO - ENDPOINTS
// ========================================

// ========== ENDPOINT CARGAR CONFIGURACIÓN ==========
// GET /api/configuracion/:id
// Descripción: Obtiene las preferencias guardadas de un usuario
// Parámetro: id (ID del usuario)
// Salida: Objeto con preferencias o mensaje de error
app.get('/api/configuracion/:id', (req, res) => {
  // Extraer ID del usuario de los parámetros de la URL
  const { id } = req.params;

  console.log('📨 Cargando configuración del usuario ID:', id);

  // SQL: Buscar configuración del usuario
  const query = 'SELECT * FROM CONFIGURACION WHERE cfg_usr_id_usuario = ?';

  db.query(query, [id], (err, results) => {
    // Validar si hubo error en la consulta
    if (err) {
      console.error('❌ Error al cargar configuración:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Si no hay configuración guardada, devolver mensaje
    if (results.length === 0) {
      console.log('ℹ️ No hay configuración guardada para este usuario');
      return res.json({ mensaje: 'sin_configuracion' });
    }

    // Obtener la configuración del usuario
    const config = results[0];
    const avanzada = config.cfg_configuracion_avanzada || {};

    console.log('✅ Configuración cargada correctamente');

    // Devolver configuración formateada
    res.json({
      mensaje: 'ok',
      configuracion: {
        calidadExportacion: config.cfg_calidad_exportacion,
        notificaciones: avanzada.notificaciones ?? true,
        formatoDefecto: avanzada.formatoDefecto ?? 'png',
        autoguardado: avanzada.autoguardado ?? false,
      },
    });
  });
});

// ========== ENDPOINT GUARDAR CONFIGURACIÓN ==========
// POST /api/configuracion
// Descripción: Guarda o actualiza las preferencias de un usuario
// Entrada: idUsuario, calidadExportacion, notificaciones, formatoDefecto, autoguardado
// Salida: Mensaje de confirmación o error
app.post('/api/configuracion', (req, res) => {
  // Extraer datos de configuración del cuerpo de la solicitud
  const {
    idUsuario,
    calidadExportacion,
    notificaciones,
    formatoDefecto,
    autoguardado,
  } = req.body;

  console.log('📨 Guardando configuración del usuario ID:', idUsuario);

  // Preparar datos avanzados como JSON
  const avanzada = JSON.stringify({
    notificaciones,
    formatoDefecto,
    autoguardado,
  });

  // Verificar si el usuario ya tiene configuración guardada
  const queryBuscar =
    'SELECT * FROM CONFIGURACION WHERE cfg_usr_id_usuario = ?';

  db.query(queryBuscar, [idUsuario], (err, results) => {
    // Validar si hubo error en la consulta
    if (err) {
      console.error('❌ Error al buscar configuración:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Si NO existe configuración, insertarla (CREAR)
    if (results.length === 0) {
      const queryInsertar = `
        INSERT INTO CONFIGURACION 
          (cfg_usr_id_usuario, cfg_calidad_exportacion, cfg_configuracion_avanzada, cfg_fecha_actualizacion)
        VALUES (?, ?, ?, NOW())
      `;

      db.query(
        queryInsertar,
        [idUsuario, calidadExportacion, avanzada],
        (err) => {
          // Validar si hubo error al insertar
          if (err) {
            console.error('❌ Error al insertar configuración:', err.message);
            return res
              .status(500)
              .json({ mensaje: 'Error al guardar configuración' });
          }

          console.log('✅ Configuración guardada correctamente');
          res.json({ mensaje: 'Configuración guardada correctamente' });
        }
      );
    } else {
      // Si ya existe, actualizarla (UPDATE)
      const queryActualizar = `
        UPDATE CONFIGURACION 
        SET cfg_calidad_exportacion = ?,
            cfg_configuracion_avanzada = ?,
            cfg_fecha_actualizacion = NOW()
        WHERE cfg_usr_id_usuario = ?
      `;

      db.query(
        queryActualizar,
        [calidadExportacion, avanzada, idUsuario],
        (err) => {
          // Validar si hubo error al actualizar
          if (err) {
            console.error('❌ Error al actualizar configuración:', err.message);
            return res
              .status(500)
              .json({ mensaje: 'Error al actualizar configuración' });
          }

          console.log('✅ Configuración actualizada correctamente');
          res.json({ mensaje: 'Configuración guardada correctamente' });
        }
      );
    }
  });
});

// ========================================
// SESIONES DE EDICIÓN - ENDPOINTS
// ========================================

// ========== ENDPOINT INICIAR SESIÓN DE EDICIÓN ==========
// POST /api/sesion/iniciar
// Descripción: Crea una nueva sesión de edición cuando el usuario comienza a editar
// Entrada: idUsuario
// Salida: ID de la sesión creada o error
app.post('/api/sesion/iniciar', (req, res) => {
  // Extraer ID del usuario del cuerpo de la solicitud
  const { idUsuario } = req.body;

  console.log('📨 Iniciando sesión de edición para usuario ID:', idUsuario);

  // SQL: Insertar nueva sesión en estado activo
  const query = `
    INSERT INTO SESION_EDICION 
      (ses_usr_id_usuario, ses_fecha_inicio, ses_estado_sesion)
    VALUES (?, NOW(), 'activa')
  `;

  db.query(query, [idUsuario], (err, result) => {
    // Validar si hubo error al crear la sesión
    if (err) {
      console.error('❌ Error al iniciar sesión:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Mostrar confirmación con ID de sesión
    console.log('✅ Sesión de edición iniciada. ID:', result.insertId);
    res.json({
      mensaje: 'Sesión iniciada',
      idSesion: result.insertId,
    });
  });
});

// ========== ENDPOINT CERRAR SESIÓN DE EDICIÓN ==========
// POST /api/sesion/cerrar
// Descripción: Finaliza una sesión de edición (el usuario dejó de editar)
// Entrada: idSesion
// Salida: Mensaje de confirmación o error
app.post('/api/sesion/cerrar', (req, res) => {
  // Variable para almacenar el ID de la sesión
  let idSesion;

  // Validar si el ID viene en el cuerpo (puede venir de 2 formas)
  if (req.body && req.body.idSesion) {
    idSesion = req.body.idSesion;
  } else {
    // Intentar parsear manualmente si viene como texto plano
    try {
      const data =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      idSesion = data.idSesion;
    } catch {
      idSesion = null;
    }
  }

  console.log('📨 Cerrando sesión de edición ID:', idSesion);

  // SQL: Actualizar sesión a estado "finalizada"
  const query = `
    UPDATE SESION_EDICION 
    SET ses_fecha_fin = NOW(),
        ses_estado_sesion = 'finalizada'
    WHERE ses_id_sesion = ?
  `;

  db.query(query, [idSesion], (err) => {
    // Validar si hubo error al cerrar la sesión
    if (err) {
      console.error('❌ Error al cerrar sesión:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // SQL: Marcar usuario como sin sesión activa
    const queryInactiva = `
      UPDATE USUARIO u
      INNER JOIN SESION_EDICION s ON u.usr_id_usuario = s.ses_usr_id_usuario
      SET u.usr_sesion_activa = 0
      WHERE s.ses_id_sesion = ?
    `;

    db.query(queryInactiva, [idSesion], (errInactiva) => {
      if (errInactiva) {
        // Si falla actualizar estado, solo advertir
        console.warn(
          '⚠️ No se pudo actualizar sesión activa:',
          errInactiva.message
        );
      } else {
        console.log('✅ Sesión activa actualizada a inactiva');
      }

      console.log('✅ Sesión de edición cerrada correctamente');
      res.json({ mensaje: 'Sesión cerrada' });
    });
  });
});

// ========================================
// ESTADÍSTICAS Y OPERACIONES - ENDPOINTS
// ========================================

// ========== ENDPOINT OBTENER ESTADÍSTICAS DEL USUARIO ==========
// GET /api/estadisticas/:id
// Descripción: Obtiene resumen de actividad del usuario (sesiones, operaciones, imágenes)
// Parámetro: id (ID del usuario)
// Salida: Objeto con estadísticas o error
app.get('/api/estadisticas/:id', (req, res) => {
  // Extraer ID del usuario de los parámetros
  const { id } = req.params;

  console.log('📨 Cargando estadísticas del usuario ID:', id);

  // SQL 1: Contar total de sesiones del usuario
  const querySesiones = `
    SELECT COUNT(*) as total 
    FROM SESION_EDICION 
    WHERE ses_usr_id_usuario = ?
  `;

  db.query(querySesiones, [id], (err, results) => {
    // Validar si hubo error
    if (err) {
      console.error('❌ Error al obtener estadísticas:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Guardar total de sesiones
    const totalSesiones = results[0].total;

    // SQL 2: Contar total de operaciones del usuario
    const queryOperaciones = `
      SELECT COUNT(*) as total 
      FROM OPERACION 
      WHERE opr_usr_id_usuario = ?
    `;

    db.query(queryOperaciones, [id], (err, resOpe) => {
      // Validar si hubo error
      if (err) {
        console.error('❌ Error al obtener operaciones:', err.message);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      // Guardar total de operaciones
      const totalOperaciones = resOpe[0].total;

      // SQL 3: Contar total de imágenes del usuario
      const queryImagenes = `
        SELECT COUNT(*) as total 
        FROM IMAGEN 
        WHERE img_usr_id_usuario = ?
      `;

      db.query(queryImagenes, [id], (err, resImg) => {
        // Validar si hubo error
        if (err) {
          console.error('❌ Error al obtener imágenes:', err.message);
          return res.status(500).json({ mensaje: 'Error en el servidor' });
        }

        // Guardar total de imágenes
        const totalImagenes = resImg[0].total;

        // Mostrar todas las estadísticas
        console.log(
          '✅ Estadísticas cargadas. Sesiones:',
          totalSesiones,
          'Operaciones:',
          totalOperaciones,
          'Imágenes:',
          totalImagenes
        );

        // Devolver estadísticas compiladas
        res.json({
          mensaje: 'ok',
          estadisticas: {
            sesiones: totalSesiones,
            operaciones: totalOperaciones,
            imagenesEditadas: totalImagenes,
          },
        });
      });
    });
  });
});

// ========== ENDPOINT REGISTRAR OPERACIÓN ==========
// POST /api/operacion
// Descripción: Registra cada acción que el usuario realiza (filtro, crop, rotar, etc.)
// Entrada: idUsuario, idSesion, tipo, descripcion
// Salida: ID de la operación registrada o error
app.post('/api/operacion', (req, res) => {
  // Extraer datos de la operación
  const { idUsuario, idSesion, tipo, descripcion } = req.body;

  console.log('📨 Registrando operación:', tipo, 'para usuario ID:', idUsuario);

  // SQL: Insertar nueva operación en la base de datos
  const query = `
    INSERT INTO OPERACION 
      (opr_usr_id_usuario, opr_ses_id_sesion, opr_tipo_operacion, 
       opr_parametros, opr_fecha_hora, opr_orden_secuencial, opr_estado_operacion)
    VALUES (?, ?, ?, ?, NOW(), 1, 'completada')
  `;

  // Ejecutar inserción
  db.query(
    query,
    [
      idUsuario,
      idSesion,
      tipo,
      JSON.stringify({ descripcion: descripcion || '' }),
    ],
    (err, result) => {
      // Validar si hubo error
      if (err) {
        console.error('❌ Error al registrar operación:', err.message);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      console.log('✅ Operación registrada. ID:', result.insertId);

      // Actualizar contador de operaciones en la sesión
      const queryActividad = `
      UPDATE SESION_EDICION 
      SET ses_numero_operaciones = ses_numero_operaciones + 1
      WHERE ses_id_sesion = ?
    `;

      db.query(queryActividad, [idSesion], (errActividad) => {
        if (errActividad) {
          // Si falla, solo advertir (no es crítico)
          console.warn(
            '⚠️ No se pudo actualizar última actividad:',
            errActividad.message
          );
        } else {
          console.log(
            '✅ Última actividad actualizada para sesión ID:',
            idSesion
          );
        }

        // Devolver confirmación
        res.json({
          mensaje: 'Operación registrada',
          idOperacion: result.insertId,
        });
      });
    }
  );
});

// ========== ENDPOINT OBTENER TOTAL OPERACIONES ==========
// GET /api/operacion/total/:id
// Descripción: Obtiene el total de operaciones realizadas por un usuario
// Parámetro: id (ID del usuario)
// Salida: Número total de operaciones o error
app.get('/api/operacion/total/:id', (req, res) => {
  // Extraer ID del usuario de los parámetros
  const { id } = req.params;

  // SQL: Contar operaciones del usuario
  const query = `
    SELECT COUNT(*) as total 
    FROM OPERACION 
    WHERE opr_usr_id_usuario = ?
  `;

  db.query(query, [id], (err, results) => {
    // Validar si hubo error
    if (err) {
      console.error('❌ Error al obtener operaciones:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Devolver total de operaciones
    res.json({
      mensaje: 'ok',
      total: results[0].total,
    });
  });
});

// ========== ENDPOINT REGISTRAR IMAGEN EDITADA ==========
// POST /api/imagen
// Descripción: Registra una imagen que fue procesada/editada por el usuario
// Entrada: idUsuario, idSesion, nombreOriginal, formatoOriginal, formatoFinal, tamanoOriginal
// Salida: ID de la imagen registrada o error
app.post('/api/imagen', (req, res) => {
  // Extraer datos de la imagen
  const {
    idUsuario,
    idSesion,
    nombreOriginal,
    formatoOriginal,
    formatoFinal,
    tamanoOriginal,
  } = req.body;

  console.log('📨 Registrando imagen editada para usuario ID:', idUsuario);

  // SQL: Insertar nueva imagen en la base de datos
  const query = `
    INSERT INTO IMAGEN 
      (img_usr_id_usuario, img_nombre_original, img_nombre_archivo,
       img_formato, img_ancho_original, img_alto_original,
       img_tamano_bytes, img_fecha_subida, img_estado_imagen)
    VALUES (?, ?, ?, ?, 0, 0, ?, NOW(), 'activa')
  `;

  // Ejecutar inserción
  db.query(
    query,
    [
      idUsuario,
      nombreOriginal,
      nombreOriginal,
      formatoOriginal,
      tamanoOriginal,
    ],
    (err, result) => {
      // Validar si hubo error
      if (err) {
        console.error('❌ Error al registrar imagen:', err.message);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      console.log('✅ Imagen registrada. ID:', result.insertId);

      // Devolver confirmación
      res.json({
        mensaje: 'Imagen registrada',
        idImagen: result.insertId,
      });
    }
  );
});

// ========================================
// ADMINISTRACIÓN - ENDPOINTS CRUD
// ========================================

// ========== ENDPOINT LOGIN DE ADMINISTRADOR ==========
// POST /api/admin/login
// Descripción: Autentica al administrador con credenciales especiales
// Entrada: correo, password (desde .env)
// Salida: Confirmación de acceso o rechazo
app.post('/api/admin/login', (req, res) => {
  // Extraer credenciales del cuerpo de la solicitud
  const { correo, password } = req.body;

  console.log('📨 Intento de acceso al panel de administración:', correo);

  // Validar que las credenciales coincidan con las del .env
  if (
    correo !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    console.log('❌ Credenciales de administrador incorrectas');
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }

  console.log('✅ Acceso al panel de administración concedido');
  res.json({ mensaje: 'Acceso concedido', admin: { correo } });
});

// ========== ENDPOINT OBTENER TODOS LOS USUARIOS (SELECT) ==========
// GET /api/admin/usuarios
// Descripción: Obtiene lista de todos los usuarios registrados
// Entrada: Ninguna (solo acceso admin)
// Salida: Array con todos los usuarios o error
app.get('/api/admin/usuarios', (req, res) => {
  console.log('📨 Obteniendo lista de usuarios');

  // SQL: Seleccionar todos los usuarios ordenados por fecha de registro
  const query = `
    SELECT usr_id_usuario, usr_nombres, usr_apellidos, 
           usr_cedula, usr_fecha_nacimiento, usr_correo, 
           usr_fecha_registro, usr_estado_usuario, usr_rol
    FROM USUARIO
    ORDER BY usr_fecha_registro DESC
  `;

  db.query(query, (err, results) => {
    // Validar si hubo error
    if (err) {
      console.error('❌ Error al obtener usuarios:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('✅ Usuarios obtenidos:', results.length);

    // Devolver lista de usuarios
    res.json({ mensaje: 'ok', usuarios: results });
  });
});

// ========== ENDPOINT CREAR NUEVO USUARIO (INSERT) ==========
// POST /api/admin/usuario
// Descripción: Crea un nuevo usuario desde el panel de administración
// Entrada: nombres, apellidos, cedula, fechaNacimiento, correo, password
// Salida: Mensaje de confirmación o error
app.post('/api/admin/usuario', (req, res) => {
  // Extraer datos del nuevo usuario
  const { nombres, apellidos, cedula, fechaNacimiento, correo, password } =
    req.body;

  console.log('📨 Agregando nuevo usuario:', nombres);

  // PASO 1: Verificar que el correo y cédula no existan
  const queryBuscar =
    'SELECT * FROM USUARIO WHERE usr_correo = ? OR usr_cedula = ?';

  db.query(queryBuscar, [correo, cedula], (err, results) => {
    // Validar si hubo error
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    // Si ya existe, rechazar
    if (results.length > 0) {
      return res
        .status(400)
        .json({ mensaje: 'El correo o cédula ya está registrado' });
    }

    // PASO 2: Encriptar la contraseña
    const hash = bcrypt.hashSync(password, 10);

    // PASO 3: Insertar el nuevo usuario
    const queryInsertar = `
      INSERT INTO USUARIO 
        (usr_nombres, usr_apellidos, usr_cedula, usr_fecha_nacimiento,
         usr_correo, usr_contrasena, usr_fecha_registro, usr_estado_usuario)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), 'activo')
    `;

    db.query(
      queryInsertar,
      [nombres, apellidos, cedula, fechaNacimiento, correo, hash],
      (err, result) => {
        // Validar si hubo error
        if (err) {
          console.error('❌ Error al insertar usuario:', err.message);
          return res.status(500).json({ mensaje: 'Error al agregar usuario' });
        }

        // PASO 4: Crear configuración por defecto para el nuevo usuario
        const configDefecto = JSON.stringify({
          notificaciones: true,
          formatoDefecto: 'png',
          autoguardado: false,
        });

        db.query(
          `INSERT INTO CONFIGURACION (cfg_usr_id_usuario, cfg_calidad_exportacion, cfg_configuracion_avanzada, cfg_fecha_actualizacion) VALUES (?, 'media', ?, NOW())`,
          [result.insertId, configDefecto]
        );

        console.log('✅ Usuario agregado correctamente:', nombres);
        res.json({ mensaje: 'Usuario agregado correctamente' });
      }
    );
  });
});

// ========== ENDPOINT EDITAR USUARIO (UPDATE) ==========
// PUT /api/admin/usuario/:id
// Descripción: Actualiza los datos de un usuario existente
// Parámetro: id (ID del usuario a editar)
// Entrada: nombres, apellidos, cedula, fechaNacimiento, correo, estado
// Salida: Mensaje de confirmación o error
app.put('/api/admin/usuario/:id', (req, res) => {
  // Extraer ID del usuario de los parámetros
  const { id } = req.params;

  // Extraer datos actualizados del cuerpo de la solicitud
  const { nombres, apellidos, cedula, fechaNacimiento, correo, estado } =
    req.body;

  console.log('📨 Editando usuario ID:', id);

  // SQL: Actualizar datos del usuario
  const query = `
    UPDATE USUARIO 
    SET usr_nombres = ?,
        usr_apellidos = ?,
        usr_cedula = ?,
        usr_fecha_nacimiento = ?,
        usr_correo = ?,
        usr_estado_usuario = ?
    WHERE usr_id_usuario = ?
  `;

  db.query(
    query,
    [nombres, apellidos, cedula, fechaNacimiento, correo, estado, id],
    (err) => {
      // Validar si hubo error
      if (err) {
        console.error('❌ Error al editar usuario:', err.message);
        return res.status(500).json({ mensaje: 'Error al editar usuario' });
      }

      console.log('✅ Usuario editado correctamente');
      res.json({ mensaje: 'Usuario editado correctamente' });
    }
  );
});

// ========== ENDPOINT ELIMINAR USUARIO (DELETE) ==========
// DELETE /api/admin/usuario/:id
// Descripción: Elimina un usuario y todos sus datos asociados (cascada)
// Parámetro: id (ID del usuario a eliminar)
// Salida: Mensaje de confirmación o error
app.delete('/api/admin/usuario/:id', (req, res) => {
  // Extraer ID del usuario de los parámetros
  const { id } = req.params;

  console.log('📨 Eliminando usuario ID:', id);

  // Array de queries para eliminar en cascada (orden importante)
  // Se elimina primero lo dependiente, luego lo principal
  const queries = [
    'DELETE FROM IMAGEN WHERE img_usr_id_usuario = ?',
    'DELETE FROM OPERACION WHERE opr_usr_id_usuario = ?',
    'DELETE FROM SESION_EDICION WHERE ses_usr_id_usuario = ?',
    'DELETE FROM CONFIGURACION WHERE cfg_usr_id_usuario = ?',
    'DELETE FROM USUARIO WHERE usr_id_usuario = ?',
  ];

  // Función recursiva para ejecutar queries en orden
  const ejecutarQuery = (index) => {
    // Si ya se ejecutaron todas, retornar éxito
    if (index >= queries.length) {
      console.log('✅ Usuario eliminado correctamente');
      return res.json({ mensaje: 'Usuario eliminado correctamente' });
    }

    // Ejecutar query actual
    db.query(queries[index], [id], (err) => {
      // Validar si hubo error
      if (err) {
        console.error('❌ Error al eliminar:', err.message);
        return res.status(500).json({ mensaje: 'Error al eliminar usuario' });
      }

      // Pasar a la siguiente query
      ejecutarQuery(index + 1);
    });
  };

  // Iniciar eliminación cascada
  ejecutarQuery(0);
});

// ========================================
// ANALYTICS - ENDPOINTS DE DATOS
// ========================================

// ========== ANALYTICS: FILTROS MÁS USADOS ==========
// GET /api/v1/analytics/filtros-populares
// Descripción: Obtiene los filtros más utilizados por los usuarios
// Entrada: Ninguna
// Salida: Array con filtros ordenados por uso descendente
app.get('/api/v1/analytics/filtros-populares', (req, res) => {
  // Log informativo: inicio de la solicitud
  console.log('📊 Obteniendo filtros más usados');

  // Query SQL: Cuenta cuántas veces se usó cada filtro
  const query = `
    SELECT 
      opr_tipo_operacion as filtro,        -- Nombre del filtro (sepia, blanco_negro, etc.)
      COUNT(*) as usos,                    -- Cantidad de veces usado
      ROUND(100 * COUNT(*) / (SELECT COUNT(*) FROM OPERACION), 2) as porcentaje
    FROM OPERACION
    WHERE opr_estado_operacion = 'completada'  -- Solo operaciones completadas
    GROUP BY opr_tipo_operacion                 -- Agrupar por tipo de filtro
    ORDER BY usos DESC                          -- Ordenar de mayor a menor
    LIMIT 10                                    -- Máximo 10 resultados
  `;

  // Ejecutar query en la base de datos
  db.query(query, (err, results) => {
    // Si hay error, devolver respuesta de error
    if (err) {
      console.error('❌ Error obteniendo filtros:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
        error: err.message,
      });
    }

    // Si éxito, loguear y devolver datos
    console.log('✅ Filtros obtenidos:', results.length);
    res.json({
      ok: true,
      mensaje: 'Top filtros utilizados',
      data: {
        filtros: results, // Array de filtros con sus datos
      },
      meta: {
        timestamp: new Date().toISOString(), // Hora exacta de la solicitud
        totalFiltros: results.length, // Cantidad de filtros retornados
      },
    });
  });
});

// ========== ANALYTICS: HORARIOS DE EDICIÓN ==========
// GET /api/v1/analytics/horarios-edicion
// Descripción: Obtiene las horas pico en que los usuarios editan imágenes
// Entrada: Ninguna
// Salida: Array con horas y cantidad de ediciones por hora
app.get('/api/v1/analytics/horarios-edicion', (req, res) => {
  // Log informativo: inicio de la solicitud
  console.log('📊 Obteniendo horarios de edición');

  // Query SQL: Cuenta operaciones agrupadas por hora del día
  const query = `
    SELECT 
      HOUR(opr_fecha_hora) as hora,           -- Hora del día (0-23)
      COUNT(*) as cantidad_ediciones,         -- Cantidad de operaciones en esa hora
      ROUND(100 * COUNT(*) / (SELECT COUNT(*) FROM OPERACION), 2) as porcentaje
    FROM OPERACION
    WHERE opr_estado_operacion = 'completada' -- Solo operaciones completadas
    GROUP BY HOUR(opr_fecha_hora)             -- Agrupar por hora
    ORDER BY cantidad_ediciones DESC          -- Ordenar de mayor a menor
  `;

  // Ejecutar query en la base de datos
  db.query(query, (err, results) => {
    // Si hay error, devolver respuesta de error
    if (err) {
      console.error('❌ Error obteniendo horarios:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
        error: err.message,
      });
    }

    // Si éxito, loguear y devolver datos
    console.log('✅ Horarios obtenidos:', results.length);
    res.json({
      ok: true,
      mensaje: 'Horarios pico de edición',
      data: {
        horarios: results, // Array de horas con cantidad de ediciones
      },
      meta: {
        timestamp: new Date().toISOString(),
        totalHoras: results.length,
      },
    });
  });
});

// ========== ANALYTICS: FORMATOS PREFERIDOS ==========
// GET /api/v1/analytics/formatos-preferidos
// Descripción: Obtiene los formatos de imagen más descargados
// Entrada: Ninguna
// Salida: Array con formatos ordenados por cantidad de descargas
app.get('/api/v1/analytics/formatos-preferidos', (req, res) => {
  // Log informativo: inicio de la solicitud
  console.log('📊 Obteniendo formatos preferidos');

  // Query SQL: Cuenta imágenes por formato
  const query = `
    SELECT 
      img_formato as formato,                 -- Formato de imagen (jpeg, png, etc.)
      COUNT(*) as descargas,                  -- Cantidad de imágenes en ese formato
      ROUND(100 * COUNT(*) / (SELECT COUNT(*) FROM IMAGEN), 2) as porcentaje
    FROM IMAGEN
    WHERE img_estado_imagen = 'activa'        -- Solo imágenes activas
    GROUP BY img_formato                      -- Agrupar por formato
    ORDER BY descargas DESC                   -- Ordenar de mayor a menor
  `;

  // Ejecutar query en la base de datos
  db.query(query, (err, results) => {
    // Si hay error, devolver respuesta de error
    if (err) {
      console.error('❌ Error obteniendo formatos:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
        error: err.message,
      });
    }

    // Si éxito, loguear y devolver datos
    console.log('✅ Formatos obtenidos:', results.length);
    res.json({
      ok: true,
      mensaje: 'Formatos más descargados',
      data: {
        formatos: results, // Array de formatos con cantidad de descargas
      },
      meta: {
        timestamp: new Date().toISOString(),
        totalFormatos: results.length,
      },
    });
  });
});

// ========== ANALYTICS: TASA DE CONVERSIÓN ==========
// GET /api/v1/analytics/tasa-conversion
// Descripción: Calcula el porcentaje de sesiones donde se guardaron cambios
// Entrada: Ninguna
// Salida: Porcentaje de conversión y estadísticas
app.get('/api/v1/analytics/tasa-conversion', (req, res) => {
  // Log informativo: inicio de la solicitud
  console.log('📊 Obteniendo tasa de conversión');

  // Query SQL: Calcula porcentaje de sesiones exitosas
  const query = `
    SELECT 
      ROUND(100 * SUM(CASE WHEN ses_cambios_guardados = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) as tasa_conversion_porcentaje,
      COUNT(*) as total_sesiones,            -- Total de sesiones finalizadas
      SUM(CASE WHEN ses_cambios_guardados = 1 THEN 1 ELSE 0 END) as sesiones_exitosas
    FROM SESION_EDICION
    WHERE ses_estado_sesion = 'finalizada'   -- Solo sesiones completadas
  `;

  // Ejecutar query en la base de datos
  db.query(query, (err, results) => {
    // Si hay error, devolver respuesta de error
    if (err) {
      console.error('❌ Error obteniendo tasa de conversión:', err.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error obteniendo datos',
        error: err.message,
      });
    }

    // Si éxito, loguear y devolver datos
    console.log('✅ Tasa de conversión obtenida');
    res.json({
      ok: true,
      mensaje: 'Tasa de conversión de sesiones',
      data: {
        conversionData: results[0], // Primer (y único) resultado de la query
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  });
});

// ========================================
// MANTENIMIENTO AUTOMÁTICO
// ========================================

// ========== LIMPIEZA AUTOMÁTICA DE SESIONES INACTIVAS ==========
// Descripción: Se ejecuta cada 30 minutos y cierra sesiones que llevan
// más de 8 horas sin actividad (usuario abandonó la aplicación)
setInterval(
  () => {
    // SQL: Buscar y cerrar sesiones activas que superan 8 horas
    const query = `
    UPDATE SESION_EDICION 
    SET ses_fecha_fin = NOW(),
        ses_estado_sesion = 'finalizada'
    WHERE ses_estado_sesion = 'activa'
    AND ses_fecha_inicio < DATE_SUB(NOW(), INTERVAL 8 HOUR)
  `;

    // Ejecutar limpieza
    db.query(query, (err, result) => {
      // Validar si hubo error
      if (err) {
        console.error('❌ Error en limpieza de sesiones:', err.message);
        return;
      }

      // Si se cerraron sesiones, mostrar reporte
      if (result.affectedRows > 0) {
        console.log(
          `🧹 Limpieza automática: ${result.affectedRows} sesión(es) cerrada(s) por inactividad`
        );
      }
    });
  },
  30 * 60 * 1000 // Ejecutar cada 30 minutos (30 * 60 segundos * 1000 milisegundos)
);

// ========================================
// INICIAR SERVIDOR
// ========================================

// Obtener puerto desde variable de entorno o usar 3000 por defecto
const PORT = process.env.PORT || 3000;

// Iniciar el servidor Express en el puerto especificado
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

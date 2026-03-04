// ========== DEPENDENCIAS ==========
const express = require('express');
const mysql2 = require('mysql2');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');

// ========== CONFIGURACIÓN ==========
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain' }));

// ========== CONEXIÓN A MYSQL ==========
const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err.message);
    return;
  }
  console.log('✅ Conectado a MySQL correctamente');
});

// ========== ENDPOINT DE LOGIN ==========
app.post('/api/login', (req, res) => {
  const { correo, password } = req.body;
  console.log('🔍 req.body completo:', req.body);

  console.log('📨 Datos recibidos desde el formulario:');
  console.log('   Correo:', correo);
  console.log('   Contraseña:', password);

  // Buscar usuario en la base de datos
  const query = 'SELECT * FROM USUARIO WHERE usr_correo = ?';

  db.query(query, [correo], (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = results[0];
    console.log(
      '✅ Usuario encontrado:',
      usuario.usr_nombres,
      usuario.usr_apellidos
    );

    // Validar contraseña con bcrypt
    const passwordValida = bcrypt.compareSync(password, usuario.usr_contrasena);

    if (!passwordValida) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    console.log('🎉 Login exitoso para:', usuario.usr_nombres);
    console.log('👤 Rol:', usuario.usr_rol);
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
app.post('/api/registro', (req, res) => {
  const { nombres, apellidos, cedula, fechaNacimiento, correo, password } =
    req.body;

  console.log('📨 Datos de registro recibidos:');
  console.log('   Nombres:', nombres);
  console.log('   Correo:', correo);

  // 1. Verificar si el correo ya existe
  const queryBuscar =
    'SELECT * FROM USUARIO WHERE usr_correo = ? OR usr_cedula = ?';

  db.query(queryBuscar, [correo, cedula], (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length > 0) {
      console.log('❌ El correo o cédula ya está registrado');
      return res
        .status(400)
        .json({ mensaje: 'El correo o cédula ya está registrado' });
    }

    // 2. Encriptar la contraseña con bcrypt
    const hash = bcrypt.hashSync(password, 10);
    console.log('🔐 Contraseña encriptada correctamente');

    // 3. Insertar el nuevo usuario en MySQL
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
        if (err) {
          console.error('❌ Error al insertar usuario:', err.message);
          return res
            .status(500)
            .json({ mensaje: 'Error al registrar usuario' });
        }

        console.log('✅ Usuario registrado exitosamente:', nombres, apellidos);
        console.log('   ID asignado por MySQL:', result.insertId);

        // Crear configuración por defecto automáticamente
        const queryConfig = `
        INSERT INTO CONFIGURACION 
          (cfg_usr_id_usuario, cfg_calidad_exportacion, cfg_configuracion_avanzada, cfg_fecha_actualizacion)
        VALUES (?, 'media', ?, NOW())
      `;

        const configDefecto = JSON.stringify({
          notificaciones: true,
          formatoDefecto: 'png',
          autoguardado: false,
        });

        db.query(queryConfig, [result.insertId, configDefecto], (errConfig) => {
          if (errConfig) {
            console.warn(
              '⚠️ No se pudo crear configuración por defecto:',
              errConfig.message
            );
          } else {
            console.log('✅ Configuración por defecto creada para:', nombres);
          }

          // Responder al frontend independientemente del resultado de la configuración
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

// ========== ENDPOINT CARGAR CONFIGURACIÓN ==========
app.get('/api/configuracion/:id', (req, res) => {
  const { id } = req.params;

  console.log('📨 Cargando configuración del usuario ID:', id);

  const query = 'SELECT * FROM CONFIGURACION WHERE cfg_usr_id_usuario = ?';

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al cargar configuración:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length === 0) {
      console.log('ℹ️ No hay configuración guardada para este usuario');
      return res.json({ mensaje: 'sin_configuracion' });
    }

    const config = results[0];
    const avanzada = config.cfg_configuracion_avanzada || {};

    console.log('✅ Configuración cargada correctamente');
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
app.post('/api/configuracion', (req, res) => {
  const {
    idUsuario,
    calidadExportacion,
    notificaciones,
    formatoDefecto,
    autoguardado,
  } = req.body;

  console.log('📨 Guardando configuración del usuario ID:', idUsuario);

  const avanzada = JSON.stringify({
    notificaciones,
    formatoDefecto,
    autoguardado,
  });

  // Verificar si ya tiene configuración guardada
  const queryBuscar =
    'SELECT * FROM CONFIGURACION WHERE cfg_usr_id_usuario = ?';

  db.query(queryBuscar, [idUsuario], (err, results) => {
    if (err) {
      console.error('❌ Error al buscar configuración:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length === 0) {
      // Insertar nueva configuración
      const queryInsertar = `
        INSERT INTO CONFIGURACION 
          (cfg_usr_id_usuario, cfg_calidad_exportacion, cfg_configuracion_avanzada, cfg_fecha_actualizacion)
        VALUES (?, ?, ?, NOW())
      `;

      db.query(
        queryInsertar,
        [idUsuario, calidadExportacion, avanzada],
        (err) => {
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
      // Actualizar configuración existente
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

// ========== ENDPOINT INICIAR SESIÓN DE EDICIÓN ==========
app.post('/api/sesion/iniciar', (req, res) => {
  const { idUsuario } = req.body;

  console.log('📨 Iniciando sesión de edición para usuario ID:', idUsuario);

  const query = `
    INSERT INTO SESION_EDICION 
      (ses_usr_id_usuario, ses_fecha_inicio, ses_estado)
    VALUES (?, NOW(), 'activa')
  `;

  db.query(query, [idUsuario], (err, result) => {
    if (err) {
      console.error('❌ Error al iniciar sesión:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('✅ Sesión de edición iniciada. ID:', result.insertId);
    res.json({
      mensaje: 'Sesión iniciada',
      idSesion: result.insertId,
    });
  });
});

// ========== ENDPOINT CERRAR SESIÓN DE EDICIÓN ==========
app.post('/api/sesion/cerrar', (req, res) => {
  let idSesion;

  // sendBeacon envía los datos como text/plain o application/json
  if (req.body && req.body.idSesion) {
    idSesion = req.body.idSesion;
  } else {
    // Intentar parsear el body manualmente si viene como texto
    try {
      const data =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      idSesion = data.idSesion;
    } catch {
      idSesion = null;
    }
  }

  console.log('📨 Cerrando sesión de edición ID:', idSesion);

  const query = `
    UPDATE SESION_EDICION 
    SET ses_fecha_fin = NOW(),
        ses_estado = 'cerrada'
    WHERE ses_id_sesion = ?
  `;

  db.query(query, [idSesion], (err) => {
    if (err) {
      console.error('❌ Error al cerrar sesión:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('✅ Sesión de edición cerrada correctamente');
    res.json({ mensaje: 'Sesión cerrada' });
  });
});

// ========== ENDPOINT OBTENER ESTADÍSTICAS DEL USUARIO ==========
app.get('/api/estadisticas/:id', (req, res) => {
  const { id } = req.params;

  console.log('📨 Cargando estadísticas del usuario ID:', id);

  const querySesiones = `
    SELECT COUNT(*) as total 
    FROM SESION_EDICION 
    WHERE ses_usr_id_usuario = ?
  `;

  db.query(querySesiones, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener estadísticas:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    const totalSesiones = results[0].total;

    // Contar operaciones del usuario
    const queryOperaciones = `
      SELECT COUNT(*) as total 
      FROM OPERACION 
      WHERE ope_usr_id_usuario = ?
    `;

    db.query(queryOperaciones, [id], (err, resOpe) => {
      if (err) {
        console.error('❌ Error al obtener operaciones:', err.message);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      const totalOperaciones = resOpe[0].total;

      // Contar imágenes editadas del usuario
      const queryImagenes = `
        SELECT COUNT(*) as total 
        FROM IMAGEN_OPERACION 
        WHERE img_usr_id_usuario = ?
      `;

      db.query(queryImagenes, [id], (err, resImg) => {
        if (err) {
          console.error('❌ Error al obtener imágenes:', err.message);
          return res.status(500).json({ mensaje: 'Error en el servidor' });
        }

        const totalImagenes = resImg[0].total;

        console.log(
          '✅ Estadísticas cargadas. Sesiones:',
          totalSesiones,
          'Operaciones:',
          totalOperaciones,
          'Imágenes:',
          totalImagenes
        );
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
app.post('/api/operacion', (req, res) => {
  const { idUsuario, idSesion, tipo, descripcion } = req.body;

  console.log('📨 Registrando operación:', tipo, 'para usuario ID:', idUsuario);

  const query = `
    INSERT INTO OPERACION 
      (ope_usr_id_usuario, ope_ses_id_sesion, ope_tipo, ope_descripcion, ope_fecha)
    VALUES (?, ?, ?, ?, NOW())
  `;

  db.query(query, [idUsuario, idSesion, tipo, descripcion], (err, result) => {
    if (err) {
      console.error('❌ Error al registrar operación:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('✅ Operación registrada. ID:', result.insertId);

    // Actualizar última actividad de la sesión
    const queryActividad = `
      UPDATE SESION_EDICION 
      SET ses_ultima_actividad = NOW()
      WHERE ses_id_sesion = ?
    `;

    db.query(queryActividad, [idSesion], (errActividad) => {
      if (errActividad) {
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

      res.json({
        mensaje: 'Operación registrada',
        idOperacion: result.insertId,
      });
    });
  });
});

// ========== ENDPOINT OBTENER TOTAL OPERACIONES ==========
app.get('/api/operacion/total/:id', (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT COUNT(*) as total 
    FROM OPERACION 
    WHERE ope_usr_id_usuario = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener operaciones:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    res.json({
      mensaje: 'ok',
      total: results[0].total,
    });
  });
});

// ========== ENDPOINT REGISTRAR IMAGEN EDITADA ==========
app.post('/api/imagen', (req, res) => {
  const {
    idUsuario,
    idSesion,
    nombreOriginal,
    formatoOriginal,
    formatoFinal,
    tamanoOriginal,
  } = req.body;

  console.log('📨 Registrando imagen editada para usuario ID:', idUsuario);

  const query = `
    INSERT INTO IMAGEN_OPERACION 
      (img_usr_id_usuario, img_ses_id_sesion, img_nombre_original, 
       img_formato_original, img_formato_final, img_tamano_original, img_fecha_edicion)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [
      idUsuario,
      idSesion,
      nombreOriginal,
      formatoOriginal,
      formatoFinal,
      tamanoOriginal,
    ],
    (err, result) => {
      if (err) {
        console.error('❌ Error al registrar imagen:', err.message);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      console.log('✅ Imagen registrada. ID:', result.insertId);
      res.json({
        mensaje: 'Imagen registrada',
        idImagen: result.insertId,
      });
    }
  );
});

// ========== ENDPOINTS PANEL DE ADMINISTRACIÓN ==========

// Login del administrador
app.post('/api/admin/login', (req, res) => {
  const { correo, password } = req.body;

  console.log('📨 Intento de acceso al panel de administración:', correo);

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

// Select — Obtener todos los usuarios
app.get('/api/admin/usuarios', (req, res) => {
  console.log('📨 Obteniendo lista de usuarios');

  const query = `
    SELECT usr_id_usuario, usr_nombres, usr_apellidos, 
           usr_cedula, usr_fecha_nacimiento, usr_correo, 
           usr_fecha_registro, usr_estado_usuario, usr_rol
    FROM USUARIO
    ORDER BY usr_fecha_registro DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener usuarios:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    console.log('✅ Usuarios obtenidos:', results.length);
    res.json({ mensaje: 'ok', usuarios: results });
  });
});

// Insert — Agregar nuevo usuario
app.post('/api/admin/usuario', (req, res) => {
  const { nombres, apellidos, cedula, fechaNacimiento, correo, password } =
    req.body;

  console.log('📨 Agregando nuevo usuario:', nombres);

  const queryBuscar =
    'SELECT * FROM USUARIO WHERE usr_correo = ? OR usr_cedula = ?';

  db.query(queryBuscar, [correo, cedula], (err, results) => {
    if (err) {
      console.error('❌ Error en la consulta:', err.message);
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ mensaje: 'El correo o cédula ya está registrado' });
    }

    const hash = bcrypt.hashSync(password, 10);

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
        if (err) {
          console.error('❌ Error al insertar usuario:', err.message);
          return res.status(500).json({ mensaje: 'Error al agregar usuario' });
        }

        // Crear configuración por defecto
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

// Update — Editar usuario
app.put('/api/admin/usuario/:id', (req, res) => {
  const { id } = req.params;
  const { nombres, apellidos, cedula, fechaNacimiento, correo, estado } =
    req.body;

  console.log('📨 Editando usuario ID:', id);

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
      if (err) {
        console.error('❌ Error al editar usuario:', err.message);
        return res.status(500).json({ mensaje: 'Error al editar usuario' });
      }

      console.log('✅ Usuario editado correctamente');
      res.json({ mensaje: 'Usuario editado correctamente' });
    }
  );
});

// Delete — Eliminar usuario
app.delete('/api/admin/usuario/:id', (req, res) => {
  const { id } = req.params;

  console.log('📨 Eliminando usuario ID:', id);

  // Eliminar registros relacionados primero
  const queries = [
    'DELETE FROM IMAGEN_OPERACION WHERE img_usr_id_usuario = ?',
    'DELETE FROM OPERACION WHERE ope_usr_id_usuario = ?',
    'DELETE FROM SESION_EDICION WHERE ses_usr_id_usuario = ?',
    'DELETE FROM CONFIGURACION WHERE cfg_usr_id_usuario = ?',
    'DELETE FROM USUARIO WHERE usr_id_usuario = ?',
  ];

  const ejecutarQuery = (index) => {
    if (index >= queries.length) {
      console.log('✅ Usuario eliminado correctamente');
      return res.json({ mensaje: 'Usuario eliminado correctamente' });
    }

    db.query(queries[index], [id], (err) => {
      if (err) {
        console.error('❌ Error al eliminar:', err.message);
        return res.status(500).json({ mensaje: 'Error al eliminar usuario' });
      }
      ejecutarQuery(index + 1);
    });
  };

  ejecutarQuery(0);
});

// ========== LIMPIEZA AUTOMÁTICA DE SESIONES INACTIVAS ==========
// Se ejecuta cada 30 minutos y cierra sesiones que llevan
// más de 8 horas sin actividad
setInterval(
  () => {
    const query = `
    UPDATE SESION_EDICION 
    SET ses_fecha_fin = NOW(),
        ses_estado = 'cerrada'
    WHERE ses_estado = 'activa' 
    AND (
      -- Si tiene actividad registrada, verificar desde la última actividad
      (ses_ultima_actividad IS NOT NULL 
       AND ses_ultima_actividad < DATE_SUB(NOW(), INTERVAL 8 HOUR))
      OR
      -- Si nunca tuvo actividad, verificar desde el inicio de sesión
      (ses_ultima_actividad IS NULL 
       AND ses_fecha_inicio < DATE_SUB(NOW(), INTERVAL 8 HOUR))
    )
  `;

    db.query(query, (err, result) => {
      if (err) {
        console.error('❌ Error en limpieza de sesiones:', err.message);
        return;
      }
      if (result.affectedRows > 0) {
        console.log(
          `🧹 Limpieza automática: ${result.affectedRows} sesión(es) cerrada(s) por inactividad`
        );
      }
    });
  },
  30 * 60 * 1000
); // cada 30 minutos

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

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
    res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.usr_id_usuario,
        nombres: usuario.usr_nombres,
        apellidos: usuario.usr_apellidos,
        correo: usuario.usr_correo,
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

        res.json({
          mensaje: 'Registro exitoso',
          usuario: {
            id: result.insertId,
            nombres,
            apellidos,
            correo,
          },
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
  const { idSesion } = req.body;

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

      console.log(
        '✅ Estadísticas cargadas. Sesiones:',
        totalSesiones,
        'Operaciones:',
        totalOperaciones
      );
      res.json({
        mensaje: 'ok',
        estadisticas: {
          sesiones: totalSesiones,
          operaciones: totalOperaciones,
          imagenesEditadas: 0,
        },
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
    res.json({
      mensaje: 'Operación registrada',
      idOperacion: result.insertId,
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

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

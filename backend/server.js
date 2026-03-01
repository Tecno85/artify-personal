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

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

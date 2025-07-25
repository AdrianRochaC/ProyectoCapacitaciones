// server.js - Backend con Login, Registro y Gestión de Usuarios
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
// Agregar importación de los endpoints de preferencias
import {
  updateBackgroundImage,
  getBackgroundImage
} from './userPreferences.js';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'tu_clave_secreta_jwt'; // En producción usar variable de entorno

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Configurar límites de payload más grandes para imágenes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir la carpeta de videos como archivos estáticos (pública, antes de autenticación)
app.use('/uploads/videos', express.static('uploads/videos'));

// Configuración de almacenamiento para videos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/videos/'); // Carpeta donde se guardarán los videos
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const upload = multer({ storage: storage });

// Crear carpeta uploads/documents si no existe
const documentsDir = 'uploads/documents';
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Configuración de Multer para documentos
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, documentsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});
const documentUpload = multer({
  storage: documentStorage,
  fileFilter: function (req, file, cb) {
    // Permitir solo PDF, Word, Excel
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB máximo
});

// Servir documentos como archivos estáticos
app.use('/uploads/documents', express.static(documentsDir));

// Endpoint para subir documento (con asignación múltiple)
app.post('/api/documents', verifyToken, documentUpload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió ningún archivo.' });
    }
    const { is_global, roles, users } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    // Insertar documento
    const [result] = await connection.execute(
      `INSERT INTO documents (name, filename, mimetype, size, user_id, is_global) VALUES (?, ?, ?, ?, ?, ?)`,
      [req.file.originalname, req.file.filename, req.file.mimetype, req.file.size, req.user.id, is_global === 'true' || is_global === true]
    );
    const documentId = result.insertId;
    // Insertar targets (roles)
    if (roles) {
      const rolesArr = Array.isArray(roles) ? roles : JSON.parse(roles);
      for (const role of rolesArr) {
        await connection.execute(
          `INSERT INTO document_targets (document_id, target_type, target_value) VALUES (?, 'role', ?)`,
          [documentId, role]
        );
      }
    }
    // Insertar targets (usuarios)
    if (users) {
      const usersArr = Array.isArray(users) ? users : JSON.parse(users);
      for (const userId of usersArr) {
        await connection.execute(
          `INSERT INTO document_targets (document_id, target_type, target_value) VALUES (?, 'user', ?)`,
          [documentId, String(userId)]
        );
      }
    }
    await connection.end();
    res.json({ success: true, message: 'Documento subido exitosamente.' });
  } catch (error) {
    console.error('Error subiendo documento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// Endpoint para listar documentos según permisos
app.get('/api/documents', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // Obtener rol y user_id
    const [userRows] = await connection.execute('SELECT id, rol FROM usuarios WHERE id = ?', [req.user.id]);
    if (userRows.length === 0) return res.json({ success: true, documents: [] });
    const userId = String(userRows[0].id);
    const userRole = userRows[0].rol;
    // Si es Admin, mostrar todos los documentos
    if (userRole === 'Admin') {
      const [allDocs] = await connection.execute('SELECT * FROM documents ORDER BY created_at DESC');
      await connection.end();
      return res.json({ success: true, documents: allDocs });
    }
    // Documentos globales
    const [globalDocs] = await connection.execute(
      'SELECT * FROM documents WHERE is_global = 1 ORDER BY created_at DESC'
    );
    // Documentos por rol
    const [roleDocs] = await connection.execute(
      `SELECT d.* FROM documents d
       JOIN document_targets t ON d.id = t.document_id
       WHERE t.target_type = 'role' AND t.target_value = ?
       ORDER BY d.created_at DESC`,
      [userRole]
    );
    // Documentos por usuario
    const [userDocs] = await connection.execute(
      `SELECT d.* FROM documents d
       JOIN document_targets t ON d.id = t.document_id
       WHERE t.target_type = 'user' AND t.target_value = ?
       ORDER BY d.created_at DESC`,
      [userId]
    );
    // Unir y eliminar duplicados
    const allDocs = [...globalDocs, ...roleDocs, ...userDocs];
    const uniqueDocs = Array.from(new Map(allDocs.map(doc => [doc.id, doc])).values());
    await connection.end();
    res.json({ success: true, documents: uniqueDocs });
  } catch (error) {
    console.error('Error listando documentos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// Endpoint para obtener destinatarios de un documento
app.get('/api/documents/:id/targets', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const docId = req.params.id;
    const [targets] = await connection.execute(
      'SELECT target_type, target_value FROM document_targets WHERE document_id = ?',
      [docId]
    );
    const roles = targets.filter(t => t.target_type === 'role').map(t => t.target_value);
    const users = targets.filter(t => t.target_type === 'user').map(t => t.target_value);
    await connection.end();
    res.json({ success: true, roles, users });
  } catch (error) {
    console.error('Error obteniendo destinatarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

// Configuración de la base de datos
const dbConfig = {
  host: 'caboose.proxy.rlwy.net',
  port: 46666,
  user: 'root',
  password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
  database: 'railway'
};



// === RUTAS DE PREFERENCIAS DE USUARIO ===
// Obtener preferencias del usuario
app.get('/api/user-preferences', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT theme, color_scheme, font_size, font_family, spacing, animations, background_type, background_image IS NOT NULL AS has_background_image, background_color FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    await connection.end();

    if (rows.length === 0) {
      // Si no hay preferencias, crear las por defecto
      const defaultPreferences = {
        theme: 'dark',
        color_scheme: 'default',
        font_size: 'medium',
        font_family: 'inter',
        spacing: 'normal',
        animations: 'enabled',
        background_type: 'color',
        has_background_image: false,
        background_color: 'default'
      };

      // Crear preferencias por defecto
      const insertConnection = await mysql.createConnection(dbConfig);
      await insertConnection.execute(
        `INSERT INTO user_preferences (user_id, theme, color_scheme, font_size, font_family, spacing, animations, background_type, background_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, defaultPreferences.theme, defaultPreferences.color_scheme, defaultPreferences.font_size, 
         defaultPreferences.font_family, defaultPreferences.spacing, defaultPreferences.animations, 
         defaultPreferences.background_type, defaultPreferences.background_color]
      );
      await insertConnection.end();

      return res.json({ success: true, preferences: defaultPreferences });
    }

    res.json({ success: true, preferences: rows[0] });

  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Actualizar preferencias del usuario
app.put('/api/user-preferences', verifyToken, async (req, res) => {
  try {
    const { 
      theme, 
      color_scheme, 
      font_size, 
      font_family, 
      spacing, 
      animations, 
      background_type, 
      background_color 
    } = req.body;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar si el usuario ya tiene preferencias
    const [existing] = await connection.execute(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    if (existing.length > 0) {
      // Actualizar preferencias existentes
      await connection.execute(
        `UPDATE user_preferences 
         SET theme = ?, color_scheme = ?, font_size = ?, font_family = ?, spacing = ?, animations = ?,
             background_type = ?, background_color = ?
         WHERE user_id = ?`,
        [theme, color_scheme, font_size, font_family, spacing, animations, 
         background_type, background_color, req.user.id]
      );
    } else {
      // Crear nuevas preferencias
      await connection.execute(
        `INSERT INTO user_preferences (user_id, theme, color_scheme, font_size, font_family, spacing, animations, background_type, background_color)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.user.id, theme, color_scheme, font_size, font_family, spacing, animations, 
         background_type, background_color]
      );
    }

    await connection.end();

    res.json({ 
      success: true,
      message: 'Preferencias actualizadas exitosamente',
      preferences: { 
        theme, 
        color_scheme, 
        font_size, 
        font_family, 
        spacing, 
        animations, 
        background_type, 
        background_color 
      }
    });

  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Resetear preferencias a valores por defecto
app.post('/api/user-preferences/reset', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      `UPDATE user_preferences 
       SET theme = 'dark', color_scheme = 'default', font_size = 'medium', 
           font_family = 'inter', spacing = 'normal', animations = 'enabled',
           background_type = 'color', background_image = NULL, background_color = 'default'
       WHERE user_id = ?`,
      [req.user.id]
    );

    await connection.end();

    res.json({ 
      success: true,
      message: 'Preferencias reseteadas a valores por defecto',
      preferences: {
        theme: 'dark',
        color_scheme: 'default',
        font_size: 'medium',
        font_family: 'inter',
        spacing: 'normal',
        animations: 'enabled',
        background_type: 'color',
        background_image: null,
        background_color: 'default'
      }
    });

  } catch (error) {
    console.error('Error reseteando preferencias:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Endpoint para subir imagen de fondo
app.put('/api/user-preferences/background-image', verifyToken, updateBackgroundImage);
// Endpoint para obtener imagen de fondo
app.get('/api/user-preferences/background-image', verifyToken, getBackgroundImage);

// === RUTAS DE NOTIFICACIONES ===
// Obtener notificaciones del usuario autenticado
app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    await connection.end();
    res.json({ success: true, notifications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener notificaciones' });
  }
});

// Marcar notificación como leída
app.post('/api/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
    await connection.end();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al marcar como leída' });
  }
});

// Obtener cantidad de no leídas
app.get('/api/notifications/unread/count', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    await connection.end();
    res.json({ success: true, count: rows[0]?.count || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al contar no leídas' });
  }
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend funcionando correctamente' });
});

// Ruta de login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Conectar a la base de datos
    const connection = await mysql.createConnection(dbConfig);

    // Buscar usuario por email
    const [users] = await connection.execute(
      'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
      [email]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    const user = users[0];

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(403).json({
        success: false,
        message: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Crear token con id, email, rol y nombre
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Quitar contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});


// Ruta de registro
app.post('/api/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Conectar a la base de datos
    const connection = await mysql.createConnection(dbConfig);

    // Verificar si el email ya existe
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario (activo por defecto)
    const [result] = await connection.execute(
      'INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol, true]
    );

    await connection.end();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// NUEVAS RUTAS PARA GESTIÓN DE USUARIOS

// Obtener todos los usuarios
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Obtener todos los usuarios sin las contraseñas
    const [users] = await connection.execute(
      `SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY nombre`
    );


    await connection.end();

    res.json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar usuario
app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y rol son requeridos'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Verificar si el email ya existe en otro usuario
    const [existingUser] = await connection.execute(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingUser.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        message: 'El email ya está siendo usado por otro usuario'
      });
    }

    // Actualizar usuario
    const [result] = await connection.execute(
      'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
      [nombre, email, rol, activo, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Cambiar contraseña de usuario
app.put('/api/users/:id/reset-password', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validar longitud de contraseña
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    const [result] = await connection.execute(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Cambiar estado del usuario (activar/desactivar)
app.put('/api/users/:id/toggle-status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const connection = await mysql.createConnection(dbConfig);

    // Actualizar estado del usuario
    const [result] = await connection.execute(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo, id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener perfil de usuario
app.get('/api/profile/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      'SELECT id, nombre, email, rol, activo FROM usuarios WHERE id = ?',
      [id]
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// server.js (continuación - agregar rutas de cursos y evaluaciones)

// RUTA: Crear curso con evaluación
app.post('/api/courses', verifyToken, upload.single('videoFile'), async (req, res) => {
  try {
    const { title, description, videoUrl, role, attempts = 1, timeLimit = 30 } = req.body;
    let finalVideoUrl = videoUrl;

    // Si se subió un archivo, usa su ruta
    if (req.file) {
      finalVideoUrl = `/uploads/videos/${req.file.filename}`;
    }

    // Procesar evaluation como JSON
    let evaluation = [];
    try {
      evaluation = req.body.evaluation ? JSON.parse(req.body.evaluation) : [];
    } catch (err) {
      return res.status(400).json({ success: false, message: 'Error al procesar las preguntas de evaluación.' });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Insertar curso
    const [result] = await connection.execute(
      `INSERT INTO courses (title, description, video_url, role, attempts, time_limit) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, finalVideoUrl, role, attempts, timeLimit]
    );

    const courseId = result.insertId;

    // Insertar preguntas si existen
    for (const q of evaluation) {
      const { question, options, correctIndex } = q;
      if (!question || !options || options.length !== 4 || correctIndex < 0 || correctIndex > 3) continue;

      await connection.execute(
        `INSERT INTO questions (course_id, question, option_1, option_2, option_3, option_4, correct_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [courseId, question, options[0], options[1], options[2], options[3], correctIndex]
      );
    }

    // === NOTIFICAR A USUARIOS DEL ROL ===
    const [usersToNotify] = await connection.execute(
      'SELECT id FROM usuarios WHERE rol = ? AND activo = 1',
      [role]
    );
    for (const user of usersToNotify) {
      await connection.execute(
        'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, ?, ?)',
        [user.id, `Se ha creado un nuevo curso: ${title}`, 'curso_nuevo', JSON.stringify({ courseId })]
      );
    }

    await connection.end();

    res.status(201).json({ success: true, message: 'Curso creado exitosamente', courseId });
  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear curso' });
  }
});

// RUTA: Obtener cursos (puede filtrar por rol opcionalmente)
app.get('/api/courses', verifyToken, async (req, res) => {
  try {
    const { rol } = req.query;
    const connection = await mysql.createConnection(dbConfig);

    const [courses] = rol
      ? await connection.execute(`SELECT * FROM courses WHERE role = ?`, [rol])
      : await connection.execute(`SELECT * FROM courses`);

    // Agrega las preguntas para cada curso
    const formattedCourses = await Promise.all(courses.map(async (course) => {
      const [questions] = await connection.execute(
        `SELECT id, question, option_1, option_2, option_3, option_4, correct_index FROM questions WHERE course_id = ?`,
        [course.id]
      );

      const evaluation = questions.map(q => ({
        id: q.id,
        question: q.question,
        options: [q.option_1, q.option_2, q.option_3, q.option_4],
        correctIndex: q.correct_index
      }));

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        videoUrl: course.video_url,
        role: course.role,
        attempts: course.attempts,
        timeLimit: course.time_limit,
        evaluation
      };
    }));

    await connection.end();

    res.json({ success: true, courses: formattedCourses });
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// RUTA: Obtener preguntas de evaluación por curso
app.get('/api/courses/:id/questions', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [questions] = await connection.execute(
      `SELECT id, question, option_1, option_2, option_3, option_4, correct_index FROM questions WHERE course_id = ?`,
      [id]
    );

    await connection.end();

    const formatted = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: [q.option_1, q.option_2, q.option_3, q.option_4],
      correctIndex: q.correct_index
    }));

    res.json({ success: true, questions: formatted });
  } catch (error) {
    console.error('Error al obtener preguntas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// RUTA: Eliminar un curso
app.delete('/api/courses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    // Eliminar preguntas relacionadas (si hay)
    await connection.execute(`DELETE FROM questions WHERE course_id = ?`, [id]);

    // Eliminar el curso
    const [result] = await connection.execute(`DELETE FROM courses WHERE id = ?`, [id]);

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    res.json({ success: true, message: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// RUTA: Editar curso existente (ACTUALIZADA)
app.put('/api/courses/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, role, evaluation = [], attempts, timeLimit } = req.body;

    if (!title || !description || !videoUrl || !role) {
      return res.status(400).json({ success: false, message: 'Todos los campos del curso son requeridos' });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Actualizar curso
    const [updateResult] = await connection.execute(
      `UPDATE courses SET title = ?, description = ?, video_url = ?, role = ?, attempts = ?, time_limit = ? WHERE id = ?`,
      [title, description, videoUrl, role, attempts, timeLimit, id]
    );

    if (updateResult.affectedRows === 0) {
      await connection.end();
      return res.status(404).json({ success: false, message: 'Curso no encontrado para actualizar' });
    }

    // Eliminar preguntas anteriores
    await connection.execute(`DELETE FROM questions WHERE course_id = ?`, [id]);

    // Insertar nuevas preguntas
    for (const q of evaluation) {
      const { question, options, correctIndex } = q;
      if (!question || options.length !== 4 || correctIndex < 0 || correctIndex > 3) continue;

      await connection.execute(
        `INSERT INTO questions (course_id, question, option_1, option_2, option_3, option_4, correct_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, question, options[0], options[1], options[2], options[3], correctIndex]
      );
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
      updatedCourseId: id
    });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Nueva ruta: Guardar progreso del curso
app.post('/api/progress', verifyToken, async (req, res) => {
  const { courseId, videoCompleted, score, total, status, attemptsUsed } = req.body;
  const userId = req.user.id;

  if (!courseId) {
    return res.status(400).json({ success: false, message: 'Falta el ID del curso' });
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    // Verificar si ya existe progreso previo
    const [existing] = await connection.execute(
      'SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    if (existing.length > 0) {
      // Actualizar progreso
      await connection.execute(
        `UPDATE course_progress SET 
          video_completed = ?,
          evaluation_score = ?,
          evaluation_total = ?,
          evaluation_status = ?,
          attempts_used = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND course_id = ?`,
        [videoCompleted, score, total, status, attemptsUsed, userId, courseId]
      );
    } else {
      // Crear nuevo progreso
      await connection.execute(
        `INSERT INTO course_progress 
          (user_id, course_id, video_completed, evaluation_score, evaluation_total, evaluation_status, attempts_used)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, courseId, videoCompleted, score, total, status, attemptsUsed]
      );
    }

    // Log para depuración
    console.log('✅ Progreso guardado correctamente para usuario:', userId, 'curso:', courseId);

    // === NOTIFICAR AL ADMIN SI SE COMPLETA ===
    if (videoCompleted || status === 'aprobado' || status === 'reprobado') {
      const [admins] = await connection.execute(
        "SELECT id FROM usuarios WHERE rol = 'Admin' AND activo = 1"
      );
      const [[userRow]] = await connection.execute('SELECT nombre FROM usuarios WHERE id = ?', [userId]);
      const [[courseRow]] = await connection.execute('SELECT title FROM courses WHERE id = ?', [courseId]);
      for (const admin of admins) {
        // Verificar si ya existe una notificación igual para este admin, usuario y curso
        const [existingNotif] = await connection.execute(
          'SELECT id FROM notifications WHERE user_id = ? AND type = ? AND JSON_EXTRACT(data, "$ .userId") = ? AND JSON_EXTRACT(data, "$ .courseId") = ?',
          [admin.id, 'curso_completado', userId, courseId]
        );
        if (existingNotif.length === 0) {
          await connection.execute(
            'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, ?, ?)',
            [admin.id, `El usuario ${userRow.nombre} ha completado o actualizado el curso: ${courseRow.title}`, 'curso_completado', JSON.stringify({ userId, courseId })]
          );
        }
      }
    }

    // Intentar cerrar conexión sin romper todo si falla
    try {
      await connection.end();
    } catch (endError) {
      console.warn('⚠️ Error al cerrar conexión:', endError.message);
    }

    // Intentar enviar la respuesta JSON
    try {
      return res.json({ success: true, message: 'Progreso guardado correctamente' });
    } catch (jsonErr) {
      console.error('❌ Error al enviar JSON:', jsonErr.message);
      return res.status(500).send('Error al enviar respuesta');
    }

  } catch (error) {
    console.error('❌ Error en /api/progress:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (endErr) {
        console.warn('⚠️ Error al cerrar conexión tras fallo:', endErr.message);
      }
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener progreso del usuario autenticado
app.get('/api/progress', verifyToken, async (req, res) => {
  const userId = req.user.id;
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT 
        cp.course_id,
        cp.video_completed,
        cp.evaluation_score,
        cp.evaluation_total,
        cp.evaluation_status,
        cp.attempts_used,
        cp.updated_at,
        c.title AS course_title
      FROM course_progress cp
      JOIN courses c ON cp.course_id = c.id
      WHERE cp.user_id = ?`,
      [userId]
    );

    console.log("📊 Datos de progreso del usuario:", rows); // LOG PARA CONSOLA

    await connection.end();
    return res.json({ success: true, progress: rows });
  } catch (error) {
    console.error("❌ Error al obtener progreso:", error);
    if (connection) await connection.end();
    return res.status(500).json({ success: false, message: "Error al obtener progreso" });
  }
});

// Obtener progreso de todos los usuarios (solo para administradores)
app.get('/api/progress/all', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const userRol = req.user.rol;
  let connection;

  if (userRol !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado. Solo administradores.' });
  }

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT 
         u.nombre AS nombre,
         c.title AS curso,
         cp.course_id,
         cp.video_completed,
         cp.evaluation_score,
         cp.evaluation_total,
         cp.evaluation_status,
         cp.attempts_used,
         cp.updated_at
       FROM course_progress cp
       JOIN usuarios u ON cp.user_id = u.id
       JOIN courses c ON cp.course_id = c.id
       ORDER BY cp.updated_at DESC`
    );

    console.log("📊 Progreso general obtenido:", rows.length, "registros");

    await connection.end();
    // Si no hay registros, devolver un array vacío (no 404)
    return res.json({ success: true, progress: rows });

  } catch (error) {
    console.error("❌ Error en /api/progress/all:", error);
    if (connection) await connection.end();
    return res.status(500).json({ success: false, message: "Error al obtener el progreso general." });
  }
});


// Ruta para obtener progreso de un curso específico
app.get('/api/progress/:courseId', verifyToken, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);

    const [progress] = await connection.execute(
      `SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?`,
      [userId, courseId]
    );

    await connection.end();

    if (progress.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay progreso registrado para este curso.' });
    }

    return res.json({ success: true, progress: progress[0] });

  } catch (error) {
    console.error('❌ Error en /api/progress/:courseId:', error.message);
    if (connection) await connection.end();
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});


// 📋 RUTAS DE BITÁCORA

app.get('/api/bitacora', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT id, titulo, descripcion, estado, asignados, deadline, created_at, updated_at 
      FROM bitacora_global 
      ORDER BY created_at DESC
    `);
    await connection.end();

    res.json({ success: true, tareas: rows || [] });
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Crear tarea (una por usuario asignado)
app.post('/api/bitacora', verifyToken, async (req, res) => {
  const { rol } = req.user;
  const { titulo, descripcion, estado, asignados, deadline } = req.body;

  if (rol !== 'Admin') {
    return res.status(403).json({ success: false, message: 'Solo los administradores pueden crear tareas' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    for (const userId of asignados) {
      await connection.execute(`
        INSERT INTO bitacora_global (titulo, descripcion, estado, asignados, deadline)
        VALUES (?, ?, ?, ?, ?)
      `, [
        titulo,
        descripcion,
        estado || 'rojo',
        JSON.stringify([userId]),
        deadline
      ]);
      // Notificar al usuario asignado
      await connection.execute(
        'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, ?, ?)',
        [userId, `Tienes una nueva tarea: ${titulo}`, 'tarea_nueva', JSON.stringify({ titulo, descripcion, deadline })]
      );
    }

    await connection.end();
    res.json({ success: true, message: 'Tareas creadas para cada usuario asignado' });
  } catch (error) {
    console.error('❌ Error creando tareas:', error);
    res.status(500).json({ success: false, message: 'Error interno al crear tarea' });
  }
});

// Editar tarea (admin: todo, usuario: solo estado si está asignado)
app.put('/api/bitacora/:id', verifyToken, async (req, res) => {
  const { rol, id: userId } = req.user;
  const tareaId = req.params.id;
  const { titulo, descripcion, estado, asignados, deadline } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`SELECT * FROM bitacora_global WHERE id = ?`, [tareaId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Tarea no encontrada' });

    const tarea = rows[0];
    const yaVenció = new Date(tarea.deadline) < new Date();

    if (rol === 'Admin') {
      await connection.execute(`
        UPDATE bitacora_global 
        SET titulo = ?, descripcion = ?, estado = ?, asignados = ?, deadline = ?, updated_at = NOW()
        WHERE id = ?
      `, [titulo, descripcion, estado, JSON.stringify(asignados), deadline, tareaId]);
    } else {
      const asignadosArr = JSON.parse(tarea.asignados || "[]");
      if (!asignadosArr.includes(userId)) {
        await connection.end();
        return res.status(403).json({ success: false, message: 'No tienes permisos para editar esta tarea' });
      }
      if (yaVenció) {
        await connection.end();
        return res.status(400).json({ success: false, message: 'La tarea ha vencido y no puede ser modificada' });
      }

      await connection.execute(`
        UPDATE bitacora_global SET estado = ?, updated_at = NOW() WHERE id = ?
      `, [estado, tareaId]);
    }
    // Si la tarea se marca como completa, notificar a los admins
    if (estado === 'verde') {
      const [admins] = await connection.execute("SELECT id FROM usuarios WHERE rol = 'Admin' AND activo = 1");
      const [[userRow]] = await connection.execute('SELECT nombre FROM usuarios WHERE id = ?', [userId]);
      for (const admin of admins) {
        await connection.execute(
          'INSERT INTO notifications (user_id, message, type, data) VALUES (?, ?, ?, ?)',
          [admin.id, `El usuario ${userRow.nombre} ha marcado como completada la tarea: ${tarea.titulo}`, 'tarea_completada', JSON.stringify({ tareaId })]
        );
      }
    }

    await connection.end();
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error actualizando tarea:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener usuarios (para mostrar nombres)
app.get('/api/usuarios', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, nombre FROM usuarios');
    await connection.end();
    res.json({ success: true, usuarios: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
  }
});


app.delete('/api/bitacora/:id', verifyToken, async (req, res) => {
  const { rol } = req.user;
  if (rol !== 'Admin') return res.status(403).json({ success: false, message: 'Solo Admin puede eliminar' });

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(`DELETE FROM bitacora_global WHERE id = ?`, [req.params.id]);
    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Tarea no encontrada' });
    }

    res.json({ success: true, message: 'Tarea eliminada' });
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


// Exportar para uso
export default app;
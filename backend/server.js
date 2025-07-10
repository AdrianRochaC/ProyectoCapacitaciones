// server.js - Backend con Login, Registro y Gestión de Usuarios
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'tu_clave_secreta_jwt'; // En producción usar variable de entorno

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const dbConfig = {
  host: 'caboose.proxy.rlwy.net',
  port: 46666,
  user: 'root',
  password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
  database: 'railway'
};

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
app.post('/api/courses', verifyToken, async (req, res) => {
  try {
    const { title, description, videoUrl, role, evaluation = [], attempts = 1, timeLimit = 30 } = req.body;

    if (!title || !description || !videoUrl || !role) {
      return res.status(400).json({ success: false, message: 'Todos los campos del curso son requeridos' });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Insertar curso
    const [result] = await connection.execute(
      `INSERT INTO courses (title, description, video_url, role, attempts, time_limit) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, videoUrl, role, attempts, timeLimit]
    );

    const courseId = result.insertId;

    // Insertar preguntas si existen
    for (const q of evaluation) {
      const { question, options, correctIndex } = q;
      if (!question || options.length !== 4 || correctIndex < 0 || correctIndex > 3) continue;

      await connection.execute(
        `INSERT INTO questions (course_id, question, option_1, option_2, option_3, option_4, correct_index)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [courseId, question, options[0], options[1], options[2], options[3], correctIndex]
      );
    }

    await connection.end();

    res.status(201).json({ success: true, message: 'Curso creado exitosamente', courseId });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
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


// Nueva ruta: Obtener progreso del usuario por curso
app.get('/api/progress/:courseId', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT * FROM course_progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.json({ success: true, progress: null });
    }

    res.json({ success: true, progress: rows[0] });
  } catch (error) {
    console.error('Error al obtener progreso:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener progreso de todos los usuarios (solo para admin)
app.get('/api/progress/all', verifyToken, async (req, res) => {
  const { rol } = req.user;
  if (rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso no autorizado' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT 
        u.id as userId, u.nombre, u.email, u.rol,
        c.title as curso,
        cp.video_completed, cp.evaluation_score, cp.evaluation_total, cp.evaluation_status, cp.attempts_used
      FROM course_progress cp
      JOIN usuarios u ON cp.user_id = u.id
      JOIN courses c ON cp.course_id = c.id
      WHERE u.rol != 'admin'
      ORDER BY u.nombre, c.title
    `);

    await connection.end();
    
    // Protección contra `null`
    res.json({ success: true, progress: Array.isArray(rows) ? rows : [] });

  } catch (error) {
    console.error('Error al obtener progreso de todos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Agregar estas rutas a tu server.js después de las rutas existentes

// 📋 RUTAS DE BITÁCORA

// Obtener todas las tareas de la bitácora
app.get('/api/bitacora', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT id, titulo, descripcion, estado, created_at, updated_at 
      FROM bitacora_global 
      ORDER BY created_at DESC
    `);

    await connection.end();
    
    res.json({ 
      success: true, 
      tareas: Array.isArray(rows) ? rows : [] 
    });

  } catch (error) {
    console.error('Error al obtener tareas de bitácora:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Crear nueva tarea (solo Admin con mayúscula)
app.post('/api/bitacora', verifyToken, async (req, res) => {
  const { rol } = req.user;
  
  // Verificar que el rol sea exactamente 'Admin' (con mayúscula)
  if (rol !== 'Admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo los administradores pueden crear tareas' 
    });
  }

  const { titulo, descripcion, estado } = req.body;

  // Validaciones
  if (!titulo || !descripcion) {
    return res.status(400).json({ 
      success: false, 
      message: 'Título y descripción son requeridos' 
    });
  }

  if (!['rojo', 'amarillo', 'verde'].includes(estado)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Estado inválido' 
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(`
      INSERT INTO bitacora_global (titulo, descripcion, estado, created_at, updated_at) 
      VALUES (?, ?, ?, NOW(), NOW())
    `, [titulo, descripcion, estado]);

    await connection.end();

    res.json({ 
      success: true, 
      message: 'Tarea creada exitosamente',
      id: result.insertId 
    });

  } catch (error) {
    console.error('Error al crear tarea:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Actualizar tarea (solo Admin con mayúscula)
app.put('/api/bitacora/:id', verifyToken, async (req, res) => {
  const { rol } = req.user;
  
  // Verificar que el rol sea exactamente 'Admin' (con mayúscula)
  if (rol !== 'Admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo los administradores pueden actualizar tareas' 
    });
  }

  const { id } = req.params;
  const { titulo, descripcion, estado } = req.body;

  // Validaciones
  if (!titulo || !descripcion) {
    return res.status(400).json({ 
      success: false, 
      message: 'Título y descripción son requeridos' 
    });
  }

  if (!['rojo', 'amarillo', 'verde'].includes(estado)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Estado inválido' 
    });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Verificar si la tarea existe
    const [existing] = await connection.execute(`
      SELECT id FROM bitacora_global WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Tarea no encontrada' 
      });
    }

    // Actualizar la tarea
    await connection.execute(`
      UPDATE bitacora_global 
      SET titulo = ?, descripcion = ?, estado = ?, updated_at = NOW() 
      WHERE id = ?
    `, [titulo, descripcion, estado, id]);

    await connection.end();

    res.json({ 
      success: true, 
      message: 'Tarea actualizada exitosamente' 
    });

  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Eliminar tarea (solo Admin con mayúscula)
app.delete('/api/bitacora/:id', verifyToken, async (req, res) => {
  const { rol } = req.user;
  
  // Verificar que el rol sea exactamente 'Admin' (con mayúscula)
  if (rol !== 'Admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo los administradores pueden eliminar tareas' 
    });
  }

  const { id } = req.params;

  try {
    const connection = await mysql.createConnection(dbConfig);

    // Verificar si la tarea existe
    const [existing] = await connection.execute(`
      SELECT id FROM bitacora_global WHERE id = ?
    `, [id]);

    if (existing.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        success: false, 
        message: 'Tarea no encontrada' 
      });
    }

    // Eliminar la tarea
    await connection.execute(`
      DELETE FROM bitacora_global WHERE id = ?
    `, [id]);

    await connection.end();

    res.json({ 
      success: true, 
      message: 'Tarea eliminada exitosamente' 
    });

  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Obtener estadísticas de la bitácora
app.get('/api/bitacora/stats', verifyToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'rojo' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'amarillo' THEN 1 ELSE 0 END) as en_progreso,
        SUM(CASE WHEN estado = 'verde' THEN 1 ELSE 0 END) as completadas
      FROM bitacora_global
    `);

    await connection.end();

    res.json({ 
      success: true, 
      stats: stats[0] || { total: 0, pendientes: 0, en_progreso: 0, completadas: 0 }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// Ruta adicional para verificar permisos de usuario
app.get('/api/bitacora/permisos', verifyToken, async (req, res) => {
  const { rol, nombre } = req.user;
  
  res.json({
    success: true,
    usuario: nombre,
    rol: rol,
    esAdmin: rol === 'Admin',
    permisos: {
      crear: rol === 'Admin',
      editar: rol === 'Admin',
      eliminar: rol === 'Admin',
      ver: true
    }
  });
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});


// Exportar para uso
export default app;
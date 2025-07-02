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
    
    if (users.length === 0) {
      await connection.end();
      return res.status(401).json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      });
    }
    
    const user = users[0];
    
    // Verificar si el usuario está activo
    if (!user.activo) {
      await connection.end();
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario desactivado' 
      });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      await connection.end();
      return res.status(401).json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      });
    }
    
    await connection.end();
    
    // Crear JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ 
      success: true, 
      message: 'Login exitoso',
      user: userWithoutPassword,
      token: token
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

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// Exportar para uso
export default app;
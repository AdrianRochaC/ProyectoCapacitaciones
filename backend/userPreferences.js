import mysql from 'mysql2/promise';
import multer from 'multer';
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Configuración de la base de datos
const dbConfig = {
  host: 'caboose.proxy.rlwy.net',
  port: 46666,
  user: 'root',
  password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
  database: 'railway'
};

// Obtener preferencias de un usuario (ahora incluye has_background_image)
const getUserPreferences = async (req, res) => {
  const userId = req.user.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT theme, color_scheme, font_size, font_family, spacing, animations, background_type, background_image, background_color FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    await connection.end();
    if (rows.length === 0) {
      const defaultPreferences = {
        theme: 'dark', color_scheme: 'default', font_size: 'medium', font_family: 'inter', spacing: 'normal', animations: 'enabled', background_type: 'color', background_color: 'default', has_background_image: false
      };
      await createUserPreferences(userId, defaultPreferences);
      return res.json(defaultPreferences);
    }
    const prefs = rows[0];
    res.json({ ...prefs, has_background_image: !!prefs.background_image });
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar preferencias de un usuario
const updateUserPreferences = async (req, res) => {
  const userId = req.user.id;
  const { theme, color_scheme, font_size, font_family, spacing, animations } = req.body;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Verificar si el usuario ya tiene preferencias
    const [existing] = await connection.execute(
      'SELECT id FROM user_preferences WHERE user_id = ?',
      [userId]
    );

    if (existing.length > 0) {
      // Actualizar preferencias existentes
      await connection.execute(
        `UPDATE user_preferences 
         SET theme = ?, color_scheme = ?, font_size = ?, font_family = ?, spacing = ?, animations = ?
         WHERE user_id = ?`,
        [theme, color_scheme, font_size, font_family, spacing, animations, userId]
      );
    } else {
      // Crear nuevas preferencias
      await connection.execute(
        `INSERT INTO user_preferences (user_id, theme, color_scheme, font_size, font_family, spacing, animations)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, theme, color_scheme, font_size, font_family, spacing, animations]
      );
    }

    await connection.end();

    res.json({ 
      message: 'Preferencias actualizadas exitosamente',
      preferences: { theme, color_scheme, font_size, font_family, spacing, animations }
    });

  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Nuevo endpoint: subir imagen de fondo
const updateBackgroundImage = [uploadMemory.single('background_image'), async (req, res) => {
  const userId = req.user.id;
  if (!req.file) return res.status(400).json({ error: 'No se envió ninguna imagen.' });
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE user_preferences SET background_image = ?, background_type = ? WHERE user_id = ?',
      [req.file.buffer, 'image', userId]
    );
    await connection.end();
    res.json({ message: 'Imagen de fondo actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando imagen de fondo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}];

// Nuevo endpoint: servir imagen de fondo
const getBackgroundImage = async (req, res) => {
  const userId = req.user.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT background_image FROM user_preferences WHERE user_id = ?',
      [userId]
    );
    await connection.end();
    if (rows.length === 0 || !rows[0].background_image) {
      return res.status(404).send('No hay imagen de fondo');
    }
    res.set('Content-Type', 'image/jpeg'); // O detecta el tipo real si lo necesitas
    res.send(rows[0].background_image);
  } catch (error) {
    console.error('Error obteniendo imagen de fondo:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// Crear preferencias por defecto para un usuario
const createUserPreferences = async (userId, preferences = null) => {
  const defaultPreferences = preferences || {
    theme: 'dark',
    color_scheme: 'default',
    font_size: 'medium',
    font_family: 'inter',
    spacing: 'normal',
    animations: 'enabled'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      `INSERT INTO user_preferences (user_id, theme, color_scheme, font_size, font_family, spacing, animations)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, defaultPreferences.theme, defaultPreferences.color_scheme, defaultPreferences.font_size, 
       defaultPreferences.font_family, defaultPreferences.spacing, defaultPreferences.animations]
    );

    await connection.end();
    return defaultPreferences;

  } catch (error) {
    console.error('Error creando preferencias por defecto:', error);
    throw error;
  }
};

// Resetear preferencias a valores por defecto
const resetUserPreferences = async (req, res) => {
  const userId = req.user.id;

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute(
      `UPDATE user_preferences 
       SET theme = 'dark', color_scheme = 'default', font_size = 'medium', 
           font_family = 'inter', spacing = 'normal', animations = 'enabled'
       WHERE user_id = ?`,
      [userId]
    );

    await connection.end();

    res.json({ 
      message: 'Preferencias reseteadas a valores por defecto',
      preferences: {
        theme: 'dark',
        color_scheme: 'default',
        font_size: 'medium',
        font_family: 'inter',
        spacing: 'normal',
        animations: 'enabled'
      }
    });

  } catch (error) {
    console.error('Error reseteando preferencias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export {
  getUserPreferences,
  updateUserPreferences,
  createUserPreferences,
  resetUserPreferences,
  updateBackgroundImage,
  getBackgroundImage
}; 
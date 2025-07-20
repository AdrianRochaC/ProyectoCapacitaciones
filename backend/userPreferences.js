const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'proyecto_capacitaciones'
};

// Obtener preferencias de un usuario
const getUserPreferences = async (req, res) => {
  const userId = req.user.id; // Asumiendo que tienes middleware de autenticación

  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT theme, color_scheme, font_size, font_family, spacing, animations FROM user_preferences WHERE user_id = ?',
      [userId]
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
        animations: 'enabled'
      };

      await createUserPreferences(userId, defaultPreferences);
      return res.json(defaultPreferences);
    }

    res.json(rows[0]);

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

module.exports = {
  getUserPreferences,
  updateUserPreferences,
  createUserPreferences,
  resetUserPreferences
}; 
const mysql = require('mysql2/promise');

const setupUserPreferences = async () => {
  const connection = await mysql.createConnection({
     host: 'trolley.proxy.rlwy.net',
     port: 17594,
     user: 'root',
     password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
     database: 'railway'
  });

  try {
    console.log('🔄 Configurando tabla de preferencias de usuario...');

    // Eliminar tabla existente si existe
    console.log('🗑️ Eliminando tabla existente...');
    await connection.execute('DROP TABLE IF EXISTS user_preferences');
    console.log('✅ Tabla anterior eliminada');

    // Crear nueva tabla de preferencias de usuario
    const createPreferencesTable = `
      CREATE TABLE user_preferences (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        theme VARCHAR(20) DEFAULT 'dark',
        color_scheme VARCHAR(20) DEFAULT 'default',
        font_size VARCHAR(20) DEFAULT 'medium',
        font_family VARCHAR(20) DEFAULT 'inter',
        spacing VARCHAR(20) DEFAULT 'normal',
        animations VARCHAR(20) DEFAULT 'enabled',
        background_type ENUM('color', 'image') DEFAULT 'color',
        background_image LONGBLOB NULL,
        background_color VARCHAR(20) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_preferences (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createPreferencesTable);
    console.log('✅ Nueva tabla user_preferences creada exitosamente');

    // Insertar preferencias por defecto para usuarios existentes
    const insertDefaultPreferences = `
      INSERT INTO user_preferences (user_id, theme, color_scheme, font_size, font_family, spacing, animations, background_type, background_color)
      SELECT id, 'dark', 'default', 'medium', 'inter', 'normal', 'enabled', 'color', 'default'
      FROM usuarios;
    `;

    await connection.execute(insertDefaultPreferences);
    console.log('✅ Preferencias por defecto insertadas para usuarios existentes');

    // Mostrar estadísticas
    const [preferencesCount] = await connection.execute('SELECT COUNT(*) as count FROM user_preferences');
    console.log(`📊 Total de preferencias configuradas: ${preferencesCount[0].count}`);

    // Mostrar estructura de la tabla
    const [tableStructure] = await connection.execute('DESCRIBE user_preferences');
    console.log('\n📋 Estructura de la tabla:');
    tableStructure.forEach(field => {
      console.log(`  - ${field.Field}: ${field.Type} ${field.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${field.Default ? `DEFAULT '${field.Default}'` : ''}`);
    });

    console.log('\n🎉 Configuración de preferencias de usuario completada');
    console.log('\n✨ Nuevas características:');
    console.log('  - Campo background_type: color o image');
    console.log('  - Campo background_image_url: URL de la imagen de fondo');
    console.log('  - Campo background_color: color de fondo por defecto');

  } catch (error) {
    console.error('❌ Error configurando preferencias de usuario:', error);
  } finally {
    await connection.end();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  setupUserPreferences();
}

module.exports = setupUserPreferences; 

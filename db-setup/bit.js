const mysql = require('mysql2/promise');

async function setupBitacoraGlobal() {
  const connection = await mysql.createConnection({
    host: 'caboose.proxy.rlwy.net',
    port: 46666,
    user: 'root',
    password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
    database: 'railway'
  });

  try {
    // 🔥 Eliminar ambas tablas si existen
    await connection.execute('DROP TABLE IF EXISTS bitacora_personal');
    await connection.execute('DROP TABLE IF EXISTS bitacora_global');
    console.log('🗑️ Tablas "bitacora_personal" y "bitacora_global" eliminadas (si existían).');

    // ✅ Crear tabla bitacora_global con updated_at incluido
    await connection.execute(`
      CREATE TABLE bitacora_global (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado ENUM('rojo', 'amarillo', 'verde') DEFAULT 'rojo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "bitacora_global" creada correctamente con updated_at.');

    // 🌱 Insertar datos de ejemplo para probar
    await connection.execute(`
      INSERT INTO bitacora_global (titulo, descripcion, estado) VALUES 
      ('Configurar servidor', 'Configurar el servidor de producción con todas las dependencias', 'rojo'),
      ('Revisar base de datos', 'Verificar que todas las tablas estén funcionando correctamente', 'amarillo'),
      ('Documentar API', 'Crear documentación completa de todos los endpoints', 'verde')
    `);
    console.log('✅ Datos de ejemplo insertados correctamente.');

  } catch (error) {
    console.error('❌ Error al crear la tabla "bitacora_global":', error.message);
  } finally {
    await connection.end();
  }
}

setupBitacoraGlobal();
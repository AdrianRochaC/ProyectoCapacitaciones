const mysql = require('mysql2/promise');

async function setupBitacoraGlobal() {
  const connection = await mysql.createConnection({
     host: 'trolley.proxy.rlwy.net',
     port: 17594,
     user: 'root',
     password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
     database: 'railway'
  });

  try {
    // 🔥 Eliminar ambas tablas si existen
    await connection.execute('DROP TABLE IF EXISTS bitacora_personal');
    await connection.execute('DROP TABLE IF EXISTS bitacora_global');
    console.log('🗑️ Tablas "bitacora_personal" y "bitacora_global" eliminadas (si existían).');

    // ✅ Crear tabla bitacora_global con asignados y deadline
    await connection.execute(`
      CREATE TABLE bitacora_global (
        id INT AUTO_INCREMENT PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado ENUM('rojo', 'amarillo', 'verde') DEFAULT 'rojo',
        asignados TEXT, -- IDs de usuarios asignados en formato JSON: [1,2,3]
        deadline DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "bitacora_global" creada correctamente con campos nuevos.');

    // 🌱 Insertar datos de ejemplo para probar
    await connection.execute(`
      INSERT INTO bitacora_global (titulo, descripcion, estado, asignados, deadline) VALUES 
      ('Configurar servidor', 'Configurar el servidor de producción con todas las dependencias', 'rojo', '[1,2]', CURDATE()),
      ('Revisar base de datos', 'Verificar que todas las tablas estén funcionando correctamente', 'amarillo', '[3]', DATE_ADD(CURDATE(), INTERVAL 3 DAY)),
      ('Documentar API', 'Crear documentación completa de todos los endpoints', 'verde', '[2,4]', DATE_ADD(CURDATE(), INTERVAL 7 DAY))
    `);
    console.log('✅ Datos de ejemplo insertados correctamente.');

  } catch (error) {
    console.error('❌ Error al crear la tabla "bitacora_global":', error.message);
  } finally {
    await connection.end();
  }
}

setupBitacoraGlobal();

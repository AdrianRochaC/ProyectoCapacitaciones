const mysql = require('mysql2/promise');

async function setupBitacoraTables() {
  const connection = await mysql.createConnection({
     host: 'trolley.proxy.rlwy.net',
     port: 17594,
     user: 'root',
     password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
     database: 'railway'
  });

  try {
    // 🔥 Eliminar tablas si ya existen
    await connection.execute('DROP TABLE IF EXISTS bitacora_personal');
    console.log('🗑️ Tabla "bitacora_personal" eliminada (si existía).');

    await connection.execute('DROP TABLE IF EXISTS bitacora_global');
    console.log('🗑️ Tabla "bitacora_global" eliminada (si existía).');

    // ✅ Crear tabla bitacora_global
    await connection.execute(`
      CREATE TABLE bitacora_global (
        id INT PRIMARY KEY AUTO_INCREMENT,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado ENUM('rojo', 'amarillo', 'verde') DEFAULT 'rojo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "bitacora_global" creada exitosamente.');

    // ✅ Crear tabla bitacora_personal
    await connection.execute(`
      CREATE TABLE bitacora_personal (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla "bitacora_personal" creada y relacionada con "usuarios".');

  } catch (error) {
    console.error('❌ Error al crear las tablas de bitácora:', error.message);
  } finally {
    await connection.end();
  }
}

setupBitacoraTables();

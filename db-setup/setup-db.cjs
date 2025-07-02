// setup-db.js
const mysql = require('mysql2/promise');

async function createTable() {
  const connection = await mysql.createConnection({
    host: 'caboose.proxy.rlwy.net',
    port: 46666,
    user: 'root',
    password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
    database: 'railway'
  });

  try {
    // 🔥 Eliminar la tabla si ya existe
    await connection.execute(`DROP TABLE IF EXISTS usuarios`);
    console.log('🗑️ Tabla "usuarios" eliminada (si existía).');

    // ✅ Crear tabla con campo "activo"
    await connection.execute(`
      CREATE TABLE usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "usuarios" creada exitosamente con campo "activo".');
  } catch (error) {
    console.error('❌ Error al crear la tabla:', error.message);
  } finally {
    await connection.end();
  }
}

createTable();

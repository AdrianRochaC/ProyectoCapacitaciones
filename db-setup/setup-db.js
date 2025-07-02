// setup-db.js
const mysql = require('mysql2/promise');

async function createTable() {
  const connection = await mysql.createConnection({
    host: 'caboose.proxy.rlwy.net',  // Solo el host, sin mysql://
    port: 46666,                    // El puerto correcto
    user: 'root',
    password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
    database: 'railway'
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios creada exitosamente.');
  } catch (error) {
    console.error('❌ Error al crear la tabla:', error.message);
  } finally {
    await connection.end();
  }
}

createTable();
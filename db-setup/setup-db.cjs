// setup-db.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // Asegúrate de instalar bcrypt: npm install bcrypt

async function createTable() {
  const connection = await mysql.createConnection({
    host: 'trolley.proxy.rlwy.net',
    port: 17594,
    user: 'root',
    password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
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

    // 🔐 Hashear la contraseña antes de insertarla
    const passwordHash = await bcrypt.hash('12345678', 10);

    // 👤 Insertar usuario admin
    await connection.execute(`
      INSERT INTO usuarios (nombre, email, password, rol)
      VALUES (?, ?, ?, ?)
    `, ['Ivan Valencia', 'ivan.valenciah@gmail.com', passwordHash, 'Admin']);

    console.log('👤 Usuario administrador insertado correctamente.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createTable();

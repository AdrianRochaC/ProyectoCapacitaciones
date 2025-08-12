const mysql = require('mysql2/promise');

async function setupNotificationsTable() {
  const connection = await mysql.createConnection({
     host: 'trolley.proxy.rlwy.net',
     port: 17594,
     user: 'root',
     password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
     database: 'railway'
  });

  try {
    // 🔥 Eliminar tabla si ya existe
    await connection.execute('DROP TABLE IF EXISTS notifications');
    console.log('🗑️ Tabla "notifications" eliminada (si existía).');

    // ✅ Crear tabla de notificaciones
    await connection.execute(`
      CREATE TABLE notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        data TEXT,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla "notifications" creada y relacionada con "usuarios".');
  } catch (error) {
    console.error('❌ Error al crear la tabla "notifications":', error.message);
  } finally {
    await connection.end();
  }
}

setupNotificationsTable();

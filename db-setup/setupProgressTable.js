const mysql = require('mysql2/promise');

async function setupProgressTable() {
  const connection = await mysql.createConnection({
    host: 'caboose.proxy.rlwy.net',
    port: 46666,
    user: 'root',
    password: 'ZcVJNaDrDEeLSQUNtTYAcKsLzpVgmNEe',
    database: 'railway'
  });

  try {
    // 🔥 Eliminar tabla si ya existe
    await connection.execute('DROP TABLE IF EXISTS course_progress');
    console.log('🗑️ Tabla "course_progress" eliminada (si existía).');

    // ✅ Crear nueva tabla
    await connection.execute(`
      CREATE TABLE course_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        video_completed BOOLEAN DEFAULT FALSE,
        evaluation_score INT,
        evaluation_total INT,
        evaluation_status ENUM('aprobado', 'reprobado', 'no realizado') DEFAULT 'no realizado',
        attempts_used INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla "course_progress" creada y relacionada con "usuarios" y "courses".');
  } catch (error) {
    console.error('❌ Error al crear la tabla "course_progress":', error.message);
  } finally {
    await connection.end();
  }
}

setupProgressTable();

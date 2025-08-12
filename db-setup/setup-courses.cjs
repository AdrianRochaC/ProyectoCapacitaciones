const mysql = require('mysql2/promise');

async function setupCoursesTables() {
  const connection = await mysql.createConnection({
     host: 'trolley.proxy.rlwy.net',
     port: 17594,
     user: 'root',
     password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
     database: 'railway'
  });

  try {
    // 🔥 Eliminar tablas si existen
    await connection.execute('DROP TABLE IF EXISTS questions');
    await connection.execute('DROP TABLE IF EXISTS courses');
    console.log('🗑️ Tablas "questions" y "courses" eliminadas.');

    // ✅ Crear tabla de cursos
    await connection.execute(`
      CREATE TABLE courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        video_url TEXT NOT NULL,
        role VARCHAR(50) NOT NULL,
        attempts INT DEFAULT 1,
        time_limit INT DEFAULT 30,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla "courses" creada.');

    // ✅ Crear tabla de preguntas
    await connection.execute(`
      CREATE TABLE questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        question TEXT NOT NULL,
        option_1 TEXT NOT NULL,
        option_2 TEXT NOT NULL,
        option_3 TEXT NOT NULL,
        option_4 TEXT NOT NULL,
        correct_index INT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabla "questions" creada y relacionada con "courses".');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

setupCoursesTables();

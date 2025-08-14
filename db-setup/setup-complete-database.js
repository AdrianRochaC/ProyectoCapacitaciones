const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { getConnection, executeQuery, closePool, checkConnectionHealth } = require('./connection-manager');

async function setupCompleteDatabase() {
  let connection = null;

  try {
    console.log('🚀 Iniciando configuración completa de la base de datos...\n');
    
    // Verificar conexión antes de comenzar
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy) {
      throw new Error('No se pudo establecer conexión con la base de datos');
    }
    
    connection = await getConnection();

    // ========================================
    // 1. ELIMINACIÓN DE TABLAS EXISTENTES
    // ========================================
    console.log('🗑️ 1. Eliminando tablas existentes...');
    
    // Primero eliminar tablas que dependen de usuarios
    await connection.execute('DROP TABLE IF EXISTS bitacora_personal');
    await connection.execute('DROP TABLE IF EXISTS bitacora_global');
    await connection.execute('DROP TABLE IF EXISTS course_progress');
    await connection.execute('DROP TABLE IF EXISTS notifications');
    await connection.execute('DROP TABLE IF EXISTS user_preferences');
    await connection.execute('DROP TABLE IF EXISTS document_targets');
    await connection.execute('DROP TABLE IF EXISTS documents');
    await connection.execute('DROP TABLE IF EXISTS questions');
    await connection.execute('DROP TABLE IF EXISTS courses');
    
    // Luego eliminar usuarios (que depende de cargos)
    await connection.execute('DROP TABLE IF EXISTS usuarios');
    
    // Finalmente eliminar cargos
    await connection.execute('DROP TABLE IF EXISTS cargos');
    
    console.log('✅ Todas las tablas existentes eliminadas');

    // ========================================
    // 2. TABLA DE CARGOS
    // ========================================
    console.log('\n📋 2. Configurando tabla de cargos...');
    
    await connection.execute(`
      CREATE TABLE cargos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "cargos" creada exitosamente');

    // Insertar cargos por defecto
    const cargosDefault = [
      { nombre: 'Admin', descripcion: 'Administrador del sistema' },
      { nombre: 'Gerente', descripcion: 'Gerente de departamento' },
      { nombre: 'Contabilidad', descripcion: 'Personal de contabilidad' },
      { nombre: 'Compras', descripcion: 'Personal de compras' },
      { nombre: 'Atención al Cliente', descripcion: 'Personal de atención al cliente' },
      { nombre: 'Operativo', descripcion: 'Personal operativo' }
    ];

    for (const cargo of cargosDefault) {
      await connection.execute(
        'INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)',
        [cargo.nombre, cargo.descripcion]
      );
    }
    console.log('✅ Cargos por defecto insertados');

    // ========================================
    // 3. TABLA DE USUARIOS
    // ========================================
    console.log('\n👥 3. Configurando tabla de usuarios...');
    
    await connection.execute(`
      CREATE TABLE usuarios (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL,
        cargo_id INT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cargo_id) REFERENCES cargos(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "usuarios" creada exitosamente');

    // Hashear contraseña y crear usuario admin
    const passwordHash = await bcrypt.hash('12345678', 10);
    await connection.execute(`
      INSERT INTO usuarios (nombre, email, password, rol, cargo_id)
      VALUES (?, ?, ?, ?, ?)
    `, ['Ivan Valencia', 'ivan.valenciah@gmail.com', passwordHash, 'Admin', 1]);
    console.log('✅ Usuario administrador creado');

    // ========================================
    // 4. TABLA DE CURSOS
    // ========================================
    console.log('\n📚 4. Configurando tabla de cursos...');
    
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "courses" creada');

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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "questions" creada');

    // ========================================
    // 5. TABLA DE PROGRESO
    // ========================================
    console.log('\n📊 5. Configurando tabla de progreso...');
    
    await connection.execute(`
      CREATE TABLE course_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        video_completed BOOLEAN NOT NULL DEFAULT FALSE,
        evaluation_score INT NULL,
        evaluation_total INT NULL,
        evaluation_status ENUM('aprobado', 'reprobado') NULL,
        attempts_used INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "course_progress" creada');

    // ========================================
    // 6. TABLA DE DOCUMENTOS
    // ========================================
    console.log('\n📄 6. Configurando tabla de documentos...');
    
    await connection.execute(`
      CREATE TABLE documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size INT NOT NULL,
        user_id INT NULL,
        is_global BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "documents" creada');

    await connection.execute(`
      CREATE TABLE document_targets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id INT NOT NULL,
        target_type ENUM('role', 'user') NOT NULL,
        target_value VARCHAR(64) NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "document_targets" creada');

    // ========================================
    // 7. TABLA DE PREFERENCIAS DE USUARIO
    // ========================================
    console.log('\n🎨 7. Configurando tabla de preferencias...');
    
    await connection.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "user_preferences" creada');

    // ========================================
    // 8. TABLA DE NOTIFICACIONES
    // ========================================
    console.log('\n🔔 8. Configurando tabla de notificaciones...');
    
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "notifications" creada');

    // ========================================
    // 9. TABLA DE BITÁCORA
    // ========================================
    console.log('\n📝 9. Configurando tabla de bitácora...');
    
    await connection.execute(`
      CREATE TABLE bitacora_global (
        id INT PRIMARY KEY AUTO_INCREMENT,
        titulo VARCHAR(255) NOT NULL,
        descripcion TEXT,
        estado ENUM('rojo', 'amarillo', 'verde') DEFAULT 'rojo',
        asignados TEXT,
        deadline TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "bitacora_global" creada');

    await connection.execute(`
      CREATE TABLE bitacora_personal (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        contenido TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Tabla "bitacora_personal" creada');

    // ========================================
    // 10. INSERTAR PREFERENCIAS POR DEFECTO
    // ========================================
    console.log('\n⚙️ 10. Configurando preferencias por defecto...');
    await connection.execute(`
      INSERT INTO user_preferences (user_id, theme, color_scheme, font_size, font_family, spacing, animations, background_type, background_color)
      SELECT id, 'dark', 'default', 'medium', 'inter', 'normal', 'enabled', 'color', 'default'
      FROM usuarios
    `);
    console.log('✅ Preferencias por defecto configuradas');

    // ========================================
    // 11. MOSTRAR ESTADÍSTICAS FINALES
    // ========================================
    console.log('\n📈 11. Estadísticas finales...');
    
    const [usuariosCount] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
    const [cargosCount] = await connection.execute('SELECT COUNT(*) as count FROM cargos');
    const [cursosCount] = await connection.execute('SELECT COUNT(*) as count FROM courses');
    const [documentosCount] = await connection.execute('SELECT COUNT(*) as count FROM documents');
    const [preferenciasCount] = await connection.execute('SELECT COUNT(*) as count FROM user_preferences');

    console.log(`👥 Usuarios: ${usuariosCount[0].count}`);
    console.log(`📋 Cargos: ${cargosCount[0].count}`);
    console.log(`📚 Cursos: ${cursosCount[0].count}`);
    console.log(`📄 Documentos: ${documentosCount[0].count}`);
    console.log(`⚙️ Preferencias: ${preferenciasCount[0].count}`);

    console.log('\n🎉 ¡Configuración completa de la base de datos finalizada exitosamente!');
    console.log('\n✨ Características implementadas:');
    console.log('  - Sistema de cargos dinámico y escalable');
    console.log('  - Gestión completa de usuarios y roles');
    console.log('  - Sistema de cursos con evaluaciones');
    console.log('  - Seguimiento de progreso');
    console.log('  - Gestión de documentos con asignación por roles/usuarios');
    console.log('  - Personalización de preferencias por usuario');
    console.log('  - Sistema de notificaciones');
    console.log('  - Bitácora personal y global');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    if (connection) {
      connection.release();
    }
    await closePool();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupCompleteDatabase();
}

module.exports = setupCompleteDatabase;

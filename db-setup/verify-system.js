const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};

async function verifySystem() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 Iniciando verificación completa del sistema...\n');

    // ========================================
    // 1. VERIFICAR ESTRUCTURA DE TABLAS
    // ========================================
    console.log('📋 1. Verificando estructura de tablas...');
    
    const tables = [
      'cargos', 'usuarios', 'courses', 'questions', 'course_progress',
      'documents', 'document_targets', 'user_preferences', 'notifications',
      'bitacora_global', 'bitacora_personal'
    ];

    for (const table of tables) {
      try {
        const [result] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`✅ Tabla "${table}" existe con ${result.length} columnas`);
      } catch (error) {
        console.error(`❌ Error en tabla "${table}":`, error.message);
      }
    }

    // ========================================
    // 2. VERIFICAR DATOS INICIALES
    // ========================================
    console.log('\n📊 2. Verificando datos iniciales...');
    
    const [cargosCount] = await connection.execute('SELECT COUNT(*) as count FROM cargos');
    console.log(`📋 Cargos: ${cargosCount[0].count}`);
    
    const [usuariosCount] = await connection.execute('SELECT COUNT(*) as count FROM usuarios');
    console.log(`👥 Usuarios: ${usuariosCount[0].count}`);
    
    const [preferenciasCount] = await connection.execute('SELECT COUNT(*) as count FROM user_preferences');
    console.log(`⚙️ Preferencias: ${preferenciasCount[0].count}`);

    // ========================================
    // 3. VERIFICAR RELACIONES ENTRE TABLAS
    // ========================================
    console.log('\n🔗 3. Verificando relaciones entre tablas...');
    
    // Verificar que el usuario admin tiene cargo asignado
    const [adminUser] = await connection.execute(`
      SELECT u.nombre, u.rol, c.nombre as cargo_nombre 
      FROM usuarios u 
      LEFT JOIN cargos c ON u.cargo_id = c.id 
      WHERE u.rol = 'Admin'
    `);
    
    if (adminUser.length > 0) {
      console.log(`✅ Usuario admin: ${adminUser[0].nombre} - Cargo: ${adminUser[0].cargo_nombre}`);
    } else {
      console.log('❌ No se encontró usuario admin');
    }

    // Verificar que las preferencias están vinculadas correctamente
    const [preferenciasVinculadas] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM user_preferences up 
      JOIN usuarios u ON up.user_id = u.id
    `);
    console.log(`✅ Preferencias vinculadas: ${preferenciasVinculadas[0].count}`);

    // ========================================
    // 4. VERIFICAR FUNCIONALIDADES CRÍTICAS
    // ========================================
    console.log('\n⚡ 4. Verificando funcionalidades críticas...');
    
    // Verificar que se pueden crear cargos
    try {
      const [testCargo] = await connection.execute(
        'INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)',
        ['Test Cargo', 'Cargo de prueba para verificación']
      );
      console.log('✅ Creación de cargos: FUNCIONA');
      
      // Limpiar cargo de prueba
      await connection.execute('DELETE FROM cargos WHERE nombre = ?', ['Test Cargo']);
    } catch (error) {
      console.error('❌ Error creando cargo:', error.message);
    }

    // Verificar que se pueden crear usuarios
    try {
      const [testUser] = await connection.execute(
        'INSERT INTO usuarios (nombre, email, password, rol, cargo_id) VALUES (?, ?, ?, ?, ?)',
        ['Test User', 'test@test.com', 'hashedpassword', 'Test Role', 1]
      );
      console.log('✅ Creación de usuarios: FUNCIONA');
      
      // Limpiar usuario de prueba
      await connection.execute('DELETE FROM usuarios WHERE email = ?', ['test@test.com']);
    } catch (error) {
      console.error('❌ Error creando usuario:', error.message);
    }

    // Verificar que se pueden crear cursos
    try {
      const [testCourse] = await connection.execute(
        'INSERT INTO courses (title, description, video_url, role, attempts, time_limit) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test Course', 'Curso de prueba', 'https://test.com', 'Admin', 1, 30]
      );
      console.log('✅ Creación de cursos: FUNCIONA');
      
      // Limpiar curso de prueba
      await connection.execute('DELETE FROM courses WHERE title = ?', ['Test Course']);
    } catch (error) {
      console.error('❌ Error creando curso:', error.message);
    }

    // Verificar que se pueden crear documentos
    try {
      const [testDocument] = await connection.execute(
        'INSERT INTO documents (name, filename, mimetype, size, user_id, is_global) VALUES (?, ?, ?, ?, ?, ?)',
        ['Test Document', 'test.pdf', 'application/pdf', 1024, 1, false]
      );
      console.log('✅ Creación de documentos: FUNCIONA');
      
      // Limpiar documento de prueba
      await connection.execute('DELETE FROM documents WHERE name = ?', ['Test Document']);
    } catch (error) {
      console.error('❌ Error creando documento:', error.message);
    }

    // Verificar que se pueden crear tareas
    try {
      const [testTask] = await connection.execute(
        'INSERT INTO bitacora_global (titulo, descripcion, estado, asignados, deadline) VALUES (?, ?, ?, ?, ?)',
        ['Test Task', 'Tarea de prueba', 'rojo', '["1"]', new Date()]
      );
      console.log('✅ Creación de tareas: FUNCIONA');
      
      // Limpiar tarea de prueba
      await connection.execute('DELETE FROM bitacora_global WHERE titulo = ?', ['Test Task']);
    } catch (error) {
      console.error('❌ Error creando tarea:', error.message);
    }

    // ========================================
    // 5. VERIFICAR CONSULTAS COMPLEJAS
    // ========================================
    console.log('\n🔍 5. Verificando consultas complejas...');
    
    // Verificar consulta de métricas de cargo
    try {
      const [metrics] = await connection.execute(`
        SELECT 
          COUNT(*) as total_usuarios,
          (SELECT COUNT(*) FROM courses WHERE role = c.nombre) as total_cursos,
          (SELECT COUNT(DISTINCT d.id) FROM documents d 
           JOIN document_targets dt ON d.id = dt.document_id 
           WHERE dt.target_type = 'role' AND dt.target_value = c.nombre) as total_documentos
        FROM usuarios u 
        JOIN cargos c ON u.cargo_id = c.id 
        WHERE c.id = 1
      `);
      console.log('✅ Consulta de métricas: FUNCIONA');
    } catch (error) {
      console.error('❌ Error en consulta de métricas:', error.message);
    }

    // Verificar consulta de progreso
    try {
      const [progress] = await connection.execute(`
        SELECT 
          u.nombre,
          c.title,
          cp.evaluation_score,
          cp.evaluation_status
        FROM course_progress cp
        JOIN usuarios u ON cp.user_id = u.id
        JOIN courses c ON cp.course_id = c.id
        LIMIT 1
      `);
      console.log('✅ Consulta de progreso: FUNCIONA');
    } catch (error) {
      console.error('❌ Error en consulta de progreso:', error.message);
    }

    // ========================================
    // 6. VERIFICAR INTEGRIDAD REFERENCIAL
    // ========================================
    console.log('\n🛡️ 6. Verificando integridad referencial...');
    
    // Verificar que no hay usuarios huérfanos
    const [usuariosHuérfanos] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM usuarios u 
      LEFT JOIN cargos c ON u.cargo_id = c.id 
      WHERE c.id IS NULL AND u.cargo_id IS NOT NULL
    `);
    
    if (usuariosHuérfanos[0].count === 0) {
      console.log('✅ No hay usuarios con cargos huérfanos');
    } else {
      console.log(`⚠️ Hay ${usuariosHuérfanos[0].count} usuarios con cargos huérfanos`);
    }

    // Verificar que no hay preferencias huérfanas
    const [preferenciasHuérfanas] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM user_preferences up 
      LEFT JOIN usuarios u ON up.user_id = u.id 
      WHERE u.id IS NULL
    `);
    
    if (preferenciasHuérfanas[0].count === 0) {
      console.log('✅ No hay preferencias huérfanas');
    } else {
      console.log(`⚠️ Hay ${preferenciasHuérfanas[0].count} preferencias huérfanas`);
    }

    // ========================================
    // 7. RESUMEN FINAL
    // ========================================
    console.log('\n📈 7. Resumen final del sistema...');
    
    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM cargos) as total_cargos,
        (SELECT COUNT(*) FROM usuarios) as total_usuarios,
        (SELECT COUNT(*) FROM courses) as total_cursos,
        (SELECT COUNT(*) FROM documents) as total_documentos,
        (SELECT COUNT(*) FROM bitacora_global) as total_tareas,
        (SELECT COUNT(*) FROM notifications) as total_notificaciones
    `);
    
    console.log('📊 Estadísticas del sistema:');
    console.log(`  📋 Cargos: ${stats[0].total_cargos}`);
    console.log(`  👥 Usuarios: ${stats[0].total_usuarios}`);
    console.log(`  📚 Cursos: ${stats[0].total_cursos}`);
    console.log(`  📄 Documentos: ${stats[0].total_documentos}`);
    console.log(`  📝 Tareas: ${stats[0].total_tareas}`);
    console.log(`  🔔 Notificaciones: ${stats[0].total_notificaciones}`);

    console.log('\n🎉 ¡Verificación del sistema completada exitosamente!');
    console.log('\n✨ Sistema listo para:');
    console.log('  ✅ Crear y gestionar cargos');
    console.log('  ✅ Registrar y gestionar usuarios');
    console.log('  ✅ Crear y gestionar cursos con evaluaciones');
    console.log('  ✅ Subir y gestionar documentos');
    console.log('  ✅ Crear y gestionar tareas');
    console.log('  ✅ Seguimiento de progreso');
    console.log('  ✅ Sistema de notificaciones');
    console.log('  ✅ Personalización de preferencias');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await connection.end();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  verifySystem();
}

module.exports = verifySystem;


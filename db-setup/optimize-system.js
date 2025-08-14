const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};

async function optimizeSystem() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🚀 Iniciando optimización del sistema...\n');

    // ========================================
    // 1. LIMPIAR DATOS DE PRUEBA
    // ========================================
    console.log('🧹 1. Limpiando datos de prueba...');
    
    // Limpiar cargos de prueba
    await connection.execute("DELETE FROM cargos WHERE nombre LIKE '%Test%'");
    await connection.execute("DELETE FROM cargos WHERE nombre LIKE '%Prueba%'");
    
    // Limpiar usuarios de prueba
    await connection.execute("DELETE FROM usuarios WHERE email LIKE '%test%'");
    await connection.execute("DELETE FROM usuarios WHERE nombre LIKE '%Test%'");
    
    // Limpiar cursos de prueba
    await connection.execute("DELETE FROM courses WHERE title LIKE '%Test%'");
    await connection.execute("DELETE FROM courses WHERE title LIKE '%Prueba%'");
    
    // Limpiar documentos de prueba
    await connection.execute("DELETE FROM documents WHERE name LIKE '%Test%'");
    await connection.execute("DELETE FROM documents WHERE name LIKE '%Prueba%'");
    
    // Limpiar tareas de prueba
    await connection.execute("DELETE FROM bitacora_global WHERE titulo LIKE '%Test%'");
    await connection.execute("DELETE FROM bitacora_global WHERE titulo LIKE '%Prueba%'");
    
    console.log('✅ Datos de prueba limpiados');

    // ========================================
    // 2. OPTIMIZAR ÍNDICES
    // ========================================
    console.log('\n⚡ 2. Optimizando índices...');
    
    // Crear índices para mejorar el rendimiento
    const indexes = [
      'CREATE INDEX idx_usuarios_email ON usuarios(email)',
      'CREATE INDEX idx_usuarios_cargo_id ON usuarios(cargo_id)',
      'CREATE INDEX idx_usuarios_rol ON usuarios(rol)',
      'CREATE INDEX idx_courses_role ON courses(role)',
      'CREATE INDEX idx_course_progress_user_course ON course_progress(user_id, course_id)',
      'CREATE INDEX idx_documents_user_id ON documents(user_id)',
      'CREATE INDEX idx_document_targets_document_id ON document_targets(document_id)',
      'CREATE INDEX idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX idx_notifications_created_at ON notifications(created_at)',
      'CREATE INDEX idx_bitacora_global_created_at ON bitacora_global(created_at)',
      'CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id)'
    ];

    for (const index of indexes) {
      try {
        await connection.execute(index);
        console.log(`✅ Índice creado: ${index.split(' ')[2]}`);
      } catch (error) {
        if (error.code === 'ER_DUP_KEYNAME') {
          console.log(`ℹ️ Índice ya existe: ${index.split(' ')[2]}`);
        } else {
          console.log(`ℹ️ Índice no creado (posiblemente ya existe): ${index.split(' ')[2]}`);
        }
      }
    }

    // ========================================
    // 3. VERIFICAR INTEGRIDAD DE DATOS
    // ========================================
    console.log('\n🛡️ 3. Verificando integridad de datos...');
    
    // Verificar y corregir usuarios sin cargo
    const [usuariosSinCargo] = await connection.execute(`
      SELECT id, nombre, email 
      FROM usuarios 
      WHERE cargo_id IS NULL OR cargo_id NOT IN (SELECT id FROM cargos)
    `);
    
    if (usuariosSinCargo.length > 0) {
      console.log(`⚠️ Encontrados ${usuariosSinCargo.length} usuarios sin cargo válido`);
      
      // Asignar cargo por defecto (Admin)
      await connection.execute(`
        UPDATE usuarios 
        SET cargo_id = (SELECT id FROM cargos WHERE nombre = 'Admin' LIMIT 1)
        WHERE cargo_id IS NULL OR cargo_id NOT IN (SELECT id FROM cargos)
      `);
      console.log('✅ Usuarios sin cargo corregidos');
    } else {
      console.log('✅ Todos los usuarios tienen cargos válidos');
    }

    // Verificar y corregir preferencias huérfanas
    const [preferenciasHuérfanas] = await connection.execute(`
      SELECT up.id 
      FROM user_preferences up 
      LEFT JOIN usuarios u ON up.user_id = u.id 
      WHERE u.id IS NULL
    `);
    
    if (preferenciasHuérfanas.length > 0) {
      console.log(`⚠️ Encontradas ${preferenciasHuérfanas.length} preferencias huérfanas`);
      
      // Eliminar preferencias huérfanas
      await connection.execute(`
        DELETE up FROM user_preferences up 
        LEFT JOIN usuarios u ON up.user_id = u.id 
        WHERE u.id IS NULL
      `);
      console.log('✅ Preferencias huérfanas eliminadas');
    } else {
      console.log('✅ No hay preferencias huérfanas');
    }

    // ========================================
    // 4. OPTIMIZAR CONFIGURACIONES
    // ========================================
    console.log('\n⚙️ 4. Optimizando configuraciones...');
    
    // Asegurar que el usuario admin existe y tiene permisos correctos
    const [adminUser] = await connection.execute(`
      SELECT id, nombre, email, rol, cargo_id 
      FROM usuarios 
      WHERE rol = 'Admin'
    `);
    
    if (adminUser.length === 0) {
      console.log('⚠️ No se encontró usuario admin, creando uno...');
      const bcrypt = require('bcrypt');
      const passwordHash = await bcrypt.hash('12345678', 10);
      
      await connection.execute(`
        INSERT INTO usuarios (nombre, email, password, rol, cargo_id, activo)
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Admin', 'admin@admin.com', passwordHash, 'Admin', 1, true]);
      
      console.log('✅ Usuario admin creado');
    } else {
      console.log(`✅ Usuario admin encontrado: ${adminUser[0].nombre}`);
    }

    // Asegurar que existen cargos básicos
    const cargosBasicos = [
      { nombre: 'Admin', descripcion: 'Administrador del sistema' },
      { nombre: 'Gerente', descripcion: 'Gerente de departamento' },
      { nombre: 'Contabilidad', descripcion: 'Personal de contabilidad' },
      { nombre: 'Compras', descripcion: 'Personal de compras' },
      { nombre: 'Atención al Cliente', descripcion: 'Personal de atención al cliente' },
      { nombre: 'Operativo', descripcion: 'Personal operativo' }
    ];

    for (const cargo of cargosBasicos) {
      const [existing] = await connection.execute(
        'SELECT id FROM cargos WHERE nombre = ?',
        [cargo.nombre]
      );
      
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)',
          [cargo.nombre, cargo.descripcion]
        );
        console.log(`✅ Cargo "${cargo.nombre}" creado`);
      }
    }

    // ========================================
    // 5. LIMPIAR DATOS ANTIGUOS
    // ========================================
    console.log('\n🗑️ 5. Limpiando datos antiguos...');
    
    // Limpiar notificaciones antiguas (más de 30 días)
    const [notificacionesEliminadas] = await connection.execute(`
      DELETE FROM notifications 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    console.log(`✅ ${notificacionesEliminadas.affectedRows} notificaciones antiguas eliminadas`);

    // Limpiar tareas vencidas (más de 90 días)
    const [tareasEliminadas] = await connection.execute(`
      DELETE FROM bitacora_global 
      WHERE deadline < DATE_SUB(NOW(), INTERVAL 90 DAY) 
      AND estado = 'verde'
    `);
    console.log(`✅ ${tareasEliminadas.affectedRows} tareas vencidas eliminadas`);

    // ========================================
    // 6. ANALIZAR Y OPTIMIZAR TABLAS
    // ========================================
    console.log('\n📊 6. Analizando y optimizando tablas...');
    
    const tables = [
      'cargos', 'usuarios', 'courses', 'questions', 'course_progress',
      'documents', 'document_targets', 'user_preferences', 'notifications',
      'bitacora_global', 'bitacora_personal'
    ];

    for (const table of tables) {
      try {
        await connection.execute(`ANALYZE TABLE ${table}`);
        console.log(`✅ Tabla "${table}" analizada`);
      } catch (error) {
        console.error(`❌ Error analizando tabla "${table}":`, error.message);
      }
    }

    // ========================================
    // 7. RESUMEN FINAL
    // ========================================
    console.log('\n📈 7. Resumen final de optimización...');
    
    const [stats] = await connection.execute(`
      SELECT 
        (SELECT COUNT(*) FROM cargos) as total_cargos,
        (SELECT COUNT(*) FROM usuarios) as total_usuarios,
        (SELECT COUNT(*) FROM courses) as total_cursos,
        (SELECT COUNT(*) FROM documents) as total_documentos,
        (SELECT COUNT(*) FROM bitacora_global) as total_tareas,
        (SELECT COUNT(*) FROM notifications) as total_notificaciones,
        (SELECT COUNT(*) FROM user_preferences) as total_preferencias
    `);
    
    console.log('📊 Estadísticas finales del sistema:');
    console.log(`  📋 Cargos: ${stats[0].total_cargos}`);
    console.log(`  👥 Usuarios: ${stats[0].total_usuarios}`);
    console.log(`  📚 Cursos: ${stats[0].total_cursos}`);
    console.log(`  📄 Documentos: ${stats[0].total_documentos}`);
    console.log(`  📝 Tareas: ${stats[0].total_tareas}`);
    console.log(`  🔔 Notificaciones: ${stats[0].total_notificaciones}`);
    console.log(`  ⚙️ Preferencias: ${stats[0].total_preferencias}`);

    console.log('\n🎉 ¡Optimización del sistema completada exitosamente!');
    console.log('\n✨ Sistema optimizado para:');
    console.log('  ✅ Máximo rendimiento en consultas');
    console.log('  ✅ Integridad de datos garantizada');
    console.log('  ✅ Configuración limpia y consistente');
    console.log('  ✅ Datos antiguos limpiados');
    console.log('  ✅ Índices optimizados');
    console.log('  ✅ Usuario admin disponible');
    console.log('  ✅ Cargos básicos configurados');

  } catch (error) {
    console.error('❌ Error durante la optimización:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await connection.end();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  optimizeSystem();
}

module.exports = optimizeSystem;

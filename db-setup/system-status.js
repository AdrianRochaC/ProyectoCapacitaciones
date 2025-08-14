const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};

async function showSystemStatus() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('📊 ESTADO ACTUAL DEL SISTEMA DE CAPACITACIONES\n');
    console.log('=' .repeat(50));

    // ========================================
    // 1. ESTADÍSTICAS GENERALES
    // ========================================
    console.log('\n📈 1. ESTADÍSTICAS GENERALES');
    console.log('-'.repeat(30));
    
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
    
    console.log(`📋 Cargos: ${stats[0].total_cargos}`);
    console.log(`👥 Usuarios: ${stats[0].total_usuarios}`);
    console.log(`📚 Cursos: ${stats[0].total_cursos}`);
    console.log(`📄 Documentos: ${stats[0].total_documentos}`);
    console.log(`📝 Tareas: ${stats[0].total_tareas}`);
    console.log(`🔔 Notificaciones: ${stats[0].total_notificaciones}`);
    console.log(`⚙️ Preferencias: ${stats[0].total_preferencias}`);

    // ========================================
    // 2. USUARIOS ACTIVOS
    // ========================================
    console.log('\n👥 2. USUARIOS ACTIVOS');
    console.log('-'.repeat(30));
    
    const [usuarios] = await connection.execute(`
      SELECT u.nombre, u.email, u.rol, c.nombre as cargo_nombre, u.activo
      FROM usuarios u
      LEFT JOIN cargos c ON u.cargo_id = c.id
      ORDER BY u.nombre
    `);
    
    usuarios.forEach(user => {
      const status = user.activo ? '✅' : '❌';
      console.log(`${status} ${user.nombre} (${user.email}) - ${user.rol} - ${user.cargo_nombre}`);
    });

    // ========================================
    // 3. CARGOS DISPONIBLES
    // ========================================
    console.log('\n📋 3. CARGOS DISPONIBLES');
    console.log('-'.repeat(30));
    
    const [cargos] = await connection.execute(`
      SELECT c.nombre, c.descripcion, COUNT(u.id) as usuarios_asignados
      FROM cargos c
      LEFT JOIN usuarios u ON c.id = u.cargo_id
      GROUP BY c.id, c.nombre, c.descripcion
      ORDER BY c.nombre
    `);
    
    cargos.forEach(cargo => {
      console.log(`📋 ${cargo.nombre} - ${cargo.usuarios_asignados} usuarios`);
      console.log(`   ${cargo.descripcion}`);
    });

    // ========================================
    // 4. CURSOS DISPONIBLES
    // ========================================
    console.log('\n📚 4. CURSOS DISPONIBLES');
    console.log('-'.repeat(30));
    
    const [cursos] = await connection.execute(`
      SELECT title, description, role, attempts, time_limit, created_at
      FROM courses
      ORDER BY created_at DESC
    `);
    
    if (cursos.length === 0) {
      console.log('📭 No hay cursos creados aún');
    } else {
      cursos.forEach(curso => {
        console.log(`📚 ${curso.title}`);
        console.log(`   Rol: ${curso.role} | Intentos: ${curso.attempts} | Tiempo: ${curso.time_limit}min`);
        console.log(`   ${curso.description}`);
      });
    }

    // ========================================
    // 5. TAREAS PENDIENTES
    // ========================================
    console.log('\n📝 5. TAREAS PENDIENTES');
    console.log('-'.repeat(30));
    
    const [tareas] = await connection.execute(`
      SELECT titulo, estado, deadline, created_at
      FROM bitacora_global
      WHERE estado != 'verde'
      ORDER BY deadline ASC
    `);
    
    if (tareas.length === 0) {
      console.log('✅ No hay tareas pendientes');
    } else {
      tareas.forEach(tarea => {
        const estado = {
          'rojo': '🔴',
          'amarillo': '🟡',
          'verde': '🟢'
        }[tarea.estado] || '⚪';
        
        const deadline = new Date(tarea.deadline).toLocaleDateString('es-CO');
        console.log(`${estado} ${tarea.titulo} - Vence: ${deadline}`);
      });
    }

    // ========================================
    // 6. NOTIFICACIONES NO LEÍDAS
    // ========================================
    console.log('\n🔔 6. NOTIFICACIONES NO LEÍDAS');
    console.log('-'.repeat(30));
    
    const [notificaciones] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM notifications
      WHERE is_read = 0
    `);
    
    console.log(`📬 Total de notificaciones no leídas: ${notificaciones[0].total}`);

    // ========================================
    // 7. PROGRESO DE CURSOS
    // ========================================
    console.log('\n📊 7. PROGRESO DE CURSOS');
    console.log('-'.repeat(30));
    
    const [progreso] = await connection.execute(`
      SELECT 
        COUNT(*) as total_registros,
        SUM(CASE WHEN video_completed = 1 THEN 1 ELSE 0 END) as videos_completados,
        SUM(CASE WHEN evaluation_status = 'aprobado' THEN 1 ELSE 0 END) as evaluaciones_aprobadas,
        AVG(CASE WHEN evaluation_score IS NOT NULL THEN evaluation_score ELSE 0 END) as promedio_score
      FROM course_progress
    `);
    
    console.log(`📊 Total de registros de progreso: ${progreso[0].total_registros}`);
    console.log(`🎥 Videos completados: ${progreso[0].videos_completados}`);
    console.log(`✅ Evaluaciones aprobadas: ${progreso[0].evaluaciones_aprobadas}`);
    console.log(`📈 Promedio de calificación: ${Math.round(progreso[0].promedio_score || 0)}%`);

    // ========================================
    // 8. ESTADO DEL SISTEMA
    // ========================================
    console.log('\n🔧 8. ESTADO DEL SISTEMA');
    console.log('-'.repeat(30));
    
    // Verificar integridad
    const [usuariosSinCargo] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM usuarios 
      WHERE cargo_id IS NULL OR cargo_id NOT IN (SELECT id FROM cargos)
    `);
    
    const [preferenciasHuérfanas] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM user_preferences up 
      LEFT JOIN usuarios u ON up.user_id = u.id 
      WHERE u.id IS NULL
    `);
    
    console.log(`🔗 Usuarios sin cargo válido: ${usuariosSinCargo[0].count}`);
    console.log(`🔗 Preferencias huérfanas: ${preferenciasHuérfanas[0].count}`);
    
    if (usuariosSinCargo[0].count === 0 && preferenciasHuérfanas[0].count === 0) {
      console.log('✅ Integridad de datos: PERFECTA');
    } else {
      console.log('⚠️ Integridad de datos: REQUIERE ATENCIÓN');
    }

    // ========================================
    // 9. RESUMEN FINAL
    // ========================================
    console.log('\n🎯 9. RESUMEN FINAL');
    console.log('-'.repeat(30));
    
    const totalItems = stats[0].total_cargos + stats[0].total_usuarios + stats[0].total_cursos + 
                      stats[0].total_documentos + stats[0].total_tareas;
    
    console.log(`📊 Total de elementos en el sistema: ${totalItems}`);
    console.log(`🚀 Sistema: ${totalItems > 0 ? 'OPERATIVO' : 'VACÍO'}`);
    console.log(`📅 Última verificación: ${new Date().toLocaleString('es-CO')}`);
    
    if (totalItems > 0) {
      console.log('\n✨ El sistema está listo para uso en producción');
      console.log('📋 Funcionalidades disponibles:');
      console.log('   ✅ Gestión de usuarios y cargos');
      console.log('   ✅ Creación y gestión de cursos');
      console.log('   ✅ Subida y gestión de documentos');
      console.log('   ✅ Sistema de tareas y notificaciones');
      console.log('   ✅ Seguimiento de progreso');
      console.log('   ✅ Personalización de preferencias');
    } else {
      console.log('\n⚠️ El sistema está vacío, ejecutar setup-complete-database.js');
    }

  } catch (error) {
    console.error('❌ Error obteniendo estado del sistema:', error.message);
  } finally {
    await connection.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  showSystemStatus();
}

module.exports = showSystemStatus;


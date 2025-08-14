import { executeQuery, checkConnectionHealth } from '../db-setup/connection-manager.js';

// Obtener métricas de un cargo específico (versión corregida)
export async function getCargoMetrics(cargoId) {
  try {
    // Verificar conexión
    await checkConnectionHealth();
    
    // Verificar que el cargo existe
    const cargoInfo = await executeQuery(
      'SELECT * FROM cargos WHERE id = ?',
      [cargoId]
    );
    
    if (cargoInfo.length === 0) {
      throw new Error('Cargo no encontrado');
    }
    
    const cargo = cargoInfo[0];
    
    // Obtener total de usuarios en este cargo
    const usuariosResult = await executeQuery(
      'SELECT COUNT(*) as total FROM usuarios WHERE cargo_id = ?',
      [cargoId]
    );
    
    // Obtener total de cursos asignados a este cargo
    const cursosResult = await executeQuery(
      'SELECT COUNT(*) as total FROM courses WHERE role = ?',
      [cargo.nombre]
    );
    
    // Obtener total de documentos asignados a este cargo
    const documentosResult = await executeQuery(
      'SELECT COUNT(DISTINCT d.id) as total FROM documents d JOIN document_targets dt ON d.id = dt.document_id WHERE dt.target_type = "role" AND dt.target_value = ?',
      [cargo.nombre]
    );
    
    // Obtener promedio de progreso de usuarios en este cargo
    const progresoResult = await executeQuery(
      `SELECT AVG(
        CASE 
          WHEN cp.evaluation_score IS NOT NULL AND cp.evaluation_total > 0 
          THEN (cp.evaluation_score / cp.evaluation_total) * 100
          ELSE 0 
        END
      ) as promedio FROM course_progress cp 
      JOIN usuarios u ON cp.user_id = u.id 
      WHERE u.cargo_id = ?`,
      [cargoId]
    );
    
    const metrics = {
      totalUsuarios: usuariosResult[0].total,
      totalCursos: cursosResult[0].total,
      totalDocumentos: documentosResult[0].total,
      promedioProgreso: Math.round(progresoResult[0].promedio || 0)
    };
    
    console.log('📊 MÉTRICAS OBTENIDAS PARA CARGO:', cargo.nombre);
    console.log('  👥 Usuarios:', metrics.totalUsuarios);
    console.log('  📚 Cursos:', metrics.totalCursos);
    console.log('  📄 Documentos:', metrics.totalDocumentos);
    console.log('  📈 Progreso promedio:', metrics.promedioProgreso + '%');
    console.log('  📋 Resultado completo:', JSON.stringify(metrics, null, 2));
    
    return metrics;
    
  } catch (error) {
    console.error('Error obteniendo métricas del cargo:', error);
    throw error;
  }
}

// Obtener estadísticas completas de un cargo
export async function getCargoStats(cargoId) {
  try {
    const cargoInfo = await executeQuery('SELECT * FROM cargos WHERE id = ?', [cargoId]);
    if (cargoInfo.length === 0) throw new Error('Cargo no encontrado');
    
    const cargo = cargoInfo[0];
    
    // Estadísticas de empleados
    const empleadosStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_empleados,
        COUNT(CASE WHEN activo = 1 THEN 1 END) as empleados_activos,
        COUNT(CASE WHEN activo = 0 THEN 1 END) as empleados_inactivos
      FROM usuarios WHERE cargo_id = ?
    `, [cargoId]);

    // Lista de empleados
    const empleados = await executeQuery(`
      SELECT 
        id, nombre, email, rol, activo, fecha_registro,
        (SELECT COUNT(*) FROM course_progress WHERE user_id = usuarios.id) as cursos_asignados,
        (SELECT COUNT(*) FROM course_progress WHERE user_id = usuarios.id AND evaluation_status = 'aprobado') as cursos_aprobados
      FROM usuarios WHERE cargo_id = ? ORDER BY nombre ASC
    `, [cargoId]);

    // Estadísticas de cursos
    const cursosStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_cursos,
        AVG(attempts) as promedio_intentos,
        AVG(time_limit) as promedio_tiempo_limite
      FROM courses WHERE role = ?
    `, [cargo.nombre]);

    // Lista de cursos
    const cursos = await executeQuery(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM questions WHERE course_id = c.id) as total_preguntas,
        (SELECT COUNT(DISTINCT user_id) FROM course_progress WHERE course_id = c.id) as usuarios_asignados,
        (SELECT COUNT(DISTINCT user_id) FROM course_progress WHERE course_id = c.id AND evaluation_status = 'aprobado') as usuarios_aprobados
      FROM courses c WHERE c.role = ? ORDER BY c.created_at DESC
    `, [cargo.nombre]);

    // Estadísticas de documentos
    const documentosStats = await executeQuery(`
      SELECT 
        COUNT(DISTINCT d.id) as total_documentos,
        COUNT(CASE WHEN d.is_global = 1 THEN 1 END) as documentos_globales,
        SUM(d.size) as tamaño_total_bytes,
        ROUND(SUM(d.size) / 1024 / 1024, 2) as tamaño_total_mb
      FROM documents d
      JOIN document_targets dt ON d.id = dt.document_id
      WHERE dt.target_type = 'role' AND dt.target_value = ?
    `, [cargo.nombre]);

    // Lista de documentos
    const documentos = await executeQuery(`
      SELECT 
        d.*,
        u.nombre as subido_por
      FROM documents d
      JOIN document_targets dt ON d.id = dt.document_id
      LEFT JOIN usuarios u ON d.user_id = u.id
      WHERE dt.target_type = 'role' AND dt.target_value = ?
      ORDER BY d.created_at DESC
    `, [cargo.nombre]);

    // Estadísticas de progreso
    const progresoStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_progresos,
        COUNT(CASE WHEN evaluation_status = 'aprobado' THEN 1 END) as aprobados,
        COUNT(CASE WHEN evaluation_status = 'reprobado' THEN 1 END) as reprobados,
        AVG(evaluation_score) as promedio_puntuacion
      FROM course_progress cp
      JOIN usuarios u ON cp.user_id = u.id
      WHERE u.cargo_id = ?
    `, [cargoId]);

    return {
      cargo: cargo,
      empleados: { estadisticas: empleadosStats[0], lista: empleados },
      cursos: { estadisticas: cursosStats[0], lista: cursos },
      documentos: { estadisticas: documentosStats[0], lista: documentos },
      progreso: progresoStats[0]
    };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas del cargo:', error.message);
    throw error;
  }
}

// Obtener estadísticas de todos los cargos
export async function getAllCargosStats() {
  try {
    const cargos = await executeQuery(`
      SELECT 
        c.*,
        COUNT(u.id) as total_empleados,
        COUNT(CASE WHEN u.activo = 1 THEN 1 END) as empleados_activos,
        (SELECT COUNT(*) FROM courses WHERE role = c.nombre) as total_cursos,
        (SELECT COUNT(DISTINCT d.id) FROM documents d 
         JOIN document_targets dt ON d.id = dt.document_id 
         WHERE dt.target_type = 'role' AND dt.target_value = c.nombre) as total_documentos,
        (SELECT COUNT(*) FROM course_progress cp 
         JOIN usuarios u2 ON cp.user_id = u2.id 
         WHERE u2.cargo_id = c.id AND cp.evaluation_status = 'aprobado') as cursos_aprobados
      FROM cargos c
      LEFT JOIN usuarios u ON c.id = u.cargo_id
      GROUP BY c.id
      ORDER BY c.nombre ASC
    `);
    return cargos;
  } catch (error) {
    console.error('Error obteniendo estadísticas de todos los cargos:', error.message);
    throw error;
  }
}

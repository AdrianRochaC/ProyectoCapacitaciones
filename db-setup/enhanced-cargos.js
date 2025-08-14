const { getConnection, executeQuery, closePool } = require('./connection-manager');

// Obtener estadísticas completas de un cargo
async function getCargoStats(cargoId) {
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
async function getAllCargosStats() {
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

// Crear nuevo cargo
async function crearCargo(nombre, descripcion) {
  try {
    if (!nombre || nombre.trim() === '') throw new Error('El nombre del cargo no puede estar vacío');
    
    const existingCargo = await executeQuery('SELECT id FROM cargos WHERE nombre = ?', [nombre.trim()]);
    if (existingCargo.length > 0) throw new Error('Ya existe un cargo con ese nombre');
    
    const result = await executeQuery('INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)', [nombre.trim(), descripcion || '']);
    console.log(`✅ Cargo "${nombre}" creado exitosamente con ID: ${result.insertId}`);
    return result.insertId;
  } catch (error) {
    console.error('Error creando cargo:', error.message);
    throw error;
  }
}

// Actualizar cargo
async function actualizarCargo(id, nombre, descripcion) {
  try {
    const existingCargo = await executeQuery('SELECT id FROM cargos WHERE id = ?', [id]);
    if (existingCargo.length === 0) throw new Error('El cargo especificado no existe');
    
    if (!nombre || nombre.trim() === '') throw new Error('El nombre del cargo no puede estar vacío');
    
    const duplicateName = await executeQuery('SELECT id FROM cargos WHERE nombre = ? AND id != ?', [nombre.trim(), id]);
    if (duplicateName.length > 0) throw new Error('Ya existe otro cargo con ese nombre');
    
    await executeQuery('UPDATE cargos SET nombre = ?, descripcion = ? WHERE id = ?', [nombre.trim(), descripcion || '', id]);
    console.log(`✅ Cargo con ID ${id} actualizado exitosamente`);
    return true;
  } catch (error) {
    console.error('Error actualizando cargo:', error.message);
    throw error;
  }
}

// Eliminar cargo
async function eliminarCargo(id) {
  try {
    const existingCargo = await executeQuery('SELECT nombre FROM cargos WHERE id = ?', [id]);
    if (existingCargo.length === 0) throw new Error('El cargo especificado no existe');
    
    const usuariosAsignados = await executeQuery('SELECT COUNT(*) as count FROM usuarios WHERE cargo_id = ?', [id]);
    if (usuariosAsignados[0].count > 0) {
      throw new Error(`No se puede eliminar el cargo "${existingCargo[0].nombre}" porque tiene ${usuariosAsignados[0].count} usuarios asignados`);
    }
    
    await executeQuery('DELETE FROM cargos WHERE id = ?', [id]);
    console.log(`✅ Cargo "${existingCargo[0].nombre}" eliminado exitosamente`);
    return true;
  } catch (error) {
    console.error('Error eliminando cargo:', error.message);
    throw error;
  }
}

// Mostrar estadísticas en consola
async function mostrarEstadisticasCargos() {
  try {
    console.log('📊 Generando estadísticas de cargos...\n');
    const cargosStats = await getAllCargosStats();
    
    console.log('📋 ESTADÍSTICAS GENERALES DE CARGOS');
    console.log('=====================================\n');
    
    cargosStats.forEach(cargo => {
      console.log(`🏢 ${cargo.nombre}`);
      console.log(`   📝 Descripción: ${cargo.descripcion || 'Sin descripción'}`);
      console.log(`   👥 Empleados: ${cargo.total_empleados} (${cargo.empleados_activos} activos)`);
      console.log(`   📚 Cursos: ${cargo.total_cursos}`);
      console.log(`   📄 Documentos: ${cargo.total_documentos}`);
      console.log(`   ✅ Cursos aprobados: ${cargo.cursos_aprobados}`);
      
      const porcentajeAprobacion = (cargo.cursos_aprobados + (cargo.total_cursos - cargo.cursos_aprobados)) > 0 
        ? Math.round((cargo.cursos_aprobados / cargo.total_cursos) * 100)
        : 0;
      
      console.log(`   📈 Porcentaje de aprobación: ${porcentajeAprobacion}%`);
      console.log('');
    });
    
    console.log('🎉 Estadísticas generadas exitosamente');
  } catch (error) {
    console.error('❌ Error mostrando estadísticas:', error.message);
  }
}

if (require.main === module) {
  mostrarEstadisticasCargos();
}

module.exports = {
  getCargoStats,
  getAllCargosStats,
  crearCargo,
  actualizarCargo,
  eliminarCargo,
  mostrarEstadisticasCargos
};

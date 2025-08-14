const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};

async function diagnosticCargos() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO DE CARGOS Y DATOS RELACIONADOS\n');
    console.log('==================================================\n');

    // 1. Verificar cargos existentes
    console.log('📋 1. CARGOS EXISTENTES:');
    const [cargos] = await connection.execute('SELECT * FROM cargos ORDER BY id');
    console.log(`Total de cargos: ${cargos.length}`);
    cargos.forEach(cargo => {
      console.log(`  ID: ${cargo.id} | Nombre: "${cargo.nombre}" | Descripción: "${cargo.descripcion}"`);
    });
    console.log('');

    // 2. Verificar usuarios por cargo
    console.log('👥 2. USUARIOS POR CARGO:');
    const [usuarios] = await connection.execute(`
      SELECT 
        u.id, u.nombre, u.email, u.rol, u.activo, u.cargo_id,
        c.nombre as cargo_nombre
      FROM usuarios u
      LEFT JOIN cargos c ON u.cargo_id = c.id
      ORDER BY u.cargo_id, u.nombre
    `);
    console.log(`Total de usuarios: ${usuarios.length}`);
    usuarios.forEach(user => {
      console.log(`  ID: ${user.id} | Nombre: "${user.nombre}" | Email: "${user.email}" | Rol: "${user.rol}" | Activo: ${user.activo} | Cargo: "${user.cargo_nombre || 'Sin cargo'}"`);
    });
    console.log('');

    // 3. Verificar cursos existentes
    console.log('📚 3. CURSOS EXISTENTES:');
    const [cursos] = await connection.execute('SELECT * FROM courses ORDER BY id');
    console.log(`Total de cursos: ${cursos.length}`);
    cursos.forEach(curso => {
      console.log(`  ID: ${curso.id} | Título: "${curso.title}" | Rol: "${curso.role}" | Intentos: ${curso.attempts} | Tiempo: ${curso.time_limit}min`);
    });
    console.log('');

    // 4. Verificar progreso de cursos
    console.log('📊 4. PROGRESO DE CURSOS:');
    const [progreso] = await connection.execute(`
      SELECT 
        cp.*,
        u.nombre as usuario_nombre,
        c.title as curso_titulo
      FROM course_progress cp
      JOIN usuarios u ON cp.user_id = u.id
      JOIN courses c ON cp.course_id = c.id
      ORDER BY cp.user_id, cp.course_id
    `);
    console.log(`Total de registros de progreso: ${progreso.length}`);
    progreso.forEach(prog => {
      console.log(`  Usuario: "${prog.usuario_nombre}" | Curso: "${prog.curso_titulo}" | Video completado: ${prog.video_completed} | Estado: "${prog.evaluation_status || 'Sin evaluar'}" | Puntuación: ${prog.evaluation_score || 'N/A'}`);
    });
    console.log('');

    // 5. Verificar documentos
    console.log('📄 5. DOCUMENTOS EXISTENTES:');
    const [documentos] = await connection.execute(`
      SELECT 
        d.*,
        u.nombre as subido_por
      FROM documents d
      LEFT JOIN usuarios u ON d.user_id = u.id
      ORDER BY d.id
    `);
    console.log(`Total de documentos: ${documentos.length}`);
    documentos.forEach(doc => {
      console.log(`  ID: ${doc.id} | Nombre: "${doc.name}" | Archivo: "${doc.filename}" | Tamaño: ${doc.size} bytes | Global: ${doc.is_global} | Subido por: "${doc.subido_por || 'Sistema'}"`);
    });
    console.log('');

    // 6. Verificar targets de documentos
    console.log('🎯 6. TARGETS DE DOCUMENTOS:');
    const [targets] = await connection.execute(`
      SELECT 
        dt.*,
        d.name as documento_nombre
      FROM document_targets dt
      JOIN documents d ON dt.document_id = d.id
      ORDER BY dt.document_id
    `);
    console.log(`Total de targets: ${targets.length}`);
    targets.forEach(target => {
      console.log(`  Documento: "${target.documento_nombre}" | Tipo: ${target.target_type} | Valor: "${target.target_value}"`);
    });
    console.log('');

    // 7. Consulta de prueba para estadísticas
    console.log('📈 7. PRUEBA DE ESTADÍSTICAS:');
    
    // Probar con el primer cargo
    if (cargos.length > 0) {
      const primerCargo = cargos[0];
      console.log(`\nProbando estadísticas para cargo: "${primerCargo.nombre}" (ID: ${primerCargo.id})`);
      
      // Empleados del cargo
      const [empleadosCargo] = await connection.execute(`
        SELECT COUNT(*) as total FROM usuarios WHERE cargo_id = ?
      `, [primerCargo.id]);
      console.log(`  Empleados en este cargo: ${empleadosCargo[0].total}`);
      
      // Cursos para este cargo
      const [cursosCargo] = await connection.execute(`
        SELECT COUNT(*) as total FROM courses WHERE role = ?
      `, [primerCargo.nombre]);
      console.log(`  Cursos para este cargo: ${cursosCargo[0].total}`);
      
      // Documentos para este cargo
      const [docsCargo] = await connection.execute(`
        SELECT COUNT(DISTINCT d.id) as total 
        FROM documents d
        JOIN document_targets dt ON d.id = dt.document_id
        WHERE dt.target_type = 'role' AND dt.target_value = ?
      `, [primerCargo.nombre]);
      console.log(`  Documentos para este cargo: ${docsCargo[0].total}`);
      
      // Progreso de usuarios de este cargo
      const [progCargo] = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM course_progress cp
        JOIN usuarios u ON cp.user_id = u.id
        WHERE u.cargo_id = ?
      `, [primerCargo.id]);
      console.log(`  Registros de progreso: ${progCargo[0].total}`);
    }

    console.log('\n🎉 Diagnóstico completado');
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await connection.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  diagnosticCargos();
}

module.exports = diagnosticCargos;

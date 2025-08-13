const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};

async function checkCargos() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('🔍 Verificando cargos en la base de datos...\n');
    
    // Verificar si la tabla existe
    const [tables] = await connection.execute('SHOW TABLES LIKE "cargos"');
    if (tables.length === 0) {
      console.log('❌ La tabla "cargos" no existe');
      return;
    }
    console.log('✅ La tabla "cargos" existe');
    
    // Verificar estructura de la tabla
    const [columns] = await connection.execute('DESCRIBE cargos');
    console.log('\n📋 Estructura de la tabla "cargos":');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Verificar si hay cargos
    const [cargos] = await connection.execute('SELECT * FROM cargos');
    console.log(`\n👥 Total de cargos: ${cargos.length}`);
    
    if (cargos.length > 0) {
      console.log('\n📋 Cargos existentes:');
      cargos.forEach(cargo => {
        console.log(`  - ID: ${cargo.id}, Nombre: "${cargo.nombre}", Descripción: "${cargo.descripcion}"`);
        console.log(`    Creado: ${cargo.created_at}, Actualizado: ${cargo.updated_at}`);
      });
    } else {
      console.log('\n⚠️ No hay cargos en la tabla');
    }
    
    // Verificar usuarios
    const [usuarios] = await connection.execute('SELECT id, nombre, email, rol, cargo_id FROM usuarios');
    console.log(`\n👤 Total de usuarios: ${usuarios.length}`);
    
    if (usuarios.length > 0) {
      console.log('\n👤 Usuarios existentes:');
      usuarios.forEach(user => {
        console.log(`  - ID: ${user.id}, Nombre: "${user.nombre}", Email: "${user.email}"`);
        console.log(`    Rol: "${user.rol}", Cargo ID: ${user.cargo_id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  checkCargos();
}

module.exports = checkCargos;

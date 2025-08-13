const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};

async function setupCargosTable() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('📋 Configurando tabla de cargos...');
    
    // Eliminar tabla si existe
    await connection.execute('DROP TABLE IF EXISTS cargos');
    console.log('🗑️ Tabla "cargos" eliminada (si existía)');
    
    // Crear tabla de cargos
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
      { nombre: 'Operativo', descripcion: 'Personal operativo' },
      { nombre: 'Recursos Humanos', descripcion: 'Personal de recursos humanos' },
      { nombre: 'Tecnología', descripcion: 'Personal de tecnología e informática' },
      { nombre: 'Ventas', descripcion: 'Personal de ventas' },
      { nombre: 'Logística', descripcion: 'Personal de logística y almacén' }
    ];

    for (const cargo of cargosDefault) {
      await connection.execute(
        'INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)',
        [cargo.nombre, cargo.descripcion]
      );
    }
    console.log('✅ Cargos por defecto insertados');

    // Mostrar cargos creados
    const [cargos] = await connection.execute('SELECT * FROM cargos ORDER BY nombre ASC');
    console.log('\n📋 Cargos disponibles:');
    cargos.forEach(cargo => {
      console.log(`  - ${cargo.nombre} - ${cargo.descripcion}`);
    });

    console.log('\n🎉 Configuración de cargos completada exitosamente');
    console.log('\n💡 Para agregar nuevos cargos, puedes:');
    console.log('  1. Usar la interfaz de administración en la aplicación');
    console.log('  2. Ejecutar INSERT directamente en la base de datos');
    console.log('  3. Crear un script adicional para gestión de cargos');

  } catch (error) {
    console.error('❌ Error configurando tabla de cargos:', error.message);
  } finally {
    await connection.end();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Función para agregar un nuevo cargo
async function agregarCargo(nombre, descripcion) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.execute(
      'INSERT INTO cargos (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    console.log(`✅ Cargo "${nombre}" agregado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error agregando cargo "${nombre}":`, error.message);
    return false;
  } finally {
    await connection.end();
  }
}

// Función para editar un cargo existente
async function editarCargo(id, nombre, descripcion) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.execute(
      'UPDATE cargos SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion, id]
    );
    console.log(`✅ Cargo con ID ${id} actualizado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error actualizando cargo con ID ${id}:`, error.message);
    return false;
  } finally {
    await connection.end();
  }
}

// Función para eliminar un cargo completamente
async function eliminarCargo(id) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.execute('DELETE FROM cargos WHERE id = ?', [id]);
    console.log(`✅ Cargo con ID ${id} eliminado exitosamente`);
    return true;
  } catch (error) {
    console.error(`❌ Error eliminando cargo con ID ${id}:`, error.message);
    return false;
  } finally {
    await connection.end();
  }
}

// Función para listar todos los cargos
async function listarCargos() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [cargos] = await connection.execute('SELECT * FROM cargos ORDER BY nombre ASC');
    return cargos;
  } catch (error) {
    console.error('❌ Error listando cargos:', error.message);
    return [];
  } finally {
    await connection.end();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupCargosTable();
}

module.exports = {
  setupCargosTable,
  agregarCargo,
  editarCargo,
  eliminarCargo,
  listarCargos
};

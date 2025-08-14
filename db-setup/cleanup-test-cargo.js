const { eliminarCargo } = require('./enhanced-cargos');
const { checkConnectionHealth } = require('./connection-manager');

async function cleanupTestCargo() {
  try {
    console.log('🧹 Limpiando cargo de prueba...\n');
    
    // Verificar conexión
    const isHealthy = await checkConnectionHealth();
    if (!isHealthy) {
      console.error('❌ No se pudo conectar a la base de datos');
      return;
    }
    
    // Eliminar el cargo de prueba (ID: 9)
    const cargoId = 9;
    await eliminarCargo(cargoId);
    
    console.log('✅ Cargo de prueba eliminado exitosamente');
    
  } catch (error) {
    console.error('❌ Error eliminando cargo de prueba:', error.message);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupTestCargo();
}

module.exports = cleanupTestCargo;

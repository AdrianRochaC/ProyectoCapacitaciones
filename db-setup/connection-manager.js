const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway',
  // Configuraciones para mejorar la estabilidad de la conexión
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  // Pool de conexiones para mejor rendimiento
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true
};

// Pool de conexiones
let pool = null;

// Inicializar el pool de conexiones
function initializePool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
    console.log('🔌 Pool de conexiones inicializado');
  }
  return pool;
}

// Obtener una conexión del pool
async function getConnection() {
  const connectionPool = initializePool();
  try {
    const connection = await connectionPool.getConnection();
    return connection;
  } catch (error) {
    console.error('❌ Error obteniendo conexión:', error.message);
    throw error;
  }
}

// Ejecutar una consulta con manejo automático de conexión
async function executeQuery(query, params = []) {
  let connection = null;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Ejecutar múltiples consultas en una transacción
async function executeTransaction(queries) {
  let connection = null;
  try {
    connection = await getConnection();
    await connection.beginTransaction();
    
    const results = [];
    for (const query of queries) {
      const [result] = await connection.execute(query.sql, query.params || []);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('❌ Error en transacción:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Verificar la salud de la conexión
async function checkConnectionHealth() {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ Conexión a la base de datos saludable');
    return true;
  } catch (error) {
    console.error('❌ Error verificando conexión:', error.message);
    return false;
  }
}

// Cerrar el pool de conexiones
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('🔌 Pool de conexiones cerrado');
  }
}

// Función para reintentar operaciones
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`⚠️ Intento ${attempt} falló, reintentando en ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Backoff exponencial
    }
  }
}

// Función para ejecutar consultas con reintento automático
async function executeQueryWithRetry(query, params = [], maxRetries = 3) {
  return retryOperation(async () => {
    return await executeQuery(query, params);
  }, maxRetries);
}

module.exports = {
  initializePool,
  getConnection,
  executeQuery,
  executeQueryWithRetry,
  executeTransaction,
  checkConnectionHealth,
  closePool,
  retryOperation,
  dbConfig
};

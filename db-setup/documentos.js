const mysql = require('mysql2/promise');

const setupDocumentsTables = async () => {
  const connection = await mysql.createConnection({
     host: 'trolley.proxy.rlwy.net',
     port: 17594,
     user: 'root',
     password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
     database: 'railway'
  });

  try {
    // Eliminar tablas si existen
    await connection.execute('DROP TABLE IF EXISTS document_targets');
    await connection.execute('DROP TABLE IF EXISTS documents');

    // Crear tabla documents
    const createDocumentsTable = `
      CREATE TABLE documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        filename TEXT NOT NULL,
        mimetype TEXT NOT NULL,
        size INT NOT NULL,
        user_id INT NULL,
        is_global BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.execute(createDocumentsTable);

    // Crear tabla de relación document_targets
    const createTargetsTable = `
      CREATE TABLE document_targets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        document_id INT NOT NULL,
        target_type ENUM('role', 'user') NOT NULL,
        target_value VARCHAR(64) NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await connection.execute(createTargetsTable);

    console.log('✅ Tablas documents y document_targets creadas exitosamente');
  } catch (error) {
    console.error('❌ Error configurando tablas de documentos:', error);
  } finally {
    await connection.end();
  }
};

if (require.main === module) {
  setupDocumentsTables();
}

module.exports = setupDocumentsTables; 

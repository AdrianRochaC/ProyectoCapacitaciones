# Sistema de Gestión de Base de Datos - Proyecto Capacitaciones

## 📋 Descripción General

Este directorio contiene todos los scripts y herramientas para la configuración, gestión y mantenimiento de la base de datos del sistema de capacitaciones.

## 🚀 Funcionalidades Implementadas

### ✅ Sistema Completo de Base de Datos
- **Tablas principales**: usuarios, cargos, courses, documents, notifications, etc.
- **Relaciones**: Integridad referencial completa entre todas las tablas
- **Índices**: Optimizados para consultas rápidas
- **Caracteres**: Soporte completo para UTF-8

### ✅ Gestión Avanzada de Cargos
- **Estadísticas detalladas**: Empleados, cursos, documentos por cargo
- **Métricas de rendimiento**: Porcentajes de aprobación, progreso de cursos
- **Gestión CRUD**: Crear, leer, actualizar, eliminar cargos
- **Validaciones**: Prevención de duplicados y dependencias

### ✅ Gestión de Conexiones Mejorada
- **Pool de conexiones**: Mejor rendimiento y estabilidad
- **Reintentos automáticos**: Manejo robusto de errores de conexión
- **Health checks**: Verificación de salud de la conexión
- **Transacciones**: Soporte para operaciones atómicas

## 📁 Archivos Principales

### 🔧 Configuración y Setup
- `setup-complete-database.js` - Configuración completa de la base de datos
- `setup-cargos.js` - Configuración específica de cargos
- `connection-manager.js` - Gestor de conexiones mejorado

### 📊 Gestión de Cargos
- `enhanced-cargos.js` - Funciones avanzadas para gestión de cargos
- `test-cargos-stats.js` - Script de pruebas para estadísticas
- `cleanup-test-cargo.js` - Limpieza de datos de prueba

### 🔍 Verificación y Mantenimiento
- `verify-system.js` - Verificación completa del sistema
- `system-status.js` - Estado actual del sistema
- `optimize-system.js` - Optimización de rendimiento

## 🛠️ Uso de los Scripts

### 1. Configuración Inicial
```bash
# Configurar toda la base de datos desde cero
node setup-complete-database.js

# Solo configurar cargos
node setup-cargos.js
```

### 2. Gestión de Cargos
```bash
# Ver estadísticas generales de cargos
node enhanced-cargos.js

# Probar funcionalidades de cargos
node test-cargos-stats.js

# Limpiar datos de prueba
node cleanup-test-cargo.js
```

### 3. Verificación del Sistema
```bash
# Verificar estado completo del sistema
node verify-system.js

# Verificar estado del sistema
node system-status.js

# Optimizar rendimiento
node optimize-system.js
```

## 📊 Funcionalidades de Estadísticas de Cargos

### Estadísticas Generales
- **Total de empleados** por cargo
- **Empleados activos/inactivos**
- **Cursos asignados** al cargo
- **Documentos disponibles** para el cargo
- **Porcentaje de aprobación** de cursos

### Estadísticas Detalladas
- **Lista completa de empleados** con su progreso
- **Detalles de cursos** con métricas de participación
- **Documentos asociados** con información de tamaño y autor
- **Métricas de progreso** con puntuaciones promedio

### Funciones Disponibles
```javascript
// Obtener estadísticas de todos los cargos
const cargosStats = await getAllCargosStats();

// Obtener estadísticas detalladas de un cargo específico
const stats = await getCargoStats(cargoId);

// Crear un nuevo cargo
const nuevoId = await crearCargo(nombre, descripcion);

// Actualizar un cargo existente
await actualizarCargo(id, nombre, descripcion);

// Eliminar un cargo (con validaciones)
await eliminarCargo(id);
```

## 🔌 Gestión de Conexiones

### Características del Pool de Conexiones
- **Límite de conexiones**: 10 conexiones simultáneas
- **Timeouts**: 60 segundos para adquisición y ejecución
- **Reconexión automática**: Manejo de desconexiones
- **Health checks**: Verificación periódica de conexión

### Funciones de Conexión
```javascript
// Obtener una conexión del pool
const connection = await getConnection();

// Ejecutar consulta con manejo automático
const results = await executeQuery(sql, params);

// Ejecutar consulta con reintentos
const results = await executeQueryWithRetry(sql, params, maxRetries);

// Ejecutar transacción
const results = await executeTransaction(queries);

// Verificar salud de la conexión
const isHealthy = await checkConnectionHealth();
```

## 📈 Métricas y Reportes

### Métricas por Cargo
- **Empleados**: Total, activos, inactivos
- **Cursos**: Total, promedio de intentos, tiempo límite
- **Documentos**: Total, globales, tamaño en MB
- **Progreso**: Aprobados, reprobados, puntuación promedio

### Cálculos Automáticos
- **Porcentaje de empleados activos**
- **Porcentaje de aprobación de cursos**
- **Promedio de puntuaciones**
- **Tamaño total de documentos**

## 🛡️ Validaciones y Seguridad

### Validaciones de Cargos
- **Nombres únicos**: Prevención de duplicados
- **Dependencias**: Verificación antes de eliminar
- **Campos requeridos**: Validación de datos obligatorios
- **Integridad referencial**: Protección de relaciones

### Manejo de Errores
- **Reintentos automáticos**: Para errores de conexión
- **Rollback de transacciones**: En caso de fallos
- **Logging detallado**: Para debugging
- **Mensajes informativos**: Para el usuario

## 🔄 Mantenimiento

### Tareas Recomendadas
1. **Verificación semanal**: Ejecutar `verify-system.js`
2. **Optimización mensual**: Ejecutar `optimize-system.js`
3. **Backup regular**: Exportar datos importantes
4. **Monitoreo**: Revisar logs de conexión

### Limpieza de Datos
- **Datos de prueba**: Usar `cleanup-test-cargo.js`
- **Registros antiguos**: Limpiar logs y notificaciones
- **Archivos temporales**: Eliminar uploads no utilizados

## 📞 Soporte

### Problemas Comunes
1. **Error de conexión**: Verificar configuración de red
2. **Timeout**: Aumentar límites en `connection-manager.js`
3. **Memoria**: Reducir límite de conexiones del pool
4. **Rendimiento**: Ejecutar optimización del sistema

### Logs y Debugging
- Todos los scripts incluyen logging detallado
- Errores se muestran con stack trace completo
- Conexiones se monitorean automáticamente

## 🎯 Próximas Mejoras

- [ ] Dashboard web para estadísticas en tiempo real
- [ ] Exportación de reportes a PDF/Excel
- [ ] Notificaciones automáticas de métricas
- [ ] Integración con sistemas externos
- [ ] API REST para gestión remota

---

**Desarrollado para el Sistema de Capacitaciones**  
*Versión: 2.0 - Gestión Avanzada de Cargos*

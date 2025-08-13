# 🗄️ Configuración de Base de Datos - Proyecto Capacitaciones

Este directorio contiene todos los scripts necesarios para configurar la base de datos del proyecto de capacitaciones.

## 📁 Archivos Disponibles

### 🚀 `setup-complete-database.js` - **ARCHIVO PRINCIPAL**
**Script consolidado que crea TODAS las tablas de una vez.**

**Incluye:**
- ✅ Tabla de cargos (nueva)
- ✅ Tabla de usuarios
- ✅ Tabla de cursos y preguntas
- ✅ Tabla de progreso
- ✅ Tabla de documentos y targets
- ✅ Tabla de preferencias de usuario
- ✅ Tabla de notificaciones
- ✅ Tabla de bitácora (global y personal)

**Uso:**
```bash
cd db-setup
node setup-complete-database.js
```

### 📋 `setup-cargos.js` - **GESTIÓN DE CARGOS**
**Script específico para la gestión de cargos dinámica.**

**Funciones incluidas:**
- `setupCargosTable()` - Crear tabla y cargos por defecto
- `agregarCargo(nombre, descripcion)` - Agregar nuevo cargo
- `editarCargo(id, nombre, descripcion)` - Editar cargo existente
- `eliminarCargo(id)` - Eliminar cargo completamente
- `listarCargos()` - Listar todos los cargos

**Uso:**
```bash
# Solo crear tabla de cargos
node setup-cargos.js

# Usar funciones en otros archivos
const { agregarCargo, listarCargos } = require('./setup-cargos.js');
```

## 🎯 Características del Sistema de Cargos

### 📊 Estructura de la Tabla `cargos`
```sql
CREATE TABLE cargos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 🔢 Cargos por Defecto
1. **Admin** - Administrador del sistema
2. **Gerente** - Gerente de departamento
3. **Tecnología** - Personal de tecnología e informática
4. **Contabilidad** - Personal de contabilidad
5. **Compras** - Personal de compras
6. **Recursos Humanos** - Personal de RRHH
7. **Atención al Cliente** - Personal de atención al cliente
8. **Ventas** - Personal de ventas
9. **Operativo** - Personal operativo
10. **Logística** - Personal de logística y almacén

## 🚀 Instalación y Configuración

### 1. **Instalar Dependencias**
```bash
cd db-setup
npm install
```

### 2. **Configurar Base de Datos**
Asegúrate de que las credenciales en `dbConfig` sean correctas:
```javascript
const dbConfig = {
  host: 'trolley.proxy.rlwy.net',
  port: 17594,
  user: 'root',
  password: 'CEgMeCUPsqySFOidbBiATJoUvEbEdEyZ',
  database: 'railway'
};
```

### 3. **Ejecutar Script Principal**
```bash
node setup-complete-database.js
```

## 🔧 Uso Avanzado

### Agregar Nuevo Cargo Programáticamente
```javascript
const { agregarCargo } = require('./setup-cargos.js');

// Agregar cargo de Marketing
await agregarCargo(
  'Marketing', 
  'Personal de marketing y publicidad'
);
```

### Editar Cargo Existente
```javascript
const { editarCargo } = require('./setup-cargos.js');

// Cambiar descripción del cargo de Ventas
await editarCargo(
  9, // ID del cargo de Ventas
  'Ventas', 
  'Personal de ventas y atención comercial'
);
```

### Listar Todos los Cargos
```javascript
const { listarCargos } = require('./setup-cargos.js');

const cargos = await listarCargos();
console.log('Cargos disponibles:', cargos);
```

## ⚠️ Consideraciones Importantes

### 🔄 **Orden de Ejecución**
1. **Primero**: Ejecutar `setup-complete-database.js` para crear toda la estructura
2. **Después**: Usar `setup-cargos.js` para gestiones específicas de cargos

### 🗑️ **Eliminación de Datos**
- Los scripts **ELIMINAN** las tablas existentes antes de crearlas
- **¡CUIDADO!** Esto borrará todos los datos existentes
- Hacer backup antes de ejecutar en producción

### 🔗 **Relaciones entre Tablas**
- La tabla `usuarios` ahora tiene `cargo_id` que referencia `cargos(id)`
- Los documentos se asignan por `rol` (que puede ser el nombre del cargo)
- Las preferencias se vinculan directamente con `usuarios(id)`

## 📊 Ventajas del Nuevo Sistema

### ✅ **Antes (Sistema Fijo)**
- Roles hardcodeados en el código
- Difícil de modificar sin tocar código
- No había jerarquía de cargos

### 🚀 **Ahora (Sistema Dinámico)**
- Cargos gestionables desde la base de datos
- Fácil agregar/editar/eliminar cargos
- Sistema de prioridades para jerarquía
- Cargos inactivos (soft delete)
- Auditoría de cambios (timestamps)

## 🎯 Próximos Pasos

1. **Ejecutar** `setup-complete-database.js`
2. **Verificar** que todas las tablas se crearon correctamente
3. **Integrar** el sistema de cargos en el frontend
4. **Crear** interfaz de administración para gestionar cargos
5. **Migrar** usuarios existentes para usar el nuevo sistema

## 🆘 Solución de Problemas

### Error: "Access denied for user"
- Verificar credenciales en `dbConfig`
- Asegurar que el usuario tenga permisos en la base de datos

### Error: "Table already exists"
- Los scripts eliminan tablas automáticamente
- Si persiste, verificar que no haya procesos bloqueando

### Error: "Foreign key constraint fails"
- Verificar que las tablas se creen en el orden correcto
- Los scripts ya manejan esto automáticamente

---

**🎉 ¡Tu base de datos está lista para el sistema de capacitaciones con gestión dinámica de cargos!**

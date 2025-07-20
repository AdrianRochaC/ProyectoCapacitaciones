# Proyecto de Capacitaciones

Sistema de gestión de capacitaciones con soporte para tema claro y oscuro.

## Características

- **Tema Claro y Oscuro**: Sistema completo de temas con transiciones suaves
- **Interfaz Moderna**: Diseño responsive y profesional
- **Gestión de Usuarios**: Administración completa de cuentas
- **Sistema de Cursos**: Creación y gestión de contenido educativo
- **Bitácora**: Seguimiento de tareas y progreso
- **Dashboard**: Panel de control con estadísticas
- **Notificaciones**: Sistema de alertas en tiempo real

## Temas Disponibles

### Tema Claro (Por defecto)
- Fondo claro con gradientes suaves
- Colores vibrantes y profesionales
- Excelente legibilidad

### Tema Oscuro
- Fondo oscuro para reducir la fatiga visual
- Colores adaptados para uso nocturno
- Contraste optimizado

## Cómo Cambiar el Tema

### Opción 1: Botón de Tema
- Busca el botón con ícono de luna/sol en la interfaz
- Haz clic para alternar entre temas
- El tema se guarda automáticamente

### Opción 2: Programáticamente
```javascript
import { setTheme, toggleTheme } from './utils/theme';

// Cambiar a tema específico
setTheme('dark'); // o 'light'

// Alternar entre temas
toggleTheme();
```

## Estructura de Variables CSS

El sistema utiliza variables CSS para manejar los temas:

```css
:root {
  /* Tema claro */
  --bg-primary: #f8fafc;
  --text-primary: #203a43;
  --border-primary: #e3eaf2;
  /* ... más variables */
}

[data-theme="dark"] {
  /* Tema oscuro */
  --bg-primary: #0f1419;
  --text-primary: #e2e8f0;
  --border-primary: #334155;
  /* ... más variables */
}
```

## Archivos Actualizados

### CSS Base
- `src/index.css` - Variables CSS y configuración base
- `src/utils/theme.js` - Utilidades para manejo de temas
- `src/components/ThemeToggle.jsx` - Componente de cambio de tema
- `src/components/ThemeToggle.css` - Estilos del botón de tema

### Páginas Actualizadas
- `src/pages/Home.css`
- `src/pages/Dashboard.css`
- `src/pages/AdminBitacora.css`
- `src/pages/Login.css`
- `src/pages/Register.css`
- `src/pages/CoursesPage.css`
- `src/pages/Bitacora.css`
- `src/pages/DetailPage.css`
- `src/pages/AdminCoursesPage.css`
- `src/pages/Perfil.css`
- `src/pages/Cuentas.css`

### Componentes Actualizados
- `src/components/LoadingScreen/Menu.css`
- `src/components/LoadingScreen/AdminMenu.css`
- `src/components/LoadingScreen/LoadingScreen.css`
- `src/components/Notifications/Notifications.css`

## Instalación y Uso

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Ejecuta el servidor de desarrollo: `npm run dev`
4. El tema se inicializa automáticamente

## Personalización

Para personalizar los temas, modifica las variables CSS en `src/index.css`:

```css
:root {
  /* Personaliza los colores del tema claro */
  --bg-primary: #tu-color;
  --text-primary: #tu-color;
}

[data-theme="dark"] {
  /* Personaliza los colores del tema oscuro */
  --bg-primary: #tu-color;
  --text-primary: #tu-color;
}
```

## Compatibilidad

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Dispositivos móviles

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

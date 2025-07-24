// preferencesApi.js - Servicio para manejar preferencias de usuario
const API_BASE_URL = 'http://localhost:3001/api';

// Función para obtener el token de autenticación
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
  const token = getAuthToken();
  return token && token.length > 0;
};

// Función para hacer peticiones autenticadas
const makeAuthenticatedRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No hay token de autenticación');
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Obtener preferencias del usuario
export const getUserPreferences = async () => {
  // Si no está autenticado, usar localStorage
  if (!isAuthenticated()) {
    console.log('Usuario no autenticado, usando preferencias locales');
    return loadPreferencesFromLocalStorage();
  }

  try {
    const response = await makeAuthenticatedRequest('/user-preferences');
    return response.preferences;
  } catch (error) {
    console.error('Error obteniendo preferencias:', error);
    // Retornar preferencias por defecto si hay error
    return {
      theme: 'dark',
      color_scheme: 'default',
      font_size: 'medium',
      font_family: 'inter',
      spacing: 'normal',
      animations: 'enabled',
      background_type: 'color',
      background_image_url: null,
      background_color: 'default'
    };
  }
};

// Actualizar preferencias del usuario
export const updateUserPreferences = async (preferences) => {
  // Si no está autenticado, solo guardar en localStorage
  if (!isAuthenticated()) {
    console.log('Usuario no autenticado, guardando solo en localStorage');
    syncPreferencesWithLocalStorage(preferences);
    return preferences;
  }

  try {
    const response = await makeAuthenticatedRequest('/user-preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
    return response.preferences;
  } catch (error) {
    console.error('Error actualizando preferencias:', error);
    // Si falla la API, guardar en localStorage como respaldo
    syncPreferencesWithLocalStorage(preferences);
    throw error;
  }
};

// Resetear preferencias a valores por defecto
export const resetUserPreferences = async () => {
  // Si no está autenticado, resetear solo localStorage
  if (!isAuthenticated()) {
    console.log('Usuario no autenticado, reseteando solo localStorage');
    const defaultPreferences = {
      theme: 'dark',
      color_scheme: 'default',
      font_size: 'medium',
      font_family: 'inter',
      spacing: 'normal',
      animations: 'enabled',
      background_type: 'color',
      background_image_url: null,
      background_color: 'default'
    };
    syncPreferencesWithLocalStorage(defaultPreferences);
    return defaultPreferences;
  }

  try {
    const response = await makeAuthenticatedRequest('/user-preferences/reset', {
      method: 'POST'
    });
    return response.preferences;
  } catch (error) {
    console.error('Error reseteando preferencias:', error);
    throw error;
  }
};

// Función para sincronizar preferencias con localStorage
export const syncPreferencesWithLocalStorage = (preferences) => {
  try {
    // Guardar en localStorage como respaldo
    localStorage.setItem('theme', preferences.theme);
    localStorage.setItem('colorScheme', preferences.color_scheme);
    localStorage.setItem('fontSize', preferences.font_size);
    localStorage.setItem('fontFamily', preferences.font_family);
    localStorage.setItem('spacing', preferences.spacing);
    localStorage.setItem('animations', preferences.animations);
    localStorage.setItem('backgroundType', preferences.background_type);
    
    // Manejar imagen de fondo con validación de tamaño
    const imageUrl = preferences.background_image_url || '';
    if (imageUrl && imageUrl.startsWith('data:')) {
      // Verificar tamaño de la imagen base64
      const base64Size = Math.ceil((imageUrl.length * 3) / 4);
      const maxSize = 4 * 1024 * 1024; // 4MB máximo para localStorage
      
      if (base64Size > maxSize) {
        console.warn('Imagen demasiado grande para localStorage, omitiendo guardado local');
        // No guardar la imagen en localStorage, pero mantener las otras preferencias
        localStorage.setItem('backgroundImageUrl', '');
        localStorage.setItem('backgroundImageTooLarge', 'true');
      } else {
        localStorage.setItem('backgroundImageUrl', imageUrl);
        localStorage.removeItem('backgroundImageTooLarge');
      }
    } else {
      localStorage.setItem('backgroundImageUrl', imageUrl);
      localStorage.removeItem('backgroundImageTooLarge');
    }
    
    localStorage.setItem('backgroundColor', preferences.background_color);
  } catch (error) {
    console.error('Error guardando en localStorage:', error);
    
    // Si es error de cuota, intentar limpiar localStorage y guardar solo lo esencial
    if (error.name === 'QuotaExceededError') {
      try {
        // Limpiar localStorage
        localStorage.clear();
        
        // Guardar solo las preferencias básicas (sin imagen)
        const basicPreferences = {
          theme: preferences.theme,
          color_scheme: preferences.color_scheme,
          font_size: preferences.font_size,
          font_family: preferences.font_family,
          spacing: preferences.spacing,
          animations: preferences.animations,
          background_type: 'color', // Forzar a color si no hay espacio
          background_image_url: '',
          background_color: preferences.background_color
        };
        
        localStorage.setItem('theme', basicPreferences.theme);
        localStorage.setItem('colorScheme', basicPreferences.color_scheme);
        localStorage.setItem('fontSize', basicPreferences.font_size);
        localStorage.setItem('fontFamily', basicPreferences.font_family);
        localStorage.setItem('spacing', basicPreferences.spacing);
        localStorage.setItem('animations', basicPreferences.animations);
        localStorage.setItem('backgroundType', 'color');
        localStorage.setItem('backgroundImageUrl', '');
        localStorage.setItem('backgroundColor', basicPreferences.background_color);
        localStorage.setItem('storageCleared', 'true');
        
        console.log('localStorage limpiado y guardadas preferencias básicas');
      } catch (cleanupError) {
        console.error('Error limpiando localStorage:', cleanupError);
        throw new Error('No se pudo guardar las preferencias. El almacenamiento local está lleno.');
      }
    } else {
      throw error;
    }
  }
};

// Función para cargar preferencias desde localStorage (respaldo)
export const loadPreferencesFromLocalStorage = () => {
  // Verificar si se limpió el almacenamiento
  const storageCleared = localStorage.getItem('storageCleared') === 'true';
  const imageTooLarge = localStorage.getItem('backgroundImageTooLarge') === 'true';
  
  return {
    theme: localStorage.getItem('theme') || 'dark',
    color_scheme: localStorage.getItem('colorScheme') || 'default',
    font_size: localStorage.getItem('fontSize') || 'medium',
    font_family: localStorage.getItem('fontFamily') || 'inter',
    spacing: localStorage.getItem('spacing') || 'normal',
    animations: localStorage.getItem('animations') || 'enabled',
    background_type: storageCleared || imageTooLarge ? 'color' : (localStorage.getItem('backgroundType') || 'color'),
    background_image_url: storageCleared || imageTooLarge ? null : (localStorage.getItem('backgroundImageUrl') || null),
    background_color: localStorage.getItem('backgroundColor') || 'default'
  };
};

// Función para aplicar preferencias al DOM
export const applyPreferencesToDOM = (preferences) => {
  document.documentElement.setAttribute('data-theme', preferences.theme);
  document.documentElement.setAttribute('data-color-scheme', preferences.color_scheme);
  document.documentElement.setAttribute('data-font-size', preferences.font_size);
  document.documentElement.setAttribute('data-font-family', preferences.font_family);
  document.documentElement.setAttribute('data-spacing', preferences.spacing);
  document.documentElement.setAttribute('data-animations', preferences.animations);
  
  // Aplicar fondo
  if (preferences.background_type === 'image' && preferences.background_image_url) {
    document.documentElement.style.setProperty('--background-image', `url(${preferences.background_image_url})`);
    document.documentElement.setAttribute('data-background-type', 'image');
  } else {
    document.documentElement.style.removeProperty('--background-image');
    document.documentElement.setAttribute('data-background-type', 'color');
    document.documentElement.setAttribute('data-background-color', preferences.background_color);
  }
};

// Función para inicializar preferencias (cargar desde DB o localStorage)
export const initializePreferences = async () => {
  try {
    // Si no está autenticado, usar localStorage
    if (!isAuthenticated()) {
      console.log('Usuario no autenticado, inicializando desde localStorage');
      const localPreferences = loadPreferencesFromLocalStorage();
      applyPreferencesToDOM(localPreferences);
      return localPreferences;
    }

    // Intentar cargar desde la base de datos
    const preferences = await getUserPreferences();
    syncPreferencesWithLocalStorage(preferences);

    // Si tiene imagen de fondo, cargarla y aplicarla
    if (preferences.has_background_image) {
      const token = getAuthToken();
      const res = await fetch('http://localhost:3001/api/user-preferences/background-image', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const imageUrl = URL.createObjectURL(blob);
        preferences.background_type = 'image';
        preferences.background_image_url = imageUrl;
        applyPreferencesToDOM(preferences);
        return preferences;
      } else if (res.status === 404) {
        // No hay imagen, continuar sin error
        preferences.background_type = 'color';
        preferences.background_image_url = '';
        applyPreferencesToDOM(preferences);
        return preferences;
      }
    }
    // Si no hay imagen, aplicar normalmente
    applyPreferencesToDOM(preferences);
    return preferences;
  } catch (error) {
    console.warn('No se pudo cargar desde DB, usando localStorage:', error);
    // Si falla, usar localStorage como respaldo
    const localPreferences = loadPreferencesFromLocalStorage();
    applyPreferencesToDOM(localPreferences);
    return localPreferences;
  }
};

// Función para verificar el estado de autenticación
export const getAuthStatus = () => {
  return {
    isAuthenticated: isAuthenticated(),
    hasToken: !!getAuthToken()
  };
}; 
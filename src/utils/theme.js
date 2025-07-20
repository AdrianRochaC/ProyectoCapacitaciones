// src/utils/theme.js

// Función para obtener el tema actual
export const getCurrentTheme = () => {
  return localStorage.getItem('theme') || 'dark'; // Cambiado a 'dark' por defecto
};

// Función para establecer el tema
export const setTheme = (theme) => {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
};

// Función para cambiar entre temas
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

// Función para inicializar el tema
export const initializeTheme = () => {
  const savedTheme = getCurrentTheme();
  setTheme(savedTheme);
};

// Función para obtener el ícono del tema
export const getThemeIcon = (theme) => {
  return theme === 'light' ? '🌙' : '☀️';
};

// Función para obtener el texto del tema
export const getThemeText = (theme) => {
  return theme === 'light' ? 'Modo Oscuro' : 'Modo Claro';
}; 
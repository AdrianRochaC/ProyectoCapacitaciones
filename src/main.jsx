import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initializePreferences } from './utils/preferencesApi.js'

// Inicializar preferencias de usuario al cargar la aplicación
const initializeApp = async () => {
  try {
    // Intentar cargar preferencias desde la base de datos
    await initializePreferences();
  } catch (error) {
    console.warn('No se pudieron cargar las preferencias desde el servidor:', error);
    
    // Usar localStorage como respaldo
    const theme = localStorage.getItem('theme') || 'dark';
    const colorScheme = localStorage.getItem('colorScheme') || 'default';
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    const fontFamily = localStorage.getItem('fontFamily') || 'inter';
    const spacing = localStorage.getItem('spacing') || 'normal';
    const animations = localStorage.getItem('animations') || 'enabled';
    const backgroundType = localStorage.getItem('backgroundType') || 'color';
    const backgroundImageUrl = localStorage.getItem('backgroundImageUrl') || null;
    const backgroundColor = localStorage.getItem('backgroundColor') || 'default';

    // Aplicar configuraciones al DOM
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    document.documentElement.setAttribute('data-font-size', fontSize);
    document.documentElement.setAttribute('data-font-family', fontFamily);
    document.documentElement.setAttribute('data-spacing', spacing);
    document.documentElement.setAttribute('data-animations', animations);
    
    // Aplicar fondo
    if (backgroundType === 'image' && backgroundImageUrl) {
      document.documentElement.style.setProperty('--background-image', `url(${backgroundImageUrl})`);
      document.documentElement.setAttribute('data-background-type', 'image');
    } else {
      document.documentElement.style.removeProperty('--background-image');
      document.documentElement.setAttribute('data-background-type', 'color');
      document.documentElement.setAttribute('data-background-color', backgroundColor);
    }
  }
};

// Inicializar y renderizar la aplicación
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
});

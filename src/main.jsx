import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initializeTheme } from './utils/theme.js'

// Función para inicializar todas las configuraciones de personalización
const initializePersonalization = () => {
  // Inicializar tema
  initializeTheme();
  
  // Inicializar esquema de color
  const savedColorScheme = localStorage.getItem('colorScheme') || 'default';
  document.documentElement.setAttribute('data-color-scheme', savedColorScheme);
  
  // Inicializar tamaño de fuente
  const savedFontSize = localStorage.getItem('fontSize') || 'medium';
  document.documentElement.setAttribute('data-font-size', savedFontSize);
  
  // Inicializar familia de fuente
  const savedFontFamily = localStorage.getItem('fontFamily') || 'inter';
  document.documentElement.setAttribute('data-font-family', savedFontFamily);
  
  // Inicializar espaciado
  const savedSpacing = localStorage.getItem('spacing') || 'normal';
  document.documentElement.setAttribute('data-spacing', savedSpacing);
  
  // Inicializar animaciones
  const savedAnimations = localStorage.getItem('animations') || 'enabled';
  document.documentElement.setAttribute('data-animations', savedAnimations);
};

// Inicializar configuraciones antes de renderizar
initializePersonalization();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

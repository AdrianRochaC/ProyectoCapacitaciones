import React, { useState, useEffect } from 'react';
import { X, Palette, Moon, Sun, Settings, Type, Eye, Zap } from 'lucide-react';
import './PersonalizationModal.css';

const PersonalizationModal = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [colorScheme, setColorScheme] = useState('default');
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('inter');
  const [spacing, setSpacing] = useState('normal');
  const [animations, setAnimations] = useState('enabled');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedColorScheme = localStorage.getItem('colorScheme') || 'default';
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const savedFontFamily = localStorage.getItem('fontFamily') || 'inter';
    const savedSpacing = localStorage.getItem('spacing') || 'normal';
    const savedAnimations = localStorage.getItem('animations') || 'enabled';
    
    setCurrentTheme(savedTheme);
    setSelectedTheme(savedTheme);
    setColorScheme(savedColorScheme);
    setFontSize(savedFontSize);
    setFontFamily(savedFontFamily);
    setSpacing(savedSpacing);
    setAnimations(savedAnimations);
    
    // Aplicar configuraciones guardadas
    applySettings(savedTheme, savedColorScheme, savedFontSize, savedFontFamily, savedSpacing, savedAnimations);
  }, []);

  const applySettings = (theme, scheme, size, family, space, anim) => {
    // Aplicar tema
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Aplicar esquema de color
    localStorage.setItem('colorScheme', scheme);
    document.documentElement.setAttribute('data-color-scheme', scheme);
    
    // Aplicar tamaño de fuente
    localStorage.setItem('fontSize', size);
    document.documentElement.setAttribute('data-font-size', size);
    
    // Aplicar familia de fuente
    localStorage.setItem('fontFamily', family);
    document.documentElement.setAttribute('data-font-family', family);
    
    // Aplicar espaciado
    localStorage.setItem('spacing', space);
    document.documentElement.setAttribute('data-spacing', space);
    
    // Aplicar animaciones
    localStorage.setItem('animations', anim);
    document.documentElement.setAttribute('data-animations', anim);
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    setCurrentTheme(theme);
    applySettings(theme, colorScheme, fontSize, fontFamily, spacing, animations);
  };

  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    applySettings(selectedTheme, scheme, fontSize, fontFamily, spacing, animations);
  };

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    applySettings(selectedTheme, colorScheme, size, fontFamily, spacing, animations);
  };

  const handleFontFamilyChange = (family) => {
    setFontFamily(family);
    applySettings(selectedTheme, colorScheme, fontSize, family, spacing, animations);
  };

  const handleSpacingChange = (space) => {
    setSpacing(space);
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, space, animations);
  };

  const handleAnimationsChange = (anim) => {
    setAnimations(anim);
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, spacing, anim);
  };

  const themes = [
    {
      id: 'light',
      name: 'Tema Claro',
      icon: <Sun size={24} />,
      description: 'Colores claros y brillantes',
      preview: 'bg-light-preview'
    },
    {
      id: 'dark',
      name: 'Tema Oscuro',
      icon: <Moon size={24} />,
      description: 'Colores oscuros y elegantes',
      preview: 'bg-dark-preview'
    }
  ];

  const colorSchemes = [
    {
      id: 'default',
      name: 'Predeterminado',
      description: 'Colores estándar del tema',
      preview: 'scheme-default'
    },
    {
      id: 'monochrome',
      name: 'Monocromático',
      description: 'Tonos de gris elegantes',
      preview: 'scheme-monochrome'
    },
    {
      id: 'vibrant',
      name: 'Vibrante',
      description: 'Colores saturados y llamativos',
      preview: 'scheme-vibrant'
    },
    {
      id: 'pastel',
      name: 'Pastel',
      description: 'Colores suaves y relajantes',
      preview: 'scheme-pastel'
    },
    {
      id: 'neon',
      name: 'Neón',
      description: 'Colores brillantes y modernos',
      preview: 'scheme-neon'
    },
    {
      id: 'earth',
      name: 'Tierra',
      description: 'Tonos naturales y orgánicos',
      preview: 'scheme-earth'
    }
  ];

  const fontSizes = [
    {
      id: 'small',
      name: 'Pequeña',
      description: 'Texto más compacto',
      size: '0.9rem'
    },
    {
      id: 'medium',
      name: 'Normal',
      description: 'Tamaño estándar',
      size: '1rem'
    },
    {
      id: 'large',
      name: 'Grande',
      description: 'Texto más legible',
      size: '1.1rem'
    }
  ];

  const fontFamilies = [
    {
      id: 'inter',
      name: 'Inter',
      description: 'Moderno y legible',
      font: 'Inter, system-ui, sans-serif',
      preview: 'Aa'
    },
    {
      id: 'roboto',
      name: 'Roboto',
      description: 'Claro y profesional',
      font: 'Roboto, system-ui, sans-serif',
      preview: 'Aa'
    },
    {
      id: 'open-sans',
      name: 'Open Sans',
      description: 'Amigable y accesible',
      font: 'Open Sans, system-ui, sans-serif',
      preview: 'Aa'
    },
    {
      id: 'poppins',
      name: 'Poppins',
      description: 'Elegante y moderno',
      font: 'Poppins, system-ui, sans-serif',
      preview: 'Aa'
    },
    {
      id: 'montserrat',
      name: 'Montserrat',
      description: 'Geométrico y limpio',
      font: 'Montserrat, system-ui, sans-serif',
      preview: 'Aa'
    },
    {
      id: 'system',
      name: 'Sistema',
      description: 'Fuente del sistema',
      font: 'system-ui, -apple-system, sans-serif',
      preview: 'Aa'
    }
  ];

  const spacingOptions = [
    {
      id: 'compact',
      name: 'Compacto',
      description: 'Menos espacio entre elementos',
      spacing: '0.8'
    },
    {
      id: 'normal',
      name: 'Normal',
      description: 'Espaciado estándar',
      spacing: '1'
    },
    {
      id: 'comfortable',
      name: 'Cómodo',
      description: 'Más espacio para mejor legibilidad',
      spacing: '1.2'
    }
  ];

  const animationOptions = [
    {
      id: 'enabled',
      name: 'Activadas',
      description: 'Animaciones suaves',
      icon: '✨'
    },
    {
      id: 'reduced',
      name: 'Reducidas',
      description: 'Animaciones mínimas',
      icon: '⚡'
    },
    {
      id: 'disabled',
      name: 'Desactivadas',
      description: 'Sin animaciones',
      icon: '🚫'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="personalization-overlay" onClick={onClose}>
      <div className="personalization-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <Palette size={24} />
            <h2>Personalización</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Sección de Apariencia */}
          <div className="section">
            <h3>Apariencia</h3>
            <p className="section-description">
              Personaliza la apariencia de la aplicación según tus preferencias
            </p>
          </div>

          <div className="theme-options">
            {themes.map((theme) => (
              <div
                key={theme.id}
                className={`theme-option ${selectedTheme === theme.id ? 'selected' : ''}`}
                onClick={() => handleThemeChange(theme.id)}
              >
                <div className="theme-preview">
                  <div className={`preview-circle ${theme.preview}`}>
                    {theme.icon}
                  </div>
                </div>
                <div className="theme-info">
                  <h4>{theme.name}</h4>
                  <p>{theme.description}</p>
                </div>
                <div className="theme-status">
                  {selectedTheme === theme.id && (
                    <div className="selected-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Esquemas de Color */}
          <div className="section">
            <div className="section-header">
              <Palette size={20} />
              <h3>Esquemas de Color</h3>
            </div>
            <p className="section-description">
              Personaliza la paleta de colores de la aplicación
            </p>
          </div>

          <div className="color-scheme-options">
            {colorSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className={`color-scheme-option ${colorScheme === scheme.id ? 'selected' : ''}`}
                onClick={() => handleColorSchemeChange(scheme.id)}
              >
                <div className="color-scheme-preview">
                  <div className={`scheme-preview ${scheme.preview}`}>
                    <div className="color-dot color-primary"></div>
                    <div className="color-dot color-secondary"></div>
                    <div className="color-dot color-accent"></div>
                  </div>
                </div>
                <div className="color-scheme-info">
                  <h4>{scheme.name}</h4>
                  <p>{scheme.description}</p>
                </div>
                <div className="color-scheme-status">
                  {colorScheme === scheme.id && (
                    <div className="selected-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Tipografía */}
          <div className="section">
            <div className="section-header">
              <Type size={20} />
              <h3>Tipografía</h3>
            </div>
            <p className="section-description">
              Ajusta el tamaño del texto para mejor legibilidad
            </p>
          </div>

          <div className="font-size-options">
            {fontSizes.map((option) => (
              <div
                key={option.id}
                className={`font-size-option ${fontSize === option.id ? 'selected' : ''}`}
                onClick={() => handleFontSizeChange(option.id)}
              >
                <div className="font-preview" style={{ fontSize: option.size }}>
                  Aa
                </div>
                <div className="font-info">
                  <h4>{option.name}</h4>
                  <p>{option.description}</p>
                </div>
                <div className="font-status">
                  {fontSize === option.id && (
                    <div className="selected-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Fuentes */}
          <div className="section">
            <div className="section-header">
              <Type size={20} />
              <h3>Fuentes</h3>
            </div>
            <p className="section-description">
              Selecciona el tipo de fuente que prefieras
            </p>
          </div>

          <div className="font-family-options">
            {fontFamilies.map((option) => (
              <div
                key={option.id}
                className={`font-family-option ${fontFamily === option.id ? 'selected' : ''}`}
                onClick={() => handleFontFamilyChange(option.id)}
              >
                <div className="font-family-preview" style={{ fontFamily: option.font }}>
                  {option.preview}
                </div>
                <div className="font-family-info">
                  <h4>{option.name}</h4>
                  <p>{option.description}</p>
                </div>
                <div className="font-family-status">
                  {fontFamily === option.id && (
                    <div className="selected-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Espaciado */}
          <div className="section">
            <div className="section-header">
              <Eye size={20} />
              <h3>Espaciado</h3>
            </div>
            <p className="section-description">
              Controla el espacio entre elementos de la interfaz
            </p>
          </div>

          <div className="spacing-options">
            {spacingOptions.map((option) => (
              <div
                key={option.id}
                className={`spacing-option ${spacing === option.id ? 'selected' : ''}`}
                onClick={() => handleSpacingChange(option.id)}
              >
                <div className="spacing-preview">
                  <div className="spacing-dots" style={{ gap: `${option.spacing}rem` }}>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                </div>
                <div className="spacing-info">
                  <h4>{option.name}</h4>
                  <p>{option.description}</p>
                </div>
                <div className="spacing-status">
                  {spacing === option.id && (
                    <div className="selected-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sección de Animaciones */}
          <div className="section">
            <div className="section-header">
              <Zap size={20} />
              <h3>Animaciones</h3>
            </div>
            <p className="section-description">
              Personaliza las animaciones de la interfaz
            </p>
          </div>

          <div className="animation-options">
            {animationOptions.map((option) => (
              <div
                key={option.id}
                className={`animation-option ${animations === option.id ? 'selected' : ''}`}
                onClick={() => handleAnimationsChange(option.id)}
              >
                <div className="animation-preview">
                  <span className="animation-icon">{option.icon}</span>
                </div>
                <div className="animation-info">
                  <h4>{option.name}</h4>
                  <p>{option.description}</p>
                </div>
                <div className="animation-status">
                  {animations === option.id && (
                    <div className="selected-indicator">
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Información actual */}
          <div className="current-settings-info">
            <div className="info-card">
              <div className="info-icon">
                <Settings size={20} />
              </div>
              <div className="info-text">
                <span>Configuración actual:</span>
                <small>
                  {currentTheme === 'light' ? 'Claro' : 'Oscuro'} • 
                  {colorSchemes.find(c => c.id === colorScheme)?.name || 'Predeterminado'} • 
                  {fontSize === 'small' ? ' Pequeña' : fontSize === 'large' ? ' Grande' : ' Normal'} • 
                  {fontFamilies.find(f => f.id === fontFamily)?.name || 'Inter'} • 
                  {spacing === 'compact' ? ' Compacto' : spacing === 'comfortable' ? ' Cómodo' : ' Normal'} • 
                  {animations === 'enabled' ? ' Animaciones' : animations === 'reduced' ? ' Reducidas' : ' Sin animaciones'}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal; 
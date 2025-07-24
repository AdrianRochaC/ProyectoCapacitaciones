import React, { useState, useEffect, useRef } from 'react';
import { X, Palette, Moon, Sun, Settings, Type, Eye, Zap, Image, Upload, Info, Camera } from 'lucide-react';
import { getUserPreferences, updateUserPreferences, syncPreferencesWithLocalStorage, getAuthStatus } from '../utils/preferencesApi';
import './PersonalizationModal.css';

const PersonalizationModal = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [colorScheme, setColorScheme] = useState('default');
  const [fontSize, setFontSize] = useState('medium');
  const [fontFamily, setFontFamily] = useState('inter');
  const [spacing, setSpacing] = useState('normal');
  const [animations, setAnimations] = useState('enabled');
  const [backgroundType, setBackgroundType] = useState('color');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('default');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false, hasToken: false });
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const status = getAuthStatus();
      setAuthStatus(status);
      loadUserPreferences();
    }
  }, [isOpen]);

  const applySettings = (theme, scheme, size, family, space, anim, bgType, bgImage, bgColor) => {
    // Aplicar al DOM
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color-scheme', scheme);
    document.documentElement.setAttribute('data-font-size', size);
    document.documentElement.setAttribute('data-font-family', family);
    document.documentElement.setAttribute('data-spacing', space);
    document.documentElement.setAttribute('data-animations', anim);
    
    // Aplicar fondo
    if (bgType === 'image' && bgImage) {
      document.documentElement.style.setProperty('--background-image', `url(${bgImage})`);
      document.documentElement.setAttribute('data-background-type', 'image');
    } else {
      document.documentElement.style.removeProperty('--background-image');
      document.documentElement.setAttribute('data-background-type', 'color');
      document.documentElement.setAttribute('data-background-color', bgColor);
    }
  };

  const savePreferences = async (preferences) => {
    try {
      // Guardar en la base de datos o localStorage
      await updateUserPreferences(preferences);
      setError(null);
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      if (authStatus.isAuthenticated) {
        setError('No se pudieron guardar las preferencias en el servidor. Los cambios se mantendrán localmente.');
      }
    }
  };

  // Cambia handleFileUpload para enviar el archivo al backend
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('background_image', file);
    setUploadingImage(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/user-preferences/background-image', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      // Recargar preferencias para actualizar el fondo
      await loadUserPreferences();
    } catch (error) {
      setError('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Cambia loadUserPreferences para cargar la imagen del backend si existe
  const loadUserPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const preferences = await getUserPreferences();
      setCurrentTheme(preferences.theme);
      setSelectedTheme(preferences.theme);
      setColorScheme(preferences.color_scheme);
      setFontSize(preferences.font_size);
      setFontFamily(preferences.font_family);
      setSpacing(preferences.spacing);
      setAnimations(preferences.animations);
      setBackgroundType(preferences.background_type);
      setBackgroundColor(preferences.background_color);
      if (preferences.has_background_image) {
        const token = localStorage.getItem('authToken');
        const res = await fetch('/api/user-preferences/background-image', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const blob = await res.blob();
          const imageUrl = URL.createObjectURL(blob);
          setBackgroundImageUrl(imageUrl);
          applySettings(preferences.theme, preferences.color_scheme, preferences.font_size, preferences.font_family, preferences.spacing, preferences.animations, 'image', imageUrl, preferences.background_color);
        } else {
          setBackgroundImageUrl('');
          applySettings(preferences.theme, preferences.color_scheme, preferences.font_size, preferences.font_family, preferences.spacing, preferences.animations, preferences.background_type, '', preferences.background_color);
        }
      } else {
        setBackgroundImageUrl('');
        applySettings(preferences.theme, preferences.color_scheme, preferences.font_size, preferences.font_family, preferences.spacing, preferences.animations, preferences.background_type, '', preferences.background_color);
      }
    } catch (error) {
      setError('No se pudieron cargar las preferencias. Usando configuración local.');
      setBackgroundImageUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para convertir archivo a base64 (mantener para compatibilidad)
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Función para abrir el selector de archivos
  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const handleThemeChange = async (theme) => {
    setSelectedTheme(theme);
    setCurrentTheme(theme);
    
    const newPreferences = {
      theme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: spacing,
      animations: animations,
      background_type: backgroundType,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(theme, colorScheme, fontSize, fontFamily, spacing, animations, backgroundType, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleColorSchemeChange = async (scheme) => {
    setColorScheme(scheme);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: scheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: spacing,
      animations: animations,
      background_type: backgroundType,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, scheme, fontSize, fontFamily, spacing, animations, backgroundType, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleFontSizeChange = async (size) => {
    setFontSize(size);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: size,
      font_family: fontFamily,
      spacing: spacing,
      animations: animations,
      background_type: backgroundType,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, colorScheme, size, fontFamily, spacing, animations, backgroundType, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleFontFamilyChange = async (family) => {
    setFontFamily(family);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: family,
      spacing: spacing,
      animations: animations,
      background_type: backgroundType,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, colorScheme, fontSize, family, spacing, animations, backgroundType, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleSpacingChange = async (space) => {
    setSpacing(space);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: space,
      animations: animations,
      background_type: backgroundType,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, space, animations, backgroundType, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleAnimationsChange = async (anim) => {
    setAnimations(anim);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: spacing,
      animations: anim,
      background_type: backgroundType,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, spacing, anim, backgroundType, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleBackgroundTypeChange = async (type) => {
    setBackgroundType(type);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: spacing,
      animations: animations,
      background_type: type,
      background_image_url: backgroundImageUrl,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, spacing, animations, type, backgroundImageUrl, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleBackgroundImageChange = async (url) => {
    // Verificar tamaño de la imagen antes de enviar
    if (url && url.startsWith('data:')) {
      const base64Size = Math.ceil((url.length * 3) / 4);
      const maxApiSize = 8 * 1024 * 1024; // 8MB máximo para API
      
      if (base64Size > maxApiSize) {
        setError('La imagen es demasiado grande para guardar en el servidor. Se aplicará temporalmente.');
        // Aplicar la imagen temporalmente sin guardar en servidor
        setBackgroundImageUrl(url);
        applySettings(selectedTheme, colorScheme, fontSize, fontFamily, spacing, animations, 'image', url, backgroundColor);
        return;
      }
    }
    
    setBackgroundImageUrl(url);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: spacing,
      animations: animations,
      background_type: 'image',
      background_image_url: url,
      background_color: backgroundColor
    };
    
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, spacing, animations, 'image', url, backgroundColor);
    await savePreferences(newPreferences);
  };

  const handleBackgroundColorChange = async (color) => {
    setBackgroundColor(color);
    
    const newPreferences = {
      theme: selectedTheme,
      color_scheme: colorScheme,
      font_size: fontSize,
      font_family: fontFamily,
      spacing: spacing,
      animations: animations,
      background_type: 'color',
      background_image_url: backgroundImageUrl,
      background_color: color
    };
    
    applySettings(selectedTheme, colorScheme, fontSize, fontFamily, spacing, animations, 'color', backgroundImageUrl, color);
    await savePreferences(newPreferences);
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

  const backgroundColors = [
    {
      id: 'default',
      name: 'Predeterminado',
      description: 'Color del tema actual',
      color: 'var(--bg-primary)'
    },
    {
      id: 'black',
      name: 'Negro',
      description: 'Fondo completamente negro',
      color: '#000000'
    },
    {
      id: 'white',
      name: 'Blanco',
      description: 'Fondo completamente blanco',
      color: '#ffffff'
    },
    {
      id: 'blue',
      name: 'Azul',
      description: 'Fondo azul suave',
      color: '#1e3a8a'
    },
    {
      id: 'green',
      name: 'Verde',
      description: 'Fondo verde natural',
      color: '#065f46'
    },
    {
      id: 'purple',
      name: 'Púrpura',
      description: 'Fondo púrpura elegante',
      color: '#581c87'
    },
    {
      id: 'dark-purple',
      name: 'Púrpura Oscuro',
      description: 'Fondo púrpura intenso',
      color: '#4c1d95'
    },
    {
      id: 'light-purple',
      name: 'Púrpura Claro',
      description: 'Fondo púrpura suave',
      color: '#7c3aed'
    },
    {
      id: 'pink',
      name: 'Rosa',
      description: 'Fondo rosa vibrante',
      color: '#be185d'
    },
    {
      id: 'red',
      name: 'Rojo',
      description: 'Fondo rojo intenso',
      color: '#dc2626'
    },
    {
      id: 'orange',
      name: 'Naranja',
      description: 'Fondo naranja cálido',
      color: '#ea580c'
    },
    {
      id: 'yellow',
      name: 'Amarillo',
      description: 'Fondo amarillo brillante',
      color: '#ca8a04'
    },
    {
      id: 'teal',
      name: 'Verde Azulado',
      description: 'Fondo verde azulado',
      color: '#0d9488'
    },
    {
      id: 'indigo',
      name: 'Índigo',
      description: 'Fondo índigo profundo',
      color: '#3730a3'
    },
    {
      id: 'gray',
      name: 'Gris',
      description: 'Fondo gris elegante',
      color: '#374151'
    },
    {
      id: 'light-gray',
      name: 'Gris Claro',
      description: 'Fondo gris suave',
      color: '#6b7280'
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
          {isLoading && (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Cargando preferencias...</p>
            </div>
          )}

          {/* Información de estado de autenticación */}
          {!authStatus.isAuthenticated && (
            <div className="auth-info">
              <div className="info-card">
                <div className="info-icon">
                  <Info size={20} />
                </div>
                <div className="info-text">
                  <span>Modo local</span>
                  <small>
                    No estás autenticado. Los cambios se guardarán solo en este dispositivo. 
                    Inicia sesión para sincronizar tus preferencias entre dispositivos.
                  </small>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>⚠️ {error}</p>
            </div>
          )}

          {/* Información sobre almacenamiento */}
          {localStorage.getItem('storageCleared') === 'true' && (
            <div className="storage-info">
              <div className="info-card warning">
                <div className="info-icon">
                  <Info size={20} />
                </div>
                <div className="info-text">
                  <span>Almacenamiento optimizado</span>
                  <small>
                    El almacenamiento local estaba lleno y se ha limpiado automáticamente. 
                    Las imágenes de fondo se guardarán solo temporalmente.
                  </small>
                </div>
              </div>
            </div>
          )}

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

          {/* Sección de Fondo */}
          <div className="section">
            <div className="section-header">
              <Image size={20} />
              <h3>Fondo</h3>
            </div>
            <p className="section-description">
              Personaliza el fondo de la aplicación
            </p>
          </div>

          {/* Tipo de fondo */}
          <div className="background-type-options">
            <div className="background-type-option">
              <label className="radio-option">
                <input
                  type="radio"
                  name="backgroundType"
                  value="color"
                  checked={backgroundType === 'color'}
                  onChange={() => handleBackgroundTypeChange('color')}
                />
                <div className="radio-content">
                  <div className="radio-icon">🎨</div>
                  <div className="radio-info">
                    <h4>Color sólido</h4>
                    <p>Fondo con color personalizado</p>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="background-type-option">
              <label className="radio-option">
                <input
                  type="radio"
                  name="backgroundType"
                  value="image"
                  checked={backgroundType === 'image'}
                  onChange={() => handleBackgroundTypeChange('image')}
                />
                <div className="radio-content">
                  <div className="radio-icon">🖼️</div>
                  <div className="radio-info">
                    <h4>Imagen</h4>
                    <p>Fondo con imagen personalizada</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Opciones de fondo según tipo */}
          {backgroundType === 'color' && (
            <div className="background-color-options">
              <h4>Color de fondo</h4>
              <div className="color-options-grid">
                {backgroundColors.map((color) => (
                  <div
                    key={color.id}
                    className={`color-option ${backgroundColor === color.id ? 'selected' : ''}`}
                    onClick={() => handleBackgroundColorChange(color.id)}
                  >
                    <div 
                      className="color-preview" 
                      style={{ backgroundColor: color.color }}
                    ></div>
                    <div className="color-info">
                      <h5>{color.name}</h5>
                      <p>{color.description}</p>
                    </div>
                    {backgroundColor === color.id && (
                      <div className="selected-indicator">
                        <div className="checkmark">✓</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {backgroundType === 'image' && (
            <div className="background-image-options">
              <h4>Imagen de fondo</h4>
              
              {/* Opciones de imagen */}
              <div className="image-options">
                <div className="image-option-tabs">
                  <button 
                    className={`tab-button ${!backgroundImageUrl.startsWith('data:') ? 'active' : ''}`}
                    onClick={() => setBackgroundImageUrl('')}
                  >
                    <Upload size={16} />
                    URL
                  </button>
                  <button 
                    className={`tab-button ${backgroundImageUrl.startsWith('data:') ? 'active' : ''}`}
                    onClick={openFileSelector}
                  >
                    <Camera size={16} />
                    Subir archivo
                  </button>
                </div>

                {/* Input de URL */}
                <div className="image-url-input">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={backgroundImageUrl.startsWith('data:') ? '' : backgroundImageUrl}
                    onChange={(e) => setBackgroundImageUrl(e.target.value)}
                    onBlur={() => handleBackgroundImageChange(backgroundImageUrl)}
                    disabled={backgroundImageUrl.startsWith('data:')}
                  />
                  <button 
                    className="btn-apply-image"
                    onClick={() => handleBackgroundImageChange(backgroundImageUrl)}
                    disabled={backgroundImageUrl.startsWith('data:')}
                  >
                    <Upload size={16} />
                    Aplicar
                  </button>
                </div>

                {/* Botón de subida de archivo */}
                <div className="file-upload-section">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn-upload-file"
                    onClick={openFileSelector}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="upload-spinner"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Camera size={16} />
                        Seleccionar imagen (JPG, PNG, WebP - máx. 5MB)
                      </>
                    )}
                  </button>
                </div>

                {/* Vista previa */}
                {backgroundImageUrl && (
                  <div className="image-preview">
                    <img 
                      src={backgroundImageUrl} 
                      alt="Vista previa" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="image-error" style={{ display: 'none' }}>
                      <p>❌ No se pudo cargar la imagen</p>
                    </div>
                  </div>
                )}

                {/* Información */}
                <div className="image-help">
                  <p>💡 <strong>URL:</strong> Puedes usar URLs de imágenes de internet</p>
                  <p>📁 <strong>Archivo:</strong> Sube imágenes desde tu dispositivo (JPG, PNG, WebP - máximo 5MB)</p>
                  <p>⚡ <strong>Optimización:</strong> Las imágenes se comprimen automáticamente para mejor rendimiento</p>
                  <p>💾 <strong>Almacenamiento:</strong> Imágenes muy grandes se aplican temporalmente</p>
                </div>
              </div>
            </div>
          )}

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
                  {animations === 'enabled' ? ' Animaciones' : animations === 'reduced' ? ' Reducidas' : ' Sin animaciones'} • 
                  {backgroundType === 'image' ? ' Imagen de fondo' : ' Color de fondo'}
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
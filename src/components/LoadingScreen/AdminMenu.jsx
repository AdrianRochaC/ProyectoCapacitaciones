// components/AdminMenu.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  BookOpenCheck,
  ClipboardList,
  Users2,
  BarChart3,
  LogOut,
  Settings
} from "lucide-react";
import { FaBell, FaCog, FaFileAlt, FaUsers } from "react-icons/fa";
import "./AdminMenu.css";
import "./Notifications.anim.css";
import { useEffect, useState } from 'react';
import PersonalizationModal from '../PersonalizationModal';

const AdminMenu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('authToken');
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPersonalization, setShowPersonalization] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [token]);

  const fetchNotifications = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setNotifications(data.notifications);
  };

  const fetchUnreadCount = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const res = await fetch(`${API_URL}/api/notifications/unread/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setUnreadCount(data.count);
  };

  const clearUserPreferencesAndStyles = () => {
    // Elimina todas las preferencias personalizadas
    localStorage.removeItem('theme');
    localStorage.removeItem('colorScheme');
    localStorage.removeItem('fontSize');
    localStorage.removeItem('fontFamily');
    localStorage.removeItem('spacing');
    localStorage.removeItem('animations');
    localStorage.removeItem('backgroundType');
    localStorage.removeItem('backgroundImageUrl');
    localStorage.removeItem('backgroundColor');
    localStorage.removeItem('storageCleared');
    localStorage.removeItem('backgroundImageTooLarge');

    // Restablece los estilos del DOM a los valores por defecto
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.setAttribute('data-color-scheme', 'default');
    document.documentElement.setAttribute('data-font-size', 'medium');
    document.documentElement.setAttribute('data-font-family', 'inter');
    document.documentElement.setAttribute('data-spacing', 'normal');
    document.documentElement.setAttribute('data-animations', 'enabled');
    document.documentElement.setAttribute('data-background-type', 'color');
    document.documentElement.setAttribute('data-background-color', 'default');
    document.documentElement.style.removeProperty('--background-image');
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      clearUserPreferencesAndStyles();
      navigate('/login', { replace: true });
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="main-menu">
        <div className="menu-links">
          <ul>
            {location.pathname !== '/home' && (
              <li>
                <Link to="/home">
                  <BookOpenCheck size={18} /> <span>Home</span>
                </Link>
              </li>
            )}
            <li>
              <Link to="/admin-courses">
                <BookOpenCheck size={18} /> <span>Gestión Cursos</span>
              </Link>
            </li>
            <li>
              <Link to="/AdminBitacora">
                <ClipboardList size={18} /> <span>Bitácora</span>
              </Link>
            </li>
            <li>
              <Link to="/cuentas">
                <Users2 size={18} /> <span>Cuentas</span>
              </Link>
            </li>
            <li>
              <Link to="/dashboard">
                <BarChart3 size={18} /> <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/perfil">
                <span>Perfil</span>
              </Link>
            </li>
            <li>
              <Link to="/admin-documentos" className={isActive('/admin-documentos') ? 'active' : ''}>
                <FaFileAlt style={{ marginRight: 8 }} /> Documentos
              </Link>
            </li>
            <li>
              <Link to="/admin-cargos" className={isActive('/admin-cargos') ? 'active' : ''}>
                <FaUsers style={{ marginRight: 8 }} /> Cargos
              </Link>
            </li>
          </ul>
        </div>
        <div className="auth-buttons">
          {user && (
            <div style={{display:'flex',alignItems:'center',gap:'18px',position:'relative'}}>
              <span className="user-info">Hola, {user.nombre}</span>
              <button 
                className="personalization-btn"
                onClick={() => setShowPersonalization(true)}
                style={{
                  background: 'var(--gradient-primary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-light)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = 'var(--shadow-medium)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'var(--shadow-light)';
                }}
              >
                <FaCog style={{fontSize:'1.2rem',color:'var(--text-white)'}} />
              </button>
              <button className="notif-bell" onClick={() => setShowDropdown(!showDropdown)} style={{position:'relative',background:'var(--bg-card)',border:'1.5px solid var(--border-primary)',borderRadius:'50%',width:'44px',height:'44px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--shadow-light)',transition:'box-shadow 0.2s, transform 0.2s',cursor:'pointer',outline:'none'}}
                onMouseEnter={e => {e.currentTarget.style.boxShadow='var(--shadow-medium)';e.currentTarget.style.transform='scale(1.08)';}}
                onMouseLeave={e => {e.currentTarget.style.boxShadow='var(--shadow-light)';e.currentTarget.style.transform='scale(1)';}}>
                <FaBell style={{fontSize:'1.7rem',color: showDropdown ? 'var(--text-success)' : 'var(--text-primary)',transition:'color 0.2s'}} />
                {unreadCount > 0 && <span className="notif-count" style={{position:'absolute',top:'-8px',right:'-8px',background:'var(--gradient-danger)',color:'var(--text-white)',borderRadius:'50%',padding:'3px 10px',fontSize:'1.05rem',fontWeight:'bold',boxShadow:'var(--shadow-medium)',border:'2px solid var(--bg-card)',transition:'background 0.2s'}}>{unreadCount}</span>}
              </button>
              {showDropdown && (
                <div className="notif-dropdown" style={{position:'absolute',top:'48px',right:'0',width:'340px',background:'var(--bg-card)',border:'1px solid var(--border-primary)',borderRadius:'18px',boxShadow:'var(--shadow-heavy)',zIndex:9999,padding:'1.5rem',color:'var(--text-primary)',display:'flex',flexDirection:'column',animation:'notifFadeIn 0.35s cubic-bezier(.4,0,.2,1)'}}>
                  <h4 style={{margin:'0 0 1rem 0',fontSize:'1.2rem',color:'var(--text-primary)'}}>Notificaciones</h4>
                  {notifications.length === 0 ? (
                    <div className="notif-empty">Sin notificaciones</div>
                  ) : (
                    <div style={{display:'flex',flexDirection:'column',gap:'0',maxHeight:'260px',overflowY:'auto'}}>
                      {notifications.map(n => (
                        <div key={n.id} className={n.is_read ? '' : 'notif-unread'} style={{background:n.is_read ? 'var(--bg-card)' : 'var(--gradient-info)',borderRadius:'14px',marginBottom:'16px',boxShadow:'var(--shadow-medium)',padding:'1.1rem 1.2rem',display:'flex',flexDirection:'row',alignItems:'center',gap:'18px',border:'1px solid var(--border-primary)',animation:'notifCardIn 0.4s cubic-bezier(.4,0,.2,1)'}}>
                                                      <div style={{flex:'1 1 0%',display:'flex',flexDirection:'column',gap:'4px'}}>
                              <div className="notif-message" style={{fontSize:'1.12rem',color:'var(--text-primary)',fontWeight:'500',letterSpacing:'0.01em'}}>{n.message}</div>
                              <div className="notif-date" style={{fontSize:'0.97rem',color:'var(--text-secondary)'}}>{new Date(n.created_at).toLocaleString()}</div>
                            </div>
                            <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'12px'}}>
                              {n.is_read ? (
                                <span style={{color:'var(--text-success)',fontWeight:'bold',fontSize:'1.05rem',transition:'color 0.2s'}}>Leída</span>
                              ) : (
                                <button onClick={async () => {const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';await fetch(`${API_URL}/api/notifications/${n.id}/read`, {method: 'POST',headers: { Authorization: `Bearer ${token}` }});fetchNotifications();}} style={{padding:'6px 14px',background:'var(--gradient-primary)',color:'var(--text-white)',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'1.05rem',boxShadow:'var(--shadow-light)',fontWeight:'500',transition:'background 0.2s'}} onMouseEnter={e => {e.currentTarget.style.background='var(--gradient-primary-hover)';}} onMouseLeave={e => {e.currentTarget.style.background='var(--gradient-primary)';}}>Leído</button>
                              )}
                            </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {user ? (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> <span>Cerrar Sesión</span>
            </button>
          ) : (
            <Link to="/login">Iniciar Sesión</Link>
          )}
        </div>
      </nav>
      
      <PersonalizationModal 
        isOpen={showPersonalization} 
        onClose={() => setShowPersonalization(false)} 
      />
    </>
  );
};

export default AdminMenu;

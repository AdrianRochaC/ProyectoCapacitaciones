import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, ClipboardList, Users2, BarChart3, User } from "lucide-react";
import { FaGraduationCap, FaClipboardList, FaUser, FaBell } from "react-icons/fa";

const HomeMenuList = ({ isAdmin, onNavigate, unreadCount, showNotifications }) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  let options = isAdmin
    ? [
        { to: "/admin-courses", icon: <BookOpenCheck size={22} />, label: "Gestión Cursos" },
        { to: "/AdminBitacora", icon: <ClipboardList size={22} />, label: "Bitácora" },
        { to: "/cuentas", icon: <Users2 size={22} />, label: "Cuentas" },
        { to: "/dashboard", icon: <BarChart3 size={22} />, label: "Dashboard" },
        { to: "/perfil", icon: <User size={22} />, label: "Perfil" },
      ]
    : [
        { to: "/courses", icon: <FaGraduationCap size={22} />, label: "Cursos" },
        { to: "/bitacora", icon: <FaClipboardList size={22} />, label: "Bitácora" },
        { to: "/perfil", icon: <FaUser size={22} />, label: "Perfil" },
      ];

  if (showNotifications) {
    // Insertar notificaciones antes de perfil
    const notifOption = { to: "/notificaciones", icon: <FaBell size={22} />, label: "Notificaciones", isNotif: true };
    if (isAdmin) {
      options.splice(options.length - 1, 0, notifOption);
    } else {
      options.splice(options.length - 1, 0, notifOption);
    }
  }

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const handleNotifClick = () => {
    setShowNotifDropdown((prev) => !prev);
    if (!showNotifDropdown) {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
      fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setNotifications(data.notifications);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem('authToken');
    const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };

  return (
    <nav style={{padding:'1.5rem 0', minWidth:220, height:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
      <div>
        <ul style={{listStyle:'none',margin:0,padding:0,display:'flex',flexDirection:'column',gap:'1.2rem',marginTop:'2.5rem'}}>
          {options.map(opt => (
            <li key={opt.to} style={{position:'relative'}}>
              {opt.isNotif ? (
                <>
                  <button
                    style={{display:'flex',alignItems:'center',gap:'1rem',background:'none',border:'none',fontSize:'1.08rem',color:'#203a43',cursor:'pointer',padding:'0.5rem 1.2rem',width:'100%',textAlign:'left',borderRadius:'8px',transition:'background 0.18s',position:'relative'}}
                    onClick={handleNotifClick}
                    onMouseEnter={e => e.currentTarget.style.background='#f5f9fc'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}
                  >
                    {opt.icon}
                    {unreadCount > 0 && (
                      <span style={{position:'absolute',left:10,top:7,width:10,height:10,background:'#e74c3c',borderRadius:'50%',display:'inline-block',border:'2px solid #fff'}}></span>
                    )}
                    <span>{opt.label}</span>
                  </button>
                  {showNotifDropdown && (
                    <div style={{position:'absolute',left:'100%',top:0,minWidth:'260px',maxHeight:'340px',overflowY:'auto',background:'#fff',boxShadow:'0 8px 32px 0 rgba(44,62,80,0.18)',borderRadius:'12px',padding:'1.2rem 1.2rem',zIndex:9999}}>
                      <h4 style={{margin:'0 0 1rem 0',fontSize:'1.1rem',color:'#2962ff'}}>Notificaciones</h4>
                      {loading ? (
                        <div style={{color:'#888'}}>Cargando...</div>
                      ) : notifications.length === 0 ? (
                        <div style={{color:'#888'}}>Sin notificaciones</div>
                      ) : (
                        <ul style={{listStyle:'none',margin:0,padding:0,display:'flex',flexDirection:'column',gap:'0.7rem'}}>
                          {notifications.map(n => (
                            <li key={n.id} style={{background:n.is_read ? '#fff' : 'linear-gradient(90deg,#e0ffe6,#b2f7ef,#e0f7fa,#b9f6ca)',borderRadius:'10px',padding:'0.7rem 0.8rem',boxShadow:'0 2px 8px 0 rgba(44,62,80,0.10)',border:'1px solid #e0e0e0',display:'flex',flexDirection:'column',gap:'0.3rem'}}>
                              <div style={{fontSize:'1.01rem',color:'#222',fontWeight:'500',letterSpacing:'0.01em'}}>{n.message}</div>
                              <div style={{fontSize:'0.97rem',color:'#888'}}>{new Date(n.created_at).toLocaleString()}</div>
                              {!n.is_read && (
                                <button
                                  style={{marginTop:'0.3rem',background:'linear-gradient(90deg,#43e97b,#38f9d7)',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'0.98rem',padding:'4px 12px',alignSelf:'flex-end'}}
                                  onClick={() => handleMarkAsRead(n.id)}
                                >
                                  Marcar como leída
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <button
                  style={{display:'flex',alignItems:'center',gap:'1rem',background:'none',border:'none',fontSize:'1.08rem',color:'#203a43',cursor:'pointer',padding:'0.5rem 1.2rem',width:'100%',textAlign:'left',borderRadius:'8px',transition:'background 0.18s',position:'relative'}}
                  onClick={() => { navigate(opt.to); if(onNavigate) onNavigate(); }}
                  onMouseEnter={e => e.currentTarget.style.background='#f5f9fc'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Botón cerrar sesión abajo */}
      <div style={{marginTop:'2.5rem',padding:'1.2rem 0 0 0',borderTop:'1.5px solid #e3eaf2',display:'flex',justifyContent:'center'}}>
        <button
          className="logout-btn"
          style={{background:'#e74c3c',color:'#fff',padding:'0.6rem 1.5rem',borderRadius:'8px',fontWeight:600,border:'none',cursor:'pointer',fontSize:'1rem'}}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default HomeMenuList; 
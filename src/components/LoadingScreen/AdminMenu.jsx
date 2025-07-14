// components/AdminMenu.jsx
import { Link, useNavigate } from "react-router-dom";
import {
  BookOpenCheck,
  ClipboardList,
  Users2,
  BarChart3,
  LogOut
} from "lucide-react";
import { FaBell } from "react-icons/fa";
import "./AdminMenu.css";
import "./Notifications.anim.css";
import { useEffect, useState } from 'react';

const AdminMenu = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('authToken');

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
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

  const handleLogout = () => {
    const confirmLogout = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmLogout) {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      navigate('/login', { replace: true });
    }
  };

  return (
    <nav className="main-menu">
      <div className="menu-links">
        <ul>
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
        </ul>
      </div>
      <div className="auth-buttons">
        {user && (
          <div style={{display:'flex',alignItems:'center',gap:'18px',position:'relative'}}>
            <span className="user-info">Hola, {user.nombre}</span>
            <button className="notif-bell" onClick={() => setShowDropdown(!showDropdown)} style={{position:'relative',background:'#fff',border:'1.5px solid #2962ff',borderRadius:'50%',width:'44px',height:'44px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px 0 rgba(44,62,80,0.10)',transition:'box-shadow 0.2s, transform 0.2s',cursor:'pointer',outline:'none'}}
              onMouseEnter={e => {e.currentTarget.style.boxShadow='0 4px 16px 0 rgba(44,62,80,0.18)';e.currentTarget.style.transform='scale(1.08)';}}
              onMouseLeave={e => {e.currentTarget.style.boxShadow='0 2px 8px 0 rgba(44,62,80,0.10)';e.currentTarget.style.transform='scale(1)';}}>
              <FaBell style={{fontSize:'1.7rem',color: showDropdown ? '#43e97b' : '#2962ff',transition:'color 0.2s'}} />
              {unreadCount > 0 && <span className="notif-count" style={{position:'absolute',top:'-8px',right:'-8px',background:'linear-gradient(90deg,#43e97b,#38f9d7,#00e676)',color:'#fff',borderRadius:'50%',padding:'3px 10px',fontSize:'1.05rem',fontWeight:'bold',boxShadow:'0 2px 8px 0 rgba(44,62,80,0.18)',border:'2px solid #fff',transition:'background 0.2s',textShadow:'0 1px 4px #38f9d7'}}>{unreadCount}</span>}
            </button>
            {showDropdown && (
              <div className="notif-dropdown" style={{position:'absolute',top:'48px',right:'0',width:'340px',background:'#fff',border:'1px solid #eee',borderRadius:'18px',boxShadow:'0 12px 32px 8px rgba(44,62,80,0.18)',zIndex:9999,padding:'1.5rem',color:'#222',display:'flex',flexDirection:'column',animation:'notifFadeIn 0.35s cubic-bezier(.4,0,.2,1)'}}>
                <h4 style={{margin:'0 0 1rem 0',fontSize:'1.2rem',color:'#2962ff'}}>Notificaciones</h4>
                {notifications.length === 0 ? (
                  <div className="notif-empty">Sin notificaciones</div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'0',maxHeight:'260px',overflowY:'auto'}}>
                    {notifications.map(n => (
                      <div key={n.id} className={n.is_read ? '' : 'notif-unread'} style={{background:n.is_read ? '#fff' : 'linear-gradient(90deg,#e0ffe6,#b2f7ef,#e0f7fa,#b9f6ca)',borderRadius:'14px',marginBottom:'16px',boxShadow:'0 4px 16px 0 rgba(44,62,80,0.12)',padding:'1.1rem 1.2rem',display:'flex',flexDirection:'row',alignItems:'center',gap:'18px',border:'1px solid #e0e0e0',animation:'notifCardIn 0.4s cubic-bezier(.4,0,.2,1)'}}>
                        <div style={{flex:'1 1 0%',display:'flex',flexDirection:'column',gap:'4px'}}>
                          <div className="notif-message" style={{fontSize:'1.12rem',color:'#222',fontWeight:'500',letterSpacing:'0.01em'}}>{n.message}</div>
                          <div className="notif-date" style={{fontSize:'0.97rem',color:'#888'}}>{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:'12px'}}>
                          {n.is_read ? (
                            <span style={{color:'#00e676',fontWeight:'bold',fontSize:'1.05rem',transition:'color 0.2s'}}>Leída</span>
                          ) : (
                            <button onClick={async () => {const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';await fetch(`${API_URL}/api/notifications/${n.id}/read`, {method: 'POST',headers: { Authorization: `Bearer ${token}` }});fetchNotifications();}} style={{padding:'6px 14px',background:'linear-gradient(90deg,#43e97b,#38f9d7)',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'1.05rem',boxShadow:'0 2px 8px 0 rgba(44,62,80,0.12)',fontWeight:'500',transition:'background 0.2s'}} onMouseEnter={e => {e.currentTarget.style.background='linear-gradient(90deg,#38f9d7,#43e97b)';}} onMouseLeave={e => {e.currentTarget.style.background='linear-gradient(90deg,#43e97b,#38f9d7)';}}>Leído</button>
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
  );
};

export default AdminMenu;

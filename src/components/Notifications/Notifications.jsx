import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import './Notifications.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Notifications({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  console.log('[Notifications] notifs:', notifications.length, 'unread:', unreadCount);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [token]);

  const fetchNotifications = async () => {
    const res = await fetch(`${API_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setNotifications(data.notifications);
  };

  const fetchUnreadCount = async () => {
    const res = await fetch(`${API_URL}/api/notifications/unread/count`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) setUnreadCount(data.count);
  };

  const markAsRead = async (id) => {
    await fetch(`${API_URL}/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchNotifications();
    fetchUnreadCount();
  };

  return (
    <div className="notifications-container" style={{width:'100%',maxWidth:'600px',margin:'30px auto',background:'#fff',border:'2px solid #eee',borderRadius:'12px',padding:'24px'}}>
      <h2 style={{marginBottom:'18px',color:'#222'}}>Notificaciones</h2>
      {notifications.length === 0 ? (
        <div className="notif-empty">Sin notificaciones</div>
      ) : (
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr style={{background:'#f6faff',fontWeight:'bold'}}>
              <th style={{padding:'8px',borderBottom:'2px solid #eee'}}>Mensaje</th>
              <th style={{padding:'8px',borderBottom:'2px solid #eee'}}>Fecha</th>
              <th style={{padding:'8px',borderBottom:'2px solid #eee'}}>Leída</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map(n => (
              <tr key={n.id} style={{background:n.is_read ? '#fff' : '#ffe0e0'}}>
                <td style={{padding:'8px',borderBottom:'1px solid #eee'}}>{n.message}</td>
                <td style={{padding:'8px',borderBottom:'1px solid #eee'}}>{new Date(n.created_at).toLocaleString()}</td>
                <td style={{padding:'8px',borderBottom:'1px solid #eee',textAlign:'center'}}>{n.is_read ? 'Sí' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

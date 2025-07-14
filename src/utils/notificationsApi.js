// src/utils/notificationsApi.js
export const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user && user.token ? user.token : null;
};

export const fetchNotifications = async (token) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const fetchUnreadCount = async (token) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/unread/count`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
};

export const markNotificationAsRead = async (id, token) => {
  await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/notifications/${id}/read`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
};

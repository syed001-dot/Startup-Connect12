import axios from 'axios';
import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:8080/api';
const getNotifications = async (userId) => {
  const token = authService.getToken();
  const res = await axios.get(`${API_BASE}/notifications`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

const markNotificationsAsRead = async (notificationIds) => {
  try {
    const token = authService.getToken();
    await axios.put(`${API_BASE}/notifications/mark-as-read`, notificationIds, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return true;
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
};

const notificationService = {
  getNotifications,
  markNotificationsAsRead,
};

export default notificationService;

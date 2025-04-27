import axios from 'axios';
import authService from './authService';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:8080/api';
const getConversationUsers = async (userId) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE}/messages/conversation-users`, {
      params: { userId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation users:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversation users');
  }
};

const getConversation = async (user1Id, user2Id) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE}/messages/conversation`, {
      params: { user1: user1Id, user2: user2Id },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversation');
  }
};

const sendMessage = async (senderId, receiverId, content) => {
  try {
    const token = authService.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(`${API_BASE}/messages/send`, 
      { senderId, receiverId, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error(error.response?.data?.message || 'Failed to send message');
  }
};

const messageService = {
  getConversationUsers,
  getConversation,
  sendMessage,
};

export default messageService;

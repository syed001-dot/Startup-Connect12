import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const userService = {
  // Lookup user by email (for messaging)
  getUserByEmail: async (email) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }
      const response = await axios.get(`${API_URL}/users/email/${encodeURIComponent(email)}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error looking up user by email:', error);
      throw error.response?.data || error.message;
    }
  },

  // Lookup user by ID (for chat dialog)
  getUserById: async (id) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }
      const response = await axios.get(`${API_URL}/messages/user/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error looking up user by ID:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default userService;

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const authService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error('Login error:', error.response?.data || error);
            throw error.response?.data || 'Login failed';
        }
    },

    register: async (userData) => {
        try {
            console.log('Making registration request to:', `${API_URL}/register`);
            console.log('Registration data:', userData);
            
            const response = await axios.post(`${API_URL}/register`, userData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Registration response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Registration error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                statusText: error.response?.statusText
            });
            
            if (error.response?.data) {
                throw error.response.data;
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error('Registration failed. Please try again.');
            }
        }
    },

    logout: () => {
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    getToken: () => {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('User data from localStorage:', userData);
        // Check if token is directly on the object or nested in a 'user' property
        const token = userData?.token || userData?.user?.token;
        console.log('Extracted token:', token);
        return token;
    },

    updatePassword: async (userId, newPassword) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.put(`${API_URL}/users/${userId}/password`, {
                password: newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error.response?.data || 'Failed to update password';
        }
    }
};

export default authService; 
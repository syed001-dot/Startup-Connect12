import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/auth` : 'http://localhost:8080/api/auth';

const updateAdminPassword = async () => {
    try {
        // First, login as admin
        const loginResponse = await axios.post(`${API_URL}/login`, {
            email: 'admin@example.com',
            password: '5955'
        });

        const token = loginResponse.data.token;

        // Get all users to find the admin user ID
        const usersResponse = await axios.get(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const adminUser = usersResponse.data.find(user => user.email === 'admin@example.com');
        if (!adminUser) {
            throw new Error('Admin user not found');
        }

        // Update the password
        await axios.put(`${API_URL}/users/${adminUser.id}/password`, {
            password: '5955'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Admin password updated successfully');
    } catch (error) {
        console.error('Error updating admin password:', error);
    }
};

updateAdminPassword(); 
import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL
? `${process.env.REACT_APP_API_URL}/api`
: 'http://localhost:8080/api';

const pitchDeckService = {
    getAllPitchDecks: async () => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pitchdecks`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pitch decks:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch pitch decks');
        }
    },

    getPitchDeckById: async (id) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pitchdecks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pitch deck:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch pitch deck');
        }
    },

    getPitchDecksByStartup: async (startupId) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pitchdecks/startup/${startupId}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pitch decks by startup:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch pitch decks');
        }
    },

    getPublicPitchDecksByStartup: async (startupId) => {
        try {
            const response = await axios.get(`${API_URL}/pitchdecks/startup/${startupId}/public`);
            return response.data;
        } catch (error) {
            console.error('Error fetching public pitch decks:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch public pitch decks');
        }
    },

    uploadPitchDeck: async (startupId, file, title, description = '', isPublic = false) => {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to upload pitch decks');
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('isPublic', isPublic);

            const response = await axios.post(`${API_URL}/pitchdecks/upload/${startupId}`, formData, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading pitch deck:', error);
            const errorMessage = error.response?.data || error.message;
            throw new Error(`Failed to upload pitch deck: ${errorMessage}`);
        }
    },

    updatePitchDeck: async (id, title, description, isPublic) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.put(`${API_URL}/pitchdecks/${id}`, {
                title,
                description,
                isPublic
            }, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating pitch deck:', error);
            throw new Error(error.response?.data?.message || 'Failed to update pitch deck');
        }
    },

    deletePitchDeck: async (id) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.delete(`${API_URL}/pitchdecks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting pitch deck:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete pitch deck');
        }
    },

    downloadPitchDeck: async (id) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pitchdecks/download/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
                responseType: 'blob'
            });
            
            // Create a blob from the response data
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = response.headers['content-disposition']?.split('filename=')[1] || 'pitch-deck';
            
            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error downloading pitch deck:', error);
            throw new Error(error.response?.data?.message || 'Failed to download pitch deck');
        }
    },

    previewPitchDeck: async (id) => {
        try {
            const user = authService.getCurrentUser();
            const response = await axios.get(`${API_URL}/pitchdecks/preview/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
                responseType: 'blob'
            });
            
            // Create a blob URL for preview
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            return window.URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error previewing pitch deck:', error);
            throw new Error(error.response?.data?.message || 'Failed to preview pitch deck');
        }
    },

    previewPublicPitchDeck: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/pitchdecks/public/${id}/file`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            return window.URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error previewing public pitch deck:', error);
            throw new Error(error.response?.data?.message || 'Failed to preview public pitch deck');
        }
    }
};

export default pitchDeckService; 
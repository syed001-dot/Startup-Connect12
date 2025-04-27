import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/negotiations`
  : 'http://localhost:8080/api/negotiations';

export const negotiationService = {
    createOffer: async (offerData) => {
        try {
            const response = await axios.post(API_URL, offerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    updateOffer: async (transactionId, offerData) => {
        try {
            const response = await axios.put(`${API_URL}/${transactionId}`, offerData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    acceptOffer: async (transactionId) => {
        try {
            const response = await axios.post(`${API_URL}/${transactionId}/accept`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    rejectOffer: async (transactionId, reason) => {
        try {
            const response = await axios.post(`${API_URL}/${transactionId}/reject`, null, {
                params: { reason }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}; 
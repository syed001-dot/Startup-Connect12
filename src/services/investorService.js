import axios from 'axios';
import authService from './authService';
import { jwtDecode } from 'jwt-decode';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:8080/api';
const getAuthHeaders = () => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
        throw new Error('No authenticated user found');
    }
    return {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    };
};

const investorService = {
    getAllInvestors: async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${API_BASE}/admin/investors`, {
                headers: headers
            });
            return response.data.map(investor => ({
                ...investor,
                name: investor.companyName || investor.fullName || `Investor #${investor.id}`
            }));
        } catch (error) {
            console.error('Error fetching investors:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch investors';
        }
    },

    getInvestorById: async (id) => {
        try {
            const user = authService.getCurrentUser();
            if (!user || !user.token) {
                throw new Error('No authenticated user found');
            }

            const response = await axios.get(`${API_BASE}/investors/${id}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = response.data;
            console.log('Fetched investor data:', data);

            return {
                ...data,
                id: data.id,
                name: data.fullName || `Investor #${id}`,
                email: data.email || 'Email not available',
                companyName: data.companyName || '',
                investmentFocus: data.investmentFocus || 'Not specified',
                location: data.location || 'Not specified',
                description: data.description || '',
                minimumInvestment: data.minimumInvestment || 0,
                user: {
                    id: data.userId,
                    fullName: data.fullName,
                    email: data.email
                }
            };
        } catch (error) {
            console.error('Error fetching investor:', error);
            if (error.response) {
                console.log('Error response:', error.response.data);
            }
            throw error.response?.data?.message || error.message || 'Failed to fetch investor details';
        }
    },

    getInvestorInvestments: async (id) => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${API_BASE}/transactions/investor/${id}`, {
                headers: headers
            });
            return response.data.map(investment => ({
                ...investment,
                startupName: investment.startup?.name || investment.startupName || 'Unknown Startup',
                amount: investment.amount || 0,
                stage: investment.stage || 'Not specified',
                date: investment.date || new Date().toISOString()
            }));
        } catch (error) {
            console.error('Error fetching investor investments:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch investments';
        }
    },

    getInvestorProfile: async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${API_BASE}/investor/profile`, {
                headers: headers
            });
            return {
                ...response.data,
                investmentRangeMin: Number(response.data.investmentRangeMin || 0),
                investmentRangeMax: Number(response.data.investmentRangeMax || 0),
                companyName: response.data.companyName || 'N/A',
                sector: response.data.sector || 'N/A',
                location: response.data.location || 'N/A',
                investmentFocus: response.data.investmentFocus || 'N/A',
                description: response.data.description || ''
            };
        } catch (error) {
            console.error('Error fetching investor profile:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch profile';
        }
    },

    updateInvestorProfile: async (profileData) => {
        try {
            const headers = getAuthHeaders();
            const formattedData = {
                ...profileData,
                investmentRangeMin: Number(profileData.investmentRangeMin),
                investmentRangeMax: Number(profileData.investmentRangeMax)
            };

            const response = await axios.put(`${API_BASE}/investor/profile`, formattedData, {
                headers: headers
            });
            return {
                ...response.data,
                investmentRangeMin: Number(response.data.investmentRangeMin),
                investmentRangeMax: Number(response.data.investmentRangeMax)
            };
        } catch (error) {
            console.error('Error updating investor profile:', error);
            throw error.response?.data?.message || error.message || 'Failed to update profile';
        }
    },

    getTrendingInvestments: async () => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.get(`${API_BASE}/admin/transactions`, {
                headers: headers
            });
            return response.data
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 10)
                .map(transaction => ({
                    ...transaction,
                    startupName: transaction.startupName || 'Unknown Startup',
                    investorName: transaction.investorName || transaction.investorCompanyName || 'Unknown Investor',
                    transactionDate: transaction.transactionDate ? new Date(transaction.transactionDate).toLocaleString('en-US', {
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }) : 'Unknown Date'
                }));
        } catch (error) {
            console.error('Error fetching trending investments:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch trending investments';
        }
    },

    getDashboardStats: async () => {
        try {
            const response = await axios.get(`${API_BASE}/investor/dashboard/stats`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getSectorDistribution: async () => {
        try {
            const response = await axios.get(`${API_BASE}/investor/dashboard/sector-distribution`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getRecentActivities: async () => {
        try {
            const response = await axios.get(`${API_BASE}/investor/dashboard/activities`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getPortfolio: async () => {
        try {
            const response = await axios.get(`${API_BASE}/investor/portfolio`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getPortfolioPerformance: async () => {
        try {
            const response = await axios.get(`${API_BASE}/investor/portfolio/performance`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    getInvestmentDetails: async (investmentId) => {
        try {
            const response = await axios.get(`${API_BASE}/investor/investments/${investmentId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    invest: async (investmentData) => {
        try {
            const headers = getAuthHeaders();
            const response = await axios.post(`${API_BASE}/investments`, investmentData, {
                headers: headers
            });
            return response.data;
        } catch (error) {
            console.error('Error making investment:', error);
            throw error.response?.data?.message || error.message || 'Failed to process investment';
        }
    },

    getMyInvestments: async () => {
        try {
            const user = authService.getCurrentUser();
            if (!user || !user.token) {
                throw new Error('No authenticated user found');
            }

            const decodedToken = jwtDecode(user.token);
            const userId = decodedToken.sub;

            const response = await axios.get(`${API_BASE}/transactions/investor/${userId}`, {
                headers: getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching investments:', error);
            throw error.response?.data?.message || error.message || 'Failed to fetch investments';
        }
    }
};

export default investorService; 
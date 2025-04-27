import axios from 'axios';
import authService from './authService';
import investorService from './investorService';
import startupService from './startupService';

const API_URL = process.env.REACT_APP_API_URL
? `${process.env.REACT_APP_API_URL}/api`
: 'http://localhost:8080/api';
const transactionService = {
  // Create a new transaction
  createTransaction: async (transaction) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }

      const response = await axios.post(`${API_URL}/transactions`, transaction, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      if (error.response?.status === 403) {
        throw new Error('You must be logged in to create a transaction');
      }
      throw error.response?.data || error.message;
    }
  },

  // Get all transactions (admin)
  getAllTransactions: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get transactions by investor
  getTransactionsByInvestor: async (email) => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }

      // First get the investor profile to get the numeric ID
      const investorProfile = await investorService.getInvestorProfile();
      if (!investorProfile || !investorProfile.id) {
        throw new Error('Could not find investor profile');
      }

      const response = await axios.get(`${API_URL}/transactions/investor/${investorProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching investor transactions:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get transactions by startup
  getTransactionsByStartup: async () => {
    try {
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }

      // First get the startup profile to get the numeric ID
      const startupProfile = await startupService.getStartupProfile();
      if (!startupProfile || !startupProfile.id) {
        throw new Error('Could not find startup profile');
      }

      console.log('Fetching transactions for startup ID:', startupProfile.id);
      const response = await axios.get(`${API_URL}/transactions/startup/${startupProfile.id}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      // Process transactions to include investor information
      const transactionsWithInvestors = response.data.map(transaction => {
        return {
          ...transaction,
          investorName: transaction.investorName || 
                       transaction.investorEmail || 
                       (transaction.investorDetails?.companyName) ||
                       `Investor #${transaction.investorId}`,
          investorDetails: transaction.investorDetails || null
        };
      });

      console.log('Transactions with investor details:', transactionsWithInvestors);
      return transactionsWithInvestors;
    } catch (error) {
      console.error('Error fetching startup transactions:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default transactionService;

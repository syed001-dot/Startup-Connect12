import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Chip,
  Box,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/formatters';
import startupService from '../services/startupService';

const InvestmentOfferManager = ({ startupId }) => {
  const [offers, setOffers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    equityPercentage: '',
    description: '',
    terms: '',
  });

  useEffect(() => {
    if (startupId) {
      fetchOffers();
    }
  }, [startupId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      let data = [];
      if (startupId) {
        data = await startupService.getInvestmentOffers(startupId);
      } else {
        // fallback: try to get own offers if startupId is not provided
        data = await startupService.getMyInvestmentOffers();
      }
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setError('Failed to fetch investment offers');
    } finally {
      setLoading(false);
    }
  };


  const handleOpenDialog = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        amount: offer.amount,
        equityPercentage: offer.equityPercentage,
        description: offer.description,
        terms: offer.terms || '',
      });
    } else {
      setEditingOffer(null);
      setFormData({
        amount: '',
        equityPercentage: '',
        description: '',
        terms: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOffer(null);
    setError('');
  };

  const validateFormData = (data) => {
    if (!data.amount || !data.equityPercentage || !data.description) {
      return 'Please fill in all required fields';
    }
    const amount = parseFloat(data.amount);
    const equity = parseFloat(data.equityPercentage);
    if (isNaN(amount) || amount <= 0) {
      return 'Amount must be a positive number';
    }
    if (isNaN(equity) || equity < 1 || equity > 100) {
      return 'Equity percentage must be between 1 and 100';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      // Validate form data
      const validationError = validateFormData(formData);
      if (validationError) {
        throw new Error(validationError);
      }

      // Convert numeric values and format the data
      const offerData = {
        amount: parseFloat(formData.amount),
        equityPercentage: parseFloat(formData.equityPercentage),
        description: formData.description,
        terms: formData.terms || '',
        isActive: true,
        status: 'ACTIVE'
      };

      if (editingOffer) {
        await startupService.updateInvestmentOffer(editingOffer.id, offerData);
      } else {
        await startupService.createInvestmentOffer(offerData);
      }
      
      await fetchOffers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving offer:', error);
      setError(error.message || 'Failed to save investment offer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (offerId) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        setLoading(true);
        await startupService.deleteInvestmentOffer(offerId);
        await fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
        setError('Failed to delete investment offer');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Investment Offers</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={loading}
          >
            New Offer
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          {offers.map((offer) => (
            <Grid item xs={12} sm={6} md={4} key={offer.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" gutterBottom>
                      {formatCurrency(offer.amount)}
                    </Typography>
                    
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {offer.equityPercentage}% Equity
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {offer.description}
                  </Typography>
                  {offer.terms && (
                    <Typography variant="body2" color="textSecondary" paragraph>
                      Terms: {offer.terms}
                    </Typography>
                  )}
                  <Chip
                    label={offer.status}
                    size="small"
                    color={offer.status === 'ACTIVE' ? 'success' : 'default'}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingOffer ? 'Edit Offer' : 'New Offer'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Total Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Equity Percentage"
                    type="number"
                    value={formData.equityPercentage}
                    onChange={(e) => setFormData({ ...formData, equityPercentage: e.target.value })}
                    required
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Terms & Conditions"
                    multiline
                    rows={3}
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={loading}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : (editingOffer ? 'Update' : 'Create')}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InvestmentOfferManager; 
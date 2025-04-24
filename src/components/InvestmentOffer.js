import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import startupService from '../services/startupService';

const InvestmentOffer = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    equity: '',
    description: '',
    terms: ''
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    if (name === 'amount') {
      const numValue = Number(value);
      if (!value || value === '') return 'Amount is required';
      if (numValue <= 0) return 'Amount must be greater than 0';
      if (isNaN(numValue)) return 'Please enter a valid number';
      return '';
    }
    if (name === 'equity') {
      const numValue = Number(value);
      if (!value || value === '') return 'Equity is required';
      if (numValue < 1 || numValue > 100) return 'Equity must be between 1% and 100%';
      if (isNaN(numValue)) return 'Please enter a valid number';
      return '';
    }
    if (name === 'description' && (!value || value.trim() === '')) {
      return 'Description is required';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow positive numbers for amount and equity
    if ((name === 'amount' || name === 'equity') && value.startsWith('-')) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate and set error for the field
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const fieldError = validateField(key, formData[key]);
      if (fieldError) {
        newErrors[key] = fieldError;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        throw new Error('Please correct all errors before submitting');
      }

      const amount = Number(formData.amount);
      const equity = Number(formData.equity);

      // Final validation check
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (equity < 1 || equity > 100) {
        throw new Error('Equity must be between 1% and 100%');
      }

      const offerData = {
        amount,
        equity,
        description: formData.description,
        terms: formData.terms
      };

      await startupService.createInvestmentOffer(offerData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create investment offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Investment Offer</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Investment Amount"
                name="amount"
                type="text"
                value={formData.amount}
                required
                error={!!errors.amount}
                inputProps={{
                  style: { 
                    textAlign: 'right'
                  }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
                onKeyPress={(e) => {
                  const charCode = e.which ? e.which : e.keyCode;
                  if (
                    charCode !== 46 && // decimal point
                    charCode > 31 && 
                    (charCode < 48 || charCode > 57)
                  ) {
                    e.preventDefault();
                  }
                  // Check for first character being a decimal point
                  if (charCode === 46 && !formData.amount) {
                    e.preventDefault();
                  }
                  // Check for multiple decimal points
                  if (charCode === 46 && formData.amount.includes('.')) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove any non-numeric characters except decimal point
                  const sanitizedValue = value.replace(/[^\d.]/g, '');
                  // Ensure only one decimal point
                  const parts = sanitizedValue.split('.');
                  const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                  
                  setFormData(prev => ({
                    ...prev,
                    [e.target.name]: cleanValue
                  }));
                  
                  // Validate and set error
                  const fieldError = validateField(e.target.name, cleanValue);
                  setErrors(prev => ({
                    ...prev,
                    [e.target.name]: fieldError
                  }));
                }}
              />
              {errors.amount && (
                <FormHelperText error>{errors.amount}</FormHelperText>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Equity Offered"
                name="equity"
                type="text"
                value={formData.equity}
                required
                error={!!errors.equity}
                inputProps={{
                  style: { 
                    textAlign: 'right'
                  }
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
                onKeyPress={(e) => {
                  const charCode = e.which ? e.which : e.keyCode;
                  if (
                    charCode !== 46 && // decimal point
                    charCode > 31 && 
                    (charCode < 48 || charCode > 57)
                  ) {
                    e.preventDefault();
                  }
                  // Check for first character being a decimal point
                  if (charCode === 46 && !formData.equity) {
                    e.preventDefault();
                  }
                  // Check for multiple decimal points
                  if (charCode === 46 && formData.equity.includes('.')) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove any non-numeric characters except decimal point
                  const sanitizedValue = value.replace(/[^\d.]/g, '');
                  // Ensure only one decimal point
                  const parts = sanitizedValue.split('.');
                  const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
                  
                  // Ensure value doesn't exceed 100
                  if (Number(cleanValue) > 100) {
                    return;
                  }
                  
                  setFormData(prev => ({
                    ...prev,
                    [e.target.name]: cleanValue
                  }));
                  
                  // Validate and set error
                  const fieldError = validateField(e.target.name, cleanValue);
                  setErrors(prev => ({
                    ...prev,
                    [e.target.name]: fieldError
                  }));
                }}
              />
              {errors.equity && (
                <FormHelperText error>{errors.equity}</FormHelperText>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                required
                error={!!errors.description}
              />
              {errors.description && (
                <FormHelperText error>{errors.description}</FormHelperText>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Terms & Conditions"
                name="terms"
                multiline
                rows={3}
                value={formData.terms}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || Object.keys(errors).length > 0}
          >
            {loading ? 'Creating...' : 'Create Offer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default InvestmentOffer; 
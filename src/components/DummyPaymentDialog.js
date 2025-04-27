import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box, Alert, InputLabel, MenuItem, Select, FormControl, Grid
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const DummyPaymentDialog = ({ open, amount, onClose, onPaymentConfirmed, startupId, description }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('card');
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  // UPI field
  const [upiId, setUpiId] = useState('');
  // Bank fields
  const [bankName, setBankName] = useState('');
  const [accHolder, setAccHolder] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [ifsc, setIfsc] = useState('');

  // Field validation errors
  const [expiryError, setExpiryError] = useState('');
  const [accHolderError, setAccHolderError] = useState('');
  const [accNumberError, setAccNumberError] = useState('');

  // Screenshot upload (UPI only)
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const resetFields = () => {
    setCardNumber(''); setExpiry(''); setCvv('');
    setUpiId('');
    setBankName(''); setAccHolder(''); setAccNumber(''); setIfsc('');
    setFile(null); setFileError('');
    setExpiryError(''); setAccHolderError(''); setAccNumberError('');
  };

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    setFileError('');
    
    try {
      // Validate fields
      if (method === 'card') {
        if (!cardNumber || !expiry || !cvv) {
          throw new Error('Please fill all card details.');
        }
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
          throw new Error('Card number must be 16 digits.');
        }
        if (!/^\d{3,4}$/.test(cvv)) {
          throw new Error('CVV must be 3 or 4 digits.');
        }
        if (expiryError) {
          throw new Error('Please enter a valid expiry date.');
        }
      } else if (method === 'bank') {
        if (!accHolder) throw new Error('Please enter account holder name.');
        if (!accNumber) throw new Error('Please enter account number.');
        if (accHolderError) throw new Error('Invalid account holder name.');
        if (accNumberError) throw new Error('Invalid account number.');
      } else if (method === 'upi') {
        if (!upiId) {
          throw new Error('Please enter your UPI ID.');
        }
        if (!/^[\w.-]+@[\w.-]+$/.test(upiId)) {
          throw new Error('Invalid UPI ID format.');
        }
        if (!file) {
          throw new Error('Please upload a screenshot or PDF as payment proof.');
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Only .jpg, .png, or .pdf files are allowed.');
        }
      }

      // If all validations pass, call onPaymentConfirmed
      await onPaymentConfirmed();
      
      // Reset and close dialog
      resetFields();
      onClose();
    } catch (err) {
      setError(err.message || 'Payment validation failed. Please check your details.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    setFileError('');
    const f = e.target.files[0];
    if (f) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(f.type)) {
        setFileError('Only .jpg, .png, or .pdf files are allowed.');
        setFile(null);
      } else {
        setFile(f);
      }
    }
  };

  const handleClose = () => {
    resetFields();
    setError('');
    setFileError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Complete Payment</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          <b>Total Amount to Pay:</b> <span style={{ color: '#1976d2', fontSize: 20 }}>${amount?.toLocaleString()}</span>
        </Typography>
        <Box mb={2}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={method}
              label="Payment Method"
              onChange={e => setMethod(e.target.value)}
              disabled={processing}
            >
              <MenuItem value="card">Credit/Debit Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="bank">Bank Transfer</MenuItem>
            </Select>
          </FormControl>

          {/* Card Fields */}
          {method === 'card' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Card Number"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/[^\d]/g, '').slice(0,16))}
                  fullWidth
                  disabled={processing}
                  inputProps={{ maxLength: 16 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiry (MM/YY)"
                  value={expiry}
                  onChange={e => {
                    // Only allow digits and /
                    let val = e.target.value.replace(/[^\d/]/g, '');
                    // Auto-insert slash
                    if (val.length === 2 && expiry.length === 1) val += '/';
                    if (val.length > 5) val = val.slice(0, 5);
                    setExpiry(val);

                    // Validate format
                    let err = '';
                    if (val.length === 5) {
                      const [mm, yy] = val.split('/');
                      const month = parseInt(mm, 10);
                      const year = parseInt(yy, 10);
                      const now = new Date();
                      const curYear = now.getFullYear() % 100;
                      const curMonth = now.getMonth() + 1;
                      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(val)) {
                        err = 'Format MM/YY';
                      } else if (month < 1 || month > 12) {
                        err = 'Invalid month';
                      } else if (year < curYear || (year === curYear && month < curMonth)) {
                        err = 'Card expired';
                      }
                    } else if (val.length > 0 && val.length < 5) {
                      err = 'Format MM/YY';
                    }
                    setExpiryError(err);
                  }}
                  fullWidth
                  disabled={processing}
                  placeholder="MM/YY"
                  sx={{ mb: 2 }}
                  error={!!expiryError}
                  helperText={expiryError}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="CVV"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/[^\d]/g, '').slice(0,4))}
                  fullWidth
                  disabled={processing}
                  inputProps={{ maxLength: 4 }}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          )}

          {/* UPI Fields */}
          {method === 'upi' && (
            <TextField
              label="UPI ID (e.g. phonenumber@upi, yourname@sbi)"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              fullWidth
              disabled={processing}
              sx={{ mb: 2 }}
            />
          )}

          {/* Bank Transfer Fields */}
          {method === 'bank' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Bank Name"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  fullWidth
                  disabled={processing}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Account Holder Name"
                  value={accHolder}
                  onChange={e => {
                    // Only allow alphabets and spaces
                    const val = e.target.value.replace(/[^a-zA-Z ]/g, '');
                    setAccHolder(val);
                    setAccHolderError(val && !/^[A-Za-z ]+$/.test(val) ? 'Only alphabets allowed' : '');
                  }}
                  fullWidth
                  disabled={processing}
                  sx={{ mb: 2 }}
                  error={!!accHolderError}
                  helperText={accHolderError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Account Number"
                  value={accNumber}
                  onChange={e => {
                    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 18);
                    setAccNumber(val);
                    setAccNumberError(val && !/^\d{1,18}$/.test(val) ? 'Only numbers allowed' : '');
                  }}
                  fullWidth
                  disabled={processing}
                  sx={{ mb: 2 }}
                  inputProps={{ maxLength: 18 }}
                  error={!!accNumberError}
                  helperText={accNumberError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="IFSC Code"
                  value={ifsc}
                  onChange={e => setIfsc(e.target.value.toUpperCase())}
                  fullWidth
                  disabled={processing}
                  sx={{ mb: 2 }}
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>
            </Grid>
          )}

          {/* Screenshot Upload for UPI only */}
          {method === 'upi' && (
            <Box mt={2} mb={1}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Upload Payment Screenshot / PDF <span style={{ fontSize: 13, color: '#888' }}>(.jpg, .png, .pdf)</span></Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={processing}
              >
                {file ? file.name : 'Choose File'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {fileError && <Alert severity="error" sx={{ mt: 1 }}>{fileError}</Alert>}
            </Box>
          )}
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={processing}>Cancel / Close</Button>
        <Button variant="contained" onClick={handlePay} disabled={processing} color="primary">
          {processing ? 'Processing...' : 'Pay Now / Proceed'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DummyPaymentDialog;

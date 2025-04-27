import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Box, 
  CircularProgress, 
  Alert,
  //Paper,
  Divider
} from '@mui/material';
import { 
  MonetizationOn, 
  TrendingUp 
} from '@mui/icons-material';
import startupService from '../services/startupService';
import transactionService from '../services/transactionService';
import authService from '../services/authService';
import InvestmentOfferList from '../components/InvestmentOfferList';
import DummyPaymentDialog from '../components/DummyPaymentDialog';

const TransactionPage = () => {
  const { startupId } = useParams();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await startupService.getInvestmentOffers(startupId);
      console.log('Fetched offers:', data);
      setOffers(data);
    } catch (err) {
      console.error('Error fetching offers:', err);
      setError(err.message || 'Failed to fetch investment offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [startupId]);

  const handleAccept = (offer) => {
    const user = authService.getCurrentUser();
    if (!user || !user.token) {
      setError('You must be logged in to accept offers');
      return;
    }
    setSelectedOffer(offer);
    setPaymentDialogOpen(true);
  };

  const handlePaymentConfirmed = async () => {
    if (!selectedOffer) return;
    
    try {
      setLoading(true);
      setError('');
      
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('You must be logged in to complete this transaction');
      }

      console.log('Selected offer:', JSON.stringify(selectedOffer, null, 2));

      // First create the transaction
      const transactionPayload = {
        investorId: user.id,
        startupId: selectedOffer.startupId || selectedOffer.startup?.id,
        amount: selectedOffer.amount,
        status: 'ACCEPTED',
        transactionDate: new Date().toISOString(),
        transactionType: 'ACCEPT',
        description: selectedOffer.description || '',
        offerId: selectedOffer.id
      };

      const transaction = await transactionService.createTransaction(transactionPayload);
      console.log('Transaction created:', transaction);

      // Update the offer status to CLOSED
      await startupService.updateInvestmentOffer(selectedOffer.id, {
        status: 'CLOSED',
        startupId: selectedOffer.startupId || selectedOffer.startup?.id
      });

      // Close the dialog before refreshing to avoid any state conflicts
      setSelectedOffer(null);
      setPaymentDialogOpen(false);

      // Refresh the offers list to show updated status
      console.log('Refreshing offers list...');
      await fetchOffers();
      
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Failed to complete transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNegotiate = async (offer) => {
    try {
      setLoading(true);
      setError('');

      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('You must be logged in to negotiate offers');
      }

      // First create the transaction
      await transactionService.createTransaction({
        investorId: user.id,
        startupId: offer.startupId || offer.startup?.id,
        amount: offer.amount,
        status: 'NEGOTIATING',
        transactionDate: new Date().toISOString(),
        transactionType: 'NEGOTIATE',
        description: offer.description || '',
        offerId: offer.id
      });
      
      // Then update the offer status to NEGOTIATING
      const updateData = {
        status: 'NEGOTIATING',
        startupId: offer.startupId || offer.startup?.id
      };

      await startupService.updateInvestmentOffer(offer.id, updateData);
      
      // Refresh the offers list
      await fetchOffers();
      
      // Show success message
      setSuccess('Negotiation started successfully');
    } catch (err) {
      console.error('Negotiation error:', err);
      setError(err.message || 'Failed to negotiate offer');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedOffer(null);
    setError('');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      {/* Header Section */}
      <Card 
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
          }
        }}
      >
        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <MonetizationOn sx={{ fontSize: '2.5rem' }} />
            <Typography 
              variant="h3" 
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' },
                letterSpacing: '0.02em'
              }}
            >
              Investment Offers
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              opacity: 0.9,
              fontWeight: 400,
              maxWidth: '600px',
              letterSpacing: '0.01em'
            }}
          >
            Review and manage investment opportunities for this startup
          </Typography>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 4,
            borderRadius: '12px',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card 
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          {loading ? (
            <Box 
              display="flex" 
              flexDirection="column"
              justifyContent="center" 
              alignItems="center" 
              minHeight="300px"
              gap={2}
            >
              <CircularProgress size={40} />
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ mt: 2 }}
              >
                Loading investment offers...
              </Typography>
            </Box>
          ) : offers.length === 0 ? (
            <Box 
              display="flex" 
              flexDirection="column"
              justifyContent="center" 
              alignItems="center" 
              minHeight="300px"
              gap={2}
            >
              <TrendingUp sx={{ fontSize: '4rem', color: 'action.disabled' }} />
              <Typography 
                variant="h6" 
                color="text.secondary"
                align="center"
              >
                No investment offers available at the moment
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 1
                  }}
                >
                  Available Offers
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                >
                  Review the details of each investment offer below
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <InvestmentOfferList
                offers={offers}
                isInvestor={false}
                onAccept={handleAccept}
                onNegotiate={handleNegotiate}
                startupId={startupId}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <DummyPaymentDialog
        open={paymentDialogOpen}
        amount={selectedOffer?.amount}
        startupId={selectedOffer?.startupId || selectedOffer?.startup?.id}
        description={selectedOffer?.description || ''}
        onClose={handleClosePaymentDialog}
        onPaymentConfirmed={handlePaymentConfirmed}
      />
    </Container>
  );
};

export default TransactionPage;

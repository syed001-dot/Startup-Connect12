import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip, Button, Popover, Fade } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HandshakeIcon from '@mui/icons-material/Handshake';
import NegotiationDialog from './common/NegotiationDialog';
import messageService from '../services/messageService';
import authService from '../services/authService';
import startupService from '../services/startupService';
import transactionService from '../services/transactionService';

const InvestmentOfferList = ({ offers, isInvestor, onAccept, onNegotiate, startupId }) => {
  console.log('InvestmentOfferList isInvestor:', isInvestor);
  // Popover state at component level
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverOfferId, setPopoverOfferId] = useState(null);
  const [negotiationDialogOpen, setNegotiationDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [investmentOffers, setInvestmentOffers] = useState(offers || []);

  const handlePopoverOpen = (event, offerId) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverOfferId(offerId);
  };
  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverOfferId(null);
  };

  const handleNegotiateClick = (offer) => {
    setSelectedOffer(offer);
    setNegotiationDialogOpen(true);
  };

  const handleNegotiationSubmit = async ({ offerId, counterOffer, message }) => {
    const offer = investmentOffers.find(o => o.id === offerId);
    if (!offer) {
      alert('Offer not found');
      return;
    }

    // Get sender and receiver IDs
    const sender = authService.getCurrentUser();
    const senderId = sender?.user?.id || sender?.id;
    let receiverId = offer.userId;

    // Fallback: fetch startup userId if not present
    if (!receiverId && offer.startupId) {
      try {
        const startupData = await startupService.getStartupById(offer.startupId);
        receiverId = startupData.userId;
      } catch (err) {
        alert('Could not fetch startup user ID: ' + (err.message || err));
        return;
      }
    }

    if (!senderId || !receiverId) {
      alert('Could not determine sender or receiver');
      return;
    }

    const content = `Counter-offer: $${counterOffer}\nMessage: ${message}`;

    try {
      await messageService.sendMessage(senderId, receiverId, content);
      // Update offer status to NEGOTIATING
      await startupService.updateInvestmentOffer(offerId, { status: 'NEGOTIATING', startupId: offer.startupId });
      // Update local state
      setInvestmentOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'NEGOTIATING' } : o));
      // Create a transaction record for the negotiation
      await transactionService.createTransaction({
        investorId: offer.investorId || senderId,
        startupId: offer.startupId,
        amount: counterOffer,
        status: 'NEGOTIATING',
        transactionType: 'NEGOTIATION',
        description: message,
      });
      alert('Counter-offer sent, status updated, and negotiation transaction created!');
    } catch (err) {
      alert('Failed to send counter-offer, update status, or create transaction: ' + err.message);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {investmentOffers && investmentOffers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            No investment offers available.
          </Typography>
        )}
        {investmentOffers && investmentOffers.map((offer) => (
          <Grid item xs={12} sm={6} md={4} key={offer.id}>
            <Card
              sx={{
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'scale(1.04)',
                  boxShadow: 8,
                  border: '2px solid #1976d2',
                },
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => handlePopoverOpen(e, offer.id)}
              onMouseLeave={handlePopoverClose}
              aria-owns={popoverAnchor && popoverOfferId === offer.id ? 'mouse-over-popover' : undefined}
              aria-haspopup="true"
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ${offer.amount?.toLocaleString()}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {offer.equityPercentage}% Equity
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {offer.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Terms: {offer.terms}
                </Typography>
                <Chip 
                  label={offer.status || 'ACTIVE'} 
                  color={offer.status === 'CLOSED' ? 'default' : 'success'} 
                  size="small" 
                  sx={{ mt: 1 }} 
                />
                {/* Action Buttons */}
                {(onAccept || onNegotiate) && offer.status !== 'CLOSED' && (
                  <Box mt={2} display="flex" gap={1}>
                    {onAccept && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => onAccept(offer)}
                        startIcon={<CheckCircleIcon />}
                      >
                        Accept
                      </Button>
                    )}
                    {onNegotiate && (
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={() => handleNegotiateClick(offer)}
                        startIcon={<HandshakeIcon />}
                      >
                        Negotiate
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {isInvestor && investmentOffers && investmentOffers.length > 0 && startupId && (
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => window.location.href = `/transactions/${startupId}`}
          >
            View Offers
          </Button>
        </Box>
      )}
      <NegotiationDialog
        open={negotiationDialogOpen}
        onClose={() => setNegotiationDialogOpen(false)}
        offer={selectedOffer}
        onSubmit={handleNegotiationSubmit}
      />
    </Box>
  );
};

export default InvestmentOfferList;

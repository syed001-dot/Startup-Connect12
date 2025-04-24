import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip, Button, Popover, Fade } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HandshakeIcon from '@mui/icons-material/Handshake';

const InvestmentOfferList = ({ offers, isInvestor, onAccept, onNegotiate, startupId }) => {
  console.log('InvestmentOfferList isInvestor:', isInvestor);
  // Popover state at component level
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverOfferId, setPopoverOfferId] = useState(null);

  const handlePopoverOpen = (event, offerId) => {
    setPopoverAnchor(event.currentTarget);
    setPopoverOfferId(offerId);
  };
  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverOfferId(null);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {offers && offers.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            No investment offers available.
          </Typography>
        )}
        {offers && offers.map((offer) => (
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
                        onClick={() => onNegotiate(offer)}
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
      {isInvestor && offers && offers.length > 0 && startupId && (
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
    </Box>
  );
};

export default InvestmentOfferList;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box
} from '@mui/material';

const NegotiationDialog = ({ open, onClose, offer, onSubmit }) => {
  const [counterOffer, setCounterOffer] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({ offerId: offer.id, counterOffer, message });
    setSubmitting(false);
    setCounterOffer('');
    setMessage('');
    onClose();
  };

  React.useEffect(() => {
    if (!open) {
      setCounterOffer('');
      setMessage('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Negotiate Offer</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          <TextField
            label="Counter Offer Amount"
            type="number"
            value={counterOffer}
            onChange={e => setCounterOffer(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={submitting || !counterOffer || !message}
        >
          {submitting ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NegotiationDialog; 
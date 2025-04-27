import React, { useState } from 'react';
import { negotiationService } from '../services/negotiationService';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stepper,
    Step,
    StepLabel,
    Alert,
    CircularProgress
} from '@mui/material';
import DummyPaymentDialog from './DummyPaymentDialog';

const NegotiationComponent = ({ startupId, investorId, startupName, investorName }) => {
    const [offer, setOffer] = useState({
        startupId,
        investorId,
        proposedAmount: '',
        equityPercentage: '',
        notes: ''
    });
    const [activeStep, setActiveStep] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [negotiationStatus, setNegotiationStatus] = useState('PENDING');
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [currentTransactionId, setCurrentTransactionId] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setOffer(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await negotiationService.createOffer(offer);
            setNegotiationStatus(response.status);
            setCurrentTransactionId(response.id);
            setActiveStep(1);
        } catch (err) {
            setError(err.message || 'Failed to create offer');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        setLoading(true);
        try {
            const response = await negotiationService.acceptOffer(currentTransactionId);
            setNegotiationStatus(response.status);
            setActiveStep(2);
        } catch (err) {
            setError(err.message || 'Failed to accept offer');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            const response = await negotiationService.rejectOffer(currentTransactionId, rejectionReason);
            setNegotiationStatus(response.status);
            setShowRejectDialog(false);
            setActiveStep(2);
        } catch (err) {
            setError(err.message || 'Failed to reject offer');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentConfirmed = async () => {
        // Here you would typically update the transaction status to PAID
        // For now, we'll just close the payment dialog
        setShowPaymentDialog(false);
        setActiveStep(3); // Move to final step
    };

    const steps = ['Create Offer', 'Review Offer', 'Final Status', 'Payment Complete'];

    return (
        <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Investment Negotiation
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {startupName} - {investorName}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === 0 && (
                    <Box component="form" noValidate>
                        <TextField
                            fullWidth
                            label="Proposed Amount ($)"
                            name="proposedAmount"
                            type="number"
                            value={offer.proposedAmount}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Equity Percentage (%)"
                            name="equityPercentage"
                            type="number"
                            value={offer.equityPercentage}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            multiline
                            rows={4}
                            value={offer.notes}
                            onChange={handleInputChange}
                            margin="normal"
                        />
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit Offer'}
                        </Button>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Offer Details
                        </Typography>
                        <Typography>Amount: ${offer.proposedAmount}</Typography>
                        <Typography>Equity: {offer.equityPercentage}%</Typography>
                        <Typography>Notes: {offer.notes}</Typography>
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleAccept}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Accept Offer'}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => setShowRejectDialog(true)}
                                disabled={loading}
                            >
                                Reject Offer
                            </Button>
                        </Box>
                    </Box>
                )}

                {activeStep === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Negotiation Status
                        </Typography>
                        {negotiationStatus === 'ACCEPTED' ? (
                            <>
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Offer has been accepted! Please proceed with payment.
                                </Alert>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setShowPaymentDialog(true)}
                                    sx={{ mt: 2 }}
                                >
                                    Proceed to Payment
                                </Button>
                            </>
                        ) : (
                            <Alert severity="error">
                                Offer has been rejected. {rejectionReason && `Reason: ${rejectionReason}`}
                            </Alert>
                        )}
                    </Box>
                )}

                {activeStep === 3 && (
                    <Box>
                        <Alert severity="success">
                            Payment completed successfully! The transaction is now complete.
                        </Alert>
                    </Box>
                )}
            </CardContent>

            <Dialog open={showRejectDialog} onClose={() => setShowRejectDialog(false)}>
                <DialogTitle>Reject Offer</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Reason for Rejection"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                    <Button onClick={handleReject} color="error" disabled={!rejectionReason}>
                        Confirm Rejection
                    </Button>
                </DialogActions>
            </Dialog>

            <DummyPaymentDialog
                open={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                onPaymentConfirmed={handlePaymentConfirmed}
                amount={parseFloat(offer.proposedAmount)}
                startupId={startupId}
                description={`Investment in ${startupName} for ${offer.equityPercentage}% equity`}
            />
        </Card>
    );
};

export default NegotiationComponent; 
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import NegotiationComponent from '../components/NegotiationComponent';

const NegotiationPage = () => {
    // These values would typically come from your application state or route parameters
    const startupId = 1; // Example ID
    const investorId = 1; // Example ID
    const startupName = "TechStart Inc."; // Example name
    const investorName = "John Smith"; // Example name

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Investment Negotiation
                </Typography>
                <NegotiationComponent
                    startupId={startupId}
                    investorId={investorId}
                    startupName={startupName}
                    investorName={investorName}
                />
            </Box>
        </Container>
    );
};

export default NegotiationPage; 
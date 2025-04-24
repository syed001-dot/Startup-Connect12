import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Business,
  AttachMoney,
  TrendingUp,
  Email,
  LocationOn,
  Category,
  Timeline,
  Description,
  Message,
} from '@mui/icons-material';
import investorService from '../services/investorService';
import authService from '../services/authService';
import MessageDialog from '../components/common/MessageDialog';

const InvestorProfile = () => {
  const { id } = useParams();
  const [investor, setInvestor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const currentUser = authService.getCurrentUser();
  const [recentInvestments, setRecentInvestments] = useState([]);

  useEffect(() => {
    const fetchInvestorData = async () => {
      try {
        setLoading(true);
        const data = await investorService.getInvestorById(id);
        console.log('Fetched investor data:', data);
        setInvestor(data);
        
        try {
          const investments = await investorService.getInvestorInvestments(id);
          setRecentInvestments(investments);
        } catch (err) {
          console.error('Error fetching investments:', err);
          setRecentInvestments([]);
        }
      } catch (err) {
        console.error('Error fetching investor:', err);
        setError(err.message || 'Failed to fetch investor details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvestorData();
  }, [id]);

  // Helper function to format email display
  const getEmailDisplay = (investor) => {
    if (!investor) return 'Email not available';
    return investor.email || investor.user?.email || 'Email not available';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!investor) {
    return (
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 4 }}>
          Investor not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h3" gutterBottom>
              {investor.companyName || 'Company Name Not Available'}
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              {investor.user?.fullName || investor.fullName || 'Name Not Available'}
            </Typography>
            <Box display="flex" gap={1} mt={2}>
              <Chip 
                icon={<Category />} 
                label={investor.investmentFocus} 
                color="primary" 
              />
              <Chip 
                icon={<LocationOn />} 
                label={investor.location || 'Location not specified'} 
              />
              <Chip 
                icon={<Email />} 
                label={investor.user?.email || investor.email || 'Email not available'}
                color="info"
                sx={{
                  maxWidth: '300px',
                  '& .MuiChip-label': {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* About Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description color="primary" />
              About
            </Typography>
            <Typography variant="body1" paragraph>
              {investor.description || 'No description provided'}
            </Typography>
          </Paper>

          {/* Investment History */}
          <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timeline color="primary" />
              Recent Investments
            </Typography>
            {recentInvestments.length > 0 ? (
              <List>
                {recentInvestments.map((investment, index) => (
                  <React.Fragment key={investment.id}>
                    <ListItem>
                      <ListItemIcon>
                        <TrendingUp color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={investment.startupName}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              ${investment.amount?.toLocaleString()} - {investment.stage}
                            </Typography>
                            <br />
                            <Typography component="span" variant="caption" color="text.secondary">
                              {new Date(investment.date).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < recentInvestments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">No recent investments available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Investment Details Card */}
          <Card elevation={3} sx={{ mb: 4, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Investment Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Minimum Investment"
                    secondary={`$${investor.minimumInvestment?.toLocaleString() || 'Not specified'}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Preferred Industries"
                    secondary={investor.investmentFocus || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Contact Email"
                    secondary={investor.user?.email || investor.email || 'Email not available'}
                    sx={{
                      '& .MuiTypography-root': {
                        wordBreak: 'break-all'
                      }
                    }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Investment Criteria Card */}
          <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Investment Criteria
              </Typography>
              <List>
                {investor.investmentCriteria?.map((criteria, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrendingUp color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={criteria} />
                  </ListItem>
                )) || (
                  <ListItem>
                    <ListItemText secondary="No specific criteria listed" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Message Dialog */}
      <MessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        senderId={currentUser?.user?.id || currentUser?.id}
        receiverId={investor?.userId}
        receiverName={investor?.name}
      />
    </Container>
  );
};

export default InvestorProfile; 
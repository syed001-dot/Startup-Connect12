import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Close as CloseIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import investorService from '../services/investorService';
import authService from '../services/authService';

const Investors = () => {
  const navigate = useNavigate();
  const [investors, setInvestors] = useState([]);
  const [trendingInvestments, setTrendingInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [investorsData, investmentsData] = await Promise.all([
        investorService.getAllInvestors(),
        investorService.getTrendingInvestments()
      ]);
      setInvestors(investorsData);
      setTrendingInvestments(investmentsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewDetails = (investor) => {
    setSelectedInvestor(investor);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInvestor(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredInvestors = investors.filter(investor => 
    (investor.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (investor.investmentFocus?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (investor.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          Discover Investors
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search investors by name, investment focus, or description"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ mb: 3 }}
        >
          <Tab label="All Investors" />
          <Tab label="Trending Investments" />
        </Tabs>

        {activeTab === 0 ? (
          <Grid container spacing={3}>
            {filteredInvestors.map((investor) => (
              <Grid item xs={12} sm={6} md={4} key={investor.id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                      <Typography variant="h6" component="div">
                        {investor.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {investor.description && (investor.description.length > 150 
                        ? `${investor.description.substring(0, 150)}...` 
                        : investor.description)}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={investor.investmentFocus} 
                        size="small" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                      <Chip 
                        label={`Min. Investment: $${investor.minimumInvestment?.toLocaleString() || 'N/A'}`}
                        size="small" 
                        color="primary" 
                        sx={{ mb: 1 }} 
                      />
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewDetails(investor)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/investor/${investor.id}`)}
                    >
                      Learn More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {trendingInvestments.map((investment) => (
              <Grid item xs={12} sm={6} md={4} key={investment.id}>
                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                      <Typography variant="h6" component="div">
                        {investment.startupName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <AccountBalanceIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2">
                        Investor: {investment.investorName}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={`Amount: $${investment.amount?.toLocaleString() || 'N/A'}`}
                        size="small" 
                        color="success" 
                        sx={{ mr: 1, mb: 1 }} 
                      />
                      {investment.startupStage && (
                        <Chip 
                          label={investment.startupStage} 
                          size="small" 
                          sx={{ mb: 1 }} 
                        />
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/startup/${investment.startupId}`)}
                    >
                      View Startup
                    </Button>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/investor/${investment.investorId}`)}
                    >
                      View Investor
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Investor Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedInvestor && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {selectedInvestor.name}
                  </Typography>
                  <IconButton onClick={handleCloseDialog}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedInvestor.description || 'No description available'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Investment Focus
                    </Typography>
                    <Chip label={selectedInvestor.investmentFocus} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Minimum Investment
                    </Typography>
                    <Typography variant="body1">
                      ${selectedInvestor.minimumInvestment?.toLocaleString() || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Close</Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => {
                    handleCloseDialog();
                    navigate(`/investor/${selectedInvestor.id}`);
                  }}
                >
                  View Full Profile
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default Investors; 
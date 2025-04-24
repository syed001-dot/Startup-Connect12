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
  DialogActions
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import startupService from '../services/startupService';
import authService from '../services/authService';

const Startups = () => {
  const navigate = useNavigate();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [openLoginPrompt, setOpenLoginPrompt] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setIsAuthenticated(!!user);
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await startupService.getAllStartups();
      setStartups(data);
    } catch (err) {
      console.error('Error fetching startups:', err);
      setError(err.message || 'Failed to fetch startups. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleViewDetails = (startup) => {
    setSelectedStartup(startup);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStartup(null);
  };

  const handleStartupClick = (startupId) => {
    if (!isAuthenticated) {
      setOpenLoginPrompt(true);
      return;
    }
    navigate(`/startup/${startupId}`);
  };

  const handleCloseLoginPrompt = () => {
    setOpenLoginPrompt(false);
  };

  const handleLoginClick = () => {
    setOpenLoginPrompt(false);
    navigate('/login');
  };

  const filteredStartups = startups.filter(startup => 
    (startup.startupName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (startup.industry?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (startup.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
          Discover Startups
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
            placeholder="Search startups by name, industry, or description"
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

        <Grid container spacing={3}>
          {filteredStartups.map((startup) => (
            <Grid item xs={12} sm={6} md={4} key={startup.id}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <BusinessIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" component="div">
                      {startup.startupName}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {startup.description && (startup.description.length > 150 
                      ? `${startup.description.substring(0, 150)}...` 
                      : startup.description)}
                  </Typography>
                  
                  <Box sx={{ mt: 2 }}>
                    <Chip 
                      label={startup.industry} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                    <Chip 
                      label={startup.fundingStage} 
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
                    onClick={() => handleViewDetails(startup)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleStartupClick(startup.id)}
                  >
                    View Full Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Startup Details Dialog */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedStartup && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {selectedStartup.startupName}
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
                      {selectedStartup.description || 'No description available'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Industry
                    </Typography>
                    <Chip label={selectedStartup.industry} />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Funding Stage
                    </Typography>
                    <Chip label={selectedStartup.fundingStage} color="primary" />
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
                    handleStartupClick(selectedStartup.id);
                  }}
                >
                  View Full Profile
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Login Prompt Dialog */}
        <Dialog
          open={openLoginPrompt}
          onClose={handleCloseLoginPrompt}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Login Required
              </Typography>
              <IconButton onClick={handleCloseLoginPrompt}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" paragraph>
              Please log in to view the full startup profile and access additional features.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLoginPrompt}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleLoginClick}
            >
              Login
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Startups; 
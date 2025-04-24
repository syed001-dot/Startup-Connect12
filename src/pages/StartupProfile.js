import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Link,
  Divider,
  Tooltip,
  Button
} from '@mui/material';
import {
  Business,
  Description,
  People,
  AttachMoney,
  Email
} from '@mui/icons-material';
import startupService from '../services/startupService';
import authService from '../services/authService';
import pitchDeckService from '../services/pitchDeckService';
import investorService from '../services/investorService';
import PitchDeckList from '../components/PitchDeckList';
import InvestmentOfferList from '../components/InvestmentOfferList';

import PitchDeckViewer from '../components/PitchDeckViewer';
import MessageDialog from '../components/common/MessageDialog';
import DummyPaymentDialog from '../components/DummyPaymentDialog';

const StartupProfile = () => {
  // ...existing state...
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [acceptSuccess, setAcceptSuccess] = useState('');

  // Payment modal state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [receiverId, setReceiverId] = useState(null); // <-- add this state
  const [pitchDecks, setPitchDecks] = useState([]);
  const [investmentOffers, setInvestmentOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInvestor, setIsInvestor] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);

  // Handler to navigate to TransactionPage
  const navigateToOffers = () => {
    window.location.href = `/transactions/${id}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const user = authService.getCurrentUser();
        console.log('Current user:', user);
        const role = user?.role || user?.user?.role;
        console.log('user.role:', role);
        const investorCheck = role && role.toLowerCase() === 'investor';
        console.log('isInvestor:', investorCheck);
        setIsInvestor(investorCheck);

        try {
          // Fetch startup details
          const startupData = await startupService.getStartupById(id);
          console.log('Startup data:', startupData);
          setStartup(startupData);
          
          // Set the receiver ID from the startup's userId
          if (startupData?.userId) {
            console.log('Setting receiver ID from startup userId:', startupData.userId);
            setReceiverId(startupData.userId);
          } else {
            console.error('No user ID found in startup data:', startupData);
            setError('Could not find user ID for this startup');
          }

          // Fetch public pitch decks for this startup
          if (startupData?.id) {
            try {
              const decks = await pitchDeckService.getPublicPitchDecksByStartup(startupData.id);
              setPitchDecks(decks);
            } catch {
              setPitchDecks([]);
            }
          }

          // Fetch investment offers
          const offers = await startupService.getInvestmentOffers(id);
          setInvestmentOffers(offers);
        } catch (err) {
          console.error('Error in fetchData:', err);
          setError(err.message || 'Failed to fetch startup details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!startup) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Startup not found
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        {/* Company Name Card */}
        <Card elevation={4} sx={{
          mb: 6,
          p: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'primary.contrastText',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
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
        }}>
          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h2"
              component="h1"
              align="center"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.02em',
                fontFamily: 'Montserrat, Roboto, Arial',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(to right, #fff, #e3f2fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            >
              {startup.startupName || 'Startup'}
            </Typography>
            <Typography
              variant="h6"
              align="center"
              sx={{ 
                opacity: 0.9,
                mb: 4,
                fontWeight: 400,
                letterSpacing: '0.05em'
              }}
            >
              Innovating the Future
            </Typography>
            {isInvestor && (
              <Box 
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  mt: 3
                }}
              >
                <Button 
                  variant="contained" 
                  onClick={navigateToOffers}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    color: 'primary.dark',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Offers
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => setMessageDialogOpen(true)}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.9)',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Message Startup
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Info Grid */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {[
            {
              icon: <Business fontSize="large" sx={{ color: '#1976d2', fontSize: '2.5rem' }} />,
              title: 'Industry',
              value: startup.industry || 'Not specified',
              color: '#1976d2',
              tooltip: 'The industry this startup operates in'
            },
            {
              icon: <AttachMoney fontSize="large" sx={{ color: '#2e7d32', fontSize: '2.5rem' }} />,
              title: 'Funding Stage',
              value: startup.fundingStage || 'Not specified',
              color: '#2e7d32',
              tooltip: 'Current funding stage of the startup'
            },
            {
              icon: <People fontSize="large" sx={{ color: '#0288d1', fontSize: '2.5rem' }} />,
              title: 'Team Size',
              value: startup.teamSize || 'Not specified',
              color: '#0288d1',
              tooltip: 'Number of people in the team'
            },
            {
              icon: <Description fontSize="large" sx={{ color: '#ed6c02', fontSize: '2.5rem' }} />,
              title: 'Website',
              value: startup.website ? (
                <Link 
                  href={startup.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{
                    color: '#ed6c02',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {startup.website}
                </Link>
              ) : 'No website provided',
              color: '#ed6c02',
              tooltip: "Startup's official website"
            }
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Tooltip title={item.tooltip} arrow placement="top">
                <Card sx={{
                  height: '100%',
                  borderRadius: '16px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                    borderColor: item.color,
                  },
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box 
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        gap: 1.5
                      }}
                    >
                      {item.icon}
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary'
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: 'text.secondary',
                        fontSize: '1.1rem'
                      }}
                    >
                      {item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          ))}
        </Grid>

        {/* Description Section */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 6, 
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Description sx={{ color: 'primary.main', fontSize: '2rem' }} />
              About the Startup
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                letterSpacing: '0.01em'
              }}
            >
              {startup.description || 'No description provided'}
            </Typography>
          </CardContent>
        </Card>

        {/* Pitch Decks Section */}
        <Card 
          elevation={0} 
          sx={{ 
            mb: 6, 
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Description sx={{ color: 'primary.main', fontSize: '2rem' }} />
              Pitch Decks
            </Typography>
            {pitchDecks.length === 0 ? (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '1.1rem'
                }}
              >
                No pitch decks available at the moment.
              </Typography>
            ) : (
              <PitchDeckList 
                pitchDecks={pitchDecks} 
                onPreview={async (deck) => {
                  setSelectedDeck(deck);
                  if (deck.fileType === 'application/pdf') {
                    try {
                      const url = await pitchDeckService.previewPublicPitchDeck(deck.id);
                      setSelectedDeck({ ...deck, fileUrl: url });
                    } catch (err) {
                      setSelectedDeck({ ...deck, fileUrl: '' });
                    }
                  } else {
                    setSelectedDeck(deck);
                  }
                  setViewerOpen(true);
                }} 
              />
            )}
          </CardContent>
        </Card>

        {/* Investment Offers Section */}
        <Card 
          elevation={0} 
          sx={{ 
            borderRadius: '20px',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 4 
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <AttachMoney sx={{ color: 'primary.main', fontSize: '2rem' }} />
                Investment Offers
              </Typography>
              {isInvestor && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={navigateToOffers}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      px: 3,
                      py: 1,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={<AttachMoney />}
                  >
                    View All Offers
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setMessageDialogOpen(true)}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      px: 3,
                      py: 1,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        bgcolor: 'rgba(25, 118, 210, 0.04)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    startIcon={<Email />}
                  >
                    Message
                  </Button>
                </Box>
              )}
            </Box>
            
            {accepting && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress size={32} />
              </Box>
            )}
            
            {acceptSuccess && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px'
                }}
              >
                {acceptSuccess}
              </Alert>
            )}
            
            {acceptError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: '12px'
                }}
              >
                {acceptError}
              </Alert>
            )}
            
            <InvestmentOfferList 
              offers={investmentOffers} 
              isInvestor={isInvestor} 
              startupId={id} 
            />
          </CardContent>
        </Card>
      </Container>

      {/* Dialogs */}
      <PitchDeckViewer
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        url={selectedDeck && selectedDeck.fileType === 'application/pdf' ? selectedDeck.fileUrl : ''}
        fileType={selectedDeck ? selectedDeck.fileType : ''}
      />

      <MessageDialog
        open={messageDialogOpen}
        onClose={() => setMessageDialogOpen(false)}
        senderId={authService.getCurrentUser()?.user?.id || authService.getCurrentUser()?.id}
        receiverId={receiverId}
        receiverName={startup?.startupName}
      />

      <DummyPaymentDialog
        open={paymentOpen}
        amount={selectedOffer?.amount}
        onClose={() => setPaymentOpen(false)}
        onSuccess={async () => {
          setPaymentOpen(false);
          if (selectedOffer && isInvestor) {
            setAccepting(true);
            setAcceptError('');
            setAcceptSuccess('');
            try {
              await investorService.invest({ offerId: selectedOffer.id, amount: selectedOffer.amount });
              setAcceptSuccess('Investment successful!');
              const offers = await startupService.getInvestmentOffers(id);
              setInvestmentOffers(offers);
            } catch (err) {
              setAcceptError(err.message || 'Failed to invest.');
            } finally {
              setAccepting(false);
            }
          }
        }}
      />
    </>
  );
};

export default StartupProfile;
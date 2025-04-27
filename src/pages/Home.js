import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HandshakeIcon from '@mui/icons-material/Handshake';


const sectorImageMap = {
  Technology: '/Technology.jpg',
  Healthcare: '/Healthcare.jpg',
  Finance: '/Finance.jpg',
  Education: '/Education.jpg',
  Agriculture: '/Agriculture.jpg',
  Manufacturing: '/manufacturing.jpg',
  Retail: '/retail.jpg',
  'Real Estate': '/real estate.jpg',
  Energy: '/energy.jpg',
  Transportation: '/transportation.jpg',
  'Media & Entertainment': '/entertainment.jpg',
  Other: '/other.jpg',
};

const getSectorImage = (sector) => {
  if (!sector) return '/startup.jpg';
  const normalized = sector.trim().toLowerCase();
  for (const key in sectorImageMap) {
    if (key.toLowerCase() === normalized) return sectorImageMap[key];
    // Fuzzy match for partials
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) return sectorImageMap[key];
  }
  return '/startup.jpg';
};

const carouselImages = ['/gmagr.jpg', '/investor.webp', '/startup.jpg'];

const Home = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  // Carousel state
  const [carouselIdx, setCarouselIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIdx(idx => (idx + 1) % carouselImages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let mounted = true;
    import('../services/startupService').then(({ default: startupService }) => {
      startupService.getAllStartups().then(data => {
        if (mounted) {
          setStartups(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      }).catch(() => {
        if (mounted) {
          setStartups([]);
          setLoading(false);
        }
      });
    });
    return () => { mounted = false; };
  }, []);
  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: { xs: 8, md: 15 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Connecting Startups with Investors
              </Typography>
              <Typography 
                variant="h5" 
                component="div" 
                sx={{ mb: 4, opacity: 0.9 }}
              >
                A platform that bridges the gap between innovative startups and potential investors.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
              >
                <Button 
                  variant="contained" 
                  size="large" 
                  component={RouterLink} 
                  to="/register"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={RouterLink} 
                  to="/about"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Learn More
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              {/* Simple Carousel */}
              <Box
                component="img"
                src={carouselImages[carouselIdx]}
                alt="Startup and investor meeting"
                sx={{
                  width: '100%',
                  height: 320,
                  objectFit: 'cover',
                  borderRadius: 2,
                  boxShadow: 10,
                  transition: 'opacity 0.5s',
                  background: '#e0e0e0',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ fontWeight: 'bold', mb: 6 }}
        >
          How It Works
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <BusinessIcon sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  For Startups
                </Typography>
                <Typography>
                  Create your profile, showcase your business ideas, upload pitch decks, and connect with potential investors who match your industry and funding requirements.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <MonetizationOnIcon sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  For Investors
                </Typography>
                <Typography>
                  Browse promising ventures based on your interests and investment preferences. Filter startups by industry, location, and funding stage to find your next investment opportunity.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <HandshakeIcon sx={{ fontSize: 80, color: 'primary.main' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h3" align="center">
                  Make Connections
                </Typography>
                <Typography>
                  Our intelligent matchmaking algorithm connects startups with investors based on mutual interests. Communicate directly and securely through our platform to explore potential collaborations.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      
      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container>
          <Grid container spacing={4} textAlign="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" color="primary" fontWeight="bold">500+</Typography>
              <Typography variant="h6">Startups</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" color="primary" fontWeight="bold">200+</Typography>
              <Typography variant="h6">Investors</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" color="primary" fontWeight="bold">$50M+</Typography>
              <Typography variant="h6">Funding Secured</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Featured Startups */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ mb: 6 }}
        >
          Featured Startups
        </Typography>
        
        <Grid container spacing={4}>
          {(loading ? Array(3).fill(null) : (startups.length >= 3 ? startups.slice(0, 3) : [...startups, ...Array(3 - startups.length).fill(null)])).map((startup, idx) => {
            if (!startup) {
              // Placeholder card
              return (
                <Grid item key={idx} xs={12} sm={6} md={4}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: 0.7 }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={getSectorImage('Other')}
                      alt="Startup Placeholder"
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h3">
                        Startup
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Sector • Stage
                      </Typography>
                      <Typography variant="body2">
                        Startup details unavailable.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
            const sector = startup.industry || startup.sector || startup.category || 'Other';
            const stage = startup.fundingStage || startup.stage || 'Seed Stage';
            const name = startup.startupName || startup.companyName || startup.name || 'Startup';
            const desc = startup.description || 'No description provided.';
            return (
              <Grid item key={startup.id || idx} xs={12} sm={6} md={4}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={getSectorImage(sector)}
                    alt={name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h3">
                      {name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {sector} • {stage}
                    </Typography>
                    <Typography variant="body2">
                      {desc.length > 120 ? desc.slice(0, 117) + '...' : desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            component={RouterLink} 
            to="/startups"
            size="large"
          >
            View All Startups
          </Button>
        </Box>
      </Container>
      
      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h4" gutterBottom>
                Ready to Connect?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join our platform today and start your journey towards successful partnerships.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                justifyContent="center"
              >
                <Button 
                  variant="contained" 
                  size="large" 
                  component={RouterLink} 
                  to="/register?type=startup"
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  Join as Startup
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  component={RouterLink} 
                  to="/register?type=investor"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Join as Investor
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 
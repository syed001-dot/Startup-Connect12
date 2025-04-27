import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link,
  Divider,
  IconButton
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import InstagramIcon from '@mui/icons-material/Instagram';

const Footer = () => {
  return (
    <Box
      sx={{
        bgcolor: 'primary.dark',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
      component="footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Startup Connect
            </Typography>
            <Typography variant="body2">
              Bridging the gap between innovative startups and potential investors.
              Our platform enables seamless networking, funding opportunities, and collaboration.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Instagram"
                component="a"
                href="https://www.instagram.com/syed.k.ahmed.29?igsh=b3ViZDI0ajhlNjN5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link href="/" color="inherit" sx={{ mb: 1 }}>
                Home
              </Link>
              <Link href="/about" color="inherit" sx={{ mb: 1 }}>
                About Us
              </Link>
              <Link href="/startups" color="inherit" sx={{ mb: 1 }}>
                Startups
              </Link>
              <Link href="/investors" color="inherit" sx={{ mb: 1 }}>
                Investors
              </Link>
              
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body2" paragraph>
              Dayananda Sagar College of Arts, Science and Commerce
            </Typography>
            <Typography variant="body2" paragraph>
              Email: info@startupconnect.com
            </Typography>
            <Typography variant="body2">
              Phone: +91 1234567890
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.2)' }} />
        
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} Startup Connect. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
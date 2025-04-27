import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, Divider, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
// Import slick-carousel CSS in your main index.js or App.js:
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

const aboutSections = [
  {
    title: 'Our Mission',
    content:
      'To bridge the gap between innovative startups and forward-thinking investors, fostering a thriving ecosystem where ideas become impactful realities.'
  },
  {
    title: 'What We Do',
    content:
      'Startup Connect is a platform designed to empower entrepreneurs and connect them with potential investors. We provide a space for startups to showcase their vision and for investors to discover the next big thing.'
  },
  {
    title: 'Why Choose Us?',
    content:
      'Our user-friendly platform, robust vetting process, and commitment to transparency make us the ideal choice for both startups seeking funding and investors seeking opportunities.'
  },
  {
    title: 'For College Projects',
    content:
      'This project was developed as part of an academic initiative to demonstrate full-stack web development, modern UI/UX, and real-world problem solving.'
  }
];

const teamMembers = [
  {
    name: 'SYED SUHAIL PASHA',
    role: 'Student',
    img: '/suhail.jpg',
    description: 'Studying at Dayananda Sagar College of Arts, Science and Commerce.'
  },
  {
    name: 'SYED KAIF AHMED',
    role: 'Student',
    img: '/kaif.jpg',
    description: 'Studying at Dayananda Sagar College of Arts, Science and Commerce.'
  },
  {
    name: 'ALL FACULTY',
    role: 'Special Thanks',
    img: '/dscasc.jpg',
    description: 'Special thanks for all teachers for guidance.'
  }
];

const cardVariants = {
  offscreen: { y: 100, opacity: 0 },
  onscreen: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8 } }
};

const About = () => {
  const [open, setOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const handleOpen = (member) => {
    setSelectedMember(member);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelectedMember(null);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 900, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
            About Startup Connect
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Empowering Entrepreneurs. Enabling Investors. Elevating Innovation.
          </Typography>
        </motion.div>
        <Divider sx={{ my: 4 }} />
        <Grid container spacing={4}>
          {aboutSections.map((section, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <motion.div
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.3 }}
                variants={cardVariants}
              >
                <Card
                  sx={{
                    height: '100%',
                    boxShadow: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.04)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {section.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {section.content}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        {/* Meet the Team Carousel */}
        <Box sx={{ mt: 8 }}>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <Typography variant="h4" align="center" fontWeight="bold" gutterBottom color="primary">
              Meet the Team
            </Typography>
            <Slider {...sliderSettings}>
              {teamMembers.map((member, idx) => (
                <Box key={idx} sx={{ px: 2, outline: 'none' }}>
                  <Card
                    sx={{
                      textAlign: 'center',
                      p: 3,
                      boxShadow: 3,
                      cursor: 'pointer',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'scale(1.06)',
                        boxShadow: 6,
                        bgcolor: 'grey.100'
                      }
                    }}
                    onClick={() => handleOpen(member)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <img
                        src={member.img}
                        alt={member.name}
                        style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 10px #eee' }}
                        loading="lazy"
                      />
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {member.role}
                    </Typography>
                  </Card>
                </Box>
              ))}
            </Slider>
          </motion.div>
        </Box>
        {/* Team Member Modal */}
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ m: 0, p: 2 }}>
            {selectedMember?.name}
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ textAlign: 'center' }}>
            {selectedMember && (
              <>
                <img
                  src={selectedMember.img}
                  alt={selectedMember.name}
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: 16 }}
                />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {selectedMember.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedMember.description}
                </Typography>
              </>
            )}
          </DialogContent>
        </Dialog>
        <Box sx={{ mt: 6, textAlign: 'center', color: 'grey.600' }}>
          <Typography variant="body2">
            &copy; {new Date().getFullYear()} Startup Connect | College Project
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default About;

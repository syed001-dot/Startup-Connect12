import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  FormControl,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Grid,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment
} from '@mui/material';
import authService from '../services/authService';

const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Agriculture',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Energy',
  'Transportation',
  'Media & Entertainment',
  'Other'
];

const INVESTMENT_FOCUS_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Agriculture',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Energy',
  'Transportation',
  'Media & Entertainment',
  'Other'
];

const FUNDING_STAGE_OPTIONS = [
  'Idea Stage',
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Growth',
  'IPO Ready'
];

function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    // Step 1: Account Information
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '',
    
    // Step 2: Profile Information
    // Startup Profile
    startupName: '',
    startupDescription: '',
    industry: '',
    fundingStage: '',
    
    // Investor Profile
    companyName: '',
    sector: '',
    investmentRangeMin: '',
    investmentRangeMax: '',
    location: '',
    investmentFocus: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    // Validate step 1
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName || !formData.role) {
        setError('Please fill all required fields');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    setError('');
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate step 2
      if (formData.role === 'STARTUP') {
        if (!formData.startupName || !formData.industry || !formData.fundingStage) {
          setError('Please fill in all required startup fields');
          setLoading(false);
          return;
        }
      } else if (formData.role === 'INVESTOR') {
        if (!formData.companyName || !formData.sector || !formData.location || !formData.investmentFocus) {
          setError('Please fill in all required investor fields');
          setLoading(false);
          return;
        }
        
        // Validate investment range
        const minInvestment = parseFloat(formData.investmentRangeMin);
        const maxInvestment = parseFloat(formData.investmentRangeMax);
        
        if (isNaN(minInvestment) || isNaN(maxInvestment)) {
          setError('Please enter valid investment range values');
          setLoading(false);
          return;
        }
        
        if (minInvestment < 0 || maxInvestment < 0) {
          setError('Investment range values cannot be negative');
          setLoading(false);
          return;
        }
        
        if (minInvestment > maxInvestment) {
          setError('Minimum investment cannot be greater than maximum investment');
          setLoading(false);
          return;
        }
      }
      
      // Prepare data for registration
      const registrationData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: formData.role
      };

      // Add role-specific data
      if (formData.role === 'STARTUP') {
        registrationData.startupName = formData.startupName;
        registrationData.startupDescription = formData.startupDescription || '';
        registrationData.industry = formData.industry;
        registrationData.fundingStage = formData.fundingStage;
      } else if (formData.role === 'INVESTOR') {
        registrationData.companyName = formData.companyName;
        registrationData.sector = formData.sector;
        registrationData.investmentRangeMin = parseFloat(formData.investmentRangeMin);
        registrationData.investmentRangeMax = parseFloat(formData.investmentRangeMax);
        registrationData.location = formData.location;
        registrationData.investmentFocus = formData.investmentFocus;
        registrationData.description = formData.description || '';
      }

      console.log('Sending registration data:', registrationData);
      const response = await authService.register(registrationData);
      console.log('Registration response:', response);
      
      if (response && response.token) {
        // Store the token and user data
        localStorage.setItem('user', JSON.stringify(response));
        
        // Redirect based on user role
        if (response.user.role === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (response.user.role === 'STARTUP') {
          navigate('/startup-dashboard');
        } else if (response.user.role === 'INVESTOR') {
          navigate('/investor-dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(typeof err === 'string' ? err : (err.message || 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  label="Role"
                >
                  <MenuItem value="STARTUP">Startup</MenuItem>
                  <MenuItem value="INVESTOR">Investor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return formData.role === 'STARTUP' ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Startup Name"
                name="startupName"
                value={formData.startupName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="startupDescription"
                multiline
                rows={4}
                value={formData.startupDescription}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Funding Stage"
                name="fundingStage"
                value={formData.fundingStage}
                onChange={handleChange}
              >
                {FUNDING_STAGE_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Sector"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Minimum Investment Range"
                name="investmentRangeMin"
                type="number"
                value={formData.investmentRangeMin}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                helperText="Enter amount in dollars"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Maximum Investment Range"
                name="investmentRangeMax"
                type="number"
                value={formData.investmentRangeMax}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                helperText="Enter amount in dollars"
                error={parseFloat(formData.investmentRangeMax) < parseFloat(formData.investmentRangeMin)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                select
                label="Investment Focus"
                name="investmentFocus"
                value={formData.investmentFocus}
                onChange={handleChange}
              >
                {INVESTMENT_FOCUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Register
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            <Step>
              <StepLabel>Account Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>Profile Information</StepLabel>
            </Step>
          </Stepper>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Back
                </Button>
              )}
              {activeStep === 0 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  Create Account
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
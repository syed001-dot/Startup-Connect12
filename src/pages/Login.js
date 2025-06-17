import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert
} from '@mui/material';
import authService from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(formData.email, formData.password);
            // Redirect based on user role
            if (response.user.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (response.user.role === 'STARTUPS') {
                navigate('/startup-dashboard');
            } else if (response.user.role === 'INVESTORS') {
                navigate('/investor-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
            }}
        >
            <Container component="main" maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper elevation={6} sx={{
                    p: { xs: 4, sm: 6 },
                    width: { xs: '100%', sm: 420 },
                    borderRadius: 4,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    transition: 'box-shadow 0.3s cubic-bezier(.4,2,.6,1), transform 0.3s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                        boxShadow: '0 16px 48px 0 rgba(31,38,135,0.28)',
                        transform: 'scale(1.03)',
                    },
                }}>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                        <video 
                            src="/logo.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ width: 144, height: 144, borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'cover' }}
                            aria-label="Logo animation"
                        />
                    </Box>
                    <Typography component="h1" variant="h4" align="center" fontWeight={700} gutterBottom>
                        Welcome
                    </Typography>
                    <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 2 }}>
                        Sign in to your account
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={formData.email}
                            onChange={handleChange}
                            size="large"
                            sx={{ fontSize: 18, mb: 2 }}
                            InputProps={{ sx: { fontSize: 18, height: 56 } }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            size="large"
                            sx={{ fontSize: 18, mb: 2 }}
                            InputProps={{ sx: { fontSize: 18, height: 56 } }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 3, mb: 2, py: 1.5, fontSize: 18, fontWeight: 600, borderRadius: 3,
                                boxShadow: '0 4px 20px 0 rgba(31, 38, 135, 0.10)',
                                background: 'linear-gradient(90deg, #1976d2 0%, #64b5f6 100%)',
                                transition: 'background 0.3s',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #1565c0 0%, #42a5f5 100%)',
                                },
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;
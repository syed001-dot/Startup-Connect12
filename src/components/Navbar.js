import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Box,
    useTheme,
    Menu,
    MenuItem,
    Avatar,
    Divider,
    ListItemIcon,
    Badge,
    Tooltip,
} from '@mui/material';
import {
    Brightness4 as Brightness4Icon,
    Brightness7 as Brightness7Icon,
    AccountCircle,
    Dashboard,
    Business,
    People,
    Assessment,
    ExitToApp,
    Notifications,
    Settings,
    Mail,
} from '@mui/icons-material';
import authService from '../services/authService';

const Navbar = ({ darkMode, toggleTheme }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [messagesAnchorEl, setMessagesAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationMenu = (event) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleMessagesMenu = (event) => {
        setMessagesAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNotificationAnchorEl(null);
        setMessagesAnchorEl(null);
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
        handleClose();
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'ADMIN':
                return '/admin-dashboard';
            case 'INVESTOR':
                return '/investor-dashboard';
            case 'STARTUP':
                return '/startup-dashboard';
            default:
                return '/';
        }
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{
                zIndex: theme.zIndex.drawer + 1,
                backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : theme.palette.primary.main,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <Toolbar>
                <Typography 
                    variant="h6" 
                    component={RouterLink} 
                    to="/" 
                    sx={{ 
                        flexGrow: 1, 
                        textDecoration: 'none', 
                        color: 'inherit',
                        fontWeight: 'bold',
                        '&:hover': {
                            opacity: 0.8
                        }
                    }}
                >
                    Startup Connect
                </Typography>

                {user ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to="/investors"
                            sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <People sx={{ mr: 1 }} />
                            Investors
                        </Button>

                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to={getDashboardLink()}
                            sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                        >
                            <Dashboard sx={{ mr: 1 }} />
                            Dashboard
                        </Button>

                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton color="inherit" onClick={handleNotificationMenu}>
                                <Badge badgeContent={3} color="error">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Messages */}
                        <Tooltip title="Messages">
                            <IconButton color="inherit" onClick={handleMessagesMenu}>
                                <Badge badgeContent={2} color="error">
                                    <Mail />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Theme Toggle */}
                        <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
                            <IconButton onClick={toggleTheme} color="inherit">
                                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
                            </IconButton>
                        </Tooltip>

                        {/* Profile Menu */}
                        <Tooltip title="Account settings">
                            <IconButton
                                onClick={handleMenu}
                                size="small"
                                sx={{ ml: 2 }}
                                aria-controls={Boolean(anchorEl) ? 'account-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
                            >
                                <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                ) : (
                    <Box>
                        <Button 
                            color="inherit" 
                            component={RouterLink} 
                            to="/login"
                            sx={{ 
                                mr: 1,
                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                            }}
                        >
                            Login
                        </Button>
                        <Button 
                            variant="contained" 
                            component={RouterLink} 
                            to="/register"
                            sx={{ 
                                backgroundColor: theme.palette.secondary.main,
                                '&:hover': { backgroundColor: theme.palette.secondary.dark }
                            }}
                        >
                            Register
                        </Button>
                    </Box>
                )}

                {/* Profile Menu Items */}
                <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    onClick={handleClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                        },
                    }}
                >
                    <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                        <ListItemIcon>
                            <AccountCircle fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
                        <ListItemIcon>
                            <Settings fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <ExitToApp fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>

                {/* Notifications Menu */}
                <Menu
                    anchorEl={notificationAnchorEl}
                    open={Boolean(notificationAnchorEl)}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            width: 320,
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem>
                        <Typography variant="subtitle2" color="primary">New Investment Opportunity</Typography>
                    </MenuItem>
                    <MenuItem>
                        <Typography variant="subtitle2">Message from Investor</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => navigate('/notifications')}>
                        <Typography color="primary">View All Notifications</Typography>
                    </MenuItem>
                </Menu>

                {/* Messages Menu */}
                <Menu
                    anchorEl={messagesAnchorEl}
                    open={Boolean(messagesAnchorEl)}
                    onClose={handleClose}
                    onClick={handleClose}
                    PaperProps={{
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            width: 320,
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem>
                        <Typography variant="subtitle2" color="primary">John Doe</Typography>
                    </MenuItem>
                    <MenuItem>
                        <Typography variant="subtitle2">Jane Smith</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => navigate('/messages')}>
                        <Typography color="primary">View All Messages</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 
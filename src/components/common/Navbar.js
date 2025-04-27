import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ThemeContext } from '../../utils/ThemeContext';
import authService from '../../services/authService';

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [loginAlertOpen, setLoginAlertOpen] = useState(false);
  const navigate = useNavigate();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const user = authService.getCurrentUser();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleInvestorsClick = (event) => {
    if (!user) {
      setLoginAlertOpen(true);
      event.preventDefault();
    }
  };

  const handleCloseLoginAlert = () => {
    setLoginAlertOpen(false);
  };

  const handleLoginFromAlert = () => {
    setLoginAlertOpen(false);
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', mr: 2, textDecoration: 'none' }}>
              <img 
                src="/trnslogo.png"
                alt="Logo"
                style={{ width: 56, height: 56, marginRight: 10, objectFit: 'contain' }}
              />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  flexGrow: 1,
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  fontFamily: `'Pacifico', 'Dancing Script', 'cursive'`,
                  fontSize: '2.1rem',
                  letterSpacing: '2px',
                  textShadow: '2px 2px 8px #003366, 0 1px 10px #fff',
                  background: 'linear-gradient(90deg, #fff 0%, #1bffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'brightness(1.2)',
                }}
              >
                Startup Connect
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                <MenuItem component={Link} to="/startups" onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">Startups</Typography>
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  to="/investors" 
                  onClick={(e) => {
                    handleInvestorsClick(e);
                    handleCloseNavMenu();
                  }}
                >
                  <Typography textAlign="center">Investors</Typography>
                </MenuItem>
              </Menu>
            </Box>

            <Typography
              variant="h5"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              Startup Connect
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                component={Link}
                to="/startups"
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Startups
              </Button>
              <Button
                component={Link}
                to="/investors"
                onClick={handleInvestorsClick}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                Investors
              </Button>
            </Box>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>

              {user ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar alt={user.name} src="/static/images/avatar/2.jpg" />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem component={Link} to={user?.user?.role === 'INVESTOR' ? '/investor-dashboard' : '/startup-dashboard'} onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">Dashboard</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    component={Link}
                    to="/login"
                    sx={{ 
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    variant="outlined"
                    sx={{ 
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Login Alert Dialog */}
      <Dialog
        open={loginAlertOpen}
        onClose={handleCloseLoginAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Login Required
        </DialogTitle>
        <DialogContent>
          <Typography>
            You need to be logged in to access the Investors page. Please login or register to continue.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginAlert}>Cancel</Button>
          <Button onClick={handleLoginFromAlert} color="primary" autoFocus>
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
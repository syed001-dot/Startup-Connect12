import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Link,
} from '@mui/material';
import {
  Business,
  Description,
  People,
  AttachMoney,
  Edit,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  MonetizationOn as MonetizationOnIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import startupService from '../services/startupService';
import authService from '../services/authService';
import PitchDeckManager from '../components/PitchDeckManager';
import InvestmentOfferManager from '../components/InvestmentOfferManager';
import MessageDialog from '../components/common/MessageDialog';
import { List, ListItem, ListItemText, Divider, Badge, Snackbar, ListItemIcon } from '@mui/material';
import messageService from '../services/messageService';
import notificationService from '../services/notificationService';

// Add this import
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Move styled components outside the component
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
}));

// QuickAction button style
const QuickActionBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(2),
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: 'white',
}));

const StartupDashboard = () => {
  const navigate = useNavigate();
  const lastUnreadIdsRef = React.useRef([]);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [receiverId, setReceiverId] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverError, setReceiverError] = useState('');
  const [receiverLookupLoading, setReceiverLookupLoading] = useState(false);
  const [conversationUsers, setConversationUsers] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const currentUser = authService.getCurrentUser();
  const senderId = currentUser?.user?.id || currentUser?.id || '';
  const [startupProfile, setStartupProfile] = useState(null);
  const [pitchDecks, setPitchDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    startupName: '',
    description: '',
    industry: '',
    fundingStage: '',
    teamSize: '',
    website: ''
  });

  useEffect(() => {
    const fetchStartupData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const user = authService.getCurrentUser();
        if (!user || !user.token) {
          setError('You must be logged in to view this page');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }
        
        const profile = await startupService.getStartupProfile();
        setStartupProfile(profile);
        setEditProfileData({
          startupName: profile.startupName || '',
          description: profile.description || '',
          industry: profile.industry || '',
          fundingStage: profile.fundingStage || '',
          teamSize: profile.teamSize || '',
          website: profile.website || ''
        });
        
        const decks = await startupService.getPitchDecks();
        setPitchDecks(decks);
      } catch (err) {
        console.error('Error fetching startup data:', err);
        setError(err.message || 'Failed to fetch startup data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchStartupData();
  }, [navigate]);

  // Fetch notifications and update unread count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifs = await notificationService.getNotifications(senderId);
        setNotifications(notifs);
        const unread = notifs.filter(n => n.status === 'unread');
        setUnreadCount(unread.length);
        // Only show snackbar if there's a new unread notification
        const currentUnreadIds = unread.map(n => n.id);
        const isNew = currentUnreadIds.some(id => !lastUnreadIdsRef.current.includes(id));
        if (isNew && unread.length > 0) {
          setSnackbarMsg('New message received!');
          setSnackbarOpen(true);
        }
        lastUnreadIdsRef.current = currentUnreadIds;
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [senderId]);

  // --- All other handlers (handleEditProfile, handleEditProfileClose, etc.) follow here ---

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleEditProfileClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditProfileSave = async () => {
    try {
      setLoading(true);
      const updatedProfile = await startupService.updateStartupProfile(editProfileData);
      setStartupProfile(updatedProfile);
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* QuickAction Button */}
      <QuickActionBox>
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate('/investments-received')}
          sx={{ fontWeight: 600 }}
        >
          View Investments Received
        </Button>
      </QuickActionBox>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {startupProfile?.startupName || 'Startup'}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              sx={{ ml: 2 }}
              onClick={async () => {
                setNotificationLoading(true);
                try {
                  // Mark all unread as read when opening dialog
                  const unreadIds = notifications.filter(n => n.status === 'unread').map(n => n.id);
                  if (unreadIds.length > 0) {
                    await notificationService.markNotificationsAsRead(unreadIds);
                  }
                  const notifs = await notificationService.getNotifications(senderId);
                  setNotifications(notifs);
                  setNotificationDialogOpen(true);
                  setUnreadCount(0);
                } catch (err) {
                  setNotifications([]);
                } finally {
                  setNotificationLoading(false);
                }
              }}
            >
              <Badge color="error" variant={unreadCount > 0 ? 'dot' : undefined} badgeContent={unreadCount > 0 ? unreadCount : null}>
                <NotificationsIcon /> Notifications
              </Badge>
            </Button>
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={async () => {
              setConversationLoading(true);
              try {
                const users = await messageService.getConversationUsers(senderId);
                setConversationUsers(users);
                setStartDialogOpen(true);
              } catch (err) {
                setConversationUsers([]);
                // Optionally show error
              } finally {
                setConversationLoading(false);
              }
            }}>
              Messages
            </Button>
          </Box>
        </Box>

        {/* Notification Dialog */}
        <Dialog open={notificationDialogOpen} onClose={() => setNotificationDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Notification</DialogTitle>
          <DialogContent>
            {notificationLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
                <CircularProgress />
              </Box>
            ) : notifications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No notifications found.</Typography>
            ) : (
              <List>
                {notifications.map((notif, idx) => {
                  let icon = <NotificationsIcon color="primary" />;
                  if (notif.type === 'message') icon = <EmailIcon color="info" />;
                  else if (notif.type === 'investment') icon = <MonetizationOnIcon color="success" />;
                  else if (notif.type === 'meeting') icon = <CalendarTodayIcon color="secondary" />;
                  else if (notif.type === 'document') icon = <Description color="warning" />;
                  return (
                    <ListItem key={idx} divider button={notif.type === 'message'}
                      onClick={notif.type === 'message' ? async () => {
                        setNotificationDialogOpen(false);
                        const userId = notif.description?.match(/user ID: (\d+)/)?.[1] || '';
                        setReceiverId(userId);
                        let name = 'User';
                        if (userId) {
                          try {
                            const user = await require('../services/userService').default.getUserById(userId);
                            name = user.fullName || user.email || 'User';
                          } catch {}
                        }
                        setReceiverName(name);
                        setTimeout(() => setMessageDialogOpen(true), 0);
                      } : undefined}
                    >
                      <ListItemIcon>{icon}</ListItemIcon>
                      <ListItemText
                        primary={notif.title || notif.type || 'Notification'}
                        secondary={notif.date ? `${notif.date} - ${notif.status || ''}` : notif.status || ''}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotificationDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMsg}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        />
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Manage your startup profile and pitch decks
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <IconWrapper>
                <Business fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" gutterBottom>
                Industry
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {startupProfile?.industry || 'Not specified'}
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <IconWrapper>
                <Description fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" gutterBottom>
                Pitch Decks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {pitchDecks?.length || 0} uploaded
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>



        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <IconWrapper>
                <People fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" gutterBottom>
                Team Size
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {startupProfile?.teamSize || 'Not specified'}
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <StyledCardContent>
              <IconWrapper>
                <AttachMoney fontSize="large" />
              </IconWrapper>
              <Typography variant="h6" gutterBottom>
                Funding Stage
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {startupProfile?.fundingStage || 'Not specified'}
              </Typography>
            </StyledCardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Startup Profile
          </Typography>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEditProfile}
            sx={{ textTransform: 'none' }}
          >
            Edit Profile
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {startupProfile?.description || 'No description provided'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary">
              Website
            </Typography>
            <Typography variant="body1" paragraph>
              {startupProfile?.website ? (
                <Link href={startupProfile.website} target="_blank" rel="noopener noreferrer">
                  {startupProfile.website}
                </Link>
              ) : (
                'No website provided'
              )}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <PitchDeckManager 
          startupId={startupProfile?.id}
          onUpdate={(updatedDecks) => {
            if (Array.isArray(updatedDecks)) {
              setPitchDecks(updatedDecks);
            } else {
              setPitchDecks(prevDecks => {
                const existingIndex = prevDecks.findIndex(d => d.id === updatedDecks.id);
                if (existingIndex >= 0) {
                  const newDecks = [...prevDecks];
                  newDecks[existingIndex] = updatedDecks;
                  return newDecks;
                }
                return [...prevDecks, updatedDecks];
              });
            }
          }}
        />
      </Paper>

      <Grid item xs={12}>
        <InvestmentOfferManager startupId={startupProfile?.id} />
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditProfileClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Startup Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Startup Name"
                value={editProfileData.startupName}
                onChange={(e) => setEditProfileData({ ...editProfileData, startupName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={editProfileData.description}
                onChange={(e) => setEditProfileData({ ...editProfileData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                value={editProfileData.industry}
                onChange={(e) => setEditProfileData({ ...editProfileData, industry: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Funding Stage"
                value={editProfileData.fundingStage}
                onChange={(e) => setEditProfileData({ ...editProfileData, fundingStage: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Team Size"
                value={editProfileData.teamSize}
                onChange={(e) => setEditProfileData({ ...editProfileData, teamSize: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                value={editProfileData.website}
                onChange={(e) => setEditProfileData({ ...editProfileData, website: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditProfileClose}>Cancel</Button>
          <Button onClick={handleEditProfileSave} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    {/* Message Dialog for Startup */}
    <MessageDialog
      open={messageDialogOpen}
      onClose={() => setMessageDialogOpen(false)}
      senderId={senderId}
      receiverId={receiverId}
      receiverName={receiverName}
    />
    {/* Start Conversation Dialog and Conversation List */}
    <Dialog open={startDialogOpen} onClose={() => setStartDialogOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Messages</DialogTitle>
      <DialogContent>
        {conversationLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {conversationUsers.length > 0 && (
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">Recent Conversations:</Typography>
                <List>
                  {conversationUsers.map(user => (
                    <ListItem button key={user.id} onClick={() => {
                      setReceiverId(user.id);
                      setReceiverName(user.fullName || user.email);
                      setStartDialogOpen(false);
                      setMessageDialogOpen(true);
                    }}>
                      <ListItemText primary={user.fullName || user.email} secondary={user.email} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}
            <Typography variant="subtitle2" color="text.secondary">Start New Conversation:</Typography>
            <TextField
              label="Receiver User ID or Email"
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              fullWidth
              margin="normal"
              error={!!receiverError}
              helperText={receiverError}
            />
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStartDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={async () => {
            setReceiverError('');
            setReceiverLookupLoading(true);
            try {
              const user = await require('../services/userService').default.getUserByEmail(receiverId);
              if (user && user.id) {
                setReceiverId(user.id);
                setReceiverName(user.email); // Auto-generate name as email
                setStartDialogOpen(false);
                setMessageDialogOpen(true);
              } else {
                // If not found, just use entered email as name
                setReceiverName(receiverId);
                setStartDialogOpen(false);
                setMessageDialogOpen(true);
              }
            } catch (err) {
              setReceiverError(typeof err === 'string' ? err : (err.error || 'User not found'));
            } finally {
              setReceiverLookupLoading(false);
            }
          }}
          variant="contained"
          disabled={!receiverId || receiverLookupLoading}
        >
          {receiverLookupLoading ? 'Checking...' : 'Chat'}
        </Button>
      </DialogActions>
    </Dialog>
  </Container>
  );
};

export default StartupDashboard;

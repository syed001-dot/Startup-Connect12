import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Fab,
} from '@mui/material';
import {
  Business,
  Analytics as AnalyticsIcon,
  Notifications,
  Description,
  CalendarToday,
  Email,
  Edit,
  Add as AddIcon,
  Mail as MailIcon,
  Search,
  ArrowForward,
  MonetizationOn,
  Timeline,
  AccountBalance,
  PieChart,
} from '@mui/icons-material';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import investorService from '../services/investorService';
import notificationService from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import EditProfileDialog from '../components/investor/EditProfileDialog';
import MessageDialog from '../components/common/MessageDialog';
import authService from '../services/authService';
import messageService from '../services/messageService';
import transactionService from '../services/transactionService';
import { jwtDecode } from 'jwt-decode';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const InvestorDashboard = () => {
  const navigate = useNavigate();

  // New Conversation dialog state
  const [newConversationDialogOpen, setNewConversationDialogOpen] = useState(false);
  const [newReceiverEmail, setNewReceiverEmail] = useState("");
  const [newReceiverError, setNewReceiverError] = useState("");
  const [newReceiverLookupLoading, setNewReceiverLookupLoading] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);
  const lastUnreadIdsRef = React.useRef([]);

  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [receiverId, setReceiverId] = useState('');
  const [receiverName, setReceiverName] = useState(''); // Always set by API, never by user input
  // const [receiverError, setReceiverError] = useState('');
  // const [receiverLookupLoading, setReceiverLookupLoading] = useState(false);
  const [conversationUsers, setConversationUsers] = useState([]);
  const [conversationLoading, setConversationLoading] = useState(false);
  const currentUser = authService.getCurrentUser();
  const senderId = currentUser?.user?.id || currentUser?.id || '';
  const [investorProfile, setInvestorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectorData, setSectorData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);

  const fetchInvestorData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await investorService.getInvestorProfile();
      
      const user = authService.getCurrentUser();
      if (!user || !user.token) {
        throw new Error('No authenticated user found');
      }
      
      const decodedToken = jwtDecode(user.token);
      const email = decodedToken.sub;
      if (!email) {
        throw new Error('Could not find email in token');
      }

      const transactions = await transactionService.getTransactionsByInvestor(email);
      
      const activeInvs = transactions.filter(tx => tx.status === 'ACCEPTED');
      const totalAmount = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
      
      setInvestorProfile({
        ...profile,
        activeInvestments: activeInvs.length,
        totalInvestments: totalAmount,
      });
      
    } catch (err) {
      console.error('Error fetching investor data:', err);
      setError(err.message || 'Failed to fetch investor data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestorData();
    setSectorData([
      { name: 'Healthcare', value: 35 },
      { name: 'Fintech', value: 25 },
      { name: 'Edtech', value: 20 },
      { name: 'AI/ML', value: 15 },
      { name: 'E-commerce', value: 5 },
    ]);
    const fetchNotifications = async () => {
      try {
        const notifications = await notificationService.getNotifications(senderId);
        setRecentActivities(notifications);
        // Unread logic
        const unread = notifications.filter(n => n.unread || n.status === 'unread');
        setUnreadCount(unread.length);
        // Remove snackbar logic from here
        const currentUnreadIds = unread.map(n => n.id);
        lastUnreadIdsRef.current = currentUnreadIds;
      } catch (err) {
        setRecentActivities([]);
        setUnreadCount(0);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [fetchInvestorData, senderId]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'meeting':
        return <CalendarToday />;
      case 'investment':
        return <MonetizationOn />;
      case 'document':
        return <Description />;
      case 'communication':
        return <Email />;
      default:
        return <Notifications />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'upcoming':
        return <Chip label="Upcoming" color="info" size="small" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderCard = (icon, title, value, subtitle) => (
    <Card elevation={3} sx={{ height: '100%', p: 2 }}>
      <CardContent sx={{ p: '24px !important' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {icon}
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" variant="h6" gutterBottom sx={{ fontSize: '1rem', mb: 1 }}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
                  {value}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {subtitle}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          {/* Removing the View My Investments button since it's redundant with Quick Actions */}
        </Box>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Welcome Header with Company Details */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 4, mb: 3, position: 'relative' }}>
              <Box sx={{ position: 'absolute', top: 24, right: 24, display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => setNotificationDialogOpen(true)}
                  color="primary"
                  aria-label="notifications"
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                  </Badge>
                </IconButton>
                <IconButton 
                  onClick={() => setEditDialogOpen(true)}
                  color="primary"
                  aria-label="edit profile"
                >
                  <Edit />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                  Welcome, {investorProfile?.investorName || 'Investor'}
                </Typography>
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                    Company: {investorProfile?.companyName || 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Sector: {investorProfile?.investmentFocus || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 1 }}>
                    Investment Range: ${investorProfile?.investmentRangeMin?.toLocaleString() || 'N/A'} - ${investorProfile?.investmentRangeMax?.toLocaleString() || 'N/A'}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Location: {investorProfile?.location || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Portfolio Overview Cards */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              {renderCard(
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MonetizationOn sx={{ fontSize: 32, color: 'white' }} />
                </Box>,
                'Investment Focus',
                investorProfile?.investmentFocus || 'N/A',
                'Primary investment sector'
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {renderCard(
                <Box sx={{ 
                  bgcolor: 'success.main', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Business sx={{ fontSize: 32, color: 'white' }} />
                </Box>,
                'Active Investments',
                `${investorProfile?.activeInvestments || '0'} Companies`,
                'Currently active portfolio'
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {renderCard(
                <Box sx={{ 
                  bgcolor: 'info.main', 
                  borderRadius: '50%', 
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AnalyticsIcon sx={{ fontSize: 32, color: 'white' }} />
                </Box>,
                'Average Investment',
                `$${Math.round((investorProfile?.totalInvestments || 0) / (investorProfile?.activeInvestments || 1)).toLocaleString()}`,
                'Per portfolio company'
              )}
            </Grid>
          </Grid>

          {/* Sector Distribution Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PieChart sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                  <Typography variant="h6">Sector Distribution</Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={sectorData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sectorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Notifications sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6">Recent Activities</Typography>
                  </Box>
                  {recentActivities.length > 4 && (
                    <Button
                      size="small"
                      onClick={() => setNotificationDialogOpen(true)}
                      endIcon={<ArrowForward />}
                    >
                      View More
                    </Button>
                  )}
                </Box>
                <List>
                  {recentActivities.slice(0, 4).map((activity, index) => (
                    <React.Fragment key={index}>
                      {(activity.type === 'communication' && (activity.userId || activity.senderId || activity.receiverId)) ? (
                        <ListItem
                          button
                          sx={{ cursor: 'pointer', bgcolor: 'rgba(255, 23, 68, 0.08)', '&:hover': { bgcolor: 'rgba(255, 23, 68, 0.15)' } }}
                          onClick={async () => {
                            const targetUserId = activity.userId || activity.senderId || activity.receiverId;
                            if (!targetUserId) {
                              alert('No user information found for this notification.');
                              return;
                            }
                            setReceiverId(targetUserId);
                            setReceiverName('');
                            try {
                              const userObj = await require('../services/userService').default.getUserById(targetUserId);
                              setReceiverName(userObj.fullName || userObj.email);
                            } catch {
                              setReceiverName('User');
                            }
                            setMessageDialogOpen(true);
                            // Find all unread notifications for this conversation/user
                            const unreadIds = recentActivities
                              .filter(a =>
                                (a.userId === targetUserId || a.senderId === targetUserId || a.receiverId === targetUserId) &&
                                (a.unread || a.status === 'unread')
                              )
                              .map(a => a.id);
                            if (unreadIds.length > 0) {
                              try {
                                const { markNotificationsAsRead } = require('../services/notificationService');
                                await markNotificationsAsRead(unreadIds);
                                setRecentActivities(prev =>
                                  prev.map(a => unreadIds.includes(a.id) ? { ...a, status: 'read', unread: false } : a)
                                );
                                setUnreadCount(prev => Math.max(0, prev - unreadIds.length));
                              } catch (e) {}
                            }
                          }}
                        >
                          <ListItemIcon>
                            {getActivityIcon(activity.type)}
                          </ListItemIcon>
                          <ListItemText
                            primary={(() => {
                              if (activity.senderName) return activity.senderName;
                              if (activity.senderEmail) return activity.senderEmail;
                              if (activity.sender) return activity.sender;
                              return 'New Message Received';
                            })()}
                            secondary={new Date(activity.date).toLocaleDateString()}
                          />
                          <Box sx={{ ml: 2 }}>
                            {getStatusChip(activity.status)}
                          </Box>
                        </ListItem>
                      ) : (
                        <ListItem disabled sx={{ cursor: 'default' }}>
                          <ListItemIcon>
                            {getActivityIcon(activity.type)}
                            {activity.unread && (
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  width: 10,
                                  height: 10,
                                  backgroundColor: '#ff1744',
                                  borderRadius: '50%',
                                  marginLeft: 8
                                }}
                                title="Unread"
                              />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.title}
                            secondary={new Date(activity.date).toLocaleDateString()}
                          />
                          <Box sx={{ ml: 2 }}>
                            {getStatusChip(activity.status)}
                          </Box>
                        </ListItem>
                      )}
                      {index < Math.min(recentActivities.length - 1, 3) && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Investment Description */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                About Your Investment Strategy
              </Typography>
              <Typography variant="body1" paragraph>
                {investorProfile?.description || 'No description available.'}
              </Typography>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Timeline sx={{ fontSize: 30, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Quick Actions</Typography>
              </Box>
              <Grid container spacing={2}>
                {[
                  { 
                    title: 'Investment Portfolio', 
                    icon: <AccountBalance sx={{ fontSize: 32, color: 'primary.main' }} />,
                    description: 'View and manage your investments',
                    action: () => navigate('/my-investments')
                  },
                  { 
                    title: 'Find Startups', 
                    icon: <Search sx={{ fontSize: 32, color: 'success.main' }} />,
                    description: 'Discover new investment opportunities',
                    action: () => navigate('/startups')
                  },
                  { 
                    title: 'Messages', 
                    icon: <MailIcon sx={{ fontSize: 32, color: 'info.main' }} />,
                    description: 'Chat with startups and investors',
                    action: async () => {
                      setConversationLoading(true);
                      try {
                        const users = await messageService.getConversationUsers(senderId);
                        setConversationUsers(users);
                        setStartDialogOpen(true);
                      } catch (err) {
                        setConversationUsers([]);
                      } finally {
                        setConversationLoading(false);
                      }
                    }
                  },
                  { 
                    title: 'Notifications', 
                    icon: <Notifications sx={{ fontSize: 32, color: 'warning.main' }} />,
                    description: 'View your alerts and updates',
                    action: () => setNotificationDialogOpen(true)
                  }
                ].map((action, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          boxShadow: 6,
                          bgcolor: 'action.hover'
                        }
                      }}
                      onClick={action.action}
                    >
                      <CardContent>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          textAlign: 'center',
                          gap: 1
                        }}>
                          {action.icon}
                          <Typography variant="subtitle1" fontWeight="medium">
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {action.description}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        {/* Edit Profile Dialog */}
        <EditProfileDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onUpdate={(updatedProfile) => {
            setInvestorProfile(updatedProfile);
            setEditDialogOpen(false);
          }}
          initialData={investorProfile}
        />

        {/* Notification Dialog */}
        <Dialog 
          open={notificationDialogOpen} 
          onClose={() => setNotificationDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" gap={1}>
              <Notifications color="primary" />
              <Typography variant="h6">Notifications</Typography>
              {unreadCount > 0 && (
                <Chip 
                  label={`${unreadCount} unread`} 
                  color="error" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {recentActivities.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
                <Typography color="textSecondary">No notifications</Typography>
              </Box>
            ) : (
              <List>
                {recentActivities.map((activity, index) => (
                  <ListItem
                    key={index}
                    button={activity.type === 'message'}
                    onClick={activity.type === 'message' ? async () => {
                      // Only mark notification as read, do not open chat dialog
                      if (activity.unread || activity.status === 'unread') {
                        try {
                          await notificationService.markNotificationsAsRead([activity.id]);
                          setRecentActivities(prev =>
                            prev.map(a => a.id === activity.id ? { ...a, status: 'read', unread: false } : a)
                          );
                          setUnreadCount(prev => Math.max(0, prev - 1));
                        } catch (e) {
                          console.error('Error marking notification as read:', e);
                        }
                      }
                    } : undefined}
                    sx={{
                      bgcolor: (activity.unread || activity.status === 'unread') ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                      '&:hover': {
                        bgcolor: (activity.unread || activity.status === 'unread') ? 'rgba(25, 118, 210, 0.15)' : 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon>
                      {getActivityIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title || 'Notification'}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="textSecondary">
                            {activity.description || 'No description'}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="textSecondary">
                            {new Date(activity.date).toLocaleString()}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    {(activity.unread || activity.status === 'unread') && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'primary.main',
                          borderRadius: '50%',
                          ml: 1
                        }}
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={async () => {
                const unreadNotifications = recentActivities
                  .filter(a => a.unread || a.status === 'unread')
                  .map(a => a.id);
                
                if (unreadNotifications.length > 0) {
                  try {
                    await notificationService.markNotificationsAsRead(unreadNotifications);
                    // Update all notifications to be marked as read
                    setRecentActivities(prev =>
                      prev.map(a => ({ ...a, status: 'read', unread: false }))
                    );
                    setUnreadCount(0);
                  } catch (e) {
                    console.error('Error marking all as read:', e);
                  }
                }
              }}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
            <Button onClick={() => setNotificationDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      {/* Floating Action Button for Messages */}
      <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1300 }}>
        {/* New Conversation FAB */}
        <Box sx={{ mb: 2 }}>
          <Fab color="secondary" aria-label="start new conversation" onClick={() => setNewConversationDialogOpen(true)} title="Start New Conversation">
            <AddIcon />
          </Fab>
        </Box>
        {/* Messages FAB */}
        <Badge color="secondary" badgeContent={unreadCount} invisible={unreadCount === 0}>
          <Fab color="primary" aria-label="messages" onClick={async () => {
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
            <MailIcon />
          </Fab>
        </Badge>
      </Box>

    {/* Message Dialog for Investor */}
    <MessageDialog
      open={messageDialogOpen}
      onClose={() => setMessageDialogOpen(false)}
      senderId={senderId}
      receiverId={receiverId}
      receiverName={receiverName}
    />

    {/* Start New Conversation Dialog */}
    <Dialog open={newConversationDialogOpen} onClose={() => {
      setNewConversationDialogOpen(false);
      setNewReceiverEmail("");
      setNewReceiverError("");
    }} maxWidth="xs" fullWidth>
      <DialogTitle>Start New Conversation:</DialogTitle>
      <DialogContent>
        <TextField
          label="Receiver Email"
          fullWidth
          margin="normal"
          value={newReceiverEmail}
          onChange={e => {
            setNewReceiverEmail(e.target.value);
            setNewReceiverError("");
          }}
          error={!!newReceiverError}
          helperText={newReceiverError || "Enter the receiver's email. The name will be fetched automatically."}
          disabled={newReceiverLookupLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setNewConversationDialogOpen(false);
          setNewReceiverEmail("");
          setNewReceiverError("");
        }} disabled={newReceiverLookupLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            setNewReceiverLookupLoading(true);
            setNewReceiverError("");
            try {
              const userObj = await require('../services/userService').default.getUserByEmail(newReceiverEmail);
              if (!userObj || !userObj.id) {
                setNewReceiverError(`User not found: User not found with email: ${newReceiverEmail}`);
                setNewReceiverLookupLoading(false);
                return;
              }
              setReceiverId(userObj.id);
              setReceiverName(userObj.fullName || userObj.email);
              setNewConversationDialogOpen(false);
              setNewReceiverEmail("");
              setNewReceiverError("");
              setMessageDialogOpen(true);
            } catch {
              setNewReceiverError(`User not found: User not found with email: ${newReceiverEmail}`);
            } finally {
              setNewReceiverLookupLoading(false);
            }
          }}
          disabled={!newReceiverEmail || newReceiverLookupLoading}
        >
          Chat
        </Button>
      </DialogActions>
    </Dialog>

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
                    <ListItem button key={user.id} onClick={async () => {
                      setReceiverId(user.id);
                      try {
                        const userObj = await require('../services/userService').default.getUserByEmail(user.email);
                        setReceiverName(userObj.fullName || userObj.email);
                        setStartDialogOpen(false);
                        setMessageDialogOpen(true);
                      } catch {
                        setReceiverName(user.email); // fallback
                        setStartDialogOpen(false);
                        setMessageDialogOpen(true);
                      }
                    }}>
                      <ListItemText
                        primary={user.fullName || user.email}
                        secondary={user.email}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStartDialogOpen(false)}>Cancel</Button>
      </DialogActions>
    </Dialog>
  </Box>
  );
};

export default InvestorDashboard;

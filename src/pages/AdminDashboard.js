import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Divider,
  Grid,
  Avatar
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Check if user is admin
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.user.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch data based on selected tab
  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (tabValue === 0) {
        // Fetch users with full details
        const response = await fetch('http://localhost:8080/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        // Map user data to include full name
        const mappedUsers = data.map(user => ({
          ...user,
          name: user.fullName || user.firstName + ' ' + user.lastName || user.email
        }));
        setUsers(mappedUsers);
      } else if (tabValue === 1) {
        // Fetch investors with full details
        const response = await fetch('http://localhost:8080/api/admin/investors', {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch investors');
        }
        
        const data = await response.json();
        const mappedInvestors = data.map(investor => ({
          ...investor,
          name: investor.user?.fullName || investor.companyName || investor.user?.email || 'Unknown Investor',
          email: investor.user?.email || '-'
        }));
        setInvestors(mappedInvestors);
      } else if (tabValue === 2) {
        // Fetch transactions with related data
        const response = await fetch('http://localhost:8080/api/admin/transactions', {
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const transactionsData = await response.json();
        
        // Map transactions with investor and startup names from the DTO
        const mappedTransactions = transactionsData.map(transaction => ({
          ...transaction,
          investorName: transaction.investorName || transaction.investorCompanyName || 'Unknown Investor',
          startupName: transaction.startupName || 'Unknown Startup',
          stage: transaction.startupStage || 'N/A'
        }));

        setTransactions(mappedTransactions);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDeleteClick = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setEditForm({
      name: item.name || '',
      email: item.email || '',
      role: item.role || '',
      status: item.status || 'ACTIVE'
    });
    setEditDialogOpen(true);
  };

  const handleViewClick = (item, type) => {
    setViewItem(item);
    setItemType(type);
    setViewDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const endpoint = itemType === 'user' 
        ? `http://localhost:8080/api/admin/users/${selectedItem.id}`
        : `http://localhost:8080/api/admin/investors/${selectedItem.id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete ${itemType}`);
      }
      
      // Refresh data
      fetchData();
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message || `An error occurred while deleting ${itemType}`);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const endpoint = itemType === 'user' 
        ? `http://localhost:8080/api/admin/users/${selectedItem.id}`
        : `http://localhost:8080/api/admin/investors/${selectedItem.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update ${itemType}`);
      }
      
      // Refresh data
      fetchData();
      setEditDialogOpen(false);
    } catch (err) {
      setError(err.message || `An error occurred while updating ${itemType}`);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1 }} gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Manage users, investors, and transactions efficiently. Use the tabs below to switch between management sections.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="primary">Total Users</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{users.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="success.main">Total Investors</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{investors.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="h6" color="info.main">Total Transactions</Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>{transactions.length}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      <Paper sx={{ width: '100%', mb: 2, p: 2, borderRadius: 3, boxShadow: 6 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="admin dashboard tabs"
          >
            <Tab label="Users" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
            <Tab label="Investors" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
            <Tab label="Transactions" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">User Management</Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">No users found.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {user.name && user.name[0]}
                          </Avatar>
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} color={user.role === 'ADMIN' ? 'secondary' : 'primary'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={getStatusColor(user.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewClick(user, 'user')}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(user, 'user')}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(user, 'user')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Investor Management</Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : investors.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">No investors found.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Investment Focus</TableCell>
                    <TableCell>Min Investment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investors.map((investor) => (
                    <TableRow key={investor.id} hover>
                      <TableCell>{investor.id}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'success.light' }}>
                            {investor.name && investor.name[0]}
                          </Avatar>
                          {investor.name}
                        </Box>
                      </TableCell>
                      <TableCell>{investor.email}</TableCell>
                      <TableCell>{investor.investmentFocus}</TableCell>
                      <TableCell>${investor.minInvestmentAmount}</TableCell>
                      <TableCell>
                        <Chip 
                          label={investor.status} 
                          color={getStatusColor(investor.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small" 
                            onClick={() => handleViewClick(investor, 'investor')}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Investor">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(investor, 'investor')}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Investor">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteClick(investor, 'investor')}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Transaction History</Typography>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchData}
            >
              Refresh
            </Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body1" color="text.secondary">No transactions found.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Startup</TableCell>
                    <TableCell>Investor</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Stage</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{transaction.id}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {transaction.startupName || 'Unknown Startup'}
                          </Typography>
                          {transaction.startupStage && (
                            <Typography variant="body2" color="textSecondary">
                              {transaction.startupStage}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Avatar sx={{ width: 28, height: 28, mr: 1, bgcolor: 'info.light', display: 'inline-flex', verticalAlign: 'middle' }}>
                            {transaction.investorName && transaction.investorName[0]}
                          </Avatar>
                          <Typography variant="body1" display="inline" sx={{ verticalAlign: 'middle', ml: 1 }}>
                            {transaction.investorCompanyName || transaction.investorName || 'Unknown Investor'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>${transaction.amount?.toLocaleString() || 0}</TableCell>
                      <TableCell>{transaction.startupStage || 'N/A'}</TableCell>
                      <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.status || 'PENDING'} 
                          color={getStatusColor(transaction.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {itemType}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit {itemType === 'user' ? 'User' : 'Investor'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editForm.name}
            onChange={handleEditChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editForm.email}
            onChange={handleEditChange}
            sx={{ mb: 2 }}
          />
          {itemType === 'user' && (
            <TextField
              margin="dense"
              name="role"
              label="Role"
              type="text"
              fullWidth
              variant="outlined"
              value={editForm.role}
              onChange={handleEditChange}
              sx={{ mb: 2 }}
            />
          )}
          <TextField
            margin="dense"
            name="status"
            label="Status"
            select
            fullWidth
            variant="outlined"
            value={editForm.status}
            onChange={handleEditChange}
            SelectProps={{
              native: true,
            }}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} color="primary" variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {itemType === 'user' ? 'User' : 'Investor'} Details
        </DialogTitle>
        <DialogContent>
          {viewItem && (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body1">
                    {viewItem.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {viewItem.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">
                    {viewItem.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={viewItem.status} 
                    color={getStatusColor(viewItem.status)} 
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(viewItem.createdAt)}
                  </Typography>
                </Grid>
                
                {itemType === 'user' && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Role
                    </Typography>
                    <Typography variant="body1">
                      {viewItem.role}
                    </Typography>
                  </Grid>
                )}
                
                {itemType === 'investor' && (
                  <>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Investment Details
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Investment Focus
                      </Typography>
                      <Typography variant="body1">
                        {viewItem.investmentFocus}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Minimum Investment
                      </Typography>
                      <Typography variant="body1">
                        ${viewItem.minInvestmentAmount}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

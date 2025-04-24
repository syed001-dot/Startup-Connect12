import React, { useEffect, useState, useMemo } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent,
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  TablePagination,
  TableSortLabel,
  Paper, 
  CircularProgress, 
  Chip, 
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Stack,
  Alert,
  useTheme
} from '@mui/material';
import {
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import transactionService from '../services/transactionService';
import { useNavigate } from 'react-router-dom';

const InvestmentsReceived = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Filtering and Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [orderBy, setOrderBy] = useState('transactionDate');
  const [order, setOrder] = useState('desc');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Analytics Data
  const [analyticsData, setAnalyticsData] = useState({
    totalInvestments: 0,
    averageInvestment: 0,
    totalInvestors: 0,
    monthlyTrends: []
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactionsByStartup();
      console.log('Fetched transactions:', data);
      setTransactions(data);
      
      // Calculate analytics
      const total = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const average = total / (data.length || 1);
      const uniqueInvestors = new Set(data.map(tx => tx.investorId)).size;
      
      // Calculate monthly trends
      const monthlyData = data.reduce((acc, tx) => {
        const month = new Date(tx.transactionDate).toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + (tx.amount || 0);
        return acc;
      }, {});

      setAnalyticsData({
        totalInvestments: total,
        averageInvestment: average,
        totalInvestors: uniqueInvestors,
        monthlyTrends: Object.entries(monthlyData).map(([month, amount]) => ({
          month,
          amount
        }))
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (transaction) => {
    setSelectedTransaction(transaction);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransaction(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInvestorDisplayName = (transaction) => {
    return transaction.investorCompanyName || 
           transaction.investorName || 
           `Investor #${transaction.investorId}` || 
           'Unknown Investor';
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportData = () => {
    const csvContent = [
      ['Investor', 'Startup', 'Amount', 'Type', 'Date', 'Status'].join(','),
      ...filteredTransactions.map(tx => [
        getInvestorDisplayName(tx),
        tx.startupName || 'Unknown Startup',
        tx.amount,
        tx.transactionType || '-',
        formatDate(tx.transactionDate),
        tx.status || 'PENDING'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'investments_received.csv';
    link.click();
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        const matchesSearch = searchTerm === '' ||
          getInvestorDisplayName(tx).toLowerCase().includes(searchTerm.toLowerCase()) ||
          (tx.startupName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
        
        const matchesDate = dateFilter === 'all' || (() => {
          const txDate = new Date(tx.transactionDate);
          const now = new Date();
          switch(dateFilter) {
            case 'today':
              return txDate.toDateString() === now.toDateString();
            case 'week':
              const weekAgo = new Date(now.setDate(now.getDate() - 7));
              return txDate >= weekAgo;
            case 'month':
              const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
              return txDate >= monthAgo;
            default:
              return true;
          }
        })();

        return matchesSearch && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];
        if (!aValue || !bValue) return 0;
        return order === 'asc'
          ? aValue < bValue ? -1 : 1
          : bValue < aValue ? -1 : 1;
      });
  }, [transactions, searchTerm, statusFilter, dateFilter, orderBy, order]);

  const paginatedTransactions = filteredTransactions.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Investments Received
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Track and manage your investment transactions
        </Typography>
      </Box>

      {/* Analytics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="subtitle2">
                    Total Investments
                  </Typography>
                  <Typography variant="h4">
                    ${analyticsData.totalInvestments.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Total amount received from all investors
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="subtitle2">
                    Average Investment
                  </Typography>
                  <Typography variant="h4">
                    ${analyticsData.averageInvestment.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Average investment amount per transaction
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TimelineIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" variant="subtitle2">
                    Total Investors
                  </Typography>
                  <Typography variant="h4">
                    {analyticsData.totalInvestors}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Number of unique investors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Monthly Trends Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Monthly Investment Trends
          </Typography>
          <Box height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="amount" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by investor or startup..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="ACCEPTED">Accepted</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Time Period"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportData}
                >
                  Export Data
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          ) : (
            <>
              <Paper>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'investorName'}
                          direction={orderBy === 'investorName' ? order : 'asc'}
                          onClick={() => handleSort('investorName')}
                        >
                          Investor
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'startupName'}
                          direction={orderBy === 'startupName' ? order : 'asc'}
                          onClick={() => handleSort('startupName')}
                        >
                          Startup
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">
                        <TableSortLabel
                          active={orderBy === 'amount'}
                          direction={orderBy === 'amount' ? order : 'asc'}
                          onClick={() => handleSort('amount')}
                        >
                          Amount
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'transactionDate'}
                          direction={orderBy === 'transactionDate' ? order : 'asc'}
                          onClick={() => handleSort('transactionDate')}
                        >
                          Date
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'status'}
                          direction={orderBy === 'status' ? order : 'asc'}
                          onClick={() => handleSort('status')}
                        >
                          Status
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography variant="subtitle1" sx={{ py: 2 }}>
                            No transactions found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((tx) => (
                        <TableRow 
                          key={tx.id} 
                          hover
                          sx={{
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: 'action.hover' }
                          }}
                          onClick={() => handleOpenDialog(tx)}
                        >
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2">
                                {getInvestorDisplayName(tx)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {tx.startupName || 'Unknown Startup'}
                            </Typography>
                            {tx.startupStage && (
                              <Typography variant="caption" color="textSecondary">
                                {tx.startupStage}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              ${tx.amount?.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {tx.transactionType ?? '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(tx.transactionDate)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={tx.status || 'PENDING'} 
                              color={getStatusColor(tx.status)} 
                              size="small"
                              sx={{ minWidth: 85 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTransactions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Transaction Details</Typography>
            <Chip 
              label={selectedTransaction?.status || 'PENDING'} 
              color={getStatusColor(selectedTransaction?.status)} 
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Startup
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.startupName || 'Unknown Startup'}
                </Typography>
              </Grid>
              
              {selectedTransaction.startupStage && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Stage
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.startupStage}
                  </Typography>
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Investor
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {getInvestorDisplayName(selectedTransaction)}
                </Typography>
              </Grid>
              
              {selectedTransaction.investorDetails && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedTransaction.investorDetails.email || '-'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedTransaction.investorDetails.location || '-'}
                    </Typography>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Amount
                </Typography>
                <Typography variant="body1" gutterBottom fontWeight="medium">
                  ${selectedTransaction.amount?.toLocaleString() || '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedTransaction.transactionType ?? '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(selectedTransaction.transactionDate)}
                </Typography>
              </Grid>
              
              {selectedTransaction.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Description
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.description}
                  </Typography>
                </Grid>
              )}
              
              {selectedTransaction.terms && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Terms
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.terms}
                  </Typography>
                </Grid>
              )}
              
              {selectedTransaction.equity && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Equity
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedTransaction.equity}%
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedTransaction?.investorId && (
            <Button 
              variant="contained" 
              onClick={() => {
                handleCloseDialog();
                navigate(`/investor/${selectedTransaction.investorId}`);
              }}
            >
              View Investor Profile
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvestmentsReceived;

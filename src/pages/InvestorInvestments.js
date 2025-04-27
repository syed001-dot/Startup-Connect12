import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Chip,
    CircularProgress,
    IconButton,
    Tooltip,
    Alert,
    Box,
    Card,
    CardContent,
    Grid,
    TextField,
    MenuItem,
    InputAdornment,
    Stack,
    Button,
    useTheme,
    Divider,
} from '@mui/material';
import {
    Info as InfoIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    AccountBalance as AccountBalanceIcon,
    TrendingUp as TrendingUpIcon,
    Download as DownloadIcon,
    Business as BusinessIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import transactionService from '../services/transactionService';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import startupService from '../services/startupService';
import investorService from '../services/investorService';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

const InvestorInvestments = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
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
        totalInvested: 0,
        totalStartups: 0,
        averageInvestment: 0,
        investmentsByStage: [],
        investmentsByStatus: []
    });

    const [negotiatingOffers, setNegotiatingOffers] = useState([]);

    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
        theme.palette.info.main
    ];

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            console.log('Fetching investments...');
            const user = authService.getCurrentUser();
            if (!user || !user.token) {
                throw new Error('No authenticated user found');
            }
            
            const decodedToken = jwtDecode(user.token);
            console.log('Decoded token:', decodedToken);
            
            const email = decodedToken.sub;
            if (!email) {
                throw new Error('Could not find email in token');
            }
            
            console.log('Using email:', email);
            const data = await transactionService.getTransactionsByInvestor(email);
            console.log('Fetched investments:', data);
            
            setTransactions(data);

            // Calculate analytics
            const acceptedTransactions = data.filter(tx => tx.status === 'ACCEPTED');
            const total = acceptedTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
            const uniqueStartups = new Set(acceptedTransactions.map(tx => tx.startupId)).size;
            const average = total / (acceptedTransactions.length || 1);

            // Calculate investments by stage (only accepted)
            const stageData = acceptedTransactions.reduce((acc, tx) => {
                const stage = tx.startupStage || 'Unknown';
                acc[stage] = (acc[stage] || 0) + (tx.amount || 0);
                return acc;
            }, {});

            // Calculate investments by status (all for chart)
            const statusData = data.reduce((acc, tx) => {
                const status = tx.status || 'Unknown';
                acc[status] = (acc[status] || 0) + (tx.amount || 0);
                return acc;
            }, {});

            setAnalyticsData({
                totalInvested: total,
                totalStartups: uniqueStartups,
                averageInvestment: average,
                investmentsByStage: Object.entries(stageData).map(([name, value]) => ({
                    name,
                    value
                })),
                investmentsByStatus: Object.entries(statusData).map(([name, value]) => ({
                    name,
                    value
                }))
            });

            setError(null);
        } catch (err) {
            console.error('Error fetching investments:', err);
            if (err.response?.status === 403) {
                setError('You do not have permission to view investments. Please ensure you are logged in as an investor.');
            } else {
                setError(err.message || 'Failed to fetch investments');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchNegotiatingOffers = async (investorId) => {
        try {
            const offers = await startupService.getMyInvestmentOffers();
            // Only include offers that are still negotiating (not closed)
            setNegotiatingOffers(offers.filter(o => o.status === 'NEGOTIATING' && o.investorId === investorId));
        } catch (err) {
            console.error('Error fetching negotiating offers:', err);
        }
    };

    const checkAuthAndFetchData = useCallback(async () => {
        try {
            const user = authService.getCurrentUser();
            console.log('Current user:', user);

            if (!user) {
                setError('Please log in to view your investments');
                navigate('/login');
                return;
            }

            const hasInvestorRole = user.user?.role === 'INVESTOR';
            let tokenRoles = [];
            let investorProfile = null;
            try {
                if (user.token) {
                    const decodedToken = jwtDecode(user.token);
                    tokenRoles = decodedToken.roles || [];
                }
                investorProfile = await investorService.getInvestorProfile();
            } catch (err) {
                console.error('Error decoding token or fetching profile:', err);
            }

            const hasInvestorAccess = hasInvestorRole || 
                tokenRoles.some(role => ['ROLE_INVESTOR', 'INVESTOR'].includes(role));

            if (!hasInvestorAccess) {
                setError('You must be an investor to view this page. Current role: ' + (user.user?.role || 'none'));
                return;
            }

            await fetchTransactions();
            if (investorProfile && investorProfile.id) {
                await fetchNegotiatingOffers(investorProfile.id);
            }
        } catch (err) {
            console.error('Auth check error:', err);
            setError(err.message);
        }
    }, [navigate]);

    useEffect(() => {
        checkAuthAndFetchData();
    }, [checkAuthAndFetchData]);

    const handleOpenDialog = (transaction) => {
        setSelectedInvestment(transaction);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedInvestment(null);
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

    const getStartupDisplayName = (transaction) => {
        return transaction.startupName || 'Unknown Startup';
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
            ['Startup', 'Amount', 'Type', 'Date', 'Status'].join(','),
            ...filteredTransactions.map(tx => [
                getStartupDisplayName(tx),
                tx.amount,
                tx.transactionType || '-',
                formatDate(tx.transactionDate),
                tx.status || 'PENDING'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'my_investments.csv';
        link.click();
    };

    const allRows = useMemo(() => [
        ...transactions,
        ...negotiatingOffers.map(offer => ({
            id: offer.id,
            startupName: offer.companyName,
            amount: offer.amount,
            transactionType: 'NEGOTIATION',
            transactionDate: offer.updatedAt || offer.createdAt,
            // If offer is closed, treat as REJECTED
            status: offer.status === 'CLOSED' ? 'REJECTED' : 'NEGOTIATING',
            startupStage: offer.fundingStage || offer.stage,
            // Add other fields as needed for your table
        }))
    ], [transactions, negotiatingOffers]);

    const filteredTransactions = useMemo(() => {
        return allRows
            .filter(tx => {
                const matchesSearch = searchTerm === '' ||
                    getStartupDisplayName(tx).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (tx.startupStage || '').toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === 'all' ||
                    tx.status === statusFilter ||
                    (statusFilter === 'PENDING' && tx.status === 'NEGOTIATING');
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
    }, [allRows, searchTerm, statusFilter, dateFilter, orderBy, order]);

    const paginatedTransactions = filteredTransactions.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header Section */}
            <Box mb={4}>
                <Typography variant="h4" gutterBottom>
                    My Investment Portfolio
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Track and manage your startup investments
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
                                        Total Invested
                                    </Typography>
                                    <Typography variant="h4">
                                        ${analyticsData.totalInvested.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Total amount invested across all startups
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <BusinessIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                                <Box>
                                    <Typography color="textSecondary" variant="subtitle2">
                                        Portfolio Companies
                                    </Typography>
                                    <Typography variant="h4">
                                        {analyticsData.totalStartups}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                Number of startups in your portfolio
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
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
                                Average investment amount per startup
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Investments by Stage
                            </Typography>
                            <Box height={300}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.investmentsByStage}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {analyticsData.investmentsByStage.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Investments by Status
                            </Typography>
                            <Box height={300}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={analyticsData.investmentsByStatus}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            label
                                        >
                                            {analyticsData.investmentsByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <RechartsTooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters Section */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <TextField
                                fullWidth
                                placeholder="Search by startup or stage..."
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

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Main Content */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            ) : !error && (
                <Card>
                    <CardContent>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel
                                                active={orderBy === 'startupName'}
                                                direction={orderBy === 'startupName' ? order : 'asc'}
                                                onClick={() => handleSort('startupName')}
                                            >
                                                Startup
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell>
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
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedTransactions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                <Typography variant="subtitle1" sx={{ py: 2 }}>
                                                    No transactions found
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedTransactions.map((transaction) => (
                                            <TableRow 
                                                key={transaction.id}
                                                hover
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': { backgroundColor: 'action.hover' }
                                                }}
                                                onClick={() => handleOpenDialog(transaction)}
                                            >
                                                <TableCell>
                                                    <Box>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {getStartupDisplayName(transaction)}
                                                        </Typography>
                                                        {transaction.startupStage && (
                                                            <Typography variant="body2" color="textSecondary">
                                                                {transaction.startupStage}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        ${transaction.amount?.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{transaction.transactionType || '-'}</TableCell>
                                                <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={transaction.status || 'Unknown'}
                                                        color={getStatusColor(transaction.status)}
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
                        </TableContainer>
                    </CardContent>
                </Card>
            )}

            {/* Investment Details Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    elevation: 0,
                    sx: { borderRadius: 2 }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6">Investment Details</Typography>
                        {selectedInvestment && (
                            <Chip
                                label={selectedInvestment.status || 'Unknown'}
                                color={getStatusColor(selectedInvestment.status)}
                                size="small"
                            />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedInvestment && (
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Startup
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {getStartupDisplayName(selectedInvestment)}
                                </Typography>
                            </Grid>

                            {selectedInvestment.startupStage && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Stage
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {selectedInvestment.startupStage}
                                    </Typography>
                                </Grid>
                            )}

                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Amount
                                </Typography>
                                <Typography variant="body1" gutterBottom fontWeight="medium">
                                    ${selectedInvestment.amount?.toLocaleString()}
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Type
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {selectedInvestment.transactionType || '-'}
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="textSecondary">
                                    Date
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {formatDate(selectedInvestment.transactionDate)}
                                </Typography>
                            </Grid>

                            {selectedInvestment.description && (
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="textSecondary">
                                        Description
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {selectedInvestment.description}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                    {selectedInvestment?.startupId && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleCloseDialog();
                                navigate(`/startup/${selectedInvestment.startupId}`);
                            }}
                        >
                            View Startup Profile
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default InvestorInvestments;

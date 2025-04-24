import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    Business as BusinessIcon,
    AttachMoney as AttachMoneyIcon,
    Timeline as TimelineIcon,
    Info as InfoIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';
import investorService from '../services/investorService';

const Portfolio = () => {
    const [portfolio, setPortfolio] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [investments, setInvestments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInvestment, setSelectedInvestment] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchPortfolioData();
    }, []);

    const fetchPortfolioData = async () => {
        try {
            setLoading(true);
            const [portfolioData, performanceData, myInvestments] = await Promise.all([
                investorService.getPortfolio(),
                investorService.getPortfolioPerformance(),
                investorService.getMyInvestments()
            ]);
            setPortfolio(portfolioData);
            setPerformance(performanceData);
            setInvestments(myInvestments);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInvestmentClick = async (investmentId) => {
        try {
            const details = await investorService.getInvestmentDetails(investmentId);
            setSelectedInvestment(details);
            setOpenDialog(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedInvestment(null);
        setEditMode(false);
    };

    const handleEditInvestment = () => {
        setEditMode(true);
    };

    const handleSaveInvestment = async () => {
        // TODO: Implement save functionality
        setEditMode(false);
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Investment Portfolio
            </Typography>

            {/* Portfolio Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Total Investment</Typography>
                            </Box>
                            <Typography variant="h4">
                                ${portfolio?.totalInvestment?.toLocaleString()}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <BusinessIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Startups</Typography>
                            </Box>
                            <Typography variant="h4">
                                {portfolio?.numberOfStartups}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">ROI</Typography>
                            </Box>
                            <Typography variant="h4" color={portfolio?.roi >= 0 ? 'success.main' : 'error.main'}>
                                {portfolio?.roi?.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <TimelineIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Avg. Return</Typography>
                            </Box>
                            <Typography variant="h4" color={portfolio?.averageReturn >= 0 ? 'success.main' : 'error.main'}>
                                {portfolio?.averageReturn?.toFixed(2)}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Performance Chart */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Portfolio Performance
                    </Typography>
                    <Box height={300}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performance?.data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <ChartTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Portfolio Value" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>

            {/* Investments Table */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Investments
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Startup</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Stage</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {investments.length === 0 ? (
    <TableRow>
        <TableCell colSpan={5} align="center">
            No investments found.
        </TableCell>
    </TableRow>
) : (
    investments.map((investment) => {
        // Try to get startup name from nested offer/startup
        const startupName = investment.offer?.startup?.name || investment.offer?.startupProfile?.startupName || '-';
        // Amount
        const amount = investment.amount ? `$${Number(investment.amount).toLocaleString()}` : '-';
        // Date
        const date = investment.createdAt ? new Date(investment.createdAt).toLocaleDateString() : '-';
        // Status
        const status = investment.status || '-';
        return (
            <TableRow key={investment.id} hover>
                <TableCell>{startupName}</TableCell>
                <TableCell>{amount}</TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>
                    <Chip
                        label={status}
                        color={status === 'APPROVED' || status === 'COMPLETED' ? 'success' : status === 'PENDING' ? 'warning' : 'default'}
                        size="small"
                    />
                </TableCell>
                <TableCell>
                    <Tooltip title="View Details">
                        <IconButton
                            size="small"
                            onClick={() => handleInvestmentClick(investment.id)}
                        >
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
        );
    })
)}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Investment Details Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    Investment Details
                    {!editMode && (
                        <IconButton
                            onClick={handleEditInvestment}
                            sx={{ position: 'absolute', right: 8, top: 8 }}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    {selectedInvestment && (
                        <Box sx={{ mt: 2 }}>
                            {editMode ? (
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Amount"
                                            value={selectedInvestment.amount}
                                            type="number"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Stage"
                                            select
                                            value={selectedInvestment.stage}
                                        >
                                            <MenuItem value="Seed">Seed</MenuItem>
                                            <MenuItem value="Series A">Series A</MenuItem>
                                            <MenuItem value="Series B">Series B</MenuItem>
                                            <MenuItem value="Series C">Series C</MenuItem>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Status"
                                            select
                                            value={selectedInvestment.status}
                                        >
                                            <MenuItem value="Active">Active</MenuItem>
                                            <MenuItem value="Exited">Exited</MenuItem>
                                            <MenuItem value="Pending">Pending</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            ) : (
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Startup</Typography>
                                        <Typography variant="body1">{selectedInvestment.startupName}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Amount</Typography>
                                        <Typography variant="body1">
                                            ${selectedInvestment.amount.toLocaleString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Date</Typography>
                                        <Typography variant="body1">
                                            {new Date(selectedInvestment.date).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Stage</Typography>
                                        <Chip
                                            label={selectedInvestment.stage}
                                            color={selectedInvestment.stage === 'Seed' ? 'primary' : 'secondary'}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">Status</Typography>
                                        <Chip
                                            label={selectedInvestment.status}
                                            color={selectedInvestment.status === 'Active' ? 'success' : 'default'}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle1">ROI</Typography>
                                        <Typography
                                            variant="body1"
                                            color={selectedInvestment.roi >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            {selectedInvestment.roi.toFixed(2)}%
                                        </Typography>
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {editMode ? (
                        <>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button onClick={handleSaveInvestment} variant="contained" color="primary">
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button onClick={handleCloseDialog}>Close</Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Portfolio; 
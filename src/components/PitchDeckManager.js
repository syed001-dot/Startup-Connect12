import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    IconButton,
    Switch,
    TextField,
    Typography,
    Alert,
    CircularProgress,
   //DialogContentText
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Description as DescriptionIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import pitchDeckService from '../services/pitchDeckService';

const PitchDeckManager = ({ startupId, onUpdate }) => {
    const [pitchDecks, setPitchDecks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openUploadDialog, setOpenUploadDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [selectedPitchDeck, setSelectedPitchDeck] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (startupId) {
            fetchPitchDecks();
        }
    }, [startupId]);

    const fetchPitchDecks = async () => {
        try {
            setLoading(true);
            const data = await pitchDeckService.getPitchDecksByStartup(startupId);
            setPitchDecks(data);
            setError(null);
            if (onUpdate) {
                onUpdate(data);
            }
        } catch (err) {
            setError('Failed to fetch pitch decks. Please try again later.');
            console.error('Error fetching pitch decks:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (!title) {
                setTitle(file.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !title) {
            setError('Please select a file and provide a title');
            return;
        }

        try {
            setLoading(true);
            const newDeck = await pitchDeckService.uploadPitchDeck(
                startupId,
                selectedFile,
                title,
                description,
                isPublic
            );
            setOpenUploadDialog(false);
            resetForm();
            if (onUpdate) {
                onUpdate(newDeck);
            }
            fetchPitchDecks();
        } catch (err) {
            console.error('Error uploading pitch deck:', err);
            setError(err.message || 'Failed to upload pitch deck. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async () => {
        if (!selectedPitchDeck) return;

        try {
            setLoading(true);
            const updatedDeck = await pitchDeckService.updatePitchDeck(
                selectedPitchDeck.id,
                title,
                description,
                isPublic
            );
            setOpenEditDialog(false);
            resetForm();
            if (onUpdate) {
                onUpdate(updatedDeck);
            }
            fetchPitchDecks();
        } catch (err) {
            setError('Failed to update pitch deck. Please try again.');
            console.error('Error updating pitch deck:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this pitch deck?')) {
            return;
        }

        try {
            setLoading(true);
            await pitchDeckService.deletePitchDeck(id);
            fetchPitchDecks();
        } catch (err) {
            setError('Failed to delete pitch deck. Please try again.');
            console.error('Error deleting pitch deck:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            setLoading(true);
            await pitchDeckService.downloadPitchDeck(id);
            setError(null);
        } catch (err) {
            setError('Failed to download pitch deck. Please try again.');
            console.error('Error downloading pitch deck:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async (pitchDeck) => {
        try {
            setLoading(true);
            setSelectedPitchDeck(pitchDeck);
            const url = await pitchDeckService.previewPitchDeck(pitchDeck.id);
            setPreviewUrl(url);
            setOpenPreviewDialog(true);
        } catch (err) {
            setError('Failed to preview pitch deck. Please try again.');
            console.error('Error previewing pitch deck:', err);
        } finally {
            setLoading(false);
        }
    };

    const renderPreviewContent = () => {
        if (!selectedPitchDeck) return null;

        const fileType = selectedPitchDeck.fileType;

        if (fileType === 'application/pdf') {
            return (
                <iframe
                    src={previewUrl}
                    width="100%"
                    height="600px"
                    title="PDF Preview"
                />
            );
        } else if (
            fileType === 'application/vnd.ms-powerpoint' ||
            fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ) {
            return (
                <Box p={3} textAlign="center">
                    <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom>
                        PowerPoint Preview Not Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        This is a PowerPoint presentation. Please download the file to view it.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(selectedPitchDeck.id)}
                        sx={{ mt: 2 }}
                    >
                        Download Presentation
                    </Button>
                </Box>
            );
        }

        return (
            <Typography variant="body2" color="error">
                Unsupported file type
            </Typography>
        );
    };

    const resetForm = () => {
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setIsPublic(false);
        setSelectedPitchDeck(null);
        setError(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const openEditDialogWithPitchDeck = (pitchDeck) => {
        setSelectedPitchDeck(pitchDeck);
        setTitle(pitchDeck.title);
        setDescription(pitchDeck.description || '');
        setIsPublic(pitchDeck.isPublic);
        setOpenEditDialog(true);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                    Pitch Decks
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenUploadDialog(true)}
                >
                    Upload New Pitch Deck
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {pitchDecks.map((pitchDeck) => (
                    <Grid item xs={12} sm={6} md={4} key={pitchDeck.id}>
                        <Card 
                            sx={{ 
                                cursor: 'pointer',
                                '&:hover': {
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => handlePreview(pitchDeck)}
                        >
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="h6" component="h3" gutterBottom>
                                        {pitchDeck.title}
                                    </Typography>
                                    <Box>
                                        
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(pitchDeck.id);
                                            }}
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                        
                                    </Box>
                                </Box>
                                {pitchDeck.description && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {pitchDeck.description}
                                    </Typography>
                                )}
                                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                    <Typography variant="body2" color="text.secondary">
                                        {formatFileSize(pitchDeck.fileSize)}
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        {pitchDeck.isPublic ? (
                                            <VisibilityIcon color="primary" />
                                        ) : (
                                            <VisibilityOffIcon color="action" />
                                        )}
                                    </Box>
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                    Uploaded on {formatDate(pitchDeck.createdAt)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Upload Dialog */}
            <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Upload New Pitch Deck</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                            }
                            label="Make public"
                        />
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            Select File
                            <input
                                type="file"
                                hidden
                                accept=".pdf,.ppt,.pptx"
                                onChange={handleFileChange}
                            />
                        </Button>
                        {selectedFile && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Selected file: {selectedFile.name}
                            </Typography>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUploadDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!selectedFile || !title}
                    >
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Pitch Deck</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isPublic}
                                    onChange={(e) => setIsPublic(e.target.checked)}
                                />
                            }
                            label="Make public"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                    <Button
                        onClick={handleEdit}
                        variant="contained"
                        disabled={!title}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog
                open={openPreviewDialog}
                onClose={() => {
                    setOpenPreviewDialog(false);
                    if (previewUrl) {
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                    }
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedPitchDeck?.title}
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setOpenPreviewDialog(false);
                            if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(null);
                            }
                        }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {renderPreviewContent()}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenPreviewDialog(false);
                        if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                            setPreviewUrl(null);
                        }
                    }}>Close</Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(selectedPitchDeck?.id)}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PitchDeckManager; 
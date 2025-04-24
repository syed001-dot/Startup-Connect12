import React from 'react';
import { Card, CardContent, Typography, Grid, Box, IconButton } from '@mui/material';
import { Download as DownloadIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

const PitchDeckList = ({ pitchDecks, onDownload, onPreview }) => (
  <Box>
    <Grid container spacing={3}>
      {pitchDecks && pitchDecks.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          No pitch decks available.
        </Typography>
      )}
      {pitchDecks && pitchDecks.map((deck) => (
        <Grid item xs={12} sm={6} md={4} key={deck.id}>
          <Card sx={{ cursor: onPreview ? 'pointer' : 'default' }} onClick={onPreview ? () => onPreview(deck) : undefined}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h6" gutterBottom>{deck.title}</Typography>
                <Box>
                  {onDownload && (
                    <IconButton size="small" onClick={e => { e.stopPropagation(); onDownload(deck); }}>
                      <DownloadIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>{deck.description}</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Typography variant="body2" color="text.secondary">{formatFileSize(deck.fileSize)}</Typography>
                <Box display="flex" alignItems="center">
                  {deck.isPublic ? <VisibilityIcon color="primary" /> : <VisibilityOffIcon color="action" />}
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Uploaded on {formatDate(deck.createdAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default PitchDeckList;

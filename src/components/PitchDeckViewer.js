import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const PitchDeckViewer = ({ open, onClose, url, fileType }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Pitch Deck Preview
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ minHeight: 500 }}>
        {fileType === 'application/pdf' ? (
          <iframe
            src={url}
            title="Pitch Deck PDF Preview"
            width="100%"
            height="500px"
            style={{ border: 0 }}
            allowFullScreen
          />
        ) : (
          <div>
            <p>Preview is only supported for PDF files. Please download to view other formats.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PitchDeckViewer;

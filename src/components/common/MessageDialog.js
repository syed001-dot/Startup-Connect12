import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Alert
} from '@mui/material';
import authService from '../../services/authService';

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:8080/api';
// Props: open, onClose, senderId, receiverId, receiverName
const MessageDialog = ({ open, onClose, senderId, receiverId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // Fetch messages between sender and receiver
  const fetchMessages = React.useCallback(async () => {
    if (!senderId || !receiverId) {
      console.error('Missing senderId or receiverId:', { senderId, receiverId });
      setError('Unable to load messages: Missing user information');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching messages for users:', { senderId, receiverId });
      const token = authService.getToken();
      const res = await fetch(`${API_BASE}/messages/conversation?user1=${senderId}&user2=${receiverId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched messages:', data);
        setMessages(data);
        setError('');
      } else {
        const errorText = await res.text();
        console.error('Failed to fetch messages:', errorText);
        setError('Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Error loading messages');
    } finally {
      setLoading(false);
    }
  }, [senderId, receiverId]);

  useEffect(() => {
    let interval;
    if (open && senderId && receiverId) {
      console.log('Dialog opened, fetching messages for:', { senderId, receiverId });
      fetchMessages();
      interval = setInterval(fetchMessages, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open, senderId, receiverId, fetchMessages]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setNewMessage('');
      setError('');
    }
  }, [open]);

  const handleSend = async () => {
    if (!newMessage.trim() || !senderId || !receiverId) {
      console.error('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        senderId, 
        receiverId 
      });
      return;
    }

    setSending(true);
    setError('');

    try {
      console.log('Sending message:', {
        senderId,
        receiverId,
        content: newMessage
      });

      const token = authService.getToken();
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          senderId,
          receiverId,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage('');
        await fetchMessages();
      } else {
        const errorText = await res.text();
        console.error('Failed to send message:', errorText);
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error sending message');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chat with {receiverName || 'User'}</DialogTitle>
      <DialogContent dividers sx={{ minHeight: 300 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading && messages.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {messages.length === 0 && !loading && (
              <ListItem>
                <ListItemText primary="No messages yet. Start the conversation!" />
              </ListItem>
            )}
            {messages.map((msg) => (
              <ListItem 
                key={msg.id} 
                sx={{
                  justifyContent: msg.senderId === senderId ? 'flex-end' : 'flex-start',
                  '.MuiListItemText-root': {
                    maxWidth: '80%'
                  }
                }}
              >
                <ListItemText
                  primary={msg.content}
                  secondary={msg.senderId === senderId ? 'You' : receiverName || 'User'}
                  sx={{
                    textAlign: msg.senderId === senderId ? 'right' : 'left',
                    bgcolor: msg.senderId === senderId ? 'primary.light' : 'grey.100',
                    p: 1,
                    borderRadius: 1
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          disabled={sending}
          size="small"
          multiline
          maxRows={4}
        />
        <Button 
          onClick={handleSend} 
          variant="contained" 
          disabled={sending || !newMessage.trim() || !senderId || !receiverId}
        >
          {sending ? 'Sending...' : 'Send'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDialog;

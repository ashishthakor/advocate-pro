'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Paper,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  AssignmentInd as AssignmentIndIcon,
  WhatsApp as WhatsAppIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from 'components/AuthProvider';
import { useLanguage } from 'components/LanguageProvider';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from 'lib/api-client';

interface ChatMessage {
  id: number;
  case_id: number;
  user_id: number;
  message: string;
  message_type: 'text' | 'file' | 'image';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_role: string;
}

interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  user_name: string;
  advocate_name: string;
  advocate_email: string;
}

export default function AdminChatPage({ params }: { params: Promise<{ caseId: string }> }) {
  const [caseId, setCaseId] = useState<string>('');
  
  useEffect(() => {
    params.then(({ caseId: id }) => setCaseId(id));
  }, [params]);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const caseIdNum = parseInt(caseId);

  useEffect(() => {
    if (caseId) {
      fetchCaseData();
      fetchMessages();
      initializeSocket();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [caseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCaseData = async () => {
    try {
      const data = await apiFetch(`/api/cases/${caseIdNum}`);

      if (data.success) {
        setCaseData(data.data);
      } else {
        setError(data.message || 'Failed to fetch case data');
      }
    } catch (err) {
      setError('An error occurred while fetching case data');
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await apiFetch(`/api/chat/${caseIdNum}`);

      if (data.success) {
        setMessages(data.data);
      } else {
        setError(data.message || 'Failed to fetch messages');
      }
    } catch (err) {
      setError('An error occurred while fetching messages');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      newSocket.emit('join_case', caseIdNum);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    newSocket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    newSocket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('error', (error: any) => {
      setError(error.message || 'Socket error');
    });

    setSocket(newSocket);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    try {
      socket.emit('send_message', {
        case_id: caseIdNum,
        message: newMessage.trim(),
        message_type: 'text'
      });

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !socket) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('caseIdNum', caseIdNum.toString());

      const data = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (data.success) {
        socket.emit('send_message', {
          case_id: caseIdNum,
          message: `Shared file: ${selectedFile.name}`,
          message_type: selectedFile.type.startsWith('image/') ? 'image' : 'file',
          file_url: data.data.url,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type
        });

        setFileDialogOpen(false);
        setSelectedFile(null);
      } else {
        setError(data.message || 'Failed to upload file');
      }
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'advocate': return 'warning';
      case 'user': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Header */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <IconButton onClick={() => router.push('/admin/chat')} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">
              {t('chat.adminChat')} - {caseData?.case_number}
            </Typography>
          </Stack>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">
                {caseData?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {caseData?.description}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={caseData?.status}
                  color={caseData?.status === 'open' ? 'success' : caseData?.status === 'in_progress' ? 'warning' : 'default'}
                  size="small"
                />
                <Chip
                  label={`${t('chat.client')}: ${caseData?.user_name}`}
                  color="info"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${t('chat.advocate')}: ${caseData?.advocate_name || t('chat.notAssigned')}`}
                  color="warning"
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Chip
                label={isConnected ? t('chat.connected') : t('chat.disconnected')}
                color={isConnected ? 'success' : 'error'}
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Messages */}
      <Paper sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="text.secondary">
                {t('chat.noMessagesYet')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('chat.startConversation')}
              </Typography>
            </Box>
          ) : (
            <List>
              {messages.map((message, index) => {
                const isCurrentUser = message.user_id === user?.id;
                const showDate = index === 0 || 
                  formatDate(messages[index - 1].created_at) !== formatDate(message.created_at);

                return (
                  <React.Fragment key={message.id}>
                    {showDate && (
                      <Box textAlign="center" py={1}>
                        <Chip
                          label={formatDate(message.created_at)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    )}
                    <ListItem
                      sx={{
                        flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        mb: 1
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: getRoleColor(message.user_role) + '.main' }}>
                          {message.user_name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Typography variant="body2" color="text.secondary">
                                {message.user_name}
                              </Typography>
                              <Chip
                                label={message.user_role}
                                color={getRoleColor(message.user_role) as any}
                                size="small"
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(message.created_at)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {message.message_type === 'text' ? (
                              <Typography variant="body1">
                                {message.message}
                              </Typography>
                            ) : (
                              <Box>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {message.message}
                                </Typography>
                                <Button
                                  size="small"
                                  startIcon={message.message_type === 'image' ? <ImageIcon /> : <DownloadIcon />}
                                  onClick={() => window.open(message.file_url, '_blank')}
                                >
                                  {message.file_name}
                                </Button>
                              </Box>
                            )}
                          </Box>
                        }
                        sx={{
                          '& .MuiListItemText-primary': {
                            textAlign: isCurrentUser ? 'right' : 'left'
                          },
                          '& .MuiListItemText-secondary': {
                            textAlign: isCurrentUser ? 'right' : 'left'
                          }
                        }}
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        {/* Message Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              placeholder={t('chat.typeMessage')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={!isConnected}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setFileDialogOpen(true)}
                      disabled={!isConnected}
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected}
              startIcon={<SendIcon />}
            >
              {t('chat.send')}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* File Upload Dialog */}
      <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)}>
        <DialogTitle>{t('chat.uploadFile')}</DialogTitle>
        <DialogContent>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.txt,.rtf"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            style={{ marginBottom: 16 }}
          />
          {selectedFile && (
            <Typography variant="body2" color="text.secondary">
              {t('chat.selected')}: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileDialogOpen(false)}>
            {t('chat.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <AttachFileIcon />}
          >
            {uploading ? t('chat.uploading') : t('chat.upload')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

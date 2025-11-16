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
  Grid,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  AssignmentInd as AssignmentIndIcon,
  Message as MessageIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { io, Socket } from 'socket.io-client';
import { apiFetch } from '@/lib/api-client';
import DocumentsModal from '@/components/DocumentsModal';

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
  file_key?: string;
  created_at: string;
  user_name: string;
  user_email: string;
  user_role: string;
}

interface FileUpload {
  file: File;
  id: string;
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
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const caseIdNum = parseInt(caseId);

  useEffect(() => {
    if (caseId) {
      fetchCaseData();
      fetchMessages();
      fetchDocuments();
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

  // Cleanup preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const fetchDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const data = await apiFetch(`/api/documents/${caseIdNum}`);
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found for socket authentication');
      return;
    }

    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const options = {
      auth: { token: token },
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io/',
    };

    console.log('Initializing socket with URL:', url);

    try {
      const newSocket = io(url, options);

      newSocket.on('connect', () => {
        console.log('[Frontend] Connected to chat server, joining case:', caseIdNum);
        setIsConnected(true);
        newSocket.emit('join_case', caseIdNum);
        console.log('[Frontend] Emitted join_case event for case:', caseIdNum);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
        setIsConnected(false);
      });

      newSocket.on('chat_history', (history: ChatMessage[]) => {
        setMessages(history || []);
      });

      newSocket.on('new_message', (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
        // If the message contains a file, refresh documents list
        if (message.message_type === 'file' || message.message_type === 'image') {
          fetchDocuments();
        }
      });

      newSocket.on('message_deleted', (data: { message_id: number; case_id: number }) => {
        console.log('[Frontend] Received message_deleted event:', data, 'Current case:', caseIdNum);
        if (data.case_id === caseIdNum) {
          console.log(`[Frontend] Removing message ${data.message_id} from chat`);
          setMessages((prev) => {
            const messageToDelete = prev.find(m => m.id === data.message_id);
            const filtered = prev.filter(m => m.id !== data.message_id);
            console.log(`[Frontend] Messages before: ${prev.length}, after: ${filtered.length}`);
            // If deleted message had a file, refresh documents
            if (messageToDelete && (messageToDelete.message_type === 'file' || messageToDelete.message_type === 'image')) {
              fetchDocuments();
            }
            return filtered;
          });
        } else {
          console.log(`[Frontend] Ignoring message_deleted for different case: ${data.case_id} (current: ${caseIdNum})`);
        }
      });

      newSocket.on('error', (error: any) => {
        console.error('Socket error:', error?.message || error, { url, options });
        if (error?.stack) console.error('Socket error stack:', error.stack);
        setError(error?.message || 'Socket error');
      });

      newSocket.on('connect_error', (error: any) => {
        console.error('Connection error:', error?.message, { url, options });
        if (error?.stack) console.error('Connection error stack:', error.stack);
      });

      newSocket.on('reconnect_error', (error: any) => {
        console.error('Reconnect error:', error?.message, { url, options });
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Reconnect failed', { url, options });
      });

      setSocket(newSocket);
    } catch (err: any) {
      console.error('Failed to initialize socket:', err?.message || err, { url, options });
      if (err?.stack) console.error('Initialize socket stack:', err.stack);
      setError('Failed to initialize socket');
    }
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

  const validateAndAddFiles = (files: File[]) => {
    const validFiles: FileUpload[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} exceeds maximum size of 10MB`);
        continue;
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name} is not a supported file type`);
        continue;
      }

      validFiles.push({ file, id: Math.random().toString(36).substring(7) });
    }

    if (selectedFiles.length + validFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    setSelectedFiles([...selectedFiles, ...validFiles]);
    setError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validateAndAddFiles(files);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading && selectedFiles.length < MAX_FILES) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading || selectedFiles.length >= MAX_FILES) {
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  };

  const removeFile = (id: string) => {
    const fileToRemove = selectedFiles.find(f => f.id === id);
    if (fileToRemove && previewFile && fileToRemove.file === previewFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setPreviewFile(null);
      setPreviewDialogOpen(false);
    }
    setSelectedFiles(selectedFiles.filter(f => f.id !== id));
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !socket) return;

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      selectedFiles.forEach((fileUpload, index) => {
        formData.append(`file-${index}`, fileUpload.file);
      });
      formData.append('caseIdNum', caseIdNum.toString());

      const data = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (data.success && data.data) {
        for (const uploadResult of data.data) {
          if (uploadResult.success) {
            const isImage = uploadResult.isImage;
            socket.emit('send_message', {
              case_id: caseIdNum,
              message: `Shared file: ${uploadResult.fileName}`,
              message_type: isImage ? 'image' : 'file',
              file_url: uploadResult.url,
              file_name: uploadResult.fileName,
              file_size: uploadResult.fileSize,
              file_type: uploadResult.mimeType,
              file_key: uploadResult.key,
              document_id: uploadResult.documentId || null
            });
          }
        }

        // Refresh documents list after upload
        await fetchDocuments();

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setPreviewFile(null);
        setPreviewDialogOpen(false);
        setFileDialogOpen(false);
        setSelectedFiles([]);
      } else {
        setError(data.message || 'Failed to upload files');
      }
    } catch (err) {
      setError('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async (message: ChatMessage) => {
    if (!message.file_key) {
      setError('File key not found');
      return;
    }

    try {
      // Get presigned URL from API
      const response = await fetch(`/api/download?key=${encodeURIComponent(message.file_key)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.success && data.data.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = message.file_name || 'file';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setError('Failed to generate download URL');
      }
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessageToDelete(messageId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;

    const messageIdToDelete = messageToDelete;
    setDeletingMessageId(messageIdToDelete);
    setDeleteDialogOpen(false);
    
    console.log(`[Frontend] Starting delete process for message ${messageIdToDelete} in case ${caseIdNum}`);
    
    try {
      // 1. Call API to delete message
      console.log(`[Frontend] Calling API DELETE for message ${messageIdToDelete}`);
      const response = await fetch(`/api/chat/${caseIdNum}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId: messageIdToDelete }),
      });

      const data = await response.json();
      console.log(`[Frontend] API response:`, data);

      if (data.success) {
        // 2. Check if deleted message had a file before removing
        const messageToDelete = messages.find(m => m.id === messageIdToDelete);
        const hadFile = messageToDelete && (messageToDelete.message_type === 'file' || messageToDelete.message_type === 'image');
        
        // Remove message from local state immediately (optimistic update)
        console.log(`[Frontend] Removing message ${messageIdToDelete} from local state`);
        setMessages((prev) => prev.filter(m => m.id !== messageIdToDelete));
        
        // Refresh documents if deleted message had a file
        if (hadFile) {
          fetchDocuments();
        }
        
        // 3. ALWAYS emit socket event to notify other users
        // This ensures real-time sync - socket server will handle if message already deleted
        if (socket && isConnected) {
          console.log(`[Frontend] Emitting delete_message socket event for case ${caseIdNum}, message ${messageIdToDelete}`);
          socket.emit('delete_message', {
            case_id: caseIdNum,
            message_id: messageIdToDelete
          }, (response: any) => {
            if (response && response.error) {
              console.error('[Frontend] Socket delete_message error:', response.error);
            } else {
              console.log('[Frontend] Socket delete_message acknowledged');
            }
          });
        } else {
          console.warn(`[Frontend] Cannot emit socket event - socket: ${!!socket}, connected: ${isConnected}`);
        }
      } else {
        // Handle API errors
        console.error(`[Frontend] API delete failed:`, data.message);
        if (data.message && !data.message.toLowerCase().includes('not found')) {
          setError(data.message || 'Failed to delete message');
        } else {
          // Message was already deleted, just remove from local state and emit socket event
          console.log(`[Frontend] Message already deleted, removing from local state and emitting socket event`);
          const messageToDelete = messages.find(m => m.id === messageIdToDelete);
          const hadFile = messageToDelete && (messageToDelete.message_type === 'file' || messageToDelete.message_type === 'image');
          setMessages((prev) => prev.filter(m => m.id !== messageIdToDelete));
          if (hadFile) {
            fetchDocuments();
          }
          
          // Still emit socket event to ensure sync
          if (socket && isConnected) {
            socket.emit('delete_message', {
              case_id: caseIdNum,
              message_id: messageIdToDelete
            });
          }
        }
      }
    } catch (err: any) {
      // Handle network errors
      console.error('[Frontend] Error deleting message:', err);
      setMessages((prev) => {
        const exists = prev.some(m => m.id === messageIdToDelete);
        if (exists) {
          setError('Failed to delete message. Please refresh the page.');
        }
        return prev.filter(m => m.id !== messageIdToDelete);
      });
    } finally {
      setDeletingMessageId(null);
      setMessageToDelete(null);
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <AttachFileIcon />;
    if (fileType.startsWith('image/')) return <ImageIcon />;
    if (fileType === 'application/pdf') return <PdfIcon />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <ExcelIcon />;
    if (fileType.includes('word') || fileType.includes('document')) return <DocIcon />;
    return <AttachFileIcon />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handlePreviewFile = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFile(file);
    setPreviewDialogOpen(true);
  };

  const renderFilePreview = () => {
    if (!previewFile || !previewUrl) return null;

    const isImage = previewFile.type.startsWith('image/');
    const isPdf = previewFile.type === 'application/pdf';

    return (
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {isImage ? (
          <Box
            component="img"
            src={previewUrl}
            alt={previewFile.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              margin: 'auto',
            }}
          />
        ) : isPdf ? (
          <Box sx={{ width: '100%', height: '70vh' }}>
            <iframe
              src={previewUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title={previewFile.name}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '70vh',
              gap: 2,
            }}
          >
            {getFileIcon(previewFile.type)}
            <Typography variant="h6">{previewFile.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Preview not available for this file type
            </Typography>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => {
                if (previewUrl && previewFile) {
                  const link = document.createElement('a');
                  link.href = previewUrl;
                  link.download = previewFile.name;
                  link.click();
                }
              }}
            >
              Download to View
            </Button>
          </Box>
        )}
      </Box>
    );
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

      {/* Documents Chip */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Chip
          icon={<AttachFileIcon />}
          label={`Attachments (${documents.length})`}
          onClick={() => setDocumentsModalOpen(true)}
          color="primary"
          variant="outlined"
          disabled={documents.length === 0}
          sx={{
            cursor: documents.length > 0 ? 'pointer' : 'default',
            opacity: documents.length > 0 ? 1 : 0.6,
            '&:hover': documents.length > 0 ? {
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
            } : {},
          }}
        />
      </Box>

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
                                <Box sx={{ display: 'flex', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                                  <Paper
                                    elevation={0}
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      mb: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1.5,
                                      bgcolor:  'rgba(25, 118, 210, 0.08)',
                                      borderColor: 'rgba(25, 118, 210, 0.2)',
                                      maxWidth: '300px',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.12)',
                                        borderColor: 'rgba(25, 118, 210, 0.3)',
                                      }
                                    }}
                                  >
                                  {getFileIcon(message.file_type)}
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                                      {message.file_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatFileSize(message.file_size)}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadFile(message)}
                                    sx={{ 
                                      color: 'primary.main',
                                      '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.08)'
                                      }
                                    }}
                                  >
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                  {isCurrentUser && (
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteMessage(message.id)}
                                      disabled={deletingMessageId === message.id}
                                      sx={{ 
                                        color: 'error.main',
                                        '&:hover': {
                                          bgcolor: 'rgba(211, 47, 47, 0.08)'
                                        }
                                      }}
                                    >
                                      {deletingMessageId === message.id ? (
                                        <CircularProgress size={16} />
                                      ) : (
                                        <DeleteIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  )}
                                  </Paper>
                                </Box>
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
      <Dialog 
        open={fileDialogOpen} 
        onClose={() => !uploading && setFileDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" component="div">
                {t('chat.uploadFile')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedFiles.length} of {MAX_FILES} files selected
              </Typography>
            </Box>
            <Chip 
              label={`${selectedFiles.length}/${MAX_FILES}`} 
              color={selectedFiles.length >= MAX_FILES ? 'error' : 'primary'}
              size="small"
            />
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {/* File Input Area with Drag and Drop */}
          <Paper
            ref={dropZoneRef}
            variant="outlined"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : 'primary.light',
              borderRadius: 2,
              bgcolor: isDragging ? 'primary.light' : 'action.hover',
              cursor: uploading || selectedFiles.length >= MAX_FILES ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              transform: isDragging ? 'scale(1.02)' : 'scale(1)',
              '&:hover': {
                bgcolor: uploading || selectedFiles.length >= MAX_FILES ? 'action.hover' : 'action.selected',
                borderColor: uploading || selectedFiles.length >= MAX_FILES ? 'primary.light' : 'primary.main',
              },
              mb: 3,
            }}
            onClick={() => {
              if (!uploading && selectedFiles.length < MAX_FILES) {
                fileInputRef.current?.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading || selectedFiles.length >= MAX_FILES}
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragging ? 'Drop Files Here' : 'Click to Select Files or Drag & Drop'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximum {MAX_FILES} files, {MAX_FILE_SIZE / (1024 * 1024)}MB per file
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Supported: Images (JPEG, PNG, GIF, WebP), PDF, DOC, DOCX, TXT, RTF, XLS, XLSX
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Selected Files ({selectedFiles.length})
                </Typography>
                <Button
                  size="small"
                  onClick={() => setSelectedFiles([])}
                  disabled={uploading}
                  startIcon={<CloseIcon />}
                >
                  Clear All
                </Button>
              </Box>
              <Grid container spacing={2}>
                {selectedFiles.map((fileUpload) => (
                  <Grid item xs={12} sm={6} key={fileUpload.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 2,
                        '&:hover': {
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {getFileIcon(fileUpload.file.type)}
                        </Box>
                        <Box 
                          sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                          onClick={() => handlePreviewFile(fileUpload.file)}
                        >
                          <Tooltip title={fileUpload.file.name}>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              noWrap
                              sx={{ mb: 0.5, '&:hover': { textDecoration: 'underline' } }}
                            >
                              {fileUpload.file.name}
                            </Typography>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(fileUpload.file.size)}
                          </Typography>
                        </Box>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <Tooltip title="Preview">
                            <IconButton
                              size="small"
                              onClick={() => handlePreviewFile(fileUpload.file)}
                              disabled={uploading}
                              color="primary"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              onClick={() => removeFile(fileUpload.id)}
                              disabled={uploading}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Uploading files...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => {
              if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }
              setPreviewFile(null);
              setPreviewDialogOpen(false);
              setFileDialogOpen(false);
              setSelectedFiles([]);
              setError('');
            }}
            disabled={uploading}
          >
            {t('createCase.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleFileUpload}
            disabled={selectedFiles.length === 0 || uploading}
            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
            size="large"
          >
            {uploading ? t('chat.uploading') : `Upload ${selectedFiles.length} File${selectedFiles.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => {
          setPreviewDialogOpen(false);
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
          }
          setPreviewFile(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {previewFile?.name}
            </Typography>
            <IconButton
              onClick={() => {
                setPreviewDialogOpen(false);
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }
                setPreviewFile(null);
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2, height: '100%', overflow: 'auto' }}>
          {renderFilePreview()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMessageToDelete(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <DeleteIcon color="error" />
            <Typography variant="h6">Delete File</Typography>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this file? This action cannot be undone and the file will be permanently removed from the chat.
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setMessageToDelete(null);
            }}
            disabled={deletingMessageId !== null}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDeleteMessage}
            disabled={deletingMessageId !== null}
            startIcon={deletingMessageId !== null ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {deletingMessageId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Documents Modal */}
      <DocumentsModal
        open={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        documents={documents}
        caseId={caseIdNum}
        loading={loadingDocuments}
      />
    </Box>
  );
}

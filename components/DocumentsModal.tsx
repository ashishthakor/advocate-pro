'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

interface Document {
  id: number;
  file_name: string;
  original_name: string;
  s3_key: string;
  file_size: number;
  mime_type?: string;
  file_type?: string;
  uploaded_by_name?: string;
  uploaded_by_email?: string;
  created_at: string;
}

interface DocumentsModalProps {
  open: boolean;
  onClose: () => void;
  documents: Document[];
  caseId: number;
  loading?: boolean;
}

export default function DocumentsModal({ open, onClose, documents, caseId, loading = false }: DocumentsModalProps) {
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

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/download?key=${encodeURIComponent(doc.s3_key)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = doc.original_name || doc.file_name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Failed to download file:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Case Documents ({documents.length})
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : documents.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No documents found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {documents.map((doc) => (
              <Grid item xs={12} sm={6} key={doc.id}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    '&:hover': {
                      boxShadow: 2,
                      cursor: 'pointer',
                    },
                  }}
                  onClick={() => handleDownload(doc)}
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
                      {getFileIcon(doc.mime_type || doc.file_type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Tooltip title={doc.original_name || doc.file_name}>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          noWrap
                          sx={{ mb: 0.5 }}
                        >
                          {doc.original_name || doc.file_name}
                        </Typography>
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {formatFileSize(doc.file_size)}
                      </Typography>
                      {doc.uploaded_by_name && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Uploaded by {doc.uploaded_by_name}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(doc);
                      }}
                      color="primary"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}


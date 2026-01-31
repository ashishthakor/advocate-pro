'use client';

import React, { useState, useRef } from 'react';
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
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
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

const MAX_FILES = 5;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/rtf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

interface DocumentsModalProps {
  open: boolean;
  onClose: () => void;
  documents: Document[];
  caseId: number;
  loading?: boolean;
  /** Callback after new documents are uploaded so parent can refetch list */
  onDocumentsUpdated?: () => void;
}

export default function DocumentsModal({ open, onClose, documents, caseId, loading = false, onDocumentsUpdated }: DocumentsModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const validateAndAddFiles = (newFiles: File[]) => {
    const valid: File[] = [];
    let err = '';
    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        err = err || `${file.name} exceeds 10MB`;
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        err = err || `${file.name} is not supported`;
        continue;
      }
      valid.push(file);
    }
    if (files.length + valid.length > MAX_FILES) err = err || `Max ${MAX_FILES} files`;
    setFiles((prev) => (prev.length + valid.length <= MAX_FILES ? [...prev, ...valid] : prev));
    setUploadError(err || '');
  };

  const handleUpload = async () => {
    if (!files.length || !caseId) return;
    setUploading(true);
    setUploadError('');
    const formData = new FormData();
    files.forEach((f, i) => formData.append(`file-${i}`, f));
    formData.append('caseId', caseId.toString());
    formData.append('folder', 'cases');
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (data?.success && data?.data?.length) {
        setFiles([]);
        onDocumentsUpdated?.();
      } else {
        setUploadError(data?.message || 'Upload failed');
      }
    } catch {
      setUploadError('Upload failed');
    } finally {
      setUploading(false);
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
        ) : (
          <>
          {documents.length === 0 ? (
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

          {onDocumentsUpdated && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Upload more documents</Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: 'center', border: '2px dashed', borderColor: 'divider', cursor: 'pointer', mb: 2 }}
                onClick={() => files.length < MAX_FILES && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.rtf,.xls,.xlsx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    if (picked.length) validateAndAddFiles(picked);
                    e.target.value = '';
                  }}
                />
                <CloudUploadIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Click to select files (max {MAX_FILES}, 10MB each)
                </Typography>
              </Paper>
              {uploadError && (
                <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>{uploadError}</Typography>
              )}
              {files.length > 0 && (
                <Box>
                  {files.map((f, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1} mb={0.5}>
                      {getFileIcon(f.type)}
                      <Typography variant="body2" noWrap sx={{ flex: 1 }}>{f.name}</Typography>
                      <Typography variant="caption">{formatFileSize(f.size)}</Typography>
                      <IconButton size="small" onClick={() => setFiles((p) => p.filter((_, i) => i !== idx))} color="error"><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                  <Button size="small" variant="contained" onClick={handleUpload} disabled={uploading} startIcon={uploading ? <CircularProgress size={16} /> : undefined} sx={{ mt: 1 }}>
                    {uploading ? 'Uploading…' : 'Upload ' + files.length + ' file(s)'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
          </>
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


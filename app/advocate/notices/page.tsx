'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Pagination,
  useTheme,
  Backdrop,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  DeleteOutline as DeleteOutlineIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { apiFetch } from '@/lib/api-client';
import { useDebounce } from '@/lib/utils';
import { InputAdornment } from '@mui/material';

interface Case {
  id: number;
  case_number: string;
  title: string;
  advocate_id: number;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
}

interface Notice {
  id: number;
  case_id: number;
  respondent_name: string;
  respondent_address: string;
  subject: string | null;
  date: string | null;
  pdf_filename: string | null;
  uploaded_file_path: string | null;
  notice_stage: string | null;
  tracking_id: string | null;
  created_at: string;
  case?: Case;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdvocateNoticesPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [notices, setNotices] = useState<Notice[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Upload dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | ''>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [noticeStage, setNoticeStage] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Delete confirmation dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    fetchNotices(1);
  }, [debouncedSearchTerm]);

  const fetchCases = async () => {
    try {
      const response = await apiFetch('/api/cases?limit=1000');
      if (response.success) {
        // Filter cases assigned to this advocate
        const assignedCases = (response.data.cases || []).filter((c: Case) => c.advocate_id);
        setCases(assignedCases);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

  const fetchNotices = async (page = 1) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sortBy: 'updated_at',
        sortOrder: 'DESC',
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }

      const response = await apiFetch(`/api/notices?${params.toString()}`);

      if (response.success) {
        setNotices(response.data.notices || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setError(response.message || 'Failed to fetch notices');
      }
    } catch (err) {
      setError('Failed to fetch notices');
    } finally {
      setLoading(false);
    }
  };

  // Calculate next notice stage for a case - returns only the number
  const calculateNextNoticeStage = async (caseId: number) => {
    try {
      const response = await apiFetch(`/api/notices?case_id=${caseId}&limit=1000`);
      if (response.success) {
        const notices = response.data.notices || [];
        const count = notices.length;
        // Return only the number part (next stage number)
        return (count + 1).toString();
      }
    } catch (err) {
      console.error('Failed to calculate notice stage:', err);
    }
    return '1';
  };

  // Handle case selection - auto-calculate notice stage
  const handleCaseSelection = async (caseId: number | '') => {
    setSelectedCaseId(caseId);
    if (caseId && typeof caseId === 'number') {
      const nextStage = await calculateNextNoticeStage(caseId);
      setNoticeStage(nextStage);
    } else {
      setNoticeStage('');
    }
  };

  const handleUploadNotice = async () => {
    if (!selectedCaseId || !uploadFile) {
      setError('Please select a case and upload a file');
      return;
    }

    try {
      setUploadLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('case_id', selectedCaseId.toString());
      formData.append('file', uploadFile);
      if (noticeStage.trim()) {
        // Combine "Notice-" prefix with the number
        formData.append('notice_stage', `Notice-${noticeStage.trim()}`);
      }
      if (trackingId.trim()) {
        formData.append('tracking_id', trackingId.trim());
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/notices/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Notice uploaded successfully');
        setUploadDialogOpen(false);
        setUploadFile(null);
        setSelectedCaseId('');
        setNoticeStage('');
        setTrackingId('');
        fetchNotices();
      } else {
        setError(data.message || 'Failed to upload notice');
      }
    } catch (err) {
      setError('Failed to upload notice');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDownloadPDF = async (notice: Notice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/notices/${notice.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = notice.uploaded_file_path
          ? notice.uploaded_file_path.split('/').pop() || `Notice_${notice.id}`
          : notice.pdf_filename || `Notice_${notice.id}.pdf`;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download file');
      }
    } catch (err) {
      setError('Failed to download file');
    }
  };

  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const handleDeleteNotice = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNotice = async () => {
    if (!noticeToDelete || deleteLoading) return;

    try {
      setDeleteLoading(true);
      const response = await apiFetch(`/api/notices/${noticeToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setSuccess('Notice deleted successfully');
        setDeleteDialogOpen(false);
        setNoticeToDelete(null);
        fetchNotices();
      } else {
        setError(response.message || 'Failed to delete notice');
      }
    } catch (err) {
      setError('Failed to delete notice');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle file selection with preview
  const handleFileSelect = (file: File) => {
    setUploadFile(file);
    // Create preview URL for PDF
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  // Handle file removal
  const handleFileRemove = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setUploadFile(null);
    setFilePreviewUrl(null);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx'))) {
      handleFileSelect(file);
    }
  };

  return (
    <>
      {/* Backdrop to disable page while uploading */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={uploadLoading}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Uploading notice...
          </Typography>
        </Box>
      </Backdrop>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => fetchNotices(pagination.currentPage)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={() => {
              setUploadDialogOpen(true);
              setSelectedCaseId('');
              setUploadFile(null);
              setNoticeStage('');
              setTrackingId('');
            }}
          >
            Upload Notice
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          message={success}
        />
      )}

      {/* Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search notices..."
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
          </Grid>
        </CardContent>
      </Card>

      {/* Notices Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Case</TableCell>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Respondent</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Notice Stage</TableCell>
                  <TableCell>Tracking ID</TableCell>
                  <TableCell>Notice Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : notices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchTerm ? 'No notices found matching your search' : 'No notices found'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  notices.map((notice) => (
                    <TableRow key={notice.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {notice.case?.title || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{notice.case?.case_number || notice.case_id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notice.case?.user?.name || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {notice.respondent_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notice.respondent_address}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {(notice.uploaded_file_path || notice.pdf_filename) ? (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              '&:hover': {
                                textDecoration: 'none',
                              },
                            }}
                            onClick={() => handleDownloadPDF(notice)}
                          >
                            {notice.uploaded_file_path
                              ? notice.uploaded_file_path.split('/').pop() || 'Uploaded File'
                              : notice.pdf_filename}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notice.notice_stage || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {notice.tracking_id || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateForDisplay(notice.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Download">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownloadPDF(notice)}
                            >
                              <DescriptionIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteNotice(notice)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={(e, page) => fetchNotices(page)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Upload Notice Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => {
          if (!uploadLoading) {
            setUploadDialogOpen(false);
            handleFileRemove();
            setSelectedCaseId('');
            setNoticeStage('');
            setTrackingId('');
          }
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle>Upload Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              {/* File Upload Area */}
              <Box
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '2px dashed',
                  borderColor: isDragging ? 'primary.main' : 'primary.light',
                  borderRadius: 2,
                  bgcolor: isDragging ? 'primary.light' : 'action.hover',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  mb: uploadFile ? 2 : 0,
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.doc,.docx';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      handleFileSelect(file);
                    }
                  };
                  input.click();
                }}
              >
                {!uploadFile ? (
                  <>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {isDragging ? 'Drop File Here' : 'Click to Select File or Drag & Drop'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Only PDF, DOC, and DOCX files are allowed. Max size: 10MB
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'left' }}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">{uploadFile.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {filePreviewUrl && (
                            <Tooltip title="Preview">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(filePreviewUrl, '_blank');
                                }}
                                color="primary"
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Remove">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFileRemove();
                              }}
                              color="error"
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Card>
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required disabled={uploadLoading}>
                <InputLabel>Select Case</InputLabel>
                <Select
                  value={selectedCaseId}
                  label="Select Case"
                  onChange={(e) => {
                    handleCaseSelection(e.target.value as number);
                  }}
                  disabled={uploadLoading}
                  sx={{
                    bgcolor: isDarkMode ? '#383838' : 'background.paper',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.divider : undefined,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: isDarkMode ? theme.palette.primary.main : undefined,
                    },
                  }}
                >
                  {cases.map((case_) => (
                    <MenuItem key={case_.id} value={case_.id}>
                      {case_.title} (#{case_.case_number})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Notice Stage"
                value={noticeStage}
                onChange={(e) => {
                  // Only allow numbers
                  const value = e.target.value.replace(/\D/g, '');
                  setNoticeStage(value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        Notice-
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                helperText="Auto-filled based on existing notices. You can edit the number if needed."
                placeholder="1"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tracking ID (Optional)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                helperText="Optional tracking ID for the sent notice"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (!uploadLoading) {
                setUploadDialogOpen(false);
                setUploadFile(null);
                setSelectedCaseId('');
                setNoticeStage('');
                setTrackingId('');
              }
            }}
            disabled={uploadLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadNotice}
            variant="contained"
            disabled={uploadLoading || !selectedCaseId || !uploadFile}
          >
            {uploadLoading ? <CircularProgress size={24} /> : 'Upload Notice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteDialogOpen(false);
            setNoticeToDelete(null);
          }
        }}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle>Delete Notice</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this notice?
            {noticeToDelete && (
              <>
                <br />
                <strong>Notice Stage:</strong> {noticeToDelete.notice_stage || 'N/A'}
                <br />
                <strong>Case:</strong> {noticeToDelete.case?.title || noticeToDelete.case_id}
              </>
            )}
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setNoticeToDelete(null);
            }}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteNotice}
            variant="contained"
            color="error"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

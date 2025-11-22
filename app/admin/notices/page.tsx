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
  Chip,
  Snackbar,
  Pagination,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { apiFetch } from '@/lib/api-client';
import ReactQuillEditor from '@/components/ReactQuillEditor';

interface Case {
  id: number;
  case_number: string;
  title: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  // Flat fields from API
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_address?: string;
}

interface Notice {
  id: number;
  case_id: number;
  respondent_name: string;
  respondent_address: string;
  respondent_pincode: string;
  subject: string | null;
  date: string | null;
  content: string;
  pdf_filename: string;
  email_sent: boolean;
  email_sent_at: string | null;
  email_sent_count: number;
  recipient_email: string | null;
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

export default function NoticesPage() {
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

  // Form states
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | ''>('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentAddress, setRespondentAddress] = useState('');
  const [respondentPincode, setRespondentPincode] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [date, setDate] = useState('');
  
  // Form validation errors
  const [formErrors, setFormErrors] = useState<{
    selectedCaseId?: string;
    respondentName?: string;
    respondentAddress?: string;
    respondentPincode?: string;
    subject?: string;
    content?: string;
    recipientEmail?: string;
    date?: string;
  }>({});

  // Email dialog states
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [editFormLoading, setEditFormLoading] = useState(false);
  
  // Track dialog open state for ReactQuill key
  const [createDialogKey, setCreateDialogKey] = useState(0);

  useEffect(() => {
    fetchNotices();
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await apiFetch('/api/cases?limit=1000');
      if (response.success) {
        setCases(response.data.cases || []);
      }
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

  const fetchNotices = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiFetch(`/api/notices?page=${page}&limit=10`);
      
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

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!selectedCaseId) {
      errors.selectedCaseId = 'Please select a case';
    }
    
    if (!respondentName || respondentName.trim() === '') {
      errors.respondentName = 'Respondent name is required';
    }
    
    if (!respondentAddress || respondentAddress.trim() === '') {
      errors.respondentAddress = 'Respondent address is required';
    }
    
    if (!respondentPincode || respondentPincode.trim() === '') {
      errors.respondentPincode = 'Respondent pincode is required';
    } else if (!/^\d{6}$/.test(respondentPincode.trim())) {
      errors.respondentPincode = 'Pincode must be 6 digits';
    }
    
    if (!subject || subject.trim() === '') {
      errors.subject = 'Subject is required';
    }
    
    // Check if content is empty - React Quill returns '<p><br></p>' for empty content
    const isEmptyContent = !content || 
      content.trim() === '' || 
      content.trim() === '<p><br></p>' ||
      content.trim() === '<p></p>';
    
    if (isEmptyContent) {
      errors.content = 'Content is required';
    } else {
      // Strip HTML tags to check actual content length (but don't modify the original content)
      const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
      if (textContent.length < 10) {
        errors.content = 'Content must be at least 10 characters';
      }
    }
    
    if (recipientEmail && recipientEmail.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail.trim())) {
        errors.recipientEmail = 'Please enter a valid email address';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNotice = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);
      setError('');
      setFormErrors({});

      const response = await apiFetch('/api/notices', {
        method: 'POST',
        body: JSON.stringify({
          case_id: selectedCaseId,
          respondent_name: respondentName.trim(),
          respondent_address: respondentAddress.trim(),
          respondent_pincode: respondentPincode.trim(),
          subject: subject.trim(),
          content: content, // Don't trim HTML content - it may contain meaningful whitespace
          date: date.trim() || undefined,
          recipient_email: recipientEmail.trim() || null,
        }),
      });

      if (response.success) {
        setSuccess('Notice created successfully');
        setFormOpen(false);
        resetForm();
        // Increment key when dialog closes to force fresh mount on next open
        setCreateDialogKey(prev => prev + 1);
        fetchNotices();
      } else {
        setError(response.message || 'Failed to create notice');
      }
    } catch (err) {
      setError('Failed to create notice');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailAddress || !selectedNotice) {
      setError('Please enter recipient email address');
      return;
    }

    try {
      setEmailLoading(true);
      setError('');

      const response = await apiFetch(`/api/notices/${selectedNotice.id}/send-email`, {
        method: 'POST',
        body: JSON.stringify({
          recipient_email: emailAddress,
        }),
      });

      if (response.success) {
        setSuccess('Email sent successfully with PDF attachment');
        setEmailDialogOpen(false);
        setEmailAddress('');
        setSelectedNotice(null);
        fetchNotices();
      } else {
        setError(response.message || 'Failed to send email');
      }
    } catch (err) {
      setError('Failed to send email');
    } finally {
      setEmailLoading(false);
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
        a.download = `Notice_${notice.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download PDF');
      }
    } catch (err) {
      setError('Failed to download PDF');
    }
  };

  const handleEditNotice = async (notice: Notice) => {
    // Reset form first to clear any previous data
    resetForm();
    
    // Ensure cases are loaded
    if (cases.length === 0) {
      await fetchCases();
    }
    
    // Set form values
    setEditingNotice(notice);
    setSelectedCaseId(notice.case_id);
    setRespondentName(notice.respondent_name);
    setRespondentAddress(notice.respondent_address);
    setRespondentPincode(notice.respondent_pincode);
    setSubject(notice.subject || '');
    // Set content directly - ReactQuill will handle it properly
    setContent(notice.content || '');
    setRecipientEmail(notice.recipient_email || '');
    // Set date from notice - convert to YYYY-MM-DD format for date input
    setDate(formatDateForInput(notice.date));
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleUpdateNotice = async () => {
    if (!validateForm() || !editingNotice) {
      return;
    }

    try {
      setEditFormLoading(true);
      setError('');
      setFormErrors({});

      const response = await apiFetch(`/api/notices/${editingNotice.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          case_id: selectedCaseId,
          respondent_name: respondentName.trim(),
          respondent_address: respondentAddress.trim(),
          respondent_pincode: respondentPincode.trim(),
          subject: subject.trim(),
          content: content, // Don't trim HTML content - it may contain meaningful whitespace
          date: date.trim() || undefined,
          recipient_email: recipientEmail.trim() || null,
        }),
      });

      if (response.success) {
        setSuccess('Notice updated successfully');
        setEditDialogOpen(false);
        setEditingNotice(null);
        resetForm();
        fetchNotices();
      } else {
        setError(response.message || 'Failed to update notice');
      }
    } catch (err) {
      setError('Failed to update notice');
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleDeleteNotice = async (notice: Notice) => {
    if (!confirm('Are you sure you want to delete this notice?')) {
      return;
    }

    try {
      const response = await apiFetch(`/api/notices/${notice.id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        setSuccess('Notice deleted successfully');
        fetchNotices();
      } else {
        setError(response.message || 'Failed to delete notice');
      }
    } catch (err) {
      setError('Failed to delete notice');
    }
  };

  // Helper function to format date from database (YYYY-MM-DD) to input format
  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      // Handle both DATE format (YYYY-MM-DD) and string format (DD.MM.YYYY)
      if (dateString.includes('.')) {
        // DD.MM.YYYY format - convert to YYYY-MM-DD
        const [day, month, year] = dateString.split('.');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        // Already in YYYY-MM-DD format
        return dateString.split('T')[0]; // Remove time if present
      }
    } catch {
      return '';
    }
  };

  // Helper function to format date for display (DD-MM-YYYY)
  const formatDateForDisplay = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      let date: Date;
      if (dateString.includes('.')) {
        // DD.MM.YYYY format
        const [day, month, year] = dateString.split('.');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateString.includes('-')) {
        // YYYY-MM-DD or DD-MM-YYYY format
        const parts = dateString.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD format
          date = new Date(dateString);
        } else {
          // DD-MM-YYYY format
          const [day, month, year] = parts;
          date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      } else {
        // YYYY-MM-DD format (no separator check needed)
        date = new Date(dateString);
      }
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateString;
    }
  };

  const resetForm = () => {
    setSelectedCaseId('');
    setRespondentName('');
    setRespondentAddress('');
    setRespondentPincode('');
    setSubject('');
    setContent('');
    setRecipientEmail('');
    setDate('');
    setFormErrors({});
  };

  const handleCancelForm = () => {
    resetForm();
    setFormOpen(false);
    // Increment key when dialog closes to force fresh mount on next open
    setCreateDialogKey(prev => prev + 1);
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  return (
    <>
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
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Create Notice
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
                  <TableCell>Notice Date</TableCell>
                  {/* <TableCell>Status</TableCell> */}
                  {/* <TableCell>Email Count</TableCell> */}
                  {/* <TableCell>Created</TableCell> */}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : notices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No notices found
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
                        {notice.case?.user?.name || 'N/A'}
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
                        {notice.pdf_filename ? (
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
                            {notice.pdf_filename}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDateForDisplay(notice.date)}
                        </Typography>
                      </TableCell>
                      {/* <TableCell>
                        <Chip
                          label={notice.email_sent ? 'Email Sent' : 'Draft'}
                          color={notice.email_sent ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell> */}
                      {/* <TableCell>
                        <Typography variant="body2">
                          {notice.email_sent_count || 0}
                        </Typography>
                      </TableCell> */}
                      {/* <TableCell>
                        {new Date(notice.created_at).toLocaleDateString()}
                      </TableCell> */}
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Notice">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditNotice(notice)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {/* <Tooltip title="Send Email">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedNotice(notice);
                                setEmailAddress(notice.recipient_email || '');
                                setEmailDialogOpen(true);
                              }}
                            >
                              <EmailIcon />
                            </IconButton>
                          </Tooltip> */}
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

      {/* Create Notice Dialog */}
      <Dialog 
        open={formOpen} 
        onClose={(event, reason) => {
          // Prevent closing when loading or when clicking backdrop during API call
          if (formLoading) {
            return;
          }
          if (reason === 'backdropClick' && formLoading) {
            return;
          }
          handleCancelForm();
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle>Create Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                required 
                error={!!formErrors.selectedCaseId}
              >
                <InputLabel>Select Case</InputLabel>
                <Select
                  value={selectedCaseId}
                  label="Select Case"
                  onChange={(e) => {
                    setSelectedCaseId(e.target.value as number);
                    if (formErrors.selectedCaseId) {
                      setFormErrors({ ...formErrors, selectedCaseId: undefined });
                    }
                  }}
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
                {formErrors.selectedCaseId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {formErrors.selectedCaseId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {selectedCase && (
              <Grid item xs={12}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    bgcolor: (theme) => theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'grey.50'
                  }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    Applicant Details (Auto-populated from Case)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Name:</strong> {selectedCase.user?.name || selectedCase.user_name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Address:</strong> {selectedCase.user?.address || selectedCase.user_address || 'N/A'}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Email:</strong> {selectedCase.user?.email || selectedCase.user_email || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedCase.user?.phone || selectedCase.user_phone || 'N/A'}
                  </Typography>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Respondent Name"
                value={respondentName}
                onChange={(e) => {
                  setRespondentName(e.target.value);
                  if (formErrors.respondentName) {
                    setFormErrors({ ...formErrors, respondentName: undefined });
                  }
                }}
                required
                error={!!formErrors.respondentName}
                helperText={formErrors.respondentName}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Respondent Address"
                value={respondentAddress}
                onChange={(e) => {
                  setRespondentAddress(e.target.value);
                  if (formErrors.respondentAddress) {
                    setFormErrors({ ...formErrors, respondentAddress: undefined });
                  }
                }}
                multiline
                rows={3}
                required
                error={!!formErrors.respondentAddress}
                helperText={formErrors.respondentAddress}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Respondent Pincode"
                value={respondentPincode}
                onChange={(e) => {
                  setRespondentPincode(e.target.value);
                  if (formErrors.respondentPincode) {
                    setFormErrors({ ...formErrors, respondentPincode: undefined });
                  }
                }}
                required
                error={!!formErrors.respondentPincode}
                helperText={formErrors.respondentPincode || 'Must be 6 digits'}
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (formErrors.subject) {
                    setFormErrors({ ...formErrors, subject: undefined });
                  }
                }}
                required
                error={!!formErrors.subject}
                helperText={formErrors.subject || 'Subject line for the notice'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date (Optional)"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (formErrors.date) {
                    setFormErrors({ ...formErrors, date: undefined });
                  }
                }}
                error={!!formErrors.date}
                helperText={formErrors.date || 'Format: DD-MM-YYYY (e.g., 06-11-2025). Leave empty to use current date.'}
                placeholder="DD-MM-YYYY"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recipient Email (Optional)"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  if (formErrors.recipientEmail) {
                    setFormErrors({ ...formErrors, recipientEmail: undefined });
                  }
                }}
                type="email"
                error={!!formErrors.recipientEmail}
                helperText={formErrors.recipientEmail}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Content <span style={{ color: 'red' }}>*</span>
              </Typography>
              <ReactQuillEditor
                key={`create-${createDialogKey}`} // Stable key that only changes when dialog opens/closes
                value={content}
                onChange={(value) => {
                  setContent(value);
                  if (formErrors.content) {
                    setFormErrors({ ...formErrors, content: undefined });
                  }
                }}
                placeholder="Enter notice content..."
                error={!!formErrors.content}
                helperText={formErrors.content || 'This content will be included in the notice PDF'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelForm} disabled={formLoading}>Cancel</Button>
          <Button
            onClick={handleCreateNotice}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : 'Create Notice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Notice Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={(event, reason) => {
          // Prevent closing when loading or when clicking backdrop during API call
          if (editFormLoading) {
            return;
          }
          if (reason === 'backdropClick' && editFormLoading) {
            return;
          }
          setEditDialogOpen(false);
          setEditingNotice(null);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle>Edit Notice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.selectedCaseId}>
                <InputLabel>Select Case</InputLabel>
                <Select
                  value={selectedCaseId}
                  onChange={(e) => {
                    setSelectedCaseId(e.target.value as number);
                    if (formErrors.selectedCaseId) {
                      setFormErrors({ ...formErrors, selectedCaseId: undefined });
                    }
                  }}
                  label="Select Case"
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
                  {cases.map((caseItem) => (
                    <MenuItem key={caseItem.id} value={caseItem.id}>
                      {caseItem.title} (#{caseItem.case_number})
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.selectedCaseId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {formErrors.selectedCaseId}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {selectedCaseId && (
              <Grid item xs={12}>
                <Card sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Applicant Details (Auto-populated from Case)
                  </Typography>
                  {(() => {
                    const selectedCase = cases.find(c => c.id === selectedCaseId);
                    const userName = selectedCase?.user?.name || selectedCase?.user_name;
                    const userAddress = selectedCase?.user?.address || selectedCase?.user_address;
                    const userEmail = selectedCase?.user?.email || selectedCase?.user_email;
                    const userPhone = selectedCase?.user?.phone || selectedCase?.user_phone;
                    
                    if (userName) {
                      return (
                        <>
                          <Typography variant="body2">
                            <strong>Name:</strong> {userName}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Address:</strong> {userAddress || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {userEmail || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Phone:</strong> {userPhone || 'N/A'}
                          </Typography>
                        </>
                      );
                    } else if (editingNotice?.case?.user) {
                      // Fallback: use case data from notice if available
                      const caseUser = editingNotice.case.user;
                      return (
                        <>
                          <Typography variant="body2">
                            <strong>Name:</strong> {caseUser.name || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Address:</strong> {caseUser.address || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Email:</strong> {caseUser.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Phone:</strong> {caseUser.phone || 'N/A'}
                          </Typography>
                        </>
                      );
                    } else {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          Loading case details...
                        </Typography>
                      );
                    }
                  })()}
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Respondent Name"
                value={respondentName}
                onChange={(e) => {
                  setRespondentName(e.target.value);
                  if (formErrors.respondentName) {
                    setFormErrors({ ...formErrors, respondentName: undefined });
                  }
                }}
                required
                error={!!formErrors.respondentName}
                helperText={formErrors.respondentName}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Respondent Pincode"
                value={respondentPincode}
                onChange={(e) => {
                  setRespondentPincode(e.target.value);
                  if (formErrors.respondentPincode) {
                    setFormErrors({ ...formErrors, respondentPincode: undefined });
                  }
                }}
                required
                error={!!formErrors.respondentPincode}
                helperText={formErrors.respondentPincode || 'Must be 6 digits'}
                inputProps={{ maxLength: 6 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Respondent Address"
                value={respondentAddress}
                onChange={(e) => {
                  setRespondentAddress(e.target.value);
                  if (formErrors.respondentAddress) {
                    setFormErrors({ ...formErrors, respondentAddress: undefined });
                  }
                }}
                multiline
                rows={2}
                required
                error={!!formErrors.respondentAddress}
                helperText={formErrors.respondentAddress}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (formErrors.subject) {
                    setFormErrors({ ...formErrors, subject: undefined });
                  }
                }}
                required
                error={!!formErrors.subject}
                helperText={formErrors.subject || 'Subject line for the notice'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date (Optional)"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (formErrors.date) {
                    setFormErrors({ ...formErrors, date: undefined });
                  }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!formErrors.date}
                helperText={formErrors.date || 'Leave empty to use current date'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Recipient Email (Optional)"
                value={recipientEmail}
                onChange={(e) => {
                  setRecipientEmail(e.target.value);
                  if (formErrors.recipientEmail) {
                    setFormErrors({ ...formErrors, recipientEmail: undefined });
                  }
                }}
                type="email"
                error={!!formErrors.recipientEmail}
                helperText={formErrors.recipientEmail}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Content <span style={{ color: 'red' }}>*</span>
              </Typography>
              <ReactQuillEditor
                key={editingNotice?.id || 'edit'} // Force re-render when editing different notices
                value={content}
                onChange={(value) => {
                  setContent(value);
                  if (formErrors.content) {
                    setFormErrors({ ...formErrors, content: undefined });
                  }
                }}
                placeholder="Enter notice content..."
                error={!!formErrors.content}
                helperText={formErrors.content || 'This content will be included in the notice PDF'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (!editFormLoading) {
                setEditDialogOpen(false);
                setEditingNotice(null);
                resetForm();
              }
            }}
            disabled={editFormLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateNotice}
            variant="contained"
            disabled={editFormLoading}
          >
            {editFormLoading ? <CircularProgress size={24} /> : 'Update Notice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
          }
        }}
      >
        <DialogTitle>Send Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Recipient Email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            type="email"
            sx={{ mt: 2 }}
            required
            helperText="The PDF will be automatically attached and sent from the backend."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            disabled={emailLoading || !emailAddress}
          >
            {emailLoading ? <CircularProgress size={24} /> : 'Send Email'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}


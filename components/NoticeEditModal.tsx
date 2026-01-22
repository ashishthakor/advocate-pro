'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Typography,
} from '@mui/material';
import { apiFetch } from '@/lib/api-client';
import ReactQuillEditor from './ReactQuillEditor';
import { NoticeItem, updateNoticeInState } from '@/store/slices/noticesSlice';
import { useDispatch } from 'react-redux';

interface NoticeEditModalProps {
  open: boolean;
  notice: NoticeItem | null;
  cases: Array<{ id: number; case_number: string; title: string }>;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function NoticeEditModal({
  open,
  notice,
  cases,
  onClose,
  onSuccess,
}: NoticeEditModalProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState<number | ''>('');
  const [respondentName, setRespondentName] = useState('');
  const [respondentAddress, setRespondentAddress] = useState('');
  const [respondentPincode, setRespondentPincode] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [date, setDate] = useState('');
  const [noticeNumber, setNoticeNumber] = useState<number>(1);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Initialize form when notice changes
  useEffect(() => {
    if (notice && open) {
      setSelectedCaseId(notice.case_id);
      setRespondentName(notice.respondent_name);
      setRespondentAddress(notice.respondent_address);
      setRespondentPincode(notice.respondent_pincode);
      setSubject(notice.subject || '');
      setContent(notice.content || '');
      setRecipientEmail(notice.recipient_email || '');
      setDate(formatDateForInput(notice.date));
      setNoticeNumber(notice.notice_number || 1);
      setError('');
      setFormErrors({});
    }
  }, [notice, open]);

  const formatDateForInput = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedCaseId) {
      errors.selectedCaseId = 'Please select a case';
    }
    if (!respondentName.trim()) {
      errors.respondentName = 'Respondent name is required';
    }
    if (!respondentAddress.trim()) {
      errors.respondentAddress = 'Respondent address is required';
    }
    if (!respondentPincode.trim()) {
      errors.respondentPincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(respondentPincode.trim())) {
      errors.respondentPincode = 'Pincode must be 6 digits';
    }
    if (!content.trim() || content === '<p><br></p>') {
      errors.content = 'Content is required';
    }
    if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      errors.recipientEmail = 'Please enter a valid email address';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm() || !notice) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await apiFetch(`/api/notices/${notice.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          case_id: selectedCaseId,
          respondent_name: respondentName.trim(),
          respondent_address: respondentAddress.trim(),
          respondent_pincode: respondentPincode.trim(),
          subject: subject.trim(),
          content: content,
          date: date.trim() || undefined,
          recipient_email: recipientEmail.trim() || null,
          notice_number: noticeNumber,
        }),
      });

      if (response.success) {
        // Update Redux state
        if (response.data && response.data.notice) {
          dispatch(updateNoticeInState({ caseId: notice.case_id, notice: response.data.notice }));
        }
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || 'Failed to update notice');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update notice');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      setFormErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Notice</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <FormControl fullWidth error={!!formErrors.selectedCaseId}>
              <InputLabel>Case *</InputLabel>
              <Select
                value={selectedCaseId}
                label="Case *"
                onChange={(e) => {
                  setSelectedCaseId(e.target.value as number);
                  if (formErrors.selectedCaseId) {
                    setFormErrors({ ...formErrors, selectedCaseId: undefined });
                  }
                }}
                disabled={loading}
              >
                {cases.map((case_) => (
                  <MenuItem key={case_.id} value={case_.id}>
                    {case_.case_number} - {case_.title}
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

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Respondent Name *"
              value={respondentName}
              onChange={(e) => {
                setRespondentName(e.target.value);
                if (formErrors.respondentName) {
                  setFormErrors({ ...formErrors, respondentName: undefined });
                }
              }}
              error={!!formErrors.respondentName}
              helperText={formErrors.respondentName}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pincode *"
              value={respondentPincode}
              onChange={(e) => {
                setRespondentPincode(e.target.value);
                if (formErrors.respondentPincode) {
                  setFormErrors({ ...formErrors, respondentPincode: undefined });
                }
              }}
              error={!!formErrors.respondentPincode}
              helperText={formErrors.respondentPincode}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Respondent Address *"
              value={respondentAddress}
              onChange={(e) => {
                setRespondentAddress(e.target.value);
                if (formErrors.respondentAddress) {
                  setFormErrors({ ...formErrors, respondentAddress: undefined });
                }
              }}
              multiline
              rows={3}
              error={!!formErrors.respondentAddress}
              helperText={formErrors.respondentAddress}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Recipient Email"
              type="email"
              value={recipientEmail}
              onChange={(e) => {
                setRecipientEmail(e.target.value);
                if (formErrors.recipientEmail) {
                  setFormErrors({ ...formErrors, recipientEmail: undefined });
                }
              }}
              error={!!formErrors.recipientEmail}
              helperText={formErrors.recipientEmail}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Notice Number</InputLabel>
              <Select
                value={noticeNumber}
                label="Notice Number"
                onChange={(e) => setNoticeNumber(parseInt(e.target.value as string) || 1)}
                disabled={loading}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <MenuItem key={num} value={num}>
                    Notice {num}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Content <span style={{ color: 'red' }}>*</span>
            </Typography>
            <ReactQuillEditor
              key={notice?.id || 'edit'}
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
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update Notice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

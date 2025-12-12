'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { apiFetch } from '@/lib/api-client';
import { CASE_STATUS_CONFIG, getStatusConfig } from '@/lib/utils';

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  caseId: number;
  currentStatus: string;
  currentPriority: string;
  caseTitle: string;
  onStatusUpdated: () => void;
  paymentStatus?: string | null;
}

export default function StatusUpdateModal({
  open,
  onClose,
  caseId,
  currentStatus,
  currentPriority,
  caseTitle,
  onStatusUpdated,
  paymentStatus,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [selectedPriority, setSelectedPriority] = useState(currentPriority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal opens with new values
  useEffect(() => {
    if (open) {
      setSelectedStatus(currentStatus);
      setSelectedPriority(currentPriority);
      setError('');
    }
  }, [open, currentStatus, currentPriority]);

  const handleStatusUpdate = async () => {
    if (selectedStatus === currentStatus && selectedPriority === currentPriority) {
      onClose();
      return;
    }

    // Prevent status update if payment is pending
    if (paymentStatus === 'pending') {
      setError('Cannot update case status. Payment is still pending. Please wait for payment completion or mark payment as paid.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      console.log('Updating case:', {
        caseId,
        status: selectedStatus,
        priority: selectedPriority
      });

      const response = await apiFetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: selectedStatus,
          priority: selectedPriority
        }),
      });

      console.log('API Response:', response);

      if (response.success) {
        onStatusUpdated();
        onClose();
      } else {
        setError(response.message || 'Failed to update case status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      setError('Failed to update case status');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedStatus(currentStatus);
    setSelectedPriority(currentPriority);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Case Status & Priority
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Case: {caseTitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="body2">Current Status:</Typography>
            <Chip
              label={getStatusConfig(currentStatus).label}
              color={getStatusConfig(currentStatus).color}
              size="small"
            />
          </Box>
          {paymentStatus === 'pending' && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Payment is pending. Status cannot be updated until payment is completed.
            </Alert>
          )}
        </Box>

        <FormControl fullWidth>
          <InputLabel>New Status</InputLabel>
          <Select
            value={selectedStatus}
            label="New Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={paymentStatus === 'pending'}
          >
            {Object.entries(CASE_STATUS_CONFIG).map(([value, config]) => {
              // Only disable pending_payment option if payment is already completed
              // Allow changing to pending_payment if payment is not completed (null, undefined, 'pending', 'failed', etc.)
              const isDisabled = value === 'pending_payment' && paymentStatus === 'completed';
              return (
                <MenuItem key={value} value={value} disabled={isDisabled}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    {isDisabled && (
                      <Typography variant="caption" color="error" sx={{ ml: 'auto' }}>
                        (Payment completed - cannot revert)
                      </Typography>
                    )}
                  </Box>
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={selectedPriority}
            label="Priority"
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="urgent">Urgent</MenuItem>
          </Select>
        </FormControl>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleStatusUpdate}
          variant="contained"
          disabled={loading || (selectedStatus === currentStatus && selectedPriority === currentPriority) || paymentStatus === 'pending'}
        >
          {loading ? <CircularProgress size={20} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

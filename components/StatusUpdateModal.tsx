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
} from '@mui/material';
import { apiFetch } from 'lib/api-client';
import { CASE_STATUS_CONFIG, getStatusConfig } from 'lib/utils';

interface StatusUpdateModalProps {
  open: boolean;
  onClose: () => void;
  caseId: number;
  currentStatus: string;
  currentPriority: string;
  caseTitle: string;
  onStatusUpdated: () => void;
}

export default function StatusUpdateModal({
  open,
  onClose,
  caseId,
  currentStatus,
  currentPriority,
  caseTitle,
  onStatusUpdated,
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">Current Status:</Typography>
            <Chip
              label={getStatusConfig(currentStatus).label}
              color={getStatusConfig(currentStatus).color}
              size="small"
            />
          </Box>
        </Box>

        <FormControl fullWidth>
          <InputLabel>New Status</InputLabel>
          <Select
            value={selectedStatus}
            label="New Status"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {Object.entries(CASE_STATUS_CONFIG).map(([value, config]) => (
              <MenuItem key={value} value={value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                </Box>
              </MenuItem>
            ))}
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
          disabled={loading || (selectedStatus === currentStatus && selectedPriority === currentPriority)}
        >
          {loading ? <CircularProgress size={20} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

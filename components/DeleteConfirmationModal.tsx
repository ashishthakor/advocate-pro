'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface DeleteConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteConfirmationModal({
  open,
  title,
  message,
  itemName,
  onConfirm,
  onCancel,
  loading = false,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="error" />
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This action cannot be undone.
        </Alert>
        <DialogContentText>
          {message}
          {itemName && (
            <Typography component="span" fontWeight="bold" sx={{ display: 'block', mt: 1 }}>
              {itemName}
            </Typography>
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

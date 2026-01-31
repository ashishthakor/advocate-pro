'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
} from '@mui/material';
import { apiFetch } from '@/lib/api-client';
import { calculateFeeWithGst } from '@/lib/fee-calculator';

interface EditCaseModalProps {
  open: boolean;
  onClose: () => void;
  caseId: number;
  caseTitle: string;
  caseDescription: string;
  disputeDate: string | null;
  disputeAmount: number | string | null;
  onUpdated: () => void;
}

export default function EditCaseModal({
  open,
  onClose,
  caseId,
  caseTitle,
  caseDescription,
  disputeDate,
  disputeAmount,
  onUpdated,
}: EditCaseModalProps) {
  const [title, setTitle] = useState(caseTitle);
  const [description, setDescription] = useState(caseDescription);
  const [dispute_date, setDisputeDate] = useState(disputeDate || '');
  const [dispute_amount, setDisputeAmount] = useState(disputeAmount != null && disputeAmount !== '' ? String(disputeAmount) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle(caseTitle);
      setDescription(caseDescription);
      setDisputeDate(disputeDate || '');
      setDisputeAmount(disputeAmount != null && disputeAmount !== '' ? String(disputeAmount) : '');
      setError('');
    }
  }, [open, caseTitle, caseDescription, disputeDate, disputeAmount]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const updateData: any = { title, description };
      updateData.dispute_date = dispute_date.trim() || null;
      const amt = parseFloat(dispute_amount);
      updateData.dispute_amount = isNaN(amt) || amt <= 0 ? null : amt;

      const res = await apiFetch(`/api/cases/${caseId}`, { method: 'PUT', json: updateData });
      if (res && (res as any).success) {
        onUpdated();
        onClose();
      } else {
        setError((res as any)?.message || 'Failed to update case');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Case</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            required
          />
          <TextField
            fullWidth
            label="Dispute Date"
            type="date"
            value={dispute_date}
            onChange={(e) => setDisputeDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Dispute Amount (₹)"
            type="number"
            value={dispute_amount}
            onChange={(e) => setDisputeAmount(e.target.value)}
            helperText="Fees (incl. 18% GST) auto-calculated on save from Fees page"
            inputProps={{ min: 0, step: 0.01 }}
          />
          {error && (
            <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>{error}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Paper,
  IconButton,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/components/LanguageProvider';
import { apiFetch } from '@/lib/api-client';

interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  is_approved: boolean;
  user_type?: string;
  company_name?: string;
  created_at: string;
  updated_at: string;
}

interface UserDetailsModalProps {
  open: boolean;
  onClose: () => void;
  userDetails: UserDetails | null;
  onUserUpdated?: (user: UserDetails) => void;
  allowEdit?: boolean;
  startInEditMode?: boolean;
}

export default function UserDetailsModal({
  open,
  onClose,
  userDetails,
  onUserUpdated,
  allowEdit = true,
  startInEditMode = false,
}: UserDetailsModalProps) {
  const { t } = useLanguage();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<UserDetails>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userDetails) {
      setFormData({
        name: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone || '',
        address: userDetails.address || '',
        user_type: userDetails.user_type || 'individual',
        company_name: userDetails.company_name || '',
        is_approved: userDetails.is_approved,
      });
      setEditMode(startInEditMode && allowEdit);
      setError('');
    }
  }, [userDetails, startInEditMode, allowEdit]);

  if (!userDetails) {
    return null;
  }

  const getRoleChip = (role: string) => {
    const colors = {
      admin: 'error',
      advocate: 'primary',
      user: 'success',
    } as const;

    return (
      <Chip
        label={role.charAt(0).toUpperCase() + role.slice(1)}
        color={colors[role as keyof typeof colors] || 'default'}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const getStatusChip = (isApproved: boolean) => {
    return (
      <Chip
        label={isApproved ? 'Approved' : 'Pending'}
        color={isApproved ? 'success' : 'warning'}
        size="small"
        variant="outlined"
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const handleSave = async () => {
    if (!userDetails?.id) return;
    setSaving(true);
    setError('');
    try {
      const payload: Record<string, unknown> = {};
      if (formData.name !== undefined) payload.name = formData.name;
      if (formData.email !== undefined) payload.email = formData.email;
      if (formData.phone !== undefined) payload.phone = formData.phone;
      if (formData.address !== undefined) payload.address = formData.address;
      if (formData.user_type !== undefined) payload.user_type = formData.user_type;
      if (formData.company_name !== undefined) payload.company_name = formData.company_name;
      if (formData.is_approved !== undefined) payload.is_approved = formData.is_approved;

      const res = await apiFetch<{ success: boolean; message?: string }>(
        `/api/users/${userDetails.id}`,
        {
          method: 'PUT',
          json: payload,
        }
      );

      if (res && (res as { success: boolean }).success) {
        setEditMode(false);
        const updatedUser = { ...userDetails, ...formData } as UserDetails;
        onUserUpdated?.(updatedUser);
        onClose();
      } else {
        setError((res as { message?: string })?.message || 'Failed to update user');
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: userDetails.name,
      email: userDetails.email,
      phone: userDetails.phone || '',
      address: userDetails.address || '',
      user_type: userDetails.user_type || 'individual',
      company_name: userDetails.company_name || '',
      is_approved: userDetails.is_approved,
    });
    setEditMode(false);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            User Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
              <PersonIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {editMode ? formData.name : userDetails.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editMode ? formData.email : userDetails.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {getRoleChip(userDetails.role)}
                {!editMode && getStatusChip(userDetails.is_approved)}
                {!editMode && userDetails.user_type && (
                  <Chip
                    label={userDetails.user_type === 'corporate' ? 'Corporate' : 'Individual'}
                    color={userDetails.user_type === 'corporate' ? 'primary' : 'default'}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* User Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Personal Information
            </Box>
            {allowEdit && !editMode && (
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                variant="outlined"
              >
                Edit
              </Button>
            )}
          </Typography>
          {editMode ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={formData.user_type || 'individual'}
                    label="Account Type"
                    onChange={(e) =>
                      setFormData({ ...formData, user_type: e.target.value as string })
                    }
                  >
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="corporate">Corporate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {(formData.user_type === 'corporate' || userDetails.user_type === 'corporate') && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={formData.company_name || ''}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
              {userDetails.role === 'advocate' && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.is_approved ? 'approved' : 'pending'}
                      label="Status"
                      onChange={(e) =>
                        setFormData({ ...formData, is_approved: e.target.value === 'approved' })
                      }
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Full Name
                </Typography>
                <Typography variant="body1">{userDetails.name}</Typography>
              </Grid>
              {userDetails.user_type === 'corporate' && userDetails.company_name && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Company Name
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon fontSize="small" />
                    {userDetails.company_name}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email Address
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon fontSize="small" />
                  {userDetails.email}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Phone Number
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon fontSize="small" />
                  {userDetails.phone || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Address
                </Typography>
                <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon fontSize="small" />
                  {userDetails.address || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Account Type
                </Typography>
                <Chip
                  label={userDetails.user_type === 'corporate' ? 'Corporate' : 'Individual'}
                  color={userDetails.user_type === 'corporate' ? 'primary' : 'default'}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Role
                </Typography>
                {getRoleChip(userDetails.role)}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                {getStatusChip(userDetails.is_approved)}
              </Grid>
            </Grid>
          )}
        </Paper>

        {/* Account Information - read only */}
        {!editMode && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon color="primary" />
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Member Since
                </Typography>
                <Typography variant="body1">
                  {new Date(userDetails.created_at).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Last Updated
                </Typography>
                <Typography variant="body1">
                  {new Date(userDetails.updated_at).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </DialogContent>

      <DialogActions>
        {editMode ? (
          <>
            <Button onClick={handleCancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

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
  Divider,
  Chip,
  Paper,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/components/LanguageProvider';

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
}

export default function UserDetailsModal({ open, onClose, userDetails }: UserDetailsModalProps) {
  const { t } = useLanguage();

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
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60 }}>
              <PersonIcon fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {userDetails.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userDetails.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                {getRoleChip(userDetails.role)}
                {getStatusChip(userDetails.is_approved)}
                {userDetails.user_type && (
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
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon color="primary" />
            Personal Information
          </Typography>
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
        </Paper>

        {/* Account Information */}
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
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

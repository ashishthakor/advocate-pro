'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility,
  VisibilityOff,
  Description as DescriptionIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useAuth } from '@/components/AuthProvider';
import { apiFetch } from '@/lib/api-client';
import { useNotification } from '@/components/NotificationProvider';

interface AdvocateProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  is_approved: boolean;
  specialization: string;
  experience_years: number;
  bar_number: string;
  license_number: string;
  aadhar_file_path?: string;
  pan_file_path?: string;
  cancelled_cheque_file_path?: string;
  created_at: string;
  updated_at: string;
}

export default function AdvocateProfilePage() {
  const { user, updateUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [profile, setProfile] = useState<AdvocateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [kycDocuments, setKycDocuments] = useState<{
    aadhar?: { filePath: string; presignedUrl: string };
    pan?: { filePath: string; presignedUrl: string };
    cancelled_cheque?: { filePath: string; presignedUrl: string };
  }>({});
  const [loadingKyc, setLoadingKyc] = useState(false);
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience_years: 0,
    bar_number: '',
    license_number: '',
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchKycDocuments();
    }
  }, [user]);

  // Fetch KYC documents
  const fetchKycDocuments = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingKyc(true);
      const response = await apiFetch(`/api/advocate/kyc/${user.id}`);
      
      if (response.success) {
        setKycDocuments(response.data || {});
      }
    } catch (err) {
      console.error('Failed to fetch KYC documents:', err);
    } finally {
      setLoadingKyc(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/users/profile');
      if (response.success) {
        const profileData = response.data;
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          specialization: profileData.specialization || '',
          experience_years: profileData.experience_years || 0,
          bar_number: profileData.bar_number || '',
          license_number: profileData.license_number || '',
        });
      } else {
        showError(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      showError('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'number' ? parseFloat(event.target.value) || 0 : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const response = await apiFetch('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (response.success) {
        showSuccess('Profile updated successfully');
        setIsEditing(false);
        await fetchProfile();
        // Update auth context
        if (updateUser && user) {
          updateUser({ ...user, ...formData, id: user.id });
        }
      } else {
        const errorMessage = response.message || 'Failed to update profile';
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Failed to update profile';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setSaving(true);

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        const errorMessage = 'New passwords do not match';
        showError(errorMessage);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        const errorMessage = 'Password must be at least 6 characters long';
        showError(errorMessage);
        return;
      }

      const response = await apiFetch('/api/users/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.success) {
        showSuccess('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorMessage = response.message || 'Failed to change password';
        showError(errorMessage);
      }
    } catch (err) {
      const errorMessage = 'Failed to change password';
      showError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        specialization: profile.specialization || '',
        experience_years: profile.experience_years || 0,
        bar_number: profile.bar_number || '',
        license_number: profile.license_number || '',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </Box>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    disabled={true}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    value={formData.specialization}
                    onChange={handleInputChange('specialization')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Experience (Years)"
                    type="number"
                    value={formData.experience_years}
                    onChange={handleInputChange('experience_years')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bar Number"
                    value={formData.bar_number}
                    onChange={handleInputChange('bar_number')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    value={formData.license_number}
                    onChange={handleInputChange('license_number')}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Avatar and Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'secondary.main',
                  fontSize: '3rem',
                }}
              >
                {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
              </Avatar>
              <Typography variant="h6" gutterBottom>
                {profile?.name || 'Advocate'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.email || 'advocate@example.com'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Role: {profile?.role || 'Advocate'}
              </Typography>
              {profile?.specialization && (
                <Chip
                  label={profile.specialization}
                  color="primary"
                  size="small"
                  sx={{ mb: 1 }}
                />
              )}
              {profile?.experience_years && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {profile.experience_years} years experience
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Advocate since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* KYC Documents */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                KYC Documents
              </Typography>
              
              {loadingKyc ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Aadhar Card */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">
                            Aadhar Card
                          </Typography>
                        </Box>
                        {kycDocuments.aadhar ? (
                          <Box>
                            <Box
                              sx={{
                                width: '100%',
                                height: 250,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                              }}
                            >
                              {kycDocuments.aadhar.filePath.toLowerCase().endsWith('.pdf') ? (
                                <Box
                                  component="iframe"
                                  src={kycDocuments.aadhar.presignedUrl}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                  }}
                                />
                              ) : (
                                <Box
                                  component="img"
                                  src={kycDocuments.aadhar.presignedUrl}
                                  alt="Aadhar Card"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              )}
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<OpenInNewIcon />}
                              href={kycDocuments.aadhar.presignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open in New Tab
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No Aadhar document uploaded
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* PAN Card */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">
                            PAN Card
                          </Typography>
                        </Box>
                        {kycDocuments.pan ? (
                          <Box>
                            <Box
                              sx={{
                                width: '100%',
                                height: 250,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                              }}
                            >
                              {kycDocuments.pan.filePath.toLowerCase().endsWith('.pdf') ? (
                                <Box
                                  component="iframe"
                                  src={kycDocuments.pan.presignedUrl}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                  }}
                                />
                              ) : (
                                <Box
                                  component="img"
                                  src={kycDocuments.pan.presignedUrl}
                                  alt="PAN Card"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              )}
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<OpenInNewIcon />}
                              href={kycDocuments.pan.presignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open in New Tab
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No PAN document uploaded
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Cancelled Cheque */}
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="h6">
                            Cancelled Cheque
                          </Typography>
                        </Box>
                        {kycDocuments.cancelled_cheque ? (
                          <Box>
                            <Box
                              sx={{
                                width: '100%',
                                height: 250,
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                              }}
                            >
                              {kycDocuments.cancelled_cheque.filePath.toLowerCase().endsWith('.pdf') ? (
                                <Box
                                  component="iframe"
                                  src={kycDocuments.cancelled_cheque.presignedUrl}
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                  }}
                                />
                              ) : (
                                <Box
                                  component="img"
                                  src={kycDocuments.cancelled_cheque.presignedUrl}
                                  alt="Cancelled Cheque"
                                  sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                  }}
                                />
                              )}
                            </Box>
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={<OpenInNewIcon />}
                              href={kycDocuments.cancelled_cheque.presignedUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Open in New Tab
                            </Button>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No Cancelled Cheque uploaded
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Change Password
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange('currentPassword')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            edge="end"
                          >
                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange('newPassword')}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange('confirmPassword')}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleChangePassword}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  {saving ? <CircularProgress size={20} /> : 'Change Password'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Lock as LockIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { useLanguage } from '@/components/LanguageProvider';

const specializations = [
  'Criminal Law',
  'Civil Law',
  'Corporate Law',
  'Family Law',
  'Real Estate Law',
  'Immigration Law',
  'Personal Injury',
  'Employment Law',
  'Tax Law',
  'Intellectual Property',
  'Environmental Law',
  'Constitutional Law',
];

export default function CreateAdvocatePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialization: '',
    experience_years: '',
    bar_number: '',
    license_number: '',
    password: '',
    confirmPassword: '',
  });
  const [kycFiles, setKycFiles] = useState({
    aadhar: null as File | null,
    pan: null as File | null,
    cancelled_cheque: null as File | null,
  });
  const [kycFilePreviews, setKycFilePreviews] = useState({
    aadhar: null as string | null,
    pan: null as string | null,
    cancelled_cheque: null as string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(kycFilePreviews).forEach((preview) => {
        if (preview) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [kycFilePreviews]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleKycFileChange = (documentType: 'aadhar' | 'pan' | 'cancelled_cheque', file: File | null) => {
    if (file) {
      // Validate file type - only images and PDF
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload PDF, JPEG, or PNG files only');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      // Create preview URL for both images and PDFs
      const previewUrl = URL.createObjectURL(file);
      setKycFilePreviews(prev => {
        // Revoke old URL if exists
        if (prev[documentType]) {
          URL.revokeObjectURL(prev[documentType]!);
        }
        return {
          ...prev,
          [documentType]: previewUrl,
        };
      });
    } else {
      // Clear preview when file is removed
      if (kycFilePreviews[documentType]) {
        URL.revokeObjectURL(kycFilePreviews[documentType]!);
      }
      setKycFilePreviews(prev => ({
        ...prev,
        [documentType]: null,
      }));
    }
    setKycFiles(prev => ({
      ...prev,
      [documentType]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('specialization', formData.specialization);
      formDataToSend.append('experience_years', formData.experience_years);
      formDataToSend.append('bar_number', formData.bar_number);
      formDataToSend.append('license_number', formData.license_number);
      formDataToSend.append('password', formData.password);

      // Append KYC files if provided (optional for admin)
      if (kycFiles.aadhar) {
        formDataToSend.append('aadhar', kycFiles.aadhar);
      }
      if (kycFiles.pan) {
        formDataToSend.append('pan', kycFiles.pan);
      }
      if (kycFiles.cancelled_cheque) {
        formDataToSend.append('cancelled_cheque', kycFiles.cancelled_cheque);
      }

      const response = await fetch('/api/admin/advocates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/advocates');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create advocate');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create advocate');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              Advocate Created Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              The advocate has been created and auto-approved. Redirecting...
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => router.back()} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Create New Advocate</Typography>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
              Personal Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                  InputProps={{
                    startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                  Professional Information
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Specialization</InputLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleSelectChange}
                    label="Specialization"
                  >
                    {specializations.map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years of Experience"
                  name="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  required
                  inputProps={{ min: 0, max: 50 }}
                  InputProps={{
                    startAdornment: <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bar Number"
                  name="bar_number"
                  value={formData.bar_number}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="License Number"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                  Account Credentials
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  helperText="Minimum 6 characters"
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                  KYC Documents (Optional)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  KYC documents are optional when creating advocate as admin. They can be uploaded later. (PDF or Image only, max 5MB each)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    border: (theme) => `2px dashed ${kycFiles.aadhar ? theme.palette.success.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: kycFiles.aadhar ? 'action.selected' : 'background.default',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input
                    type="file"
                    id="aadhar-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleKycFileChange('aadhar', e.target.files?.[0] || null)}
                  />
                  {kycFiles.aadhar ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, mb: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {kycFilePreviews.aadhar ? (
                          kycFiles.aadhar.type === 'application/pdf' ? (
                            <Box
                              component="iframe"
                              src={kycFilePreviews.aadhar}
                              sx={{
                                width: '100%',
                                height: 200,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={kycFilePreviews.aadhar}
                              alt="Aadhar preview"
                              sx={{
                                width: '100%',
                                height: '100%',
                                maxHeight: 200,
                                objectFit: 'contain',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          )
                        ) : null}
                      </Box>
                      <CheckCircleIcon sx={{ color: 'success.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Aadhar Card
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, wordBreak: 'break-word' }}>
                        {kycFiles.aadhar.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKycFileChange('aadhar', null);
                          const input = document.getElementById('aadhar-upload') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        startIcon={<CloseIcon />}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Box 
                      onClick={() => document.getElementById('aadhar-upload')?.click()}
                      sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
                    >
                      <CloudUploadIcon sx={{ color: 'action.active', mb: 1, fontSize: 48 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Aadhar Card
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to upload
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    border: (theme) => `2px dashed ${kycFiles.pan ? theme.palette.success.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: kycFiles.pan ? 'action.selected' : 'background.default',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input
                    type="file"
                    id="pan-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleKycFileChange('pan', e.target.files?.[0] || null)}
                  />
                  {kycFiles.pan ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, mb: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {kycFilePreviews.pan ? (
                          kycFiles.pan.type === 'application/pdf' ? (
                            <Box
                              component="iframe"
                              src={kycFilePreviews.pan}
                              sx={{
                                width: '100%',
                                height: 200,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={kycFilePreviews.pan}
                              alt="PAN preview"
                              sx={{
                                width: '100%',
                                height: '100%',
                                maxHeight: 200,
                                objectFit: 'contain',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          )
                        ) : null}
                      </Box>
                      <CheckCircleIcon sx={{ color: 'success.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        PAN Card
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, wordBreak: 'break-word' }}>
                        {kycFiles.pan.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKycFileChange('pan', null);
                          const input = document.getElementById('pan-upload') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        startIcon={<CloseIcon />}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Box 
                      onClick={() => document.getElementById('pan-upload')?.click()}
                      sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
                    >
                      <CloudUploadIcon sx={{ color: 'action.active', mb: 1, fontSize: 48 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        PAN Card
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to upload
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box
                  sx={{
                    border: (theme) => `2px dashed ${kycFiles.cancelled_cheque ? theme.palette.success.main : theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    bgcolor: kycFiles.cancelled_cheque ? 'action.selected' : 'background.default',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    position: 'relative',
                    minHeight: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input
                    type="file"
                    id="cheque-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={(e) => handleKycFileChange('cancelled_cheque', e.target.files?.[0] || null)}
                  />
                  {kycFiles.cancelled_cheque ? (
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, mb: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {kycFilePreviews.cancelled_cheque ? (
                          kycFiles.cancelled_cheque.type === 'application/pdf' ? (
                            <Box
                              component="iframe"
                              src={kycFilePreviews.cancelled_cheque}
                              sx={{
                                width: '100%',
                                height: 200,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Box
                              component="img"
                              src={kycFilePreviews.cancelled_cheque}
                              alt="Cancelled Cheque preview"
                              sx={{
                                width: '100%',
                                height: '100%',
                                maxHeight: 200,
                                objectFit: 'contain',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          )
                        ) : null}
                      </Box>
                      <CheckCircleIcon sx={{ color: 'success.main', mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Cancelled Cheque
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, wordBreak: 'break-word' }}>
                        {kycFiles.cancelled_cheque.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleKycFileChange('cancelled_cheque', null);
                          const input = document.getElementById('cheque-upload') as HTMLInputElement;
                          if (input) input.value = '';
                        }}
                        startIcon={<CloseIcon />}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Box 
                      onClick={() => document.getElementById('cheque-upload')?.click()}
                      sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}
                    >
                      <CloudUploadIcon sx={{ color: 'action.active', mb: 1, fontSize: 48 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Cancelled Cheque
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Click to upload
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating...' : 'Create Advocate'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}


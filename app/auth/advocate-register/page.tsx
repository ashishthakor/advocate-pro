'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Link,
  Container,
  Paper,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import { useNotification } from '@/components/NotificationProvider';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Lock as LockIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AdvocateRegisterPage() {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { showSuccess, showError } = useNotification();
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
  const router = useRouter();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Handle KYC file selection
  const handleKycFileChange = (documentType: 'aadhar' | 'pan' | 'cancelled_cheque', file: File | null) => {
    if (file) {
      // Validate file type - only images and PDF
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        showError('Please upload PDF, JPEG, or PNG files only');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB');
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

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      const errorMessage = t('auth.passwordsDoNotMatch');
      showError(errorMessage);
      setLoading(false);
      return;
    }

    // Validate KYC files
    if (!kycFiles.aadhar || !kycFiles.pan || !kycFiles.cancelled_cheque) {
      const missing = [];
      if (!kycFiles.aadhar) missing.push('Aadhar');
      if (!kycFiles.pan) missing.push('PAN');
      if (!kycFiles.cancelled_cheque) missing.push('Cancelled Cheque');
      showError(`Please upload all KYC documents: ${missing.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // Create FormData with all form fields and files
      const registrationFormData = new FormData();
      
      // Add form fields
      registrationFormData.append('name', formData.name);
      registrationFormData.append('email', formData.email);
      registrationFormData.append('password', formData.password);
      registrationFormData.append('phone', formData.phone);
      registrationFormData.append('address', formData.address);
      registrationFormData.append('specialization', formData.specialization);
      registrationFormData.append('experience_years', formData.experience_years);
      registrationFormData.append('bar_number', formData.bar_number);
      registrationFormData.append('license_number', formData.license_number);
      registrationFormData.append('role', 'advocate');
      
      // Add KYC files
      registrationFormData.append('aadhar', kycFiles.aadhar);
      registrationFormData.append('pan', kycFiles.pan);
      registrationFormData.append('cancelled_cheque', kycFiles.cancelled_cheque);

      // Single API call to register with files
      const response = await fetch('/api/auth/advocate-register', {
        method: 'POST',
        body: registrationFormData,
      });

      const data = await response.json();

      if (data.success) {
        const successMessage = data.message || t('auth.registrationSuccessPending');
        showSuccess(successMessage);
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/advocate-login');
        }, 2000);
      } else {
        const errorMessage = data.message || t('auth.registrationFailed');
        showError(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err?.message || t('auth.errorOccurred');
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          py: 4,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={theme.palette.mode === 'dark' ? 8 : 12}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Alert severity="success" sx={{ mb: 3 }}>
              {t('auth.registrationSuccessPending')}
            </Alert>
            <CircularProgress />
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(1000px 400px at 10% -10%, rgba(0, 150, 136, 0.12), transparent), radial-gradient(800px 400px at 110% 10%, rgba(0, 121, 107, 0.10), transparent)'
            : 'radial-gradient(1000px 400px at 10% -10%, rgba(0, 150, 136, 0.08), transparent), radial-gradient(800px 400px at 110% 10%, rgba(0, 121, 107, 0.06), transparent)',
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <LanguageSelector />
          <Button onClick={toggleDarkMode} startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />} color="inherit" sx={{ textTransform: 'none' }}>
            {darkMode ? t('common.switchToLightMode') : t('common.switchToDarkMode')}
          </Button>
        </Box>
        <Paper
          elevation={theme.palette.mode === 'dark' ? 8 : 12}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            transition: 'transform 200ms ease, box-shadow 200ms ease, background-color 200ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 12px 30px rgba(0,0,0,0.5)' : '0 12px 30px rgba(0,0,0,0.12)'),
            },
          }}
        >
          <Box
            sx={{
              bgcolor: 'background.paper',
              color: 'text.primary',
              p: { xs: 2, sm: 3 },
              textAlign: 'center',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <WorkIcon color="secondary" sx={{ fontSize: { xs: 40, sm: 48 }, mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}>
              {t('auth.advocateRegistration')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {t('auth.registerAdvocate')}
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <form onSubmit={handleSubmit}>

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600, mt: 1 }}>
                    {t('auth.personalInformation')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.name')}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.phone')}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    autoComplete="tel"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.address')}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600, mt: 2 }}>
                    {t('auth.professionalInformation')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>{t('auth.specialization')}</InputLabel>
                    <Select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleSelectChange}
                      label={t('auth.specialization')}
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
                    label={t('auth.yearsOfExperience')}
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
                    label={t('auth.barNumber')}
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
                    label={t('auth.licenseNumber')}
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
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600, mt: 2 }}>
                    KYC Documents (Required)
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Please upload all three documents: Aadhar, PAN, and Cancelled Cheque (PDF or Image only, max 5MB each)
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
                        borderColor: 'secondary.main',
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
                          Aadhar Card *
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
                        borderColor: 'secondary.main',
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
                          PAN Card *
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
                        borderColor: 'secondary.main',
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
                          Cancelled Cheque *
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Click to upload
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main', fontWeight: 600, mt: 2 }}>
                    {t('auth.accountSecurity')}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.password')}
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('auth.confirmPassword')}
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mt: 3,
                  mb: 2,
                  boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 6px 16px rgba(255, 152, 0, 0.35)' : '0 6px 16px rgba(255, 152, 0, 0.35)'),
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={24} color="inherit" />
                    <Typography>Registering...</Typography>
                  </Box>
                ) : (
                  t('auth.registerAsAdvocate')
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('auth.haveAccount')}
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Link
                  href="/auth/advocate-login"
                  underline="hover"
                  sx={{ fontWeight: 500, color: 'secondary.main' }}
                >
                  {t('auth.signInHere')}
                </Link>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Button
                  component={Link}
                  href="/"
                  startIcon={<ArrowBackIcon />}
                  color="inherit"
                  sx={{ textTransform: 'none' }}
                >
                  {t('auth.backToHome')}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}

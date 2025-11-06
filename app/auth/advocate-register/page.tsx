'use client';

import React, { useState } from 'react';
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
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Lock as LockIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function AdvocateRegisterPage() {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useAppTheme();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/advocate-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'advocate',
          experience_years: parseInt(formData.experience_years),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/auth/advocate-login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
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
              Registration successful! Your account is pending approval. Redirecting to login...
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
            ? 'radial-gradient(1000px 400px at 10% -10%, rgba(156, 39, 176, 0.15), transparent), radial-gradient(800px 400px at 110% 10%, rgba(103, 80, 164, 0.12), transparent)'
            : 'radial-gradient(1000px 400px at 10% -10%, rgba(156, 39, 176, 0.08), transparent), radial-gradient(800px 400px at 110% 10%, rgba(103, 80, 164, 0.06), transparent)',
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <LanguageSelector />
          <Button onClick={toggleDarkMode} startIcon={darkMode ? <LightModeIcon /> : <DarkModeIcon />} color="inherit" sx={{ textTransform: 'none' }}>
            {darkMode ? 'Light' : 'Dark'} mode
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
              Advocate Registration
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Register as an advocate to provide legal services
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 1 }}>
                    Personal Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
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
                    label="Email Address"
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
                    label="Phone Number"
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
                    label="Address"
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
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
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
                  <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600, mt: 2 }}>
                    Account Security
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
                    autoComplete="new-password"
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
                  boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.45)' : '0 6px 16px rgba(156,39,176,0.24)'),
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Register as Advocate'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Link
                  href="/auth/advocate-login"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Sign In Here
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
                  Back to Home
                </Button>
              </Box>
            </form>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
}

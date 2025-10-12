'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Link,
  Container,
  Paper,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

export default function UserLoginPage() {
  const theme = useTheme();
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: 'user',
        }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.user, data.token);
        router.push('/user/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

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
            ? 'radial-gradient(1000px 400px at 10% -10%, rgba(103, 80, 164, 0.15), transparent), radial-gradient(800px 400px at 110% 10%, rgba(25, 118, 210, 0.12), transparent)'
            : 'radial-gradient(1000px 400px at 10% -10%, rgba(103, 80, 164, 0.08), transparent), radial-gradient(800px 400px at 110% 10%, rgba(25, 118, 210, 0.06), transparent)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
              p: 3,
              textAlign: 'center',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <PersonIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              User Login
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sign in to your user account
            </Typography>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>

              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="email"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                margin="normal"
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  mb: 2,
                  boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.45)' : '0 6px 16px rgba(25,118,210,0.24)'),
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In as User'}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Link
                  href="/auth/user-register"
                  underline="hover"
                  sx={{ fontWeight: 500 }}
                >
                  Create Account
                </Link>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  href="/auth/advocate-login"
                  variant="outlined"
                  size="small"
                  color="secondary"
                >
                  Advocate Login
                </Button>
                <Button
                  component={Link}
                  href="/auth/admin-login"
                  variant="outlined"
                  size="small"
                  color="error"
                >
                  Admin Login
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3 }}>
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

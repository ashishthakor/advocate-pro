"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Stack,
  Divider,
  alpha,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Chat as ChatIcon,
  CloudUpload as CloudUploadIcon,
  Assessment as AssessmentIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();

  const features = [
    {
      icon: <GavelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.caseManagement'),
      description: t('features.caseManagementDesc'),
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.roleBased'),
      description: t('features.roleBasedDesc'),
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.realtimeChat'),
      description: t('features.realtimeChatDesc'),
    },
    {
      icon: <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.documentManagement'),
      description: t('features.documentManagementDesc'),
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.secure'),
      description: t('features.secureDesc'),
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('features.analytics'),
      description: t('features.analyticsDesc'),
    },
  ];

  const userTypes = [
    {
      title: t('userTypes.forUsers'),
      description: t('userTypes.forUsersDesc'),
      features: ['Create new cases', 'Track case status', 'Chat with advocates', 'Upload documents'],
      buttonText: 'Get Started',
      buttonLink: '/auth/user-login',
      color: 'primary',
    },
    {
      title: t('userTypes.forAdvocates'),
      description: t('userTypes.forAdvocatesDesc'),
      features: ['View assigned cases', 'Update case status', 'Communicate with clients', 'Manage documents'],
      buttonText: 'Join as Advocate',
      buttonLink: '/auth/advocate-login',
      color: 'secondary',
    },
    {
      title: t('userTypes.forAdmins'),
      description: t('userTypes.forAdminsDesc'),
      features: ['Manage all users', 'Assign cases', 'System analytics', 'User approvals'],
      buttonText: 'Admin Access',
      buttonLink: '/auth/admin-login',
      color: 'error',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Users' },
    { number: '50,000+', label: 'Cases Managed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 40, height: 40 }}>
                <GavelIcon />
              </Avatar>
            </motion.div>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              ARBITALK
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LanguageSelector />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton onClick={toggleDarkMode} color="inherit">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </motion.div>
            <Button color="primary" component={Link} href="/auth/user-login">
              {t('nav.userLogin')}
            </Button>
            <Button color="secondary" component={Link} href="/auth/advocate-login">
              {t('nav.advocateLogin')}
            </Button>
            <Button color="error" component={Link} href="/auth/admin-login">
              {t('nav.adminLogin')}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
          color: 'text.primary',
          py: { xs: 12, md: 16 },
          backgroundImage: (t) =>
            t.palette.mode === 'dark'
              ? 'radial-gradient(1400px 600px at -15% -25%, rgba(103, 80, 164, 0.2), transparent), radial-gradient(1200px 600px at 115% 15%, rgba(25, 118, 210, 0.15), transparent), radial-gradient(800px 400px at 50% 100%, rgba(156, 39, 176, 0.1), transparent)'
              : 'radial-gradient(1400px 600px at -15% -25%, rgba(103, 80, 164, 0.12), transparent), radial-gradient(1200px 600px at 115% 15%, rgba(25, 118, 210, 0.08), transparent), radial-gradient(800px 400px at 50% 100%, rgba(156, 39, 176, 0.06), transparent)',
          transition: 'background-color 200ms ease',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div 
                initial={{ opacity: 0, y: 32 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, ease: "easeOut" }} 
                viewport={{ once: true }}
              >
                <Typography
                  variant={isMobile ? 'h3' : 'h1'}
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1 }}
                >
                  {t('hero.title')}
                </Typography>
                <Typography
                  variant={isMobile ? 'h6' : 'h5'}
                  sx={{ mb: 4, opacity: 0.8, fontWeight: 400, maxWidth: '90%' }}
                >
                  {t('hero.subtitle')}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      href="/auth/user-register"
                      startIcon={<PersonAddIcon />}
                      sx={{ 
                        py: 1.5, 
                        px: 4, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(25,118,210,0.3)',
                      }}
                    >
                      {t('hero.getStarted')}
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      href="/auth/advocate-register"
                      startIcon={<ArrowForwardIcon />}
                      sx={{ 
                        py: 1.5, 
                        px: 4, 
                        fontSize: '1.1rem',
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      {t('hero.joinAdvocate')}
                    </Button>
                  </motion.div>
                </Stack>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <Chip label="✓ AI-Powered" color="success" size="small" />
                    <Chip label="✓ Multi-Language" color="info" size="small" />
                    <Chip label="✓ Arbitration Focus" color="warning" size="small" />
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', position: 'relative' }}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, rotate: -5 }} 
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }} 
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} 
                  viewport={{ once: true }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      p: 4,
                      borderRadius: 4,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <GavelIcon sx={{ fontSize: 200, color: 'primary.main', opacity: 0.8 }} />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.8, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          right: -10,
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'secondary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <SecurityIcon sx={{ color: 'white', fontSize: 30 }} />
                      </Box>
                    </motion.div>
                  </Box>
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {stat.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
            {t('features.title')}
          </Typography>
        </motion.div>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div 
                initial={{ opacity: 0, y: 24 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.05 }} 
                viewport={{ once: true }}
              >
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* User Types Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
              {t('userTypes.title')}
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {userTypes.map((userType, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div 
                  initial={{ opacity: 0, y: 24 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: index * 0.06 }} 
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h5" component="h3" gutterBottom>
                        {userType.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {userType.description}
                      </Typography>
                      <List dense>
                        {userType.features.map((feature, featureIndex) => (
                          <ListItem key={featureIndex} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              <CheckCircleIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    <CardContent sx={{ pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color={userType.color as any}
                        component={Link}
                        href={userType.buttonLink}
                        startIcon={<LoginIcon />}
                      >
                        {userType.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div 
            initial={{ opacity: 0, y: 16 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }}
          >
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              {t('cta.title')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
              {t('cta.subtitle')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/auth/user-register"
                startIcon={<PersonAddIcon />}
              >
                {t('cta.startTrial')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/advocate-register"
                startIcon={<ArrowForwardIcon />}
              >
                {t('cta.becomeAdvocate')}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', py: 4, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <GavelIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                  ARBITALK
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {t('footer.description')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                {t('footer.quickLinks')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" component={Link} href="/auth/user-login">
                  {t('nav.userLogin')}
                </Button>
                <Button color="inherit" component={Link} href="/auth/advocate-login">
                  {t('nav.advocateLogin')}
                </Button>
                <Button color="inherit" component={Link} href="/auth/admin-login">
                  {t('nav.adminLogin')}
                </Button>
                <Button color="inherit" component={Link} href="/about">{t('nav.about')}</Button>
                <Button color="inherit" component={Link} href="/contact">{t('nav.contact')}</Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 4, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('footer.copyright')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
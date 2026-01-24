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
  Drawer,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
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
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/AuthProvider';
import { Logout as LogoutIcon } from '@mui/icons-material';
import "@/app/globals.css";
import constitutionalMandateImage from '@/assets/images/constitutional-mandate-adr.png';
import peaceQuoteImage from '@/assets/images/krishna-peace-quote.png';

// Get image source string
const constitutionalMandateImageSrc = typeof constitutionalMandateImage === 'string' 
  ? constitutionalMandateImage 
  : (constitutionalMandateImage as any).src || constitutionalMandateImage;

const peaceQuoteImageSrc = typeof peaceQuoteImage === 'string' 
  ? peaceQuoteImage 
  : (peaceQuoteImage as any).src || peaceQuoteImage;

// Landing page FAQ keys (from official FAQ doc); translations in languages/en, hi, gu, mr
const LANDING_FAQ: { q: string; a: string }[] = [
  { q: 'faq.l1.q', a: 'faq.l1.a' }, { q: 'faq.l2.q', a: 'faq.l2.a' }, { q: 'faq.l3.q', a: 'faq.l3.a' },
  { q: 'faq.l4.q', a: 'faq.l4.a' }, { q: 'faq.l5.q', a: 'faq.l5.a' }, { q: 'faq.l6.q', a: 'faq.l6.a' },
  { q: 'faq.l7.q', a: 'faq.l7.a' }, { q: 'faq.l8.q', a: 'faq.l8.a' }, { q: 'faq.l9.q', a: 'faq.l9.a' },
  { q: 'faq.l10.q', a: 'faq.l10.a' }, { q: 'faq.l11.q', a: 'faq.l11.a' }, { q: 'faq.l12.q', a: 'faq.l12.a' },
  { q: 'faq.l13.q', a: 'faq.l13.a' }, { q: 'faq.l14.q', a: 'faq.l14.a' }, { q: 'faq.l15.q', a: 'faq.l15.a' },
  { q: 'faq.l16.q', a: 'faq.l16.a' }, { q: 'faq.l17.q', a: 'faq.l17.a' }, { q: 'faq.l18.q', a: 'faq.l18.a' },
  { q: 'faq.l19.q', a: 'faq.l19.a' },
];

export default function LandingPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const problems = [
    {
      title: t('home.problem1'),
      description: t('home.problem1Desc'),
    },
    {
      title: t('home.problem2'),
      description: t('home.problem2Desc'),
    },
    {
      title: t('home.problem3'),
      description: t('home.problem3Desc'),
    },
    {
      title: t('home.problem4'),
      description: t('home.problem4Desc'),
    },
  ];

  const advantages = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('home.fastTrack'),
      description: t('home.fastTrackDesc'),
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('home.expertPanel'),
      description: t('home.expertPanelDesc'),
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('home.aiWorkflow'),
      description: t('home.aiWorkflowDesc'),
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('home.transparentPricing'),
      description: t('home.transparentPricingDesc'),
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: t('home.relationshipFocused'),
      description: t('home.relationshipFocusedDesc'),
    },
  ];

  const businessTypes = [
    t('home.businessType1'),
    t('home.businessType2'),
    t('home.businessType3'),
    t('home.businessType4'),
  ];

  const valueMatrix = [
    { need: t('home.need1'), deliver: t('home.deliver1') },
    { need: t('home.need2'), deliver: t('home.deliver2') },
    { need: t('home.need3'), deliver: t('home.deliver3') },
    { need: t('home.need4'), deliver: t('home.deliver4') },
  ];

  const userTypes = [
    {
      title: t('home.forClients'),
      description: t('home.forClientsDesc'),
      features: [t('home.clientFeatures1'), t('home.clientFeatures2'), t('home.clientFeatures3'), t('home.clientFeatures4'), t('home.clientFeatures5')],
      buttonText: t('home.getStarted'),
      buttonLink: '/auth/user-login',
      color: 'primary',
    },
    {
      title: t('home.forAdvocates'),
      description: t('home.forAdvocatesDesc'),
      features: [t('home.advocateFeatures1'), t('home.advocateFeatures2'), t('home.advocateFeatures3'), t('home.advocateFeatures4'), t('home.advocateFeatures5')],
      buttonText: t('common.joinAsAdvocate'),
      buttonLink: '/auth/advocate-login',
      color: 'secondary',
    },
  ];

  const stats = [
    { number: '3.8+ Cr', label: t('home.stat1') },
    { number: '70+%', label: t('home.stat2') },
    { number: '32+', label: t('home.stat3') },
    { number: '30+', label: t('home.stat4') },
    { number: '8+ Years', label: t('home.stat5') },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Logo width={isMobile ? 120 : 140} height={isMobile ? 30 : 35} />
            </motion.div>
          </Box>
          
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button color="inherit" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>{t('common.services')}</Button>
            <Button color="inherit" component={Link} href="/about" sx={{ fontSize: '0.9rem' }}>{t('nav.about')}</Button>
            <Button color="inherit" component={Link} href="/contact" sx={{ fontSize: '0.9rem' }}>{t('nav.contact')}</Button>
            <Button color="inherit" component={Link} href="/faq" sx={{ fontSize: '0.9rem' }}>{t('nav.faq')}</Button>
            <LanguageSelector />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconButton onClick={toggleDarkMode} color="inherit" size="small">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </motion.div>
            {isAuthenticated ? (
              <>
                <Button 
                  color="primary" 
                  component={Link} 
                  href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'}
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  {t('common.dashboard')}
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'}
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  {t('common.myProfile')}
                </Button>
                <Button 
                  color="secondary" 
                  onClick={logout}
                  startIcon={<LogoutIcon />}
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  {t('common.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="primary" 
                  component={Link} 
                  href="/auth/user-login"
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  {t('common.joinAsClient')}
                </Button>
                <Button 
                  color="secondary" 
                  component={Link} 
                  href="/auth/advocate-login"
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  {t('common.joinAsAdvocate')}
                </Button>
              </>
            )}
          </Box>

          {/* Mobile Menu Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, alignItems: 'center' }}>
            <LanguageSelector />
            <IconButton onClick={toggleDarkMode} color="inherit" size="small">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo width={120} height={30} />
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary={t('nav.home')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/services" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary={t('common.services')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/about" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary={t('nav.about')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary={t('nav.contact')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/faq" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary={t('nav.faq')} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          {isAuthenticated ? (
            <>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                component={Link}
                href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                sx={{ mb: 2 }}
              >
                {t('common.dashboard')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                component={Link}
                href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'}
                onClick={() => setMobileMenuOpen(false)}
                sx={{ mb: 2 }}
              >
                {t('common.myProfile')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                {t('common.logout')}
              </Button>
            </>
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                component={Link}
                href="/auth/user-login"
                onClick={() => setMobileMenuOpen(false)}
                sx={{ mb: 2 }}
              >
                {t('common.joinAsClient')}
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                component={Link}
                href="/auth/advocate-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('common.joinAsAdvocate')}
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
          color: 'text.primary',
          py: { xs: 10, md: 16 },
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
                  variant={isMobile ? 'h4' : 'h1'}
                  component="h1"
                  gutterBottom
                  sx={{ fontWeight: 800, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3.5rem' }, lineHeight: 1.1, mb: 3 }}
                >
                  {t('hero.title')}
                </Typography>
                <Typography
                  variant={isMobile ? 'body1' : 'h5'}
                  sx={{ mb: 4, opacity: 0.8, fontWeight: 400, maxWidth: { xs: '100%', md: '90%' }, lineHeight: 1.6, fontSize: { xs: '0.95rem', md: '1.25rem' } }}
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
                      size={isMobile ? 'medium' : 'large'}
                      component={Link}
                      href="/auth/user-register"
                      startIcon={<ArrowForwardIcon />}
                      fullWidth={isMobile}
                      sx={{ 
                        py: { xs: 1.25, md: 1.5 }, 
                        px: { xs: 3, md: 4 }, 
                        fontSize: { xs: '0.95rem', md: '1.1rem' },
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
                      size={isMobile ? 'medium' : 'large'}
                      component={Link}
                      href="/contact"
                      startIcon={<PersonAddIcon />}
                      fullWidth={isMobile}
                      sx={{ 
                        py: { xs: 1.25, md: 1.5 }, 
                        px: { xs: 3, md: 4 }, 
                        fontSize: { xs: '0.95rem', md: '1.1rem' },
                        borderRadius: 2,
                        borderWidth: 2,
                        '&:hover': { borderWidth: 2 },
                      }}
                    >
                      {t('about.bookConsultation')}
                    </Button>
                  </motion.div>
                </Stack>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                    <Chip label="✓ AI-Powered" color="success" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                    <Chip label="✓ Multi-Language" color="info" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                    <Chip label="✓ Secure & Compliant" color="warning" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                    <Chip label="✓ 24/7 Support" color="primary" size="small" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }} />
                  </Box>
                </motion.div>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  position: 'relative',
                  perspective: '1200px',
                  perspectiveOrigin: 'center center',
                }}
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ 
                    opacity: 1, 
                    scale: 1,
                    transition: { duration: 1, delay: 0.3, ease: "easeOut" }
                  }} 
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -12, 0],
                    rotateY: [0, 5, -5, 0],
                    rotateX: [0, 2, -2, 0],
                    scale: [1, 1.015, 1],
                  }}
                  transition={{
                    scale: { 
                      duration: 3.5,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                      delay: 0.5,
                    },
                    y: {
                      duration: 4,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                      delay: 0.4,
                    },
                    rotateY: {
                      duration: 6,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                      delay: 0.5,
                    },
                    rotateX: {
                      duration: 5,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.6, 1],
                      delay: 0.6,
                    },
                  }}
                  // whileHover={{ 
                  //   scale: 1.03,
                  //   rotateY: 6,
                  //   rotateX: 3,
                  //   y: -6,
                  //   transition: {
                  //     duration: 0.5,
                  //     ease: "easeOut",
                  //     type: "tween"
                  //   }
                  // }}
                  style={{
                    transformStyle: 'preserve-3d',
                    willChange: 'transform',
                  }}
                >
                  <Box
                    component="img"
                    src={peaceQuoteImageSrc}
                    alt="Peace is not a proposal, on which there is debate. Peace is a necessity. - Krishna"
                    sx={{
                      width: '100%',
                      maxWidth: { xs: '100%', sm: '400px', md: '450px' },
                      height: 'auto',
                      display: 'block',
                      mx: 'auto',
                      borderRadius: 2,
                      transform: 'translateZ(25px)',
                      boxShadow: (theme) => theme.palette.mode === 'dark' 
                        ? '0 20px 60px rgba(0,0,0,0.6), 0 0 50px rgba(103, 80, 164, 0.35), 0 0 80px rgba(156, 39, 176, 0.2)' 
                        : '0 20px 60px rgba(0,0,0,0.25), 0 0 50px rgba(25, 118, 210, 0.25), 0 0 80px rgba(156, 39, 176, 0.15)',
                      filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))',
                      position: 'relative',
                      willChange: 'transform, filter',
                      backfaceVisibility: 'hidden',
                      WebkitFontSmoothing: 'antialiased',
                      WebkitBackfaceVisibility: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-20px',
                        left: '-20px',
                        right: '-20px',
                        bottom: '-20px',
                        background: (theme) => `radial-gradient(circle at 50% 50%, ${alpha(theme.palette.primary.main, 0.25)}, ${alpha(theme.palette.secondary.main, 0.2)}, transparent 70%)`,
                        borderRadius: 2,
                        zIndex: -1,
                        opacity: 0.7,
                        transform: 'translateZ(-10px)',
                        animation: 'pulseGlow 4s ease-in-out infinite',
                      },
                    }}
                  />
                </motion.div>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index} sx={{ display: 'flex' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{ width: '100%', display: 'flex' }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      minHeight: '100%',
                    }}
                  >
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
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

      {/* Problem Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant={isMobile ? 'h4' : 'h3'} component="h2" textAlign="center" gutterBottom sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}>
              {t('home.problemsTitle')}
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'} textAlign="center" sx={{ mb: 4, opacity: 0.8, fontStyle: 'italic', fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
              Justice delayed is growth denied.
            </Typography>
          </motion.div>
          
          {/* Niti Aayog Statistic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                mb: 6,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                border: (theme) => `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                borderRadius: 2,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Box
                  sx={{
                    minWidth: 4,
                    height: '100%',
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    mt: 0.5,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant={isMobile ? 'body1' : 'h6'}
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.8,
                      color: 'text.primary',
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      mb: 1,
                    }}
                  >
                    {t('home.nitiAayogStatistic')}
                  </Typography>
                  {/* <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontStyle: 'normal',
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      display: 'block',
                      textAlign: 'right',
                      mt: 1,
                    }}
                  >
                    — Niti Aayog
                  </Typography> */}
                </Box>
              </Box>
            </Paper>
          </motion.div>

          <Grid container spacing={3}>
            {problems.map((problem, index) => (
              <Grid item xs={12} sm={6} md={6} lg={6} key={index}>
                <motion.div 
                  initial={{ opacity: 0, y: 24 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: index * 0.1 }} 
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card sx={{ height: '100%', p: 3, bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {problem.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {problem.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Solution Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
            The Arbitalk Solution — Fast, Neutral, Digital
          </Typography>
          <Typography variant="h5" textAlign="center" sx={{ mb: 2, fontWeight: 'medium' }}>
            We simplify dispute resolution for modern businesses.
          </Typography>
          <Typography variant="h6" textAlign="center" sx={{ mb: 6, opacity: 0.8, maxWidth: '900px', mx: 'auto' }}>
            {t('hero.subtitle')}
          </Typography>
        </motion.div>
      </Container>

      {/* Advantages Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
              {t('home.advantagesTitle')}
            </Typography>
          </motion.div>
          <Grid container spacing={4}>
            {advantages.map((advantage, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div 
                  initial={{ opacity: 0, y: 24 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.5, delay: index * 0.1 }} 
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        {advantage.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {advantage.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {advantage.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Built for Businesses Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
            {t('home.businessTypes')}
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            {businessTypes.map((type, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  transition={{ duration: 0.4, delay: index * 0.1 }} 
                  viewport={{ once: true }}
                >
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {type}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
          <Typography variant="h6" textAlign="center" sx={{ mt: 4, fontStyle: 'italic', opacity: 0.8 }}>
            If you have a contract, you deserve a fair way to resolve it.
          </Typography>
        </motion.div>
      </Container>

      {/* Value Matrix Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
              {t('home.valueMatrix')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    Core Need
                  </Typography>
                  <Stack spacing={2}>
                    {valueMatrix.map((item, index) => (
                      <Typography key={index} variant="body1" sx={{ fontWeight: 'medium' }}>
                        {item.need}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    Arbitalk Delivers
                  </Typography>
                  <Stack spacing={2}>
                    {valueMatrix.map((item, index) => (
                      <Typography key={index} variant="body1" sx={{ fontWeight: 'medium' }}>
                        {item.deliver}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Constitutional and Legislative Mandate Section */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              textAlign="center" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              {t('home.legalMandate.title')}
            </Typography>
            <Typography 
              variant="h6" 
              textAlign="center" 
              sx={{ 
                mb: 6, 
                opacity: 0.8,
                fontSize: { xs: '1rem', md: '1.25rem' },
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              {t('home.legalMandate.subtitle')}
            </Typography>

            {/* Image Section */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Box
                component="img"
                src={constitutionalMandateImageSrc}
                alt={t('home.legalMandate.imageAlt')}
                sx={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: (theme) => theme.palette.mode === 'dark' 
                    ? '0 8px 32px rgba(0,0,0,0.4)' 
                    : '0 8px 32px rgba(0,0,0,0.1)',
                  mb: 4,
                }}
              />
            </Box>

            {/* Legal Provisions Grid */}
            <Grid container spacing={3}>
              {[
                {
                  key: 'article14',
                  color: 'warning',
                },
                {
                  key: 'companiesAct',
                  color: 'info',
                },
                {
                  key: 'commercialCourts',
                  color: 'warning',
                },
                {
                  key: 'arbitrationAct',
                  color: 'primary',
                },
                {
                  key: 'civilProcedure',
                  color: 'primary',
                },
                {
                  key: 'realEstateAct',
                  color: 'warning',
                },
                {
                  key: 'legalServices',
                  color: 'info',
                },
                {
                  key: 'industriesDisputes',
                  color: 'warning',
                },
              ].map((provision, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Paper
                      sx={{
                        p: 3,
                        height: '100%',
                        minHeight: { xs: 140, sm: 160, md: 180 },
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        border: (theme) => `2px solid ${alpha(theme.palette[provision.color as 'primary' | 'warning' | 'info'].main, 0.3)}`,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.palette.mode === 'dark' 
                            ? '0 12px 40px rgba(0,0,0,0.5)' 
                            : '0 12px 40px rgba(0,0,0,0.15)',
                          borderColor: (theme) => theme.palette[provision.color as 'primary' | 'warning' | 'info'].main,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                        <Chip
                          label={index + 1}
                          color={provision.color as 'primary' | 'warning' | 'info'}
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 40,
                            height: 40,
                            fontSize: '1rem',
                            flexShrink: 0,
                          }}
                        />
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 600,
                              mb: 1,
                              color: 'text.primary',
                              lineHeight: 1.5,
                            }}
                          >
                            {t(`home.legalMandate.${provision.key}.title`)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.6,
                              fontSize: { xs: '0.875rem', md: '0.9375rem' },
                              flex: 1,
                            }}
                          >
                            {t(`home.legalMandate.${provision.key}.description`)}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Frequently Asked Questions (exact text from official FAQ document) */}
      <Box sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('faq.landing.title')}
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
              {t('faq.landing.subtitle')}
            </Typography>
            <Paper elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
              {LANDING_FAQ.map((item, idx) => (
                <Accordion
                  key={idx}
                  disableGutters
                  elevation={0}
                  sx={{ '&:before': { display: 'none' }, borderBottom: idx < LANDING_FAQ.length - 1 ? (t) => `1px solid ${t.palette.divider}` : 'none' }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2, py: 1.5 }}>
                    <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t(item.q)}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      {t(item.a)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button component={Link} href="/faq" variant="outlined" sx={{ borderRadius: 2 }}>
                {t('faq.viewAll')}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              {t('about.readyToResolve')}
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.8 }}>
              {t('about.readySubtitle')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/contact"
                startIcon={<PersonAddIcon />}
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
              >
                {t('about.bookConsultation')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/user-register"
                startIcon={<ArrowForwardIcon />}
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                {t('about.startCase')}
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Closing Message / Vision Tagline */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Arbitalk: Justice that Works for Business.
            </Typography>
            <Typography variant="h5" textAlign="center" sx={{ opacity: 0.8 }}>
              Empowering India's MSMEs to focus on growth, not disputes.
            </Typography>
          </motion.div>
        </Container>
      </Box>


      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', py: { xs: 3, md: 4 }, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Logo width={isMobile ? 100 : 120} height={isMobile ? 25 : 30} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                Empowering India's MSMEs to resolve business disputes faster, fairer, and without court hassles. 
                Digital arbitration and dispute resolution platform built for speed, fairness, and trust.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, opacity: 0.8 }}>
                A product of Gentlefolk Consulting Private Limited
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('footer.quickLinks')}
              </Typography>
              {/* Desktop: Grid Layout */}
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.home')}</Button>
              <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('common.services')}</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.about')}</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.contact')}</Button>
                <Button color="inherit" component={Link} href="/faq" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.faq')}</Button>
                <Button color="inherit" component={Link} href="/privacy-policy" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Privacy Policy</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('home.termsConditions')}</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('home.fees')}</Button>
                {isAuthenticated ? (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      {t('common.dashboard')}
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      {t('common.myProfile')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button color="inherit" component={Link} href="/auth/user-login" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      {t('home.clientLogin')}
                    </Button>
                    <Button color="inherit" component={Link} href="/auth/advocate-login" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      {t('home.advocateLogin')}
                    </Button>
                  </>
                )}
              </Box>
              {/* Mobile: Vertical List */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 0.5 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.home')}</Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('common.services')}</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.about')}</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.contact')}</Button>
                <Button color="inherit" component={Link} href="/faq" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.faq')}</Button>
                <Button color="inherit" component={Link} href="/privacy-policy" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Privacy Policy</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('home.termsConditions')}</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('home.fees')}</Button>
                {isAuthenticated ? (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      {t('common.dashboard')}
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      {t('common.myProfile')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button color="inherit" component={Link} href="/auth/user-login" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      {t('home.clientLogin')}
                    </Button>
                    <Button color="inherit" component={Link} href="/auth/advocate-login" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      {t('home.advocateLogin')}
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: { xs: 3, md: 4 }, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              {t('footer.copyright')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
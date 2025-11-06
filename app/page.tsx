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
  Menu as MenuIcon,
  Close as CloseIcon,
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
      title: 'Court cases take 2–5 years to resolve',
      description: 'Legal delays are costing MSMEs valuable growth opportunities and resources.',
    },
    {
      title: 'Legal costs often exceed the disputed amount',
      description: 'Traditional litigation expenses can outweigh the value of the dispute itself.',
    },
    {
      title: 'Business relationships break due to long, adversarial processes',
      description: 'Prolonged court battles damage professional relationships beyond repair.',
    },
    {
      title: 'Many small businesses simply give up their rights',
      description: 'The complexity and cost of litigation forces businesses to abandon legitimate claims.',
    },
  ];

  const advantages = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Fast-Track Resolutions',
      description: 'Settle commercial disputes within 30–90 days, not years.',
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Expert & Neutral Panel',
      description: 'Work with vetted arbitrators and mediators trained in MSME and contract disputes.',
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'AI-Powered Workflow',
      description: 'Automate everything from notice drafting to hearing scheduling.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Transparent Pricing',
      description: 'Fixed packages for mediation, conciliation, or arbitration.',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Relationship-Focused',
      description: 'Preserve business ties with win-win outcomes.',
    },
  ];

  const businessTypes = [
    'MSMEs and Startups',
    'Vendors, Suppliers & Contractors',
    'Marketing, IT & Service Agencies',
    'Builders, Consultants, and Manufacturers',
  ];

  const valueMatrix = [
    { need: 'Justice without delay', deliver: 'Resolution within 90 days' },
    { need: 'Cost transparency', deliver: 'Fixed, affordable packages' },
    { need: 'Legal confidence', deliver: 'Verified experts & AI-backed processes' },
    { need: 'Relationship safety', deliver: 'Collaborative, non-adversarial settlement' },
  ];

  const userTypes = [
    {
      title: 'For Clients',
      description: 'Access legal services and manage your cases with ease through our intuitive client portal.',
      features: ['Create new cases', 'Track case status', 'Chat with advocates', 'Upload documents', 'Schedule consultations'],
      buttonText: 'Get Started',
      buttonLink: '/auth/user-login',
      color: 'primary',
    },
    {
      title: 'For Advocates',
      description: 'Streamline your practice with powerful tools designed specifically for legal professionals.',
      features: ['View assigned cases', 'Update case status', 'Communicate with clients', 'Manage documents', 'Track billable hours'],
      buttonText: 'Join as Advocate',
      buttonLink: '/auth/advocate-login',
      color: 'secondary',
    },
  ];

  const stats = [
    { number: '30+', label: 'Experienced Lawyers' },
    { number: '₹50+ Lakhs', label: 'Saved' },
    { number: '15+', label: 'Clients' },
    { number: '8+ Years', label: 'Avg. Experience' },
    { number: '50+', label: 'Trusted CA Firms' },
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
            <Button color="inherit" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>Services</Button>
            <Button color="inherit" component={Link} href="/about" sx={{ fontSize: '0.9rem' }}>About</Button>
            <Button color="inherit" component={Link} href="/contact" sx={{ fontSize: '0.9rem' }}>Contact</Button>
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
                  Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'}
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  My Profile
                </Button>
                <Button 
                  color="secondary" 
                  onClick={logout}
                  startIcon={<LogoutIcon />}
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  Logout
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
                  Join as Client
                </Button>
                <Button 
                  color="secondary" 
                  component={Link} 
                  href="/auth/advocate-login"
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  Join as Advocate
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
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/services" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="Services" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/about" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="About" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/contact" onClick={() => setMobileMenuOpen(false)}>
              <ListItemText primary="Contact" />
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
                Dashboard
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
                My Profile
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
                Logout
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
                Join as Client
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                component={Link}
                href="/auth/advocate-login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Join as Advocate
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
                  Resolve Business Disputes. Faster, Fairer, and Without Court Hassles.
                </Typography>
                <Typography
                  variant={isMobile ? 'body1' : 'h5'}
                  sx={{ mb: 4, opacity: 0.8, fontWeight: 400, maxWidth: { xs: '100%', md: '90%' }, lineHeight: 1.6, fontSize: { xs: '0.95rem', md: '1.25rem' } }}
                >
                  Arbitalk helps businesses settle commercial conflicts quickly and affordably — through trusted neutrals and digital arbitration tools.
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
                      Get Started
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
                      Book a Free Consultation
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
                    <GavelIcon sx={{ fontSize: { xs: 120, sm: 160, md: 200 }, color: 'primary.main', opacity: 0.8 }} />
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
              India's MSMEs are losing growth to legal delays.
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'} textAlign="center" sx={{ mb: 6, opacity: 0.8, fontStyle: 'italic', fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
              Justice delayed is growth denied.
            </Typography>
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
            Resolve disputes in weeks, not years — without stepping into a courtroom. Arbitalk connects you with verified neutrals, AI-assisted tools, and transparent processes — all built for speed, fairness, and trust.
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
              Why Businesses Choose Arbitalk
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
            Built for Businesses Like Yours
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
              The Value We Deliver
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

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={6} sm={4} md={2.4} key={index}>
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
              Ready to Resolve?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.8 }}>
              Take the first step toward faster, stress-free resolution.
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
                Book a Free Consultation
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/user-register"
                startIcon={<ArrowForwardIcon />}
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
              >
                Start a Case on Arbitalk
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
                Quick Links
              </Typography>
              {/* Desktop: Grid Layout */}
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Home</Button>
              <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Services</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>About</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Contact</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Terms & Conditions</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Fees</Button>
                {isAuthenticated ? (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      Dashboard
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      My Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button color="inherit" component={Link} href="/auth/user-login" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      Client Login
                    </Button>
                    <Button color="inherit" component={Link} href="/auth/advocate-login" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      Advocate Login
                    </Button>
                  </>
                )}
              </Box>
              {/* Mobile: Vertical List */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 0.5 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Home</Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Services</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>About</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Contact</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Terms & Conditions</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Fees</Button>
                {isAuthenticated ? (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      Dashboard
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      My Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <Button color="inherit" component={Link} href="/auth/user-login" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      Client Login
                    </Button>
                    <Button color="inherit" component={Link} href="/auth/advocate-login" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      Advocate Login
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: { xs: 3, md: 4 }, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              © {new Date().getFullYear()} ARBITALK. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
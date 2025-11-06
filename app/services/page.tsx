"use client";

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  Stack,
  alpha,
  Drawer,
  ListItemButton,
  Divider,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Chat as ChatIcon,
  People as PeopleIcon,
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

export default function ServicesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const services = [
    {
      title: 'Mediation',
      description: 'Fast, collaborative dispute resolution with neutral mediators. Preserve business relationships while achieving fair outcomes.',
      icon: <ChatIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['30-60 day resolution', 'Relationship preservation', 'Cost-effective', 'Confidential process']
    },
    {
      title: 'Conciliation',
      description: 'Structured negotiation process with expert conciliators helping parties reach mutually acceptable solutions.',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Expert guidance', 'Flexible process', 'Business-friendly', 'Quick turnaround']
    },
    {
      title: 'Arbitration',
      description: 'Binding dispute resolution through neutral arbitrators. Faster than courts, fairer than litigation.',
      icon: <GavelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['60-90 day resolution', 'Legally binding', 'Expert arbitrators', 'Transparent process']
    },
    {
      title: 'Contract Disputes',
      description: 'Resolve commercial contract conflicts quickly and fairly. Perfect for MSMEs, vendors, and service providers.',
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Commercial contracts', 'Payment disputes', 'Service agreements', 'Partnership conflicts']
    },
    {
      title: 'Business Disputes',
      description: 'Handle vendor-supplier conflicts, partnership disputes, and commercial disagreements without court delays.',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Vendor disputes', 'Partnership issues', 'Commercial conflicts', 'MSME-focused']
    },
    {
      title: 'AI-Powered Workflow',
      description: 'Automated case management from notice drafting to hearing scheduling. Technology that works for you.',
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Automated notices', 'Smart scheduling', 'Document management', 'Progress tracking']
    }
  ];

  const whyChooseUs = [
    {
      title: 'Fast Resolution',
      description: '30-90 day dispute resolution',
      icon: <SpeedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Expert Neutrals',
      description: 'Verified arbitrators and mediators',
      icon: <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Transparent Pricing',
      description: 'Fixed, affordable packages',
      icon: <CheckCircleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Relationship-Focused',
      description: 'Preserve business ties',
      icon: <ChatIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    }
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
            <Button color="inherit" component={Link} href="/" sx={{ fontSize: '0.9rem' }}>Home</Button>
            <Button color="primary" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>Services</Button>
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
          py: { xs: 8, md: 12 },
          backgroundImage: (t) =>
            t.palette.mode === 'dark'
              ? 'radial-gradient(1200px 500px at -10% -20%, rgba(103, 80, 164, 0.15), transparent), radial-gradient(1000px 500px at 110% 10%, rgba(25, 118, 210, 0.12), transparent)'
              : 'radial-gradient(1200px 500px at -10% -20%, rgba(103, 80, 164, 0.08), transparent), radial-gradient(1000px 500px at 110% 10%, rgba(25, 118, 210, 0.06), transparent)',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h2'}
              component="h1"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 3, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
            >
              Dispute Resolution Services
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h5'}
              textAlign="center"
              sx={{ opacity: 0.8, maxWidth: { xs: '100%', md: '800px' }, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.25rem' }, lineHeight: 1.6 }}
            >
              Fast, fair, and digital dispute resolution for modern businesses. 
              Choose from mediation, conciliation, or arbitration — all designed to resolve conflicts in weeks, not years.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Services Grid */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box sx={{ mb: 3 }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {service.description}
                    </Typography>
                    
                    <List dense>
                      {service.features.map((feature, featureIndex) => (
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
                      variant="outlined"
                      component={Link}
                      href="/contact"
                      sx={{ borderRadius: 2 }}
                    >
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Why Choose Us Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ mb: 6 }}>
              Why Choose Arbitalk?
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 6, opacity: 0.8 }}>
              We combine verified neutral experts with AI-powered technology to deliver fast, fair dispute resolution.
            </Typography>
          </motion.div>
          
          <Grid container spacing={4}>
            {whyChooseUs.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ display: 'flex' }}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  style={{ width: '100%', display: 'flex' }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      width: '100%',
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: '100%',
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                        }}
                      >
                        {item.icon}
                      </Box>
                    </Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {item.description}
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
              Ready to Resolve Your Dispute?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.8 }}>
              Take the first step toward faster, stress-free resolution. Book a free consultation today.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/contact"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
              >
                Book a Free Consultation
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/user-register"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
              >
                Start a Case on Arbitalk
              </Button>
            </Stack>
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
                Revolutionizing arbitration and legal case management with AI-powered solutions.
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
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Home</Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Services</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>About</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Contact</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Terms & Conditions</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Fees</Button>
                {isAuthenticated && (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      Dashboard
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      My Profile
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
                {isAuthenticated && (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      Dashboard
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      My Profile
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

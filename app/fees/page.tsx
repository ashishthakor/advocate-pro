'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/AuthProvider';
import { Logout as LogoutIcon } from '@mui/icons-material';

export default function FeesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const feePackages = [
    {
      service: 'Mediation',
      duration: '30-60 days',
      description: 'Fast, collaborative dispute resolution with neutral mediators',
      tiers: [
        { range: 'Up to ₹5 Lakhs', fee: '₹15,000', features: ['Single mediator', 'Online sessions', 'Document management', '30-day resolution'] },
        { range: '₹5 Lakhs - ₹25 Lakhs', fee: '₹35,000', features: ['Expert mediator', 'Extended sessions', 'Priority support', '60-day resolution'] },
        { range: 'Above ₹25 Lakhs', fee: 'Custom Quote', features: ['Senior mediator', 'Flexible scheduling', 'Dedicated support', 'Custom timeline'] },
      ],
    },
    {
      service: 'Conciliation',
      duration: '45-75 days',
      description: 'Structured negotiation with expert conciliators',
      tiers: [
        { range: 'Up to ₹5 Lakhs', fee: '₹18,000', features: ['Expert conciliator', 'Structured process', 'Document review', '45-day resolution'] },
        { range: '₹5 Lakhs - ₹25 Lakhs', fee: '₹40,000', features: ['Senior conciliator', 'Comprehensive review', 'Priority handling', '75-day resolution'] },
        { range: 'Above ₹25 Lakhs', fee: 'Custom Quote', features: ['Panel of conciliators', 'Extended support', 'Custom process', 'Flexible timeline'] },
      ],
    },
    {
      service: 'Arbitration',
      duration: '60-90 days',
      description: 'Binding dispute resolution through neutral arbitrators',
      tiers: [
        { range: 'Up to ₹5 Lakhs', fee: '₹25,000', features: ['Single arbitrator', 'Binding award', 'Legal compliance', '60-day resolution'] },
        { range: '₹5 Lakhs - ₹25 Lakhs', fee: '₹60,000', features: ['Panel of arbitrators', 'Comprehensive hearing', 'Legal documentation', '90-day resolution'] },
        { range: 'Above ₹25 Lakhs', fee: 'Custom Quote', features: ['Expert panel', 'Full arbitration process', 'Legal representation support', 'Custom timeline'] },
      ],
    },
  ];

  const additionalFees = [
    { item: 'Case filing fee', amount: '₹2,000', description: 'One-time fee for initiating a case' },
    { item: 'Document processing', amount: '₹1,000', description: 'Per document set (if applicable)' },
    { item: 'Extended sessions', amount: '₹5,000', description: 'Per additional session beyond package' },
    { item: 'Expedited processing', amount: '+50%', description: 'For resolution within 15 days' },
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo width={isMobile ? 120 : 140} height={isMobile ? 30 : 35} />
            </motion.div>
          </Box>
          
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button color="inherit" component={Link} href="/" sx={{ fontSize: '0.9rem' }}>Home</Button>
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

      {/* Content */}
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}
            >
              Transparent Pricing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Fixed, affordable packages for fast dispute resolution
            </Typography>

            {/* Service Packages */}
            <Stack spacing={6} sx={{ mb: 6 }}>
              {feePackages.map((packageItem, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        {packageItem.service}
                      </Typography>
                      <Chip label={packageItem.duration} size="small" color="primary" />
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {packageItem.description}
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    {packageItem.tiers.map((tier, tierIndex) => (
                      <Grid item xs={12} md={4} key={tierIndex}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            height: '100%',
                            bgcolor: tierIndex === 1 ? 'primary.main' : 'background.default',
                            color: tierIndex === 1 ? 'primary.contrastText' : 'text.primary',
                            borderRadius: 2,
                            border: (t) => `1px solid ${t.palette.divider}`,
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {tier.range}
                          </Typography>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 'bold', mb: 3, color: tierIndex === 1 ? 'inherit' : 'primary.main' }}
                          >
                            {tier.fee}
                          </Typography>
                          <Stack spacing={1.5} sx={{ flex: 1 }}>
                            {tier.features.map((feature, featureIndex) => (
                              <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                <CheckCircleIcon
                                  sx={{
                                    fontSize: 20,
                                    color: tierIndex === 1 ? 'inherit' : 'primary.main',
                                    mt: 0.25,
                                  }}
                                />
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {feature}
                                </Typography>
                              </Box>
                            ))}
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              ))}
            </Stack>

            {/* Additional Fees */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                Additional Fees
              </Typography>
              <Grid container spacing={3}>
                {additionalFees.map((fee, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'background.default',
                        border: (t) => `1px solid ${t.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {fee.item}
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                          {fee.amount}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {fee.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Important Notes */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mt: 4,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Important Notes
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body1" color="text.secondary">
                  • All fees are exclusive of applicable taxes (GST)
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  • Fees are payable in advance or as per the agreed payment schedule
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  • Custom quotes are available for disputes above ₹25 Lakhs or complex cases
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  • Refund policies apply as per our Terms and Conditions
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  • All fees are in Indian Rupees (INR)
                </Typography>
              </Stack>
            </Paper>

            {/* CTA */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/contact"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
              >
                Get a Custom Quote
              </Button>
            </Box>
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
              </Box>
              {/* Mobile: Vertical List */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 0.5 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Home</Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Services</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>About</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Contact</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Terms & Conditions</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Fees</Button>
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


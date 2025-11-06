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
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
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

export default function TermsConditionsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}
            >
              Terms and Conditions
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Stack spacing={4}>
                {/* Section 1 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    1. Acceptance of Terms
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    By accessing and using Arbitalk, a digital dispute resolution platform operated by Gentlefolk Consulting Private Limited, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Arbitalk provides online mediation, conciliation, and arbitration services for business disputes, primarily serving MSMEs (Micro, Small, and Medium Enterprises) across India.
                  </Typography>
                </Box>

                {/* Section 2 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    2. Services Description
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Arbitalk offers the following dispute resolution services:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        <strong>Mediation:</strong> A voluntary, confidential process where a neutral mediator facilitates communication between parties to reach a mutually acceptable resolution.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        <strong>Conciliation:</strong> A structured negotiation process with expert conciliators helping parties reach mutually acceptable solutions.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        <strong>Arbitration:</strong> A binding dispute resolution process where neutral arbitrators make decisions that are legally enforceable.
                      </Typography>
                    </li>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    All services are provided through our digital platform, which includes case management, document sharing, and communication tools.
                  </Typography>
                </Box>

                {/* Section 3 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    3. User Accounts and Registration
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    To use Arbitalk services, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    You agree to:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        Provide accurate and truthful information during registration
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        Keep your account information updated
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        Notify us immediately of any unauthorized use of your account
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        Accept responsibility for all activities under your account
                      </Typography>
                    </li>
                  </Box>
                </Box>

                {/* Section 4 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    4. Fees and Payment
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Our fee structure is transparent and available on our Fees page. Fees vary based on the type of service (mediation, conciliation, or arbitration) and the dispute value. All fees are payable in advance or as per the payment schedule agreed upon.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Refund policies:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        Fees paid for services not yet commenced may be refundable, subject to administrative charges
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        Once services have commenced, refunds are at our sole discretion
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary" component="span">
                        All refund requests must be submitted in writing within 7 days of payment
                      </Typography>
                    </li>
                  </Box>
                </Box>

                {/* Section 5 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    5. Confidentiality and Privacy
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    All proceedings conducted through Arbitalk are confidential. Parties, mediators, conciliators, and arbitrators agree to maintain strict confidentiality regarding all information shared during the dispute resolution process.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    We are committed to protecting your privacy. Our Privacy Policy, which forms part of these Terms, explains how we collect, use, and protect your personal information.
                  </Typography>
                </Box>

                {/* Section 6 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    6. Intellectual Property
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    All content on the Arbitalk platform, including but not limited to text, graphics, logos, software, and design, is the property of Gentlefolk Consulting Private Limited and is protected by Indian and international copyright and trademark laws.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You may not reproduce, distribute, modify, or create derivative works from any content on our platform without our express written permission.
                  </Typography>
                </Box>

                {/* Section 7 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    7. Limitation of Liability
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Arbitalk acts as a platform facilitating dispute resolution services. We do not guarantee specific outcomes or results from any mediation, conciliation, or arbitration process.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    To the maximum extent permitted by law, Gentlefolk Consulting Private Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                  </Typography>
                </Box>

                {/* Section 8 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    8. Dispute Resolution
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Any disputes arising from these Terms and Conditions or your use of Arbitalk services shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 2015 of India.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    The arbitration shall be conducted in English, and the seat of arbitration shall be in India.
                  </Typography>
                </Box>

                {/* Section 9 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    9. Modifications to Terms
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on our website. Your continued use of Arbitalk after such modifications constitutes your acceptance of the updated terms.
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We recommend reviewing these Terms periodically to stay informed of any updates.
                  </Typography>
                </Box>

                {/* Section 10 */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    10. Contact Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    For questions or concerns regarding these Terms and Conditions, please contact us:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      <strong>Email:</strong> support@arbitalk.com
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      <strong>Phone:</strong> +91-XXXXXXXXXX
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>Address:</strong> Gentlefolk Consulting Private Limited, India
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
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


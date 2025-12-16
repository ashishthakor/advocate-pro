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

export default function PrivacyPolicyPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Helper function to render text with clickable email addresses
  const renderTextWithEmailLinks = (text: string) => {
    // Email regex pattern
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = text.split(emailRegex);
    
    return parts.map((part, index) => {
      // Check if part is an email address
      const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(part);
      if (isEmail) {
        return (
          <Link
            key={index}
            href={`mailto:${part}`}
            style={{
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {part}
          </Link>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

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
              <Button color="inherit" component={Link} href="/" sx={{ fontSize: '0.9rem' }}>{t('nav.home')}</Button>
              <Button color="inherit" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>{t('common.services')}</Button>
              <Button color="inherit" component={Link} href="/about" sx={{ fontSize: '0.9rem' }}>{t('nav.about')}</Button>
              <Button color="inherit" component={Link} href="/contact" sx={{ fontSize: '0.9rem' }}>{t('nav.contact')}</Button>
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
                sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}
              >
                Privacy Policy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>

              <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Stack spacing={4}>
                  {/* Introduction Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      1. Introduction
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                      Welcome to Arbitalk ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Alternative Dispute Resolution (ADR) platform.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                      By accessing or using our services, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      This Privacy Policy is designed to comply with applicable data protection laws, including the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 of India.
                    </Typography>
                  </Box>

                  {/* Information We Collect Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      2. Information We Collect
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      We collect several types of information from and about users of our platform:
                    </Typography>
                    <Stack spacing={1.5}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>2.1 Personal Information:</strong> When you register for an account, we collect personal information such as your name, email address, phone number, address, and other contact details.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>2.2 Case Information:</strong> We collect information related to your dispute cases, including case details, documents, communications, and other case-related data that you provide or upload to our platform.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>2.3 Payment Information:</strong> When you make payments through our platform, we collect payment-related information. Please note that we use Razorpay as our payment gateway, and your payment card details are processed securely by Razorpay and are not stored on our servers.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>2.4 Cookies:</strong> We use cookies to maintain your session and improve platform functionality. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Razorpay Payment Processing Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      3. Razorpay Payment Processing
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      We use Razorpay Software Private Limited ("Razorpay") as our payment gateway to process payments on our platform. When you make a payment:
                    </Typography>
                    <Stack spacing={1.5}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>3.1 Payment Data:</strong> Your payment card details, bank account information, and other payment-related data are collected and processed directly by Razorpay. We do not store your complete payment card details on our servers.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>3.2 Razorpay Privacy Policy:</strong> Razorpay's collection and use of your payment information is governed by Razorpay's Privacy Policy. We encourage you to review Razorpay's Privacy Policy at <Link href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>https://razorpay.com/privacy/</Link> to understand how they handle your payment information.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>3.3 Payment Transaction Data:</strong> We receive and store transaction-related information from Razorpay, including payment status, transaction IDs, amounts, and timestamps, which we use to process your orders and provide customer support.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>3.4 Security:</strong> All payment transactions are encrypted and processed through Razorpay's secure payment infrastructure, which is PCI DSS compliant. We do not have access to your full payment card details.
                      </Typography>
                    </Stack>
                  </Box>

                  {/* How We Use Your Information Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      4. How We Use Your Information
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      We use the information we collect for various purposes:
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body1" color="text.secondary">
                        • To provide, maintain, and improve our services
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • To process your payments and manage your account
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • To communicate with you about your account, dispute cases, and our services
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • To detect, prevent, and address technical issues and security threats
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • To comply with legal obligations and enforce our terms of service
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Information Sharing and Disclosure Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      5. Information Sharing and Disclosure
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      We do not sell your personal information. We may share your information in the following circumstances:
                    </Typography>
                    <Stack spacing={1.5}>
                      <Typography variant="body1" color="text.secondary">
                        <strong>5.1 Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, including Razorpay for payment processing and cloud storage providers. These service providers are contractually obligated to protect your information.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>5.2 Legal Requirements:</strong> We may disclose your information if required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users or others.
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        <strong>5.3 With Your Consent:</strong> We may share your information with your explicit consent or at your direction.
                      </Typography>
                    </Stack>
                  </Box>

                  {/* Data Security Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      6. Data Security
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                      We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, access controls, and regular security assessments.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
                    </Typography>
                  </Box>

                  {/* Your Rights Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      7. Your Rights
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      You have the following rights regarding your personal information:
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body1" color="text.secondary">
                        • <strong>Access:</strong> You can request access to the personal information we hold about you
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • <strong>Correction:</strong> You can request correction of inaccurate or incomplete information
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • <strong>Deletion:</strong> You can request deletion of your personal information, subject to legal and contractual obligations
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • <strong>Objection:</strong> You can object to certain processing of your information
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • <strong>Data Portability:</strong> You can request a copy of your data in a structured, machine-readable format
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        • <strong>Withdraw Consent:</strong> You can withdraw your consent for processing where consent is the legal basis
                      </Typography>
                    </Stack>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>
                      To exercise these rights, please contact us at {renderTextWithEmailLinks('support@arbitalk.com')} or through the contact information provided at the end of this policy.
                    </Typography>
                  </Box>

                  {/* Data Retention Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      8. Data Retention
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
                    </Typography>
                  </Box>

                  {/* Children's Privacy Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      9. Children's Privacy
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete such information.
                    </Typography>
                  </Box>

                  {/* Shipping Policy Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      10. Shipping Policy
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                      Arbitalk is a digital Alternative Dispute Resolution (ADR) platform. As we are a service-based platform, we do not ship physical products. All our services, including dispute case management, document storage, and case-related communications, are delivered electronically through our secure online platform.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      Upon successful registration and payment, you will receive immediate access to our platform through your registered account. All case documents and communications are accessible through your secure account dashboard.
                    </Typography>
                  </Box>

                  {/* Cancellation and Refunds Policy Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      11. Cancellation and Refunds Policy
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>11.1 Payment and Service Description:</strong> Arbitalk charges a case registration fee of ₹3,000 for dispute case registration. This fee covers case registration, access to our ADR platform, document storage, and communication tools.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>11.2 Cancellation Policy:</strong> If you wish to cancel your case registration or request a refund, please contact us at {renderTextWithEmailLinks('support@arbitalk.com')} with your case number, payment transaction ID, and reason for cancellation. All cancellation and refund requests will be reviewed on a case-by-case basis.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>11.3 Refund Policy:</strong> Refund eligibility will be determined based on the specific circumstances, including timing of the cancellation request, services already rendered, and technical issues preventing service access.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>11.4 Refund Process:</strong> To request a refund, send an email to {renderTextWithEmailLinks('support@arbitalk.com')} with the subject "Refund Request" and include your case number and payment transaction ID. Refund requests will be reviewed within 7-10 business days. If approved, refunds will be processed to the original payment method within 7-14 business days.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      <strong>11.5 Payment Gateway:</strong> We use Razorpay as our payment gateway. Refunds will be processed through Razorpay to your original payment method. Any processing fees charged by Razorpay or banking institutions may be deducted from the refund amount.
                    </Typography>
                  </Box>

                  {/* Changes to This Privacy Policy Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      13. Changes to This Privacy Policy
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                    </Typography>
                  </Box>

                  {/* Contact Information Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                      12. Contact Information
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      <strong>Support Email:</strong> {renderTextWithEmailLinks('support@arbitalk.com')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      <strong>Company:</strong> Gentlefolk Consulting Private Limited
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                      <strong>Contact Page:</strong> <Link href="/contact" style={{ color: 'inherit', textDecoration: 'underline' }}>Visit our Contact Us page</Link>
                    </Typography>
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
                  {t('footer.description')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, opacity: 0.8 }}>
                  {t('about.productOf')}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('footer.quickLinks')}
                </Typography>
                {/* Desktop: Grid Layout */}
                <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.home')}</Button>
                  <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('common.services')}</Button>
                  <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.about')}</Button>
                  <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.contact')}</Button>
                  <Button color="inherit" component={Link} href="/privacy-policy" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>Privacy Policy</Button>
                  <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('home.termsConditions')}</Button>
                  <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('home.fees')}</Button>
                </Box>
                {/* Mobile: Vertical List */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 0.5 }}>
                  <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.home')}</Button>
                  <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('common.services')}</Button>
                  <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.about')}</Button>
                  <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.contact')}</Button>
                  <Button color="inherit" component={Link} href="/privacy-policy" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Privacy Policy</Button>
                  <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('home.termsConditions')}</Button>
                  <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('home.fees')}</Button>
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

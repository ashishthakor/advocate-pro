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
              {t('terms.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
              {t('terms.lastUpdated')}: {new Date("11-09-2025").toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, bgcolor: 'background.paper', borderRadius: 2 }}>
              <Stack spacing={4}>
                {/* Introduction Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.introduction.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.introduction.description1')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.introduction.description2')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.introduction.description3')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.introduction.description4')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.introduction.description5')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.introduction.description6')}
                  </Typography>
                </Box>

                {/* Disclaimer Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.disclaimer.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.disclaimer.description')}
                  </Typography>
                </Box>

                {/* Eligibility Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.eligibility.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.eligibility.description')}
                  </Typography>
                </Box>

                {/* Registration Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.registration.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {renderTextWithEmailLinks(t('terms.registration.description'))}
                  </Typography>
                </Box>

                {/* User Account, Password and Security Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.accountSecurity.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.accountSecurity.description1')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {renderTextWithEmailLinks(t('terms.accountSecurity.description2'))}
                  </Typography>
                </Box>

                {/* Communication Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.communication.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {renderTextWithEmailLinks(t('terms.communication.description1'))}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {(() => {
                      const text = t('terms.communication.description2');
                      const parts = text.split('Click here');
                      if (parts.length === 2) {
                        return (
                          <>
                            {parts[0]}
                            <Link 
                              href="/auth/user-login" 
                              style={{ 
                                color: 'inherit', 
                                textDecoration: 'underline',
                                cursor: 'pointer',
                                fontWeight: 500
                              }}
                            >
                              {t('terms.communication.clickHere')}
                            </Link>
                            {parts[1]}
                          </>
                        );
                      }
                      return text;
                    })()}
                  </Typography>
                </Box>

                {/* Payment Terms Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.payment.title')}
                  </Typography>
                  <Stack spacing={1.5}>
                    <Typography variant="body1" color="text.secondary">
                      <strong>1.</strong> {t('terms.payment.point1')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>2.</strong> {t('terms.payment.point2')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>3.</strong> {t('terms.payment.point3')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>4.</strong> {t('terms.payment.point4')}
                    </Typography>
                    <Box component="ul" sx={{ pl: 3, mb: 1 }}>
                      <li><Typography variant="body1" color="text.secondary" component="span">{t('terms.payment.option1')}</Typography></li>
                      <li><Typography variant="body1" color="text.secondary" component="span">{t('terms.payment.option2')}</Typography></li>
                      <li><Typography variant="body1" color="text.secondary" component="span">{t('terms.payment.option3')}</Typography></li>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      <strong>5.</strong> {t('terms.payment.point5')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>6.</strong> {t('terms.payment.point6')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>7.</strong> {t('terms.payment.point7')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>8.</strong> {t('terms.payment.point8')}
                    </Typography>
                  </Stack>
                </Box>

                {/* Refund and Cancellation Policy Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.refund.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {renderTextWithEmailLinks(t('terms.refund.description'))}
                  </Typography>
                </Box>

                {/* Privacy Policy Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.privacy.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.privacy.description')}
                  </Typography>
                </Box>

                {/* Limited Use Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.limitedUse.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.limitedUse.description')}
                  </Typography>
                </Box>

                {/* User Conduct and Rules Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.userConduct.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {t('terms.userConduct.description')}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body1" color="text.secondary">
                      <strong>1.</strong> {t('terms.userConduct.rule1')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>2.</strong> {t('terms.userConduct.rule2')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>3.</strong> {t('terms.userConduct.rule3')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>4.</strong> {t('terms.userConduct.rule4')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>5.</strong> {t('terms.userConduct.rule5')}
                    </Typography>
                  </Stack>
                </Box>

                {/* Prohibited Activity Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.prohibited.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {t('terms.prohibited.description')}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body1" color="text.secondary">
                      <strong>1.</strong> {t('terms.prohibited.item1')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>2.</strong> {t('terms.prohibited.item2')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>3.</strong> {t('terms.prohibited.item3')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>4.</strong> {t('terms.prohibited.item4')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>5.</strong> {t('terms.prohibited.item5')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>6.</strong> {t('terms.prohibited.item6')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>7.</strong> {t('terms.prohibited.item7')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>8.</strong> {t('terms.prohibited.item8')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      <strong>9.</strong> {t('terms.prohibited.item9')}
                    </Typography>
                  </Stack>
                </Box>

                {/* Warranty and Representation Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.warranty.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.warranty.description1')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.warranty.description2')}
                  </Typography>
                </Box>

                {/* No Agency or Partnership Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.noAgency.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.noAgency.description')}
                  </Typography>
                </Box>

                {/* Limitation of Liability Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.limitation.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.limitation.description1')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.limitation.description2')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.limitation.description3')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {renderTextWithEmailLinks(t('terms.limitation.description4'))}
                  </Typography>
                </Box>

                {/* Usage Terms Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.usage.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.usage.description')}
                  </Typography>
                </Box>

                {/* Intellectual Property Rights Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.intellectualProperty.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    <strong>1.</strong> {t('terms.intellectualProperty.point1')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    <strong>2.</strong> {t('terms.intellectualProperty.point2')}
                  </Typography>
                </Box>

                {/* Copyrighted Material Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.copyright.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.copyright.description')}
                  </Typography>
                </Box>

                {/* Links to Third Party Sites Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.thirdParty.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.thirdParty.description')}
                  </Typography>
                </Box>

                {/* No Guarantee Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.noGuarantee.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.noGuarantee.description')}
                  </Typography>
                </Box>

                {/* Indemnity Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.indemnity.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.indemnity.description')}
                  </Typography>
                </Box>

                {/* Notices Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.notices.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.notices.description')}
                  </Typography>
                </Box>

                {/* Breach of Terms Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.breach.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.breach.description')}
                  </Typography>
                </Box>

                {/* Confidentiality Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.confidentiality.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.confidentiality.description')}
                  </Typography>
                </Box>

                {/* Termination of Access Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.termination.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.termination.description')}
                  </Typography>
                </Box>

                {/* Entire Agreement Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.entireAgreement.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.entireAgreement.description')}
                  </Typography>
                </Box>

                {/* Severability Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.severability.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.severability.description')}
                  </Typography>
                </Box>

                {/* Waiver Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.waiver.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.waiver.description')}
                  </Typography>
                </Box>

                {/* Force Majeure Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.forceMajeure.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.forceMajeure.description')}
                  </Typography>
                </Box>

                {/* Dispute Resolution Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.disputeResolution.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.disputeResolution.description')}
                  </Typography>
                </Box>

                {/* Governing Law and Jurisdiction Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.governingLaw.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.governingLaw.description')}
                  </Typography>
                </Box>

                {/* Grievance Officer Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.grievance.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {renderTextWithEmailLinks(t('terms.grievance.description1'))}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.grievance.description2')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
                    {t('terms.grievance.description3')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.grievance.description4')}
                  </Typography>
                </Box>

                {/* Section Headings Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.sectionHeadings.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {t('terms.sectionHeadings.description')}
                  </Typography>
                </Box>

                {/* Contact Information Section */}
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    {t('terms.contact.title')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                    {renderTextWithEmailLinks(t('terms.contact.description'))}
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


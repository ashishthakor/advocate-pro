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

  // Arbitration Fee Schedule based on claim amounts (INR)
  const arbitrationFees = [
    { range: t('fees.arbitration.upTo1l'), fee: t('fees.arbitration.fee5k') },
    { range: t('fees.arbitration.1LTo5L'), fee: t('fees.arbitration.fee20k') },
    { range: t('fees.arbitration.5LTo25L'), fee: t('fees.arbitration.fee20kPlus3') },
    { range: t('fees.arbitration.25LTo50L'), fee: t('fees.arbitration.fee80kPlus2') },
    { range: t('fees.arbitration.50LTo1Cr'), fee: t('fees.arbitration.fee130kPlus1') },
    { range: t('fees.arbitration.1CrTo5Cr'), fee: t('fees.arbitration.fee180kPlus075') },
    { range: t('fees.arbitration.5CrTo10Cr'), fee: t('fees.arbitration.fee480kPlus06') },
    { range: t('fees.arbitration.10CrTo20Cr'), fee: t('fees.arbitration.fee780kPlus05') },
    { range: t('fees.arbitration.above20Cr'), fee: t('fees.arbitration.contactUs') },
  ];

  // Arbitration Fee Schedule based on claim amounts (USD) - Cross-border disputes
  const arbitrationFeesUsd = [
    { range: t('fees.arbitration.usd.upTo5k'), fee: t('fees.arbitration.usd.fee500') },
    { range: t('fees.arbitration.usd.5kTo10k'), fee: t('fees.arbitration.usd.fee750') },
    { range: t('fees.arbitration.usd.10kTo25k'), fee: t('fees.arbitration.usd.fee1500') },
    { range: t('fees.arbitration.usd.25kTo50k'), fee: t('fees.arbitration.usd.fee3000Plus3') },
    { range: t('fees.arbitration.usd.50kTo100k'), fee: t('fees.arbitration.usd.fee7500Plus2') },
    { range: t('fees.arbitration.usd.above100k'), fee: t('fees.arbitration.usd.contactUs') },
  ];

  // Mediation/Conciliation Fees
  const mediationFees = [
    { item: t('fees.mediation.registrationFee'), amount: t('fees.mediation.registrationAmount') },
    { item: t('fees.mediation.adminFee'), amount: t('fees.mediation.adminAmount') },
    { item: t('fees.mediation.mediatorFee'), amount: t('fees.mediation.mediatorAmount') },
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
            <Button color="inherit" component={Link} href="/" sx={{ fontSize: '0.9rem' }}>{t('nav.home')}</Button>
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
              {t('fees.title')}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
              {t('fees.subtitle')}
            </Typography>

            {/* Dispute Resolution Rules Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.disputeResolutionRules.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {t('fees.disputeResolutionRules.description')}
              </Typography>
            </Paper>

            {/* Code of Conduct and Disclosure Rules Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.codeOfConduct.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {t('fees.codeOfConduct.description')}
                {' '}
                <Link 
                  href="/auth/user-login" 
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  {t('fees.codeOfConduct.clickHere')}
                </Link>
                {' '}
                {t('fees.codeOfConduct.clickHereSuffix')}
              </Typography>
            </Paper>

            {/* Model Fee Schedule Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.arbitration.title')}
              </Typography>

              {/* Arbitration Subsection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.arbitration.subtitle')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                  {t('fees.arbitration.description')}
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.arbitration.inrDescription')}
                </Typography>
                <Box sx={{ overflowX: 'auto', mb: 2 }}>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      '& th, & td': {
                        border: (t) => `1px solid ${t.palette.divider}`,
                        padding: 2,
                        textAlign: 'left',
                      },
                      '& th': {
                        bgcolor: 'background.default',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>{t('fees.arbitration.claimAmountInr')}</th>
                        <th>{t('fees.arbitration.consolidatedFeeInr')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arbitrationFees.map((fee, index) => (
                        <tr key={index}>
                          <td>{fee.range}</td>
                          <td>{fee.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
                {t('fees.arbitration.contactUs') && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {renderTextWithEmailLinks(t('fees.arbitration.contactUs'))}
                  </Typography>
                )}
              </Box>

              {/* USD Arbitration Subsection */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                  {t('fees.arbitration.usdDescription')}
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.arbitration.usdTableTitle')}
                </Typography>
                <Box sx={{ overflowX: 'auto', mb: 2 }}>
                  <Box
                    component="table"
                    sx={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      '& th, & td': {
                        border: (t) => `1px solid ${t.palette.divider}`,
                        padding: 2,
                        textAlign: 'left',
                      },
                      '& th': {
                        bgcolor: 'background.default',
                        fontWeight: 'bold',
                      },
                    }}
                  >
                    <thead>
                      <tr>
                        <th>{t('fees.arbitration.claimAmountUsd')}</th>
                        <th>{t('fees.arbitration.consolidatedFeeUsd')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {arbitrationFeesUsd.map((fee, index) => (
                        <tr key={index}>
                          <td>{fee.range}</td>
                          <td>{fee.fee}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Box>
                </Box>
                {t('fees.arbitration.usd.contactUs') && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {renderTextWithEmailLinks(t('fees.arbitration.usd.contactUs'))}
                  </Typography>
                )}
              </Box>

              {/* Arbitration Notes */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.arbitration.noteTitle')}
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(a)</strong> {t('fees.arbitration.noteA')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(b)</strong> {t('fees.arbitration.noteB')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(c)</strong> {t('fees.arbitration.noteC')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(d)</strong> {renderTextWithEmailLinks(t('fees.arbitration.noteD'))}
                  </Typography>
                </Stack>
              </Box>
            </Paper>

            {/* Mediation/Conciliation Fees Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.mediation.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                {t('fees.mediation.description')}
              </Typography>

              {/* Domestic Mediation/Conciliation */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.mediation.inrTitle')}
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.inrRegistrationFee')}</strong> – {t('fees.mediation.inrRegistrationAmount')};
                    </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.inrUpto2Lakh')}</strong> – {t('fees.mediation.inrUpto2LakhAmount')};
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.inrAbove2Lakh')}</strong> – {t('fees.mediation.inrAbove2LakhAmount')};
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.inrAdminFees')}</strong> – {t('fees.mediation.inrAdminFeesAmount')};
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.inrPerSession')}</strong> – {t('fees.mediation.inrPerSessionAmount')};
                  </Typography>
                </Stack>
              </Box>

              {/* International Mediation/Conciliation */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                  {t('fees.mediation.usdDescription')}
                </Typography>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.mediation.usdTitle')}
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.usdRegistrationFee')}</strong> – {t('fees.mediation.usdRegistrationAmount')};
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.usdAdminFee')}</strong> – {t('fees.mediation.usdAdminAmount')};
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('fees.mediation.usdMediatorFee')}</strong> – {t('fees.mediation.usdMediatorAmount')}.
                  </Typography>
                </Stack>
              </Box>

              {/* Mediation Notes */}
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  {t('fees.mediation.noteTitle')}
                </Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(a)</strong> {t('fees.mediation.noteA')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(b)</strong> {t('fees.mediation.noteB')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(c)</strong> {t('fees.mediation.noteC')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(d)</strong> {t('fees.mediation.noteD')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>(e)</strong> {t('fees.mediation.noteE')}
                  </Typography>
                </Stack>
              </Box>
            </Paper>

            {/* Service Charges Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.serviceCharges.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('fees.serviceCharges.description')}
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Box
                  component="table"
                  sx={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    '& th, & td': {
                      border: (t) => `1px solid ${t.palette.divider}`,
                      padding: 2,
                      textAlign: 'left',
                    },
                    '& th': {
                      bgcolor: 'background.default',
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <tbody>
                    <tr>
                      <td>{t('fees.serviceCharges.upto2Lakh')}</td>
                      <td>{t('fees.serviceCharges.upto2LakhAmount')}</td>
                    </tr>
                    <tr>
                      <td>{t('fees.serviceCharges.above2Lakh')}</td>
                      <td>{t('fees.serviceCharges.above2LakhAmount')}</td>
                    </tr>
                    <tr>
                      <td>{t('fees.serviceCharges.adminFees')}</td>
                      <td>{t('fees.serviceCharges.adminFeesAmount')}</td>
                    </tr>
                  </tbody>
                </Box>
              </Box>
            </Paper>

            {/* Special Projects Section */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.projects.title')}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      border: (t) => `2px solid ${t.palette.primary.main}`,
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
                      {t('fees.projects.arbitalkForAll.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t('fees.projects.arbitalkForAll.description')}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      border: (t) => `2px solid ${t.palette.secondary.main}`,
                    }}
                  >
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 2 }}>
                      {t('fees.projects.hearTheDifference.title')}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {t('fees.projects.hearTheDifference.description')}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* Disclaimer */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.default',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('fees.disclaimer.title')}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {t('fees.disclaimer.text')}
              </Typography>
            </Paper>

            {/* Contact Information */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: (t) => `1px solid ${t.palette.divider}`,
                mb: 4,
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                {t('fees.contact.title')}
              </Typography>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('fees.contact.locateUs')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t('fees.contact.addressValue')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('fees.contact.contactUs')}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1, whiteSpace: 'pre-line' }}>
                    {t('fees.contact.telephone')}: {t('fees.contact.phoneValue')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.contact.phoneDescription')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('fees.contact.writeToUs')}
                  </Typography>
                  <Link 
                    href={`mailto:${t('fees.contact.emailValue')}`}
                    style={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      component="span"
                      sx={{ 
                        mb: 1,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      {t('fees.contact.emailValue')}
                    </Typography>
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.contact.emailDescription')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
                    {t('fees.contact.supportEmail')}
                  </Typography>
                  <Link 
                    href={`mailto:${t('fees.contact.supportEmailValue')}`}
                    style={{ 
                      color: 'inherit', 
                      textDecoration: 'none',
                      cursor: 'pointer',
                      display: 'inline-block',
                      marginBottom: '8px'
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      component="span"
                      sx={{ 
                        mb: 1,
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      {t('fees.contact.supportEmailValue')}
                    </Typography>
                  </Link>
                  <Typography variant="body2" color="text.secondary">
                    {t('fees.contact.supportEmailDescription')}
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
                <Button color="inherit" component={Link} href="/faq" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.faq')}</Button>
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
                <Button color="inherit" component={Link} href="/faq" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('nav.faq')}</Button>
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


"use client";

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  Stack,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  ListItemButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Language as LanguageIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/AuthProvider';
import { Logout as LogoutIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function ContactPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();
    if (!name) errors.name = t('contact.nameRequired');
    if (!email) errors.email = t('contact.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = t('contact.emailInvalid');
    if (!subject) errors.subject = t('contact.subjectRequired');
    if (!message) errors.message = t('contact.messageRequired');
    else if (message.length < 10) errors.message = t('contact.messageMinLength');
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.errors) setFormErrors(data.errors);
        throw new Error(data?.error || t('contact.failedToSend'));
      }
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setFormErrors({});
    } catch (err: any) {
      setSubmitError(err?.message || t('contact.failedToSend'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const contactInfo = [
    {
      title: t('about.phone'),
      value: '+91 9081297778\n+91 9081297775',
      icon: '📞',
      description: t('contact.monFri')
    },
    {
      title: t('about.email'),
      value: 'info@arbitalk.com',
      icon: '✉️',
      description: t('contact.weRespond')
    },
    {
      title: t('contact.supportEmail'),
      value: 'support@arbitalk.com',
      icon: '✉️',
      description: t('contact.forTechnicalSupport')
    },
    {
      title: t('about.address'),
      value: '11th Floor, The Citadel',
      icon: '📍',
      description: 'Opp. Star Bazar, Adajan Gam, Surat - 395009'
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
            <Button color="inherit" component={Link} href="/" sx={{ fontSize: '0.9rem' }}>{t('nav.home')}</Button>
            <Button color="inherit" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>{t('common.services')}</Button>
            <Button color="inherit" component={Link} href="/about" sx={{ fontSize: '0.9rem' }}>{t('nav.about')}</Button>
            <Button color="primary" component={Link} href="/contact" sx={{ fontSize: '0.9rem' }}>{t('nav.contact')}</Button>
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
              sx={{ fontWeight: 'bold', mb: 4, fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}
            >
              {t('contact.contactUs')}
            </Typography>
            <Typography
              variant={isMobile ? 'body1' : 'h5'}
              textAlign="center"
              sx={{ opacity: 0.8, maxWidth: { xs: '100%', md: '800px' }, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.25rem' }, lineHeight: 1.6 }}
            >
              {t('contact.getInTouchDesc')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Contact Form & Info Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card sx={{ p: 4 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  {t('contact.send')}
                </Typography>
                
                {submitError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                  </Alert>
                )}

                {showSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {t('contact.thankYou')}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contact.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder={t('contact.name')}
                        error={Boolean(formErrors.name)}
                        helperText={formErrors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contact.email')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder={t('contact.email')}
                        error={Boolean(formErrors.email)}
                        helperText={formErrors.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contact.phone')}
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder={t('contact.phone')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required error={Boolean(formErrors.subject)}>
                        <InputLabel id="contact-subject-label">{t('contact.subject')}</InputLabel>
                        <Select
                          labelId="contact-subject-label"
                          id="contact-subject"
                          value={formData.subject}
                          label={t('contact.subject')}
                          onChange={handleSubjectChange}
                        >
                          <MenuItem value=""><em>{t('contact.subjectSelect')}</em></MenuItem>
                          <MenuItem value="general">{t('contact.subjectGeneral')}</MenuItem>
                          <MenuItem value="support">{t('contact.subjectSupport')}</MenuItem>
                          <MenuItem value="billing">{t('contact.subjectBilling')}</MenuItem>
                          <MenuItem value="consultation">{t('contact.subjectConsultation')}</MenuItem>
                          <MenuItem value="partnership">{t('contact.subjectPartnership')}</MenuItem>
                          <MenuItem value="other">{t('contact.subjectOther')}</MenuItem>
                        </Select>
                        {formErrors.subject && (
                          <FormHelperText>{formErrors.subject}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('contact.message')}
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder={t('contact.message')}
                        error={Boolean(formErrors.message)}
                        helperText={formErrors.message}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isSubmitting}
                        fullWidth
                        sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
                      >
                        {isSubmitting ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Box sx={{ width: 20, height: 20, mr: 1 }}>
                              <Box
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  border: '2px solid transparent',
                                  borderTop: '2px solid currentColor',
                                  borderRadius: '50%',
                                  animation: 'spin 1s linear infinite',
                                  '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                  },
                                }}
                              />
                            </Box>
                            {t('contact.sending')}
                          </Box>
                        ) : (
                          t('contact.send')
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Card>
            </motion.div>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} lg={6}>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Box sx={{ mb: 6 }}>
                <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  {t('contact.getInTouch')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {t('contact.contactDesc')}
                </Typography>
              </Box>

              <Stack spacing={3} sx={{ mb: 4 }}>
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>
                        {info.icon}
                      </Typography>
                      <Box>
                        <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium', mb: 1, whiteSpace: 'pre-line' }}>
                          {info.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Stack>

              {/* Office Hours */}
              <Card sx={{ mb: 4, p: 3 }}>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  {t('contact.officeHours')}
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('contact.mondayFriday')}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>9:00 AM - 6:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('contact.saturday')}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>10:00 AM - 4:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('contact.sunday')}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{t('contact.closed')}</Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Emergency Contact */}
              <Card sx={{ bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Typography variant="h4" sx={{ color: 'error.main' }}>
                    🚨
                  </Typography>
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      {t('contact.emergencyLegalSupport')}
                    </Typography>
                    <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
                      {t('contact.emergencyDesc')}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      +91 7778070439
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

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
                {t('footer.quickLinks')}
              </Typography>
              {/* Desktop: Grid Layout */}
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.home')}</Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('common.services')}</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.about')}</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('nav.contact')}</Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('home.termsConditions')}</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>{t('home.fees')}</Button>
                {isAuthenticated && (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      {t('common.dashboard')}
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                      {t('common.myProfile')}
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
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('home.termsConditions')}</Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>{t('home.fees')}</Button>
                {isAuthenticated && (
                  <>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'advocate' ? '/advocate/dashboard' : '/user/dashboard'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      {t('common.dashboard')}
                    </Button>
                    <Button color="inherit" component={Link} href={user?.role === 'admin' ? '/admin/profile' : user?.role === 'advocate' ? '/advocate/profile' : '/user/profile'} sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                      {t('common.myProfile')}
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

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {t('contact.thankYou')}
        </Alert>
      </Snackbar>
    </Box>
  );
}
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
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import Link from 'next/link';

export default function ContactPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  
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
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email address';
    if (!subject) errors.subject = 'Subject is required';
    if (!message) errors.message = 'Message is required';
    else if (message.length < 10) errors.message = 'Message must be at least 10 characters';
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
        throw new Error(data?.error || 'Failed to send message');
      }
      setShowSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setFormErrors({});
    } catch (err: any) {
      setSubmitError(err?.message || 'Something went wrong');
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
      title: 'Phone',
      value: '+91 77780 70439',
      icon: '📞',
      description: 'Mon-Fri 9AM-6PM IST'
    },
    // {
    //   title: 'Email',
    //   value: 'info@arbitalk.com',
    //   icon: '✉️',
    //   description: 'We respond within 24 hours'
    // },
    {
      title: 'Address',
      value: 'Plot No. 22, Yogi Nagar Society',
      icon: '📍',
      description: 'Near Amroli Bridge, Katargam, Surat - 395004, Gujarat'
    },
    {
      title: 'Emergency',
      value: '+91 77780 70439',
      icon: '🚨',
      description: '24/7 emergency support'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Logo width={140} height={35} />
            </motion.div>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button color="inherit" component={Link} href="/">Home</Button>
            <Button color="inherit" component={Link} href="/services">Services</Button>
            <Button color="inherit" component={Link} href="/about">About</Button>
            <Button color="primary" component={Link} href="/contact">Contact</Button>
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
              Join as Client
            </Button>
            <Button color="secondary" component={Link} href="/auth/advocate-login">
              Join as Advocate
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
              variant={isMobile ? 'h3' : 'h2'}
              component="h1"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 4 }}
            >
              Contact Us
            </Typography>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              textAlign="center"
              sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
            >
              Get in touch with our team for any questions, support, or to schedule a consultation. 
              We're here to help you succeed.
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
                  Send us a Message
                </Typography>
                
                {submitError && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {submitError}
                  </Alert>
                )}

                {showSuccess && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you for your message! We'll get back to you within 24 hours.
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Your full name"
                        error={Boolean(formErrors.name)}
                        helperText={formErrors.name}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="your.email@example.com"
                        error={Boolean(formErrors.email)}
                        helperText={formErrors.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        variant="outlined"
                        placeholder="+91 9876543210"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required error={Boolean(formErrors.subject)}>
                        <InputLabel id="contact-subject-label">Subject</InputLabel>
                        <Select
                          labelId="contact-subject-label"
                          id="contact-subject"
                          value={formData.subject}
                          label="Subject"
                          onChange={handleSubjectChange}
                        >
                          <MenuItem value=""><em>Select a subject</em></MenuItem>
                          <MenuItem value="general">General Inquiry</MenuItem>
                          <MenuItem value="support">Technical Support</MenuItem>
                          <MenuItem value="billing">Billing Question</MenuItem>
                          <MenuItem value="consultation">Free Consultation</MenuItem>
                          <MenuItem value="partnership">Partnership Opportunity</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                        {formErrors.subject && (
                          <FormHelperText>{formErrors.subject}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        variant="outlined"
                        placeholder="Tell us how we can help you..."
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
                            Sending...
                          </Box>
                        ) : (
                          'Send Message'
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
                  Get in Touch
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  We're here to help you with any questions or concerns. Reach out to us through 
                  any of the channels below, and we'll get back to you as soon as possible.
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
                        <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium', mb: 1 }}>
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
                  Office Hours
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Monday - Friday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>9:00 AM - 6:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Saturday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>10:00 AM - 4:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Sunday</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>Closed</Typography>
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
                      Emergency Legal Support
                    </Typography>
                    <Typography variant="body2" color="error.main" sx={{ mb: 2 }}>
                      For urgent legal matters that cannot wait for regular business hours.
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      +91 77780 70439
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', py: 4, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Logo width={120} height={30} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Revolutionizing arbitration and legal case management with AI-powered solutions.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
                A product of Gentlefolk Consulting Private Limited
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button color="inherit" component={Link} href="/">Home</Button>
                <Button color="inherit" component={Link} href="/services">Services</Button>
                <Button color="inherit" component={Link} href="/about">About</Button>
                <Button color="inherit" component={Link} href="/contact">Contact</Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 4, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 ARBITALK. All rights reserved.
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
          Thank you! Your message has been sent successfully. We&apos;ll get back to you within 24 hours.
        </Alert>
      </Snackbar>
    </Box>
  );
}
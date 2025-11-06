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
  Avatar,
  Stack,
  alpha,
  Drawer,
  ListItemButton,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';

export default function AboutPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const stats = [
    { number: '500+', label: 'Active Advocates' },
    { number: '10K+', label: 'Cases Managed' },
    { number: '99%', label: 'Client Satisfaction' },
    { number: '15+', label: 'Years Experience' }
  ];

  const team = [
    {
      name: 'Nilesh Mishra',
      role: 'Co-founder & COO',
      experience: 'Co-founder',
      specialization: 'Chief Operating Officer',
      image: '👨‍💼'
    },
    {
      name: 'Naresh Kikani',
      role: 'Co-founder & Business Advisor',
      experience: 'Co-founder',
      specialization: 'Business Advisor',
      image: '👨‍💼'
    },
    {
      name: 'Vimal Shukla',
      role: 'Co-founder & Head - Legal & Partnership',
      experience: 'Co-founder',
      specialization: 'Legal & Partnership',
      image: '👨‍💼'
    },
    {
      name: 'Abhishek Pandey',
      role: 'Co-founder & CGO',
      experience: 'Co-founder',
      specialization: 'Chief Growth Officer',
      image: '👨‍💼'
    }
  ];

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from our technology to our customer service.',
      icon: <CheckCircleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Integrity',
      description: 'We maintain the highest standards of integrity and ethical conduct in all our operations.',
      icon: <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Innovation',
      description: 'We continuously innovate to provide cutting-edge solutions for legal professionals.',
      icon: <SpeedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
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
            <Button color="inherit" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>Services</Button>
            <Button color="primary" component={Link} href="/about" sx={{ fontSize: '0.9rem' }}>About</Button>
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
              variant={isMobile ? 'h3' : 'h2'}
              component="h1"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 6 }}
            >
              About ARBITALK
            </Typography>
            <Typography
              variant="h6"
              textAlign="center"
              sx={{ mb: 4, opacity: 0.9, fontWeight: 'medium' }}
            >
              A product of Gentlefolk Consulting Private Limited
            </Typography>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              textAlign="center"
              sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}
            >
              Empowering India's MSMEs to resolve business disputes faster, fairer, and without court hassles. 
              A digital arbitration and dispute resolution platform built for speed, fairness, and trust.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
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
                  <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
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

      {/* Mission & Vision */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card sx={{ height: '100%', p: 4 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
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
                        mb: 3,
                      }}
                    >
                      <SpeedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                      Our Mission
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      To empower India's MSMEs and businesses to resolve commercial disputes quickly, 
                      affordably, and fairly through digital arbitration and trusted neutral panels. 
                      We believe justice should work for business, not against it.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card sx={{ height: '100%', p: 4 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
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
                        mb: 3,
                      }}
                    >
                      <VisibilityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                      Our Vision
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      To be India's most trusted digital dispute resolution platform, where businesses 
                      can resolve conflicts in weeks, not years — preserving relationships while 
                      achieving fair outcomes through technology and expertise.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Our Story */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card sx={{ p: 4 }}>
            <CardContent>
              <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                Our Story
              </Typography>
              <Typography variant="h6" textAlign="center" sx={{ mb: 6, opacity: 0.8 }}>
                Founded by business and legal professionals who understand the challenges of MSME dispute resolution
              </Typography>
              
              <Box sx={{ maxWidth: 'none' }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Arbitalk was founded to solve a critical problem: India's MSMEs were losing growth 
                  to legal delays. Court cases take 2–5 years to resolve, legal costs often exceed 
                  the disputed amount, and business relationships break due to long, adversarial processes. 
                  Many small businesses simply give up their rights to avoid litigation.
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
                  Our founders recognized that businesses needed a better way — fast, fair, and digital. 
                  We built Arbitalk to connect businesses with verified neutrals, AI-assisted tools, 
                  and transparent processes. Our platform enables dispute resolution within 30–90 days, 
                  not years, while preserving business relationships through collaborative, 
                  non-adversarial settlement.
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Today, Arbitalk serves MSMEs, startups, vendors, suppliers, contractors, and service 
                  agencies across India. We've helped businesses save over ₹50+ Lakhs in legal costs 
                  and resolve disputes in weeks instead of years. Our mission remains clear: 
                  <strong> Justice that Works for Business.</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Team Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
              Our Leadership Team
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 8, opacity: 0.8 }}>
              Experienced leaders dedicated to revolutionizing business dispute resolution
            </Typography>
          </motion.div>
          
          <Grid container spacing={4} justifyContent="center">
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={5} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                    <CardContent>
                      <Typography variant="h2" sx={{ mb: 3 }}>
                        {member.image}
                      </Typography>
                      <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body1" color="primary.main" sx={{ fontWeight: 'medium', mb: 1 }}>
                        {member.role}
                      </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {member.specialization}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Values Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card sx={{ p: 4 }}>
            <CardContent>
              <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
                Our Values
              </Typography>
              <Typography variant="h6" textAlign="center" sx={{ mb: 8, opacity: 0.8 }}>
                The principles that guide everything we do
              </Typography>
              
              <Grid container spacing={4}>
                {values.map((value, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
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
                            mb: 3,
                          }}
                        >
                          {value.icon}
                        </Box>
                        <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                          {value.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {value.description}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </Container>

      {/* Contact Information Section */}
      <Box sx={{ bgcolor: (t) => (t.palette.mode === 'dark' ? 'background.default' : 'grey.50'), py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
              Contact Information
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 4, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                      📧 Email
                    </Typography>
                    <Typography variant="body1" color="primary.main" sx={{ mb: 2 }}>
                      <a href="mailto:info@arbitalk.com" style={{ textDecoration: 'none', color: 'inherit' }}>
                        info@arbitalk.com
                      </a>
                    </Typography>
                    <Typography variant="body1" color="primary.main">
                      <a href="mailto:support@arbitalk.com" style={{ textDecoration: 'none', color: 'inherit' }}>
                        support@arbitalk.com
                      </a>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 4, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                      📞 Phone
                    </Typography>
                    <Typography variant="body1" color="primary.main" sx={{ mb: 2 }}>
                      <a href="tel:+917990809141" style={{ textDecoration: 'none', color: 'inherit' }}>
                        +91 7990809141
                      </a>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card sx={{ p: 4 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                      📍 Address
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      11th Floor, The Citadel, Opp. Star Bazar, Adajan Gam, Surat - 395009
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
              Ready to Resolve?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.8 }}>
              Take the first step toward faster, stress-free dispute resolution.
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
              </Box>
              {/* Mobile: Vertical List */}
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 0.5 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Home</Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Services</Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>About</Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>Contact</Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: { xs: 3, md: 4 }, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
              © 2024 ARBITALK. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

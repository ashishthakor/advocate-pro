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
  Avatar,
  Stack,
  alpha,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  FamilyRestroom as FamilyIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';

export default function ServicesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();

  const services = [
    {
      title: 'Criminal Defense',
      description: 'Expert legal representation for criminal charges including DUI, theft, assault, and other criminal matters.',
      icon: <GavelIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Expert legal defense', 'Court representation', 'Case strategy development', 'Negotiation support']
    },
    {
      title: 'Civil Litigation',
      description: 'Comprehensive civil law services including contract disputes, personal injury, and business litigation.',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Contract disputes', 'Personal injury claims', 'Business litigation', 'Settlement negotiations']
    },
    {
      title: 'Family Law',
      description: 'Sensitive handling of family legal matters including divorce, child custody, and adoption cases.',
      icon: <FamilyIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Divorce proceedings', 'Child custody', 'Adoption services', 'Family mediation']
    },
    {
      title: 'Corporate Law',
      description: 'Business legal services including incorporation, contracts, compliance, and corporate governance.',
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Business formation', 'Contract drafting', 'Compliance guidance', 'Corporate governance']
    },
    {
      title: 'Property Law',
      description: 'Real estate legal services including property disputes, transactions, and land use matters.',
      icon: <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Property disputes', 'Real estate transactions', 'Land use issues', 'Property rights']
    },
    {
      title: 'Estate Planning',
      description: 'Comprehensive estate planning services including wills, trusts, and probate administration.',
      icon: <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      features: ['Will drafting', 'Trust creation', 'Probate administration', 'Estate planning']
    }
  ];

  const whyChooseUs = [
    {
      title: 'Proven Track Record',
      description: '95% success rate in case outcomes',
      icon: <CheckCircleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock legal assistance',
      icon: <SupportIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Confidential',
      description: 'Complete privacy and confidentiality',
      icon: <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
    },
    {
      title: 'Fast Response',
      description: 'Quick turnaround on all legal matters',
      icon: <SpeedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
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
            <Button color="primary" component={Link} href="/services">Services</Button>
            <Button color="inherit" component={Link} href="/about">About</Button>
            <Button color="inherit" component={Link} href="/contact">Contact</Button>
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
              sx={{ fontWeight: 'bold', mb: 3 }}
            >
              Legal Services
            </Typography>
            <Typography
              variant={isMobile ? 'h6' : 'h5'}
              textAlign="center"
              sx={{ opacity: 0.8, maxWidth: '800px', mx: 'auto' }}
            >
              Comprehensive legal services tailored to meet your specific needs. 
              Our experienced advocates provide expert representation across various areas of law.
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
              Why Choose Our Legal Services?
            </Typography>
            <Typography variant="h6" textAlign="center" sx={{ mb: 6, opacity: 0.8 }}>
              We combine decades of legal experience with modern technology to deliver exceptional results.
            </Typography>
          </motion.div>
          
          <Grid container spacing={4}>
            {whyChooseUs.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      height: '100%',
                      bgcolor: 'background.paper',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
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
                    <Typography variant="body2" color="text.secondary">
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
              Need Legal Assistance?
            </Typography>
            <Typography variant="h6" sx={{ mb: 6, opacity: 0.8 }}>
              Contact us today for a free consultation and let us help you with your legal needs.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
              <Button
                variant="contained"
                size="large"
                component={Link}
                href="/contact"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
              >
                Get Free Consultation
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                href="/auth/advocate-register"
                sx={{ py: 1.5, px: 4, fontSize: '1.1rem', borderRadius: 2 }}
              >
                Join as Advocate
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

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
    </Box>
  );
}

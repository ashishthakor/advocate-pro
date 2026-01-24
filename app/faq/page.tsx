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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme as useAppTheme } from '@/components/ThemeProvider';
import { useLanguage } from '@/components/LanguageProvider';
import LanguageSelector from '@/components/LanguageSelector';
import Logo from '@/components/Logo';
import { useAuth } from '@/components/AuthProvider';
import { Logout as LogoutIcon } from '@mui/icons-material';
import { FAQ_DATA, buildFAQSchema } from '@/lib/faq-data';

export default function FAQPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // FAQPage JSON-LD for search engines (translated Q&A)
  const faqPairs = FAQ_DATA.flatMap((c) => c.items).map((i) => ({ question: t(i.q), answer: t(i.a) }));
  const faqSchema = buildFAQSchema(
    typeof window !== 'undefined' ? window.location.origin : 'https://arbitalk.com',
    faqPairs
  );

  return (
    <Box>
      {/* JSON-LD FAQ schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Logo width={isMobile ? 120 : 140} height={isMobile ? 30 : 35} />
            </motion.div>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button color="inherit" component={Link} href="/" sx={{ fontSize: '0.9rem' }}>
              {t('nav.home')}
            </Button>
            <Button color="inherit" component={Link} href="/services" sx={{ fontSize: '0.9rem' }}>
              {t('common.services')}
            </Button>
            <Button color="inherit" component={Link} href="/about" sx={{ fontSize: '0.9rem' }}>
              {t('nav.about')}
            </Button>
            <Button color="inherit" component={Link} href="/contact" sx={{ fontSize: '0.9rem' }}>
              {t('nav.contact')}
            </Button>
            <Button color="primary" component={Link} href="/faq" sx={{ fontSize: '0.9rem' }}>
              {t('nav.faq')}
            </Button>
            <LanguageSelector />
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <IconButton onClick={toggleDarkMode} color="inherit" size="small">
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </motion.div>
            {isAuthenticated ? (
              <>
                <Button
                  color="primary"
                  component={Link}
                  href={
                    user?.role === 'admin'
                      ? '/admin/dashboard'
                      : user?.role === 'advocate'
                        ? '/advocate/dashboard'
                        : '/user/dashboard'
                  }
                  size="small"
                  sx={{ fontSize: '0.85rem', px: 1.5 }}
                >
                  {t('common.dashboard')}
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  href={
                    user?.role === 'admin'
                      ? '/admin/profile'
                      : user?.role === 'advocate'
                        ? '/advocate/profile'
                        : '/user/profile'
                  }
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
          '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' },
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
                href={
                  user?.role === 'admin'
                    ? '/admin/dashboard'
                    : user?.role === 'advocate'
                      ? '/advocate/dashboard'
                      : '/user/dashboard'
                }
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
                href={
                  user?.role === 'admin'
                    ? '/admin/profile'
                    : user?.role === 'advocate'
                      ? '/advocate/profile'
                      : '/user/profile'
                }
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

      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.default',
          color: 'text.primary',
          py: { xs: 6, md: 10 },
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
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
              variant={isMobile ? 'h4' : 'h3'}
              component="h1"
              textAlign="center"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              {t('faq.title')}
            </Typography>
            <Typography
              variant="body1"
              textAlign="center"
              sx={{ opacity: 0.9, maxWidth: 640, mx: 'auto' }}
            >
              {t('faq.subtitle')}
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* FAQ accordions by category */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          <Stack spacing={4}>
            {FAQ_DATA.map((category, catIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: catIndex * 0.05 }}
                viewport={{ once: true }}
              >
                <Typography
                  component="h2"
                  variant="h5"
                  sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}
                >
                  {t(category.titleKey)}
                </Typography>
                <Paper
                  elevation={0}
                  sx={{
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  {category.items.map((item, idx) => (
                    <Accordion
                      key={idx}
                      disableGutters
                      elevation={0}
                      sx={{
                        '&:before': { display: 'none' },
                        borderBottom:
                          idx < category.items.length - 1
                            ? (theme) => `1px solid ${theme.palette.divider}`
                            : 'none',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`faq-${category.id}-${idx}`}
                        id={`faq-${category.id}-${idx}-header`}
                        sx={{ px: 2, py: 1.5 }}
                      >
                        <Typography component="h3" variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {t(item.q)}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'pre-line' }}
                        >
                          {t(item.a)}
                        </Typography>
                        {/* Items with legalReview: true in lib/faq-data.ts are flagged for legal sign-off. */}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Paper>
              </motion.div>
            ))}
          </Stack>

          {/* CTA */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {t('faq.contactPrompt')}
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href="/contact"
              sx={{ borderRadius: 2 }}
            >
              {t('faq.contactCta')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          py: { xs: 3, md: 4 },
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 3, md: 4 },
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Logo width={isMobile ? 100 : 120} height={isMobile ? 25 : 30} />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                {t('footer.description')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }, opacity: 0.8 }}>
                {t('about.productOf')}
              </Typography>
            </Box>
            <Box>
              <Typography variant={isMobile ? 'subtitle1' : 'h6'} gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('footer.quickLinks')}
              </Typography>
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('nav.home')}
                </Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('common.services')}
                </Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('nav.about')}
                </Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('nav.contact')}
                </Button>
                <Button color="inherit" component={Link} href="/faq" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('nav.faq')}
                </Button>
                <Button color="inherit" component={Link} href="/privacy-policy" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  Privacy Policy
                </Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('home.termsConditions')}
                </Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.875rem' }}>
                  {t('home.fees')}
                </Button>
              </Box>
              <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 0.5 }}>
                <Button color="inherit" component={Link} href="/" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('nav.home')}
                </Button>
                <Button color="inherit" component={Link} href="/services" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('common.services')}
                </Button>
                <Button color="inherit" component={Link} href="/about" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('nav.about')}
                </Button>
                <Button color="inherit" component={Link} href="/contact" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('nav.contact')}
                </Button>
                <Button color="inherit" component={Link} href="/faq" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('nav.faq')}
                </Button>
                <Button color="inherit" component={Link} href="/privacy-policy" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  Privacy Policy
                </Button>
                <Button color="inherit" component={Link} href="/terms-conditions" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('home.termsConditions')}
                </Button>
                <Button color="inherit" component={Link} href="/fees" sx={{ justifyContent: 'flex-start', fontSize: '0.85rem', py: 0.5 }}>
                  {t('home.fees')}
                </Button>
              </Box>
            </Box>
          </Box>
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

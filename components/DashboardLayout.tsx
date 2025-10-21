'use client';

import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import AddBoxIcon from '@mui/icons-material/AddBox';
import Link from 'next/link';
import { useAuth } from 'components/AuthProvider';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useTheme as useAppTheme } from 'components/ThemeProvider';
import { useLanguage } from 'components/LanguageProvider';
import LanguageSelector from 'components/LanguageSelector';
import { alpha } from '@mui/material/styles';

const drawerWidth = 240;

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: 'admin' | 'advocate' | 'user';
  title?: string;
  subtitle?: string;
}

export default function DashboardLayout({ children, userType, title, subtitle }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useAppTheme();
  const { t } = useLanguage();

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const getNavItems = () => {
    switch (userType) {
      case 'admin':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
          { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Advocates', icon: <WorkIcon />, path: '/admin/advocates' },
          { text: 'Cases', icon: <FolderIcon />, path: '/admin/cases' },
          { text: 'Chat', icon: <WhatsAppIcon />, path: '/admin/chat' },
          { text: 'Assignments', icon: <AssignmentIcon />, path: '/admin/assignments' },
        ];
      case 'advocate':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/advocate/dashboard' },
          { text: 'Assigned Cases', icon: <FolderIcon />, path: '/advocate/cases' },
          { text: 'Clients', icon: <PeopleIcon />, path: '/advocate/clients' },
          { text: 'Chat', icon: <WhatsAppIcon />, path: '/advocate/chat' },
          { text: 'Profile', icon: <PersonIcon />, path: '/advocate/profile' },
        ];
      case 'user':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/user/dashboard' },
          { text: 'My Cases', icon: <FolderIcon />, path: '/user/cases' },
          { text: 'Create Case', icon: <AddBoxIcon />, path: '/user/create-case' },
          { text: 'Chat', icon: <WhatsAppIcon />, path: '/user/chat' },
          { text: 'Profile', icon: <PersonIcon />, path: '/user/profile' },
        ];
      default:
        return [];
    }
  };

  const drawer = (
    <div>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32 }}>A</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.1}>
              {userType.charAt(0).toUpperCase() + userType.slice(1)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Panel
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Box sx={{ px: 1.5, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1 }}>
          Navigation
        </Typography>
      </Box>
      <List sx={{ px: 1 }}>
        {getNavItems().map((item) => {
          const active = pathname?.startsWith(item.path);
          return (
            <ListItem key={item.text} disablePadding component={Link} href={item.path} sx={{ mb: 0.5 }}>
              <ListItemButton
                sx={{
                  borderRadius: 9999,
                  px: 1.25,
                  py: 1,
                  transition: 'background-color 180ms ease, box-shadow 180ms ease, transform 120ms ease',
                  bgcolor: (theme) => active ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12) : 'transparent',
                  color: (theme) => active ? theme.palette.primary.main : 'text.primary',
                  fontWeight: active ? 700 : 500,
                  boxShadow: (theme) => active ? (theme.palette.mode === 'dark' ? '0 4px 14px rgba(0,0,0,0.4)' : '0 4px 14px rgba(0,0,0,0.08)') : 'none',
                  '&:hover': (theme) => ({
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.18 : 0.08),
                    boxShadow: theme.palette.mode === 'dark' ? '0 6px 18px rgba(0,0,0,0.45)' : '0 6px 18px rgba(0,0,0,0.10)'
                  }),
                  '&:active': { transform: 'scale(0.995)' },
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ flex: 1 }} />
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Advo
        </Typography>
      </Box>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 1px 6px rgba(0,0,0,0.6)' : '0 1px 6px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap component="div">
              {title || `${userType.charAt(0).toUpperCase() + userType.slice(1)} Dashboard`}
            </Typography>
            {subtitle && (
              <Typography variant="subtitle2" noWrap component="div">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LanguageSelector />
            <Tooltip title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={user?.name || user?.email} src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu} component={Link} href={`/${userType}/profile`}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => { handleCloseUserMenu(); logout(); }}>
                <Typography textAlign="center">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRight: 0,
              boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 6px 16px rgba(0,0,0,0.6)' : '0 6px 16px rgba(0,0,0,0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${drawerWidth}px)`,
          mt: { xs: '56px', sm: '64px' },
          bgcolor: 'background.default',
          transition: 'background-color 200ms ease',
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, p: 3, }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
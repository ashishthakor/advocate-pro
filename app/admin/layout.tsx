'use client';

import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import DashboardLayout from 'components/DashboardLayout';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Admin Dashboard';
    if (pathname.includes('/users')) return 'Users';
    if (pathname.includes('/advocates')) return 'Advocates';
    if (pathname.includes('/cases')) return 'Cases';
    if (pathname.includes('/chat')) return 'Chats';
    if (pathname.includes('/assignments')) return 'Cases Assignments';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Admin Dashboard';
  };

  return (
    <Box >
      <CssBaseline />
      <DashboardLayout userType="admin" title={getPageTitle()}>
        {children}
      </DashboardLayout>
    </Box>
  );
}

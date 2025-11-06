'use client';

import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';
import { usePathname } from 'next/navigation';

export default function AdvocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Advocate Dashboard';
    if (pathname.includes('/cases')) return 'Assigned Cases';
    if (pathname.includes('/clients')) return 'Clients';
    if (pathname.includes('/chat')) return 'Chats';
    if (pathname.includes('/profile')) return 'Profile';
    return 'Advocate Dashboard';
  };

  return (
    <Box>
      <CssBaseline />
      <DashboardLayout userType="advocate" title={getPageTitle()}>
        {children}
      </DashboardLayout>
    </Box>
  );
}

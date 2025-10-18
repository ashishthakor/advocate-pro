'use client';

import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import DashboardLayout from '@/components/DashboardLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* <CssBaseline /> */}
      <DashboardLayout userType="admin">
        {children}
      </DashboardLayout>
    </Box>
  );
}

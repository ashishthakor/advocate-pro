'use client';

import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import DashboardLayout from 'components/DashboardLayout';

export default function AdvocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <DashboardLayout userType="advocate">
        {children}
      </DashboardLayout>
    </Box>
  );
}

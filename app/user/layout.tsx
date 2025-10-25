'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/cases')) return 'My Cases';
    if (pathname.includes('/chat')) return 'Cases Chat';
    if (pathname.includes('/create-case')) return 'Create New Case';
    if (pathname.includes('/arbitration-cases')) return 'Arbitration Cases';
    if (pathname.includes('/conciliation-cases')) return 'Conciliation Cases';
    if (pathname.includes('/billing')) return 'Billing';
    if (pathname.includes('/esign')) return 'eSign';
    if (pathname.includes('/downloads')) return 'My Downloads';
    if (pathname.includes('/documents')) return 'Documents';
    if (pathname.includes('/inbox')) return 'Inbox';
    return 'ARBITALK';
  };

  const getPageSubtitle = () => {
    // if (pathname.includes('/arbitration-cases')) return '12 Cases';
    // if (pathname.includes('/conciliation-cases')) return '26 Cases';
    // if (pathname.includes('/cases')) return '8 Cases';
    return undefined;
  };

  return (
    <DashboardLayout
      userType="user"
      title={getPageTitle()}
      subtitle={getPageSubtitle()}
    >
      {children}
    </DashboardLayout>
  );
}

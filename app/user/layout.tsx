'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/components/LanguageProvider';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const getPageTitle = () => {
    if (pathname.includes('/dashboard')) return t('layout.dashboard');
    if (pathname.includes('/cases')) return t('layout.myCases');
    if (pathname.includes('/chat')) return t('chat.title');
    if (pathname.includes('/create-case')) return t('createCase.title');
    if (pathname.includes('/arbitration-cases')) return t('layout.arbitrationCases');
    if (pathname.includes('/conciliation-cases')) return t('layout.conciliationCases');
    if (pathname.includes('/billing')) return t('layout.billing');
    if (pathname.includes('/esign')) return t('layout.eSign');
    if (pathname.includes('/downloads')) return t('layout.myDownloads');
    if (pathname.includes('/documents')) return t('layout.documents');
    if (pathname.includes('/inbox')) return t('layout.inbox');
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

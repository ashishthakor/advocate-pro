import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import LanguageUpdater from '@/components/LanguageUpdater';
import { AuthProvider } from '@/components/AuthProvider';
import ReduxProvider from '@/components/ReduxProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ClientPolyfill from '@/components/ClientPolyfill';
import { NotificationProvider } from '@/components/NotificationProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ARBITALK - Resolve Business Disputes faster | Arbitalk ADR Platform',
  description: 'ARBITALK is a leading ADR platform that provides a comprehensive suite of tools for resolving business disputes. We offer a range of services including mediation, arbitration, and expert determination.',
  keywords: 'ADR, ADR Platform, Mediation, Arbitration, Expert Determination, Business Disputes, Resolve Business Disputes faster',
  authors: [{ name: 'ARBITALK', url: 'https://arbitalk.com' }],
  creator: 'ARBITALK',
  publisher: 'ARBITALK',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  openGraph: {
    title: 'ARBITALK - Resolve Business Disputes faster | Arbitalk ADR Platform',
    description: 'ARBITALK is a leading ADR platform that provides a comprehensive suite of tools for resolving business disputes. We offer a range of services including mediation, arbitration, and expert determination.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARBITALK - Resolve Business Disputes faster | Arbitalk ADR Platform',
    description: 'ARBITALK is a leading ADR platform that provides a comprehensive suite of tools for resolving business disputes. We offer a range of services including mediation, arbitration, and expert determination.',
  },
  alternates: {
    canonical: 'https://arbitalk.com',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
      </head>
      <body className={inter.className}>
            <ErrorBoundary>
              <ClientPolyfill />
              <ThemeProvider>
                <LanguageProvider>
                  <LanguageUpdater />
                  <ReduxProvider>
                    <AuthProvider>
                      <NotificationProvider>
                        {children}
                      </NotificationProvider>
                    </AuthProvider>
                  </ReduxProvider>
                </LanguageProvider>
              </ThemeProvider>
            </ErrorBoundary>
      </body>
    </html>
  );
}

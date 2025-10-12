import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/ThemeProvider';
import { LanguageProvider } from '../components/LanguageProvider';
import { AuthProvider } from '../components/AuthProvider';
import { NotificationProvider } from '../components/NotificationProvider';
import ReduxProvider from '@/components/ReduxProvider';
import { ErrorBoundary } from '../components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ARBITALK - Advanced Arbitration & Legal Case Management',
  description: 'Revolutionizing arbitration and legal case management with AI-powered solutions. Connect clients, advocates, and administrators in one comprehensive platform.',
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
              <ThemeProvider>
                <LanguageProvider>
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

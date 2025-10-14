import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "components/ThemeProvider";
import { AuthProvider } from "components/AuthProvider";
import { Navbar } from "components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AdvocatePro - Professional Legal Management System",
  description:
    "Comprehensive legal practice management system for advocates to manage clients, cases, and legal documentation efficiently.",
  keywords:
    "legal management, advocate system, client management, case management, legal practice, law firm software",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
              <Toaster
                position="bottom-right" // This sets the position to the bottom-right
                toastOptions={{
                  className: "",
                  duration: 5000, // Duration for the toast
                  style: {
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    border: "1px solid hsl(var(--border))",
                  },
                }}
              />
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

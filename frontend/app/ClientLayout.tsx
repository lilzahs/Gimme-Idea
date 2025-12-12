'use client';

import { Inter, JetBrains_Mono, Space_Grotesk, Quantico } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '../components/WalletProvider';
import { AuthProvider } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { ConnectReminderModal } from '../components/ConnectReminderModal';
import { ConnectWalletPopup } from '../components/ConnectWalletPopup';
import { SubmissionModal } from '../components/SubmissionModal';
import ErrorBoundary from '../components/ErrorBoundary';
import Script from 'next/script';
import React from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const quantico = Quantico({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-quantico' });

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <body className={`${inter.variable} ${mono.variable} ${space.variable} ${quantico.variable} font-sans bg-background text-white min-h-screen selection:bg-accent selection:text-black`}>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-65VF8CLCR7"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-65VF8CLCR7');
        `}
      </Script>

      <ErrorBoundary>
        <WalletProvider>
          <AuthProvider>
            <Navbar />
            <ConnectReminderModal />
            <ConnectWalletPopup />
            <SubmissionModal />
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1A1A1A',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                },
              }}
            />
          </AuthProvider>
        </WalletProvider>
      </ErrorBoundary>
    </body>
  );
}

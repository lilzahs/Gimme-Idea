'use client';

import './globals.css';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from '../components/WalletProvider';
import Navbar from '../components/Navbar';
import { WalletModal } from '../components/WalletModal';
import { ConnectReminderModal } from '../components/ConnectReminderModal';
import { SubmissionModal } from '../components/SubmissionModal';
import React from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} ${space.variable} font-sans bg-background text-white min-h-screen selection:bg-accent selection:text-black`}>
        <WalletProvider>
          <Navbar />
          <WalletModal />
          <ConnectReminderModal />
          <SubmissionModal />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1A1A1A',
                color: '#fff',
                border: '1px solid #333',
              },
              success: {
                iconTheme: {
                  primary: '#14F195',
                  secondary: '#000',
                },
              },
            }}
          />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
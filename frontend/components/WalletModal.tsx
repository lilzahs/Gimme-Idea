
'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletAuth } from '../lib/useWalletAuth';
import toast from 'react-hot-toast';
import { LoadingLightbulb, LoadingStatus } from './LoadingLightbulb';

export const WalletModal = () => {
  const { isWalletModalOpen, closeWalletModal, setUser, setWalletConnected } = useAppStore();
  const { select, connect, wallets: availableWallets, wallet, connected, publicKey } = useWallet();
  const { login } = useWalletAuth();
  const [status, setStatus] = useState<LoadingStatus>('loading');
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isWalletModalOpen) {
        setIsProcessing(false);
        setStatus('loading');
    }
  }, [isWalletModalOpen]);

  if (!isWalletModalOpen) return null;

  const handleConnect = async (walletName: string) => {
    // Find the wallet adapter
    const selectedWallet = availableWallets.find(w =>
      w.adapter.name.toLowerCase().includes(walletName.toLowerCase())
    );

    if (!selectedWallet) {
      toast.error(`${walletName} wallet not found`);
      return;
    }

    console.log('Connecting to:', selectedWallet.adapter.name);
    console.log('ReadyState:', selectedWallet.adapter.readyState);
    console.log('Already connected?', connected);

    try {
      // Select wallet
      select(selectedWallet.adapter.name);

      // If not already connected, connect and wait for approval
      if (!connected) {
        console.log('Wallet not connected, initiating connection...');
        await connect();
      } else {
        console.log('Wallet already connected, skipping connect() call');
      }

      // Get publicKey directly from the adapter
      const connectedPublicKey = selectedWallet.adapter.publicKey || publicKey;

      if (!connectedPublicKey) {
        console.error('Wallet connected but publicKey is null');
        throw new Error('Connection failed - please try again');
      }

      console.log('✅ Wallet connected! PublicKey:', connectedPublicKey.toBase58());

      // If still not connected in hook state, wait a bit
      if (!connected) {
        console.log('Waiting for React hook state to update...');
        let attempts = 0;
        while (!connected && attempts < 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!connected) {
          console.warn('Hook connected state not updated, but adapter has publicKey. Proceeding anyway...');
        }
      }

      // Perform SIWS authentication
      console.log('Requesting authentication signature...');
      const userData = await login();
      console.log('✅ Login successful:', userData.user.username);

      // Update app store with real user data
      setUser(userData.user);
      setWalletConnected(true);

      // Show success toast and close modal
      toast.success(`Connected to ${walletName}`);
      closeWalletModal();

    } catch (error: any) {
      console.error('Wallet connection error:', error);

      // User-friendly error messages
      if (error.message?.includes('User rejected') || error.message?.includes('User canceled')) {
        toast.error('Connection cancelled by user');
      } else if (error.message?.includes('not connected') || error.message?.includes('does not support')) {
        // When wallet state is not ready, suggest clicking again
        toast.error('Almost there! Please click Connect again', {
          duration: 4000,
          icon: <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />,
        });
      } else if (error.message?.includes('timeout') || error.message?.includes('failed')) {
        toast.error('Connection timeout - please try again');
      } else {
        toast.error(error.message || "Failed to connect wallet");
      }
    }
  };

  const wallets = [
    {
        name: 'Phantom',
        icon: '/asset/phantom-logo.svg',
        // Purple Hover
        color: 'hover:bg-[#AB9FF2]/20 hover:border-[#AB9FF2]/50'
    },
    {
        name: 'Solflare',
        icon: '/asset/solflare-logo.png',
        // Bright Yellow/Gold Hover
        color: 'hover:bg-[#FFD700]/20 hover:border-[#FFD700]/50'
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isProcessing ? undefined : closeWalletModal}
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
      />
        
      {/* Modal */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-sm bg-[#0F0F0F] border border-white/10 rounded-3xl p-6 shadow-2xl shadow-purple-900/20 overflow-hidden min-h-[400px] flex flex-col"
      >
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-gold to-green-500" />
        
        {isProcessing ? (
          <div className="flex-grow flex flex-col items-center justify-center h-full min-h-[300px]">
            <LoadingLightbulb 
                text={status === 'loading' ? "Connecting Wallet..." : status === 'success' ? "Wallet Connected" : "Connection Failed"} 
                status={status}
            />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8 mt-2">
              <h2 className="text-2xl font-bold font-display">Connect Wallet</h2>
              <button onClick={closeWalletModal} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-grow">
                {wallets.map((wallet) => (
                    <button
                        key={wallet.name}
                        onClick={() => handleConnect(wallet.name)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 transition-all duration-300 group ${wallet.color}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center p-2.5 backdrop-blur-sm shadow-inner overflow-hidden">
                                <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-lg tracking-wide text-white group-hover:text-white/90">{wallet.name}</span>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full bg-gray-600 transition-all ${
                            wallet.name === 'Phantom' ? 'group-hover:bg-[#AB9FF2] group-hover:shadow-[0_0_10px_#AB9FF2]' :
                            wallet.name === 'Solflare' ? 'group-hover:bg-[#FFD700] group-hover:shadow-[0_0_10px_#FFD700]' :
                            'group-hover:bg-white group-hover:shadow-[0_0_10px_white]'
                        }`} />
                    </button>
                ))}
            </div>
            
            <div className="mt-8 text-center border-t border-white/5 pt-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                    By connecting a wallet, you agree to Gimme Idea's <br/>
                    <a href="#" className="text-gray-400 hover:text-white underline">Terms of Service</a> and <a href="#" className="text-gray-400 hover:text-white underline">Privacy Policy</a>.
                </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};


'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, X, ArrowRight, Lock, ShieldAlert, Copy, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Detect if running in wallet in-app browser
const isWalletBrowser = () => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes('phantom') ||
    ua.includes('solflare') ||
    ua.includes('backpack') ||
    ua.includes('glow') ||
    // Generic in-app browser detection
    (ua.includes('mobile') && (ua.includes('wv') || ua.includes('webview')))
  );
};

export const ConnectReminderModal = () => {
  const { isConnectReminderOpen, closeConnectReminder } = useAppStore();
  const { signInWithGoogle } = useAuth();
  const [inWalletBrowser, setInWalletBrowser] = useState(false);
  const [showWalletWarning, setShowWalletWarning] = useState(false);

  useEffect(() => {
    setInWalletBrowser(isWalletBrowser());
  }, []);

  if (!isConnectReminderOpen) return null;

  const handleSignIn = async () => {
    // If in wallet browser, show warning
    if (inWalletBrowser) {
      setShowWalletWarning(true);
      return;
    }

    closeConnectReminder();
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast.success('Link copied! Open in Safari or Chrome');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeConnectReminder}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative w-full max-w-md bg-[#0F0F0F] border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden"
      >
        {/* Glow Effects - GOLD THEMED */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Close Button */}
        <button 
            onClick={closeConnectReminder}
            className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors z-20 bg-white/5 rounded-full"
        >
            <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center">
            {/* Animated Icon */}
            <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-orange-500/20 rounded-full border border-white/5"
                />
                <div className="absolute inset-2 bg-[#1A1A1A] rounded-full border border-white/10 flex items-center justify-center shadow-inner">
                    <Lock className="w-10 h-10 text-gray-200" />
                </div>
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="absolute -bottom-1 -right-1 bg-black border-2 border-[#1A1A1A] p-2 rounded-full"
                >
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                </motion.div>
            </div>

            <h2 className="text-2xl font-display font-bold text-white mb-3">Sign In Required</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[280px]">
                You must sign in to post projects, ideas, or send donations.
            </p>

            <button 
                onClick={handleSignIn}
                className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-[#FDB931] rounded-xl font-bold text-black hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Sign in with Google <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
            </button>
            
            <button 
                onClick={closeConnectReminder}
                className="mt-5 text-sm text-gray-500 hover:text-gray-300 transition-colors font-medium"
            >
                Cancel
            </button>
        </div>
      </motion.div>

      {/* Wallet Browser Warning - Shown on top */}
      <AnimatePresence>
        {showWalletWarning && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center p-4"
          >
            <div 
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowWalletWarning(false)}
            />
            <div className="relative w-full max-w-sm bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <button
                onClick={() => setShowWalletWarning(false)}
                className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>

                <h3 className="text-base font-bold text-white mb-2">
                  Open in Browser
                </h3>
                
                <p className="text-gray-400 text-sm mb-5">
                  Google Sign-in doesn't work in wallet browsers. Open in <span className="text-white">Safari</span> or <span className="text-white">Chrome</span>.
                </p>

                <button
                  onClick={copyLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold rounded-xl transition-all mb-3"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>

                <p className="text-gray-500 text-xs">
                  Then paste in your browser
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { X, Copy, ExternalLink, AlertTriangle } from 'lucide-react';

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

export const LoginButton = () => {
  const { signInWithGoogle, isLoading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showWalletWarning, setShowWalletWarning] = useState(false);
  const [inWalletBrowser, setInWalletBrowser] = useState(false);

  useEffect(() => {
    setInWalletBrowser(isWalletBrowser());
  }, []);

  const handleLogin = async () => {
    // If in wallet browser, show warning modal
    if (inWalletBrowser) {
      setShowWalletWarning(true);
      return;
    }

    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Failed to sign in. Please try again.');
      setIsSigningIn(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    toast.success('Link copied! Open in Safari or Chrome');
  };

  const loading = isLoading || isSigningIn;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Sign in</span>
          </>
        )}
      </motion.button>

      {/* Wallet Browser Warning Modal */}
      <AnimatePresence>
        {showWalletWarning && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowWalletWarning(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#0F0F0F] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <button
                onClick={() => setShowWalletWarning(false)}
                className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-14 h-14 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-yellow-400" />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">
                  Open in Browser
                </h3>
                
                <p className="text-gray-400 text-sm mb-6">
                  Google Sign-in doesn't work in wallet browsers. Please open this link in <span className="text-white font-medium">Safari</span> or <span className="text-white font-medium">Chrome</span>.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={copyLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#FFD700] hover:bg-[#FFD700]/90 text-black font-bold rounded-xl transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  
                  <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <div className="flex-1 h-px bg-white/10" />
                    <span>then paste in browser</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-gray-400 text-xs text-left">
                      <span className="text-white font-medium">Steps:</span><br />
                      1. Tap "Copy Link" above<br />
                      2. Open Safari or Chrome<br />
                      3. Paste the link<br />
                      4. Sign in with Google
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

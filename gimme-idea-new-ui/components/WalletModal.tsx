
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Wallet } from 'lucide-react';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState<'select' | 'connecting' | 'success'>('select');

  const handleConnect = () => {
    setStep('connecting');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onConnect('7X...3k9z');
        onClose();
        setStep('select'); // Reset for next time
      }, 1500);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-brand-surface border border-brand-purple rounded-2xl shadow-2xl z-[70] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-space font-bold">Connect Wallet</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20}/></button>
              </div>

              {step === 'select' && (
                <div className="space-y-3">
                  {['Phantom', 'Solflare', 'Backpack'].map((name) => (
                    <button 
                      key={name}
                      onClick={handleConnect}
                      className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-brand-accent/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse" />
                        <span className="font-bold font-space">{name}</span>
                      </div>
                      <span className="text-xs text-gray-500 group-hover:text-brand-accent uppercase tracking-wider">Detected</span>
                    </button>
                  ))}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-gray-600 bg-transparent text-brand-accent focus:ring-0" defaultChecked />
                      Remember me
                    </label>
                    <a href="#" className="hover:text-brand-accent">Need help?</a>
                  </div>
                </div>
              )}

              {step === 'connecting' && (
                <div className="py-12 flex flex-col items-center text-center">
                   <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 border-4 border-brand-purple/30 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-brand-accent rounded-full border-t-transparent animate-spin"></div>
                   </div>
                   <h4 className="text-lg font-bold mb-2">Requesting Connection...</h4>
                   <p className="text-gray-400 text-sm">Please approve the request in your wallet.</p>
                </div>
              )}

              {step === 'success' && (
                 <div className="py-12 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-6"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>
                  <h4 className="text-lg font-bold mb-2">Connected!</h4>
                  <p className="text-gray-400 text-sm">Redirecting to dashboard...</p>
               </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

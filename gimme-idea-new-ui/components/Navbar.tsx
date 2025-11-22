
import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Menu, X, Zap, Bell, User } from 'lucide-react';
import { NavContext, ModalContext } from '../App';

export const Navbar: React.FC = () => {
  const { view, setView, wallet, toggleWalletModal, simulateNavigation } = useContext(NavContext);
  const { openModal } = useContext(ModalContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'explore', label: 'Explore' },
    { id: 'dashboard', label: 'Dashboard', protected: true },
    { id: 'upload', label: 'Submit Project', protected: true },
  ];

  const handleNavClick = (id: string) => {
      if (id === 'dashboard' || id === 'explore') {
          simulateNavigation(id);
      } else {
          setView(id);
      }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-6 left-0 right-0 z-50 mx-auto max-w-6xl px-4"
      >
        <div className="flex items-center justify-between rounded-full border border-white/10 px-6 py-3 backdrop-blur-xl bg-brand-black/80 shadow-[0_0_30px_-10px_rgba(255,216,180,0.1)]">
          
          {/* Logo */}
          <button onClick={() => simulateNavigation('landing')} className="flex items-center gap-2 font-space font-bold text-xl tracking-tight text-white">
            <Zap className="h-6 w-6 text-brand-accent fill-brand-accent" />
            GIMME<span className="text-brand-accent">IDEA</span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 font-inter">
            {navLinks.map(link => (
              (!link.protected || wallet) && (
                <button 
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`transition-colors ${view === link.id ? 'text-white' : 'hover:text-white'}`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {wallet ? (
              <>
                <button onClick={() => openModal('notification')} className="relative p-2 text-gray-400 hover:text-white">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button 
                  onClick={() => simulateNavigation('profile')}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 pr-4 pl-1 py-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                    DR
                  </div>
                  <span className="text-sm font-mono">{wallet}</span>
                </button>
              </>
            ) : (
              <button 
                onClick={toggleWalletModal}
                className="flex items-center gap-2 bg-brand-accent text-brand-black px-5 py-2 rounded-full font-bold text-sm hover:bg-white transition-all hover:scale-105 active:scale-95"
              >
                <Wallet size={16} />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-brand-black/95 backdrop-blur-lg pt-32 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-2xl font-space font-bold text-white">
              {navLinks.map(link => (
                <button 
                  key={link.id}
                  onClick={() => { handleNavClick(link.id); setIsMobileMenuOpen(false); }}
                  className="text-left"
                >
                  {link.label}
                </button>
              ))}
              {!wallet && (
                <button 
                  onClick={() => { toggleWalletModal(); setIsMobileMenuOpen(false); }}
                  className="mt-4 bg-brand-accent text-brand-black py-4 rounded-xl"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

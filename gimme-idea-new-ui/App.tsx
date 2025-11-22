
import React, { useState, createContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { NetworkBackground } from './components/NetworkBackground';
import { WalletModal } from './components/WalletModal';
import { LandingView } from './views/LandingView';
import { DashboardView } from './views/DashboardView';
import { UploadView } from './views/UploadView';
import { ExploreView } from './views/ExploreView';
import { ProjectDetailView } from './views/ProjectDetailView';
import { ProfileView } from './views/ProfileView';
import { Loader2 } from 'lucide-react';
import { ModalContextType, ModalType } from './types';
import { TipModal, ShareModal, ReportModal, TeamModal, NotificationModal, EditProfileModal, ClaimModal, FilterModal, LaunchSuccessModal } from './components/Modals';

// --- SVG Blobs for Background ---
const Blob = ({ className }: { className: string }) => (
  <div className={`absolute rounded-full mix-blend-screen filter blur-[80px] opacity-50 ${className}`} />
);

// Context Definition
interface NavContextType {
  view: string;
  setView: (v: string) => void;
  wallet: string | null;
  setWallet: (w: string | null) => void;
  toggleWalletModal: () => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  simulateNavigation: (targetView: string, projectId?: string) => void;
}

export const NavContext = createContext<NavContextType>({
  view: 'landing',
  setView: () => {},
  wallet: null,
  setWallet: () => {},
  toggleWalletModal: () => {},
  selectedProjectId: null,
  setSelectedProjectId: () => {},
  simulateNavigation: () => {},
});

export const ModalContext = createContext<ModalContextType>({
    isOpen: false,
    type: null,
    props: {},
    openModal: () => {},
    closeModal: () => {},
});

const GlobalTransition = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-brand-black flex flex-col items-center justify-center"
  >
    <div className="relative">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-24 h-24 rounded-full border-t-4 border-b-4 border-brand-accent"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="absolute inset-2 rounded-full border-l-4 border-r-4 border-purple-600"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
      </div>
    </div>
    <motion.h2
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="mt-8 text-xl font-space font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-500 uppercase tracking-[0.2em]"
    >
      Decrypting Data...
    </motion.h2>
    <div className="mt-2 font-mono text-xs text-gray-500">
      Fetching metadata from Solana Cluster
    </div>
  </motion.div>
);

function App() {
  const [view, setView] = useState('landing');
  const [wallet, setWallet] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState<ModalType | null>(null);
  const [modalProps, setModalProps] = useState<any>({});

  const handleOpenModal = (type: ModalType, props: any = {}) => {
      setModalType(type);
      setModalProps(props);
  };

  const handleCloseModal = () => {
      setModalType(null);
      setModalProps({});
  };

  const handleConnect = (address: string) => {
    setWallet(address);
    setView('dashboard');
  };

  const simulateNavigation = (targetView: string, projectId?: string) => {
    setIsLoading(true);
    if (projectId) setSelectedProjectId(projectId);
    
    setTimeout(() => {
      setView(targetView);
      setIsLoading(false);
    }, 1200); // 1.2s artificial delay for effect
  };

  return (
    <NavContext.Provider value={{ 
      view, 
      setView, 
      wallet, 
      setWallet, 
      toggleWalletModal: () => setIsWalletModalOpen(!isWalletModalOpen),
      selectedProjectId,
      setSelectedProjectId,
      simulateNavigation
    }}>
      <ModalContext.Provider value={{
          isOpen: !!modalType,
          type: modalType,
          props: modalProps,
          openModal: handleOpenModal,
          closeModal: handleCloseModal
      }}>
        <div className="min-h-screen bg-brand-black text-white selection:bg-brand-accent selection:text-brand-black overflow-x-hidden font-inter">
            
            <AnimatePresence>
            {isLoading && <GlobalTransition key="loader" />}
            </AnimatePresence>

            {/* Global Background */}
            <NetworkBackground />
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <Blob className="bg-purple-600 top-0 left-0 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            <Blob className="bg-brand-accent/30 bottom-0 right-0 w-[800px] h-[800px] translate-x-1/3 translate-y-1/3" />
            <Blob className="bg-indigo-600/40 top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 opacity-40" />
            </div>

            <Navbar />
            <WalletModal 
            isOpen={isWalletModalOpen} 
            onClose={() => setIsWalletModalOpen(false)} 
            onConnect={handleConnect} 
            />

            {/* GLOBAL MODALS */}
            <TipModal isOpen={modalType === 'tip'} onClose={handleCloseModal} props={modalProps} />
            <ShareModal isOpen={modalType === 'share'} onClose={handleCloseModal} props={modalProps} />
            <ReportModal isOpen={modalType === 'report'} onClose={handleCloseModal} props={modalProps} />
            <TeamModal isOpen={modalType === 'team'} onClose={handleCloseModal} props={modalProps} />
            <NotificationModal isOpen={modalType === 'notification'} onClose={handleCloseModal} props={modalProps} />
            <EditProfileModal isOpen={modalType === 'editProfile'} onClose={handleCloseModal} props={modalProps} />
            <ClaimModal isOpen={modalType === 'claim'} onClose={handleCloseModal} props={modalProps} />
            <FilterModal isOpen={modalType === 'filter'} onClose={handleCloseModal} props={modalProps} />
            <LaunchSuccessModal isOpen={modalType === 'launchSuccess'} onClose={handleCloseModal} props={modalProps} />

            <AnimatePresence mode='wait'>
            <motion.div
                key={view}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
            >
                {view === 'landing' && <LandingView />}
                {view === 'dashboard' && <DashboardView setView={setView} />}
                {view === 'upload' && <UploadView />}
                {view === 'explore' && <ExploreView />}
                {view === 'project' && <ProjectDetailView />}
                {view === 'profile' && <ProfileView />}
            </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <footer className="relative z-20 py-12 px-6 border-t border-white/5 bg-black/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-gray-500 text-sm">
                &copy; 2024 Gimme Idea. Built on Solana. Powered by Gemini.
                </div>
                <div className="flex gap-6 text-gray-400">
                <a href="#" className="hover:text-brand-accent transition-colors hover:drop-shadow-[0_0_8px_rgba(255,216,180,0.5)]">Twitter</a>
                <a href="#" className="hover:text-brand-accent transition-colors hover:drop-shadow-[0_0_8px_rgba(255,216,180,0.5)]">Discord</a>
                <a href="#" className="hover:text-brand-accent transition-colors hover:drop-shadow-[0_0_8px_rgba(255,216,180,0.5)]">Github</a>
                </div>
            </div>
            </footer>

        </div>
      </ModalContext.Provider>
    </NavContext.Provider>
  );
}

export default App;


import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, DollarSign, Share2, Flag, Users, Settings, Filter, CheckCircle, Copy, Download, AlertTriangle, Bell, Wallet } from 'lucide-react';
import { ModalContextType } from '../types';

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ isOpen, onClose, children, title, maxWidth = 'max-w-md' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full ${maxWidth} bg-brand-surface border border-brand-purple/30 rounded-2xl shadow-2xl z-[101] overflow-hidden flex flex-col max-h-[90vh]`}
          >
             {/* Header */}
             <div className="flex items-center justify-between p-6 border-b border-white/10 bg-brand-black/50">
                <h3 className="text-xl font-bold font-space text-white">{title}</h3>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
             </div>
             
             {/* Body */}
             <div className="p-6 overflow-y-auto custom-scrollbar">
                {children}
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- INDIVIDUAL MODALS ---

export const TipModal = ({ isOpen, onClose, props }: any) => {
    const [amount, setAmount] = useState('10');
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} title="Tip Developer">
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-accent">
                        <DollarSign size={32} />
                    </div>
                    <p className="text-gray-300">Support <span className="font-bold text-white">@{props.recipient || 'developer'}</span> with USDC</p>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                    {['5', '10', '25', '50', '100'].map(val => (
                        <button 
                            key={val} 
                            onClick={() => setAmount(val)}
                            className={`py-2 rounded-lg border font-mono font-bold transition-all ${amount === val ? 'bg-brand-accent text-brand-black border-brand-accent' : 'bg-transparent border-white/10 hover:border-brand-accent/50'}`}
                        >
                            ${val}
                        </button>
                    ))}
                    <div className="relative">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                         <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)}
                            className="w-full h-full bg-transparent border border-white/10 rounded-lg pl-6 pr-2 font-mono text-white focus:border-brand-accent outline-none text-center"
                         />
                    </div>
                </div>

                <textarea className="w-full bg-brand-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-brand-accent outline-none resize-none" placeholder="Add a nice message (optional)..." rows={3} />
                
                <button onClick={onClose} className="w-full py-3 bg-brand-accent text-brand-black font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2">
                    Confirm Transaction
                </button>
            </div>
        </ModalWrapper>
    );
};

export const ShareModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Share Project">
        <div className="space-y-6">
            <div className="relative h-40 rounded-xl bg-gradient-to-br from-brand-purple to-blue-900 overflow-hidden flex items-center justify-center border border-white/10">
                 <div className="text-center p-4">
                    <h4 className="font-bold text-xl font-space">Solana Orderbook V2</h4>
                    <p className="text-xs text-gray-300 mt-1">Check out this project on Gimme Idea!</p>
                 </div>
            </div>
            
            <div className="flex gap-3">
                 <button className="flex-1 py-2 bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/30 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1DA1F2]/30 transition-colors">
                    Twitter
                 </button>
                 <button className="flex-1 py-2 bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#5865F2]/30 transition-colors">
                    Discord
                 </button>
            </div>

            <div className="bg-brand-black border border-white/10 rounded-xl p-1 pl-4 flex items-center justify-between">
                <span className="text-sm text-gray-400 font-mono truncate">gimmeidea.xyz/p/sol-orderbook-v2</span>
                <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors">
                    <Copy size={16} />
                </button>
            </div>
        </div>
    </ModalWrapper>
);

export const ReportModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Report Content">
         <div className="space-y-4">
            <p className="text-sm text-gray-400">Help us keep the community clean. What's wrong with this content?</p>
            {['Spam or Advertising', 'Harassment or Hate Speech', 'Scam or Rugpull Risk', 'Low Quality / Irrelevant'].map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer">
                    <input type="radio" name="report_reason" className="text-brand-accent bg-transparent border-gray-600 focus:ring-brand-accent" />
                    <span className="text-sm font-medium">{reason}</span>
                </label>
            ))}
            <textarea className="w-full bg-brand-black border border-white/10 rounded-xl p-3 text-sm text-white focus:border-brand-accent outline-none resize-none" placeholder="Additional details..." rows={3} />
            <button onClick={onClose} className="w-full py-3 bg-red-500/20 text-red-500 border border-red-500/30 font-bold rounded-xl hover:bg-red-500/30 transition-colors">
                Submit Report
            </button>
         </div>
    </ModalWrapper>
);

export const TeamModal = ({ isOpen, onClose }: any) => (
     <ModalWrapper isOpen={isOpen} onClose={onClose} title="Manage Team">
        <div className="space-y-6">
             <div className="flex items-center gap-3">
                 <input type="text" placeholder="Wallet Address or Username" className="flex-1 bg-brand-black border border-white/10 rounded-xl p-3 text-sm outline-none focus:border-brand-accent" />
                 <button className="bg-brand-accent text-brand-black px-4 py-3 rounded-xl font-bold text-sm">Invite</button>
             </div>
             <div className="space-y-2">
                 <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Members</h4>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-xs">DR</div>
                         <div>
                             <div className="font-bold text-sm">Dev_Ronin</div>
                             <div className="text-xs text-gray-500">Owner</div>
                         </div>
                     </div>
                 </div>
                 <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                     <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xs">AX</div>
                         <div>
                             <div className="font-bold text-sm">Alice_X</div>
                             <div className="text-xs text-gray-500">Frontend</div>
                         </div>
                     </div>
                     <button className="text-red-500 text-xs hover:underline">Remove</button>
                 </div>
             </div>
        </div>
     </ModalWrapper>
);

export const NotificationModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Notifications" maxWidth="max-w-lg">
        <div className="space-y-1">
            <div className="p-4 bg-brand-accent/5 border-l-2 border-brand-accent hover:bg-white/5 cursor-pointer transition-colors">
                <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <DollarSign size={14} className="text-brand-accent"/>
                        <span className="font-bold text-sm text-white">Reward Received</span>
                    </div>
                    <span className="text-xs text-gray-500">2m ago</span>
                </div>
                <p className="text-sm text-gray-400">You received 50 USDC for your feedback on Project Alpha.</p>
            </div>
            {/* Mock Data Reduced */}
        </div>
        <div className="p-4 border-t border-white/10 text-center">
            <button className="text-sm text-gray-500 hover:text-white">Mark all as read</button>
        </div>
    </ModalWrapper>
);

export const EditProfileModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-2xl">
        <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Display Name</label>
                    <input type="text" defaultValue="Dev_Ronin" className="w-full bg-brand-black border border-white/10 rounded-xl p-3 text-white focus:border-brand-accent outline-none" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Bio</label>
                    <textarea defaultValue="Building on Solana since 2021. Fullstack Rust/React." className="w-full bg-brand-black border border-white/10 rounded-xl p-3 text-white focus:border-brand-accent outline-none h-32 resize-none" />
                </div>
            </div>
            <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Skills (Tags)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {['Rust', 'React', 'Solidity'].map(t => (
                            <span key={t} className="px-2 py-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs rounded flex items-center gap-1">
                                {t} <X size={10} className="cursor-pointer" />
                            </span>
                        ))}
                        <button className="px-2 py-1 bg-white/5 border border-white/10 text-gray-400 text-xs rounded hover:text-white">+</button>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Social Links</label>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-brand-black border border-white/10 rounded-xl px-3">
                            <Users size={16} className="text-gray-500" />
                            <input type="text" placeholder="Twitter Handle" className="flex-1 bg-transparent py-3 outline-none text-sm" />
                        </div>
                        <div className="flex items-center gap-2 bg-brand-black border border-white/10 rounded-xl px-3">
                            <Users size={16} className="text-gray-500" />
                            <input type="text" placeholder="GitHub Username" className="flex-1 bg-transparent py-3 outline-none text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5">Cancel</button>
            <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-brand-accent text-brand-black hover:bg-white">Save Changes</button>
        </div>
    </ModalWrapper>
);

export const ClaimModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Claim Rewards">
        <div className="text-center space-y-6 py-4">
             <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full animate-pulse"></div>
                 <div className="relative bg-brand-black border border-green-500/50 w-full h-full rounded-full flex items-center justify-center">
                    <DollarSign size={40} className="text-green-400" />
                 </div>
             </div>
             <div>
                <h2 className="text-3xl font-bold font-mono text-white">1,250.42 USDC</h2>
                <p className="text-gray-400">Available to claim</p>
             </div>
             
             <div className="bg-white/5 rounded-xl p-4 text-left space-y-3">
                 <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Network Fee</span>
                     <span className="text-white font-mono">0.00005 SOL</span>
                 </div>
                 <div className="flex justify-between text-sm">
                     <span className="text-gray-400">Estimated Time</span>
                     <span className="text-white font-mono">&lt; 15s</span>
                 </div>
             </div>

             <button onClick={onClose} className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-lg transition-colors shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                 Confirm Claim
             </button>
        </div>
    </ModalWrapper>
);

export const FilterModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Advanced Filters" maxWidth="max-w-lg">
        <div className="space-y-6">
            <div>
                <h4 className="font-bold text-sm mb-3">Development Stage</h4>
                <div className="grid grid-cols-2 gap-3">
                    {['Idea Phase', 'MVP / Alpha', 'Testnet Live', 'Mainnet'].map(s => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded bg-transparent border-gray-600 text-brand-accent focus:ring-0" />
                            <span className="text-sm text-gray-300">{s}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-bold text-sm mb-3">Bounty Range (USDC)</h4>
                <div className="flex items-center gap-4">
                    <input type="number" placeholder="Min" className="w-full bg-brand-black border border-white/10 rounded-xl p-3 outline-none text-sm" />
                    <span className="text-gray-500">-</span>
                    <input type="number" placeholder="Max" className="w-full bg-brand-black border border-white/10 rounded-xl p-3 outline-none text-sm" />
                </div>
            </div>
             <div>
                <h4 className="font-bold text-sm mb-3">Sort By</h4>
                 <select className="w-full bg-brand-black border border-white/10 rounded-xl p-3 outline-none text-sm text-white">
                     <option>Newest First</option>
                     <option>Most Active</option>
                     <option>Highest Bounty</option>
                 </select>
            </div>
            <div className="pt-4 flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:bg-white/5">Reset</button>
                <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold bg-brand-accent text-brand-black hover:bg-white">Apply Filters</button>
            </div>
        </div>
    </ModalWrapper>
);

export const LaunchSuccessModal = ({ isOpen, onClose }: any) => (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-md">
        <div className="text-center py-8 space-y-6">
            <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center mx-auto text-brand-black shadow-[0_0_40px_rgba(255,216,180,0.5)]"
            >
                <CheckCircle size={48} strokeWidth={3} />
            </motion.div>
            <div>
                <h2 className="text-3xl font-bold font-space mb-2">Project Launched!</h2>
                <p className="text-gray-400">Your project is now live. Get ready for feedback.</p>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-white/10 border border-white/10 rounded-xl font-bold hover:bg-white hover:text-black transition-colors">
                Go to Project Page
            </button>
        </div>
    </ModalWrapper>
);

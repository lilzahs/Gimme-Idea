
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Settings, Edit3, MapPin, Link as LinkIcon, Twitter, Github, Layers, Activity, CreditCard, ChevronRight, Star } from 'lucide-react';
import { NavContext, ModalContext } from '../App';

export const ProfileView: React.FC = () => {
  const { wallet, simulateNavigation } = useContext(NavContext);
  const { openModal } = useContext(ModalContext);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'activity' | 'wallet'>('portfolio');

  return (
    <div className="pb-20">
      {/* Header / Banner */}
      <div className="relative h-64 bg-brand-black border-b border-white/5">
         <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-brand-black"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
         
         {/* Profile Info Overlay */}
         <div className="max-w-7xl mx-auto px-6 h-full flex items-end pb-8 relative">
            <div className="flex flex-col md:flex-row items-end md:items-center gap-8 w-full">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-brand-accent to-purple-600 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                            <span className="text-4xl font-bold">DR</span>
                        </div>
                    </div>
                    <button onClick={() => openModal('editProfile')} className="absolute bottom-0 right-0 p-2 bg-brand-surface border border-white/10 rounded-full text-white hover:text-brand-accent transition-colors shadow-lg">
                        <Edit3 size={14} />
                    </button>
                </div>

                <div className="flex-1 mb-2">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-bold font-space text-white">Dev_Ronin</h1>
                        <span className="px-2 py-1 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-mono rounded">LVL 42 BUILDER</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm font-inter">
                        <span className="flex items-center gap-1"><MapPin size={14}/> Metaverse</span>
                        <span className="flex items-center gap-1"><LinkIcon size={14}/> solana.com/dev</span>
                        <span className="flex items-center gap-1 font-mono text-gray-500">{wallet || '0x7X...3k9z'}</span>
                    </div>
                </div>

                <div className="flex gap-3 mb-2">
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <Twitter size={16} />
                    </button>
                    <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <Github size={16} />
                    </button>
                    <button onClick={() => openModal('editProfile')} className="px-4 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 hover:text-brand-accent">
                        <Settings size={16} /> Edit Profile
                    </button>
                </div>
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Stats */}
        <div className="space-y-6">
            <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6">Reputation Stats</h3>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Feedback Quality</span>
                            <span className="text-brand-accent font-bold">9.8/10</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-brand-accent to-purple-500 w-[98%]"></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-300">Helpful Votes</span>
                            <span className="text-white font-bold">482</span>
                        </div>
                         <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 w-[75%]"></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">12</div>
                        <div className="text-[10px] text-gray-500 uppercase">Projects</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-400">$4.2k</div>
                        <div className="text-[10px] text-gray-500 uppercase">Earned</div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Badges</h3>
                <div className="flex flex-wrap gap-2">
                    {[1,2].map(i => (
                         <div key={i} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-brand-accent hover:bg-brand-accent/10 transition-colors cursor-pointer" title="Early Adopter">
                            <Star size={18} fill={i === 1 ? "#ffd8b4" : "none"} />
                         </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-3">
            
            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-white/10 mb-8">
                <button 
                    onClick={() => setActiveTab('portfolio')}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'portfolio' ? 'border-brand-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <Layers size={16} /> Portfolio
                </button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'activity' ? 'border-brand-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <Activity size={16} /> Activity
                </button>
                <button 
                    onClick={() => setActiveTab('wallet')}
                    className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'wallet' ? 'border-brand-accent text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    <CreditCard size={16} /> Wallet
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'portfolio' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
                        {/* Mock Data: Single Item */}
                        {[1].map(i => (
                             <div 
                                key={i} 
                                className="group bg-brand-surface border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-brand-accent/30 transition-all"
                                onClick={() => simulateNavigation('project', `my_proj_${i}`)}
                            >
                                <div className="h-40 bg-gray-800 relative">
                                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/60 rounded text-xs font-bold backdrop-blur-sm">Active</div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg font-space mb-2 group-hover:text-brand-accent transition-colors">Solana DeFi Protocol</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">Revolutionizing the way we trade on-chain assets with zero slippage...</p>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Last updated 2d ago</span>
                                        <span className="text-brand-accent">12 Feedback</span>
                                    </div>
                                </div>
                             </div>
                        ))}
                        <button 
                            onClick={() => simulateNavigation('upload')}
                            className="border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4 text-gray-500 hover:text-white hover:border-brand-accent/50 hover:bg-white/5 transition-all h-full min-h-[250px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                <Edit3 />
                            </div>
                            <span className="font-bold">Create New Project</span>
                        </button>
                    </motion.div>
                )}

                {activeTab === 'activity' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                        {/* Mock Data: Single Item */}
                        {[1].map(i => (
                            <div key={i} className="flex gap-4 pb-6 border-b border-white/5 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-accent border border-white/10">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Commented on <span className="text-white font-bold cursor-pointer hover:underline">Supernova DEX</span>
                                    </p>
                                    <div className="bg-brand-black border border-white/10 rounded-lg p-3 text-sm text-gray-400 italic">
                                        "Great work on the CPI integration, but have you checked the rent exemption?"
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">2 hours ago</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'wallet' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div className="bg-gradient-to-r from-purple-900/50 to-brand-surface border border-white/10 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                             <div>
                                <div className="text-sm text-gray-400 mb-1">Available Balance</div>
                                <div className="text-4xl font-bold font-mono text-white">1,250.42 <span className="text-brand-accent">USDC</span></div>
                             </div>
                             <div className="flex gap-3">
                                <button onClick={() => openModal('claim')} className="px-6 py-3 bg-brand-accent text-brand-black font-bold rounded-xl hover:bg-white transition-colors">Claim Rewards</button>
                                <button className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">History</button>
                             </div>
                        </div>

                        <div>
                            <h3 className="font-bold font-space mb-4">Recent Transactions</h3>
                            <div className="space-y-2">
                                {/* Mock Data: Single Item */}
                                {[1].map(i => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-brand-surface border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                                                <ChevronRight size={16} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">Feedback Bounty</div>
                                                <div className="text-xs text-gray-500">Project Alpha</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-mono text-green-400 font-bold">+50.00 USDC</div>
                                            <div className="text-xs text-gray-500">2 mins ago</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

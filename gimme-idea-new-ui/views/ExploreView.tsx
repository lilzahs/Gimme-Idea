
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MessageSquare, ThumbsUp } from 'lucide-react';
import { ModalContext } from '../App';

export const ExploreView: React.FC = () => {
  const { openModal } = useContext(ModalContext);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h1 className="text-4xl font-bold font-space">Explore</h1>
        
        <div className="flex gap-4 w-full md:w-auto">
           <div className="relative flex-1 md:w-80">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
             <input 
               type="text" 
               placeholder="Search projects, stacks, ideas..." 
               className="w-full bg-brand-surface border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm focus:border-brand-accent outline-none"
             />
           </div>
           <button onClick={() => openModal('filter')} className="p-3 bg-brand-surface border border-white/10 rounded-full hover:bg-white/5">
             <Filter size={20} />
           </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-3 overflow-x-auto pb-8 no-scrollbar">
        {['All', 'DeFi', 'Gaming', 'NFT', 'Infrastructure', 'DAO', 'Mobile'].map((cat, i) => (
          <button key={cat} className={`px-5 py-2 rounded-full text-sm font-bold border whitespace-nowrap ${i === 0 ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-gray-400 hover:border-white/30'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock Data: Single Item */}
        {[1].map((i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="group bg-brand-surface border border-white/5 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(255,216,180,0.15)] transition-all"
          >
            <div className="h-48 bg-gray-800 relative overflow-hidden">
               {/* Placeholder image effect */}
               <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/50 to-blue-900/50 group-hover:scale-110 transition-transform duration-500"></div>
               <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10">
                 In Progress
               </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold font-space">Project Alpha</h3>
                <span className="text-brand-accent font-mono text-xs">+450 USDC</span>
              </div>
              <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                Building the future of decentralized identity on Solana using compressed NFTs and zk-proofs.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 border-t border-white/5 pt-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 hover:text-white transition-colors"><MessageSquare size={16} /> 12</span>
                  <span className="flex items-center gap-1 hover:text-white transition-colors"><ThumbsUp size={16} /> 48</span>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(u => (
                    <div key={u} className="w-6 h-6 rounded-full bg-gray-700 border-2 border-brand-surface"></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

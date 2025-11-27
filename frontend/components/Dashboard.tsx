
'use client';

import { useState, useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
import { RecommendedIdeas } from './RecommendedIdeas';
import { useAppStore } from '../lib/store';
import { useRouter } from 'next/navigation';
import { Filter, Plus, TrendingUp, Activity, X, Lightbulb, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeProjects } from '../hooks/useRealtimeProjects';
import { ComingSoonModal } from './ComingSoonModal';

interface DashboardProps {
    mode: 'project' | 'idea';
}

export default function Dashboard({ mode }: DashboardProps) {
  const {
    projects,
    searchQuery,
    setSearchQuery,
    openSubmitModal,
    fetchProjects,
    isLoading,
    handleRealtimeNewProject,
    handleRealtimeUpdateProject,
    handleRealtimeDeleteProject,
  } = useAppStore();
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Show coming soon modal for projects mode
  useEffect(() => {
    if (mode === 'project') {
      setShowComingSoon(true);
    }
  }, [mode]);

  // Fetch projects on mount (skip for project mode)
  useEffect(() => {
    if (mode !== 'project') {
      fetchProjects({ type: mode });
    }
  }, [mode, fetchProjects]);

  // Subscribe to realtime project updates
  useRealtimeProjects({
    onNewProject: handleRealtimeNewProject,
    onUpdateProject: handleRealtimeUpdateProject,
    onDeleteProject: handleRealtimeDeleteProject,
  });

  const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'DAO', 'DePIN', 'Social', 'Mobile', 'Security', 'Payment', 'Developer Tooling', 'ReFi', 'Content', 'Dapp', 'Blinks'];

  // Filter logic
  const filteredProjects = projects.filter(project => {
    const matchesType = project.type === mode;
    const matchesCategory = categoryFilter === 'All' ||
      project.category === categoryFilter ||
      project.tags.some(tag => tag === categoryFilter);
    const matchesSearch = searchQuery === '' ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesCategory && matchesSearch;
  });

  const accentColor = mode === 'project' ? '#9945FF' : '#FFD700';
  const accentText = mode === 'project' ? 'text-[#9945FF]' : 'text-[#FFD700]';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-20 relative"
    >
      {/* Premium Dark-Medium Background with Artistic Depth */}
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#14161F]">
          {/* Base gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A1C27] via-[#14161F] to-[#1A1710] opacity-80" />

          {/* Large luminous orbs for depth (6-10% opacity) */}
          <div className={`absolute top-[10%] left-[5%] w-[900px] h-[900px] ${mode === 'project' ? 'bg-purple-400' : 'bg-yellow-400'} opacity-[0.08] rounded-full blur-[160px]`} />
          <div className="absolute bottom-[15%] right-[8%] w-[800px] h-[800px] bg-blue-400 opacity-[0.06] rounded-full blur-[150px]" />
          <div className={`absolute top-[45%] right-[12%] w-[700px] h-[700px] ${mode === 'project' ? 'bg-indigo-400' : 'bg-amber-400'} opacity-[0.07] rounded-full blur-[140px]`} />
          <div className="absolute bottom-[40%] left-[20%] w-[600px] h-[600px] bg-purple-300 opacity-[0.05] rounded-full blur-[120px]" />

          {/* Subtle geometric lines */}
          <div className="absolute inset-0 opacity-[0.03]">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Tech pattern - circuit-like lines */}
          <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] opacity-[0.04]">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <circle cx="200" cy="200" r="150" fill="none" stroke="rgba(255,215,0,0.3)" strokeWidth="1" />
              <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(138,43,226,0.2)" strokeWidth="0.5" />
              <line x1="50" y1="200" x2="350" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
              <line x1="200" y1="50" x2="200" y2="350" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Hologram rings */}
          <div className="absolute bottom-[25%] left-[10%] w-[500px] h-[500px] opacity-[0.03]">
            <svg viewBox="0 0 500 500" className="w-full h-full">
              <circle cx="250" cy="250" r="200" fill="none" stroke="rgba(100,149,237,0.3)" strokeWidth="1" strokeDasharray="10,5" />
              <circle cx="250" cy="250" r="160" fill="none" stroke="rgba(138,43,226,0.2)" strokeWidth="0.8" strokeDasharray="8,4" />
            </svg>
          </div>

          {/* Crystal dust shimmer particles */}
          <div className="absolute inset-0 opacity-[0.15]">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.3,
                  animation: `twinkle ${3 + Math.random() * 4}s infinite ${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Subtle grain texture overlay */}
          <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}
          />
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }
      `}</style>

      <div className="pt-32 px-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2 tracking-tight">
              Explore <span className={`text-transparent bg-clip-text bg-gradient-to-r ${mode === 'project' ? 'from-[#9945FF] to-[#7c3aed]' : 'from-[#FFD700] to-[#FDB931]'}`}>
                {mode === 'project' ? 'Projects' : 'Ideas'}
              </span>
            </h1>
            <p className="text-gray-300">
                {mode === 'project' 
                    ? "Discover live protocols and beta dApps." 
                    : "Raw concepts seeking feedback and co-founders."}
            </p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
             <button 
               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
               className={`px-4 py-2 border rounded-full text-sm font-mono transition-colors flex items-center gap-2 backdrop-blur-md ${showAdvancedFilters ? 'bg-white text-black border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
             >
               <Filter className="w-4 h-4" /> {showAdvancedFilters ? 'Hide Filters' : 'Filter'}
             </button>
             <button 
               onClick={() => openSubmitModal(mode)}
               className={`px-6 py-2 bg-gradient-to-r ${mode === 'project' ? 'from-[#9945FF] to-[#8035e0] text-white' : 'from-[#FFD700] to-[#FDB931] text-black'} rounded-full text-sm font-bold hover:shadow-lg transition-all flex items-center gap-2`}
             >
               {mode === 'project' ? <Rocket className="w-4 h-4" /> : <Lightbulb className="w-4 h-4" />}
               Submit {mode === 'project' ? 'Project' : 'Idea'}
             </button>
          </div>
        </div>

        {/* Recommended Ideas Section (only for ideas mode) */}
        {mode === 'idea' && !searchQuery && (
          <RecommendedIdeas />
        )}

        {/* Search & Categories */}
        {searchQuery && (
            <div className="mb-6 flex items-center gap-2">
                <span className="text-gray-400">Search results for:</span>
                <span className="text-white font-bold">"{searchQuery}"</span>
                <button onClick={() => setSearchQuery('')} className="ml-2 p-1 hover:bg-white/10 rounded-full"><X className="w-4 h-4" /></button>
            </div>
        )}

        <div className="flex overflow-x-auto gap-2 mb-10 pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm whitespace-nowrap border transition-all duration-300 ${
                categoryFilter === cat 
                  ? 'bg-white text-black border-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'bg-white/10 text-gray-300 border-white/10 hover:border-white/30 hover:bg-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full mb-4"
            />
            <p className="text-gray-400 animate-pulse">Loading {mode}s...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.03,
                    ease: "easeOut"
                  }}
                >
                  <ProjectCard project={project} />
                </motion.div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
               <div className="text-center py-32 bg-white/[0.02] rounded-3xl border border-white/5 mt-8">
                 <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Filter className="w-8 h-8 text-gray-500" />
                 </div>
                 <p className="text-gray-400 text-lg mb-2">No {mode}s found.</p>
                 <button
                    onClick={() => { setCategoryFilter('All'); setSearchQuery(''); }}
                    className={`${accentText} hover:text-white underline underline-offset-4 transition-colors`}
                 >
                    Clear all filters
                 </button>
               </div>
            )}
          </>
        )}
      </div>

      {/* Coming Soon Modal for Projects */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => {
          setShowComingSoon(false);
          router.push('/idea');
        }}
      />
    </motion.div>
  );
}

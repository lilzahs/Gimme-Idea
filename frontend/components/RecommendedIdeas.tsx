'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ChevronDown } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { Project } from '../lib/types';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const categories = ['All', 'DeFi', 'NFT', 'Gaming', 'Infrastructure', 'DAO', 'DePIN', 'Social', 'Mobile', 'Security', 'Payment', 'Developer Tooling', 'ReFi', 'Content', 'Dapp', 'Blinks'];

export const RecommendedIdeas = () => {
  const [recommendedIdeas, setRecommendedIdeas] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommended = async () => {
      setIsLoading(true);
      try {
        let url = `${API_URL}/projects?type=idea&sortBy=aiScore&sortOrder=desc&limit=3`;
        if (selectedCategory !== 'All') {
          url += `&category=${selectedCategory}`;
        }
        const response = await axios.get(url);
        if (response.data.success) {
          setRecommendedIdeas(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch recommended ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommended();
  }, [selectedCategory]);

  const handleViewIdea = (id: string) => {
    router.push(`/idea/${id}`);
  };

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-[#FFD700] animate-pulse" />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-transparent bg-clip-text">
            Top 3 of {selectedCategory}
          </h2>
          <TrendingUp className="w-5 h-5 text-[#FFD700]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse">
              <div className="h-6 bg-white/10 rounded mb-4" />
              <div className="h-4 bg-white/10 rounded mb-2" />
              <div className="h-4 bg-white/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendedIdeas.length === 0) {
    return null;
  }

  const medals = [
    { emoji: '🥇', label: 'Top Pick', watermark: '1' },
    { emoji: '🥈', label: '2nd Best', watermark: '2' },
    { emoji: '🥉', label: '3rd Best', watermark: '3' },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Sparkles className="w-6 h-6 text-[#FFD700] animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-transparent bg-clip-text">
          Top 3 of
        </h2>

        {/* Category Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black rounded-full font-bold text-lg hover:shadow-lg transition-all"
          >
            {selectedCategory}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showCategoryMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 left-0 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[200px] max-h-[400px] overflow-y-auto"
            >
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowCategoryMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-white/10 transition-colors ${
                    selectedCategory === cat ? 'bg-[#FFD700]/20 text-[#FFD700] font-bold' : 'text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        <TrendingUp className="w-5 h-5 text-[#FFD700]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {recommendedIdeas.map((idea, index) => (
          <motion.div
            key={idea.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.25, ease: "easeOut" }}
            onClick={() => handleViewIdea(idea.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative p-6 rounded-2xl transition-all duration-200 cursor-pointer group border border-[#FFD700]/10 bg-gradient-to-br from-[#FFD700]/[0.03] to-transparent hover:shadow-[0_8px_40px_rgba(255,215,0,0.12)] min-h-[320px] flex flex-col overflow-hidden"
          >
            {/* Faded Watermark Number */}
            <div className="absolute top-6 right-6 text-[120px] font-black text-[#FFD700]/[0.03] leading-none pointer-events-none select-none">
              {medals[index].watermark}
            </div>

            {/* Premium Medal Badge */}
            <div className="relative z-10 flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{medals[index].emoji}</span>
                <div>
                  <div className="text-xs font-mono text-[#FFD700]/60 uppercase tracking-wider">AI Recommended</div>
                  <div className="text-sm font-bold text-[#FFD700]">{medals[index].label}</div>
                </div>
              </div>
            </div>

            {/* Large Title */}
            <h3 className="relative z-10 text-2xl font-bold text-white mb-4 line-clamp-2 group-hover:text-[#FFD700] transition-colors duration-200">
              {idea.title}
            </h3>

            {/* Problem Preview */}
            <p className="relative z-10 text-sm text-gray-400 line-clamp-3 mb-5 flex-grow">
              {idea.problem}
            </p>

            {/* Footer Stats */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-[#FFD700]/10 mt-auto">
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2 py-1 bg-[#FFD700]/10 text-[#FFD700] rounded-full font-mono text-[10px]">
                  {idea.category}
                </span>
                <span className="text-gray-500">💬 {idea.feedbackCount || 0}</span>
                <span className="text-gray-500">👍 {idea.votes || 0}</span>
              </div>
              {idea.author && !idea.isAnonymous && (
                <span className="text-xs text-gray-600 font-mono">
                  @{idea.author.username}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-12 border-t border-white/10" />
    </div>
  );
};

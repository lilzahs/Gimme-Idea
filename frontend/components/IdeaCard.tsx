'use client';

import React, { useState } from 'react';
import { Project } from '../lib/types';
import { MessageSquare, ThumbsUp, Lightbulb, ExternalLink } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthorLink } from './AuthorLink';
import { createUniqueSlug } from '../lib/slug-utils';

interface IdeaCardProps {
  project: Project;
}

export const IdeaCard: React.FC<IdeaCardProps> = ({ project }) => {
  const { voteProject } = useAppStore();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLiked) {
      try {
        await voteProject(project.id);
        setIsLiked(true);
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 800);
        toast.success(`Supported ${project.title}`);
      } catch (error) {
        toast.error('Failed to vote');
      }
    }
  };

  const handleCardClick = () => {
    const slug = createUniqueSlug(project.title, project.id);
    router.push(`/idea/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Card - Like Partner Card */}
      <div 
        className="relative px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-sm transition-all duration-300 cursor-pointer flex items-center gap-3"
        style={{
          borderColor: isHovered ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)',
        }}
        onClick={handleCardClick}
      >
        {/* Icon */}
        <div 
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 flex-shrink-0 bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/10 border border-[#FFD700]/20"
        >
          <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700]" />
        </div>
        
        {/* Title */}
        <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 flex-1">{project.title}</h3>
        
        {/* Stats */}
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-1">
            <ThumbsUp className="w-3 h-3" />
            {project.votes || 0}
          </span>
        </div>
      </div>

      {/* Hover Popup with Partner-style Glitch Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 left-0 right-0 bottom-full mb-3 w-full pointer-events-none"
          >
            <motion.div 
              className="relative p-5 rounded-xl border border-[#FFD700]/30 bg-[#0a0a10]/98 backdrop-blur-xl shadow-2xl overflow-hidden"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(255, 215, 0, 0.2), 0 0 40px rgba(153, 69, 255, 0.1)',
                  '0 0 30px rgba(255, 215, 0, 0.3), 0 0 50px rgba(153, 69, 255, 0.2)',
                  '0 0 20px rgba(255, 215, 0, 0.2), 0 0 40px rgba(153, 69, 255, 0.1)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Animated scanline */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,215,0,0.02)_2px,rgba(255,215,0,0.02)_4px)]" />
                <motion.div 
                  className="absolute left-0 right-0 h-20 bg-gradient-to-b from-[#FFD700]/10 to-transparent"
                  animate={{ top: ['-80px', '100%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              
              {/* Glitch border effects - Yellow & Purple */}
              <div className="absolute inset-0 rounded-xl">
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"
                  animate={{ opacity: [0.5, 1, 0.5], x: [-5, 5, -5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#9945FF] to-transparent"
                  animate={{ opacity: [0.5, 1, 0.5], x: [5, -5, 5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                />
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-gradient-to-b from-[#FFD700] via-transparent to-[#9945FF] opacity-50" />
                <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-gradient-to-b from-[#9945FF] via-transparent to-[#FFD700] opacity-50" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header with icon */}
                <div className="flex items-center gap-3 mb-4">
                  <motion.div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-[#FFD700]/30 bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/10"
                    animate={{
                      boxShadow: [
                        '0 0 10px rgba(255, 215, 0, 0.3)',
                        '0 0 20px rgba(255, 215, 0, 0.5)',
                        '0 0 10px rgba(255, 215, 0, 0.3)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Lightbulb className="w-6 h-6 text-[#FFD700]" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    {/* Glitch Title */}
                    <motion.h4 
                      className="font-bold text-base text-[#FFD700] line-clamp-1"
                      animate={{
                        textShadow: [
                          '0 0 10px rgba(255, 215, 0, 0.8)',
                          '-2px 0 rgba(153, 69, 255, 0.8), 2px 0 rgba(255, 215, 0, 0.8)',
                          '2px 0 rgba(153, 69, 255, 0.8), -2px 0 rgba(255, 215, 0, 0.8)',
                          '0 0 10px rgba(255, 215, 0, 0.8)',
                        ],
                      }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    >
                      {project.title}
                    </motion.h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#FFD700]/70 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-[#FFD700]/10 rounded text-[9px] uppercase font-mono">
                        {project.category || 'Idea'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <motion.p 
                  className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3"
                  animate={{
                    x: [0, -1, 1, 0],
                    opacity: [1, 0.95, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {project.description || 'No description available'}
                </motion.p>
                
                {/* Stats Footer */}
                <div className="pt-3 border-t border-[#FFD700]/20 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{project.votes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{project.feedbackCount || 0}</span>
                    </div>
                  </div>
                  <AuthorLink
                    username={project.author?.username || 'Anonymous'}
                    avatar={project.author?.avatar}
                    isAnonymous={project.isAnonymous || !project.author}
                    showAvatar={false}
                    className="text-xs text-gray-500 font-mono hover:text-white transition-colors"
                  />
                </div>

                {/* Terminal style hint */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  <motion.span 
                    className="text-[#FFD700] font-mono font-bold"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    {'>'}
                  </motion.span>
                  <motion.span 
                    className="text-[#FFD700]/70 font-mono tracking-wider"
                    animate={{ 
                      opacity: [0.7, 1, 0.7],
                      textShadow: [
                        'none',
                        '0 0 5px rgba(255, 215, 0, 0.5)',
                        'none',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    CLICK_TO_VIEW
                  </motion.span>
                  <motion.span 
                    className="text-[#9945FF] font-mono ml-auto"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    █
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

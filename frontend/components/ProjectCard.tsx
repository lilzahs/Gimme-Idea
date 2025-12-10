'use client';

import React, { useState } from 'react';
import { Project } from '../lib/types';
import { MessageSquare, ThumbsUp, Lightbulb, Rocket, Sparkles } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { createUniqueSlug } from '../lib/slug-utils';
import { AuthorLink } from './AuthorLink';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { voteProject } = useAppStore();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const isIdea = project.type === 'idea';

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
    const route = isIdea ? `/idea/${slug}` : `/projects/${slug}`;
    router.push(route);
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="relative rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full group bg-[#14151c] border border-white/8 hover:border-white/20 transition-all duration-300"
    >
      {/* Visual Header - Only show large banner for Projects */}
      {!isIdea && (
        <div className="h-32 w-full relative overflow-hidden bg-gradient-to-br from-[#0D0D12] to-[#1a1a24]">
          {project.image ? (
            <img 
              src={project.image} 
              alt={project.title} 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Rocket className="w-12 h-12 text-[#9945FF]/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#14151c] via-transparent to-transparent" />
          
          {/* Stage Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border backdrop-blur-md ${
              project.stage === 'Mainnet' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 
              project.stage === 'Devnet' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 
              'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
            }`}>
              {project.stage}
            </span>
          </div>
        </div>
      )}

      {/* Idea Header (Compact) */}
      {isIdea && (
        <div className="relative px-5 pt-5 pb-2 flex justify-between items-start z-10">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FFD700]/10 border border-[#FFD700]/20 group-hover:bg-[#FFD700]/15 group-hover:border-[#FFD700]/30 transition-all duration-300"
          >
            <Lightbulb className="w-5 h-5 text-[#FFD700]" />
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider border ${
              project.stage === 'Idea' 
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400/90' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400/90'
            }`}>
              {project.stage}
            </span>
          </div>
        </div>
      )}

      <div className={`relative z-10 p-5 flex flex-col flex-grow ${isIdea ? 'pt-2' : ''}`}>
        {/* Title */}
        <h3 className="text-lg font-bold mb-2 line-clamp-2 text-white group-hover:text-[#FFD700] transition-colors duration-300">
          {project.title}
        </h3>

        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {project.description}
        </p>

        {/* Bounty Badge - Only show for projects (not ideas) with bounty > 0 */}
        {!isIdea && project.bounty && project.bounty > 0 && (
          <div 
            className="mb-4 p-3 rounded-xl flex items-center justify-between bg-[#9945FF]/10 border border-[#9945FF]/20"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-mono text-purple-400 font-bold">BOUNTY</span>
            </div>
            <span className="text-sm font-bold text-white">{project.bounty} USDC</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag} 
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 border border-white/10 text-gray-400 group-hover:bg-white/8 group-hover:text-gray-300 transition-all duration-300"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/8 group-hover:border-white/15 transition-colors duration-300">
          <div className="flex gap-4">
            {/* Vote Button */}
            <motion.button
              onClick={handleVote}
              className={`flex items-center gap-1.5 text-sm transition-colors duration-300 ${
                isLiked ? 'text-[#FFD700]' : 'text-gray-400 hover:text-white'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <AnimatePresence mode="wait">
                <motion.span 
                  key={project.votes}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {project.votes}
                </motion.span>
              </AnimatePresence>
              
              {/* Vote burst effect */}
              {showBurst && (
                <>
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`burst-${i}`}
                      className="absolute top-1/2 left-2 w-1.5 h-1.5 rounded-full pointer-events-none bg-[#FFD700]"
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [1, 0],
                        x: Math.cos(i * 45 * (Math.PI / 180)) * 25,
                        y: Math.sin(i * 45 * (Math.PI / 180)) * 25,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  ))}
                </>
              )}
            </motion.button>
            
            {/* Comments */}
            <div className="flex items-center gap-1.5 text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
              <MessageSquare className="w-4 h-4" />
              <span>{project.feedbackCount}</span>
            </div>
          </div>

          <AuthorLink
            username={project.author?.username || 'Anonymous'}
            avatar={project.author?.avatar}
            isAnonymous={project.isAnonymous || !project.author}
            showAvatar={true}
            avatarSize="sm"
            className="text-xs font-mono z-20 text-gray-500 hover:text-white transition-colors duration-300"
          />
        </div>
      </div>
    </motion.div>
  );
};

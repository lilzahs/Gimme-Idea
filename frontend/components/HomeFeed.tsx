'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, ThumbsUp, MessageSquare, Bookmark, Share2, 
  Loader2, ChevronRight, Sparkles, TrendingUp, Clock,
  Filter, RefreshCw, X, Copy, Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { Project } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';
import { createUniqueSlug } from '@/lib/slug-utils';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { BookmarkModal } from './BookmarkModal';

// Truncated text component with "...see more"
const TruncatedText = ({ 
  text, 
  maxLength = 120, 
  className = '',
  onSeeMore
}: { 
  text: string; 
  maxLength?: number; 
  className?: string;
  onSeeMore?: () => void;
}) => {
  if (!text) return null;
  
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }
  
  return (
    <span className={className}>
      {text.substring(0, maxLength).trim()}...
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onSeeMore?.();
        }}
        className="ml-1 text-[#FFD700] hover:text-[#FFD700]/80 font-medium transition-colors"
      >
        see more
      </button>
    </span>
  );
};

// Share dropdown
const ShareDropdown = ({ project, className = '' }: { project: Project; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const projectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/idea/${createUniqueSlug(project.title, project.id)}`
    : '';

  const handleShareToX = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tweetText = `Check out this idea on Gimme Idea!\n\n💡 ${project.title}\n\n`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(projectUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(projectUrl);
    toast.success('Link copied!');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 rounded-xl transition-all"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm hidden sm:inline">Share</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }} 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-0 bottom-full mb-2 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50"
            >
              <button
                onClick={handleShareToX}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Share on X
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors border-t border-white/5"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function HomeFeed() {
  const router = useRouter();
  const { user } = useAuth();
  const { voteProject } = useAppStore();
  
  const [ideas, setIdeas] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  
  // Bookmark modal
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Stars background
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: string; opacity: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setStars(newStars);
  }, []);

  const loadIdeas = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const response = await apiClient.getProjects({ type: 'idea', limit: 50 });
      if (response.success && response.data) {
        let sortedIdeas = response.data;
        
        // Sort by filter
        if (filter === 'trending') {
          sortedIdeas = [...sortedIdeas].sort((a, b) => b.votes - a.votes);
        } else if (filter === 'following' && user) {
          // In real implementation, you'd have followed users' ideas
          // For now, just show most recent
          sortedIdeas = [...sortedIdeas].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } else {
          // Default: newest first
          sortedIdeas = [...sortedIdeas].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        
        setIdeas(sortedIdeas);
      }
    } catch (error) {
      console.error('Failed to load ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [filter, user]);

  useEffect(() => {
    loadIdeas();
  }, [loadIdeas]);

  const handleVote = async (e: React.MouseEvent, idea: Project) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to support ideas');
      return;
    }
    
    if (votedIds.has(idea.id)) {
      toast('You already supported this idea', { icon: '💡' });
      return;
    }
    
    try {
      await voteProject(idea.id);
      setVotedIds(prev => new Set([...prev, idea.id]));
      setIdeas(prev => prev.map(i => 
        i.id === idea.id ? { ...i, votes: i.votes + 1 } : i
      ));
      toast.success('Idea supported!');
    } catch (error) {
      toast.error('Failed to vote');
    }
  };

  const handleBookmark = (e: React.MouseEvent, idea: Project) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save ideas');
      return;
    }
    
    setSelectedProject(idea);
    setBookmarkModalOpen(true);
  };

  const handleCardClick = (idea: Project) => {
    const slug = createUniqueSlug(idea.title, idea.id);
    router.push(`/idea/${slug}`);
  };

  // Social Post Card Component
  const PostCard = ({ idea }: { idea: Project }) => {
    const isVoted = votedIds.has(idea.id);
    
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FFD700]/30 transition-all duration-300 group"
      >
        {/* Author Header */}
        <div className="p-4 sm:p-5 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {idea.author?.avatar ? (
                <Image
                  src={idea.author.avatar}
                  alt={idea.author.username}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-[#FFD700]/20"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFD700]/10 flex items-center justify-center border-2 border-[#FFD700]/20">
                  <Lightbulb className="w-5 h-5 text-[#FFD700]" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm sm:text-base">
                    {idea.isAnonymous ? 'Anonymous' : idea.author?.username || 'Unknown'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD700]/10 text-[#FFD700] font-medium">
                    IDEA
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => handleCardClick(idea)}
              className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Clickable area */}
        <div 
          className="p-4 sm:p-5 cursor-pointer"
          onClick={() => handleCardClick(idea)}
        >
          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 group-hover:text-[#FFD700] transition-colors line-clamp-2">
            {idea.title}
          </h2>

          {/* Problem / Solution / Opportunity OR Description fallback */}
          {(idea.problem || idea.solution || idea.opportunity) ? (
            <div className="space-y-3">
              {idea.problem && (
                <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wide">🎯 Problem</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <TruncatedText 
                      text={idea.problem} 
                      maxLength={120}
                      onSeeMore={() => handleCardClick(idea)}
                    />
                  </p>
                </div>
              )}

              {idea.solution && (
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">💡 Solution</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <TruncatedText 
                      text={idea.solution} 
                      maxLength={120}
                      onSeeMore={() => handleCardClick(idea)}
                    />
                  </p>
                </div>
              )}

              {idea.opportunity && (
                <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wide">🚀 Opportunity</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <TruncatedText 
                      text={idea.opportunity} 
                      maxLength={120}
                      onSeeMore={() => handleCardClick(idea)}
                    />
                  </p>
                </div>
              )}
            </div>
          ) : idea.description ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4">
              <p className="text-sm text-gray-300 leading-relaxed">
                <TruncatedText 
                  text={idea.description} 
                  maxLength={200}
                  onSeeMore={() => handleCardClick(idea)}
                />
              </p>
            </div>
          ) : null}

          {/* Tags */}
          {idea.tags && idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {idea.tags.slice(0, 4).map((tag, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white/5 text-gray-400 border border-white/5"
                >
                  #{tag}
                </span>
              ))}
              {idea.tags.length > 4 && (
                <span className="px-2.5 py-1 text-xs rounded-lg bg-white/5 text-gray-500">
                  +{idea.tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Vote/Like Button */}
            <motion.button
              onClick={(e) => handleVote(e, idea)}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isVoted 
                  ? 'bg-[#FFD700]/20 text-[#FFD700]' 
                  : 'text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isVoted ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{idea.votes}</span>
            </motion.button>

            {/* Comments */}
            <button
              onClick={() => handleCardClick(idea)}
              className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">{idea.feedbackCount || 0}</span>
            </button>

            {/* Share */}
            <ShareDropdown project={idea} />
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => handleBookmark(e, idea)}
            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-[#FFD700] hover:bg-[#FFD700]/10 rounded-xl transition-all"
          >
            <Bookmark className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Save</span>
          </button>
        </div>
      </motion.article>
    );
  };

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="bg-grid opacity-40"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#2e1065] rounded-full blur-[120px] animate-pulse-slow opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#422006] rounded-full blur-[120px] animate-pulse-slow opacity-40 mix-blend-screen" style={{animationDelay: '2s'}} />
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                '--duration': star.duration,
                '--opacity': star.opacity
              } as React.CSSProperties}
            />
          ))}
          <div className="shooting-star" style={{ top: '20%', left: '80%' }} />
          <div className="shooting-star" style={{ top: '60%', left: '10%', animationDelay: '2s' }} />
          <div className="shooting-star" style={{ top: '40%', left: '50%', animationDelay: '4s' }} />
        </div>
      </div>

      <div className="pt-24 sm:pt-32 px-4 sm:px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#FFD700]" />
              </div>
              <span>
                Idea<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931]">Feed</span>
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1 ml-[52px]">
              Discover and support the latest ideas
            </p>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => loadIdeas(true)}
            disabled={isRefreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Latest', icon: Clock },
            { key: 'trending', label: 'Trending', icon: TrendingUp },
            { key: 'following', label: 'Following', icon: Users },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as typeof filter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === key
                  ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Create Post Prompt */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.push('/idea/new')}
              className="w-full p-4 sm:p-5 bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/10 hover:border-[#FFD700]/30 rounded-2xl flex items-center gap-4 transition-all group"
            >
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.username}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-white/10"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                  {user.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <span className="text-gray-400 group-hover:text-gray-300 transition-colors text-sm sm:text-base">
                Share your next big idea...
              </span>
              <div className="ml-auto px-4 py-2 bg-[#FFD700]/10 text-[#FFD700] rounded-xl text-sm font-medium group-hover:bg-[#FFD700]/20 transition-colors">
                Post Idea
              </div>
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#FFD700]" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20 bg-white/[0.02] border border-white/5 rounded-2xl">
            <Lightbulb className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No ideas yet</h3>
            <p className="text-gray-400 mb-6">Be the first to share an idea!</p>
            <button
              onClick={() => router.push('/idea/new')}
              className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black rounded-full font-bold hover:shadow-lg hover:shadow-[#FFD700]/20 transition-all"
            >
              Post Your Idea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {ideas.map((idea) => (
              <PostCard key={idea.id} idea={idea} />
            ))}
          </div>
        )}
      </div>

      {/* Bookmark Modal */}
      {selectedProject && (
        <BookmarkModal
          isOpen={bookmarkModalOpen}
          onClose={() => {
            setBookmarkModalOpen(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject.id}
          projectTitle={selectedProject.title}
        />
      )}
    </div>
  );
}

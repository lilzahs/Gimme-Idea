
import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, MessageSquare, Flag, Share2, ThumbsUp, CornerDownRight, DollarSign, Send, Loader2, CheckCircle2, Code } from 'lucide-react';
import { NavContext, ModalContext } from '../App';

// Mock Comments Data (Reduced to 1)
const INITIAL_COMMENTS = [
  {
    id: 1,
    author: 'SolanaGuru',
    avatar: 'SG',
    content: "The implementation of the localized fee market is clever, but I'm worried about the compute budget in high-congestion scenarios. Have you stress-tested this with multiple writable accounts?",
    timestamp: '2 hours ago',
    likes: 12,
    isHelpful: true,
    replies: [
        {
            id: 101,
            author: 'ProjectOwner',
            avatar: 'PO',
            content: "Great point. We are using lookup tables to minimize transaction size, but compute is still a bottleneck. Currently optimizing the CPI calls.",
            timestamp: '1 hour ago',
            likes: 4,
            isOwner: true
        }
    ]
  }
];

export const ProjectDetailView: React.FC = () => {
  const { selectedProjectId, simulateNavigation } = useContext(NavContext);
  const { openModal } = useContext(ModalContext);
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  
  const handlePostComment = () => {
    if (!newComment.trim()) return;
    const comment = {
        id: Date.now(),
        author: 'You',
        avatar: 'ME',
        content: newComment,
        timestamp: 'Just now',
        likes: 0,
        isHelpful: false,
        replies: []
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleReply = (parentId: number) => {
      if (!replyContent.trim()) return;
      const updatedComments = comments.map(c => {
          if (c.id === parentId) {
              return {
                  ...c,
                  replies: [...c.replies, {
                      id: Date.now(),
                      author: 'You',
                      avatar: 'ME',
                      content: replyContent,
                      timestamp: 'Just now',
                      likes: 0,
                      isOwner: false
                  }]
              };
          }
          return c;
      });
      setComments(updatedComments);
      setReplyingTo(null);
      setReplyContent('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
      
      {/* Back Navigation */}
      <button onClick={() => simulateNavigation('dashboard')} className="mb-8 text-sm text-gray-400 hover:text-brand-accent flex items-center gap-2">
        ← Back to Dashboard
      </button>

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-brand-surface mb-12">
        <div className="h-64 bg-gradient-to-r from-brand-purple to-blue-900 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-surface to-transparent"></div>
        </div>
        
        <div className="px-8 pb-8 relative -mt-20 flex flex-col md:flex-row gap-8 items-end">
            <div className="w-40 h-40 rounded-2xl bg-brand-black border-4 border-brand-surface shadow-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center text-3xl font-bold text-gray-600">LOGO</div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold">Change Logo</div>
            </div>
            
            <div className="flex-1 mb-2">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h1 className="text-4xl font-bold font-space">Solana Orderbook DEX V2</h1>
                    <span className="px-3 py-1 bg-brand-accent text-brand-black text-xs font-bold rounded-full">Testnet Live</span>
                </div>
                <p className="text-gray-400 text-lg max-w-2xl">
                    High-frequency central limit order book built on Solana. Features localized fee markets, account compression, and sub-400ms finality.
                </p>
            </div>

            <div className="flex gap-3 mb-2">
                <button className="px-6 py-3 bg-white text-brand-black font-bold rounded-xl flex items-center gap-2 hover:bg-brand-accent transition-colors shadow-lg shadow-brand-accent/10">
                    <ExternalLink size={18} /> Visit App
                </button>
                <button className="p-3 bg-black/40 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors">
                    <Github size={20} />
                </button>
                <button onClick={() => openModal('share')} className="p-3 bg-black/40 border border-white/10 rounded-xl hover:bg-white/10 text-white transition-colors">
                    <Share2 size={20} />
                </button>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* Left Content: Details & Comments */}
        <div className="lg:col-span-2 space-y-12">
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 bg-white/5 rounded-2xl p-6 border border-white/5">
                <div className="text-center border-r border-white/10 last:border-0">
                    <div className="text-2xl font-bold font-mono text-brand-accent">2.5K USDC</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Bounties Paid</div>
                </div>
                <div className="text-center border-r border-white/10 last:border-0">
                    <div className="text-2xl font-bold font-mono text-white">142</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Feedback</div>
                </div>
                <div className="text-center border-r border-white/10 last:border-0">
                    <div className="text-2xl font-bold font-mono text-green-400">98%</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Uptime</div>
                </div>
            </div>

            {/* Tech Stack */}
            <div>
                <h3 className="text-xl font-bold font-space mb-4">Tech Stack</h3>
                <div className="flex flex-wrap gap-3">
                    {['Rust', 'Anchor', 'React', 'Next.js', 'Tailwind', 'Helius RPC', 'Jupiter API'].map(tag => (
                        <span key={tag} className="px-4 py-2 bg-brand-surface border border-white/10 rounded-lg text-sm text-gray-300 font-mono">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className="prose prose-invert prose-lg max-w-none">
                <h3 className="text-xl font-bold font-space mb-4">About The Project</h3>
                <p className="text-gray-300 leading-relaxed">
                    Traditional AMMs are great for bootstrapping liquidity, but they suffer from high slippage and lack the capital efficiency of orderbooks. 
                    Our DEX brings the CEX experience on-chain. We utilize the latest Solana upgrades to ensure that market makers can update quotes 
                    thousands of times per second without clogging the network.
                </p>
            </div>

            {/* Comments Section */}
            <div className="pt-8 border-t border-white/10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold font-space">Community Feedback</h3>
                    <div className="text-sm text-gray-400">Sort by: <span className="text-white font-bold cursor-pointer">Most Helpful</span></div>
                </div>

                {/* Comment Input */}
                <div className="flex gap-4 mb-12">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-brand-accent flex-shrink-0"></div>
                    <div className="flex-1 relative">
                        <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your feedback, report a bug, or suggest a feature..."
                            className="w-full bg-brand-surface border border-white/10 rounded-xl p-4 text-white min-h-[120px] focus:border-brand-accent outline-none resize-none transition-all"
                        />
                        <div className="absolute bottom-4 right-4 flex items-center gap-2">
                             <button className="text-gray-400 hover:text-white"><Code size={18}/></button>
                             <button 
                                onClick={handlePostComment}
                                className="bg-brand-accent text-brand-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors"
                            >
                                <Send size={14} /> Post Feedback
                             </button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-8">
                    {comments.map((comment) => (
                        <motion.div layout key={comment.id} className="group">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs border border-white/10 flex-shrink-0">
                                    {comment.avatar}
                                </div>
                                <div className="flex-1">
                                    <div className="bg-brand-surface border border-white/5 rounded-2xl p-5 relative hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm">{comment.author}</span>
                                                {comment.isHelpful && (
                                                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded border border-green-500/20">TOP CONTRIBUTOR</span>
                                                )}
                                                <span className="text-xs text-gray-500">• {comment.timestamp}</span>
                                            </div>
                                            <button onClick={() => openModal('report', { id: comment.id })} className="text-gray-500 hover:text-white"><Flag size={14}/></button>
                                        </div>
                                        <p className="text-gray-300 text-sm leading-relaxed mb-4">{comment.content}</p>
                                        
                                        <div className="flex items-center gap-4">
                                            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-brand-accent transition-colors">
                                                <ThumbsUp size={14} /> {comment.likes} Helpful
                                            </button>
                                            <button 
                                                onClick={() => setReplyingTo(comment.id === replyingTo ? null : comment.id)}
                                                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-brand-accent transition-colors"
                                            >
                                                <MessageSquare size={14} /> Reply
                                            </button>
                                            <div className="h-4 w-px bg-white/10"></div>
                                            <button 
                                                onClick={() => openModal('tip', { recipient: comment.author })}
                                                className="flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-brand-accent/10"
                                            >
                                                <DollarSign size={14} /> Tip USDC
                                            </button>
                                        </div>
                                    </div>

                                    {/* Nested Replies (Reduced to 1) */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-4 pl-8 space-y-4 border-l-2 border-white/5 ml-5">
                                            {comment.replies.slice(0,1).map(reply => (
                                                <div key={reply.id} className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-[10px] border border-white/10 flex-shrink-0">
                                                        {reply.avatar}
                                                    </div>
                                                    <div className="flex-1 bg-white/5 rounded-xl p-4">
                                                         <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-bold text-xs">{reply.author}</span>
                                                            {reply.isOwner && <span className="text-[10px] bg-brand-accent text-brand-black px-1.5 rounded font-bold">AUTHOR</span>}
                                                            <span className="text-[10px] text-gray-500">• {reply.timestamp}</span>
                                                        </div>
                                                        <p className="text-gray-300 text-xs leading-relaxed">{reply.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    <AnimatePresence>
                                        {replyingTo === comment.id && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pl-14"
                                            >
                                                <div className="flex gap-3">
                                                    <input 
                                                        type="text" 
                                                        value={replyContent}
                                                        onChange={(e) => setReplyContent(e.target.value)}
                                                        className="flex-1 bg-brand-black border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-brand-accent outline-none"
                                                        placeholder="Write a reply..."
                                                        autoFocus
                                                    />
                                                    <button 
                                                        onClick={() => handleReply(comment.id)}
                                                        className="bg-white/10 hover:bg-brand-accent hover:text-brand-black text-white px-4 rounded-lg transition-colors"
                                                    >
                                                        <CornerDownRight size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Sidebar: Sticky Info */}
        <div className="hidden lg:block space-y-6 sticky top-24 h-fit">
            <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
                <h4 className="font-bold font-space mb-4 text-sm uppercase tracking-widest text-gray-500">Contributors</h4>
                <div className="flex -space-x-2 mb-6">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-surface bg-gray-700 hover:z-10 transition-all hover:scale-110 cursor-pointer" title={`User ${i}`}></div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-brand-surface bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">+12</div>
                </div>
                
                <button onClick={() => openModal('team')} className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors mb-4">
                    Manage Team
                </button>
            </div>

            <div className="bg-gradient-to-b from-brand-accent/10 to-transparent border border-brand-accent/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-brand-accent text-brand-black rounded-lg">
                        <DollarSign size={20} />
                    </div>
                    <h4 className="font-bold">Project Bounty</h4>
                </div>
                <div className="text-3xl font-bold font-mono mb-1 text-brand-accent">5,000 USDC</div>
                <p className="text-xs text-gray-400 mb-6">Reserved for high-quality feedback and bug reports.</p>
                <div className="w-full h-2 bg-brand-black rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-brand-accent w-[45%]"></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>Distributed: 2.25k</span>
                    <span>Total: 5k</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

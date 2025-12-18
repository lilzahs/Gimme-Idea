'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2, ThumbsUp, Loader2, AlertCircle, FileUp } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Project } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface ImportIdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectIdea: (idea: Project) => void;
}

export default function ImportIdeaModal({ isOpen, onClose, onSelectIdea }: ImportIdeaModalProps) {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIdea, setSelectedIdea] = useState<Project | null>(null);

    // Fetch user's ideas from the platform
    useEffect(() => {
        if (isOpen && user) {
            fetchUserIdeas();
        }
    }, [isOpen, user]);

    const fetchUserIdeas = async () => {
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.getProjects({ type: 'idea' });

            if (response.success && response.data) {
                // Filter only ideas belonging to the current user
                const userIdeas = response.data.filter(
                    (project: Project) => project.author?.username === user.username
                );
                setIdeas(userIdeas);
            } else {
                setError('Failed to load your ideas');
            }
        } catch (err) {
            setError('Failed to load your ideas');
            console.error('Error fetching ideas:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter ideas based on search query
    const filteredIdeas = ideas.filter(idea =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idea.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectIdea = (idea: Project) => {
        setSelectedIdea(idea);
    };

    const handleConfirmImport = () => {
        if (selectedIdea) {
            onSelectIdea(selectedIdea);
            onClose();
            setSelectedIdea(null);
            setSearchQuery('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-[calc(100%-2rem)] max-w-2xl max-h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl z-[101] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center border border-gold/20">
                                    <FileUp className="w-5 h-5 text-gold" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white font-quantico">Import Your Idea</h2>
                                    <p className="text-xs text-gray-500">Select an idea from your GimmeIdea submissions</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search your ideas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:border-gold/50 outline-none transition-colors placeholder:text-gray-500"
                                />
                            </div>
                        </div>

                        {/* Ideas List */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-8 h-8 text-gold animate-spin" />
                                    <p className="text-sm text-gray-400">Loading your ideas...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                    <p className="text-sm text-gray-400">{error}</p>
                                    <button
                                        onClick={fetchUserIdeas}
                                        className="text-xs text-gold hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : filteredIdeas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                                        <FileUp className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">
                                            {searchQuery ? 'No ideas match your search' : 'You don\'t have any ideas yet'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {searchQuery ? 'Try a different search term' : 'Create ideas on GimmeIdea first to import them here'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {filteredIdeas.map((idea) => (
                                        <div
                                            key={idea.id}
                                            onClick={() => handleSelectIdea(idea)}
                                            className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${selectedIdea?.id === idea.id
                                                ? 'bg-gold/10 border-gold shadow-lg shadow-gold/5'
                                                : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] text-gray-400 font-mono">
                                                    {idea.category}
                                                </span>
                                                <div
                                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedIdea?.id === idea.id
                                                        ? 'bg-gold border-gold'
                                                        : 'border-gray-600 group-hover:border-gray-400'
                                                        }`}
                                                >
                                                    {selectedIdea?.id === idea.id && (
                                                        <CheckCircle2 className="w-3 h-3 text-black" />
                                                    )}
                                                </div>
                                            </div>
                                            <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-gold transition-colors line-clamp-1">
                                                {idea.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                                {idea.description}
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" /> {idea.votes} Votes
                                                </span>
                                                <span className="text-gray-800">•</span>
                                                <span>{idea.stage}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-xs text-gray-500">
                                    {filteredIdeas.length} idea{filteredIdeas.length !== 1 ? 's' : ''} available
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmImport}
                                        disabled={!selectedIdea}
                                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${selectedIdea
                                            ? 'bg-gold text-black hover:bg-gold/90'
                                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <FileUp className="w-4 h-4" />
                                        Import Idea
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
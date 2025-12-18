'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Plus, UserPlus } from 'lucide-react';
import Link from 'next/link'; // Assuming Link is used for user profiles or similar

interface User {
    id: string;
    name: string;
    skills: string[];
}

interface InviteMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableUsers: User[];
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onInvite: (userId: string) => void;
    teamMembers: User[]; // Add teamMembers to filter out already-in-team users
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
    isOpen,
    onClose,
    availableUsers,
    searchQuery,
    onSearchQueryChange,
    onInvite,
    teamMembers
}) => {
    // Filter out users already in the team
    const teamMemberIds = new Set(teamMembers.map(member => member.id));
    const filteredUsers = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) && !teamMemberIds.has(user.id)
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        className="bg-surface border border-white/10 rounded-xl shadow-lg w-full max-w-lg p-6 relative"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white mb-4 font-quantico flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-gold" /> Invite Member
                        </h2>

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name or skills..."
                                value={searchQuery}
                                onChange={(e) => onSearchQueryChange(e.target.value)}
                                className="w-full bg-black/20 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-gold/50 outline-none"
                            />
                        </div>

                        <div className="max-h-80 overflow-y-auto pr-2">
                            {filteredUsers.length > 0 ? (
                                <div className="space-y-3">
                                    {filteredUsers.map((user) => (
                                        <div key={user.id} className="flex items-center justify-between bg-black/20 border border-white/5 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{user.name}</p>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {user.skills.map((skill: string) => (
                                                            <span key={skill} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => onInvite(user.id)}
                                                className="bg-gold text-black text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gold/90 transition-colors flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Invite
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center text-sm italic py-4">No users found or all users already in team.</p>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default InviteMemberModal;
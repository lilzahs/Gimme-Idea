'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Calendar, Users, Clock, ChevronRight,
  Target, Zap, MessageSquare, FileText, CheckCircle2,
  AlertCircle, MoreHorizontal, Github, Disc, Link as LinkIcon,
  Monitor, Mic, SwatchBook, Code, ShieldCheck, Smartphone, UserPlus, RefreshCw, Lock, Search, Plus, Settings, LogOut, UserMinus,
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { format, isBefore } from 'date-fns';
import { useHackathon } from '@/hooks/useHackathon';
import { useAuth } from '@/contexts/AuthContext';

// Map icon names to Lucide React components
const LucideIconMap: { [key: string]: React.ElementType } = {
  Trophy, Calendar, Users, Clock, ChevronRight,
  Target, Zap, MessageSquare, FileText, CheckCircle2,
  AlertCircle, MoreHorizontal, Github, Disc, LinkIcon,
  Monitor, Mic, SwatchBook, Code, ShieldCheck, Smartphone, UserPlus, RefreshCw
};

const DEFAULT_NEW_TEAM = {
  name: '',
  description: '',
  tags: [],
  lookingFor: [],
  maxMembers: 5
};

export default function HackathonDashboard({ params }: { params: { id: string } }) {
  const { id } = params;
  const { user } = useAuth();
  
  // Use Custom Hook for Data Fetching
  const { 
    hackathon, 
    announcements, 
    teams, 
    userStatus, 
    isLoading, 
    error, 
    register, 
    createTeam, 
    joinTeam, 
    submitProject 
  } = useHackathon(id);

  const searchParams = useSearchParams();
  const mockDate = searchParams.get('mockDate');
  const now = mockDate ? new Date(mockDate) : new Date();

  // Stars background
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: string; opacity: number }[]>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: `${Math.random() * 3 + 2}s`,
      opacity: Math.random()
    }));
    setStars(newStars);
  }, []);

  // Timeline logic
  const timeline = hackathon?.timeline || [];
  const dynamicTimeline = timeline.map((step: any, index: number) => {
    const start = new Date(step.startDate);
    const end = step.endDate ? new Date(step.endDate) : null;
    const nextStart = timeline[index + 1] ? new Date(timeline[index + 1].startDate) : null;

    let status = 'pending';
    if (isBefore(now, start)) {
      status = 'pending';
    } else if (end) {
      if (isBefore(now, end)) status = 'active';
      else status = 'done';
    } else {
      if (nextStart && !isBefore(now, nextStart)) status = 'done';
      else status = 'active';
    }
    return { ...step, status };
  });

  // Tab Logic
  const allTabs = hackathon?.config?.tabs || [
      { id: 'announcement', label: 'Announcements' },
      { id: 'tracks', label: 'Tracks' },
      { id: 'team', label: 'Teams' },
      { id: 'submission', label: 'Submission' }
  ];

  const visibleTabs = allTabs; // Simplify logic for now, show all configured tabs
  
  const [activeTab, setActiveTab] = useState('tracks');
  
  // Set default tab once data is loaded
  useEffect(() => {
     if (hackathon && !isLoading) {
        setActiveTab(visibleTabs[0]?.id || 'tracks');
     }
  }, [hackathon, isLoading]);

  const [teamTabMode, setTeamTabMode] = useState<'teams' | 'teammates'>('teams');
  const [searchTeamQuery, setSearchTeamQuery] = useState('');
  
  // Team Creation State
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [newTeamData, setNewTeamData] = useState(DEFAULT_NEW_TEAM);

  const [expandedTrack, setExpandedTrack] = useState<number | null>(null);
  const [countdown, setCountdown] = useState({ text: 'Calculating...', label: 'Loading...' });

  const [submissionData, setSubmissionData] = useState({
    track: '',
    selectedIdeaId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Terminal State
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<{ type: 'command' | 'error', content: string }[]>([]);
  const terminalEndRef = React.useRef<HTMLDivElement>(null);

  // Countdown Timer
  useEffect(() => {
    if (!hackathon) return;
    const updateTimer = () => {
      const currentNow = new Date();
      // Simple logic: find next active phase or end date
      // For now just show generic countdown to end of hackathon if active
      const end = new Date(hackathon.end_date);
      const diff = end.getTime() - currentNow.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCountdown({
            text: `${days}d ${hours}h`,
            label: 'Ends In'
        });
      } else {
         setCountdown({ text: 'Ended', label: 'Status' });
      }
    };
    updateTimer();
  }, [hackathon]);

  // Handlers
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!newTeamData.name) return;
    await createTeam(newTeamData);
    setIsCreatingTeam(false);
  };

  const handleJoinTeam = async (teamId: string) => {
      if(!user) return; // Add login modal trigger here
      await joinTeam(teamId);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
          await submitProject({ 
              projectId: submissionData.selectedIdeaId, 
              track: submissionData.track 
          });
          // Show success message
      } finally {
          setIsSubmitting(false);
      }
  };


  if (isLoading) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-gold animate-spin" />
          </div>
      );
  }

  if (error || !hackathon) {
    return (
      <div className="min-h-screen bg-background pt-32 text-center text-white">
          <h1 className="text-4xl font-bold">Hackathon Not Found</h1>
          <p className="text-gray-400 mt-2">{error || "Invalid ID"}</p>
          <Link href="/hackathons" className="text-gold mt-4 inline-block hover:underline">Back to List</Link>
      </div>
    );
  }

  const userTeam = userStatus.team;

  return (
    <div className="min-h-screen text-gray-300 pt-28 pb-10 px-4 font-sans text-sm relative">
      {/* Background with Stars & Grid */}
      <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
        <div className="bg-grid opacity-40"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#2e1065] rounded-full blur-[120px] animate-pulse-slow opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#422006] rounded-full blur-[120px] animate-pulse-slow opacity-40 mix-blend-screen" />
        <div className="stars-container">
          {stars.map((star) => (
            <div key={star.id} className="star" style={{ top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`, '--duration': star.duration, '--opacity': star.opacity } as React.CSSProperties} />
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* --- LEFT COLUMN: META & TIMELINE (20%) --- */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-surface border border-white/5 rounded-xl p-4">
            <h1 className="text-xl font-bold text-white font-quantico break-words">{hackathon.title}</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{hackathon.status}</p>
            <div className="mt-4 flex items-center gap-2 text-gold bg-gold/5 px-3 py-2 rounded-lg border border-gold/10">
                <Clock className="w-4 h-4" />
                <span className="font-mono font-bold text-xs md:text-sm">{countdown.text}</span>
            </div>
             {!userStatus.participant && (
                 <button 
                    onClick={register}
                    className="mt-4 w-full bg-gold text-black font-bold py-2 rounded hover:bg-gold/90 transition-all"
                 >
                     Register Now
                 </button>
             )}
             {userStatus.participant && (
                 <div className="mt-4 w-full bg-green-500/20 text-green-500 border border-green-500/30 font-bold py-2 rounded text-center flex items-center justify-center gap-2">
                     <CheckCircle2 className="w-4 h-4" /> Registered
                 </div>
             )}
          </div>

          {/* Timeline */}
          {dynamicTimeline.length > 0 && (
            <div className="bg-surface border border-white/5 rounded-xl p-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Timeline</h3>
              <div className="relative border-l border-white/10 ml-2 space-y-6">
                {dynamicTimeline.map((step: any) => (
                  <div key={step.id} className="relative pl-6 group cursor-default">
                    <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 flex items-center justify-center">
                      <div className={`relative w-full h-full rounded-full border-2 transition-all z-10
                                        ${step.status === 'done' ? 'bg-green-500 border-green-500' :
                          step.status === 'active' ? 'bg-gold border-gold shadow-[0_0_15px_var(--color-gold)] scale-125' :
                            'bg-surface border-gray-600'}`}
                      />
                    </div>
                    <div className={`${step.status === 'active' ? 'text-white' : 'text-gray-500'}`}>
                      <p className="font-medium text-xs md:text-sm">{step.title}</p>
                      <p className="text-[10px] font-mono opacity-70">
                        {format(new Date(step.startDate), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* --- CENTER COLUMN: MAIN CONTENT (55%) --- */}
        <main className="lg:col-span-6 space-y-6">
          {hackathon.image_url && (
            <div className="relative w-full aspect-[6/1] rounded-xl overflow-hidden shadow-lg border border-white/5">
              <Image src={hackathon.image_url} alt="Banner" layout="fill" objectFit="cover" className="opacity-80" />
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 overflow-x-auto">
            {visibleTabs.map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'text-gold' : 'text-gray-500 hover:text-white'}`}
              >
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            
            {/* ANNOUNCEMENTS TAB */}
            {activeTab === 'announcement' && (
               <div className="bg-black border border-green-500/30 rounded-lg p-6 font-mono text-xs shadow-[0_0_20px_rgba(34,197,94,0.1)] h-[500px] flex flex-col">
                   <div className="flex-1 overflow-y-auto space-y-3 text-green-300/80 pr-2">
                       {announcements.map((log: any) => (
                           <div key={log.id} className="group">
                               <span className="opacity-50 text-xs mr-2">[{format(new Date(log.published_at), 'HH:mm')}]</span>
                               <span className={log.type === 'warning' ? 'text-yellow-400' : 'text-green-400'}>{log.content}</span>
                           </div>
                       ))}
                       {announcements.length === 0 && <p className="text-gray-600 italic">No system logs.</p>}
                   </div>
               </div>
            )}

            {/* TRACKS TAB */}
            {activeTab === 'tracks' && (
                <div className="space-y-4">
                    {hackathon.tracks?.map((track: any, i: number) => {
                         const TrackIcon = LucideIconMap[track.icon] || Target;
                         return (
                            <div key={i} className="bg-surface border border-white/5 rounded-xl p-6 flex items-start gap-4">
                                <div className={`p-3 rounded-lg bg-black/40 ${track.color || 'text-gold'}`}>
                                    <TrackIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">{track.title}</h3>
                                    <p className="text-gray-400 text-sm">{track.description}</p>
                                </div>
                            </div>
                         );
                    })}
                </div>
            )}

            {/* TEAMS TAB */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {!userStatus.participant ? (
                    <div className="text-center py-10 bg-surface border border-white/5 rounded-xl">
                        <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                        <h3 className="text-white font-bold">Registration Required</h3>
                        <p className="text-gray-500 text-sm mt-1">Register for the hackathon to access team features.</p>
                        <button onClick={register} className="mt-4 text-gold hover:underline">Register Now</button>
                    </div>
                ) : userTeam && !isCreatingTeam ? (
                  // VIEW MY TEAM
                   <div className="bg-surface border border-white/5 rounded-xl p-6">
                       <div className="flex justify-between items-start mb-6">
                           <div>
                               <h2 className="text-2xl font-bold text-white">{userTeam.name}</h2>
                               <p className="text-gray-400 text-sm">{userTeam.description}</p>
                           </div>
                           <div className="bg-gold/10 text-gold px-2 py-1 rounded text-xs border border-gold/20">
                               {userTeam.members.length}/{userTeam.max_members} Members
                           </div>
                       </div>
                       
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Members</h3>
                       <div className="space-y-2">
                           {userTeam.members.map((m: any) => (
                               <div key={m.user_id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                       {m.user?.username?.charAt(0) || 'U'}
                                   </div>
                                   <div>
                                       <p className="text-sm text-white font-bold">{m.user?.username}</p>
                                       <p className="text-[10px] text-gray-400">{m.role} {m.is_leader && '(Leader)'}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                ) : isCreatingTeam ? (
                    // CREATE TEAM FORM
                    <form onSubmit={handleCreateTeam} className="bg-surface border border-white/5 rounded-xl p-6 space-y-4">
                        <h3 className="text-xl font-bold text-white">Create New Team</h3>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Team Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                value={newTeamData.name}
                                onChange={e => setNewTeamData({...newTeamData, name: e.target.value})}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                            <textarea 
                                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white"
                                value={newTeamData.description}
                                onChange={e => setNewTeamData({...newTeamData, description: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsCreatingTeam(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button type="submit" className="px-6 py-2 bg-gold text-black font-bold rounded">Create Team</button>
                        </div>
                    </form>
                ) : (
                   // FIND TEAMS
                   <div className="space-y-4">
                       <div className="flex justify-between items-center">
                           <h3 className="text-lg font-bold text-white">Find a Team</h3>
                           <button onClick={() => setIsCreatingTeam(true)} className="flex items-center gap-2 bg-gold text-black text-xs font-bold px-3 py-2 rounded">
                               <Plus className="w-3 h-3" /> Create Team
                           </button>
                       </div>
                       
                       <div className="grid gap-3">
                           {teams.map((team: any) => (
                               <div key={team.id} className="bg-surface border border-white/5 rounded-xl p-4 flex justify-between items-center hover:border-gold/30 transition-all">
                                   <div>
                                       <h4 className="font-bold text-white">{team.name}</h4>
                                       <p className="text-xs text-gray-400 line-clamp-1">{team.description}</p>
                                       <div className="flex gap-2 mt-2">
                                           {team.tags?.map((t: string) => <span key={t} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500">{t}</span>)}
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <span className="text-xs text-gray-500 block mb-2">{team.members.length}/{team.max_members} members</span>
                                       {team.is_open && team.members.length < team.max_members && (
                                           <button onClick={() => handleJoinTeam(team.id)} className="bg-white/10 text-white text-xs px-3 py-1.5 rounded hover:bg-white/20">Join</button>
                                       )}
                                   </div>
                               </div>
                           ))}
                           {teams.length === 0 && <p className="text-gray-500 italic text-center py-4">No teams found. Be the first to create one!</p>}
                       </div>
                   </div>
                )}
              </div>
            )}

            {/* SUBMISSION TAB */}
            {activeTab === 'submission' && (
                <div className="max-w-2xl mx-auto">
                    {hackathon.status !== 'active' ? (
                        <div className="text-center py-10">
                            <Clock className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                            <h3 className="text-white font-bold">Submissions Closed</h3>
                            <p className="text-gray-500">Submissions are only accepted during the active phase.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitProject} className="bg-surface border border-white/5 rounded-xl p-8 space-y-6">
                            <h2 className="text-2xl font-bold text-white font-quantico text-center">Submit Project</h2>
                            
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select Track</label>
                                <select 
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-3 text-white"
                                    value={submissionData.track}
                                    onChange={e => setSubmissionData({...submissionData, track: e.target.value})}
                                    required
                                >
                                    <option value="">-- Select a Track --</option>
                                    {hackathon.tracks?.map((t: any) => (
                                        <option key={t.title} value={t.title}>{t.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Project ID</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your existing Project ID"
                                    className="w-full bg-black/30 border border-white/10 rounded px-3 py-3 text-white"
                                    value={submissionData.selectedIdeaId}
                                    onChange={e => setSubmissionData({...submissionData, selectedIdeaId: e.target.value})}
                                    required
                                />
                                <p className="text-[10px] text-gray-500 mt-1">
                                    Only projects authored by you are valid. 
                                    <Link href="/idea" className="text-gold hover:underline ml-1">Create new project</Link>
                                </p>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-gold text-black font-bold py-3 rounded hover:bg-gold/90 transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                            </button>
                        </form>
                    )}
                </div>
            )}
            
          </div>
        </main>

        {/* --- RIGHT COLUMN: RESOURCES (25%) --- */}
        <aside className="lg:col-span-3 space-y-6">
            {hackathon.resources && (
                <div className="bg-surface border border-white/5 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Resources</h3>
                    <div className="space-y-2">
                        {hackathon.resources.map((res: any, i: number) => (
                            <a key={i} href={res.link} target="_blank" className="block text-sm text-gold hover:underline flex items-center gap-2">
                                <LinkIcon className="w-3 h-3" /> {res.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </aside>

      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  ShieldCheck, 
  Plus, 
  Calendar, 
  Trophy, 
  Users, 
  Settings,
  Activity,
  Trash2,
  Edit,
  Eye,
  Clock,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Lock,
  KeyRound,
  Lightbulb,
  Search,
  Bot,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminBadge from '@/components/AdminBadge';

// Access code for admin panel
const ADMIN_ACCESS_CODE = 'gmi@2025--';
const ACCESS_STORAGE_KEY = 'gmi_admin_access';

interface Idea {
  id: string;
  title: string;
  description?: string;
  category: string;
  votes: number;
  feedbackCount: number;
  createdAt: string;
  author?: {
    username: string;
    wallet: string;
  };
  hasAIFeedback?: boolean;
}

interface ActivityLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  createdAt: string;
  admin?: {
    username: string;
    avatar: string;
  };
}

// Access Code Gate Component
function AccessCodeGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError('');

    setTimeout(() => {
      if (code === ADMIN_ACCESS_CODE) {
        sessionStorage.setItem(ACCESS_STORAGE_KEY, btoa(Date.now().toString()));
        onSuccess();
      } else {
        setError('Invalid access code');
        setCode('');
      }
      setIsChecking(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm mx-4"
      >
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Lock className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <h1 className="text-xl font-bold text-white text-center mb-2">
            Restricted Area
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter access code to continue
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Access code"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-3 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none transition-colors"
                autoFocus
                disabled={isChecking}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isChecking || !code}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Access
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'ideas' | 'ai-tools' | 'hackathons' | 'activity'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [backfillResult, setBackfillResult] = useState<any>(null);
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Check if user has valid access token
  useEffect(() => {
    const storedAccess = sessionStorage.getItem(ACCESS_STORAGE_KEY);
    if (storedAccess) {
      try {
        const timestamp = parseInt(atob(storedAccess));
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setHasAccess(true);
        } else {
          sessionStorage.removeItem(ACCESS_STORAGE_KEY);
        }
      } catch {
        sessionStorage.removeItem(ACCESS_STORAGE_KEY);
      }
    }
    setCheckingAccess(false);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!hasAccess) return;
      
      setIsLoading(true);
      try {
        const [ideasRes, activityRes] = await Promise.all([
          apiClient.getProjects({ type: 'idea', limit: 100 }),
          apiClient.getAdminActivityLog(20),
        ]);

        if (ideasRes.success && ideasRes.data) {
          setIdeas(ideasRes.data as any);
        }
        if (activityRes.success && activityRes.data) {
          setActivityLog(activityRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [hasAccess]);

  const handleDeleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    
    try {
      const res = await apiClient.deleteProject(id);
      if (res.success) {
        setIdeas(ideas.filter(i => i.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete idea:', error);
    }
  };

  const handleBackfillAI = async () => {
    setIsBackfilling(true);
    setBackfillResult(null);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${API_URL}/ai/backfill-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setBackfillResult(data);
    } catch (error) {
      setBackfillResult({ success: false, error: 'Failed to backfill' });
    } finally {
      setIsBackfilling(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!hasAccess) {
    return <AccessCodeGate onSuccess={() => setHasAccess(true)} />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  const filteredIdeas = ideas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ideasWithAI = ideas.filter(i => i.feedbackCount > 0).length;
  const ideasWithoutAI = ideas.length - ideasWithAI;

  const stats = [
    { label: 'Total Ideas', value: ideas.length, icon: Lightbulb, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { label: 'With AI Feedback', value: ideasWithAI, icon: Bot, color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { label: 'Missing AI', value: ideasWithoutAI, icon: AlertTriangle, color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { label: 'Admin Actions', value: activityLog.length, icon: ShieldCheck, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <AdminBadge variant="inline" />
            </div>
            <p className="text-gray-400">
              Welcome back, <span className="text-white font-medium">{user?.username || 'Admin'}</span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#111] border border-white/5 rounded-xl p-4"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'ideas', label: 'Ideas', icon: Lightbulb },
            { id: 'ai-tools', label: 'AI Tools', icon: Bot },
            { id: 'hackathons', label: 'Hackathons', icon: Trophy },
            { id: 'activity', label: 'Activity', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Ideas</h3>
              <div className="space-y-3">
                {ideas.slice(0, 5).map((idea) => (
                  <div key={idea.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex-grow">
                      <div className="font-medium text-white mb-1 truncate">{idea.title}</div>
                      <div className="text-xs text-gray-500">{idea.category}</div>
                    </div>
                    <Link href={`/idea/${idea.id}`} className="p-2 hover:bg-white/10 rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">AI Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ideas with AI feedback</span>
                  <span className="text-green-400 font-medium">{ideasWithAI}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ideas without AI feedback</span>
                  <span className="text-red-400 font-medium">{ideasWithoutAI}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-4">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${ideas.length > 0 ? (ideasWithAI / ideas.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  {ideas.length > 0 ? Math.round((ideasWithAI / ideas.length) * 100) : 0}% coverage
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ideas Tab */}
        {activeTab === 'ideas' && (
          <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ideas..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-11 pr-4 py-2 text-white placeholder:text-gray-600 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Title</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Votes</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Feedback</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIdeas.map((idea) => (
                    <tr key={idea.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="font-medium text-white truncate max-w-xs">{idea.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">{idea.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{idea.votes}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{idea.feedbackCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/idea/${idea.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteIdea(idea.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* AI Tools Tab */}
        {activeTab === 'ai-tools' && (
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Backfill AI Feedback</h3>
              <p className="text-gray-400 mb-4">
                Generate AI feedback for all ideas that don't have it yet. This will use the OpenAI API.
              </p>
              <button
                onClick={handleBackfillAI}
                disabled={isBackfilling}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
              >
                {isBackfilling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Run Backfill
                  </>
                )}
              </button>

              {backfillResult && (
                <div className={`mt-4 p-4 rounded-lg ${backfillResult.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  {backfillResult.success ? (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-medium text-green-400">Backfill Complete</span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>Processed: {backfillResult.data?.processed || 0}</p>
                        <p>Success: {backfillResult.data?.success || 0}</p>
                        <p>Failed: {backfillResult.data?.failed || 0}</p>
                        <p>Skipped: {backfillResult.data?.skipped || 0}</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-400">{backfillResult.error || 'Failed'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ideas Without AI Feedback</h3>
              <div className="space-y-2">
                {ideas.filter(i => i.feedbackCount === 0).slice(0, 10).map((idea) => (
                  <div key={idea.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white truncate">{idea.title}</span>
                    <Link href={`/idea/${idea.id}`} className="text-purple-400 text-sm hover:underline">
                      View
                    </Link>
                  </div>
                ))}
                {ideas.filter(i => i.feedbackCount === 0).length === 0 && (
                  <p className="text-gray-500 text-center py-4">All ideas have AI feedback!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hackathons Tab */}
        {activeTab === 'hackathons' && (
          <div className="bg-[#111] border border-white/5 rounded-xl p-6 text-center">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Hackathon management coming soon</p>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="bg-[#111] border border-white/5 rounded-xl p-6">
            <div className="space-y-4">
              {activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                  <Activity className="w-4 h-4 text-gray-400 mt-1" />
                  <div className="flex-grow">
                    <div className="text-sm text-white capitalize">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <p className="text-gray-500 text-center py-4">No activity yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

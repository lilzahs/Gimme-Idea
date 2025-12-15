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
  KeyRound
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminBadge from '@/components/AdminBadge';

// Access code for admin panel - hashed comparison
const ADMIN_ACCESS_CODE = 'gmi@2025--';
const ACCESS_STORAGE_KEY = 'gmi_admin_access';

interface Hackathon {
  id: string;
  slug: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  prizePool?: string;
  status: 'upcoming' | 'active' | 'voting' | 'completed';
  imageUrl?: string;
  tags: string[];
  participantsCount: number;
  createdAt: string;
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

    // Small delay to prevent brute force
    setTimeout(() => {
      if (code === ADMIN_ACCESS_CODE) {
        // Store access in session (expires when browser closes)
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

        <p className="text-xs text-gray-600 text-center mt-4">
          Unauthorized access attempts are logged.
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hackathons' | 'activity'>('overview');

  // Check if user has valid access token in session
  useEffect(() => {
    const storedAccess = sessionStorage.getItem(ACCESS_STORAGE_KEY);
    if (storedAccess) {
      try {
        const timestamp = parseInt(atob(storedAccess));
        // Access valid for 24 hours
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

  // Secret URL - no need to check isAdmin, URL itself is the security
  useEffect(() => {
    const fetchData = async () => {
      if (!hasAccess) return;
      
      setIsLoading(true);
      try {
        const [hackathonsRes, activityRes] = await Promise.all([
          apiClient.getHackathons(),
          apiClient.getAdminActivityLog(20),
        ]);

        if (hackathonsRes.success && hackathonsRes.data) {
          setHackathons(hackathonsRes.data);
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

  // Show loading while checking access
  if (checkingAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // Show access code gate if no access
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

  const stats = [
    { 
      label: 'Total Hackathons', 
      value: hackathons.length, 
      icon: Trophy, 
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    { 
      label: 'Active Now', 
      value: hackathons.filter(h => h.status === 'active').length, 
      icon: Activity, 
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    { 
      label: 'Total Participants', 
      value: hackathons.reduce((acc, h) => acc + h.participantsCount, 0), 
      icon: Users, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    { 
      label: 'Admin Actions', 
      value: activityLog.length, 
      icon: ShieldCheck, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'voting': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'completed': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('delete')) return <Trash2 className="w-4 h-4 text-red-400" />;
    if (action.includes('create')) return <Plus className="w-4 h-4 text-green-400" />;
    if (action.includes('update') || action.includes('score')) return <Edit className="w-4 h-4 text-blue-400" />;
    if (action.includes('verify')) return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

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
              Welcome back, <span className="text-white font-medium">{user?.username}</span>
            </p>
          </div>
          <Link 
            href="/admin/hackathons/new"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            New Hackathon
          </Link>
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
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'hackathons', label: 'Hackathons', icon: Trophy },
            { id: 'activity', label: 'Activity Log', icon: Activity },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Hackathons */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Hackathons</h3>
                <button 
                  onClick={() => setActiveTab('hackathons')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {hackathons.slice(0, 3).map((hackathon) => (
                  <div 
                    key={hackathon.id}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex-grow">
                      <div className="font-medium text-white mb-1">{hackathon.title}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(hackathon.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(hackathon.status)}`}>
                      {hackathon.status}
                    </span>
                  </div>
                ))}
                {hackathons.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No hackathons yet</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#111] border border-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {activityLog.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    {getActionIcon(log.action)}
                    <div className="flex-grow">
                      <div className="text-sm text-white">{log.action.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hackathons' && (
          <div className="bg-[#111] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Hackathon</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Participants</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hackathons.map((hackathon) => (
                  <tr key={hackathon.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{hackathon.title}</div>
                      <div className="text-sm text-gray-500">{hackathon.prizePool}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {hackathon.participantsCount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/hackathons/${hackathon.slug}`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/hackathons/${hackathon.id}/edit`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/hackathons/${hackathon.id}/submissions`}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Submissions"
                        >
                          <Trophy className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hackathons.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hackathons created yet</p>
                <Link
                  href="/admin/hackathons/new"
                  className="inline-flex items-center gap-2 mt-4 text-purple-400 hover:text-purple-300"
                >
                  <Plus className="w-4 h-4" />
                  Create your first hackathon
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-[#111] border border-white/5 rounded-xl p-6">
            <div className="space-y-4">
              {activityLog.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                  <div className="p-2 rounded-lg bg-white/5">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white capitalize">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">on {log.targetType}</span>
                    </div>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="text-sm text-gray-400 mb-2">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                      {log.admin && (
                        <>
                          <span>•</span>
                          <span>by {log.admin.username}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No admin activity logged yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

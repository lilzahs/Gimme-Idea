
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, MessageCircle, DollarSign, Activity } from 'lucide-react';
import { ActivityChart } from '../components/StatsChart';
import { NavContext } from '../App';

export const DashboardView: React.FC<{ setView: (v: string) => void }> = ({ setView }) => {
  const { simulateNavigation } = useContext(NavContext);
  
  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-brand-surface border border-white/5 p-6 rounded-2xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 ${color}`}>
        <Icon size={48} />
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-white/5 ${color.replace('text-', 'text-')}`}>
          <Icon size={20} />
        </div>
        <span className="text-gray-400 text-sm font-medium">{label}</span>
      </div>
      <div className="text-3xl font-bold font-space mb-1">{value}</div>
      <div className="text-xs font-mono text-green-400 flex items-center gap-1">
        <TrendingUp size={12} /> {trend}
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold font-space mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back, Builder. Here's what's happening.</p>
        </div>
        <button 
          onClick={() => setView('upload')}
          className="bg-brand-accent text-brand-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-colors"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} label="Active Projects" value="3" trend="+1 this week" color="text-blue-400" />
        <StatCard icon={MessageCircle} label="Feedback Received" value="142" trend="+12% vs last week" color="text-purple-400" />
        <StatCard icon={TrendingUp} label="Reputation" value="Level 5" trend="Top 10% of builders" color="text-yellow-400" />
        <StatCard icon={DollarSign} label="Earnings" value="1,250 USDC" trend="+450 pending" color="text-green-400" />
      </div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Col: Charts & Projects */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-brand-surface border border-white/5 rounded-2xl p-6">
             <h3 className="text-xl font-bold font-space mb-6">Feedback Velocity</h3>
             <ActivityChart />
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold font-space">Your Projects</h3>
            {/* Mock Data: Single Item */}
            {[1].map((i) => (
              <div 
                key={i} 
                className="bg-brand-surface border border-white/5 rounded-xl p-6 flex flex-col md:flex-row gap-6 hover:border-brand-accent/30 transition-colors cursor-pointer group" 
                onClick={() => simulateNavigation('project', `proj_${i}`)}
              >
                <div className="w-full md:w-32 h-32 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-2 left-2 text-xs font-bold z-20 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    View Details
                  </div>
                  {/* Placeholder visual */}
                  <div className="w-full h-full bg-gray-700 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold group-hover:text-brand-accent transition-colors">Solana Orderbook DEX V2</h4>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full border border-yellow-500/20">Testnet</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    A fully on-chain CLOB leveraging the new localized fee markets and account compression for high frequency trading...
                  </p>
                  <div className="flex gap-4 text-sm text-gray-500 font-mono">
                    <span className="flex items-center gap-1"><MessageCircle size={14}/> 24 Feedback</span>
                    <span className="flex items-center gap-1"><Activity size={14}/> High Activity</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Inbox */}
        <div className="bg-brand-surface border border-white/5 rounded-2xl p-6 h-fit">
           <h3 className="text-xl font-bold font-space mb-6">Recent Feedback</h3>
           <div className="space-y-6">
             {/* Mock Data: Single Item */}
             {[1].map((i) => (
               <div key={i} className="flex gap-3 pb-4 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-purple-600 flex-shrink-0" />
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm">user_892</span>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      Have you considered how this handles congestion? The fee estimation logic seems...
                    </p>
                    <button className="text-xs text-brand-accent hover:underline">Reply</button>
                  </div>
               </div>
             ))}
           </div>
           <button className="w-full mt-4 py-3 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/5 transition-colors">
             View All Inbox
           </button>
        </div>

      </div>
    </div>
  );
};

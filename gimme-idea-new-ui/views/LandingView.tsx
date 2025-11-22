
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Github } from 'lucide-react';
import { Terminal } from '../components/Terminal';
import { ActivityChart, CategoryChart } from '../components/StatsChart';
import { GeminiValidator } from '../components/GeminiValidator';
import { NavContext } from '../App';

export const LandingView: React.FC = () => {
  const { setView, toggleWalletModal } = useContext(NavContext);

  return (
    <div className="space-y-32 pb-32">
      {/* HERO SECTION */}
      <section className="relative pt-40 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-brand-accent mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              SOLANA DEVNET BETA
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold font-space leading-[0.95] tracking-tighter mb-8">
              Ship faster with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-purple-400">
                real feedback.
              </span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed max-w-lg mb-10 font-inter">
            Get brutal and honest feedback developers and users.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={toggleWalletModal}
                className="group relative px-8 py-4 bg-brand-accent text-brand-black font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Connect Wallet <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
              
              <button onClick={() => setView('explore')} className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-lg rounded-xl hover:bg-white/5 transition-all flex items-center gap-3">
                Explore Projects
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-white/10 pt-8">
              <div>
                <div className="text-3xl font-bold font-mono">2.3K</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Active Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono">18K</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Feedback Given</div>
              </div>
              <div>
                <div className="text-3xl font-bold font-mono text-brand-accent">420+</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Success Stories</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="relative hidden lg:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Terminal 
              code="" 
              className="absolute top-0 right-0 w-80 z-20 rotate-3"
            />
             <div className="absolute -bottom-10 -left-10 z-30 bg-brand-surface p-6 rounded-2xl border border-white/10 shadow-2xl w-72">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
                  <div>
                    <div className="font-bold text-sm">SuperteamDAO</div>
                    <div className="text-xs text-gray-400">Just commented</div>
                  </div>
                </div>
                <p className="text-xs text-gray-300 italic">"The CPI invocation here is inefficient. Consider using address lookup tables to reduce transaction size..."</p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] rounded">Constructive</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] rounded">+50 USDC</span>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="bg-white/[0.02] py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent -z-10 md:block hidden"></div>
            {['Raw Idea', 'Community Roast', 'Iteration', 'Testnet', 'Success'].map((step, i) => (
              <motion.div 
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4 bg-brand-black p-4 rounded-xl border border-white/5 md:w-auto w-full z-10"
              >
                <div className="w-12 h-12 rounded-full bg-brand-surface border border-brand-accent/30 flex items-center justify-center text-brand-accent font-bold font-mono shadow-[0_0_15px_-5px_rgba(255,216,180,0.3)]">
                  {i + 1}
                </div>
                <span className="font-space font-bold text-sm uppercase tracking-widest">{step}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PREVIEW STATS */}
      <section className="px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-space mb-4">Live Ecosystem Pulse</h2>
            <p className="text-gray-400">Real-time feedback velocity and category distribution.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-brand-surface border border-white/5 rounded-3xl p-8 h-80">
               <ActivityChart />
            </div>
            <div className="bg-brand-surface border border-white/5 rounded-3xl p-8 h-80">
               <CategoryChart />
            </div>
          </div>
      </section>

      {/* GEMINI TOOL */}
      <section className="px-6 max-w-7xl mx-auto">
         <GeminiValidator />
      </section>
    </div>
  );
};

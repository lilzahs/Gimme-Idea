
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight, AlertTriangle, Sparkles, Code } from 'lucide-react';
import { validateProjectIdea } from '../services/geminiService';
import { ModalContext } from '../App';

export const UploadView: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [idea, setIdea] = useState('');
  const [validation, setValidation] = useState<string | null>(null);
  const { openModal } = useContext(ModalContext);

  const handleValidate = async () => {
    if (!idea) return;
    setLoading(true);
    const res = await validateProjectIdea(idea);
    setValidation(res);
    setLoading(false);
  };

  const handleLaunch = () => {
      openModal('launchSuccess');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
      
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
        <div className="absolute top-1/2 left-0 h-1 bg-brand-accent -z-10 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${step >= s ? 'bg-brand-accent border-brand-black text-brand-black' : 'bg-brand-black border-white/10 text-gray-500'}`}>
            {step > s ? <Check size={16} /> : s}
          </div>
        ))}
      </div>

      <div className="bg-brand-surface border border-white/5 rounded-3xl p-8 min-h-[500px] flex flex-col">
        
        {step === 1 && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="space-y-6 flex-1">
            <h2 className="text-3xl font-bold font-space">The Basics</h2>
            <p className="text-gray-400">Let's start with the core concept. We'll run a quick AI check to ensure it's viable.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Project Name</label>
                <input type="text" className="w-full bg-brand-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-accent outline-none transition-colors" placeholder="e.g. Supernova DEX" />
              </div>
              
              <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">Elevator Pitch (Idea)</label>
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  className="w-full h-32 bg-brand-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-accent outline-none transition-colors resize-none" 
                  placeholder="Describe your project in detail..." 
                />
              </div>

              <button 
                onClick={handleValidate}
                disabled={loading || !idea}
                className="flex items-center gap-2 text-brand-accent hover:text-white transition-colors text-sm font-bold"
              >
                <Sparkles size={16} /> 
                {loading ? 'Analyzing...' : 'Run AI Feasibility Check'}
              </button>

              {validation && (
                <div className="bg-brand-black/50 border border-brand-accent/20 rounded-xl p-4 max-h-48 overflow-y-auto text-sm text-gray-300 custom-scrollbar">
                  <h4 className="text-brand-accent font-bold mb-2">Gemini Analysis:</h4>
                  <p className="whitespace-pre-wrap">{validation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="space-y-6 flex-1">
             <h2 className="text-3xl font-bold font-space">Technical Specs</h2>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-black border border-white/10 rounded-xl p-4 cursor-pointer hover:border-brand-accent transition-colors">
                   <div className="w-10 h-10 bg-blue-500/20 rounded-lg mb-3 flex items-center justify-center text-blue-400"><Code /></div>
                   <h4 className="font-bold">Smart Contract</h4>
                   <p className="text-xs text-gray-500 mt-1">Rust / Anchor</p>
                </div>
                <div className="bg-brand-black border border-white/10 rounded-xl p-4 cursor-pointer hover:border-brand-accent transition-colors">
                   <div className="w-10 h-10 bg-pink-500/20 rounded-lg mb-3 flex items-center justify-center text-pink-400"><Code /></div>
                   <h4 className="font-bold">Frontend</h4>
                   <p className="text-xs text-gray-500 mt-1">React / Next.js</p>
                </div>
             </div>
             <div>
                <label className="block text-sm font-mono text-gray-400 mb-2">GitHub Repo URL</label>
                <input type="text" className="w-full bg-brand-black border border-white/10 rounded-xl p-4 text-white focus:border-brand-accent outline-none transition-colors" placeholder="https://github.com/username/repo" />
              </div>
          </motion.div>
        )}

        {/* Mock Steps 3 & 4 simplification */}
        {step > 2 && (
             <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="space-y-6 flex-1 flex items-center justify-center text-center">
                <div>
                     <h2 className="text-3xl font-bold font-space mb-4">Almost There!</h2>
                     <p className="text-gray-400">Just click launch to deploy your project page to Gimme Idea.</p>
                </div>
             </motion.div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-8 border-t border-white/5">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Back
          </button>
          {step === 4 ? (
             <button 
                onClick={handleLaunch}
                className="bg-brand-accent text-brand-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-colors"
            >
                Launch Project <Sparkles size={16} />
            </button>
          ) : (
            <button 
                onClick={() => setStep(Math.min(4, step + 1))}
                className="bg-brand-accent text-brand-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white transition-colors"
            >
                Next Step <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

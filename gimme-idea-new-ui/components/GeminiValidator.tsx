
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateProjectIdea } from '../services/geminiService';

export const GeminiValidator: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setLoading(true);
    const result = await validateProjectIdea(idea);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-brand-surface/80 backdrop-blur-xl border border-brand-purple/50 rounded-2xl p-8 relative overflow-hidden shadow-[0_0_50px_-10px_rgba(168,85,247,0.15)]">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 blur-[80px] rounded-full -z-10" />

        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-accent/10 rounded-lg border border-brand-accent/20">
                <Sparkles className="text-brand-accent h-6 w-6 drop-shadow-[0_0_8px_rgba(255,216,180,0.8)]" />
            </div>
            <div>
                <h3 className="text-2xl font-bold font-space text-white">AI Project Validator</h3>
                <p className="text-gray-400 text-sm">Powered by Google Gemini 2.5 Flash</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
                <p className="text-gray-300 font-inter text-sm leading-relaxed">
                    Before submitting to the community, get a rigorous technical and market pre-check. 
                    Our AI acts as a cynical VC and a senior dev rolled into one.
                </p>
                <textarea 
                    className="w-full h-48 bg-brand-black/50 border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:ring-2 focus:ring-brand-accent/50 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-600 backdrop-blur-sm"
                    placeholder="Describe your Solana project idea here... e.g., A decentralized orderbook for tokenized real estate assets using compression..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                />
                <button 
                    onClick={handleAnalyze}
                    disabled={loading || !idea}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-brand-accent hover:shadow-[0_0_20px_rgba(255,216,180,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Validate Idea'}
                </button>
            </div>

            <div className="bg-brand-black/80 rounded-xl border border-white/5 p-6 min-h-[300px] relative backdrop-blur-sm">
                {!analysis && !loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 space-y-2">
                        <AlertTriangle className="h-8 w-8 opacity-50" />
                        <span className="text-sm">Waiting for input...</span>
                    </div>
                )}
                
                {loading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                        <div className="flex space-x-1">
                            <motion.div animate={{ height: [10, 24, 10] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-brand-accent rounded-full shadow-[0_0_10px_#ffd8b4]" />
                            <motion.div animate={{ height: [10, 24, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0.1 }} className="w-1 bg-brand-accent rounded-full shadow-[0_0_10px_#ffd8b4]" />
                            <motion.div animate={{ height: [10, 24, 10] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 bg-brand-accent rounded-full shadow-[0_0_10px_#ffd8b4]" />
                        </div>
                        <span className="text-brand-accent text-xs font-mono uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,216,180,0.5)]">Analyzing Chain Feasibility</span>
                    </div>
                )}

                {analysis && !loading && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="prose prose-invert prose-sm h-full overflow-y-auto pr-2 custom-scrollbar"
                    >
                        {/* Simple markdown rendering for demo purposes */}
                        {analysis.split('\n').map((line, i) => {
                            if (line.startsWith('##')) return <h4 key={i} className="text-brand-accent font-bold mt-4 mb-2 drop-shadow-[0_0_5px_rgba(255,216,180,0.3)]">{line.replace('##', '')}</h4>
                            if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="text-gray-300 ml-4 mb-1">{line.replace(/[*|-]/, '')}</li>
                            return <p key={i} className="text-gray-400 mb-2">{line}</p>
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    </div>
  );
};

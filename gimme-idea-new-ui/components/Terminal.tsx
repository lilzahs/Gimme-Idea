import React from 'react';
import { motion } from 'framer-motion';

export const Terminal: React.FC<{ className?: string, code: string, title?: string }> = ({ className, code, title = "build_deploy.ts" }) => {
  return (
    <motion.div 
      className={`rounded-lg bg-[#1e1e1e] border border-white/10 shadow-2xl overflow-hidden font-mono text-xs ${className}`}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
        </div>
        <div className="text-white/40 text-[10px]">{title}</div>
      </div>
      {/* Content */}
      <div className="p-4 text-gray-300 leading-relaxed whitespace-pre overflow-x-auto">
        <span className="text-brand-accent">import</span> {`{ AnchorProvider }`} <span className="text-brand-accent">from</span> <span className="text-green-400">'@project-serum/anchor'</span>;
        <br />
        <span className="text-purple-400">const</span> program = <span className="text-brand-accent">await</span> workspace.Program.at(PID);
        <br />
        <br />
        <span className="text-gray-500">// Fetching feedback PDA</span>
        <br />
        <span className="text-brand-accent">await</span> program.rpc.<span className="text-yellow-300">submitFeedback</span>(
        <br />
        {'  '}ctx.accounts.authority,
        <br />
        {'  '}content,
        <br />
        {'  '}<span className="text-blue-400">rating</span>: 5
        <br />
        );
      </div>
    </motion.div>
  );
};
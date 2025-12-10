'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle } from 'lucide-react';

interface WalletReminderBadgeProps {
  onConnect: () => void;
}

export const WalletReminderBadge = ({ onConnect }: WalletReminderBadgeProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">Wallet not connected</h4>
          <p className="text-sm text-gray-400 mb-3">
            Connect your Solana wallet to receive tips from the community.
          </p>
          <button
            onClick={onConnect}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black font-semibold rounded-full text-sm hover:shadow-lg hover:shadow-yellow-500/25 transition-all"
          >
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      </div>
    </motion.div>
  );
};

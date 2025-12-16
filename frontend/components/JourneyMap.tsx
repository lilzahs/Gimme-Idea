import React from 'react';
import { motion } from 'framer-motion';
import { JOURNEY_STEPS } from '../constants';
import { ArrowRight } from 'lucide-react';

const JourneyMap: React.FC = () => {
  return (
    <section className="py-12 sm:py-24 px-4 sm:px-6 relative bg-gradient-to-b from-transparent via-[#000000]/60 to-[#000000]/80">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold mb-3 sm:mb-4">From Napkin to <span className="text-gold">Mainnet</span></h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto px-2">The proven pipeline for turning raw concepts into battle-tested protocols.</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 lg:gap-8 relative z-10">
            {JOURNEY_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-black border border-white/10 p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl hover:border-gold/50 transition-colors duration-300 h-full flex flex-col items-center text-center">
                  
                  {/* Icon Step Badge */}
                  <div className="w-8 sm:w-10 lg:w-12 h-8 sm:h-10 lg:h-12 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 group-hover:bg-gold group-hover:text-black transition-colors duration-300 text-gold shadow-[0_0_15px_rgba(255,215,0,0.1)] text-sm sm:text-base">
                    {step.icon}
                  </div>

                  <h3 className="text-sm sm:text-base lg:text-xl font-bold font-display mb-1 sm:mb-2">{step.title}</h3>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-gray-400 leading-relaxed line-clamp-3">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneyMap;
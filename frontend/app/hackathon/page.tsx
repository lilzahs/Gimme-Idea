'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Circle, Clock, QrCode, ArrowRight, Trophy, MapPin, Calendar, User, Users } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

// Mock Data
const TIMELINE_STEPS = [
  {
    id: 1,
    title: 'Đăng Ký',
    date: '01/12 - 15/12',
    status: 'completed',
    description: 'Mở đơn đăng ký cho tất cả các đội thi.'
  },
  {
    id: 2,
    title: 'Submit Ý Tưởng',
    date: '16/12 - 20/12',
    status: 'completed',
    description: 'Nộp bản mô tả chi tiết và MVP sơ bộ.'
  },
  {
    id: 3,
    title: 'Vòng Loại',
    date: '21/12 - 25/12',
    status: 'current',
    description: 'BGK chấm điểm và chọn ra Top 10.'
  },
  {
    id: 4,
    title: 'Chung Kết',
    date: '30/12/2025',
    status: 'upcoming',
    description: 'Demo sản phẩm & Pitching trực tiếp.'
  }
];

const PROJECT_INFO = {
  name: 'Gimme Idea Platform',
  id: '#0012',
  team: 'Alpha Team',
  category: 'Web3 / Blockchain',
  status: 'Waiting for Review',
  thumbnail: '/asset/logo-gmi.png', // Fallback to logo if no mock image
};

export default function HackathonPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COLUMN: VERTICAL TIMELINE (25-30%) */}
        <aside className="lg:col-span-3 relative">
          <div className="sticky top-28">
            <h3 className="text-xl font-bold font-quantico mb-8 text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2">
              Lộ trình
            </h3>
            
            <div className="relative border-l-2 border-white/10 ml-3 space-y-10 pb-4">
              {TIMELINE_STEPS.map((step, index) => {
                const isCompleted = step.status === 'completed';
                const isCurrent = step.status === 'current';
                
                return (
                  <div key={step.id} className="relative pl-8 group">
                    {/* Node Circle */}
                    <div 
                      className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-300 z-10 bg-[#0F0F0F]
                        ${isCompleted ? 'border-green-500 bg-green-500' : 
                          isCurrent ? 'border-[#FFD700] bg-[#FFD700] scale-125 shadow-[0_0_10px_#FFD700]' : 
                          'border-gray-600 bg-[#0F0F0F]'}`}
                    >
                      {isCompleted && <Check className="w-2.5 h-2.5 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </div>

                    {/* Content */}
                    <div className={`transition-all duration-300 ${isCurrent ? 'opacity-100 scale-105 origin-left' : 'opacity-60 group-hover:opacity-100'}`}>
                      <h4 className={`text-lg font-bold ${isCurrent ? 'text-[#FFD700]' : isCompleted ? 'text-green-400' : 'text-gray-300'}`}>
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {step.date}
                      </div>
                      {isCurrent && (
                        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MAIN DASHBOARD (70-75%) */}
        <main className="lg:col-span-9 space-y-8">
          
          {/* A. HEADER & PRIZE POOL */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                  Đang diễn ra: Vòng Loại
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-quantico text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
                GIMME IDEA <br/> <span className="text-[#FFD700]">HACKATHON 2025</span>
              </h1>
            </div>

            {/* Prize Block */}
            <div className="relative group">
               <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700] to-orange-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
               <div className="relative bg-[#1A1A1A] border border-[#FFD700]/30 rounded-xl p-6 min-w-[280px] text-center">
                  <div className="flex items-center justify-center gap-2 text-[#FFD700] mb-1">
                    <Trophy className="w-5 h-5" />
                    <span className="text-sm font-bold uppercase tracking-widest">Tổng Giải Thưởng</span>
                  </div>
                  <div className="text-4xl font-black text-white font-mono tracking-tighter">
                    $1,000<span className="text-xl text-gray-500">.00</span>
                  </div>
               </div>
            </div>
          </div>

          {/* B. TICKET PROJECT CARD */}
          <div className="py-4">
            <h2 className="text-xl font-bold mb-6 text-gray-300 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#FFD700] rounded-full"></span>
              Thẻ Dự Thi Của Bạn
            </h2>

            {/* TICKET CONTAINER */}
            <motion.div 
              whileHover={{ y: -5, rotateX: 5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-full max-w-4xl mx-auto perspective-1000"
            >
              <div className="relative flex flex-col md:flex-row h-auto md:h-64 bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/50 group">
                
                {/* 1. TICKET BODY (70%) */}
                <div className="flex-1 p-6 md:p-8 relative flex flex-col justify-between z-10">
                   {/* Background Glow */}
                   <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10"></div>

                   <div className="flex items-start gap-6">
                      {/* Thumbnail */}
                      <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                         <Image 
                           src={PROJECT_INFO.thumbnail} 
                           alt="Project Thumb" 
                           width={80} 
                           height={80} 
                           className="object-contain opacity-80 group-hover:scale-110 transition-transform duration-500"
                         />
                      </div>
                      
                      {/* Info */}
                      <div>
                        <div className="inline-block px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                          {PROJECT_INFO.category}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-quantico">
                          {PROJECT_INFO.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{PROJECT_INFO.team}</span>
                        </div>
                      </div>
                   </div>

                   <div className="mt-4 md:mt-0 pt-4 border-t border-dashed border-white/10 flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: Dec 19, 2025</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Remote</span>
                      </div>
                   </div>
                </div>

                {/* DIVIDER LINE (Dashed + Notches) */}
                <div className="relative hidden md:flex flex-col items-center justify-center w-0 border-r-2 border-dashed border-[#333] my-4">
                   <div className="absolute -top-6 w-8 h-8 bg-[#0F0F0F] rounded-full z-20"></div>
                   <div className="absolute -bottom-6 w-8 h-8 bg-[#0F0F0F] rounded-full z-20"></div>
                </div>
                {/* Mobile Divider */}
                <div className="md:hidden w-full h-0 border-b-2 border-dashed border-[#333] relative mx-4">
                   <div className="absolute -left-6 -top-4 w-8 h-8 bg-[#0F0F0F] rounded-full z-20"></div>
                   <div className="absolute -right-14 -top-4 w-8 h-8 bg-[#0F0F0F] rounded-full z-20"></div>
                </div>

                {/* 2. TICKET STUB (30%) */}
                <div className="w-full md:w-64 bg-[#151515] p-6 md:p-8 flex flex-col items-center justify-center relative border-l-0 md:border-l border-white/5">
                   {/* Status Badge */}
                   <div className="absolute top-4 right-4 md:top-6 md:right-6">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                   </div>

                   {/* QR Code */}
                   <div className="bg-white p-2 rounded-lg mb-4">
                     <QrCode className="w-20 h-20 text-black" />
                   </div>
                   
                   <div className="text-center space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">Project ID</p>
                      <p className="text-xl font-mono font-bold text-white tracking-widest">{PROJECT_INFO.id}</p>
                   </div>

                   <div className="mt-4 px-3 py-1 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-xs font-bold">
                      {PROJECT_INFO.status}
                   </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* C. FOOTER ACTION */}
          <div className="pt-8 flex flex-col items-center">
            <button 
              onClick={() => router.push('/projects')}
              className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden hover:scale-105 transition-transform duration-300"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
               <span className="flex items-center gap-3">
                 Khám Phá Thư Viện Dự Án
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
               </span>
            </button>
            <p className="mt-4 text-gray-500 text-sm">
              Xem các dự án đối thủ và tìm cảm hứng
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}

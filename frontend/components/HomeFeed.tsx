'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Rss, Rocket, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// All orbiting items configuration (from inside to outside)
const getOrbitItems = (isMobile: boolean) => {
  const baseSize = isMobile ? 38 : 55;
  const sizeDecrement = isMobile ? 3 : 5;
  
  return [
    {
      id: 'ideas',
      name: 'Ideas',
      description: 'Discover and share innovative concepts. The heart of our innovation ecosystem.',
      icon: Lightbulb,
      type: 'feature' as const,
      color: '#FFD700',
      glowColor: 'rgba(255, 215, 0, 0.5)',
      size: baseSize,
      orbitRadius: isMobile ? 70 : 130,
      orbitSpeed: 35,
      startAngle: 0,
      route: '/idea',
      external: false,
    },
    {
      id: 'feeds',
      name: 'Feeds',
      description: 'Curated collections of ideas. Follow topics that interest you.',
      icon: Rss,
      type: 'feature' as const,
      color: '#14F195',
      glowColor: 'rgba(20, 241, 149, 0.5)',
      size: baseSize - sizeDecrement,
      orbitRadius: isMobile ? 105 : 190,
      orbitSpeed: 45,
      startAngle: 60,
      route: '/feeds',
      external: false,
    },
    {
      id: 'hackathons',
      name: 'Hackathons',
      description: 'Build together, compete together. Join exciting blockchain hackathons.',
      icon: Rocket,
      type: 'feature' as const,
      color: '#FF6B6B',
      glowColor: 'rgba(255, 107, 107, 0.5)',
      size: baseSize - sizeDecrement * 2,
      orbitRadius: isMobile ? 140 : 250,
      orbitSpeed: 55,
      startAngle: 120,
      route: '/hackathons',
      external: false,
    },
    {
      id: 'dsuc',
      name: 'DSUC',
      description: 'DUT Superteam University Club - The first Solana blockchain club of Danang University',
      logo: '/dsuc.png',
      type: 'partner' as const,
      gradient: 'linear-gradient(135deg, #0000cc 0%, #feff01 100%)',
      glowColor: 'rgba(0, 0, 204, 0.5)',
      size: baseSize - sizeDecrement * 3,
      orbitRadius: isMobile ? 175 : 310,
      orbitSpeed: 70,
      startAngle: 180,
      route: 'https://dsuc.fun',
      external: true,
    },
    {
      id: 'superteamvn',
      name: 'Superteam VN',
      description: 'Talent Layer of Solana in Vietnam. Empowering builders across the nation.',
      logo: '/superteamvn.png',
      type: 'partner' as const,
      gradient: 'linear-gradient(135deg, #EF4444 0%, #FACC15 100%)',
      glowColor: 'rgba(239, 68, 68, 0.5)',
      size: baseSize - sizeDecrement * 4,
      orbitRadius: isMobile ? 210 : 370,
      orbitSpeed: 90,
      startAngle: 240,
      route: 'https://vn.superteam.fun',
      external: true,
    },
    {
      id: 'solana',
      name: 'Solana',
      description: 'A decentralized blockchain built for scale. Fast, secure, and energy-efficient.',
      logo: '/SOLANA.png',
      type: 'partner' as const,
      gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 50%, #00D1FF 100%)',
      glowColor: 'rgba(153, 69, 255, 0.5)',
      size: baseSize - sizeDecrement * 5,
      orbitRadius: isMobile ? 245 : 430,
      orbitSpeed: 110,
      startAngle: 300,
      route: 'https://solana.com',
      external: true,
    },
  ];
};

const GlitchText = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`relative inline-block ${className}`}>
    <span className="relative z-10">{children}</span>
    <span className="absolute top-0 left-0 text-[#14F195] opacity-60 animate-glitch-1 z-0" aria-hidden="true">{children}</span>
    <span className="absolute top-0 left-0 text-[#FF6B6B] opacity-60 animate-glitch-2 z-0" aria-hidden="true">{children}</span>
  </span>
);

export default function HomeFeed() {
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [orbitAngles, setOrbitAngles] = useState<{ [key: string]: number }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; duration: string; opacity: number }[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isPausedRef = useRef(false);

  const ORBIT_ITEMS = getOrbitItems(isMobile);
  const centerSize = isMobile ? 60 : 90;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const newStars = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      duration: `${Math.random() * 3 + 2}s`,
      opacity: Math.random() * 0.6 + 0.2
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    const initialAngles: { [key: string]: number } = {};
    ORBIT_ITEMS.forEach(item => {
      initialAngles[item.id] = item.startAngle;
    });
    setOrbitAngles(initialAngles);
  }, [isMobile]);

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      if (!isPausedRef.current) {
        setOrbitAngles(prev => {
          const newAngles: { [key: string]: number } = {};
          ORBIT_ITEMS.forEach(item => {
            const currentAngle = prev[item.id] ?? item.startAngle;
            newAngles[item.id] = (currentAngle + (360 / item.orbitSpeed) * delta) % 360;
          });
          return newAngles;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isMobile]);

  const handleHover = useCallback((itemId: string | null) => {
    setHoveredItem(itemId);
    isPausedRef.current = itemId !== null;
  }, []);

  const getItemPosition = useCallback((item: ReturnType<typeof getOrbitItems>[0]) => {
    const angle = (orbitAngles[item.id] ?? item.startAngle) * (Math.PI / 180);
    const ellipseRatio = isMobile ? 0.6 : 0.5;
    return { 
      x: Math.cos(angle) * item.orbitRadius, 
      y: Math.sin(angle) * item.orbitRadius * ellipseRatio 
    };
  }, [orbitAngles, isMobile]);

  const handleClick = (route: string, external?: boolean) => {
    if (external) {
      window.open(route, '_blank');
    } else {
      router.push(route);
    }
  };

  // Desktop view
  if (!isMobile) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute inset-0 bg-gradient-to-b from-[#05010d] via-[#0a0015] to-[#020105]" />
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#9945FF]/15 rounded-full blur-[150px] opacity-40" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#14F195]/10 rounded-full blur-[150px] opacity-30" />
          
          <div className="stars-container">
            {stars.map((star) => (
              <div
                key={star.id}
                className="star"
                style={{
                  top: star.top,
                  left: star.left,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  '--duration': star.duration,
                  '--opacity': star.opacity
                } as React.CSSProperties}
              />
            ))}
            <div className="shooting-star" style={{ top: '15%', left: '85%' }} />
            <div className="shooting-star" style={{ top: '55%', left: '5%', animationDelay: '2.5s' }} />
            <div className="shooting-star" style={{ top: '35%', left: '60%', animationDelay: '5s' }} />
            <div className="shooting-star" style={{ top: '75%', left: '30%', animationDelay: '8s' }} />
          </div>
        </div>

        <div className="pt-28 md:pt-32 px-4 sm:px-6 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              Welcome to{' '}
              <span className="font-quantico">
                <span className="text-white">Gimme</span>
                <span className="text-[#FFD700]">Idea</span>
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
              Explore our innovation universe. Tap any planet to discover.
            </p>
          </motion.div>

          <div className="relative w-full h-[600px] lg:h-[700px] xl:h-[750px] flex items-center justify-center">
            {ORBIT_ITEMS.map(item => (
              <div 
                key={`orbit-${item.id}`} 
                className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.04] pointer-events-none"
                style={{ 
                  width: item.orbitRadius * 2, 
                  height: item.orbitRadius,
                  transform: 'translate(-50%, -50%)'
                }} 
              />
            ))}

            <motion.div
              className="absolute cursor-pointer select-none z-50"
              style={{ left: '50%', top: '50%', x: -centerSize / 2, y: -centerSize / 2 }}
              onMouseEnter={() => handleHover('gimme-idea')}
              onMouseLeave={() => handleHover(null)}
              onClick={() => handleClick('/idea')}
              animate={{ scale: hoveredItem === 'gimme-idea' ? 1.15 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <div 
                className="absolute rounded-full blur-2xl transition-all duration-500"
                style={{ 
                  inset: -centerSize * 0.3,
                  background: 'radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)',
                  opacity: hoveredItem === 'gimme-idea' ? 0.8 : 0.4,
                }} 
              />
              <div 
                className="relative flex items-center justify-center"
                style={{ width: centerSize, height: centerSize }}
              >
                <Image 
                  src="/logo-gmi.png" 
                  alt="Gimme Idea" 
                  width={centerSize} 
                  height={centerSize}
                  className="object-contain drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
                />
              </div>
              <motion.div 
                animate={{ opacity: hoveredItem === 'gimme-idea' ? 1 : 0.7 }}
                className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none"
                style={{ top: centerSize + 8 }}
              >
                <p className="font-quantico font-bold text-white text-sm">
                  Gimme<span className="text-[#FFD700]">Idea</span>
                </p>
              </motion.div>
            </motion.div>

            {ORBIT_ITEMS.map(item => {
              const pos = getItemPosition(item);
              const isHovered = hoveredItem === item.id;
              const Icon = 'icon' in item ? item.icon : null;

              return (
                <motion.div
                  key={item.id}
                  className="absolute cursor-pointer select-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    x: pos.x - item.size / 2,
                    y: pos.y - item.size / 2,
                    zIndex: isHovered ? 100 : 20,
                  }}
                  onMouseEnter={() => handleHover(item.id)}
                  onMouseLeave={() => handleHover(null)}
                  onClick={() => handleClick(item.route, item.external)}
                  animate={{ scale: isHovered ? 1.35 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <div 
                    className="absolute rounded-full blur-xl transition-all duration-300"
                    style={{ 
                      inset: -item.size * 0.4,
                      background: item.glowColor,
                      opacity: isHovered ? 0.8 : 0.4,
                    }} 
                  />

                  <div 
                    className="relative rounded-full flex items-center justify-center overflow-hidden transition-all duration-300"
                    style={{
                      width: item.size, 
                      height: item.size,
                      background: item.type === 'feature' 
                        ? `radial-gradient(circle at 30% 25%, white, ${item.color} 60%)`
                        : item.gradient,
                      boxShadow: `0 0 ${isHovered ? 40 : 15}px ${item.glowColor}`,
                    }}
                  >
                    {item.type === 'feature' && Icon ? (
                      <Icon 
                        style={{ 
                          width: item.size * 0.45, 
                          height: item.size * 0.45, 
                          color: '#1a1a2e',
                        }} 
                      />
                    ) : (
                      <Image 
                        src={(item as any).logo} 
                        alt={item.name} 
                        width={item.size * 0.6} 
                        height={item.size * 0.6}
                        className="object-contain"
                      />
                    )}
                  </div>

                  <AnimatePresence>
                    {isHovered && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-56 md:w-64 p-4 rounded-2xl z-50 overflow-hidden"
                        style={{ 
                          background: 'rgba(5, 3, 15, 0.95)',
                          border: `1px solid ${item.type === 'feature' ? item.color : 'rgba(255,255,255,0.15)'}40`,
                          boxShadow: `0 0 30px ${item.glowColor}, inset 0 0 30px rgba(0,0,0,0.5)`,
                        }}
                      >
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent animate-scan" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            {item.type === 'feature' && Icon ? (
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${item.color}20` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: item.color }} />
                              </div>
                            ) : (
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
                                style={{ background: item.gradient }}
                              >
                                <Image 
                                  src={(item as any).logo} 
                                  alt={item.name} 
                                  width={20} 
                                  height={20}
                                  className="object-contain"
                                />
                              </div>
                            )}
                            <GlitchText className="font-bold text-white text-sm">{item.name}</GlitchText>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mb-3">{item.description}</p>
                          <div 
                            className="pt-2 border-t border-white/10 flex items-center justify-center gap-1.5 text-xs font-medium"
                            style={{ color: item.type === 'feature' ? item.color : '#fff' }}
                          >
                            <GlitchText>{item.external ? 'Visit Website' : 'Explore'}</GlitchText>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Mobile view
  return (
    <div className="min-h-screen relative overflow-hidden pb-20">
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#05010d] via-[#0a0015] to-[#020105]" />
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-[#9945FF]/15 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[350px] h-[350px] bg-[#14F195]/10 rounded-full blur-[120px] opacity-30" />
        
        <div className="stars-container">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                '--duration': star.duration,
                '--opacity': star.opacity
              } as React.CSSProperties}
            />
          ))}
          <div className="shooting-star" style={{ top: '20%', left: '80%' }} />
          <div className="shooting-star" style={{ top: '50%', left: '10%', animationDelay: '3s' }} />
        </div>
      </div>

      <div className="pt-24 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="mx-auto mb-4 relative w-20 h-20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-[#FFD700]/20 blur-2xl rounded-full" />
            <Image 
              src="/logo-gmi.png" 
              alt="Gimme Idea" 
              width={80} 
              height={80}
              className="relative z-10 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]"
            />
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-2 tracking-tight">
            Welcome to{' '}
            <span className="font-quantico">
              <span className="text-white">Gimme</span>
              <span className="text-[#FFD700]">Idea</span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Explore our innovation universe
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-1">Features</h2>
          <div className="space-y-3">
            {ORBIT_ITEMS.filter(item => item.type === 'feature').map((item, index) => {
              const Icon = 'icon' in item ? item.icon : null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => handleClick(item.route, item.external)}
                  className="glass-panel rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ borderColor: `${item.color}20` }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ 
                      background: `radial-gradient(circle at 30% 25%, white, ${item.color} 70%)`,
                      boxShadow: `0 0 20px ${item.glowColor}`
                    }}
                  >
                    {Icon && <Icon className="w-6 h-6 text-[#1a1a2e]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm mb-0.5">{item.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-1">Ecosystem</h2>
          <div className="grid grid-cols-3 gap-3">
            {ORBIT_ITEMS.filter(item => item.type === 'partner').map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                onClick={() => handleClick(item.route, item.external)}
                className="glass-panel rounded-2xl p-3 flex flex-col items-center cursor-pointer active:scale-[0.95] transition-transform"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-2 overflow-hidden"
                  style={{ 
                    background: item.gradient,
                    boxShadow: `0 0 15px ${item.glowColor}`
                  }}
                >
                  <Image 
                    src={(item as any).logo} 
                    alt={item.name} 
                    width={32} 
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-white text-center">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="h-20" />
      </div>
    </div>
  );
}

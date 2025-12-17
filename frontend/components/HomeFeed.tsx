'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Rocket, Users, Trophy, Rss, Sparkles, 
  TrendingUp, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import Image from 'next/image';

// Planet configuration - ordered by importance
const PLANETS = [
  {
    id: 'ideas',
    name: 'Ideas',
    description: 'The core of innovation',
    icon: Lightbulb,
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    size: 90,
    orbitRadius: 0,
    orbitSpeed: 0,
    route: '/idea',
    stats: { label: 'Total Ideas', key: 'ideas' }
  },
  {
    id: 'hackathons',
    name: 'Hackathons',
    description: 'Build together, win together',
    icon: Rocket,
    color: '#FF6B6B',
    glowColor: 'rgba(255, 107, 107, 0.3)',
    size: 55,
    orbitRadius: 140,
    orbitSpeed: 25,
    route: '/hackathons',
    stats: { label: 'Active Events', key: 'hackathons' }
  },
  {
    id: 'feeds',
    name: 'GmiFeeds',
    description: 'Curated idea collections',
    icon: Rss,
    color: '#14F195',
    glowColor: 'rgba(20, 241, 149, 0.3)',
    size: 50,
    orbitRadius: 200,
    orbitSpeed: 35,
    route: '/feeds',
    stats: { label: 'Public Feeds', key: 'feeds' }
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard',
    description: 'Top innovators',
    icon: Trophy,
    color: '#9945FF',
    glowColor: 'rgba(153, 69, 255, 0.3)',
    size: 45,
    orbitRadius: 260,
    orbitSpeed: 45,
    route: '/leaderboard',
    stats: { label: 'Creators', key: 'users' }
  },
  {
    id: 'community',
    name: 'Community',
    description: 'Connect with builders',
    icon: Users,
    color: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.3)',
    size: 40,
    orbitRadius: 320,
    orbitSpeed: 55,
    route: '/leaderboard',
    stats: { label: 'Members', key: 'community' }
  },
];

// Stars
const PARTICLES = Array.from({ length: 30 }).map((_, i) => ({
  id: i,
  size: Math.random() * 3 + 1,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 20 + 10,
  delay: Math.random() * 5,
}));

export default function HomeFeed() {
  const router = useRouter();
  const { user } = useAuth();
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [stats, setStats] = useState({ ideas: 0, hackathons: 0, feeds: 0, users: 0, community: 0 });
  const [orbitAngles, setOrbitAngles] = useState<{ [key: string]: number }>({});
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ideasRes, feedsRes] = await Promise.all([
          apiClient.getProjects({ type: 'idea', limit: 1 }),
          apiClient.getFeeds({ limit: 1 }),
        ]);
        setStats({ ideas: 100, hackathons: 3, feeds: feedsRes.data?.length || 0, users: 50, community: 200 });
      } catch (e) { console.log('Stats error'); }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      setOrbitAngles(prev => {
        const newAngles: { [key: string]: number } = {};
        PLANETS.forEach(planet => {
          if (planet.orbitSpeed > 0) {
            const currentAngle = prev[planet.id] || Math.random() * 360;
            newAngles[planet.id] = (currentAngle + (360 / planet.orbitSpeed) * delta) % 360;
          }
        });
        return newAngles;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  const getPlanetPosition = (planet: typeof PLANETS[0]) => {
    if (planet.orbitRadius === 0) return { x: 0, y: 0 };
    const angle = (orbitAngles[planet.id] || 0) * (Math.PI / 180);
    return { x: Math.cos(angle) * planet.orbitRadius, y: Math.sin(angle) * planet.orbitRadius * 0.4 };
  };

  const Planet = ({ planet }: { planet: typeof PLANETS[0] }) => {
    const pos = getPlanetPosition(planet);
    const isHovered = hoveredPlanet === planet.id;
    const isSun = planet.orbitRadius === 0;
    const Icon = planet.icon;

    return (
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: '50%', top: '50%',
          transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
          zIndex: isHovered ? 100 : isSun ? 50 : 10,
        }}
        onMouseEnter={() => setHoveredPlanet(planet.id)}
        onMouseLeave={() => setHoveredPlanet(null)}
        onClick={() => router.push(planet.route)}
        whileHover={{ scale: 1.15 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="absolute inset-0 rounded-full blur-xl transition-all duration-500"
          style={{ background: planet.glowColor, transform: `scale(${isHovered ? 2.5 : isSun ? 2 : 1.5})`, opacity: isHovered ? 0.8 : isSun ? 0.6 : 0.4 }} />
        <div className="relative rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            width: planet.size, height: planet.size,
            background: `radial-gradient(circle at 30% 30%, ${planet.color}, ${planet.color}88 50%, ${planet.color}44)`,
            boxShadow: `0 0 ${isHovered ? 40 : 20}px ${planet.glowColor}, inset -${planet.size / 4}px -${planet.size / 4}px ${planet.size / 2}px rgba(0,0,0,0.3), inset ${planet.size / 8}px ${planet.size / 8}px ${planet.size / 4}px rgba(255,255,255,0.2)`,
          }}>
          <Icon style={{ width: planet.size * 0.4, height: planet.size * 0.4, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
        </div>
        <motion.div initial={{ opacity: isSun ? 1 : 0, y: 10 }} animate={{ opacity: isHovered || isSun ? 1 : 0, y: isHovered || isSun ? 0 : 10 }}
          className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap" style={{ top: planet.size + 10 }}>
          <p className="font-bold text-white text-sm">{planet.name}</p>
          {(isHovered || isSun) && <p className="text-xs text-gray-400 mt-0.5">{planet.description}</p>}
        </motion.div>
        {isHovered && !isSun && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-full mb-4 w-48 p-4 rounded-2xl border border-white/10 backdrop-blur-xl z-50"
            style={{ background: `linear-gradient(135deg, ${planet.color}15, rgba(0,0,0,0.8))` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-5 h-5" style={{ color: planet.color }} />
              <span className="font-bold text-white">{planet.name}</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">{planet.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{planet.stats.label}</span>
              <span className="text-sm font-bold" style={{ color: planet.color }}>{stats[planet.stats.key as keyof typeof stats] || '—'}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-center gap-1 text-xs" style={{ color: planet.color }}>
              <span>Explore</span><ChevronRight className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-[-1]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1a] via-[#0d0d20] to-[#0a0a1a]" />
        <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] bg-[#1a0a3e] rounded-full blur-[150px] opacity-30" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[800px] h-[800px] bg-[#3e1a0a] rounded-full blur-[150px] opacity-30" />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-[#0a3e1a] rounded-full blur-[120px] opacity-20" />
        {PARTICLES.map(p => (
          <motion.div key={p.id} className="absolute rounded-full bg-white"
            style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%` }}
            animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }} />
        ))}
        <div className="shooting-star" style={{ top: '15%', left: '85%' }} />
        <div className="shooting-star" style={{ top: '45%', left: '5%', animationDelay: '3s' }} />
        <div className="shooting-star" style={{ top: '75%', left: '60%', animationDelay: '7s' }} />
      </div>

      <div className="pt-24 sm:pt-28 px-4 sm:px-6 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-3 tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFD700]">Gimme Idea</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">Explore our ecosystem of innovation. Click on any planet to discover more.</p>
        </motion.div>
      </div>

      <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] flex items-center justify-center mt-8">
        {PLANETS.filter(p => p.orbitRadius > 0).map(planet => (
          <div key={`orbit-${planet.id}`} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5"
            style={{ width: planet.orbitRadius * 2, height: planet.orbitRadius * 0.8, transform: 'translate(-50%, -50%)' }} />
        ))}
        {PLANETS.map(planet => <Planet key={planet.id} planet={planet} />)}
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-4xl mx-auto px-4 pb-6">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-around">
            {[
              { icon: Lightbulb, label: 'Ideas', value: stats.ideas, color: '#FFD700' },
              { icon: Rocket, label: 'Hackathons', value: stats.hackathons, color: '#FF6B6B' },
              { icon: Users, label: 'Builders', value: stats.community, color: '#3B82F6' },
              { icon: TrendingUp, label: 'Growing', value: '+24%', color: '#14F195' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}20` }}>
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: item.color }} />
                </div>
                <div className="hidden sm:block"><p className="text-xs text-gray-500">{item.label}</p><p className="font-bold text-white">{item.value}</p></div>
                <span className="sm:hidden font-bold text-sm" style={{ color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {user && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-24 left-4 sm:left-6 z-20">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-3 pr-5">
            {user.avatar ? <Image src={user.avatar} alt={user.username} width={40} height={40} className="rounded-full border-2 border-[#FFD700]/30" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFD700]/30 to-[#FFD700]/10 flex items-center justify-center"><span className="text-[#FFD700] font-bold">{user.username?.charAt(0).toUpperCase()}</span></div>}
            <div><p className="text-xs text-gray-500">Welcome back</p><p className="font-semibold text-white text-sm">{user.username}</p></div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="fixed top-24 right-4 sm:right-6 z-20">
        <button onClick={() => router.push('/idea/new')} className="flex items-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-[#FFD700]/30 transition-all">
          <Sparkles className="w-4 h-4" /><span className="hidden sm:inline">New Idea</span>
        </button>
      </motion.div>
    </div>
  );
}

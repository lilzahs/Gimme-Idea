'use client';

import React from 'react';

// Enhanced constellation with more stars - increased sizes for better visibility
const CONSTELLATION_STARS = [
  // Top area
  { x: 8, y: 8, size: 3, brightness: 1 },
  { x: 18, y: 12, size: 2.5, brightness: 0.8 },
  { x: 32, y: 6, size: 4, brightness: 1 },
  { x: 45, y: 14, size: 2.5, brightness: 0.9 },
  { x: 58, y: 8, size: 3.5, brightness: 1 },
  { x: 72, y: 12, size: 2.5, brightness: 0.8 },
  { x: 85, y: 6, size: 3, brightness: 1 },
  { x: 95, y: 15, size: 2.5, brightness: 0.9 },
  
  // Upper middle
  { x: 12, y: 25, size: 3, brightness: 0.9 },
  { x: 25, y: 30, size: 2.5, brightness: 0.8 },
  { x: 38, y: 22, size: 4, brightness: 1 },
  { x: 52, y: 28, size: 2.5, brightness: 0.8 },
  { x: 65, y: 24, size: 3.5, brightness: 1 },
  { x: 78, y: 32, size: 2.5, brightness: 0.9 },
  { x: 92, y: 26, size: 3, brightness: 1 },
  
  // Middle
  { x: 5, y: 45, size: 3, brightness: 0.9 },
  { x: 18, y: 48, size: 2.5, brightness: 0.8 },
  { x: 30, y: 42, size: 4, brightness: 1 },
  { x: 42, y: 50, size: 2.5, brightness: 0.8 },
  { x: 55, y: 44, size: 3.5, brightness: 1 },
  { x: 68, y: 52, size: 2.5, brightness: 0.9 },
  { x: 82, y: 46, size: 3, brightness: 1 },
  { x: 94, y: 50, size: 2.5, brightness: 0.8 },
  
  // Lower middle
  { x: 10, y: 65, size: 3, brightness: 0.9 },
  { x: 22, y: 70, size: 2.5, brightness: 0.8 },
  { x: 35, y: 62, size: 4, brightness: 1 },
  { x: 48, y: 68, size: 2.5, brightness: 0.8 },
  { x: 62, y: 72, size: 3.5, brightness: 1 },
  { x: 75, y: 66, size: 2.5, brightness: 0.9 },
  { x: 88, y: 70, size: 3, brightness: 1 },
  
  // Bottom area
  { x: 6, y: 85, size: 3, brightness: 0.9 },
  { x: 20, y: 88, size: 2.5, brightness: 0.8 },
  { x: 34, y: 82, size: 4, brightness: 1 },
  { x: 50, y: 90, size: 2.5, brightness: 0.8 },
  { x: 65, y: 84, size: 3.5, brightness: 1 },
  { x: 80, y: 92, size: 2.5, brightness: 0.9 },
  { x: 92, y: 86, size: 3, brightness: 1 },
  
  // Extra scattered stars for depth
  { x: 3, y: 18, size: 2, brightness: 0.6 },
  { x: 15, y: 38, size: 2, brightness: 0.7 },
  { x: 27, y: 55, size: 2, brightness: 0.6 },
  { x: 40, y: 35, size: 2.5, brightness: 0.7 },
  { x: 60, y: 38, size: 2, brightness: 0.6 },
  { x: 73, y: 55, size: 2, brightness: 0.7 },
  { x: 97, y: 38, size: 2, brightness: 0.6 },
  { x: 85, y: 78, size: 2, brightness: 0.7 },
  { x: 45, y: 78, size: 2.5, brightness: 0.6 },
  { x: 15, y: 78, size: 2, brightness: 0.7 },
];

// Connect stars to form constellations
const CONSTELLATION_LINES = [
  // Top constellation
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
  // Upper diagonal connections
  [1, 8], [2, 10], [4, 12], [6, 14],
  // Upper middle constellation
  [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 14],
  // Middle connections
  [8, 15], [9, 16], [10, 17], [12, 19], [14, 21],
  // Middle constellation
  [15, 16], [16, 17], [17, 18], [18, 19], [19, 20], [20, 21], [21, 22],
  // Lower connections
  [15, 23], [17, 25], [19, 27], [21, 29],
  // Lower middle constellation
  [23, 24], [24, 25], [25, 26], [26, 27], [27, 28], [28, 29],
  // Bottom connections
  [23, 30], [25, 32], [27, 34], [29, 36],
  // Bottom constellation
  [30, 31], [31, 32], [32, 33], [33, 34], [34, 35], [35, 36],
];

interface ConstellationBackgroundProps {
  opacity?: number;
  showShootingStars?: boolean;
  showGradientOrbs?: boolean;
  className?: string;
}

export default function ConstellationBackground({ 
  opacity = 0.35, 
  showShootingStars = true,
  showGradientOrbs = true,
  className = ''
}: ConstellationBackgroundProps) {
  return (
    <div className={`fixed inset-0 z-[-1] pointer-events-none overflow-hidden ${className}`}>
      {/* Grid background - enhanced */}
      <div className="bg-grid opacity-40"></div>
      
      {/* Gradient orbs - more vibrant */}
      {showGradientOrbs && (
        <>
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-[#2e1065] rounded-full blur-[150px] opacity-50 animate-pulse-slow" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-[#422006] rounded-full blur-[150px] opacity-50 animate-pulse-slow" style={{ animationDelay: '4s' }} />
          <div className="absolute top-[40%] right-[-15%] w-[500px] h-[500px] bg-[#14F195]/15 rounded-full blur-[120px] opacity-40 animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-[#FFD700]/10 rounded-full blur-[100px] opacity-30 animate-pulse-slow" style={{ animationDelay: '6s' }} />
        </>
      )}
      
      {/* Constellation SVG - enhanced */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity }}>
        <defs>
          {/* Enhanced glow filter for stars */}
          <filter id="starGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Golden glow for special stars */}
          <filter id="starGlowGold" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feFlood floodColor="#FFD700" floodOpacity="0.5" result="goldColor"/>
            <feComposite in="goldColor" in2="coloredBlur" operator="in" result="goldBlur"/>
            <feMerge>
              <feMergeNode in="goldBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradient for lines - more visible */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.15" />
            <stop offset="50%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0.15" />
          </linearGradient>
          
          {/* Golden line gradient */}
          <linearGradient id="lineGradientGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        {/* Constellation lines - thicker */}
        {CONSTELLATION_LINES.map(([from, to], i) => (
          <line
            key={`line-${i}`}
            x1={`${CONSTELLATION_STARS[from].x}%`}
            y1={`${CONSTELLATION_STARS[from].y}%`}
            x2={`${CONSTELLATION_STARS[to].x}%`}
            y2={`${CONSTELLATION_STARS[to].y}%`}
            stroke={i % 5 === 0 ? "url(#lineGradientGold)" : "url(#lineGradient)"}
            strokeWidth={i % 5 === 0 ? "1" : "0.8"}
          />
        ))}
        
        {/* Constellation stars with enhanced glow */}
        {CONSTELLATION_STARS.map((star, i) => (
          <g key={`star-${i}`}>
            {/* Outer glow */}
            <circle
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * 2}
              fill={i % 7 === 0 ? "#FFD700" : "white"}
              fillOpacity={0.1 * (star.brightness || 0.8)}
            />
            {/* Main star */}
            <circle
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size}
              fill={i % 7 === 0 ? "#FFD700" : "white"}
              fillOpacity={star.brightness || 0.8}
              filter={i % 7 === 0 ? "url(#starGlowGold)" : "url(#starGlow)"}
            />
          </g>
        ))}
        
        {/* Animated twinkling stars */}
        <style>
          {`
            @keyframes twinkle-star {
              0%, 100% { opacity: 0.4; }
              50% { opacity: 1; }
            }
          `}
        </style>
        {[...Array(15)].map((_, i) => (
          <circle
            key={`twinkle-${i}`}
            cx={`${10 + (i * 6) % 85}%`}
            cy={`${15 + (i * 11) % 75}%`}
            r={1.5}
            fill="white"
            style={{
              animation: `twinkle-star ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </svg>
      
      {/* Shooting stars */}
      {showShootingStars && (
        <>
          <div className="shooting-star" style={{ top: '12%', left: '90%' }} />
          <div className="shooting-star" style={{ top: '40%', left: '8%', animationDelay: '5s' }} />
          <div className="shooting-star" style={{ top: '70%', left: '85%', animationDelay: '10s' }} />
        </>
      )}
    </div>
  );
}

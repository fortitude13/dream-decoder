import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  label?: string;
}

interface DreamConstellationProps {
  symbols: { name: string; meaning: string }[];
}

export default function DreamConstellation({ symbols }: DreamConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = useState<Star[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    
    // Generate main stars for symbols
    const newStars: Star[] = symbols.map((symbol, i) => {
      // Distribute them somewhat evenly but randomly
      const angle = (i / symbols.length) * Math.PI * 2 + Math.random() * 0.5;
      const radius = Math.min(width, height) * 0.3 + Math.random() * 40;
      return {
        id: i,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        size: 4 + Math.random() * 3,
        label: symbol.name
      };
    });

    // Add some background decorative stars
    for (let i = 0; i < 15; i++) {
      newStars.push({
        id: symbols.length + i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2
      });
    }

    setStars(newStars);
  }, [symbols]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] relative rounded-3xl overflow-hidden bg-gradient-to-b from-black/40 to-purple-900/20 border border-white/5 cursor-crosshair"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          
          {/* Draw lines between main stars when hovered */}
          {isHovered && symbols.length > 1 && (
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {symbols.map((_, i) => {
                const start = stars[i];
                const end = stars[(i + 1) % symbols.length];
                if (!start || !end) return null;
                return (
                  <line
                    key={`line-${i}`}
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke="rgba(167, 139, 250, 0.3)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                );
              })}
              {/* Connect to mouse */}
              {symbols.map((_, i) => {
                const star = stars[i];
                if (!star) return null;
                const dist = Math.hypot(star.x - mousePos.x, star.y - mousePos.y);
                if (dist > 150) return null;
                return (
                  <line
                    key={`mouse-line-${i}`}
                    x1={star.x}
                    y1={star.y}
                    x2={mousePos.x}
                    y2={mousePos.y}
                    stroke={`rgba(167, 139, 250, ${1 - dist/150})`}
                    strokeWidth="1"
                  />
                );
              })}
            </motion.g>
          )}

          {/* Draw Stars */}
          {stars.map((star, i) => (
            <g key={star.id}>
              {star.label && (
                <circle
                  cx={star.x}
                  cy={star.y}
                  r={star.size * 4}
                  fill="url(#glow)"
                />
              )}
              <circle
                cx={star.x}
                cy={star.y}
                r={star.size}
                fill={star.label ? "#e9d5ff" : "#cbd5e1"}
                opacity={star.label ? 1 : 0.4}
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Labels */}
      {stars.map(star => star.label && (
        <div
          key={`label-${star.id}`}
          className="absolute text-xs font-serif text-purple-200 tracking-widest pointer-events-none transition-opacity duration-300"
          style={{
            left: star.x + 10,
            top: star.y - 10,
            opacity: isHovered ? 1 : 0.5,
            textShadow: '0 0 10px rgba(167, 139, 250, 0.8)'
          }}
        >
          {star.label}
        </div>
      ))}

      {/* Interactive Glow at Mouse */}
      {isHovered && (
        <div 
          className="absolute w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
          style={{ left: mousePos.x, top: mousePos.y }}
        />
      )}
    </div>
  );
}

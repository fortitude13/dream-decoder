import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingHeroImageProps {
  src: string;
  alt: string;
  glowColorClass: string; // e.g., 'bg-purple-500/30'
  shadowColor: string; // e.g., 'rgba(168,85,247,0.4)'
  onClick?: () => void;
  disabled?: boolean;
}

export default function FloatingHeroImage({ src, alt, glowColorClass, shadowColor, onClick, disabled = false }: FloatingHeroImageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [burstParticles, setBurstParticles] = useState<{ id: number; x: number; y: number; vx: number; vy: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (Math.random() > 0.6) {
      setParticles(prev => [...prev, { id: Date.now(), x, y }].slice(-20));
    }
  };

  const handleClick = () => {
    if (disabled || !onClick) return;
    setIsClicked(true);
    
    // Burst of particles
    const burst = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      x: containerRef.current ? containerRef.current.offsetWidth / 2 : 180,
      y: containerRef.current ? containerRef.current.offsetHeight / 2 : 180,
      vx: (Math.random() - 0.5) * 350,
      vy: (Math.random() - 0.5) * 350,
    }));
    setBurstParticles(burst);
    
    setTimeout(() => {
      onClick();
      setIsClicked(false);
    }, 800);
  };

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-[60vw] h-[60vw] sm:w-[280px] sm:h-[280px] md:w-[360px] md:h-[360px] mb-8 mt-0 shrink-0 overflow-visible ${disabled ? 'opacity-90' : ''} ${onClick && !disabled ? 'cursor-pointer' : 'cursor-default'}`}
      animate={{ y: [0, -15, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      {/* Soft Glow behind */}
      <motion.div 
        className={`absolute inset-0 rounded-full ${glowColorClass} blur-3xl`}
        animate={{ 
          scale: isClicked ? 1.8 : (isHovered ? 1.2 : 1),
          opacity: isClicked ? 1 : (isHovered ? 0.6 : 0.3)
        }}
        transition={{ duration: isClicked ? 0.3 : 0.8 }}
      />
      
      <motion.img 
        src={src}
        alt={alt}
        className="w-full h-full object-contain relative z-10"
        style={{ filter: `drop-shadow(0 0 15px ${shadowColor})` }}
        referrerPolicy="no-referrer"
        animate={{ filter: `drop-shadow(0 0 ${isHovered ? '30px' : '15px'} ${shadowColor}) brightness(${isClicked ? 1.4 : (isHovered ? 1.15 : 1)})` }}
        transition={{ duration: 0.3 }}
      />

      {/* Hover Shimmer */}
      <AnimatePresence>
        {isHovered && !isClicked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent z-20 pointer-events-none"
            style={{
              maskImage: 'radial-gradient(circle, black 40%, transparent 60%)',
              WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 60%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Mouse Move Particles */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: 1.5, 
              x: p.x + (Math.random() - 0.5) * 80, 
              y: p.y - 50 - Math.random() * 80 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] z-30 pointer-events-none"
          />
        ))}
      </AnimatePresence>

      {/* Burst Particles */}
      <AnimatePresence>
        {burstParticles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 1, x: p.x, y: p.y }}
            animate={{ 
              opacity: 0, 
              scale: 0, 
              x: p.x + p.vx, 
              y: p.y + p.vy 
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-40 pointer-events-none"
          />
        ))}
      </AnimatePresence>
      
      {/* Orbiting stars when hovered */}
      <AnimatePresence>
        {isHovered && !isClicked && (
          <>
            <motion.div
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.5 } }}
              className="absolute inset-[-40px] rounded-full border border-white/10 border-dashed z-0 pointer-events-none"
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]" />
              <div className="absolute bottom-0 left-1/4 w-1.5 h-1.5 bg-white/80 rounded-full shadow-[0_0_10px_white]" />
              <div className="absolute top-1/2 right-0 w-1 h-1 bg-white/60 rounded-full shadow-[0_0_8px_white]" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

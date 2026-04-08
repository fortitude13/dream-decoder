import React, { useEffect, useRef, useState } from 'react';

interface AnalysisConstellationProps {
  keywords: string[];
  step: number; // 0, 1, 2
}

export default function AnalysisConstellation({ keywords, step }: AnalysisConstellationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [isComplete, setIsComplete] = useState(false);

  const displayKeywords = keywords.length > 0 ? keywords : ['물', '비행', '추락', '어둠', '동물'];

  useEffect(() => {
    if (step >= 2) {
      // After a short delay when step is 2, trigger completion
      const timer = setTimeout(() => setIsComplete(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes = displayKeywords.map((kw, i) => ({
      id: i,
      label: kw,
      x: width * 0.2 + Math.random() * width * 0.6,
      y: height * 0.2 + Math.random() * height * 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      baseRadius: 3 + Math.random() * 2,
      particles: [] as {x: number, y: number, vx: number, vy: number, life: number}[],
      appearDelay: i * 30, // frames delay before appearing
      appearProgress: 0,
    }));

    const bgStars = Array.from({ length: 200 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5,
      alpha: Math.random(),
      vAlpha: (Math.random() - 0.5) * 0.02
    }));

    let frameCount = 0;
    let completionProgress = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Draw background stars
      bgStars.forEach(star => {
        star.alpha += star.vAlpha;
        if (star.alpha <= 0.1 || star.alpha >= 1) star.vAlpha *= -1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
      });

      let currentHover: number | null = null;
      const mouse = mouseRef.current;

      if (isComplete) {
        completionProgress += 0.02;
        if (completionProgress > 1) completionProgress = 1;
      }

      // Update nodes
      nodes.forEach(node => {
        if (frameCount > node.appearDelay) {
          node.appearProgress += 0.02;
          if (node.appearProgress > 1) node.appearProgress = 1;
        }

        node.x += node.vx;
        node.y += node.vy;

        if (node.x < width * 0.1 || node.x > width * 0.9) node.vx *= -1;
        if (node.y < height * 0.1 || node.y > height * 0.9) node.vy *= -1;

        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120 && node.appearProgress >= 1) {
          currentHover = node.id;
          if (Math.random() > 0.6) {
            node.particles.push({
              x: node.x,
              y: node.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: 1.0
            });
          }
        }

        // Completion burst particles
        if (isComplete && completionProgress > 0 && completionProgress < 0.1 && Math.random() > 0.5) {
           node.particles.push({
              x: node.x,
              y: node.y,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              life: 1.0
            });
        }

        node.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
        });
        node.particles = node.particles.filter(p => p.life > 0);
      });

      // Draw connections
      nodes.forEach(node => {
        nodes.forEach(other => {
          if (node.id >= other.id) return;
          if (node.appearProgress < 0.5 || other.appearProgress < 0.5) return;

          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = 400;
          if (dist < maxDist) {
            // Connection progress based on step
            let connectionOpacity = 0;
            if (step >= 1) {
              connectionOpacity = 0.15 * (1 - dist / maxDist);
            }
            if (step >= 2) {
              connectionOpacity = 0.3 * (1 - dist / maxDist);
            }
            if (isComplete) {
              connectionOpacity = 0.8 * (1 - dist / maxDist) * (1 - completionProgress) + 0.1;
            }

            const isHoveredConnection = currentHover === node.id || currentHover === other.id;
            if (isHoveredConnection) {
              connectionOpacity = Math.max(connectionOpacity, 0.7 * (1 - dist / maxDist));
            }
            
            if (connectionOpacity > 0) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(168, 85, 247, ${connectionOpacity})`;
              ctx.lineWidth = isHoveredConnection || isComplete ? 1.5 : 0.5;
              ctx.stroke();
            }
          }
        });
      });

      // Draw nodes and text
      nodes.forEach(node => {
        if (node.appearProgress <= 0) return;

        const isHovered = currentHover === node.id;
        let radius = node.baseRadius * node.appearProgress;
        if (isHovered) radius *= 1.8;
        if (isComplete) radius *= (1 + completionProgress * 1.5);
        
        node.particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(216, 180, 254, ${p.life})`;
          ctx.fill();
        });

        let shadowBlur = 15 * node.appearProgress;
        if (isHovered) shadowBlur = 30;
        if (isComplete) shadowBlur = 30 + completionProgress * 50;

        ctx.shadowBlur = shadowBlur;
        ctx.shadowColor = '#d8b4fe';
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        
        let fillStyle = `rgba(233, 213, 255, ${node.appearProgress})`;
        if (isHovered) fillStyle = '#ffffff';
        if (isComplete) fillStyle = `rgba(255, 255, 255, ${1 - completionProgress * 0.5})`;
        
        ctx.fillStyle = fillStyle;
        ctx.fill();
        
        ctx.shadowBlur = 0;

        const textAlpha = node.appearProgress * (1 - completionProgress);
        if (textAlpha > 0) {
          ctx.font = isHovered ? "500 20px 'Playfair Display', serif" : "400 16px 'Playfair Display', serif";
          ctx.fillStyle = isHovered ? `rgba(255, 255, 255, ${textAlpha})` : `rgba(233, 213, 255, ${textAlpha * 0.8})`;
          ctx.textAlign = "center";
          ctx.fillText(node.label, node.x, node.y - radius - 15);
        }
      });

      // Global completion flash
      if (isComplete && completionProgress > 0) {
        ctx.fillStyle = `rgba(216, 180, 254, ${completionProgress * 0.3})`;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [displayKeywords, step, isComplete]);

  return (
    <div 
      className="absolute inset-0 z-0 bg-transparent"
      onMouseMove={(e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; }}
      onMouseLeave={() => { mouseRef.current = { x: -1000, y: -1000 }; }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

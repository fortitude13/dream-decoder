import React, { useEffect, useRef } from 'react';

export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const nodes: { x: number, y: number, vx: number, vy: number, radius: number, baseRadius: number, alpha: number }[] = [];
    for (let i = 0; i < 100; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        baseRadius: Math.random() * 1.5 + 0.5,
        radius: 0,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse interaction
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let targetRadius = node.baseRadius;
        let targetAlpha = node.alpha;
        let isNodeActive = false;

        if (dist < 100) {
          isNodeActive = true;
          targetRadius = node.baseRadius * 2.5;
          targetAlpha = 1;
          
          // Subtle glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(167, 139, 250, 0.8)';
        } else {
          ctx.shadowBlur = 0;
        }

        node.radius += (targetRadius - node.radius) * 0.1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${targetAlpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw connections only if node is active
        if (isNodeActive) {
          nodes.forEach(otherNode => {
            if (node === otherNode) return;
            const ddx = node.x - otherNode.x;
            const ddy = node.y - otherNode.y;
            const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
            
            if (ddist < 150) {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(otherNode.x, otherNode.y);
              
              // Smooth fade in/out for lines
              const lineAlpha = 0.4 * (1 - ddist / 150);
              ctx.strokeStyle = `rgba(139, 92, 246, ${lineAlpha})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
              
              // Small glow on the other node too
              ctx.beginPath();
              ctx.arc(otherNode.x, otherNode.y, otherNode.baseRadius * 1.5, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(167, 139, 250, ${lineAlpha})`;
              ctx.fill();
            }
          });
        }
      });

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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
}

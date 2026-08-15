import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GridPoint {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

export const GridBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const SPACING = 42; // Distance between grid intersections
    const MOUSE_RADIUS = 160; // Influence radius for cursor
    const REPEL_STRENGTH = 45; // Maximum displacement
    const SPRING_TENSION = 0.05; // Elastic return speed
    const DAMPING = 0.86; // Friction to settle wave

    let cols = Math.ceil(width / SPACING) + 2;
    let rows = Math.ceil(height / SPACING) + 2;

    let points: GridPoint[][] = [];

    // Initialize point grid
    const initGrid = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const logicalWidth = window.innerWidth;
      const logicalHeight = window.innerHeight;

      cols = Math.ceil(logicalWidth / SPACING) + 3;
      rows = Math.ceil(logicalHeight / SPACING) + 3;

      points = [];
      for (let r = 0; r < rows; r++) {
        const row: GridPoint[] = [];
        for (let c = 0; c < cols; c++) {
          const originX = (c - 1) * SPACING;
          const originY = (r - 1) * SPACING;
          row.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0
          });
        }
        points.push(row);
      }
    };

    initGrid();

    // Mouse tracking
    let mouseX = -9999;
    let mouseY = -9999;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    // Scroll perturbation wave
    let lastScrollY = window.scrollY;
    let scrollWavePhase = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Inject wave energy on scroll
      const energy = Math.max(-25, Math.min(25, scrollDiff * 0.8));
      scrollWavePhase += 0.3;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r]?.[c];
          if (!p) continue;
          const wave = Math.sin(c * 0.3 + scrollWavePhase) * energy * 0.4;
          p.vy += wave;
        }
      }
    };

    // Touch ripple
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
      }
    };

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    let time = 0;

    // Main animation loop
    const animate = () => {
      time += 0.02;
      const logicalWidth = window.innerWidth;
      const logicalHeight = window.innerHeight;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') !== 'light';

      // 1. Update Physics for Points
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];

          // Mouse repel & wave distortion
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_STRENGTH;
            const angle = Math.atan2(dy, dx);
            // Repel away from cursor + slight tangential wave twist
            const repelX = Math.cos(angle) * force * 0.25;
            const repelY = Math.sin(angle) * force * 0.25;

            p.vx += repelX;
            p.vy += repelY;
          }

          // Gentle ambient wave motion (always alive)
          const ambientWave = Math.sin(time + c * 0.2 + r * 0.2) * 0.15;
          p.vy += ambientWave;

          // Spring physics: pull point back to origin
          const springX = (p.originX - p.x) * SPRING_TENSION;
          const springY = (p.originY - p.y) * SPRING_TENSION;

          p.vx = (p.vx + springX) * DAMPING;
          p.vy = (p.vy + springY) * DAMPING;

          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // 2. Draw Grid Lines with dynamic spotlight luminance
      ctx.lineWidth = 1.5;

      // Draw Horizontal Lines
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const p1 = points[r][c];
          const p2 = points[r][c + 1];

          // Calculate average distance from cursor to highlight active area
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const mouseDist = Math.hypot(midX - mouseX, midY - mouseY);

          let alpha = isDark ? 0.06 : 0.05;
          let strokeColor = isDark ? '255, 255, 255' : '0, 0, 0';

          if (mouseDist < MOUSE_RADIUS * 1.5) {
            const highlight = 1 - mouseDist / (MOUSE_RADIUS * 1.5);
            alpha = isDark 
              ? 0.06 + highlight * 0.45 
              : 0.05 + highlight * 0.35;
          }

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${strokeColor}, ${alpha})`;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw Vertical Lines
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols; c++) {
          const p1 = points[r][c];
          const p2 = points[r + 1][c];

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const mouseDist = Math.hypot(midX - mouseX, midY - mouseY);

          let alpha = isDark ? 0.06 : 0.05;
          let strokeColor = isDark ? '255, 255, 255' : '0, 0, 0';

          if (mouseDist < MOUSE_RADIUS * 1.5) {
            const highlight = 1 - mouseDist / (MOUSE_RADIUS * 1.5);
            alpha = isDark 
              ? 0.06 + highlight * 0.45 
              : 0.05 + highlight * 0.35;
          }

          ctx.beginPath();
          ctx.strokeStyle = `rgba(${strokeColor}, ${alpha})`;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // 3. Draw subtle junction points under cursor
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];
          const mouseDist = Math.hypot(p.x - mouseX, p.y - mouseY);

          if (mouseDist < MOUSE_RADIUS) {
            const pointAlpha = (1 - mouseDist / MOUSE_RADIUS) * (isDark ? 0.7 : 0.5);
            ctx.fillStyle = `rgba(8, 183, 79, ${pointAlpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="interactive-grid-bg" aria-hidden="true">
      <canvas 
        ref={canvasRef} 
        style={{ 
          display: 'block', 
          width: '100vw', 
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0
        }} 
      />
    </div>
  );
};

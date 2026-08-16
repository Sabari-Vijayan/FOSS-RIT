import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useVibe } from '../../context/VibeContext';

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
  const { activeVibe } = useVibe();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const SPACING = 42; // Distance between grid intersections
    const MOUSE_RADIUS = 160; // Influence radius for cursor
    const REPEL_STRENGTH = 45; // Maximum displacement
    const SPRING_TENSION = 0.05; // Elastic return speed
    const DAMPING = 0.86; // Friction to settle wave

    const isPhoneDevice = () => {
      return (
        window.innerWidth <= 768 ||
        window.matchMedia('(max-width: 768px)').matches ||
        ('ontouchstart' in window && window.innerWidth <= 1024)
      );
    };

    const isDark = theme === 'dark' || document.documentElement.getAttribute('data-theme') !== 'light';
    const vibeRgb = activeVibe?.rgb || '8, 183, 79';

    // If on phone / mobile device: render static grid once and do NOT animate on scroll
    if (isPhoneDevice()) {
      const renderStaticGrid = () => {
        const dpr = window.devicePixelRatio || 1;
        const logicalWidth = window.innerWidth;
        const logicalHeight = window.innerHeight;

        canvas.width = logicalWidth * dpr;
        canvas.height = logicalHeight * dpr;
        ctx.resetTransform();
        ctx.scale(dpr, dpr);

        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        ctx.lineWidth = 1;
        ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)';

        // Draw static horizontal lines
        const rows = Math.ceil(logicalHeight / SPACING) + 1;
        for (let r = 0; r <= rows; r++) {
          const y = r * SPACING;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(logicalWidth, y);
          ctx.stroke();
        }

        // Draw static vertical lines
        const cols = Math.ceil(logicalWidth / SPACING) + 1;
        for (let c = 0; c <= cols; c++) {
          const x = c * SPACING;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, logicalHeight);
          ctx.stroke();
        }
      };

      renderStaticGrid();

      const handleResizeMobile = () => {
        renderStaticGrid();
      };

      window.addEventListener('resize', handleResizeMobile);
      return () => {
        window.removeEventListener('resize', handleResizeMobile);
      };
    }

    // --- Desktop Interactive & Physics Animation ---
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let cols = Math.ceil(width / SPACING) + 2;
    let rows = Math.ceil(height / SPACING) + 2;
    let points: GridPoint[][] = [];

    // Initialize point grid
    const initGrid = () => {
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.resetTransform();
      ctx.scale(dpr, dpr);

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

    const handleResize = () => {
      initGrid();
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    let time = 0;

    // Main animation loop for desktop
    const animate = () => {
      time += 0.02;
      const logicalWidth = window.innerWidth;
      const logicalHeight = window.innerHeight;

      ctx.clearRect(0, 0, logicalWidth, logicalHeight);

      // 1. Update Physics for Points
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];

          // Mouse repel & distortion
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_STRENGTH;
            const angle = Math.atan2(dy, dx);
            const repelX = Math.cos(angle) * force * 0.25;
            const repelY = Math.sin(angle) * force * 0.25;

            p.vx += repelX;
            p.vy += repelY;
          }

          // Gentle ambient wave motion
          const ambientWave = Math.sin(time + c * 0.2 + r * 0.2) * 0.12;
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

      // 3. Draw subtle junction points under cursor tinted with active builder vibe
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];
          const mouseDist = Math.hypot(p.x - mouseX, p.y - mouseY);

          if (mouseDist < MOUSE_RADIUS) {
            const pointAlpha = (1 - mouseDist / MOUSE_RADIUS) * (isDark ? 0.75 : 0.55);
            ctx.fillStyle = `rgba(${vibeRgb}, ${pointAlpha})`;
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
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, activeVibe]);

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

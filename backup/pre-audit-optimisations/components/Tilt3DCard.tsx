import {type MouseEvent, type ReactNode, useRef, useState} from 'react';

interface Tilt3DCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function Tilt3DCard({children, className = '', maxTilt = 7}: Tilt3DCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const [transform, setTransform] = useState(
    'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [sheen, setSheen] = useState({x: 50, y: 50, opacity: 0});

  const canHover3D = () => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!canHover3D() || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * (maxTilt * 2);
    const rotateX = (0.5 - py) * (maxTilt * 2);

    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = window.requestAnimationFrame(() => {
      setTransform(
        `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(
          2
        )}deg) scale3d(1.015, 1.015, 1.015)`
      );
      setSheen({x: px * 100, y: py * 100, opacity: 1});
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    setTransform('perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setSheen((prev) => ({...prev, opacity: 0}));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{transform, transformStyle: 'preserve-3d'}}
      className={`relative transition-transform duration-300 ease-out will-change-transform ${className}`}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: sheen.opacity,
          background: `radial-gradient(circle at ${sheen.x}% ${sheen.y}%, rgba(231, 202, 145, 0.16), transparent 58%)`,
        }}
      />
    </div>
  );
}

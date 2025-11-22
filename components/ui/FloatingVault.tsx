'use client';

import React, { useEffect, useRef } from 'react';

export function FloatingVault() {
  const vaultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!vaultRef.current) return;

      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const xPos = (clientX / innerWidth - 0.5) * 20;
      const yPos = (clientY / innerHeight - 0.5) * 20;

      vaultRef.current.style.transform = `
        translateX(${xPos}px) 
        translateY(${yPos}px)
        rotateY(${xPos}deg) 
        rotateX(${-yPos}deg)
      `;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
      <div
        ref={vaultRef}
        className="relative w-64 h-64 md:w-96 md:h-96 animate-float"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            animation: 'spin 20s linear infinite',
          }}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 border-2 border-soul-red/30 rounded-lg bg-gradient-to-br from-soul-red/5 to-transparent backdrop-blur-sm"
            style={{ transform: 'translateZ(64px)' }}
          >
            <div className="absolute inset-0 border border-soul-red/50 rounded-lg m-4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-4 border-soul-red/70 rounded-full" />
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 border-2 border-soul-red/20 rounded-lg bg-gradient-to-br from-soul-red/3 to-transparent backdrop-blur-sm"
            style={{ transform: 'translateZ(-64px) rotateY(180deg)' }}
          />

          {/* Right Face */}
          <div
            className="absolute inset-0 border-2 border-soul-red/20 rounded-lg bg-gradient-to-br from-soul-red/3 to-transparent backdrop-blur-sm"
            style={{ transform: 'rotateY(90deg) translateZ(64px)' }}
          />

          {/* Left Face */}
          <div
            className="absolute inset-0 border-2 border-soul-red/20 rounded-lg bg-gradient-to-br from-soul-red/3 to-transparent backdrop-blur-sm"
            style={{ transform: 'rotateY(-90deg) translateZ(64px)' }}
          />

          {/* Top Face */}
          <div
            className="absolute inset-0 border-2 border-soul-red/20 rounded-lg bg-gradient-to-br from-soul-red/3 to-transparent backdrop-blur-sm"
            style={{ transform: 'rotateX(90deg) translateZ(64px)' }}
          />

          {/* Bottom Face */}
          <div
            className="absolute inset-0 border-2 border-soul-red/20 rounded-lg bg-gradient-to-br from-soul-red/3 to-transparent backdrop-blur-sm"
            style={{ transform: 'rotateX(-90deg) translateZ(64px)' }}
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-soul-red/20 blur-3xl rounded-full" />
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotateY(0deg) rotateX(0deg);
          }
          to {
            transform: rotateY(360deg) rotateX(360deg);
          }
        }
      `}</style>
    </div>
  );
}

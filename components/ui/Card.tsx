'use client';

import React, { useRef, useState } from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  tiltEffect?: boolean;
}

export function Card({ children, className = '', glass = true, tiltEffect = false }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = 'rounded p-6 border transition-all duration-300';
  const glassStyles = glass ? 'glass-enhanced' : 'bg-charcoal border-white/10';
  const tiltStyles = tiltEffect ? 'card-3d' : '';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * 5;
    const rotateY = ((centerX - x) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!tiltEffect || !cardRef.current) return;
    const card = cardRef.current;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    if (tiltEffect) setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={`${baseStyles} ${glassStyles} ${tiltStyles} ${className} ${isHovered ? 'card-shimmer' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

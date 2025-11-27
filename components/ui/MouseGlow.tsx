'use client';

import React, { useEffect, useState } from 'react';

export function MouseGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    const isLowEndDevice = 
      ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    setIsLowEndDevice(isLowEndDevice);
    
    if (isLowEndDevice) return;

    const handleMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (isLowEndDevice) {
    return null;
  }

  return (
    <div
      className="fixed pointer-events-none -z-10 transition-transform duration-300 ease-out"
      style={{
        left: position.x,
        top: position.y,
        width: '600px',
        height: '600px',
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(193, 26, 41, 0.15) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }}
    />
  );
}

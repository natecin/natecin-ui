'use client';

import React, { useEffect, useRef, memo } from 'react';

export const HeartbeatGraph = memo(function HeartbeatGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;
    let lastTime = 0;

    const heartbeatPattern = [
      0, 0, 0, 0, 0, 0.1, 0.2, 0.1, 0, 0, 0, 0,
      0, 0, 0, 0.15, 0.85, 0.15, 0, -0.3, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];

    const isLowEndDevice = () => {
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' || 
        connection.effectiveType === '2g' ||
        connection.downlink < 1
      );
      const isLowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory < 4;
      const isLowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      return isSlowConnection || isLowMemory || isLowCores;
    };

    const targetFPS = isLowEndDevice() ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const draw = (currentTime: number) => {
      // Skip frames based on device performance
      if (currentTime - lastTime < frameInterval) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      
      lastTime = currentTime;
      frameCountRef.current += 1;

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Clear canvas with semi-transparent overlay for trail effect
      ctx.fillStyle = isLowEndDevice() ? '#1A1A1F' : 'rgba(26, 26, 31, 0.9)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid (simplified for performance)
      if (!isLowEndDevice() || frameCountRef.current % 10 === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < height; i += 20) {
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(width, i);
          ctx.stroke();
        }
        for (let i = 0; i < width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, height);
          ctx.stroke();
        }
      }

      // Draw heartbeat line
      ctx.strokeStyle = '#FF2E3B';
      ctx.lineWidth = isLowEndDevice() ? 2 : 2;
      
      // Reduced shadow for performance
      if (!isLowEndDevice()) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FF2E3B';
      }
      
      ctx.beginPath();

      const segments = isLowEndDevice() ? width / 4 : width / 2;
      for (let i = 0; i < segments; i++) {
        const x = (i / segments) * width;
        const patternIndex = Math.floor(((i + offset) % heartbeatPattern.length));
        const y = centerY - heartbeatPattern[patternIndex] * (height * 0.35);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // Slow down animation for performance
      offset += isLowEndDevice() ? 0.3 : 0.5;
      if (offset >= heartbeatPattern.length) {
        offset = 0;
      }

      animationId = requestAnimationFrame(draw);
    };

    draw(0);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-full rounded"
    />
  );
});

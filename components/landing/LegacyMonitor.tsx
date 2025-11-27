'use client';

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { HeartbeatGraph } from '@/components/ui/HeartbeatGraph';
import { DonutChart } from '@/components/ui/DonutChart';
import { formatCurrency } from '@/lib/utils';
import { ShieldCheck, Lock } from 'lucide-react';

export function LegacyMonitor() {
  const totalValue = 142850.0;
  const daysRemaining = 179;
  const particlesRef = useRef<HTMLCanvasElement>(null);

  // Floating data particles animation
  useEffect(() => {
    const canvas = particlesRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      pulsePhase: number;
    }

    const particles: Particle[] = [];
    // Reduce particle count based on device performance
    const isLowEndDevice = 
      ((navigator as any).deviceMemory && (navigator as any).deviceMemory < 4) ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);
    const particleCount = isLowEndDevice ? 6 : 8;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationFrameId: number;
    let time = 0;
    let lastTime = 0;
    const targetFPS = isLowEndDevice ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      // Frame skipping for performance
      if (currentTime - lastTime < frameInterval) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      lastTime = currentTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulsePhase += 0.02;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Clamp position
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Simplified pulsing effect for performance
        const pulse = Math.sin(particle.pulsePhase) * 0.3 + 0.7;
        const currentOpacity = particle.opacity * pulse;

        // Simplified particle rendering
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 2
        );
        gradient.addColorStop(0, `rgba(193, 26, 41, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(193, 26, 41, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * 2,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Core particle
        ctx.fillStyle = `rgba(193, 26, 41, ${currentOpacity * 1.2})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Simplified connection logic
      const connectionDistance = isLowEndDevice ? 80 : 100;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            ctx.strokeStyle = `rgba(193, 26, 41, ${0.05 * (1 - distance / connectionDistance)})`;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative -mt-32 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Card className="relative z-10 border-2 border-white/20 overflow-hidden">
          {/* Floating particles background */}
          <canvas
            ref={particlesRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-50"
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pulse-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-pulse-red"></span>
                </span>
                <h2 className="font-family-heading text-ghost-white text-xl">
                  Live Protocol Preview
                </h2>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  ● System Operational
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-silver-dust">Total Value Locked</div>
                <div className="text-2xl font-family-heading text-ghost-white">
                  {formatCurrency(totalValue)}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-[70%_30%] gap-6">
              <div className="space-y-3 relative">
                <h3 className="font-family-heading text-ghost-white text-lg">
                  Activity Monitor: Detecting Life Signs
                </h3>
                <div className="h-48 bg-charcoal rounded border border-white/5 relative overflow-hidden">
                  {/* 3D depth effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-soul-red/5 via-transparent to-pulse-red/5 pointer-events-none" />
                  <HeartbeatGraph />
                </div>
              </div>

              <div className="space-y-3 relative">
                <h3 className="font-family-heading text-ghost-white text-lg">
                  Smart Contract Auto-Distribution
                </h3>
                <div className="h-48 relative overflow-hidden rounded border border-white/5">
                  {/* 3D depth effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-soul-red/5 pointer-events-none" />
                  <DonutChart />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between text-sm text-silver-dust mb-2">
                    <span>Auto-execution timer</span>
                    <span className="font-family-heading text-ghost-white">
                      {daysRemaining} Days remaining
                    </span>
                  </div>
                  {/* Enhanced progress bar with particle trail */}
                  <div className="relative h-3 bg-charcoal rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-soul-red to-pulse-red rounded-full relative overflow-hidden"
                      style={{ width: '51%' }}
                    >
                      {/* Particle trail effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />

                      {/* Pulsing end indicator */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-full bg-white/40 animate-pulse-glow" />
                    </div>

                    {/* Background shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse opacity-50" />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Holographic status badges */}
                  <div className="flex items-center gap-2 px-4 py-2 rounded bg-emerald-500/10 border border-emerald-500/30 group hover:border-emerald-500/60 transition-all">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    <span className="font-family-heading text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
                      Audited Contract
                    </span>
                    {/* Badge pulse glow */}
                    <div className="absolute -inset-2 bg-emerald-500/20 rounded blur opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 rounded bg-blue-500/10 border border-blue-500/30 group hover:border-blue-500/60 transition-all">
                    <Lock className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                    <span className="font-family-heading text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
                      Non-Custodial
                    </span>
                    {/* Badge pulse glow */}
                    <div className="absolute -inset-2 bg-blue-500/20 rounded blur opacity-0 group-hover:opacity-50 transition-opacity -z-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wallet, Users, Vault, Activity } from 'lucide-react';

export function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const steps = [
    {
      number: '01',
      title: 'Connect Wallet',
      description: 'Link your Web3 wallet securely.',
      icon: Wallet,
    },
    {
      number: '02',
      title: 'Set Heirs',
      description: 'Add beneficiaries with custom percentages.',
      icon: Users,
    },
    {
      number: '03',
      title: 'Deposit Assets',
      description: 'Lock your crypto & NFTs in vault.',
      icon: Vault,
    },
    {
      number: '04',
      title: 'Stay Active',
      description: 'Automated monitoring begins.',
      icon: Activity,
    },
  ];

  // Animate flowing particles along connection line
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.02;

      const spacing = canvas.width / 4;
      const lineY = canvas.height / 2;

      // Draw connection line
      ctx.strokeStyle = 'rgba(193, 26, 41, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(canvas.width, lineY);
      ctx.stroke();

      // Draw flowing energy particles
      for (let i = 0; i < steps.length - 1; i++) {
        const startX = (i + 1) * spacing;
        const endX = (i + 2) * spacing;

        // Multiple particles flowing along the line
        for (let p = 0; p < 3; p++) {
          const offset = (time + p * 0.3) % 1;
          const x = startX + (endX - startX) * offset;
          const particleY = lineY + Math.sin(time * 2 + p) * 3;

          // Particle glow
          const gradient = ctx.createRadialGradient(x, particleY, 0, x, particleY, 8);
          gradient.addColorStop(0, 'rgba(255, 46, 59, 0.8)');
          gradient.addColorStop(1, 'rgba(255, 46, 59, 0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, particleY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Particle core
          ctx.fillStyle = 'rgba(255, 46, 59, 1)';
          ctx.beginPath();
          ctx.arc(x, particleY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw pulsing circles at step positions
      for (let i = 0; i < steps.length; i++) {
        const x = (i + 1) * spacing;
        const pulse = Math.sin(time * 2 + i) * 0.3 + 0.7;

        // Outer glow
        const glowGradient = ctx.createRadialGradient(x, lineY, 0, x, lineY, 20 * pulse);
        glowGradient.addColorStop(0, 'rgba(193, 26, 41, 0.3)');
        glowGradient.addColorStop(1, 'rgba(193, 26, 41, 0)');

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, lineY, 20 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Circle border
        ctx.strokeStyle = 'rgba(193, 26, 41, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, lineY, 10, 0, Math.PI * 2);
        ctx.stroke();

        // Inner pulse
        ctx.fillStyle = 'rgba(193, 26, 41, 0.4)';
        ctx.beginPath();
        ctx.arc(x, lineY, 5 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-family-heading text-ghost-white text-center mb-16 ">
          How It Works
        </h2>

        {/* Canvas for particle animations */}
        <canvas
          ref={canvasRef}
          className="w-full h-20 mb-12 rounded-lg opacity-60"
        />

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isHovered = hoveredStep === index;

            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className={`text-center transition-all duration-300 ${
                    isHovered ? 'transform -translate-y-2' : ''
                  }`}
                >
                  {/* Icon container with neon glow */}
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative ${
                      isHovered
                        ? 'bg-soul-red border-soul-red'
                        : 'bg-charcoal border-white/20'
                    }`}
                  >
                    {/* Neon glow effect on hover */}
                    {isHovered && (
                      <div className="absolute inset-0 rounded-full bg-soul-red/20 blur-lg animate-pulse-glow" />
                    )}

                    <Icon
                      className={`w-10 h-10 transition-colors duration-300 relative z-10 ${
                        isHovered ? 'text-ghost-white' : 'text-soul-red'
                      }`}
                    />
                  </div>

                  <div
                    className={`text-sm font-family-heading mb-2 transition-colors duration-300 ${
                      isHovered ? 'text-soul-red' : 'text-silver-dust'
                    }`}
                  >
                    {step.number}
                  </div>

                  <h3 className="text-xl font-family-heading text-ghost-white mb-3">
                    {step.title}
                  </h3>

                  <p className="text-silver-dust text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bottom accent line with running light effect */}
                  <div className="mt-4 h-1 bg-linear-to-r from-transparent via-soul-red to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden relative">
                    {isHovered && (
                      <div
                        className="h-full bg-white animate-running-light"
                        style={{
                          animation: 'running-light 2s linear infinite',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes running-light {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </section>
  );
}
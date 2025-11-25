'use client';

import React from 'react';
import { Shield, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FloatingVault } from '@/components/ui/FloatingVault';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

interface HeroProps {
  onCreateVault?: () => void;
  onAccessDashboard?: () => void;
}

export function Hero({ onCreateVault, onAccessDashboard }: HeroProps = {}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-52 pb-40 perspective-1000">
      <FloatingVault />
      <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight text-glow">
          When your last breath fades...
          <br />
          <span className="text-soul-red">Your legacy begins.</span>
        </h1>

        <p className="text-xl md:text-2xl text-silver-dust max-w-3xl mx-auto">
          Trustless. Automated. Secure. The first decentralized inheritance vault powered by your heartbeat.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 py-6">
          <div className="flex items-center gap-2 group">
            <AnimatedIcon icon={Shield} type="shield" size={24} className="text-soul-red" />
            <span className="font-family-heading text-ghost-white group-hover:text-soul-red transition-colors">Non-Custodial</span>
          </div>
          <div className="flex items-center gap-2 group">
            <AnimatedIcon icon={Clock} type="pulse" size={24} className="text-soul-red" />
            <span className="font-family-heading text-ghost-white group-hover:text-soul-red transition-colors">Automated Timer</span>
          </div>
          <div className="flex items-center gap-2 group">
            <AnimatedIcon icon={Lock} type="lock" size={24} className="text-soul-red" />
            <span className="font-family-heading text-ghost-white group-hover:text-soul-red transition-colors">Multi-Sig Security</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button variant="primary" onClick={onCreateVault}>
            Create Vault
          </Button>
          <Button variant="secondary" onClick={onAccessDashboard}>
            Access Dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}

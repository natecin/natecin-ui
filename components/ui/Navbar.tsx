'use client';

import React, { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onConnectWallet?: () => void;
}

export function Navbar({ onConnectWallet }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass-enhanced backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HeartPulse className="w-8 h-8 text-soul-red animate-heartbeat" />
          <span className="text-2xl font-heading text-ghost-white">NATECIN</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-silver-dust hover:text-ghost-white transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-silver-dust hover:text-ghost-white transition-colors duration-200"
          >
            How It Works
          </a>
          <a
            href="#about"
            className="text-silver-dust hover:text-ghost-white transition-colors duration-200"
          >
            About
          </a>
        </div>

        <Button variant="primary" onClick={onConnectWallet} className="animate-pulse-glow">
          Connect Wallet
        </Button>
      </div>
    </nav>
  );
}

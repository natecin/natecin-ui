'use client';

import React, { useEffect, useState } from 'react';
import { HeartPulse } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onConnectWallet?: () => void;
}

export function Navbar({ onConnectWallet }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Detect if scrolling up or down
      if (currentScrollY < lastScrollY) {
        setIsScrollingUp(true);
      } else {
        setIsScrollingUp(false);
      }

      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={cn('sticky top-0 left-0 right-0 z-50 transition-all duration-300' ,
        scrolled
          ? 'glass-enhanced backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent',
         isScrollingUp ? 'translate-y-0' : '-translate-y-full')}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo with heartbeat pulse */}
        <div className="flex items-center gap-3 group">
          <HeartPulse className="w-8 h-8 text-soul-red animate-heartbeat group-hover:text-pulse-red transition-colors" />
          <span className="text-2xl font-heading text-ghost-white group-hover:text-soul-red transition-colors duration-300">
            NATECIN
          </span>

          {/* Logo glow on hover */}
          <div className="absolute -inset-2 bg-soul-red/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </div>

        {/* Navigation links */}
        <div className="hidden md:flex items-center gap-8">
          {['Features', 'How It Works', 'About'].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-silver-dust hover:text-ghost-white transition-colors duration-200 relative group"
            >
              {link}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-soul-red to-pulse-red group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Connect Wallet button with enhanced glow */}
        <Button
          variant="primary"
          onClick={onConnectWallet}
          className="relative animate-pulse-glow hover:animate-pulse-glow"
        >
          <span className="relative z-10">Connect Wallet</span>

          {/* Button glow backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-soul-red/50 to-pulse-red/50 rounded blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        </Button>
      </div>

      {/* Animated bottom border */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-soul-red to-transparent" />
      )}
    </nav>
  );
}
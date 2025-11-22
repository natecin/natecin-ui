'use client';

import React from 'react';
import { HeartPulse } from 'lucide-react';

export function Footer() {
  const links = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'About', href: '#about' },
    { label: 'Launch App', href: '/dashboard' },
  ];

  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <HeartPulse className="w-8 h-8 text-soul-red" />
            <span className="text-2xl font-heading text-ghost-white">NATECIN</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-8">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-silver-dust hover:text-ghost-white transition-colors duration-200 font-body"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-silver-dust text-sm text-center md:text-right">
            © 2024 Natecin.
            <br />
            Your legacy, secured forever on the blockchain.
          </div>
        </div>
      </div>
    </footer>
  );
}

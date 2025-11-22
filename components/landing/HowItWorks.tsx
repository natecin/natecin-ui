'use client';

import React, { useState } from 'react';
import { Wallet, Users, Vault, Activity } from 'lucide-react';

export function HowItWorks() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

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

  return (
    <section className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-heading text-ghost-white text-center mb-16">
          How It Works
        </h2>
        
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-soul-red to-transparent -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
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
                  <div className={`text-center transition-all duration-300 ${isHovered ? 'transform -translate-y-2' : ''}`}>
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isHovered 
                        ? 'bg-soul-red border-soul-red' 
                        : 'bg-charcoal border-white/20'
                    }`}>
                      <Icon className={`w-10 h-10 transition-colors duration-300 ${
                        isHovered ? 'text-ghost-white' : 'text-soul-red'
                      }`} />
                    </div>
                    
                    <div className={`text-sm font-heading mb-2 transition-colors duration-300 ${
                      isHovered ? 'text-soul-red' : 'text-silver-dust'
                    }`}>
                      {step.number}
                    </div>
                    
                    <h3 className="text-xl font-heading text-ghost-white mb-3">
                      {step.title}
                    </h3>
                    
                    <p className="text-silver-dust text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

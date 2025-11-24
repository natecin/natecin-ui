'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, Zap, Lock } from 'lucide-react';

export function WhyChoose() {
  const features = [
    {
      title: 'Trustless Protocol',
      icon: Shield,
      description: 'No intermediaries. No lawyers. Pure smart contract automation ensures your wishes are executed exactly as planned.',
    },
    {
      title: 'Fully Automated',
      icon: Zap,
      description: 'Advanced activity monitoring triggers automatic transfer after your specified inactivity period. Set it once, forget it.',
    },
    {
      title: 'Bank-Grade Security',
      icon: Lock,
      description: "Military-grade encryption on Ethereum. Your assets are protected by the world's most secure decentralized network.",
    },
  ];

  return (
    <section className="px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-family-heading text-ghost-white text-center mb-16">
          Why Choose Natecin?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <Card 
                key={index} 
                glass={true}
                tiltEffect={true}
                className="p-8 hover:border-soul-red/50 transition-all duration-300 text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-soul-red/10 flex items-center justify-center icon-pulse">
                  <Icon className="w-8 h-8 text-soul-red" />
                </div>
                
                <h3 className="text-xl font-family-heading text-ghost-white mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-silver-dust leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

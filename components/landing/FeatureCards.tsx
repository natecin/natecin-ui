'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Vault, HandshakeIcon } from 'lucide-react';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';

export function FeatureCards() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <Card tiltEffect={true} className="p-8 hover:border-soul-red/50 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-soul-red/10 flex items-center justify-center">
                <AnimatedIcon icon={Vault} type="vault" size={40} className="text-soul-red" />
              </div>
              <h3 className="text-2xl font-family-heading text-ghost-white">
                For Vault Owners
              </h3>
              <p className="text-silver-dust text-lg leading-relaxed">
                <span className="text-ghost-white font-semibold">Total Control.</span> Withdraw or modify terms anytime while you are alive. Your assets remain fully under your custody with complete flexibility.
              </p>
              <ul className="text-left space-y-2 text-silver-dust w-full">
                <li className="flex items-start gap-2">
                  <span className="text-soul-red mt-1">•</span>
                  <span>Add or remove heirs at any time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-soul-red mt-1">•</span>
                  <span>Adjust asset distribution percentages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-soul-red mt-1">•</span>
                  <span>Reset timer with a simple transaction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-soul-red mt-1">•</span>
                  <span>Withdraw assets whenever needed</span>
                </li>
              </ul>
            </div>
          </Card>

          <Card tiltEffect={true} className="p-8 hover:border-soul-red/50 transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-pulse-red/10 flex items-center justify-center">
                <AnimatedIcon icon={HandshakeIcon} type="pulse" size={40} className="text-pulse-red" />
              </div>
              <h3 className="text-2xl font-family-heading text-ghost-white">
                For Heirs
              </h3>
              <p className="text-silver-dust text-lg leading-relaxed">
                <span className="text-ghost-white font-semibold">Seamless Claim.</span> No lawyers, no delays, no paperwork. Smart contracts execute instantly when conditions are met.
              </p>
              <ul className="text-left space-y-2 text-silver-dust w-full">
                <li className="flex items-start gap-2">
                  <span className="text-pulse-red mt-1">•</span>
                  <span>Automatic execution after inactivity period</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pulse-red mt-1">•</span>
                  <span>Direct wallet-to-wallet transfer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pulse-red mt-1">•</span>
                  <span>No intermediaries or third parties</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pulse-red mt-1">•</span>
                  <span>Transparent and verifiable on-chain</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

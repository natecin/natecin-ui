'use client';

import React from 'react';
import { Shield, Clock, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FloatingVault } from '@/components/ui/FloatingVault';
import { AnimatedIcon } from '@/components/ui/AnimatedIcon';
import { motion } from 'framer-motion';

interface HeroProps {
  onCreateVault?: () => void;
  onAccessDashboard?: () => void;
}

export function Hero({ onCreateVault, onAccessDashboard }: HeroProps = {}) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-36 pb-40 perspective-1000">
      <FloatingVault />
      <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold leading-tight text-glow"
        >
          When your last breath fades...
          <br />
          <span className="text-soul-red">Your legacy begins.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-silver-dust max-w-3xl mx-auto"
        >
          Trustless. Automated. Secure. The first decentralized inheritance vault powered by your heartbeat.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 py-6"
        >
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
        >
          {/* Enhanced Primary CTA - Create Vault */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            <Button 
              variant="primary" 
              onClick={onCreateVault}
              className="text-lg px-8 py-4 bg-gradient-to-r from-soul-red to-pulse-red hover:from-soul-red/90 hover:to-pulse-red/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-soul-red/25"
            >
              <div className="flex items-center gap-3">
                <AnimatedIcon icon={Sparkles} type="sparkle" size={20} className="text-white" />
                <span>Create Your Vault</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
            
            {/* Glowing effect overlay */}
            <div className="absolute inset-0 bg-soul-red/20 rounded-full blur-xl group-hover:bg-soul-red/30 transition-colors -z-10" />
          </motion.div>

          {/* Enhanced Secondary CTA - Dashboard */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            <Button 
              variant="secondary" 
              onClick={onAccessDashboard}
              className="text-lg px-8 py-4 border-2 border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <span>Manage Existing</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-white/5 rounded-full blur-lg group-hover:bg-white/10 transition-colors -z-10" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

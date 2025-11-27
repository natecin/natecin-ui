'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { ScrollReveal } from '@/components/ui/ScrollReveal';

const Hero = dynamic(() => import('@/components/landing/Hero').then(mod => ({ default: mod.Hero })), {
  ssr: false
});

const LegacyMonitor = dynamic(() => import('@/components/landing/LegacyMonitor').then(mod => ({ default: mod.LegacyMonitor })), {
  ssr: false
});

const TrustStats = dynamic(() => import('@/components/landing/TrustStats').then(mod => ({ default: mod.TrustStats })), {
  ssr: false
});

const FeatureCards = dynamic(() => import('@/components/landing/FeatureCards').then(mod => ({ default: mod.FeatureCards })), {
  ssr: false
});

const HowItWorks = dynamic(() => import('@/components/landing/HowItWorks').then(mod => ({ default: mod.HowItWorks })), {
  ssr: false
});

const WhyChoose = dynamic(() => import('@/components/landing/WhyChoose').then(mod => ({ default: mod.WhyChoose })), {
  ssr: false
});

const Footer = dynamic(() => import('@/components/landing/Footer').then(mod => ({ default: mod.Footer })), {
  ssr: false
});

const AnimatedBackground = dynamic(() => import('@/components/ui/AnimatedBackground').then(mod => ({ default: mod.AnimatedBackground })), {
  ssr: false,
  loading: () => null
});

const MouseGlow = dynamic(() => import('@/components/ui/MouseGlow').then(mod => ({ default: mod.MouseGlow })), {
  ssr: false,
  loading: () => null
});

export default function Home() {
  const router = useRouter();
  const devicePerformance = useDevicePerformance();

  const handleCreateVault = () => {
    router.push('/dashboard');
  };

  const handleAccessDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen noise-texture">
      {!devicePerformance.shouldReduceAnimations && <AnimatedBackground />}
      {!devicePerformance.shouldReduceAnimations && <MouseGlow />}
      
      <ScrollReveal direction="fade" duration={0.8}>
        <Hero 
          onCreateVault={handleCreateVault}
          onAccessDashboard={handleAccessDashboard}
        />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.2}>
        <LegacyMonitor />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.3}>
        <FeatureCards />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.4}>
        <HowItWorks />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.5}>
        <WhyChoose />
      </ScrollReveal>
      
      <Footer />
    </main>
  );
}

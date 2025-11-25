'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hero } from '@/components/landing/Hero';
import { LegacyMonitor } from '@/components/landing/LegacyMonitor';
import { TrustStats } from '@/components/landing/TrustStats';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { WhyChoose } from '@/components/landing/WhyChoose';
import { Footer } from '@/components/landing/Footer';
import { VaultWizard } from '@/components/vault/VaultWizard';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { MouseGlow } from '@/components/ui/MouseGlow';
import { ScrollReveal, StaggerContainer } from '@/components/ui/ScrollReveal';

export default function Home() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const router = useRouter();

  return (
    <main className="min-h-screen noise-texture">
      <AnimatedBackground />
      <MouseGlow />
      
      <ScrollReveal direction="fade" duration={0.8}>
        <Hero 
          onCreateVault={() => setIsWizardOpen(true)}
          onAccessDashboard={() => router.push('/dashboard')}
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
      
      <ScrollReveal direction="fade" delay={0.6}>
        <Footer />
      </ScrollReveal>
      
      <VaultWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </main>
  );
}

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
import { Navbar } from '@/components/ui/Navbar';

export default function Home() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const router = useRouter();

  return (
    <main className="min-h-screen noise-texture">
      <AnimatedBackground />
      <MouseGlow />
      <Navbar onConnectWallet={() => setIsWizardOpen(true)} />
      
      <Hero 
        onCreateVault={() => setIsWizardOpen(true)}
        onAccessDashboard={() => router.push('/dashboard')}
      />
      <LegacyMonitor />
      <TrustStats />
      <FeatureCards />
      <HowItWorks />
      <WhyChoose />
      <Footer />
      
      <VaultWizard 
        isOpen={isWizardOpen} 
        onClose={() => setIsWizardOpen(false)} 
      />
    </main>
  );
}

'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Heart, Plus, Wallet, Clock, TrendingUp, Settings, ShieldCheck, Lock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useConnection, useAccount } from 'wagmi';
import { VaultCardEnhanced } from '@/components/vault';
import { useVaultSummary } from '@/hooks/useVaults';

export default function VaultDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const connection = useConnection();
  const address = connection.address;
  const { summary, isLoading, error, refetch } = useVaultSummary(resolvedParams.address as `0x${string}`);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleVaultAction = (message: string) => {
    showNotification('success', message);
    refetch();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen noise-texture pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-8 h-8 bg-gray-600 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-600 rounded w-48 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen noise-texture pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-family-heading text-ghost-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-silver-dust">
            Please connect your wallet to view and manage vaults
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen noise-texture pt-20">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
          <Card glass={true} className="p-6 border-red-500/50">
            <p className="text-red-400 mb-4">Error loading vault: {error.message}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen noise-texture pt-20">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Notification */}
        {notification && (
          <div
            className={`rounded-lg p-4 ${
              notification.type === 'success'
                ? 'bg-green-900/50 border border-green-500 text-green-200'
                : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            className="flex items-center gap-2"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-4xl font-family-heading text-ghost-white">
              Vault Details
            </h1>
            <p className="text-silver-dust">
              Manage your vault and view detailed information
            </p>
          </div>
        </div>

        {/* Vault Card with All Actions */}
        <VaultCardEnhanced
          vaultAddress={resolvedParams.address as `0x${string}`}
          showActions={true}
          onDeposit={(addr) => handleVaultAction(`Deposit initiated for vault ${addr.slice(0, 8)}...`)}
          onUpdate={(addr) => handleVaultAction(`Activity updated for vault ${addr.slice(0, 8)}...`)}
          onDistribute={(addr) => handleVaultAction(`Distribution initiated for vault ${addr.slice(0, 8)}...`)}
        />

        {/* Additional Info Section */}
        {summary && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card glass={true} className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-silver-dust">Security</span>
              </div>
              <div className="text-3xl font-family-heading text-ghost-white mb-2">
                Audited
              </div>
              <p className="text-sm text-silver-dust">
                This vault has been audited for security vulnerabilities
              </p>
            </Card>

            <Card glass={true} className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-silver-dust">Custody</span>
              </div>
              <div className="text-3xl font-family-heading text-ghost-white mb-2">
                Non-Custodial
              </div>
              <p className="text-sm text-silver-dust">
                You maintain full control over your assets
              </p>
            </Card>

            <Card glass={true} className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span className="text-sm text-silver-dust">Network</span>
              </div>
              <div className="text-3xl font-family-heading text-ghost-white mb-2">
                Ethereum
              </div>
              <p className="text-sm text-silver-dust">
                Powered by Ethereum smart contracts
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

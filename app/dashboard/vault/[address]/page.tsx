'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { HeartbeatGraph } from '@/components/ui/HeartbeatGraph';
import { ArrowLeft, Heart, Plus, Wallet, Clock, TrendingUp, Settings, ShieldCheck, Lock, User, Image, Coins, Activity, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  formatEtherValue, 
  formatTimeUntilDistribution, 
  calculateVaultAge, 
  shortenAddress, 
  formatDateFromTimestamp 
} from '@/lib/contracts/utils';
import { useConnection, useAccount } from 'wagmi';
import { VaultCardEnhanced } from '@/components/vault';
import { useVaultSummary, useUpdateActivity } from '@/hooks/useVaults';
import { VaultTimeline } from '@/components/vault/VaultTimeline';
import { AssetPortfolio } from '@/components/vault/AssetPortfolio';
import { BeneficiaryManager } from '@/components/vault/BeneficiaryManager';
import { ActionCenter } from '@/components/vault/ActionCenter';
import { SecurityIndicators } from '@/components/vault/SecurityIndicators';
import { DataExportSharing } from '@/components/vault/DataExportSharing';

export default function VaultDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const connection = useConnection();
  const address = connection.address;
  const { summary, isLoading, error, refetch } = useVaultSummary(resolvedParams.address as `0x${string}`);
  const { updateActivity, isLoading: isUpdatingActivity, isConfirmed } = useUpdateActivity();
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

  const handleImAlive = async () => {
    try {
      await updateActivity(resolvedParams.address as `0x${string}`);
      // Success notification and refetch will be handled by useEffect
    } catch (error) {
      showNotification('error', `Failed to update activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Monitor transaction confirmation
  React.useEffect(() => {
    if (isConfirmed) {
      showNotification('success', 'Activity updated successfully');
      refetch();
    }
  }, [isConfirmed]);

  const isOwner = address && summary?.owner?.toLowerCase() === address.toLowerCase();

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
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <span className="text-red-400 text-xl">!</span>
              </div>
              <div>
                <h3 className="text-ghost-white font-family-heading text-lg">
                  Failed to Load Vault
                </h3>
                <p className="text-red-400 text-sm">
                  {error.message || 'Unable to fetch vault details. The vault may not exist or there might be a network issue.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="secondary" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If no summary data yet, show loading
  if (!summary) {
    return (
      <div className="min-h-screen noise-texture pt-20 flex items-center justify-center">
        <AnimatedBackground />
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





  return (
    <div className="min-h-screen noise-texture pt-20">
      <AnimatedBackground />
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 max-w-sm">
          <div
            className={`rounded-lg p-4 border ${
              notification.type === 'success'
                ? 'bg-green-900/50 border-green-500 text-green-200'
                : 'bg-red-900/50 border-red-500 text-red-200'
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              className="p-2"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-family-heading text-ghost-white mb-1">
                Vault Details
              </h1>
              <p className="text-xs text-silver-dust">
                {resolvedParams.address as string}
              </p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-2 rounded-full border ${
            summary.executed 
              ? 'bg-gray-500/10 border-gray-500/20 text-gray-400' 
              : summary.canDistribute 
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${summary.executed ? 'bg-gray-400' : 'bg-emerald-400'} ${!summary.executed ? 'animate-pulse' : ''}`} />
            <span className="text-xs font-medium">
              {summary.executed ? 'Executed' : summary.canDistribute ? 'Ready' : 'Active'}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border border-white/20">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-soul-red" />
                <span className="text-sm text-silver-dust">Total Value</span>
              </div>
              <div className="text-2xl font-family-heading text-ghost-white">
                {formatEtherValue(summary.ethBalance)} ETH
              </div>
            </div>
          </Card>

          <Card className="border border-white/20">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-soul-red" />
                <span className="text-sm text-silver-dust">Time Until</span>
              </div>
              <div className="text-2xl font-family-heading text-ghost-white">
                {formatTimeUntilDistribution(summary.timeUntilDistribution)}
              </div>
            </div>
          </Card>

          <Card className="border border-white/20">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-soul-red" />
                <span className="text-sm text-silver-dust">Beneficiary</span>
              </div>
              <div className="text-xl font-family-heading text-ghost-white">
                {shortenAddress(summary.heir, 6)}
              </div>
            </div>
          </Card>

          <Card className="border border-white/20">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-soul-red" />
                <span className="text-sm text-silver-dust">Last Activity</span>
              </div>
              <div className="text-xl font-family-heading text-ghost-white">
                {calculateVaultAge(summary.lastActiveTimestamp)} days
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Timeline and Activity */}
          <div className="xl:col-span-2 space-y-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory">
            <VaultTimeline summary={summary} isOwner={isOwner} />
            
            {/* Activity Monitor with Enhanced Visualization */}
            <Card className="border border-white/20">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-soul-red" />
                  <h3 className="text-sm font-family-heading text-ghost-white">
                    Activity Monitor
                  </h3>
                </div>
                <div className="h-48 bg-charcoal rounded border border-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-soul-red/5 to-transparent" />
                  <HeartbeatGraph />
                </div>
              </div>
            </Card>

            {/* Asset Portfolio */}
            <AssetPortfolio summary={summary} />
            
            <DataExportSharing 
              summary={summary}
              isOwner={isOwner}
            />
          </div>

          {/* Right Column - Actions and Beneficiary */}
          <div className="space-y-6 xl:sticky xl:top-20 xl:h-fit">
            <ActionCenter 
              summary={summary}
              isOwner={isOwner}
              onImAlive={handleImAlive}
              onDeposit={() => router.push(`/dashboard/vault/${resolvedParams.address}/deposit`)}
            />
            
            <BeneficiaryManager 
              summary={summary}
              isOwner={isOwner}
              onEditBeneficiary={() => {/* Edit is now handled inline */}}
              onRefetch={refetch}
            />
            
            <SecurityIndicators 
              summary={summary}
              isOwner={isOwner}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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

export default function VaultDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const connection = useConnection();
  const address = connection.address;
  const { summary, isLoading, error, refetch } = useVaultSummary(resolvedParams.address as `0x${string}`);
  const { updateActivity, isLoading: isUpdatingActivity } = useUpdateActivity();
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
      showNotification('success', 'Activity updated successfully');
      refetch();
    } catch (error) {
      showNotification('error', `Failed to update activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
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

        {/* Activity Monitor & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
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

          <Card className="border border-white/20">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-soul-red" />
                <h3 className="text-sm font-family-heading text-ghost-white">
                  Vault Actions
                </h3>
              </div>
              <div className="space-y-3">
                {isOwner && !summary.executed && (
                  <Button 
                    onClick={handleImAlive}
                    disabled={isUpdatingActivity}
                    className="w-full"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {isUpdatingActivity ? "Updating..." : "I'm Alive"}
                  </Button>
                )}
                
                {isOwner && summary.canDistribute && (
                  <Button 
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Ready to Distribute
                  </Button>
                )}
                
                {!isOwner && (
                  <div className="flex items-center gap-2 p-3 bg-charcoal rounded border border-white/5">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-sm text-ghost-white font-family-heading">
                        View Only
                      </div>
                      <div className="text-xs text-silver-dust">
                        Only vault owners can perform actions
                      </div>
                    </div>
                  </div>
                )}
                
                {summary.executed && (
                  <div className="flex items-center gap-2 p-3 bg-charcoal rounded border border-white/5">
                    <ShieldCheck className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400 font-family-heading">
                        Vault Executed
                      </div>
                      <div className="text-xs text-silver-dust">
                        Assets have been distributed to the beneficiary
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Asset Details - Only show if there are assets */}
        {(summary.erc721Count > 0 || summary.erc20Count > 0) && (
          <Card className="border border-white/20 mb-8">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-soul-red" />
                <h3 className="text-sm font-family-heading text-ghost-white">
                  Asset Holdings
                </h3>
              </div>
              
              {/* NFT Gallery - Only show if there are NFTs */}
              {summary.erc721Count > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-silver-dust">NFT Collection</span>
                    <span className="text-sm text-ghost-white">
                      {summary.erc721Count} items
                    </span>
                  </div>
                  <div className="text-center py-8 px-4 bg-charcoal/50 rounded-lg border border-white/5">
                    <Image className="w-12 h-12 text-silver-dust mx-auto mb-3" />
                    <p className="text-sm text-ghost-white font-family-heading mb-1">
                      {summary.erc721Count} NFTs
                    </p>
                    <p className="text-xs text-silver-dust">
                      NFT visualization will be available in next update
                    </p>
                  </div>
                </div>
              )}
              
              {/* Token Holdings - Only show if there are tokens */}
              {summary.erc20Count > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-silver-dust">Token Holdings</span>
                    <span className="text-sm text-ghost-white">
                      {summary.erc20Count} types
                    </span>
                  </div>
                  <div className="text-center py-8 px-4 bg-charcoal/50 rounded-lg border border-white/5">
                    <Coins className="w-12 h-12 text-silver-dust mx-auto mb-3" />
                    <p className="text-sm text-ghost-white font-family-heading mb-1">
                      {summary.erc20Count} Token Types
                    </p>
                    <p className="text-xs text-silver-dust">
                      Token visualization will be available in next update
                    </p>
                  </div>
                </div>
              )}
              
              {/* Empty state if no assets */}
              {summary.erc721Count === 0 && summary.erc20Count === 0 && (
                <div className="text-center py-8 px-4 bg-charcoal/50 rounded-lg border border-white/5">
                  <Wallet className="w-12 h-12 text-silver-dust mx-auto mb-3" />
                  <p className="text-sm text-ghost-white font-family-heading mb-1">
                    No Assets Yet
                  </p>
                  <p className="text-xs text-silver-dust">
                    This vault doesn't contain any assets. Deposit ETH, tokens, or NFTs to get started.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Contract Info */}
        <Card className="border border-white/20">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-soul-red" />
              <h3 className="text-sm font-family-heading text-ghost-white">
                Contract Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-silver-dust">Owner</span>
                  <span className="text-sm text-ghost-white font-family-heading">
                    {shortenAddress(summary.owner)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-silver-dust">Beneficiary</span>
                  <span className="text-sm text-ghost-white font-family-heading">
                    {shortenAddress(summary.heir)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-silver-dust">Status</span>
                  <span className={`text-sm font-family-heading ${
                    summary.executed ? 'text-gray-400' : 'text-emerald-400'
                  }`}>
                    {summary.executed ? 'Executed' : 'Active'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-silver-dust">Inactivity</span>
                  <span className="text-sm text-ghost-white font-family-heading">
                    {summary.inactivityPeriod} seconds
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-silver-dust">Last Activity</span>
                  <span className="text-sm text-ghost-white font-family-heading">
                    {formatDateFromTimestamp(summary.lastActiveTimestamp)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-silver-dust">Security</span>
                  <span className="text-sm text-emerald-400">Audited</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Plus, Wallet, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useConnection } from 'wagmi';
import { useVaultsByOwner } from '@/hooks/useVaults';
import { CreateVaultForm } from '@/components/vault';
import { VaultCard } from '@/components/vault';
import { formatEtherValue, calculateVaultAge } from '@/lib/contracts/utils';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const connection = useConnection();
  const address = connection.address;
  const { vaults, isLoading, error, refetch } = useVaultsByOwner(address);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const statusColors = {
    active: 'text-green-500',
    warning: 'text-yellow-500',
    executed: 'text-gray-500',
  };

  const statusDots = {
    active: 'bg-green-500',
    warning: 'bg-yellow-500',
    executed: 'bg-gray-500',
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateSuccess = (message: string) => {
    showNotification('success', message);
    setShowCreateForm(false);
    refetch();
  };

  const handleCreateError = (error: Error) => {
    showNotification('error', error.message);
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
            Please connect your wallet to view and manage your vaults
          </p>
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

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-family-heading text-ghost-white mb-2">
              Your Vaults
            </h1>
            <p className="text-silver-dust">
              Manage your inheritance vaults and beneficiaries
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Vault
          </Button>
        </div>

        {/* Create Vault Form */}
        {mounted && showCreateForm && (
          <CreateVaultForm
            onSuccess={handleCreateSuccess}
            onError={handleCreateError}
          />
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card glass={true} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-soul-red" />
              <span className="text-sm text-silver-dust">Total Vaults</span>
            </div>
            <div className="text-3xl font-family-heading text-ghost-white">
              {isLoading ? '...' : vaults.length}
            </div>
          </Card>

          <Card glass={true} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm text-silver-dust">Active Vaults</span>
            </div>
            <div className="text-3xl font-family-heading text-ghost-white">
              {isLoading ? '...' : vaults.length}
            </div>
          </Card>

          <Card glass={true} className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-pulse-red" />
              <span className="text-sm text-silver-dust">Total Beneficiaries</span>
            </div>
            <div className="text-3xl font-family-heading text-ghost-white">
              {isLoading ? '...' : vaults.length}
            </div>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card glass={true} className="p-6 border-red-500/50">
            <p className="text-red-400">Error loading vaults: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Try Again
            </Button>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} glass={true} className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 bg-gray-600 rounded"></div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Vault List */}
        {!isLoading && !error && vaults.length === 0 && !showCreateForm && (
          <Card glass={true} className="p-12 text-center">
            <h3 className="text-2xl font-family-heading text-ghost-white mb-4">
              No Vaults Yet
            </h3>
            <p className="text-silver-dust mb-6">
              Create your first inheritance vault to secure your digital assets for your loved ones.
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="mx-auto">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Vault
            </Button>
          </Card>
        )}

        {/* Vault Cards */}
        {!isLoading && !error && vaults.length > 0 && (
          <div className="grid gap-6">
            {vaults.map((vaultAddress) => (
              <VaultCard
                key={vaultAddress}
                vaultAddress={vaultAddress}
                onDeposit={(addr) => handleVaultAction(`Deposit initiated for vault ${addr.slice(0, 8)}...`)}
                onUpdate={(addr) => handleVaultAction(`Activity updated for vault ${addr.slice(0, 8)}...`)}
                onDistribute={(addr) => handleVaultAction(`Distribution initiated for vault ${addr.slice(0, 8)}...`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

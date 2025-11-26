'use client';

import React, { useState } from 'react';
import { useConnection } from 'wagmi';
import { useVaultSummary, useCanDistribute, useDepositETH, useUpdateActivity } from '../../hooks/useVaults';
import { formatEtherValue, formatTimeUntilDistribution, calculateVaultAge, shortenAddress, formatDateFromTimestamp } from '../../lib/contracts/utils';
import type { VaultCardProps } from '../../lib/contracts/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Heart, Plus, Wallet, Clock, TrendingUp, Settings } from 'lucide-react';

export function VaultCard({ vaultAddress, showActions = true, onDeposit, onUpdate, onDistribute }: VaultCardProps) {
  const connection = useConnection();
  const address = connection.address;
  const { summary, isLoading, error } = useVaultSummary(vaultAddress);
  const { canDistribute } = useCanDistribute(vaultAddress);
  const { deposit, isLoading: isDepositing } = useDepositETH();
  const { updateActivity, isLoading: isUpdating } = useUpdateActivity();

  const [depositAmount, setDepositAmount] = useState('0.1');
  const [showDepositForm, setShowDepositForm] = useState(false);

  const isOwner = address && summary?.owner?.toLowerCase() === address?.toLowerCase();

  const handleDeposit = async () => {
    try {
      await deposit(vaultAddress, depositAmount);
      setShowDepositForm(false);
      setDepositAmount('0.1');
      onDeposit?.(vaultAddress);
    } catch (err) {
      console.error('Deposit failed:', err);
    }
  };

  const handleUpdateActivity = async () => {
    try {
      await updateActivity(vaultAddress);
      onUpdate?.(vaultAddress);
    } catch (err) {
      console.error('Update activity failed:', err);
    }
  };

  const handleDistribute = async () => {
    onDistribute?.(vaultAddress);
  };

  if (isLoading) {
    return (
      <Card glass={true} className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-600 rounded w-3/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card glass={true} className="p-6 border-red-500/50">
        <p className="text-red-400">Error loading vault: {error.message}</p>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const vaultAge = calculateVaultAge(summary.lastActiveTimestamp);
  const statusColor = summary.executed ? 'gray' : canDistribute ? 'yellow' : 'green';
  const statusText = summary.executed ? 'Distributed' : canDistribute ? 'Ready for Distribution' : 'Active';

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

  return (
    <Card glass={true} className="p-6 hover:border-soul-red/50 transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`relative flex h-3 w-3`}>
              {statusText === 'Active' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                statusColor === 'gray' ? statusDots.executed :
                statusColor === 'yellow' ? statusDots.warning :
                statusDots.active
              }`}></span>
            </span>
            <h3 className="text-2xl font-family-heading text-ghost-white">
              Vault {shortenAddress(vaultAddress, 8)}
            </h3>
            <span className={`text-sm ${
              statusColor === 'gray' ? statusColors.executed :
              statusColor === 'yellow' ? statusColors.warning :
              statusColors.active
            } capitalize`}>
              {statusText}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-silver-dust">Value</div>
              <div className="text-lg font-family-heading text-ghost-white">
                {formatEtherValue(summary?.ethBalance)} ETH
              </div>
            </div>
            <div>
              <div className="text-sm text-silver-dust">Owner</div>
              <div className="text-lg font-family-heading text-ghost-white">
                {shortenAddress(summary.owner, 8)}
              </div>
            </div>
            <div>
              <div className="text-sm text-silver-dust">Heir</div>
              <div className="text-lg font-family-heading text-ghost-white">
                {shortenAddress(summary.heir, 8)}
              </div>
            </div>
            <div>
              <div className="text-sm text-silver-dust">Assets</div>
              <div className="text-lg font-family-heading text-ghost-white">
                {summary.erc20Count + summary.erc721Count + summary.erc1155Count}
              </div>
            </div>
          </div>

          {!summary.executed && (
            <div className="w-full bg-charcoal rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  statusColor === 'yellow'
                    ? 'bg-yellow-500'
                    : 'bg-gradient-to-r from-soul-red to-pulse-red'
                }`}
                style={{
                  width: `${Math.min(100, (Number(summary.timeUntilDistribution) / (Number(summary.inactivityPeriod) * 1000)) * 100)}%`,
                }}
              />
            </div>
          )}

          {!summary.executed && (
            <div>
              <div className="text-sm text-silver-dust">
                Time Until Distribution: {formatTimeUntilDistribution(summary.timeUntilDistribution)}
              </div>
              <div className="text-xs text-silver-dust/70">
                Last active: {formatDateFromTimestamp(summary.lastActiveTimestamp)}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:w-48">
          {showActions && isOwner && !summary.executed && (
            <>
              <Button 
                variant="primary" 
                className="w-full flex items-center justify-center gap-2 py-3"
                onClick={() => setShowDepositForm(!showDepositForm)}
              >
                <Plus className="w-4 h-4" />
                Deposit
              </Button>
              <Button 
                variant="secondary" 
                className="w-full flex items-center justify-center gap-2 py-3"
                onClick={handleUpdateActivity}
                disabled={isUpdating}
              >
                <Heart className="w-4 h-4" />
                {isUpdating ? 'Updating...' : "I'm Alive"}
              </Button>
              {canDistribute && onDistribute && (
                <Button 
                  variant="primary" 
                  className="w-full bg-red-600 hover:bg-red-700 py-3"
                  onClick={handleDistribute}
                >
                  Distribute
                </Button>
              )}
            </>
          )}
          {summary.executed && (
            <Button variant="secondary" className="w-full py-3" disabled>
              Already Distributed
            </Button>
          )}
        </div>
      </div>

      {showDepositForm && isOwner && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="bg-charcoal rounded p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                step="0.001"
                min="0.001"
                placeholder="Amount (ETH)"
                className="flex-1 bg-charcoal border border-white/10 rounded px-3 py-2 text-ghost-white placeholder-silver-dust/50 focus:border-soul-red focus:outline-none transition-colors"
              />
              <Button
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                className="px-4"
              >
                {isDepositing ? 'Depositing...' : 'Deposit'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowDepositForm(false)}
                className="px-4"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {summary.executed && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-silver-dust">
            This vault has been distributed to the heir.
          </p>
        </div>
      )}
    </Card>
  );
}
